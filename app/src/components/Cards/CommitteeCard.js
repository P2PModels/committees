import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Card, EthIdenticon, Text, Badge } from '@aragon/ui'

const CommitteeCard = ({ committee, onClickCommittee }) => {
  const { address, name, tokenSymbol } = committee
  return (
    <StyledCard
      width="250px"
      height="250px"
      onClick={() => {
        onClickCommittee(committee)
      }}
    >
      <EthIdenticon address={address} scale={2.5} radius={20} />
      <CardTitle size="xxlarge" smallcaps>
        {name}
      </CardTitle>
      <TokenSymbol>{tokenSymbol}</TokenSymbol>
    </StyledCard>
  )
}

const CardTitle = styled(Text)`
  display: block;
  margintop: -9%;
`

const TokenSymbol = styled(Badge)`
  font-size: 120%;
`
const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  cursor: pointer;
  border-radius: 10px 10px 10px 10px;
  margin: 3%;
  transition: transform 0.5s;

  &:hover,
  &:focus,
  &:active {
    transform: scale(1.1);
  }
`

CommitteeCard.propTypes = {
  committee: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    tokenSymbol: PropTypes.string,
  }),
  // address: PropTypes.string.isRequired,
  // name: PropTypes.string.isRequired,
  // tokenSymbol: PropTypes.string.isRequired,
  onClickCommittee: PropTypes.func,
}

export default CommitteeCard
