import React, { useCallback, useState } from 'react'
import PropTypes from 'prop-types'

import { SidePanel } from '@aragon/ui'

import { Form, FormField } from '../Form'
import MembersField from '../Form/MembersField/MembersField'

import { validateMembers, EMPTY_MEMBER } from '../../lib/committee-utils'
import { isAddress } from 'web3-utils'

const NewMembersPanel = React.memo(
  ({ panelState, onCreateMember, isCumulative }) => {
    return (
      <SidePanel
        title="New Member"
        opened={panelState.opened}
        onClose={panelState.onClose}
      >
        <NewMembersPanelContent
          onCreateMember={onCreateMember}
          isCumulative={isCumulative}
        />
      </SidePanel>
    )
  }
)

const NewMembersPanelContent = ({ onCreateMember, isCumulative }) => {
  const [error, setError] = useState({})
  const [members, setMembers] = useState([EMPTY_MEMBER])

  const clearPanel = useCallback(() => {
    setError({})
    setMembers([EMPTY_MEMBER])
  })
  const changeMembers = members => {
    setMembers(members)
  }

  const submitHandler = () => {
    const error = {}
    const errorMsg = validateMembers(members, isAddress)
    if (errorMsg) error.members = errorMsg

    if (Object.keys(error).length) setError({ ...error })
    else {
      clearPanel()
      onCreateMember(members)
    }
  }

  return (
    <Form onSubmit={submitHandler} submitText="Submit Members">
      <FormField
        required
        label="New Members"
        err={error && error.members}
        input={
          <MembersField
            accountStake={isCumulative ? 1 : -1}
            members={members}
            onChange={changeMembers}
          />
        }
      />
    </Form>
  )
}

NewMembersPanelContent.propTypes = {
  onCreateMember: PropTypes.func,
}

NewMembersPanelContent.propTypes = {
  onCreateMember: () => {},
}

export default NewMembersPanel
