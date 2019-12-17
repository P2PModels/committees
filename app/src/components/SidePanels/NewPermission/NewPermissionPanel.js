import React, { useState } from 'react'
import styled from 'styled-components'
import { useAragonApi } from '@aragon/api-react'

import { DropDown } from '@aragon/ui'

import { Form, FormField } from '../../Form'
import LocalAppBadge from '../../LocalIdentityBadge/LocalAppBadge'
import { usePanelManagement } from '../../SidePanels'

import { getAclHandler, getAppRoles } from '../../../lib/acl-utils'
import { toChecksumAddress } from 'web3-utils'

const INITIAL_APP_DROPDOWN_VALUE = 'Select an app'
const INITIAL_ROLE_DROPDOWN_VALUE = 'Select role'

const NewPermissionPanel = ({ committeeApp }) => {
  const { api, installedApps } = useAragonApi()
  const [selectedApp, setSelectedApp] = useState(0)
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState(0)
  const [error, setError] = useState({})

  const { closePanel } = usePanelManagement()

  const sortedApps = [
    {},
    ...installedApps.sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    }),
  ]
  const sortedFormattedApps = sortedApps.map((app, index) => {
    if (index > 0)
      return (
        <StyledAppBadge>
          <LocalAppBadge installedApp={app} />
        </StyledAppBadge>
      )
    else return INITIAL_APP_DROPDOWN_VALUE
  })

  const sortedFormattedRoles = roles.map(({ name }, index) => {
    if (index > 0) return name
    else return INITIAL_ROLE_DROPDOWN_VALUE
  })

  const createPermission = async (committeeApp, app, action) => {
    const aclHandler = await getAclHandler(api)
    aclHandler
      .grantPermission(
        toChecksumAddress(committeeApp),
        toChecksumAddress(app),
        action
      )
      .subscribe(closePanel)
  }

  const selectedAppHandler = async index => {
    const selectedAppAddress = sortedApps[index].appAddress
    const roles = await getAppRoles(api, selectedAppAddress)

    setRoles([{}, ...roles])
    setSelectedApp(index)
  }
  const submitHandler = () => {
    const error = {}

    if (!selectedApp) error.app = 'Select an app '

    if (selectedApp && !selectedRole) error.role = 'Select an action'

    if (Object.keys(error).length) setError({ ...error })
    else {
      createPermission(
        committeeApp,
        sortedApps[selectedApp].appAddress,
        roles[selectedRole].bytes
      )
    }
  }

  return (
    <Form onSubmit={submitHandler} submitText="Create Permission">
      <FormField
        required
        label="On App"
        err={error && error.app}
        input={
          <DropDown
            wide
            items={sortedFormattedApps}
            selected={selectedApp}
            onChange={selectedAppHandler}
          />
        }
      />
      {!!selectedApp && (
        <FormField
          required
          label="Action"
          err={error && error.role}
          input={
            <DropDown
              wide
              items={sortedFormattedRoles}
              selected={selectedRole}
              onChange={setSelectedRole}
            />
          }
        />
      )}
    </Form>
  )
}

const StyledAppBadge = styled.div`
  display: inline-flex;
  margin-top: 5px;
`
export default NewPermissionPanel
