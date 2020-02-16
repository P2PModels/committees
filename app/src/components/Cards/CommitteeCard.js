import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import {
  Card,
  EthIdenticon,
  Tag,
  textStyle,
  unselectable,
  GU,
  useLayout,
  useTheme,
} from '@aragon/ui'

const CommitteeCard = React.memo(({ committee, onClickCommittee }) => {
  const { address, name, description, tokenSymbol } = committee
  const theme = useTheme()
  const { layoutName } = useLayout()
  const compactMode = layoutName === 'small'

  return (
    <Card
      onClick={() => {
        onClickCommittee(committee)
      }}
      css={onClickCommittee ? 'display: block;' : ''}
    >
      <CardMain compactMode={compactMode}>
        <Icon compactMode={compactMode}>
          <EthIdenticon
            address={address}
            scale={compactMode ? 2.5 : 3.5}
            radius={10}
          />
        </Icon>
        <Name compactMode={compactMode}>{name}</Name>
        <Description theme={theme} compactMode={compactMode}>
          {description}
        </Description>
        <TagWrapper compactMode={compactMode}>
          <TokenSymbol size="small">{tokenSymbol}</TokenSymbol>
        </TagWrapper>
      </CardMain>
    </Card>
  )
})

const TagWrapper = styled.div`
  ${({ compactMode, link }) =>
    compactMode
      ? `
      position: absolute;
      top: ${1.5 * GU}px;
      right: ${(link ? 5 : 1.5) * GU}px
`
      : `
  padding: 0 ${2.5 * GU}px;
  max-width: 50%;
  margin-bottom: ${1 * GU}px;
`}
`
const TokenSymbol = styled(Tag)`
  font-size: 120%;
  margin-bottom: 10px;
`

const CardMain = styled.section`
  ${unselectable};
  position: relative;
  overflow: hidden;
  height: 100%;
  width: 100%;
  white-space: initial;
  ${({ compactMode }) =>
    compactMode
      ? `
          display: grid;
          grid-template-columns: auto 1fr;
          grid-template-rows: auto auto;
          grid-template-areas:
            "icon title"
            "icon description";
          padding: ${3 * GU}px;
        `
      : `
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: ${5 * GU}px;
        `}
`

const Icon = styled.div`
  ${({ compactMode }) =>
    compactMode
      ? `
        grid-area: icon;
        margin-right: ${1.5 * GU}px;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-start;
      `
      : `
        margin-bottom: ${2 * GU}px;
      `}
`

const Name = styled.p`
  display: flex;
  width: 100%;
  ${textStyle('title3')}
  ${({ compactMode }) =>
    compactMode
      ? `
        grid-area: title;
        align-self: flex-end;
      `
      : `
        justify-content: center;
        margin-bottom: ${1 * GU}px;
      `}
`

const Description = styled.p`
  color: ${({ theme }) => theme.contentSecondary};
  ${textStyle('body2')};
  text-align: left;
  ${({ compactMode }) =>
    compactMode
      ? `
        grid-area: description;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        height: fit-content;
        margin-top: ${0.5 * GU}px;
        `
      : `
        flex: 1;
        text-align: center;
        padding: 0 1rem;
        padding-bottom: 2rem;
        overflow: hidden;
      `}
`

CommitteeCard.propTypes = {
  committee: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    tokenSymbol: PropTypes.string,
  }),
  onClickCommittee: PropTypes.func,
}

export default CommitteeCard
