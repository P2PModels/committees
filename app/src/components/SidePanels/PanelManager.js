import React, { Suspense, createContext } from 'react'
import PropTypes from 'prop-types'

import { SidePanel } from '@aragon/ui'

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
        <Suspense fallback={<div>Loading Panel...</div>}>
          {PanelComponent && <PanelComponent {...panelProps} />}
        </Suspense>
      </SidePanel>
    )
  },
  (prevProps, nextProps) => {
    return prevProps.activePanel === nextProps.activePanel
  }
)

PanelManager.propTypes = {
  activePanel: PropTypes.string,
  onClose: PropTypes.func,
}
