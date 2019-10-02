import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Main, theme, Text, Button } from '@aragon/ui'

import ListPanel from '../ListPanel/ListPanel'
import CommitteeInfoSideBar from './CommitteeInfoSideBar/CommitteeInfoSideBar'

class CommitteePanel extends React.Component {
    static propTypes = {
        committee: PropTypes.object.isRequired,
        onRemoveMember: PropTypes.func.isRequired,
        onRemoveCommittee: PropTypes.func.isRequired,
    }

    render() {

        const { committee: { name, address, description, committeeType, tokenSymbol, tokenName,
            votingType} } = this.props
        const members = this.props.committee.members
        const {onRemoveCommittee, onRemoveMember} = this.props
        
        return (
            <Main>
                <TwoPanels>
                    <div style={leftPanel}>
                        <Text size="xxlarge">Description</Text>
                        <DescriptionText>
                            {description}
                        </DescriptionText>
                        <ListPanel title="Members" items={members} itemType="members" clickItemHandler={onRemoveMember} noItemsMessage="There are no members"></ListPanel>
                    </div>
                    <RightPanel>
                        <CommitteeInfoSideBar
                            tokenAddress="address"
                            committeeAddress={address}
                            tokenName={tokenName}
                            tokenSymbol={tokenSymbol}
                            network="development"
                            votingType={votingType}
                            committeeType={committeeType}
                        />
                        <RemoveButton emphasis="negative" mode="strong" size="normal" onClick={onRemoveCommittee}>Remove Committee</RemoveButton>
                    </RightPanel>
                </TwoPanels>
            </Main>
        )
    }
}

const RemoveButton = styled(Button)`
    &:hover {
        background-color: rgb(236, 149, 149);
    }
    margin-top: 10%;
`

const TwoPanels = styled.div`
    display: flex;
    justify-content: space-between;
`
const DescriptionText = styled.div`
    padding: 2%;
    border-radius: 10px 10px 10px 10px;
    margin:  1% 0 5% 0;
    background-color: ${theme.infoBackground};

`

const leftPanel = {
    width: "70%",
}
const RightPanel = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 20%;

`
export default CommitteePanel