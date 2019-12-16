import React, { useCallback } from 'react'
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

import LocalAppBadge from '../components/LocalIdentityBadge/LocalAppBadge'

const CommitteeInfo = ({
  committee: {
    description,
    address,
    tokenParams,
    tokenSymbol,
    tokenAddress,
    votingAddress,
    financeAddress,
    vaultAddress,
    votingParams,
    members,
  },
}) => {
  const { api } = useAragonApi()
  const theme = useTheme()
  const network = useNetwork()
  const tokenName = getTokenName(tokenSymbol)
  const tokenType = getTokenType(tokenParams)
  const votingType = getVotingType(votingParams)

  const removeMemberHandler = async (committee, member) => {
    await api.removeMember(committee, member).toPromise()
  }

  return (
    <Split
      primary={
        <React.Fragment>
          <Box>{description}</Box>
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
                {members && <Tag>{members.length}</Tag>}
              </React.Fragment>
            }
            status={members ? 'default' : 'loading'}
            statusEmpty={
              <div
                css={`
                  ${textStyle('title2')}
                `}
              >
                No members
              </div>
            }
            fields={['account']}
            entries={
              (members &&
                members.map(member => {
                  const [account, stake] = member
                  return { account, stake }
                })) ||
              []
            }
            renderEntry={({ account }) => {
              return [<IdentityBadge entity={account} />]
            }}
            renderEntryActions={({ account, stake }) => (
              <EntryActions
                address={account}
                stake={stake}
                onDeleteMember={member => {
                  removeMemberHandler(address, member)
                }}
              />
            )}
          />
        </React.Fragment>
      }
      secondary={
        <React.Fragment>
          <Box heading="Committee Apps">
            <InfoRow>
              <LocalAppBadge appAddress={address} />
            </InfoRow>
            <InfoRow>
              <LocalAppBadge appAddress={votingAddress} />
            </InfoRow>
            {financeAddress && (
              <>
                <InfoRow>
                  <LocalAppBadge appAddress={financeAddress} />
                </InfoRow>
                <InfoRow>
                  <LocalAppBadge appAddress={vaultAddress} />
                </InfoRow>
              </>
            )}
          </Box>
          <Box heading="Token Info">
            {tokenAddress && (
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
            )}
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
