import React from 'react'

import { Button, EmptyStateCard, GU, LoadingRing } from '@aragon/ui'

const NoCommittees = React.memo(({ onNewCommittee, isSyncing , children}) => {
  return (
    <EmptyStateCard
      text={
        isSyncing ? (
          <div
            css={`
              display: grid;
              align-items: center;
              justify-content: center;
              grid-template-columns: auto auto;
              grid-gap: ${1 * GU}px;
            `}
          >
            <LoadingRing />
            <span>Syncing…</span>
          </div>
        ) : (
          'Oops! There a no committees.'
        )
      }
      action={
        children
      }
    />
  )
})

export default NoCommittees
