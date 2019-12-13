import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  TextInput,
  IconRemove,
  Button,
  EthIdenticon,
  theme,
  isAddress,
  GU,
  RADIUS,
} from '@aragon/ui'

function useFieldsLayout() {
  return `
    display: grid;
    grid-template-columns: auto ${12 * GU}px;
    grid-column-gap: ${1.5 * GU}px;
  `
}

const MemberField = React.forwardRef(
  (
    { index, member, hideRemoveButton, onUpdate, onRemove, displayStake },
    ref
  ) => {
    console.log('Rendering MemberField.')
    const fieldsLayout = useFieldsLayout()

    const [account, stake] = member

    const handleRemove = useCallback(() => {
      onRemove(index)
    }, [onRemove, index])

    const handleAccountChange = useCallback(
      event => {
        onUpdate(index, event.target.value, stake)
      },
      [onUpdate, stake, index]
    )

    const handleStakeChange = useCallback(
      event => {
        const value = parseInt(event.target.value, 10)
        onUpdate(index, account, isNaN(value) ? -1 : value)
      },
      [onUpdate, account, index]
    )

    return (
      <div
        className="member"
        css={`
          ${fieldsLayout};
          position: relative;
          margin-bottom: ${1.5 * GU}px;
        `}
      >
        <div>
          <TextInput
            ref={ref}
            adornment={
              <Button
                display="icon"
                icon={
                  !hideRemoveButton && (
                    <IconRemove
                      style={{
                        color: 'red',
                      }}
                    />
                  )
                }
                label="Remove member"
                onClick={handleRemove}
                size="mini"
              />
            }
            adornmentPosition="end"
            adornmentSettings={{ width: 52, padding: 8 }}
            onChange={handleAccountChange}
            placeholder="Ethereum address"
            value={account}
            wide
            css={`
              padding-left: ${4.5 * GU}px;
              width: 100%;
            `}
          />
          <div
            css={`
              position: absolute;
              top: ${1 * GU}px;
              left: ${1 * GU}px;
            `}
          >
            {isAddress(account) ? (
              <EthIdenticon address={account} radius={RADIUS} />
            ) : (
              <div
                css={`
                  width: ${3 * GU}px;
                  height: ${3 * GU}px;
                  background: ${theme.disabled};
                  border-radius: ${RADIUS}px;
                `}
              />
            )}
          </div>
        </div>
        <div>
          {displayStake && (
            <TextInput
              onChange={handleStakeChange}
              value={stake === -1 ? '' : stake}
              wide
            />
          )}
        </div>
      </div>
    )
  }
)

MemberField.propTypes = {
  displayStake: PropTypes.bool.isRequired,
  hideRemoveButton: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  member: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
}

export default MemberField
