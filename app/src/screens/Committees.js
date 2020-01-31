import React from 'react'
import PropTypes from 'prop-types'
import CommitteeCard from '../components/Cards/CommitteeCard'
import CommitteeCardGroup from '../components/Cards/CommitteeCardGroup'

const Committees = ({ committees, onClickCommittee }) => {
  return (
    <React.Fragment>
      {committees && committees.length ? (
        <CommitteeCardGroup committees={committees}>
          {committees.map(c => {
            return (
              <CommitteeCard
                key={c.address}
                committee={c}
                onClickCommittee={onClickCommittee}
              />
            )
          })}
        </CommitteeCardGroup>
      ) : null}
    </React.Fragment>
  )
}

Committees.propTypes = {
  committees: PropTypes.array,
  onClickCommittee: PropTypes.func,
}

export default Committees
