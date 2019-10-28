import React, { useState } from 'react'
import { useAragonApi } from '@aragon/api-react'
import {
  Main,
  Button,
  AppBar,
  AppView,
  BaseStyles,
  SidePanel,
  NavigationBar,
  TabBar,
} from '@aragon/ui'

import NewCommitteePanel from './components/SidePanels/NewCommittee/NewCommitteePanel'
import NewMemberPanel from './components/SidePanels/NewMember/NewMemberPanel'
import ListPanel from './components/ViewPanels/ListPanel/ListPanel'
import CommitteePanel from './components/ViewPanels/CommitteePanel/CommitteePanel'

import styled from 'styled-components'

import { utf8ToHex } from 'web3-utils'

import { EMPTY_COMMITTEE } from '../src/util'

const INITIAL_TABS = ['Info', 'Permissions']
const INITIAL_NAVIGATION_ITEMS = ['Committees']
const SP_NEW_COMMITTEE = 'New Committee'
const SP_NEW_MEMBER = 'New Member'
const SP_NEW_PERMISSION = 'New Permission'

function App() {
  const { api, appState } = useAragonApi()
  const { committees, isSyncing } = appState

  const [selectedCommittee, setSelectedCommittee] = useState(0)
  const [sidePanelOpened, setSidePanelOpened] = useState(false)
  const [sidePanelTitle, setSidePanelTitle] = useState('New Committee')
  const [navigationItems, setNavigationItems] = useState(
    INITIAL_NAVIGATION_ITEMS
  )
  const [committeeTabs, setCommitteeTabs] = useState(INITIAL_TABS)
  const [selectedTab, setSelectedTab] = useState(0)

  const clickCommitteeHandler = index => {
    setNavigationItems([...navigationItems, committees[index].name])
    setSelectedCommittee(index)
    setSidePanelTitle(SP_NEW_MEMBER)
  }

  const navigationBackHandler = () => {
    setNavigationItems(navigationItems.slice(0, -1))
    setSidePanelTitle(SP_NEW_COMMITTEE)
  }

  const createCommitteeHandler = ({
    name,
    description,
    tokenSymbol,
    votingType,
    votingInfo,
    committeeType,
    initialMembers,
  }) => {
    setSidePanelOpened(false)
    api
      .createCommittee(
        utf8ToHex(name),
        description,
        tokenSymbol,
        [committeeType, votingType],
        initialMembers,
        votingInfo
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

  const removeCommitteeHandler = () => {
    const { address, members } = committees[selectedCommittee]
    api.removeCommittee(address, members).subscribe(() => {
      navigationBackHandler()
    })
  }
  const addMemberHandler = memberAddress => {
    api
      .addMember(committees[selectedCommittee].address, memberAddress)
      .subscribe(() => {
        console.log('Transaction completed!')
      })
      setSidePanelOpened(false)
  }
  const removeMemberHandler = memberAddress => {
    setSidePanelOpened(false)
    api.removeMember(committees[selectedCommittee].address, memberAddress)
      .subscribe(() => {
        console.log("Transaction completed!")
      })
  }

  const changeTabHandler = index => {
    if(committeeTabs[index].toLowerCase() === "permissions")
      setSidePanelTitle(SP_NEW_PERMISSION)
    else if(committeeTabs[index].toLowerCase() === "info")
      setSidePanelTitle(SP_NEW_MEMBER)
      
    setSelectedTab(index)
  }

  let spComponent; let viewComponent; let panelComponent; let tabsComponent = null
  let buttonName = ""

  //Set side panel content component
  if(sidePanelTitle === SP_NEW_COMMITTEE) {
      spComponent = (
        <NewCommitteePanel onCreateCommittee={createCommitteeHandler} />

      )
      buttonName = "New Committee"
  }
  else if(sidePanelTitle === SP_NEW_MEMBER) {
      spComponent = (
        <NewMemberPanel addMemberHandler={addMemberHandler}/>
      )
      buttonName = "Add Member"
  }
  else if(sidePanelTitle === SP_NEW_PERMISSION) {
    spComponent = (
      <NewMemberPanel addMemberHandler={addMemberHandler}/>
      )
      buttonName = 'New Permission'
  }

  //set view content component
  let selectedNavigation = navigationItems[navigationItems.length - 1].toLowerCase()
  if(selectedNavigation === 'committees') {
    panelComponent = (
      <ListPanel items={committees}  itemType="committees" clickItemHandler={clickCommitteeHandler} noItemsMessage="There are no committees"/>
    )
  }
  else {
    let selectedTabName = committeeTabs[selectedTab].toLowerCase()
    if(selectedTabName === "info")
      panelComponent = (
        <CommitteePanel
          committee={committees && committees[selectedCommittee] ? committees[selectedCommittee] : EMPTY_COMMITTEE} 
          onRemoveMember={removeMemberHandler} onRemoveCommittee={removeCommitteeHandler}
        />
      )

    tabsComponent = (
      <TabBar
        items={committeeTabs}
        selected={selectedTab}
        onChange={changeTabHandler}
      />
    )
  }

  // Set view component
  viewComponent = (
    <AppView
      appBar={
      <AppBar
          endContent={
            <Button mode="strong" onClick={() => setSidePanelOpened(true)}>
              {buttonName}
            </Button>
          }
          tabs={tabsComponent}
      >
      <NavigationBar
        items={navigationItems}
        onBack={navigationBackHandler} 
      />
      </AppBar>
    }>
      {panelComponent}
    </AppView>
  )
  return (
    <Main>
      <BaseStyles/>
      <SidePanel
        title={sidePanelTitle}
        opened={sidePanelOpened}
        onClose={() => setSidePanelOpened(false)}
      >
        {spComponent}
      </SidePanel>
      {viewComponent}
    </Main>
  )
}

const Syncing = styled.div.attrs({ children: 'Syncing…' })`
  position: absolute;
  top: 15px;
  right: 20px;
`

export default App
