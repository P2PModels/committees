import React from 'react'
import styled from 'styled-components'
import { useTheme, unselectable, textStyle } from '@aragon/ui'

const FieldTitle = React.memo(({ label, required }) => {
  const theme = useTheme()

  return (
    <StyledFieldTitle theme={theme.contentSecondary}>
      {label && (
        <span
          css={`
            ${textStyle('body2')};
          `}
        >
          {label}
        </span>
      )}
      {required && (
        <span
          css={`
            ${textStyle('body3')};
            color: ${theme.accent};
            margin-left: 5px;
          `}
        >
          *
        </span>
      )}
    </StyledFieldTitle>
  )
})

const StyledFieldTitle = styled.label`
  ${unselectable};
  color: ${props => props.theme};
  text-transform: lowercase;
  font-variant: small-caps;
  font-weight: bold;
`

export default FieldTitle
