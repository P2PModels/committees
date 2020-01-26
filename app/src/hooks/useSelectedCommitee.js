import { useCallback, useMemo } from 'react'
import { useAragonApi, usePath } from '@aragon/api-react'

const COMMITTEE_ID_PATH_RE = /^\/(0x[a-fA-F0-9]{40})\/(info|permissions|activity)\/?$/
const NO_COMMITTEE_ADDRESS = null

const segmentFromPath = (path, i) => {
  if (!path) {
    return NO_COMMITTEE_ADDRESS
  }
  const matches = path.match(COMMITTEE_ID_PATH_RE)
  return matches ? matches[i] : NO_COMMITTEE_ADDRESS
}

const useSelectedCommittee = committees => {
  const [path, requestPath] = usePath()
  const { appState } = useAragonApi()

  const { isSyncing } = appState
  // The memoized proposal currently selected.
  const selectedCommittee = useMemo(() => {
    const id = segmentFromPath(path, 1)
    // The `isSyncing` check prevents a proposal to be
    // selected until the app state is fully ready.
    if (isSyncing || id === NO_COMMITTEE_ADDRESS) {
      return null
    }

    return committees.find(committee => committee.address === id) || null
  }, [path, isSyncing, committees])

  const selectCommittee = useCallback(
    (committee, tab = 'info') => {
      requestPath(
        committee === NO_COMMITTEE_ADDRESS
          ? ''
          : `/${committee.address}/${tab.toLowerCase()}/`
      )
    },
    [requestPath]
  )
  const selectedTab = segmentFromPath(path, 2)
  return [selectedCommittee, selectCommittee, selectedTab]
}

export default useSelectedCommittee
