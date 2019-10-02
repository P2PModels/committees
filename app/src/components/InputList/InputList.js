import React from 'react'
import PropTypes from 'prop-types'

import { TextInput, Button, IconIdentity, IconCross, IdentityBadge } from '@aragon/ui'

import { isAddress } from 'web3-utils';


const INITIAL_STATE = {
    member: "",
    membersList: [],
    error: {}
}

class InputList extends React.Component {
    static propTypes = {
        onChangeInitialMember: PropTypes.func.isRequired,
        onAddAddress: PropTypes.func.isRequired,
        inputName: PropTypes.string,
        inputPlaceholder: PropTypes.string,
    }

    state = INITIAL_STATE

    changeInputField = ({target: {name, value}}) => {
        this.setState({
            [name]: value
        })
        console.log(this.state)
    }

    checkInitialMember = (initialMember) => {
        let res = initialMember && isAddress(initialMember),
            alreadyExists =  initialMember && this.state.membersList.includes(initialMember)
        let msg = ""
        if(!res)
            msg = "Invalid address."
        else if(alreadyExists)
            msg = "Member already exists."

        this.props.onAddAddress(msg)

        return res && !alreadyExists
    }

    addInitialMember = member => {
        if(this.checkInitialMember(member)) {
            let membersList = [...this.state.membersList, member]

            this.props.onChangeInitialMember(membersList)
            this.setState({
                member: "", 
                membersList
            });
          }
    }

    deleteInitialMember = memberIndex => {
        this.state.membersList.splice(memberIndex, 1)
        this.props.onChangeInitialMember(this.state.membersList)
        this.setState({membersList: this.state.membersList})
    }

    render() {
        const {member, membersList, } = this.state;
        const {changeInputField, addInitialMember, deleteInitialMember} = this
        return (
            <div>
                <TextInput 
                    style={textInputStyle}
                    type="text" 
                    name="member" 
                    value={member} 
                    placeholder={this.props.inputPlaceholder ? this.props.inputPlaceholder : ""} 
                    onChange={changeInputField}
                />
                <Button mode="strong" size="small" style={addMMemberButtonStyle} onClick={() => addInitialMember(member)}><IconIdentity></IconIdentity></Button>
                <div style={initialMemberDiv}>
                    <ol style={initialMemberlist}>
                        {membersList.map((m, index) => {
                            console.log(m)
                            return (
                                <li style={memberItemStyle} key={index}>
                                    <IdentityBadge
                                        entity={m}
                                    />
                                    <IconCross style={iconCrossStyle} onClick={() => {deleteInitialMember(index)}}/>
                                </li>
                            )
                        })}
                        
                    </ol>
                </div>
            </div>
        )
    }
}

const initialMemberDiv = {
    display: "flex",
    justifyContent: "flex-end"
}
const memberItemStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    width: "100%",
    alignItems: "center",
    marginBottom: "2%"

}
const initialMemberlist = {
    width: "70%",
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    listStyleType: "circle"

}
const iconCrossStyle = {
    marginLeft: "2%",
    cursor: "pointer"
}
const addMMemberButtonStyle = {
    width: '15%',
    verticalAlign: "middle"
}
const textInputStyle = {
    width: "85%",
}



export default InputList