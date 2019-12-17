import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { DropDown, Field, TextInput, useTheme, textStyle } from '@aragon/ui'

const ParamDetail = ({ children }) => {
  return (
    <span
      css={`
        ${textStyle('body3')};
        color: ${useTheme().contentSecondary};
        margin-left: 4px;
      `}
    >
      {children}
    </span>
  )
}
// Support, acceptance and duration are props so we dont need to maintain state in this component
// AND parent component.
const votingTypeField = React.memo(
  ({ votingTypes, votingParams, onChange, textSize }) => {
    const [votingTypeIndex, setVotingTypeIndex] = useState(0)
    const isCustom = votingTypeIndex === votingTypes.length - 1

    const changeDropdown = index => {
      setVotingTypeIndex(index)
      onChange(votingTypes[index])
    }

    const changeField = ({ target: { name, value } }) => {
      onChange({ support, acceptance, duration, [name]: value })
    }

    const votingTypesName = votingTypes.map(({ name }) => (
      <span
        css={
          textSize &&
          `
        ${textSize}
      `
        }
      >
        {name}
      </span>
    ))

    const { support, acceptance, duration } = isCustom
      ? votingParams
      : votingTypes[votingTypeIndex]

    return (
      <div>
        <DropDown
          wide
          name="votingType"
          items={votingTypesName}
          selected={votingTypeIndex}
          onChange={changeDropdown}
        />
        <TypeInfoDetails>
          <Field
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            label="support"
          >
            <VotingTextInput
              min="1"
              max="99"
              name="support"
              value={support}
              disabled={!isCustom}
              type="number"
              onChange={changeField}
              minLength="0"
            />
            <ParamDetail>%</ParamDetail>
          </Field>
          <Field label="acceptance">
            <VotingTextInput
              min="1"
              max="99"
              name="acceptance"
              value={acceptance}
              disabled={!isCustom}
              type="number"
              onChange={changeField}
            />
            <ParamDetail>%</ParamDetail>
          </Field>
          <Field label="duration">
            <VotingTextInput
              style={{ width: '60%' }}
              min="1"
              max="360"
              name="duration"
              value={duration}
              disabled={!isCustom}
              type="number"
              onChange={changeField}
            />
            <ParamDetail>days</ParamDetail>
          </Field>
        </TypeInfoDetails>
      </div>
    )
  }
)

const VotingTextInput = styled(TextInput)`
  width: 80%;
`

const TypeInfoDetails = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  margin-top: 3%;
  margin-left: 2%;
`
votingTypeField.propTypes = {
  votingTypes: PropTypes.array,
}

export default votingTypeField
