import React from 'react'
import PropTypes from 'prop-types'

import { EmptyStateCard, GU, LoadingRing } from '@aragon/ui'

const NoCommittees = React.memo(({ isSyncing, children }) => {
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
      action={children}
    />
  )
})

NoCommittees.propTypes = {
  isSyncing: PropTypes.bool,
}

export default NoCommittees
