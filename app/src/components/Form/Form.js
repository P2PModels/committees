import PropTypes from 'prop-types'
import React from 'react'
import { Button, Text, theme } from '@aragon/ui'

const Form = ({ children, onSubmit, submitText, heading, subHeading }) => {
  console.log('Rendering Form.')
  return (
    <React.Fragment>
      {heading && <Text size="xxlarge">{heading}</Text>}
      {subHeading && <Text color={theme.textTertiary}>{subHeading}</Text>}
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
