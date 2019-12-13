import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Card, Button, EthIdenticon, IdentityBadge } from '@aragon/ui'

const MemberCard = ({ address, onRemove }) => {
  console.log('Rendering MemberCard.')
  return (
    <StyledCard width="200px" height="200px">
      <CardHeader>
        <EthIdenticon address={address} scale={2} radius={50} />
        <IdentityBadge entity={address} compact connectedAccount />
      </CardHeader>
      <CardFooter>
        <Button
          mode="negative"
          label="Remove"
          size="mini"
          style={deleteButtonStyle}
          onClick={onRemove}
        />
      </CardFooter>
    </StyledCard>
  )
}

const StyledCard = styled(Card)`
  position: 'relative',
  borderRadius: '10px 10px 10px 10px',
  margin: '113%',
`

const deleteButtonStyle = {
  marginRight: '8%',
}

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 20%;
`

const CardFooter = styled.div`
  display: flex;
  width: 100%;
  position: absolute;
  bottom: 10%;
  right: 0;
  justify-content: flex-end;
`

MemberCard.propTypes = {
  address: PropTypes.string.isRequired,
  onRemove: PropTypes.func.isRequired,
}
export default MemberCard
