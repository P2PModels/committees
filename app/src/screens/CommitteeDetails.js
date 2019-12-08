import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  BackButton,
  Bar,
  Tabs,
  ContextMenu,
  ContextMenuItem,
  IconRemove,
  useTheme,
  GU,
} from '@aragon/ui'

import CommitteeInfo from './CommitteeInfo'
import CommitteeActivity from './CommitteeActivity'

const tabs = [
  { name: 'Info', body: 'CommitteeInfo' },
  { name: 'Permissions', body: 'CommitteePermissions' },
  { name: 'Activity', body: 'CommitteeActivity' },
]

const CommitteeDetails = React.memo(
  ({ committee, onBack, onChangeTab, }) => {
    console.log('CommitteeDetails rerendering')
    const [activeTabIndex, setActiveTabIndex] = useState(0)

    const tabChangeHandler = useCallback(
      index => {
        onChangeTab(tabs[index].name)
        setActiveTabIndex(index)
      },
      [tabs]
    )

    const deleteCommitteeHandler = useCallback(address => {
      console.log('Deleting committee with address ' + address)
    })

    const ScreenTab = ({ screenName }) => {
      switch (screenName.toLowerCase()) {
        case 'info':
          return <CommitteeInfo committee={committee} />
        case 'permissions':
          return <div>We're are working on it</div>
        case 'activity':
          return <CommitteeActivity committee={committee} />
        default:
          return null
      }
    }
    return (
      <React.Fragment>
        <Bar
          primary={<BackButton onClick={onBack} />}
          secondary={
            <CommitteeMenu
              address={committee.address}
              onRemoveCommittee={deleteCommitteeHandler}
            />
          }
        />
        <Tabs
          items={tabs.map(t => t.name)}
          selected={activeTabIndex}
          onChange={tabChangeHandler}
        />
        <ScreenTab screenName={tabs[activeTabIndex].name} />
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

const CommitteeMenu = ({ address, onRemoveCommittee }) => {
  const theme = useTheme()
  const removeCommittee = useCallback(() => onRemoveCommittee(address), [
    address,
    onRemoveCommittee,
  ])

  const actions = [[removeCommittee, IconRemove, 'Remove committee']]
  return (
    <ContextMenu zIndex={1}>
      {actions.map(([onClick, Icon, label], index) => (
        <ContextMenuItem key={index} onClick={onClick}>
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
CommitteeDetails.propTypes = {
  committee: PropTypes.object,
  onBack: PropTypes.func,
  onChangeTab: PropTypes.func,
}

export default CommitteeDetails
