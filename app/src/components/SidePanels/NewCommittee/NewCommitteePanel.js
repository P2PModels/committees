import React from 'react'
import PropTypes from 'prop-types'
import {Form, FormField} from '../../Form'
import { TextInput, DropDown } from '@aragon/ui'

import InputList from '../../InputList/InputList';
import VotingTypeField from './VotingTypeField/VotingTypeField'

import { 
    VOTING_TYPES,
    COMMITTEE_TYPES,
    EMPTY_COMMITTEE,
    getTokenSymbol, 
    getTokenName 
} from '../../../util'


const INITIAL_STATE = {
    ...EMPTY_COMMITTEE,
    acceptance: VOTING_TYPES[0].acceptance,
    support: VOTING_TYPES[0].support,
    duration: VOTING_TYPES[0].duration,
    initialMembers: [],
    error: {},
    selectedVoting: 0,
    disabled: true,
}

class NewCommitteePanel extends React.Component {
    static propTypes = {
        onCreateCommittee: PropTypes.func.isRequired,
    }
    state = INITIAL_STATE

    calculateTokenSymbol(committeeName) {
        let symbol = ""
        committeeName.split(" ").forEach(word => {
            symbol += word.charAt(0).toUpperCase()
        })

        return symbol + 'T'
    }
    changeField = ({ target: { name, value } }) => {
        this.setState({
            [name]: value,
        })
    }

    changeInitialMembers = initialMembers => {
        this.setState({
            initialMembers,
            error: {...this.state.error, initialMembers: ""}
        })

    }

    changeCommitteeType = type => {
        this.setState({
            committeeType: type,
        })
    }

    changeVotingTypeHandler = (support, acceptance, duration, index) => {
        let disabled = index < VOTING_TYPES.length - 1
        if(index == VOTING_TYPES.length - 1) {
                this.setState({
                    votingType: index,
                    support,
                    acceptance,
                    duration,
                    disabled,
                })
        }
        else {
            this.setState({
                votingType: index,
                support: VOTING_TYPES[index].support,
                acceptance: VOTING_TYPES[index].acceptance,
                duration: VOTING_TYPES[index].duration,
                disabled,
            })
        }
    }

    handleSubmit = () => {
        const { name, description, committeeType, votingType,
            initialMembers, support, acceptance, duration} = this.state
        let sup = parseInt(support), accep= parseInt(acceptance), dur = parseInt(duration)
        const error = {}
        let initialMembersError = this.state.error.initialMembers

        if (!name) {
            error.name = 'Please provide a committee name'
        }
        if(!description) {
            error.description = "Please provide a committee description"
        }

        if(isNaN(sup) || sup < 1 || sup >= 100) 
            error.votingType = ["Support must be a value between 1 and 99"]

        if(isNaN(accep) || accep < 1 || accep > sup || accep >= 100) {
            let err = "Acceptance must be greater than 1 and less than support value"
            if(error.votingType && error.votingType.length > 0)
                error.votingType = [...error.votingType, err]
            else
                error.votingType = [err]
        }

        if(isNaN(dur) || dur < 1 || dur > 360) {
            let err = "Duration must be greater than 1 and less than 360"
            if(error.votingType && error.votingType.length > 0)
                error.votingType = [...error.votingType, err]
            else
                error.votingType = [err]
        }

        if (Object.keys(error).length) {
            if(initialMembersError)
                this.setState({ error: {...error, initialMembers: initialMembersError}})
            else
            this.setState({ error: {...error,} })
        } else {
            this.setState(INITIAL_STATE)
            let symbol = getTokenSymbol(name, true)

            this.props.onCreateCommittee({ 
                name, 
                description, 
                committeeType, 
                votingType,
                votingInfo: [sup, accep, dur],
                tokenSymbol: symbol,
                tokenName: getTokenName(symbol),
                initialMembers})
        }
    }

    addedAddressHandler = errMsg => {
        this.setState({error: {...this.state.error, initialMembers: errMsg}, })        
    }

    render() {
        const {name, description, committeeType, votingType,
            initialMembers, error, } = this.state
        const { support, acceptance, duration, disabled } = this.state
        const { handleSubmit, changeField, changeCommitteeType, changeVotingTypeHandler} = this
        
        return (
            <Form onSubmit={handleSubmit} submitText="Create Committee">
                <FormField
                    required
                    label="Name"
                    err={error && error.name}
                    input={
                        <TextInput name="name" onChange={changeField} value={name} wide/>
                    }
                />
                <FormField
                    required
                    label="Description"
                    err={error && error.description}
                    input={
                        <TextInput name="description" onChange={changeField} value={description} wide/>
                    }
                />
                <FormField 
                    label="Committee Type"
                    input={
                        <DropDown wide
                            name="committeeType"
                            items={COMMITTEE_TYPES}
                            active={committeeType}
                            onChange={changeCommitteeType}
                        />
                    }
                />
                <FormField 
                    label="Voting Type"
                    err={error && error.votingType}
                    input={
                        <VotingTypeField
                            votingTypes={VOTING_TYPES}
                            support={support}
                            acceptance={acceptance}
                            duration={duration}
                            selectedVoting={votingType}
                            onChangeVotingType={changeVotingTypeHandler}
                            onChangeInputField={changeField}
                            disabled={disabled}
                        />
                    }
                />
                <FormField 
                    label="Initial Members"
                    err={error && error.initialMembers}
                    input={
                        <InputList 
                            onChangeInitialMember={this.changeInitialMembers} 
                            onAddAddress={message => this.setState({error: {...error, initialMembers: message}})} 
                            inputName="initialMembers"
                            inputPlaceholder="Add a member address..."
                        />
                    }
                />
            </Form>
        )
    }
}

export default NewCommitteePanel
