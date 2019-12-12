import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useAragonApi } from '@aragon/api-react'

import { DropDown } from '@aragon/ui'

import { Form, FormField } from '../../Form'
import LocalAppBadge from '../../LocalIdentityBadge/LocalAppBadge'
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
            console.log(a)
            return a.roles
          })
      )
    )
    .toPromise()
  console.log(appRoles)
  const formattedRoles = appRoles[0].map(({ name }) => {
    return name
  })

  return formattedRoles
}

const NewPermissionPanel = ({ entity }) => {
  const { api, appState, installedApps } = useAragonApi()
  const { isSyncing } = appState

  const [selectedApp, setSelectedApp] = useState(0)
  const [actions, setActions] = useState([1])
  const [action, setAction] = useState(0)
  const [error, setError] = useState({})

  const sortedApps = installedApps.sort((a, b) => {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  })
  const sortedFormattedApps = [
    INITIAL_APP_DROPDOWN_VALUE,
    ...sortedApps.map(app => {
      return <LocalAppBadge installedApp={app} />
    }),
  ]

  useEffect(() => {
    api && console.log('get data')
  }, [isSyncing])

  const createPermission = (committeeApp, app, action) => {
    console.lo(
      `Committee app ${committeeApp} now has role ${action} on app ${app}`
    )
  }

  const selectedAppHandler = async index => {
    const selectedAppAddress = sortedApps[index].appAddress
    const roles = await getAppRoles(api, selectedAppAddress)
    setActions(roles)
    setSelectedApp(index)
  }
  const submitHandler = () => {
    const error = {}
    const errorMsg = ''

    if (Object.keys(error).length) setError({ ...error })
    else {
      createPermission()
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
          err={error && error.action}
          input={
            <DropDown
              wide
              items={actions}
              selected={action}
              onChange={setAction}
            />
          }
        />
      )}
    </Form>
  )
}

export default NewPermissionPanel
