import React, { useState, useMemo, useCallback } from 'react'
import styled from 'styled-components'
import { useAragonApi, usePath, useAppState } from '@aragon/api-react'
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

const COMMITTEE_ID_PATH_RE = /^\/committee\/(0x[a-fA-F0-9]{40})\/?$/
const NO_COMMITTEE_ID = '-1'

const idFromPath = path => {
  if (!path) {
    return NO_COMMITTEE_ID
  }
  const matches = path.match(COMMITTEE_ID_PATH_RE)
  return matches ? matches[1] : NO_COMMITTEE_ID
}

export const useSelectedCommittee = committees => {
  const [path, requestPath] = usePath()
  const { appState } = useAragonApi()

  const { isSyncing } = appState
  // The memoized proposal currently selected.
  const selectedCommittee = useMemo(() => {
    const id = idFromPath(path)

    // The `isSyncing` check prevents a proposal to be
    // selected until the app state is fully ready.
    if (isSyncing || id === NO_COMMITTEE_ID) {
      return null
    }

    return committees.find(committee => committee.address === id) || null
  }, [path, isSyncing, committees])

  const selectCommittee = useCallback(
    committee => {
      requestPath(
        String(committee.address) === NO_COMMITTEE_ID
          ? ''
          : `/committee/${committee.address}/`
      )
    },
    [requestPath]
  )

  return [selectedCommittee, selectCommittee]
}

const App = () => {
  const theme = useTheme()
  const { layoutName } = useLayout()
  const { appState } = useAragonApi()

  const { committees } = appState
  const [selectedCommittee, setSelectedCommittee] = useSelectedCommittee(
    committees
  )

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
            <NoCommittees isSyncing={false}>
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
  return (
    <Main>
      <App />
    </Main>
  )
}
