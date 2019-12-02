import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import { Form, FormField } from '../../Form'
import {
  SidePanel,
  Text,
  Tag,
  TextInput,
  DropDown,
  isAddress,
} from '@aragon/ui'

import VotingTypeField from './VotingTypeField/VotingTypeField'
import MembersField from '../../Form/MembersField/MembersField'

import {
  VOTING_TYPES,
  COMMITTEE_TYPES,
  EMPTY_COMMITTEE,
  validateMembers,
} from '../../../lib/committee-utils'
import { getTokenSymbol, getTokenName } from '../../../lib/token-utils'

function transformMembers(members, tokenUnique) {
  const addresses = []
  const stakes = []
  members.forEach(m => {
    if (isAddress[m[0]] && tokenUnique) addresses.push(m[0])
    else if (isAddress[m[0]] && m[1] > 0) {
      addresses.push(m[0])
      stakes.stakes.push(m[1])
    }
  })
  // if (tokenUnique) stakes = [1]
  return [addresses, stakes]
}

function validateVotingParams(support, acceptance, duration) {
  const votingErrors = []
  if (isNaN(support) || support < 1 || support >= 100)
    votingErrors.push('Support must be a value between 1 and 99')

  if (
    isNaN(acceptance) ||
    acceptance < 1 ||
    acceptance > support ||
    acceptance >= 100
  ) {
    votingErrors.push(
      'Acceptance must be greater than 1 and less than support value'
    )
  }

  if (isNaN(duration) || duration < 1 || duration > 360) {
    votingErrors.push('Duration must be greater than 1 and less than 360')
  }

  return votingErrors
}
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
  const [committee, setCommittee] = useState({ ...EMPTY_COMMITTEE })
  const [votingTypes, setVotingTypes] = useState([...VOTING_TYPES])
  const [votingTypeIndex, setVotingTypeIndex] = useState(0)

  const changeField = ({ target: { name, value } }) => {
    setCommittee(committee => {
      return { ...committee, [name]: value }
    })
  }

  const changeTokenType = index => {
    setVotingTypeIndex(index)
    setCommittee(committee => {
      return { ...committee, selectedToken: index }
    })
  }

  const changeVotingType = (votingParams, isCustom) => {
    if (isCustom)
      setVotingTypes(votingTypes => {
        const types = [...votingTypes]
        types[types.length - 1] = votingParams
        return types
      })
    setCommittee(committee => {
      return { ...committee, votingParams }
    })
  }

  const clearPanel = useCallback(() => {
    setError({})
    setCommittee({ ...EMPTY_COMMITTEE })
    setVotingTypes([...VOTING_TYPES])
    setVotingTypeIndex(0)
  }, [])

  const changeMembers = members => {
    setCommittee(committee => {
      return { ...committee, members }
    })
  }

  const handleSubmit = () => {
    const { name, description, tokenParams, votingParams, members } = committee
    const { support, acceptance, duration } = votingParams
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

    errorMsg = validateMembers(members, isAddress)
    if (errorMsg) error.members = errorMsg

    if (Object.keys(error).length) {
      setError({ ...error })
    } else {
      clearPanel()
      const tokenUnique = COMMITTEE_TYPES[committee.selectedToken].unique
      const [addresses, stakes] = transformMembers(members, tokenUnique)

      onCreateCommittee({
        name,
        description,
        votingParams,
        tokenParams,
        tokenSymbol: getTokenSymbol(name, true),
        addresses,
        stakes,
      })
    }
  }

  const tokenTypes = COMMITTEE_TYPES.map(c => {
    return (
      <Text>
        {c.name + ' '}
        {c.transferable ? <Tag uppercase={false}>No transferible</Tag> : null}
        {c.unique ? <Tag uppercase={false}>No cumulative</Tag> : null}
      </Text>
    )
  })
  return (
    <Form onSubmit={handleSubmit} submitText="Create Committee">
      <FormField
        required
        label="Name"
        err={error && error.name}
        input={
          <TextInput
            name="name"
            onChange={changeField}
            value={committee.name}
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
            onChange={changeField}
            value={committee.description}
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
            name="selectedToken"
            items={tokenTypes}
            selected={committee.selectedToken}
            onChange={changeTokenType}
          />
        }
      />
      <FormField
        required
        label="Voting Type"
        err={error && error.votingType}
        input={
          <VotingTypeField
            votingTypes={votingTypes}
            selectedVoting={votingTypeIndex}
            onChange={changeVotingType}
          />
        }
      />
      <FormField
        required
        label="Initial Members"
        err={error && error.members}
        input={
          <MembersField
            accountStake={
              COMMITTEE_TYPES[committee.selectedToken].unique ? 1 : -1
            }
            members={committee.members}
            onChange={changeMembers}
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
