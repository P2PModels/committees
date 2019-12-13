import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import CommitteeCard from '../components/Cards/CommitteeCard'

const Committees = ({ committees, onClickCommittee }) => {
  return (
    <React.Fragment>
      <StyledCommittees>
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
      </StyledCommittees>
    </React.Fragment>
  )
}

const StyledCommittees = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`
Committees.propTypes = {
  committees: PropTypes.array,
  onClickCommittee: PropTypes.func,
}

export default Committees
