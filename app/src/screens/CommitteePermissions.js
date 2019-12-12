import React, { useState, useEffect } from 'react'
import { useAragonApi, useAppState } from '@aragon/api-react'

import PropTypes from 'prop-types'

import { toChecksumAddress, keccak256 } from 'web3-utils'

import {
  Split,
  ContextMenu,
  ContextMenuItem,
  DataView,
  Header,
  Tag,
  IconRemove,
  textStyle,
  Button,
  useTheme,
  GU,
} from '@aragon/ui'

import { PanelManager, usePanelManagement } from '../components/SidePanels/'

import { map, first } from 'rxjs/operators'

import aclAbi from '../abi/ACL.json'
import LocalAppBadge from '../components/LocalIdentityBadge/LocalAppBadge'

async function getACLPermissions(api, aclHandler) {
  const permissions = await aclHandler
    .pastEvents({
      fromBlock: '0x0',
    })
    .pipe(
      map(event =>
        event
          .filter(e => e.event.toLowerCase() === 'setpermission')
          .map(({ returnValues: { entity, app, role, allowed }, logIndex }) => {
            return {
              logIndex,
              entity,
              app,
              role,
              allowed,
            }
          })
      )
    )
    .toPromise()

  return permissions
}

async function filterCommitteeAppsPermissions(aclPermissions, committeeApps) {
  // key: concat(app, role)
  const tokenPermissions = new Map()
  const votingPermissions = new Map()
  const tokenRes = []
  const votingRes = []
  aclPermissions.forEach(p => {
    const key = p.app.concat(p.role)
    const entity = toChecksumAddress(p.entity)
    if (committeeApps.tokenManager === entity) tokenPermissions.set(key, p)
    else if (committeeApps.voting === entity) votingPermissions.set(key, p)
  })

  tokenPermissions.forEach(val => {
    if (val.allowed) tokenRes.push(val)
  })
  votingPermissions.forEach(val => {
    if (val.allowed) votingRes.push(val)
  })

  return [tokenRes, votingRes]
}

async function getRoles(api) {
  const appRoles = await api
    .getApps()
    .pipe(
      first(),
      map(app => app.map(({ roles }) => roles))
    )
    .toPromise()

  const roleRegistry = []
  /* Destructure every app's set of roles */
  appRoles.forEach(roles => roleRegistry.push(...roles))

  /* Create a role registry where the key is the permission bytes
   value and there are no duplicate permissions */
  const formattedRoleRegistry = roleRegistry.reduce(
    (formattedRoleRegistry, { bytes, name }) => {
      formattedRoleRegistry[bytes] = name
      return formattedRoleRegistry
    },
    {}
  )

  return formattedRoleRegistry
}

async function getAclHandler(api) {
  const acl = await api.call('getAcl').toPromise()
  return api.external(acl, aclAbi)
}
async function getPermissions(api, committeeApps) {
  const aclHandler = await getAclHandler(api)
  const aclPermissions = await getACLPermissions(api, aclHandler)
  return filterCommitteeAppsPermissions(aclPermissions, committeeApps)
}

const CommitteePermissions = React.memo(({ tmAddress, votingAddress }) => {
  const { api, appState } = useAragonApi()
  const { isSyncing } = appState

  const [tokenPermissions, setTokenPermissions] = useState(null)
  const [votingPermissions, setVotingPermissions] = useState(null)
  const [roleRegistry, setRoleRegistry] = useState({})

  const { setUpNewPermission } = usePanelManagement()

  const emptyState = individual => (
    <div
      css={`
        ${textStyle('title2')}
      `}
    >
      No {individual ? 'individual' : 'group'} permissions
    </div>
  )

  useEffect(() => {
    api &&
      getRoles(api).then(
        roleRegistry => {
          setRoleRegistry(roleRegistry)
        },
        err => console.log(err)
      )
    api &&
      getPermissions(api, {
        tokenManager: tmAddress,
        voting: votingAddress,
      }).then(res => {
        setTokenPermissions(res[0])
        setVotingPermissions(res[1])
      })
  }, [isSyncing])

  const deletePermissionHandler = async (entity, app, role) => {
    const aclHandler = await getAclHandler(api)
    aclHandler.revokePermission(entity, app, role).toPromise()
  }

  return (
    <React.Fragment>
      <DataView
        heading={
          <PermissionHeader
            title="Individual Permissions"
            permissions={tokenPermissions}
            btnLabel="New Individual Permission"
            onClickBtn={() => setUpNewPermission(tmAddress)}
          />
        }
        status={tokenPermissions ? 'default' : 'loading'}
        statusEmpty={emptyState(true)}
        fields={['role', 'on app', '']}
        entries={tokenPermissions || []}
        renderEntry={({ app, role }) => [
          <span>{roleRegistry[role]}</span>,
          <LocalAppBadge appAddress={app} />,
          null,
        ]}
        renderEntryActions={({ app, role }) => (
          <EntryActions committeeAppAddress={tmAddress} app={app} role={role} />
        )}
      />
      <DataView
        heading={
          <PermissionHeader
            title="Group Permissions"
            permissions={tokenPermissions}
            btnLabel="New Group Permission"
            onClickBtn={() => setUpNewPermission(votingAddress)}
          />
        }
        status={votingPermissions ? 'default' : 'loading'}
        statusEmpty={emptyState(false)}
        fields={['role', 'On App', '']}
        entries={votingPermissions || []}
        renderEntry={({ app, role }) => [
          <span>{roleRegistry[role]}</span>,
          <LocalAppBadge appAddress={app} />,
          null,
        ]}
        renderEntryActions={({ app, role }) => (
          <EntryActions
            committeeApp={tmAddress}
            app={app}
            role={role}
            onDeletePermission={deletePermissionHandler}
          />
        )}
      />
    </React.Fragment>
  )
})

const EntryActions = ({ committeeApp, app, role, onDeletePermission }) => {
  const theme = useTheme()
  const removeMember = () => onDeletePermission(committeeApp, app, role)

  const actions = [[removeMember, IconRemove, 'Remove Permission']]
  return (
    <ContextMenu zIndex={1}>
      {actions.map(([onClick, Icon, label], index) => (
        <ContextMenuItem onClick={onClick} key={index}>
          <span
            css={`
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${theme.surfaceContentSecondary};
            `}
          >
            <Icon />
          </span>
          <span
            css={`
              margin-left: ${1 * GU}px;
            `}
          >
            {label}
          </span>
        </ContextMenuItem>
      ))}
    </ContextMenu>
  )
}

const PermissionHeader = ({ title, permissions, btnLabel, onClickBtn }) => {
  const theme = useTheme()
  return (
    <React.Fragment>
      <div
        css={`
          display: flex;
          justify-content: space-between;
        `}
      >
        <div
          css={`
              white-space: nowrap;
              text-transform: uppercase;
              ${textStyle('body3')}
              color: ${theme.contentSecondary}
            `}
        >
          {title}
          {permissions && <Tag>{permissions.length}</Tag>}
        </div>
        {btnLabel && (
          <Button onClick={onClickBtn} mode="strong" label={btnLabel} />
        )}
      </div>
    </React.Fragment>
  )
}

export default CommitteePermissions
