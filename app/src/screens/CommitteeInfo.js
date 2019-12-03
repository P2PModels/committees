import React, { useCallback } from 'react'
import { useNetwork } from '@aragon/api-react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

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

const CommitteeInfo = ({
  committee: {
    description,
    address,
    tokenName,
    tokenSymbol,
    tokenType,
    votingType,
    members,
  },
}) => {
  const theme = useTheme()
  const network = useNetwork()

  const removeMemberHandler = member => {
    console.log(`Removing member ${member}`)
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
                const [account] = member
                return { account }
              })}
              renderEntry={({ account }) => {
                return [<IdentityBadge entity={account} />]
              }}
              renderEntryActions={({ account }) => (
                <EntryActions
                  address={account}
                  onDeleteMember={removeMemberHandler}
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
                address="0xc41e4c10b37d3397a99d4a90e7d85508a69a5c4c"
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

const EntryActions = ({ address, onDeleteMember }) => {
  const theme = useTheme()
  const removeMember = useCallback(() => onDeleteMember(address), [
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
    tokenParams: PropTypes.object,
    votingParams: PropTypes.object,
  }),
}

export default CommitteeInfo
