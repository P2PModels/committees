import React from 'react'
import styled from 'styled-components'
import { useTheme, unselectable } from '@aragon/ui'

const FieldTitle = () => {
  const theme = useTheme()

  return <StyledFieldTitle theme={theme.contentSecondary} />
}
const StyledFieldTitle = styled.label`
  ${unselectable};
  color: ${props => props.theme.textSecondary};
  text-transform: lowercase;
  font-variant: small-caps;
  font-weight: bold;
`

export default FieldTitle
