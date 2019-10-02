import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { DropDown, Field, TextInput, Text, theme } from '@aragon/ui'


const votingTypeField = props => {    
    const { votingTypes, selectedVoting, support, acceptance, duration, disabled } = props
    const { onChangeVotingType, onChangeInputField } = props

    let votingTypesName = votingTypes.map(vt => {
        return vt.name
    })


    return (
        <div>
            <DropDown wide
                name="votingType"
                items={votingTypesName}
                active={selectedVoting}
                onChange={onChangeVotingType.bind(this, support, acceptance, duration)} 
            />
            <TypeInfoDetails>
                <Field style={{display: "flex", justifyContent: "center", alignItems: "center"}}label="support">
                    <VotingTextInput min="1" max="99" name="support" value={support}
                        disabled={disabled} type="number" onChange={onChangeInputField} minLength="0"></VotingTextInput><Text size="small" color={theme.contentBorderActive}> %</Text>
                </Field>
                <Field label="acceptance">
                    <VotingTextInput min="1" max="99" name="acceptance" value={acceptance}
                        disabled={disabled}  type="number" onChange={onChangeInputField}></VotingTextInput><Text size="small" color={theme.contentBorderActive}> %</Text>
                </Field>
                <Field label="duration">
                    <VotingTextInput style={{width: "60%"}} min="1" max="360" name="duration" value={duration}
                        disabled={disabled} type="number" onChange={onChangeInputField}></VotingTextInput><Text size="small" color={theme.contentBorderActive}> days</Text>
                </Field>
            </TypeInfoDetails>
        </div>
    )
}

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
    selectedVoting: PropTypes.number.isRequired,
    onChangeVotingType: PropTypes.func.isRequired,
    onChangeInputField: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    support: PropTypes.number.isRequired,
    acceptance: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
}

export default votingTypeField