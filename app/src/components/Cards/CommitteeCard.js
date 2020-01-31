import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Card, EthIdenticon, Tag, textStyle } from '@aragon/ui'

const CommitteeCard = React.memo(({ committee, onClickCommittee }) => {
  const { address, name, tokenSymbol } = committee
  return (
    <StyledCard
      onClick={() => {
        onClickCommittee(committee)
      }}
    >
      <EthIdenticon address={address} scale={2.5} radius={20} />
      <CardTitle>{name}</CardTitle>
      <TokenSymbol>{tokenSymbol}</TokenSymbol>
    </StyledCard>
  )
})

const CardTitle = styled.span`
  ${textStyle('body1')}
  text-transform: uppercase;
  display: block;
  margintop: -9%;
`

const TokenSymbol = styled(Tag)`
  font-size: 120%;
`
const StyledCard = styled(Card)`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  cursor: pointer;
  border-radius: 10px 10px 10px 10px;
  margin: 3% 0;
`

CommitteeCard.propTypes = {
  committee: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    tokenSymbol: PropTypes.string,
  }),
  onClickCommittee: PropTypes.func,
}

export default CommitteeCard
