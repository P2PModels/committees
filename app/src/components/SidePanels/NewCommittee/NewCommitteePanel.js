import React, { useState } from 'react'
import styled from 'styled-components'
import { useAragonApi } from '@aragon/api-react'
import { utf8ToHex } from 'web3-utils'

import { Form, FormField } from '../../Form'
import {
  Tag,
  TextInput,
  DropDown,
  Switch,
  GU,
  useSidePanelFocusOnReady,
  useTheme,
  textStyle,
} from '@aragon/ui'

import { usePanelManagement } from '../../SidePanels'
import VotingTypeField from './VotingTypeField/VotingTypeField'
import MembersField from '../../Form/MembersField/MembersField'

import {
  DEFAULT_VOTING_TYPES,
  DEFAULT_TOKEN_TYPES,
  validateMembers,
  decoupleMembers,
  validateVotingParams,
} from '../../../lib/committee-utils'
import { getTokenSymbol } from '../../../lib/token-utils'

const DEFAULT_VOTING_PARAMS = { ...DEFAULT_VOTING_TYPES[0] }

const tokenTypes = DEFAULT_TOKEN_TYPES.map(type => {
  return (
    <span
      css={`
        ${textStyle('body3')}
      `}
    >
      {type.name + ' '}
      {type.transferable ? <Tag uppercase={false}>No transferible</Tag> : null}
      {type.unique ? <Tag uppercase={false}>Unique</Tag> : null}
    </span>
  )
})

const createCommittee = (
  api,
  closePanel,
  {
    name,
    description,
    votingParams,
    tokenParams,
    tokenSymbol,
    addresses,
    stakes,
    finance,
  }
) => {
  const { transferable, unique } = tokenParams
  const { support, acceptance, duration } = votingParams
  const params = [
    utf8ToHex(name),
    description,
    tokenSymbol,
    [transferable, unique],
    addresses,
    stakes,
    [support, acceptance, duration],
  ]
  if (finance) {
    api.createFinancialCommittee(...params).subscribe(closePanel)
  } else {
    api.createCommittee(...params).subscribe(closePanel)
  }
}

const NewCommitteePanel = React.memo(() => {
  console.log('Rendering New Committee Panel...')
  const { api } = useAragonApi()
  const { closePanel } = usePanelManagement()
  const theme = useTheme()
  const [error, setError] = useState({})
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tokenType, setTokenType] = useState(0)
  const [votingParams, setVotingParams] = useState({ ...DEFAULT_VOTING_PARAMS })
  const [finance, enableFinance] = useState(false)
  const [members, setMembers] = useState([['', -1]])
  const isUnique = DEFAULT_TOKEN_TYPES[tokenType].unique
  const { support, acceptance, duration } = votingParams

  const inputRef = useSidePanelFocusOnReady()

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
      const [addresses, stakes] = decoupleMembers(members, isUnique)
      createCommittee(api, closePanel, {
        name,
        description,
        votingParams,
        tokenParams: DEFAULT_TOKEN_TYPES[tokenType],
        tokenSymbol: getTokenSymbol(name, true),
        addresses,
        stakes,
        finance,
      })
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
            textSize={textStyle('body3')}
          />
        }
      />
      <FormField
        label="Apps"
        input={
          <label
            css={`
              display: flex;
              align-items: center;
              margin-top: ${GU}px;
              color: ${theme.surfaceContent};
              width: 100%;
            `}
          >
            <AppField>
              <span
                css={`
                  margin-left: ${0.5 * GU}px;
                  ${textStyle('body3')}
                  color: ${theme.content}
                `}
              >
                Finance &nbsp;
              </span>
              <Switch checked={finance} onChange={enableFinance} />
            </AppField>
          </label>
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
})

const AppField = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`
export default NewCommitteePanel
