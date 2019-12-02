import React, { useState, useCallback, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Button, Field, IconPlus, theme, textStyle, GU } from '@aragon/ui'

import MemberField from './MemberField/MemberField'

function useFieldsLayout() {
  // In its own hook to be adapted for smaller views
  return `
    display: grid;
    grid-template-columns: auto ${12 * GU}px;
    grid-column-gap: ${1.5 * GU}px;
  `
}

const MembersField = ({ members, onChange, accountStake }) => {
  const [focusLastMemberNext, setFocusLastMemberNext] = useState(false)

  const membersRef = useRef()

  const fieldsLayout = useFieldsLayout()

  useEffect(() => {
    if (!focusLastMemberNext || !membersRef.current) {
      return
    }

    setFocusLastMemberNext(false)

    // This could be managed in individual MemberField components, but using
    // the container with a .member class makes it simpler to manage, since we
    // want to focus in three cases:
    //   - A new field is being added.
    //   - A field is being removed.
    //   - The first field is being emptied.
    //
    const elts = membersRef.current.querySelectorAll('.member')
    if (elts.length > 0) {
      elts[elts.length - 1].querySelector('input').focus()
    }
  }, [focusLastMemberNext])

  const focusLastMember = useCallback(() => {
    setFocusLastMemberNext(true)
  }, [])

  const addMember = () => {
    // setFormError(null)
    onChange([...members, ['', accountStake]])
    focusLastMember()
  }

  const removeMember = index => {
    // setFormError(null)
    onChange(
      members.length < 2
        ? // When the remove button of the last field
          // gets clicked, we only empty the field.
          [['', accountStake]]
        : members.filter((_, i) => i !== index)
    )
    focusLastMember()
  }

  const hideRemoveButton = members.length < 2 && !members[0]

  const updateMember = (index, updatedAccount, updatedStake) => {
    onChange(
      members.map((member, i) =>
        i === index ? [updatedAccount, updatedStake] : member
      )
    )
  }

  const fixedStake = accountStake !== -1

  return (
    <Field
      label={
        <div
          css={`
            width: 100%;
            ${fieldsLayout}
          `}
        >
          <InnerLabel>Tokenholders</InnerLabel>
          {!fixedStake && <InnerLabel>Balances</InnerLabel>}
        </div>
      }
    >
      <div ref={membersRef}>
        {members.map((member, index) => (
          <MemberField
            key={index}
            index={index}
            member={member}
            onRemove={removeMember}
            hideRemoveButton={hideRemoveButton}
            onUpdate={updateMember}
            displayStake={!fixedStake}
          />
        ))}
      </div>
      <Button
        display="icon"
        label="Add member"
        size="small"
        icon={
          <IconPlus
            css={`
              color: ${theme.accent};
            `}
          />
        }
        onClick={addMember}
      />
    </Field>
  )
}

const InnerLabel = styled.div`
  text-transform: capitalize;
  ${textStyle('body3')}
`

MembersField.propTypes = {
  members: PropTypes.array,
  onChange: PropTypes.func,
  accountStake: PropTypes.number,
}

export default MembersField
