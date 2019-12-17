import React from 'react'
import PropTypes from 'prop-types'
import { SidePanelSeparator, textStyle, useTheme } from '@aragon/ui'

import { FieldTitle } from './index'

const FormField = React.memo(
  ({ input, label, hint, required, separator, err }) => {
    const theme = useTheme()
    return (
      <div style={{ marginBottom: '1rem' }}>
        <FieldTitle label={label} required={required} />
        {hint && (
          <span
            css={`
              ${textStyle('body2')};
              color: ${theme.hint};
            `}
          >
            {hint}
          </span>
        )}
        {err && (
          <div>
            {!Array.isArray(err) ? (
              <span
                css={`
                  ${textStyle('body4')};
                  color: ${theme.negative};
                `}
              >
                {err}
              </span>
            ) : (
              err.map((e, index) => {
                return (
                  <span
                    key={index}
                    css={`
                      ${textStyle('body4')};
                      color: ${theme.negative};
                    `}
                  >
                    {e}
                    {index < err.length - 1 && <br />}
                  </span>
                )
              })
            )}
          </div>
        )}
        {input}
        {separator && <SidePanelSeparator style={{ marginTop: '1rem' }} />}
      </div>
    )
  }
)

FormField.propTypes = {
  label: PropTypes.string,
  required: PropTypes.bool,
  hint: PropTypes.string,
  separator: PropTypes.bool,
}

export default FormField
