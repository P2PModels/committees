import { map, first } from 'rxjs/operators'

import aclAbi from '../abi/ACL.json'
import kernelAbi from '../abi/Kernel.json'

async function getACLPermissions(api, aclHandler) {
  const permissions = await aclHandler
    .pastEvents({
      fromBlock: '0x0',
    })
    .pipe(
      map(event =>
        event
          .filter(e => e.event.toLowerCase() === 'setpermission')
          .map(({ returnValues: { entity, app, role, allowed } }) => {
            return {
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
  const permissions = aclPermissions.reduce(
    (permissions, { entity, app, role, allowed }) => {
      if (allowed) {
        return { ...permissions, [entity + app + role]: { entity, app, role } }
      } else {
        return { ...permissions, [entity + app + role]: {} }
      }
    },
    {}
  )
  const tokenRes = Object.values(permissions).filter(
    ({ entity }) => entity === committeeApps.tokenManager
  )
  const votingRes = Object.values(permissions).filter(
    ({ entity }) => entity === committeeApps.voting
  )

  return [tokenRes, votingRes]
}

export async function getRoles(api) {
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

export async function getAppRoles(api, selectedAppAddress) {
  const appRoles = await api
    .getApps()
    .pipe(
      first(),
      map(app =>
        app
          .filter(({ proxyAddress }) => {
            return proxyAddress === selectedAppAddress
          })
          .map(app => app.roles)
      )
    )
    .toPromise()
  return appRoles[0].sort((a, b) => {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  })
}

export async function getAclHandler(api) {
  const kernelAddr = await api.call('kernel').toPromise()
  const kernel = await api.external(kernelAddr, kernelAbi)
  const aclAddr = await kernel.acl().toPromise()
  const aclHandler = api.external(aclAddr, aclAbi)
  return aclHandler
}
export async function getPermissions(api, committeeApps) {
  const aclHandler = await getAclHandler(api)
  const aclPermissions = await getACLPermissions(api, aclHandler)
  return filterCommitteeAppsPermissions(aclPermissions, committeeApps)
}
