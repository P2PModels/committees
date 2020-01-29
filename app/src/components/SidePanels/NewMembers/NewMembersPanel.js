import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useAragonApi } from '@aragon/api-react'

import { useSidePanelFocusOnReady } from '@aragon/ui'

import { Form, FormField } from '../../Form'
import MembersField from '../../Form/MembersField/MembersField'
import { usePanelManagement } from '../../SidePanels'

import {
  validateMembers,
  decoupleMembers,
  DEFAULT_MEMBER,
} from '../../../lib/committee-utils'

const NewMembersPanel = ({ committeeAddress, isUnique }) => {
  const { api } = useAragonApi()
  const { closePanel } = usePanelManagement()
  const [error, setError] = useState({})
  const [members, setMembers] = useState([DEFAULT_MEMBER])

  const inputRef = useSidePanelFocusOnReady()

  const createMembers = async (committeeAddress, addresses, stakes) => {
    closePanel()
    await api.addMembers(committeeAddress, addresses, stakes).toPromise()
  }

  const changeMembers = members => {
    setMembers(members)
  }

  const handleSubmit = () => {
    const error = {}
    const errorMsg = validateMembers(members, isUnique)
    if (errorMsg) error.members = errorMsg

    if (Object.keys(error).length) setError({ ...error })
    else {
      createMembers(committeeAddress, ...decoupleMembers(members, isUnique))
    }
  }

  return (
    <Form onSubmit={handleSubmit} submitText="Add Members">
      <FormField
        required
        label="New Members"
        err={error && error.members}
        input={
          <MembersField
            ref={inputRef}
            accountStake={isUnique ? 1 : -1}
            members={members}
            onChange={changeMembers}
          />
        }
      />
    </Form>
  )
}

NewMembersPanel.propTypes = {
  committeeAddress: PropTypes.string.isRequired,
  isUnique: PropTypes.bool.isRequired,
}

export default NewMembersPanel
