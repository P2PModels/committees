import React from 'react'
import PropTypes from 'prop-types'
import { SidePanelSeparator, textStyle, useTheme } from '@aragon/ui'

import { FieldTitle } from './index'

const FormField = ({ input, label, hint, required, separator, err }) => {
  // TODO: Currently it will only work with 1 required child
  // const isRequired = React.Children.toArray(children).some(
  //   ({ props: childProps }) => childProps.required
  // )
  const theme = useTheme()

  return (
    <div style={{ marginBottom: '1rem' }}>
      <FieldTitle>
        {label && (
          <span
            css={`
              ${textStyle('body2')};
              /* color: ${theme.accent}; */
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
      </FieldTitle>
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

FormField.propTypes = {
  children: PropTypes.node,
  label: PropTypes.string,
  required: PropTypes.bool,
  hint: PropTypes.string,
  separator: PropTypes.bool,
}

export default FormField
