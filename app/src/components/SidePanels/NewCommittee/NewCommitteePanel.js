import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import { Form, FormField } from '../../Form'
import {
  SidePanel,
  Text,
  Tag,
  TextInput,
  DropDown,
  useSidePanelFocusOnReady,
} from '@aragon/ui'

import VotingTypeField from './VotingTypeField/VotingTypeField'
import MembersField from '../../Form/MembersField/MembersField'

import {
  DEFAULT_VOTING_TYPES,
  DEFAULT_TOKEN_TYPES,
  validateMembers,
  validateVotingParams,
} from '../../../lib/committee-utils'
import { getTokenSymbol } from '../../../lib/token-utils'

const DEFAULT_VOTING_PARAMS = { ...DEFAULT_VOTING_TYPES[0] }

const tokenTypes = DEFAULT_TOKEN_TYPES.map(types => {
  return (
    <Text>
      {types.name + ' '}
      {types.transferable ? <Tag uppercase={false}>No transferible</Tag> : null}
      {types.unique ? <Tag uppercase={false}>No cumulative</Tag> : null}
    </Text>
  )
})

const NewCommitteePanel = React.memo(({ panelState, onCreateCommittee }) => {
  return (
    <SidePanel
      title="New Committeee"
      opened={panelState.opened}
      onClose={panelState.onClose}
    >
      <NewCommitteePanelContent onCreateCommittee={onCreateCommittee} />
    </SidePanel>
  )
})

const NewCommitteePanelContent = ({ onCreateCommittee }) => {
  console.log('Rendering New Committee Panel...')
  const [error, setError] = useState({})
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tokenType, setTokenType] = useState(0)
  const [votingParams, setVotingParams] = useState({ ...DEFAULT_VOTING_PARAMS })
  const [members, setMembers] = useState([['', -1]])
  const isUnique = DEFAULT_TOKEN_TYPES[tokenType].unique
  const { support, acceptance, duration } = votingParams

  const inputRef = useSidePanelFocusOnReady()
  const clearPanel = useCallback(() => {
    setError({})
    setName('')
    setDescription('')
    setTokenType(0)
    setVotingParams({ ...DEFAULT_VOTING_PARAMS })
    setMembers(['', -1])
  }, [])

  const handleSubmit = () => {
    const error = {}
    let errorMsg

    if (!name) {
      error.name = 'Please provide a name'
    }
    if (!description) {
      error.description = 'Please provide a description'
    }

    errorMsg = validateVotingParams(support, acceptance, duration)
    if (errorMsg && errorMsg.length) error.votingType = errorMsg

    errorMsg = validateMembers(members, isUnique)
    if (errorMsg) error.members = errorMsg

    if (Object.keys(error).length) {
      setError({ ...error })
    } else {
      const addresses = members.map(member => member[0])
      const stakes = members.map(member => (isUnique ? 1 : member[1]))
      onCreateCommittee({
        name,
        description,
        votingParams,
        tokenParams: DEFAULT_TOKEN_TYPES[tokenType],
        tokenSymbol: getTokenSymbol(name, true),
        addresses,
        stakes,
      })
      clearPanel()
    }
  }

  return (
    <Form onSubmit={handleSubmit} submitText="Create Committee">
      <FormField
        required
        label="Name"
        err={error && error.name}
        input={
          <TextInput
            ref={inputRef}
            name="name"
            onChange={e => setName(e.target.value)}
            value={name}
            wide
          />
        }
      />
      <FormField
        required
        label="Description"
        err={error && error.description}
        input={
          <TextInput
            name="description"
            onChange={e => setDescription(e.target.value)}
            value={description}
            wide
          />
        }
      />
      <FormField
        required
        label="Token Type"
        input={
          <DropDown
            wide
            name="tokenType"
            items={tokenTypes}
            selected={tokenType}
            onChange={setTokenType}
          />
        }
      />
      <FormField
        required
        label="Voting Type"
        err={error && error.votingType}
        input={
          <VotingTypeField
            votingTypes={DEFAULT_VOTING_TYPES}
            votingParams={votingParams}
            onChange={setVotingParams}
          />
        }
      />
      <FormField
        required
        label="Initial Members"
        err={error && error.members}
        input={
          <MembersField
            accountStake={isUnique ? 1 : -1}
            members={members}
            onChange={setMembers}
          />
        }
      />
    </Form>
  )
}

NewCommitteePanelContent.propTypes = {
  onCreateCommittee: PropTypes.func,
}

NewCommitteePanelContent.propTypes = {
  onCreateCommittee: () => {},
}

export default NewCommitteePanel
