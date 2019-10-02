import React from 'react'
import PropTypes from 'prop-types'
import { isAddress } from 'web3-utils'

import { TextInput } from "@aragon/ui"
import { Form, FormField } from '../../Form'

const INITIAL_STATE = {
    address: "",
    
}

class NewMemberPanel extends React.Component {
    static propTypes = {
        addMemberHandler: PropTypes.func.isRequired,
    }

    state = INITIAL_STATE

    changeFieldHandler = ({ target: { name, value } }) => {
        this.setState({
            [name]: value
        })
    }

    submitHandler = () => {
        const { addMemberHandler } = this.props
        const { address, } = this.state
        const error = {}

        if(!address)
            error.address = "Please provide new member's address"
        else if(!isAddress(address))
            error.address = "Invalid address"

        if(Object.keys(error).length)
            this.setState({error})
        else {
            this.setState(INITIAL_STATE)
            addMemberHandler(address)
        }
    }

    render() {
        const { submitHandler, changeFieldHandler } = this
        const { address, error } = this.state

        return (
            <Form onSubmit={submitHandler} submitText="Submit Member">
                <FormField
                    required
                    label="Address"
                    err={error && error.address}
                    input={
                        <TextInput
                            name="address"
                            value={address}
                            onChange={changeFieldHandler}
                            wide
                        ></TextInput>
                    }
                >
                </FormField>
            </Form>
        )
    }
}

export default NewMemberPanel