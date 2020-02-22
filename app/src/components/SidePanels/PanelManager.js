import React, { Suspense, createContext } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { SidePanel, LoadingRing } from '@aragon/ui'

const dynamicImport = Object.freeze({
  NewCommitteePanel: () => import('./NewCommittee/NewCommitteePanel'),
  NewMembersPanel: () => import('./NewMembers/NewMembersPanel'),
  NewPermissionPanel: () => import('./NewPermission/NewPermissionPanel'),
})

export const PANELS = Object.keys(dynamicImport).reduce((obj, item) => {
  obj[item] = item
  return obj
}, {})

export const PanelContext = createContext({
  setActivePanel: () => {},
  setPanelProps: () => {},
})

export const PanelManager = React.memo(
  ({ activePanel = null, onClose, ...panelProps }) => {
    const panelTitle = panelProps.title
      ? panelProps.title
      : activePanel && 'Side Panel'

    const PanelComponent = activePanel && React.lazy(dynamicImport[activePanel])
    return (
      <SidePanel
        title={panelTitle || ''}
        opened={!!activePanel}
        onClose={onClose}
      >
        <Suspense
          fallback={
            <LoadingScreen>
              <LoadingRing mode="half-circle" />
            </LoadingScreen>
          }
        >
          {PanelComponent && <PanelComponent {...panelProps} />}
        </Suspense>
      </SidePanel>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.activePanel === nextProps.activePanel
  }
)

const LoadingScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  top: calc(50% - 30px);
  position: relative;
`

PanelManager.propTypes = {
  activePanel: PropTypes.string,
  onClose: PropTypes.func,
}
