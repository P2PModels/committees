import React, { useCallback } from 'react'

import PropTypes from 'prop-types'

import { BackButton, Bar, Tabs } from '@aragon/ui'

import CommitteeInfo from './CommitteeInfo'
import CommitteePermissions from './CommitteePermissions'
import CommitteeActivity from './CommitteeActivity'

import useSelectedCommittee from '../hooks/useSelectedCommitee'

const tabs = [
  { name: 'Info', body: 'CommitteeInfo' },
  { name: 'Permissions', body: 'CommitteePermissions' },
  { name: 'Activity', body: 'CommitteeActivity' },
]

const CommitteeDetails = React.memo(
  ({ committee, onBack, onChangeTab, onDeleteCommittee }) => {
    const { members, tokenAddress } = committee

    const [, selectCommittee, selectedTab] = useSelectedCommittee([])

    const currentTab =
      tabs.find(t => t.name.toLowerCase() === selectedTab) || {}

    const tabChangeHandler = useCallback(
      index => {
        const tabName = tabs[index].name
        selectCommittee(committee, tabName)
        onChangeTab(tabs[index].name)
      },
      [tabs]
    )

    const ScreenTab = ({ screenName }) => {
      switch (screenName.toLowerCase()) {
        case 'info':
          return (
            <CommitteeInfo
              committee={{ ...committee, members, tokenAddress }}
            />
          )
        case 'permissions':
          return (
            <CommitteePermissions
              tmAddress={committee.address}
              votingAddress={committee.votingAddress}
            />
          )
        case 'activity':
          return <CommitteeActivity committee={committee} />
        default:
          return null
      }
    }
    return (
      <React.Fragment>
        <Bar primary={<BackButton onClick={onBack} />} />
        <Tabs
          items={tabs.map(t => t.name)}
          selected={tabs.indexOf(currentTab)}
          onChange={tabChangeHandler}
        />
        <ScreenTab screenName={currentTab.name} />
      </React.Fragment>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.committee.address === nextProps.committee.address &&
      prevProps.committee.members.length === nextProps.committee.members.length
    )
  }
)

CommitteeDetails.propTypes = {
  committee: PropTypes.object,
  onBack: PropTypes.func,
  onChangeTab: PropTypes.func,
  onDeleteCommittee: PropTypes.func,
}

export default CommitteeDetails
