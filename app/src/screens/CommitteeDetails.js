import React, { useState, useCallback, useEffect } from 'react'
import { useAragonApi } from '@aragon/api-react'

import PropTypes from 'prop-types'
import { BackButton, Bar, Tabs } from '@aragon/ui'

import CommitteeInfo from './CommitteeInfo'
import CommitteePermissions from './CommitteePermissions'
import CommitteeActivity from './CommitteeActivity'

import { map } from 'rxjs/operators'

import tmAbi from '../abi/TokenManager.json'
import tokenAbi from '../abi/minimeToken.json'

const tabs = [
  { name: 'Info', body: 'CommitteeInfo' },
  { name: 'Permissions', body: 'CommitteePermissions' },
  { name: 'Activity', body: 'CommitteeActivity' },
]

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

const CommitteeDetails = React.memo(
  ({ committee, onBack, onChangeTab, onDeleteCommittee }) => {
    console.log('CommitteeDetails rerendering')

    const { api, appState } = useAragonApi()
    const { isSyncing } = appState
    const [activeTabIndex, setActiveTabIndex] = useState(0)
    const [members, setMembers] = useState(null)
    const [tokenAddress, setTokenAddress] = useState('')

    useEffect(() => {
      api &&
        getMembers(api, committee.address).then(res => {
          setMembers(res[0])
          setTokenAddress(res[1])
        })
    }, [isSyncing])

    const tabChangeHandler = useCallback(
      index => {
        onChangeTab(tabs[index].name)
        setActiveTabIndex(index)
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

CommitteeDetails.propTypes = {
  committee: PropTypes.object,
  onBack: PropTypes.func,
  onChangeTab: PropTypes.func,
  onDeleteCommittee: PropTypes.func,
}

export default CommitteeDetails
