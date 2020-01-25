import React, { useState } from 'react'
import styled from 'styled-components'
import { useAragonApi, useGuiStyle } from '@aragon/api-react'
import {
  Main,
  Button,
  BaseStyles,
  Header,
  IconPlus,
  useTheme,
  useLayout,
  textStyle,
} from '@aragon/ui'

import {
  PanelManager,
  PanelContext,
  usePanelManagement,
} from './components/SidePanels/'

import NoCommittees from './screens/NoCommittees'
import Committees from './screens/Committees'
import CommitteeDetails from './screens/CommitteeDetails'

function App() {
  const theme = useTheme()
  const { layoutName } = useLayout()
  const { appState } = useAragonApi()

  const { committees, isSyncing } = appState

  const [selectedCommittee, setSelectedCommittee] = useState(null)
  const [screenName, setScreenName] = useState('committees')
  const [panel, setPanel] = useState(null)
  const [panelProps, setPanelProps] = useState(null)

  const compactMode = layoutName === 'small'

  const panelConfiguration = {
    setActivePanel: p => setPanel(p),
    setPanelProps: p => setPanelProps(p),
  }

  const closePanel = () => {
    setPanel(null)
    setPanelProps(null)
  }

  const ScreenAction = () => {
    const { setupNewCommittee, setupNewMembers } = usePanelManagement()

    switch (screenName) {
      case 'committees':
        return (
          <Button
            mode="strong"
            onClick={() => setupNewCommittee()}
            label="New Committee"
            icon={<IconPlus />}
            display={compactMode ? 'icon' : 'label'}
          />
        )
      case 'info':
        return (
          <Button
            mode="strong"
            onClick={() => {
              if (selectedCommittee)
                setupNewMembers(
                  selectedCommittee.address,
                  selectedCommittee.tokenParams[1]
                )
            }}
            label="New Member"
            icon={<IconPlus />}
            display={compactMode ? 'icon' : 'label'}
          />
        )
      default:
        return null
    }
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
      <PanelContext.Provider value={panelConfiguration}>
        <BaseStyles />
        {committees && committees.length === 0 && (
          <NoCommitteesLayout>
            <NoCommittees isSyncing={isSyncing}>
              <ScreenAction />
            </NoCommittees>
          </NoCommitteesLayout>
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
                onDeleteCommittee={() => setSelectedCommittee(null)}
              />
            ) : (
              <Committees
                committees={committees}
                onClickCommittee={clickCommitteeHandler}
              />
            )}
          </React.Fragment>
        )}
        <PanelManager
          activePanel={panel}
          onClose={closePanel}
          {...panelProps}
        />
      </PanelContext.Provider>
    </React.Fragment>
  )
}

const NoCommitteesLayout = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`
export default () => {
  const { appearance } = useGuiStyle()
  return (
    <Main theme={appearance} assetsUrl="./aragon-ui">
      <App />
    </Main>
  )
}
