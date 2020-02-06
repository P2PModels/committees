import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Aragon, { events } from '@aragon/api'

import tmAbi from './abi/TokenManager.json'
import tokenAbi from './abi/minimeToken.json'
import votingAbi from './abi/Voting.json'
import financeAbi from './abi/Finance.json'

import { hexToUtf8 } from 'web3-utils'

import { DEFAULT_ADDRESS, PCT, DAYS } from './lib/committee-utils'
import { getAclHandler } from './lib/acl-utils'

const api = new Aragon()

/*
 * Calls `callback` exponentially, everytime `retry()` is called.
 * Returns a promise that resolves with the callback's result if it (eventually) succeeds.
 *
 * Usage:
 *
 * retryEvery(retry => {
 *  // do something
 *
 *  if (condition) {
 *    // retry in 1, 2, 4, 8 seconds… as long as the condition passes.
 *    retry()
 *  }
 * }, 1000, 2)
 *
 */
const retryEvery = async (
  callback,
  { initialRetryTimer = 1000, increaseFactor = 3, maxRetries = 3 } = {}
) => {
  const sleep = time => new Promise(resolve => setTimeout(resolve, time))

  let retryNum = 0
  const attempt = async (retryTimer = initialRetryTimer) => {
    try {
      return await callback()
    } catch (err) {
      if (retryNum === maxRetries) {
        throw err
      }
      ++retryNum

      // Exponentially backoff attempts
      const nextRetryTime = retryTimer * increaseFactor
      console.log(
        `Retrying in ${nextRetryTime}s... (attempt ${retryNum} of ${maxRetries})`
      )
      await sleep(nextRetryTime)
      return attempt(nextRetryTime)
    }
  }

  return attempt()
}

// Get the token address to initialize ourselves
retryEvery(() =>
  getAclHandler(api)
    .then(initialize)
    .catch(err => {
      console.error(
        'Could not start background script execution due to the contract not loading the ACL:',
        err
      )
      throw err
    })
)

async function initialize(acl) {
  return api.store(
    async (state, { event, returnValues }) => {
      let nextState = { ...state }

      if (event === events.SYNC_STATUS_SYNCING) {
        return { ...nextState, isSyncing: true }
      } else if (event === events.SYNC_STATUS_SYNCED) {
        return { ...nextState, isSyncing: false }
      }

      switch (event) {
        case 'CreateCommittee': {
          const {
            committeeAddress: address,
            votingAddress,
            name,
            description,
          } = returnValues
          const tm = api.external(address, tmAbi)
          // Get token info
          const [tokenAddress, maxAccountTokens] = await Promise.all([
            tm.token().toPromise(),
            tm.maxAccountTokens().toPromise(),
          ])
          const token = api.external(tokenAddress, tokenAbi)
          const [tokenSymbol, decimals, isTransferable] = await Promise.all([
            token.symbol().toPromise(),
            token.decimals().toPromise(),
            token.transfersEnabled().toPromise(),
          ])
          // Get voting info
          const voting = api.external(votingAddress, votingAbi)
          const [
            supportRequiredPct,
            minAcceptQuorumPct,
            voteTime,
          ] = await Promise.all([
            voting.supportRequiredPct().toPromise(),
            voting.minAcceptQuorumPct().toPromise(),
            voting.voteTime().toPromise(),
          ])
          // Get finance info
          const finance = (await api.call('committees', address).toPromise())
            .finance
          const vaultAddress =
            finance !== DEFAULT_ADDRESS &&
            (await api
              .external(finance, financeAbi)
              .vault()
              .toPromise())

          const isUnique = maxAccountTokens === '1' && decimals === '0'
          const tokenParams = [isTransferable, isUnique]
          const votingParams = [
            supportRequiredPct / PCT,
            minAcceptQuorumPct / PCT,
            voteTime / DAYS,
          ]

          nextState = {
            ...state,
            committees: [
              ...state.committees,
              {
                name: hexToUtf8(name),
                description,
                address,
                tokenAddress,
                votingAddress,
                financeAddress: finance !== DEFAULT_ADDRESS ? finance : '',
                vaultAddress,
                tokenParams,
                votingParams,
                tokenSymbol,
                members: [],
              },
            ],
          }

          subscribeToExternal(tokenAddress, tokenAbi)

          break
        }
        case 'ModifyCommitteeInfo': {
          const { committeeAddress: address, name, description } = returnValues
          nextState = {
            ...state,
            committees: state.committees.map(committee =>
              committee.address === address
                ? { ...committee, name: hexToUtf8(name), description }
                : committee
            ),
          }
          break
        }
        case 'RemoveCommittee': {
          const { committeeAddress } = returnValues
          nextState = {
            ...state,
            committees: state.committees.filter(
              ({ address }) => address !== committeeAddress
            ),
          }
          break
        }

        // Token events
        case 'Transfer': {
          const { _to: member, contractAddress } = returnValues
          const committee = state.committees.find(
            ({ tokenAddress }) => tokenAddress === contractAddress
          )
          if (!committee) {
            break
          }
          const token = api.external(contractAddress, tokenAbi)

          const members = (
            await Promise.all(
              [
                ...new Set([...committee.members.map(m => m[0]), member]),
              ].map(async addr => [
                addr,
                parseInt(await token.balanceOf(addr).toPromise()),
              ])
            )
          ).filter(([_, balance]) => balance > 0)
          nextState = {
            ...state,
            committees: state.committees.map(c =>
              c.address === committee.address ? { ...c, members } : c
            ),
          }
          break
        }

        // ACL events
        case 'SetPermission': {
          const { entity, app, role, allowed } = returnValues
          nextState = {
            ...state,
            permissions: {
              ...state.permissions,
              [entity + app + role]: allowed ? { entity, app, role } : {},
            },
          }
        }
      }
      return nextState
    },
    {
      externals: [
        {
          contract: acl,
          initializationBlock: await acl.getInitializationBlock().toPromise(),
        },
      ],
      init: async cachedState => {
        let committees = cachedState ? cachedState.committees : []
        try {
          // If cached committees, use without members
          committees = committees.map(({ tokenAddress }, i) => {
            subscribeToExternal(tokenAddress, tokenAbi)
            return { ...cachedState.committees[i], members: [] }
          })
        } catch (e) {
          console.error(e)
        }
        return {
          ...cachedState,
          committees, // override committees[i].members
          permissions: {}, // override permissions
          isSyncing: false,
        }
      },
    }
  )
}

function subscribeToExternal(address, abi, initializationBlock = 0) {
  console.log(`Subscribing to ${address}…`)
  api
    .external(address, abi)
    .events({ fromBlock: `0x${initializationBlock.toString(16)}` })
    .subscribe(({ event, returnValues, address }) =>
      api.emitTrigger(event, { ...returnValues, contractAddress: address })
    )
}
