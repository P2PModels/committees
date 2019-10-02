import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import {EthIdenticon, Text, Main, theme, IdentityBadge, Badge } from '@aragon/ui' 


import { COMMITTEE_TYPES, VOTING_TYPES} from '../../../../util/'

class CommitteeInfoSideBar extends React.Component {
    static propTypes = {
        tokenAddress: PropTypes.string,
        committeeAddress: PropTypes.string,
        tokenName: PropTypes.string,
        tokenSymbol: PropTypes.string,
        network: PropTypes.string,
        votingType: PropTypes.string,
        committeeType: PropTypes.string,

    }

    render() {

        
        const { tokenAddress, committeeAddress, tokenName, tokenSymbol, 
            network, votingType, committeeType } = this.props
        return (
            <Main>
                <Logo>
                    <EthIdenticon 
                        address={committeeAddress}
                        scale={3.5}
                        radius={50}
                    />
                </Logo>
                <Part>
                    <h1>
                        <Text color={theme.textSecondary} smallcaps>
                            Committee Info
                        </Text>
                        
                    </h1>
                    <ul>
                        <InfoRow>
                            <span>Committee</span>
                            <span>:</span>
                            <IdentityBadge
                                entity={committeeAddress}
                            />
                        </InfoRow>
                        <InfoRow>
                            <span>Type</span>
                            <span>:</span>
                            <strong>{COMMITTEE_TYPES[committeeType]}</strong>
                        </InfoRow>
                    </ul>
                </Part>
                <Part>
                    <h1>
                        <Text color={theme.textSecondary} smallcaps>
                            Token Info
                        </Text>
                    </h1>
                    <ul>
                        <InfoRow>
                            <span>Token name</span>
                            <span>:</span>
                            <p>{tokenName}</p>
                        </InfoRow>
                        <InfoRow>
                            <span>Token</span>
                            <span>:</span>
                            <IdentityBadge
                                entity="0xc41e4c10b37d3397a99d4a90e7d85508a69a5c4c"
                            />
                        </InfoRow>
                        <InfoRow>
                            <span>Token Symbol</span>
                            <span>:</span>
                            <Badge>{tokenSymbol}</Badge>
                        </InfoRow>
                    </ul>
                </Part>
                <Part>
                    <h1>
                        <Text color={theme.textSecondary} smallcaps>
                            Voting Info
                        </Text>
                    </h1>
                    <ul>
                        <InfoRow>
                        <span>Type</span>
                        <span>:</span>
                        <strong>{VOTING_TYPES[votingType].name}</strong>
                        </InfoRow>
                    </ul>
                </Part>
            </Main>
        )
    }
}

const Part = styled.section`
  margin-bottom: 55px;
  h1 {
    margin-bottom: 15px;
    color: ${theme.textSecondary};
    text-transform: lowercase;
    line-height: 30px;
    font-variant: small-caps;
    font-weight: 600;
    font-size: 16px;
    border-bottom: 1px solid ${theme.contentBorder};
  }
`
const InfoRow = styled.li`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  list-style: none;
  > span:nth-child(1) {
    font-weight: 400;
    color: ${theme.textSecondary};
  }
  > span:nth-child(2) {
    opacity: 0;
    width: 10px;
  }
  > span:nth-child(3) {
    flex-shrink: 1;
  }
  > strong {
    text-transform: uppercase;
  }
`
const Logo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 5%;
`

export default CommitteeInfoSideBar
