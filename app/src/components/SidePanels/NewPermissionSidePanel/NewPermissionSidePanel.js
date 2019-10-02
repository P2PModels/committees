import React from 'react'
import PropTypes from 'prop-types'

import { DropDown } from '@aragon/ui'
import {Form, FormField} from '../../Form'

const INITIAL_STATE = {
    committeeAppSelected: 0,
    appSelected: 0,
    permissionSelected: 0,
    appPermissions: [],
}

/*
    {
        app: <address>
    }
*/

let apps = [
    {
        address: "address1",
        name: "app1"
    },
    {
        address: "address2",
        name: "app2"
    },
    {
        address: "address3",
        name: "app3"
    }
]

let committeeApps = [
    {
        address: "tokenManagerAdddress",
        name: "Token Manager"
    },
    {
        address: "votingAddress",
        name: "Voting"
    }
]

let permissions = [
    {
        appAddress: "address1",
        appName: "app1",
        actions: ["action1", "action2"]
    },
    {
        appAddress: "address2",
        appName: "app2",
        actions: ["action1", "action2"]
    }
]

class NewPermissionSidePanel extends React.Component {
    static propTypes = {
        apps: PropTypes.array.isRequired,
        committeeApps: PropTypes.array.isRequired,
        permissions: PropTypes.array.isRequired,
        onCreatePermission: PropTypes.func,
    }
    
    constructor(props) {
        super(props)
        INITIAL_STATE.appPermissions = permissions.filter(permission => {
            return permission.appAddress == committeeApps[committeeAppSelected].address
        })
        this.state = INITIAL_STATE
    }

    changeOnDropDownHandler = ({ target: { name } }, index) => {
        this.setState({
            [name]: index,
        })
    }
    changeOnAppHandler = index => {
        let appPermissions = []
        //Filtramos permisos
        //...

        this.setState({
            appSelected: index,
            appPermissions,
        })
    }

    changeFieldHandler = ({ target: {name, value} }) => {
        this.setState({
            [name]: value
        })
    }

    submitHandler = () => {
        onCreatePermission(committeeApps[committeeAppSelected], apps[appSelected],
            appPermissions[permissionSelected])
    }
    
    render() {
        const { committeeApps, apps, permissions} = this.props
        const { onCreatePermission } = this.props
        const { committeeAppSelected, appSelected, permissionSelected, appPermissions } = this.state
        const { changeOnAppHandler, changeOnDropDownHandler } = this.state

        const committeeItems = committeeApps.map(app => { return app.name }),
            appItems = apps.map(app => { return app.name }),
            permissionItems = appPermissions.actions


        return (
            <Form onSubmit={submitHandler} submitText="Create Permission">
                <FormField
                    label="Committee App"
                    input={
                        <DropDown
                            name="committeeApp"
                            items={committeeApps}
                            active={committeeAppSelected}
                            onChange={changeOnDropDownHandler}                        
                        />
                    }
                />
                <FormField
                    label="On App"
                    input={
                        <DropDown
                            name="onApp"
                            items={apps}
                            active={appSelected}
                            onChange={changeOnAppHandler}                        
                        />
                    }
                />
                <FormField
                    label="Permissions"
                    input={
                        <DropDown
                            name="permission"
                            items={appPermissions}
                            active={permissionSelected}
                            onChange={changeOnDropDownHandler}                        
                        />
                    }
                />
            </Form>
        )
    }
}

export default NewPermissionSidePanel