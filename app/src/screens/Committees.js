import React from 'react'
import PropTypes from 'prop-types'
import CommitteeCard from '../components/Cards/CommitteeCard'
import { CardLayout, GU, useLayout } from '@aragon/ui'

const Committees = ({ committees, onClickCommittee }) => {
  const { layoutName } = useLayout()
  const compactMode = layoutName === 'small'
  const rowHeight = compactMode ? null : 294
  return (
    <CardLayout columnWidthMin={30 * GU} rowHeight={rowHeight}>
      {committees &&
        committees.map(c => {
          return (
            <CommitteeCard
              key={c.address}
              committee={c}
              onClickCommittee={onClickCommittee}
            />
          )
        })}
    </CardLayout>
  )
}

Committees.propTypes = {
  committees: PropTypes.array,
  onClickCommittee: PropTypes.func,
}

export default Committees
