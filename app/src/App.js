import React, {useState, useEffect} from 'react'
import { useAragonApi } from '@aragon/api-react'
import { Main, Button } from '@aragon/ui'
import { AppBar } from '@aragon/ui'
import { AppView, BaseStyles } from '@aragon/ui'
import { SidePanel, NavigationBar, TabBar } from '@aragon/ui'

import NewCommitteePanel from './components/SidePanels/NewCommittee/NewCommitteePanel'
import NewMemberPanel from './components/SidePanels/NewMember/NewMemberPanel'
import ListPanel from './components/ViewPanels/ListPanel/ListPanel'
import CommitteePanel from './components/ViewPanels/CommitteePanel/CommitteePanel'
import PermissionPanel from './components/ViewPanels/CommitteePanel/PermissionsPanel/PermissionsPanel'
import NewPermissionSidePanel from './components/SidePanels/NewPermissionSidePanel/NewPermissionSidePanel'

import styled from 'styled-components'

import { utf8ToHex } from 'web3-utils'

import {EMPTY_COMMITTEE} from '../src/util'


let permissions = {
  groupPermissions: [
    {
      action: "Action 1",
      onApp: "App 1"
    },
    {
      action: "Action 2",
      onApp: "App 2"
    },
    {
      action: "Action 3",
      onApp: "App 3"
    },
  ],
  individualPermissions: [
    {
      action: "Individual Action 1",
      onApp: "App 1"
    },
    {
      action: "Individual Action 2",
      onApp: "App 2"
    },
    {
      action: "Individual Action 3",
      onApp: "App 3"
    },
  ]
}
// let comm = [
//   {
//     address: "0xb4124cEB3451635DAcedd11767f004d8a28c6eE7",
//     name: "membership committee",
//     tokenSymbol: "MCT",
//     description: "A nice description ",
//     votingType: 2,
//     committeeType: 1,
//     members: ["0xd873F6DC68e3057e4B7da74c6b304d0eF0B484C7", 
//     "0xb4124cEB3451635DAcedd11767f004d8a28c6eE7", "0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb"],
//   },
//   {
//     address: "0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Ed",
//     name: "Technical Committee",
//     tokenSymbol: "TCT",
//     description: "A nice description ",
//     votingType: 2,
//     committeeType: 1,
//     members: ["0xd873F6DC68e3057e4B7da74c6b304d0eF0B484C7", "0xb4124cEB3451635DAcedd11767f004d8a28c6eE7"],
//   },
//   {
//     address: "0x306469457266CBBe7c0505e8Aad358622235e788",
//     name: "Vault Committee",
//     tokenSymbol: "VCT",
//     description: "A nice description ",
//     votingType: 2,
//     committeeType: 1,
//     members: ["0xd873F6DC68e3057e4B7da74c6b304d0eF0B484C7", "0xb4124cEB3451635DAcedd11767f004d8a28c6eE7"],
//   },
//   {
//     address: "0xd873F6DC68e3057e4B7da74c6b304d0eF0B48487",
//     name: "Financeoo Committee",
//     tokenSymbol: "FCT",
//     description: "A nice description ",
//     votingType: 2,
//     committeeType: 1,
//     members: ["0xd873F6DC68e3057e4B7da74c6b304d0eF0B484C7", "0xb4124cEB3451635DAcedd11767f004d8a28c6eE7"],
//   },
//   {
//     address: "0xd873F6DC68e3057e4B7da74c6b304d0eF0B484T7",
//     name: "Finance Committee",
//     tokenSymbol: "FCT",
//     description: "A nice description ",
//     votingType: 2,
//     committeeType: 1,
//     members: ["0xd873F6DC68e3057e4B7da74c6b304d0eF0B484C7", "0xb4124cEB3451635DAcedd11767f004d8a28c6eE7"],
//   },
//   {
//     address: "0xd873F6DC68e3057e4B7da74c6b304d0eF0B4F4C7",
//     name: "Financssss Committee",
//     tokenSymbol: "FCT",
//     description: "A nice description ",
//     votingType: 2,
//     committeeType: 1,
//     members: ["0xd873F6DC68e3057e4B7da74c6b304d0eF0B484C7", "0xb4124cEB3451635DAcedd11767f004d8a28c6eE7"],
//   },
//   {
//     address: "0xd873F6DC68e3057e4B7da74c6b304d0eF0G484C7",
//     name: "True Love Committee",
//     tokenSymbol: "TLCT",
//     description: "A nice description ",
//     votingType: 2,
//     committeeType: 1,
//     members: ["0xd873F6DC68e3057e4B7da74c6b304d0eF0B484C7", "0xb4124cEB3451635DAcedd11767f004d8a28c6eE7"],
//   },
// ]

const INITIAL_TABS = ["Info", "Permissions"], INITIAL_NAVIGATION_ITEMS = ["Committees"]
const SP_NEW_COMMITTEE = "New Committee", SP_NEW_MEMBER = "New Member", SP_NEW_PERMISSION = "New Permission"


function App() {
  const { api, appState } = useAragonApi()
  const { committees, syncing } = appState

  const [selectedCommittee, setSelectedCommittee] = useState(0)
  const [sidePanelOpened, setSidePanelOpened] = useState(false)
  const [sidePanelTitle, setSidePanelTitle] = useState("New Committee")
  const [navigationItems, setNavigationItems] = useState(INITIAL_NAVIGATION_ITEMS)
  const [committeeTabs, setCommitteeTabs] = useState(INITIAL_TABS)
  const [selectedTab, setSelectedTab] = useState(0)
  
  const  clickCommitteeHandler =  index => {
    setNavigationItems([...navigationItems, committees[index].name])
    setSelectedCommittee(index)
    console.log(committees[index])
    setSidePanelTitle(SP_NEW_MEMBER)
  }
  const navigationBackHandler = () => {
    setNavigationItems(navigationItems.slice(0, -1))
    setSidePanelTitle(SP_NEW_COMMITTEE)
  }

  const createCommitteeHandler = ({ name, description, tokenSymbol, votingType, votingInfo, committeeType, initialMembers }) => {
    setSidePanelOpened(false)
    console.log(name, description, tokenSymbol, committeeType, votingType, votingInfo)
    api.createCommittee(utf8ToHex(name), description, tokenSymbol, [committeeType, votingType], initialMembers, votingInfo)
      .subscribe(() => {
        console.log("Create committee transaction completed!!!")
      },(err) => {
        console.log(err)
      })
  }

  const createPermissionHandler = (committeeApp, app, permission) => {
    console.log(`Calling API for creating permission to ${committeeApp} on ${app} for ${permission} action`)
  }

  const removeCommitteeHandler = () => {
    let { address, members } = committees[selectedCommittee]
    api.removeCommittee(address, members).subscribe(() => {
      navigationBackHandler()
    })
  }
  const addMemberHandler = memberAddress => {
    api.addMember(committees[selectedCommittee].address, memberAddress)
      .subscribe(() => {
        console.log("Transaction completed!")
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
    setSelectedTab(index)
  }
  
  const getAppss = () => {
    api.getApps().subscribe((apps) => {
      console.log("apps")
      console.log(apps)
    })
  } 
  console.log("asdasd")
  let spComponent, viewComponent, panelComponent, tabsComponent = null
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
      // <NewPermissionSidePanel onCreatePermission={createPermissionHandler} />
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
    else if (selectedTabName === "permissions")
      panelComponent = (
        <PermissionPanel
          groupPermissions={permissions.groupPermissions}
          individualPermissions={permissions.individualPermissions}
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

  //Set view component
  viewComponent = (
    <AppView appBar={
      <AppBar
        endContent={<Button mode="strong" onClick={() => setSidePanelOpened(true)}>{buttonName}
        </Button>}
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
      <SidePanel title={sidePanelTitle} opened={sidePanelOpened} onClose={() => setSidePanelOpened(false)}>
        {spComponent}
      </SidePanel>
      <Button onoClick={() => {getAppss()}}>aaaa</Button>
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
