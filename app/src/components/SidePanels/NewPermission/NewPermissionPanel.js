import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useAragonApi } from '@aragon/api-react'

import { DropDown } from '@aragon/ui'

import { Form, FormField } from '../../Form'
import LocalAppBadge from '../../LocalIdentityBadge/LocalAppBadge'
import { usePanelManagement } from '../../SidePanels'

import { map, first } from 'rxjs/operators'

import aclAbi from '../../../abi/ACL.json'

const INITIAL_APP_DROPDOWN_VALUE = 'Select an app'
const INITIAL_ROLE_DROPDOWN_VALUE = 'Select role'

async function getAppRoles(api, selectedAppAddress) {
  const appRoles = await api
    .getApps()
    .pipe(
      first(),
      map(app =>
        app
          .filter(({ proxyAddress }) => {
            return proxyAddress === selectedAppAddress
          })
          .map(a => {
            console.log('here')
            console.log(a)
            return a.roles
          })
      )
    )
    .toPromise()
  return appRoles[0].sort((a, b) => {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  })
}

const NewPermissionPanel = ({ committeeApp }) => {
  const { api, appState, installedApps } = useAragonApi()
  const { isSyncing } = appState

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
    if (index > 0) return <LocalAppBadge installedApp={app} />
    else return INITIAL_APP_DROPDOWN_VALUE
  })

  const sortedFormattedRoles = roles.map(({ name }, index) => {
    if (index > 0) return name
    else return INITIAL_ROLE_DROPDOWN_VALUE
  })

  useEffect(() => {
    api && console.log('get data')
  }, [isSyncing])

  const createPermission = async (committeeApp, app, action) => {
    const acl = await api.call('getAcl').toPromise()
    const aclHandler = api.external(acl, aclAbi)
    console.log(
      `Committee app ${committeeApp} now has role ${action} on app ${app}`
    )
    aclHandler.grantPermission(committeeApp, app, action).subscribe(closePanel)
  }

  const selectedAppHandler = async index => {
    const selectedAppAddress = sortedApps[index].appAddress
    console.log(sortedApps.index)
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

export default NewPermissionPanel
