import React from 'react'
import styled from 'styled-components'
import { useTheme, unselectable } from '@aragon/ui'

const FieldTitle = ({ children }) => {
  const theme = useTheme()

  return (
    <StyledFieldTitle theme={theme.contentSecondary}>
      {children}
    </StyledFieldTitle>
  )
}
const StyledFieldTitle = styled.label`
  ${unselectable};
  color: ${props => props.theme};
  text-transform: lowercase;
  font-variant: small-caps;
  font-weight: bold;
`

export default FieldTitle
