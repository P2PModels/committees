import React, { useCallback, useEffect, useState } from 'react'
import { useAragonApi, useNetwork } from '@aragon/api-react'

import PropTypes from 'prop-types'
import styled from 'styled-components'
import { getTokenName } from '../lib/token-utils'

import { getTokenType, getVotingType } from '../lib/committee-utils'
import {
  Split,
  Box,
  IdentityBadge,
  textStyle,
  TokenBadge,
  DataView,
  Tag,
  ContextMenu,
  ContextMenuItem,
  IconRemove,
  useTheme,
  GU,
} from '@aragon/ui'

import { map } from 'rxjs/operators'

import tmAbi from '../abi/TokenManager.json'
import tokenAbi from '../abi/minimeToken.json'

async function getToken(api, tmAddress) {
  const tm = api.external(tmAddress, tmAbi)
  const tokenAddress = await tm.token().toPromise()
  const token = await api.external(tokenAddress, tokenAbi)

  return [token, tokenAddress]
}

async function getMembers(api, tmAddress) {
  const [token, tokenAddress] = await getToken(api, tmAddress)
  const members = [
    ...new Set(
      await token
        .pastEvents({ fromBlock: '0x0' })
        .pipe(
          map(event =>
            event
              .filter(e => e.event.toLowerCase() === 'transfer')
              .map(e => e.returnValues[1])
          )
        )
        .toPromise()
    ),
  ]

  const filteredMembers = (await Promise.all(
    members.map(async m => [m, parseInt(await token.balanceOf(m).toPromise())])
  )).filter(m => m[1] > 0)

  return [filteredMembers, tokenAddress]
}

const CommitteeInfo = ({
  committee: { description, address, tokenParams, tokenSymbol, votingParams },
}) => {
  const { api, appState } = useAragonApi()
  const { isSyncing } = appState
  const theme = useTheme()
  const network = useNetwork()
  const tokenName = getTokenName(tokenSymbol)
  const tokenType = getTokenType(tokenParams)
  const votingType = getVotingType(votingParams)
  const [members, setMembers] = useState([])
  const [tokenAddress, setTokenAddress] = useState('')

  useEffect(() => {
    api &&
      getMembers(api, address).then(res => {
        setMembers(res[0])
        setTokenAddress(res[1])
      })
  }, [isSyncing])

  const removeMemberHandler = async (committee, member, stake) => {
    console.log(
      `Removing member  ${member} with stake ${stake} from ${committee}`
    )
    await api.removeMember(committee, member, stake).toPromise()
  }

  return (
    <Split
      primary={
        <React.Fragment>
          <Box>{description}</Box>
          {!members ||
            (members.length === 0 && (
              <NoMembers>There are no members.</NoMembers>
            ))}
          {members && members.length > 0 && (
            <DataView
              mode="table"
              heading={
                <React.Fragment>
                  <span
                    css={`
                      color: ${theme.surfaceContentSecondary};
                      ${textStyle('label1')}
                    `}
                  >
                    Members
                  </span>
                  <Tag>{members.length}</Tag>
                </React.Fragment>
              }
              fields={['account']}
              entries={members.map(member => {
                const [account, stake] = member
                return { account, stake }
              })}
              renderEntry={({ account }) => {
                return [<IdentityBadge entity={account} />]
              }}
              renderEntryActions={({ account, stake }) => (
                <EntryActions
                  address={account}
                  stake={stake}
                  onDeleteMember={(member, stake) => {
                    removeMemberHandler(address, member, stake)
                  }}
                />
              )}
            />
          )}
        </React.Fragment>
      }
      secondary={
        <React.Fragment>
          <Box heading="General Info">
            <InfoRow>
              <span>Committee</span>
              <span>:</span>
              <IdentityBadge entity={address} />
            </InfoRow>
          </Box>
          <Box heading="Token Info">
            <InfoRow>
              <span>Token</span>
              <span>:</span>
              <TokenBadge
                address={tokenAddress}
                name={tokenName}
                symbol={tokenSymbol}
                networkType={network && network.type}
              />
            </InfoRow>
            <InfoRow>
              <span>Type</span>
              <span>:</span>
              <strong>{tokenType && tokenType.name}</strong>
            </InfoRow>
            <InfoRow>
              <span>Transferable</span>
              <span>:</span>
              <span>{tokenType && tokenType.transferable ? 'YES' : 'NO'}</span>
            </InfoRow>
            <InfoRow>
              <span>Unique</span>
              <span>:</span>
              <span>{tokenType && tokenType.unique ? 'YES' : 'NO'}</span>
            </InfoRow>
          </Box>
          <Box heading="Voting Info">
            <InfoRow>
              <span>Type</span>
              <span>:</span>
              <strong>{votingType && votingType.name}</strong>
            </InfoRow>
            <InfoRow>
              <span>Support</span>
              <span>:</span>
              <span>{votingType && votingType.support}%</span>
            </InfoRow>
            <InfoRow>
              <span>Acceptance</span>
              <span>:</span>
              <span>{votingType && votingType.acceptance}%</span>
            </InfoRow>
            <InfoRow>
              <span>Duration</span>
              <span>:</span>
              <span>{votingType && votingType.duration} days</span>
            </InfoRow>
          </Box>
        </React.Fragment>
      }
    />
  )
}

const EntryActions = ({ address, stake, onDeleteMember }) => {
  const theme = useTheme()
  const removeMember = useCallback(() => onDeleteMember(address, stake), [
    address,
    onDeleteMember,
  ])
  const actions = [[removeMember, IconRemove, `Remove member`]]
  return (
    <ContextMenu zIndex={1}>
      {actions.map(([onClick, Icon, label], index) => (
        <ContextMenuItem onClick={onClick} key={index}>
          <span
            css={`
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${theme.surfaceContentSecondary};
            `}
          >
            <Icon />
          </span>
          <span
            css={`
              margin-left: ${1 * GU}px;
            `}
          >
            {label}
          </span>
        </ContextMenuItem>
      ))}
    </ContextMenu>
  )
}

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  > span:nth-child(1) {
    font-weight: 100;
    color: grey;
  }
  > span:nth-child(2) {
    opacity: 0;
    width: 10px;
  }
  > span:nth-child(3) {
    flex-shrink: 1;
    ${textStyle('body3')}
  }
`

const NoMembers = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20% auto 0 auto;
  ${textStyle('title4')}
`

CommitteeInfo.propTypes = {
  committee: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    address: PropTypes.string,
    tokenParams: PropTypes.array,
    votingParams: PropTypes.array,
  }),
}

export default CommitteeInfo
