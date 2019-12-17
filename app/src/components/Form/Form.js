import PropTypes from 'prop-types'
import React from 'react'
import { Button, useTheme, textStyle } from '@aragon/ui'

const Form = ({ children, onSubmit, submitText, heading, subHeading }) => {
  const theme = useTheme()
  return (
    <React.Fragment>
      {heading && (
        <span
          css={`
            ${textStyle('body1')}
          `}
        >
          {heading}
        </span>
      )}
      {subHeading && (
        <span
          css={`
            color: ${theme.textTertiary};
            ${textStyle('body1')};
          `}
        >
          {subHeading}
        </span>
      )}
      <div style={{ height: '1rem' }} />
      {children}
      <Button
        style={{ userSelect: 'none' }}
        label={submitText}
        mode="strong"
        wide
        onClick={onSubmit}
      />
    </React.Fragment>
  )
}

Form.propTypes = {
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitText: PropTypes.string.isRequired,
  heading: PropTypes.string,
  subHeading: PropTypes.string,
}

Form.defaultProps = {
  submitText: 'Submit',
}

export default Form
