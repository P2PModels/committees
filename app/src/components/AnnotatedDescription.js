import React from 'react'
import { textStyle } from '@aragon/ui'
import LocalIdentityBadge from './LocalIdentityBadge/LocalIdentityBadge'

export default function AnnotatedDescription({
  annotatedDescription,
  description,
}) {
  return (
    <div>
      {annotatedDescription
        ? annotatedDescription.map(({ type, value }, index) => {
            if (type === 'address' || type === 'any-account') {
              return (
                <span
                  key={index}
                  css={`
                    display: inline-flex;
                    vertical-align: middle;
                    margin-right: 4px;
                    position: relative;
                    top: -1px;
                  `}
                >
                  <LocalIdentityBadge
                    entity={type === 'any-account' ? 'Any account' : value}
                    labelStyle={`
                      ${textStyle('body3')}
                    `}
                    compact
                  />
                </span>
              )
            }
            if (type === 'app') {
              return (
                <span key={index} css="margin-right: 2px">
                  {value.name}
                </span>
              )
            }
            if (type === 'role' || type === 'kernelNamespace') {
              return (
                <span
                  key={index}
                  css={`
                    margin-right: 4px;
                    font-style: italic;
                  `}
                >
                  {value.name}
                </span>
              )
            }
            if (type === 'apmPackage') {
              return (
                <span
                  key={index}
                  css={`
                    display: inline-flex;
                    vertical-align: middle;
                    margin-right: 4px;
                  `}
                >
                  <LocalIdentityBadge
                    entity={value.name}
                    labelStyle={`
                      ${textStyle('body3')}
                    `}
                  />
                </span>
              )
            }
            return (
              <span key={index} css="margin-right: 4px">
                {value}
              </span>
            )
          })
        : description || 'an action'}
    </div>
  )
}
