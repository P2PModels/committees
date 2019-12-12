import { useContext } from 'react'
import { PANELS, PanelContext } from '../SidePanels/'

const usePanelManagement = () => {
  const { setActivePanel, setPanelProps } = useContext(PanelContext)
  return {
    closePanel: () => {
      setActivePanel(null)
      setPanelProps({})
    },
    setupNewCommittee: () => {
      setActivePanel(PANELS.NewCommitteePanel)
      setPanelProps({ title: 'New Committee' })
    },
    setupNewMembers: (committeeAddress, isUnique) => {
      setActivePanel(PANELS.NewMembersPanel)
      setPanelProps({
        title: 'New Members',
        committeeAddress,
        isUnique,
      })
    },
    setUpNewPermission: entity => {
      setActivePanel(PANELS.NewPermissionPanel)
      setPanelProps({
        title: 'New Permission',
        entity,
      })
    },
  }
}

export default usePanelManagement
