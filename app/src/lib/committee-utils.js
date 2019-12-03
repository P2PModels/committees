const INITIAL_ACCOUNT_STAKE = -1

export const EMPTY_MEMBER = ['', -1]

export const COMMITTEE_TYPES = [
  { name: 'Membership', transferable: false, unique: true },
  { name: 'Equity', transferable: true, unique: false },
  { name: 'Reputation', transferable: false, unique: false },
]

export const VOTING_DURATION = 30
export const VOTING_TYPES = [
  { name: 'Consensus', support: 99, acceptance: 99, duration: VOTING_DURATION },
  {
    name: 'Absolute Majority',
    support: 50,
    acceptance: 50,
    duration: VOTING_DURATION,
  },
  {
    name: 'Simple Majority',
    support: 50,
    acceptance: 15,
    duration: VOTING_DURATION,
  },
  { name: 'Custom Voting', support: 0, acceptance: 0, duration: 0 },
]

export function getTokenType(tokenParams) {
  const [transferable, unique] = tokenParams
  const name =
    !transferable && !unique
      ? 'Reputation'
      : !transferable && unique
      ? 'Membership'
      : transferable && !unique
      ? 'Equity'
      : 'Transferable membership'
  return { name, transferable, unique }
}

export function getVotingType(votingParams) {
  const [support, acceptance, duration] = votingParams
  const name =
    support === '99' && acceptance === '99'
      ? 'Consensus'
      : support === '50' && acceptance === '50'
      ? 'Absolute Majority'
      : support === '50' && acceptance === '15'
      ? 'Simple Majority'
      : 'Custom Voting'
  return { name, support, acceptance, duration }
}

export const EMPTY_COMMITTEE = {
  address: '',
  name: '',
  description: '',
  tokenSymbol: '',
  tokenParams: COMMITTEE_TYPES[0],
  tokenName: '',
  members: [['', INITIAL_ACCOUNT_STAKE]],
  selectedToken: 0,
  votingParams: { ...VOTING_TYPES[0], duration: VOTING_DURATION },
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

  let resMember
  const updatedCommittees = [...committees]
  if (addMember) resMember = [...committees[commIndex].members, memberAddress]
  else
    resMember = committees[commIndex].members.filter(member => {
      return member !== memberAddress
    })

  const updatedCommittee = Object.keys(committees[commIndex]).reduce(
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

function validateDuplicateAddresses(members, validateAddress) {
  const validAddresses = members
    .map(([address]) => address.toLowerCase())
    .filter(address => validateAddress(address))

  return validAddresses.length === new Set(validAddresses).size
}

export function validateMembers(members, validateAddress) {
  console.log(validateAddress)
  if (!members.some(([address]) => validateAddress(address)))
    return 'You need at least one valid address.'

  if (
    !members.some(([address, stake]) => validateAddress(address) && stake > 0)
  ) {
    return 'You need at least one valid address with a positive balance.'
  }

  if (!validateDuplicateAddresses(members, isAddress)) {
    return 'One of your members is using the same address than another member. Please ensure every member address is unique.'
  }
}
