export function getTokenSymbol(name, upperCase) {
  let initials = ''
  name.split(' ').forEach(word => {
    if (upperCase) initials += word.charAt(0).toUpperCase()
    else initials += word.charAt(0).toLowerCase()
  })
  if (upperCase) initials += 'T'.toUpperCase()
  else initials += 'T'

  return initials
}

export function getTokenName(symbol) {
  return symbol + ' Token'
}

export function updateCommitteesMembers(
  committees,
  committeeAddress,
  memberAddress,
  addMember
) {
  const commIndex = committees.findIndex(committee => {
    return committee.address === committeeAddress
  })

  let resMember;
    let updatedCommittee;
    let updatedCommittees = [...committees]
  if (addMember) resMember = [...committees[commIndex].members, memberAddress]
  else
    resMember = committees[commIndex].members.filter(member => {
      return member !== memberAddress
    })

  updatedCommittee = Object.keys(committees[commIndex]).reduce(
    (committee, key) => {
      if (key === 'members') committee[key] = resMember
      else committee[key] = committees[commIndex][key]

      return committee
    },
    {}
  )

  updatedCommittees[commIndex] = updatedCommittee
  return updatedCommittees
}

export function deleteCommittee(committees, committeeAddress) {
  return committees.filter(committee => {
    return committee.address !== committeeAddress
  })
}

// export const COMMITTEE_TYPES = ['Membership', 'Equity', 'Reputation']
export const COMMITTEE_TYPES = [
  { name: 'Membership', transferable: false, maxAccount: 1 },
  { name: 'Equity', transferable: true, maxAccount: 0 },
  { name: 'Reputation', transferable: false, maxAccount: 0 },
]
export const VOTING_DURATION = 30
export const VOTING_TYPES = [
  { name: 'Consensus', support: 99, acceptance: 99 },
  { name: 'Absolute Majority', support: 50, acceptance: 50 },
  { name: 'Simple Majority', support: 50, acceptance: 15 },
  { name: 'Custom Voting', support: 0, acceptance: 0 },
]
export const EMPTY_COMMITTEE = {
  address: '',
  name: '',
  tokenSymbol: '',
  votingType: 0,
  committeeType: 0,
  tokenName: '',
  members: [],
}
