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

export const testCommittee = {
  address: '0xc41e4c10b37d3397a99d4a90e7d85508a69a5c4c',
  name: 'Membership Committee',
  description: 'This a sample description nothing important to see here',
  tokenSymbol: 'MCT',
  tokenParams: COMMITTEE_TYPES[0],
  tokenName: 'Membership Committee Token',
  members: [
    ['0xb4124cEB3451635DAcedd11767f004d8a28c6eE7', INITIAL_ACCOUNT_STAKE],
    ['0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb', INITIAL_ACCOUNT_STAKE],
  ],
  selectedToken: 0,
  votingParams: { ...VOTING_TYPES[0], duration: VOTING_DURATION },
}

export const testCommittee1 = {
  address: '0xc41e4c10b37d3397a99d4a90e7d85508a69a5c4d',
  name: 'Bounty Committee',
  description: 'This a sample description nothing important to see here',
  tokenSymbol: 'BCT',
  tokenParams: COMMITTEE_TYPES[0],
  tokenName: 'Bounty Committee Token',
  members: [
    ['0xb4124cEB3451635DAcedd11767f004d8a28c6eE7', INITIAL_ACCOUNT_STAKE],
  ],
  selectedToken: 0,
  votingParams: { ...VOTING_TYPES[0], duration: VOTING_DURATION },
}

export const testCommittee2 = {
  address: '0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb',
  name: 'Finance Committee',
  description: 'This a sample description nothing important to see here',
  tokenSymbol: 'FCT',
  tokenParams: COMMITTEE_TYPES[0],
  tokenName: 'Finance Committee Token',
  members: [
    ['0xb4124cEB3451635DAcedd11767f004d8a28c6eE7', INITIAL_ACCOUNT_STAKE],
  ],
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
