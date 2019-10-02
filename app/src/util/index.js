export function getTokenSymbol(name, upperCase) {
    let initials = ""
        name.split(" ").forEach(word => {
            if(upperCase)
                initials += word.charAt(0).toUpperCase()
            else
                initials += word.charAt(0).toLowerCase()
        })
        if(upperCase)
            initials += "T".toUpperCase()
        else
            initials += "T"

        return initials
} 

export function getTokenName(symbol) {
    return symbol + " Token"
}

export function updateCommitteesMembers(committees, committeeAddress, memberAddress, addMember) {
    let commIndex = committees.findIndex(committee => {
        return committee.address === committeeAddress
    })

    let resMember, updatedCommittee, 
        updatedCommittees = [...committees]
    if(addMember)
        resMember = [...committees[commIndex].members, memberAddress]
    else
        resMember = committees[commIndex].members.filter(member => {return member !== memberAddress})    

    updatedCommittee = Object.keys(committees[commIndex]).reduce((committee, key) => {
        if(key === "members")
            committee[key] = resMember
        else
            committee[key] = committees[commIndex][key]
            
        return committee
    }, {})

    updatedCommittees[commIndex] = updatedCommittee
    return updatedCommittees
}

export function deleteCommittee(committees, committeeAddress) {
    return committees.filter(committee =>  { return committee.address !== committeeAddress})
}

export const COMMITTEE_TYPES = ["Membership", "Equity", "Reputation"]
export const VOTING_TYPES = [
    {name: "Consensus", support: 99, acceptance: 99, duration: 30}, 
    {name: "Absolute Majority", support: 50, acceptance: 50, duration: 30},
    {name: "Simple Majority", support: 50, acceptance: 15,  duration: 30},
    {name: "Custom Voting", support: 0, acceptance: 0, duration:  1},
]
export const EMPTY_COMMITTEE = {
  address: "",
  name: "",
  tokenSymbol: "",
  votingType: 0,
  committeeType: 0,
  tokenName: "",
  members: []
}