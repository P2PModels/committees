import { map, first } from 'rxjs/operators'

import aclAbi from '../abi/ACL.json'
import kernelAbi from '../abi/Kernel.json'

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
