import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Aragon, { events } from '@aragon/api'

import tmAbi from './abi/TokenManager.json'
import tokenAbi from './abi/minimeToken.json'
import votingAbi from './abi/Voting.json'

import { hexToUtf8 } from 'web3-utils'

const INITIAL_STATE = {
  committees: [],
  isSyncing: false,
}

const api = new Aragon()

api.store(async (state, { event, returnValues }) => {
  console.log(state, event, returnValues)
  let nextState = { ...state }

  if (state == null) nextState = INITIAL_STATE

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

      const isUnique = maxAccountTokens === '1' && decimals === '0'
      const tokenParams = [isTransferable, isUnique]
      const votingParams = [
        supportRequiredPct / 10 ** 16,
        minAcceptQuorumPct / 10 ** 16,
        voteTime / (60 * 60 * 24),
      ]

      const initialMembers = []
      const stakes = []
      nextState = {
        ...state,
        committees: [
          ...state.committees,
          {
            name: hexToUtf8(name),
            description,
            address,
            votingAddress,
            tokenParams,
            votingParams,
            tokenSymbol,
            members: initialMembers.map((member, i) => [member, stakes[i]]),
          },
        ],
      }
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
  }

  return nextState
})
