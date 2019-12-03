import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { useAragonApi } from '@aragon/api-react'
import {
  Main,
  Button,
  BaseStyles,
  Header,
  useTheme,
  textStyle,
} from '@aragon/ui'

import NoCommittees from './screens/NoCommittees'
import NewCommitteePanel from './components/SidePanels/NewCommittee/NewCommitteePanel'

import { utf8ToHex } from 'web3-utils'

// import { EMPTY_COMMITTEE, testCommittee } from './lib/committee-utils'
import Committees from './screens/Committees'
import CommitteeDetails from './screens/CommitteeDetails'
import NewMembersPanel from './components/SidePanels/NewMemberPanel'

function App() {
  const theme = useTheme()
  const { api, appState } = useAragonApi()
  const { committees, isSyncing } = appState

  const [selectedCommittee, setSelectedCommittee] = useState(null)
  const [sidePanelOpened, setSidePanelOpened] = useState(false)

  const [screenName, setScreenName] = useState('committees')
  console.log(committees)
  const ScreenAction = () => {
    switch (screenName) {
      case 'committees':
        return (
          <Button
            mode="strong"
            onClick={() => setSidePanelOpened(true)}
            label="New Committee"
          />
        )
      case 'info':
        return (
          <Button
            mode="strong"
            onClick={() => setSidePanelOpened(true)}
            label="New Member"
          />
        )
      case 'permissions':
        return (
          <Button
            mode="strong"
            onClick={() => setSidePanelOpened(true)}
            label="New Permission"
          />
        )
      default:
        return null
    }
  }

  const requestClose = useCallback(() => setSidePanelOpened(false))

  const SidePanelScreen = () => {
    switch (screenName) {
      case 'committees':
        return (
          <NewCommitteePanel
            panelState={{
              opened: sidePanelOpened,
              onClose: requestClose,
            }}
            onCreateCommittee={createCommitteeHandler}
          />
        )
      case 'info':
        return (
          <NewMembersPanel
            panelState={{
              opened: sidePanelOpened,
              onClose: requestClose,
            }}
            onCreateMember={createMembersHandler}
            isCumulative={
              selectedCommittee && selectedCommittee.tokenType.unique
            }
          />
        )
      default:
        return null
    }
  }
  // const clickCommitteeHandler = index => {
  //   setNavigationItems([...navigationItems, committees[index].name])
  //   setSelectedCommittee(index)
  //   setSidePanelTitle(SP_NEW_MEMBER)
  // }

  const createCommitteeHandler = ({
    name,
    description,
    votingParams,
    tokenParams,
    tokenSymbol,
    addresses,
    stakes,
  }) => {
    setSidePanelOpened(false)
    const { transferable, unique } = tokenParams
    const { support, acceptance, duration } = votingParams
    api
      .createCommittee(
        utf8ToHex(name),
        description,
        tokenSymbol,
        [transferable, unique],
        addresses,
        stakes,
        [support, acceptance, duration]
      )
      .subscribe(
        () => {
          console.log('Create committee transaction completed!!!')
        },
        err => {
          console.log(err)
        }
      )
  }

  const createMembersHandler = members => {
    console.log(members)
    /* api
      .addMember(committees[selectedCommittee].address, memberAddress)
      .subscribe(() => {
        console.log('Transaction completed!')
      }) */
    setSidePanelOpened(false)
  }

  const removeMemberHandler = memberAddress => {
    setSidePanelOpened(false)
    api
      .removeMember(committees[selectedCommittee].address, memberAddress)
      .subscribe(() => {
        console.log('Transaction completed!')
      })
  }
  const clickCommitteeHandler = committee => {
    setSelectedCommittee(committee)
    setScreenName('info')
  }

  const backHandler = () => {
    setSelectedCommittee(null)
    setScreenName('committees')
  }

  const changeTabHandler = tabName => {
    setScreenName(tabName.toLowerCase())
  }

  return (
    <React.Fragment>
      <BaseStyles />
      {committees && committees.length === 0 && (
        <div
          css={`
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <NoCommittees
            onNewCommittee={() => {
              setSidePanelOpened(true)
            }}
            isSyncing={false}
          />
        </div>
      )}
      {committees && committees.length > 0 && (
        <React.Fragment>
          <Header
            primary={
              <React.Fragment>
                <span
                  css={`
                    ${textStyle('title2')}
                  `}
                >
                  Committees{selectedCommittee ? ':' : ''}
                </span>
                {selectedCommittee ? (
                  <span
                    css={`
                      margin-left: 7px;
                      position: relative;
                      top: 1px;
                      color: ${theme.surfaceContentSecondary};
                      font-weight: bold;
                      ${textStyle('title3')}
                    `}
                  >
                    {selectedCommittee.name}
                  </span>
                ) : null}
              </React.Fragment>
            }
            secondary={<ScreenAction />}
          />
          {selectedCommittee ? (
            <CommitteeDetails
              committee={selectedCommittee}
              onBack={backHandler}
              onChangeTab={changeTabHandler}
            />
          ) : (
            <Committees
              committees={committees}
              onClickCommittee={clickCommitteeHandler}
            />
          )}
        </React.Fragment>
      )}
      <SidePanelScreen />
    </React.Fragment>
  )
}

const Syncing = styled.div.attrs({ children: 'Syncing…' })`
  position: absolute;
  top: 15px;
  right: 20px;
`

export default () => {
  return (
    <Main>
      <App />
    </Main>
  )
}
