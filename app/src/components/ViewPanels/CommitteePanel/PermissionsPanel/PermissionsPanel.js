import React from 'react'
import PropTypes from 'prop-types'

import { Main, Table, TableHeader, TableRow, TableCell, Text, Button } from '@aragon/ui'

/*
{
    action: "Create something"
    onApp: "Finance"
}
*/
const PermissionsPanel = props => {
    const { groupPermissions, individualPermissions } = props
    return (
        <Main>
            Group Permissions
            <Table
                header={
                    <TableRow>
                        <TableHeader title="Action" />
                        <TableHeader title="On App" />
                    </TableRow>
                }
            >
                {groupPermissions.map(permission => {
                    return (
                        <TableRow>
                            <TableCell>
                                <Text>{permission.action}</Text>
                            </TableCell>
                            <TableCell>
                                <Text>{permission.onApp}</Text>
                            </TableCell>
                            <TableCell>
                                <Button mode="outline" emphasis="negative">Revoke</Button>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </Table>
            Individual Permissions
            <Table
                header={
                    <TableRow>
                        <TableHeader title="Action" />
                        <TableHeader title="On App" />
                    </TableRow>
                }
            >
                {individualPermissions.map(permission => {
                    return (
                        <TableRow>
                            <TableCell>
                                <Text>{permission.action}</Text>
                            </TableCell>
                            <TableCell>
                                <Text>{permission.onApp}</Text>
                            </TableCell>
                            <TableCell>
                                <Button mode="outline" emphasis="negative">Revoke</Button>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </Table>
        </Main>
    )
}

export default PermissionsPanel