import React, { useState, useCallback, useEffect } from 'react'
import { useAragonApi, useNetwork } from '@aragon/api-react'


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

import { map } from 'rxjs/operators'

import tmAbi from '../abi/TokenManager.json'
import tokenAbi from '../abi/minimeToken.json'

import { decoupleMembers, getTokenType } from '../lib/committee-utils'

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
  ({ committee, onBack, onChangeTab, onDeleteCommittee}) => {
    console.log('CommitteeDetails rerendering')

    const { api, appState } = useAragonApi()
    const { isSyncing } = appState
    const [activeTabIndex, setActiveTabIndex] = useState(0)
    const [members, setMembers] = useState([])
    const [tokenAddress, setTokenAddress] = useState('')

    const tokenType = getTokenType(committee.tokenParams)

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

    const deleteCommitteeHandler = (committeeAddress, addresses, stakes) => {
      console.log(`Deleting committee with address ${committeeAddress} and members: ${addresses} with stakes: ${stakes}`)
      api.removeCommittee(committeeAddress, addresses, stakes).subscribe(() => onDeleteCommittee(), err => console.log(err))
    }

    const ScreenTab = ({ screenName }) => {
      switch (screenName.toLowerCase()) {
        case 'info':
          return <CommitteeInfo committee={{...committee, members, tokenAddress }} />
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
              members={members}
              unique={tokenType.unique}
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

const CommitteeMenu = ({ address, members, unique, onRemoveCommittee }) => {
  const theme = useTheme()
  const removeCommittee = () => onRemoveCommittee(address, ...decoupleMembers(members, unique))

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
