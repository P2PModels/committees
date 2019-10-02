import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Card, EthIdenticon, Text, Badge, Button} from '@aragon/ui'

import { Pulse } from '../../../styles/KeyFrame'

class CommitteeCard extends React.Component {
    static propTypes = {
        address: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        tokenSymbol: PropTypes.string.isRequired,
        onClickCommittee: PropTypes.func,
    }

    render() {
        return (
            <StyledCard
                width="250px" 
                height="250px" 
                onClick={this.props.onClickCommittee}
            >
                <EthIdenticon 
                    address={this.props.address}
                    scale={2.5}
                    radius={20}
                />
                <CardTitle 
                    size="xxlarge" 
                    smallcaps
                >
                    {this.props.name}
                </CardTitle>
                <TokenSymbol>
                    {this.props.tokenSymbol}
                </TokenSymbol>
            </StyledCard>
        )
    }
}

const CardTitle = styled(Text)`
    display: block;
    marginTop: -9%;
`

const TokenSymbol = styled(Badge)`
    font-size: 120%;
`
const StyledCard  = styled(Card)`
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    cursor: pointer;
    border-radius: 10px 10px 10px 10px;
    margin: 3%;
    transform: perspective(1px) translateZ(0);
    box-shadow: 0 0 1px rgba(0, 0, 0, 0);

    &:hover, &:focus, &:active {
        animation-name: ${Pulse};
        animation-duration: 0.9s;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
    }

`


export default CommitteeCard