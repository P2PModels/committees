import React from 'react'
import PropTypes from 'prop-types'

import { Main, Text, Badge, theme } from '@aragon/ui'

import CommitteeCard from '../../Cards/CommitteeCard/CommitteeCard'
import MemberCard from '../../Cards/MemberCard/MemberCard'

import styled from 'styled-components'
import { from } from 'rxjs/index';

const INITIAL_STATE = {}

class ListPanel extends React.Component {
    static propTypes = {
        items: PropTypes.array,
        itemType: PropTypes.string.isRequired,
        clickItemHandler: PropTypes.func,
        title: PropTypes.string,
        noItemsMessage: PropTypes.string,
    }
    
    state = INITIAL_STATE    

    render() {
        const {items, itemType, clickItemHandler, title, noItemsMessage} = this.props

        let itemsList = (
            <div style={committeeList}>
                {items && items.length ? items.map((item, index) => {
                    if(itemType === "committees")
                        return <CommitteeCard 
                            address={item.address}
                            name={item.name}
                            tokenSymbol={item.tokenSymbol}
                            onClickCommittee={clickItemHandler.bind(this, index)}
                            key={item.address}
                        />
                    else if(itemType === "members")
                        return <MemberCard 
                            address={item}
                            onRemoveMember={clickItemHandler.bind(this, item)}
                            key={item}
                        />
                }) :
                    <NoItemsContainer>
                        <Text smallcaps>{noItemsMessage}</Text>
                    </NoItemsContainer>
                }
            </div>
        )
        return (
            <Main>
                {title && (
                    <h1 style={titleStyle}>
                        <Text size="xxlarge">   
                            {title} 
                            <Badge 
                                style={membersSizeBadge}
                                shape="round"
                                background={theme.contentBorder}
                                foreground={theme.gradientStart}
                            >
                                {items.length}
                            </Badge>
                        </Text>
                    </h1>)}
                {itemsList}
            </Main>
        )
    }
}

const titleStyle = {
    display: "block",
    width: "100%",
    borderBottom: "3px solid",
    borderColor: theme.accent,
    marginBottom: "5%"

}
const committeeList = {
    display: "flex",
    flexWrap: "wrap",
}

const membersSizeBadge = {
    fontSize: "90%",
    marginLeft: "0.5%"
}

const NoItemsContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20% auto 0 auto;
    font-size: 200%;
`

export default ListPanel
