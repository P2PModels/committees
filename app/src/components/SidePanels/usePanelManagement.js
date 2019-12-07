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
    setupNewMembers: (committeeAddress, isCumulative) => {
      setActivePanel(PANELS.NewMembersPanel)
      setPanelProps({ title: 'New Members', committeeAddress, isCumulative })
    },
  }
}

export default usePanelManagement
