import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'


import { Card, Button, EthIdenticon, IdentityBadge } from '@aragon/ui'

import "./style.css"


class MemberCard extends React.Component {
    static propTypes = {
        address: PropTypes.string.isRequired,
        onRemoveMember: PropTypes.func.isRequired,
    }


    render() {
        const { address } = this.props
        const { onRemoveMember } = this.props

        return (
            <Card
                width="200px" 
                height="200px"
                style={memberCardStyle}
            >
                <CardHeader>
                    <EthIdenticon 
                        address={address}
                        scale={2}
                        radius={50}
                    />

                    <IdentityBadge entity={address} compact connectedAccount/>
                </CardHeader>
                <CardFooter>
                    <Button emphasis="negative" mode="strong" size="mini" style={deleteButtonStyle} onClick={onRemoveMember}>Remove</Button>
                </CardFooter>
            </Card>
        )
    }
}


const memberCardStyle = {
    position: "relative",
    borderRadius: "10px 10px 10px 10px",
    margin: "3%",
}
const deleteButtonStyle = {
    marginRight: "8%",
}
const addressStyle = {
    marginTop:  "100%",
}

const CardHeader = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 20%;
`

const CardFooter = styled.div`
    display: flex;
    width: 100%;
    position: absolute;
    bottom: 10%;
    right: 0;
    justify-content: flex-end;
`
export default MemberCard
