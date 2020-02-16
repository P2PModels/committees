import { isAddress } from 'web3-utils'

export const DEFAULT_TOKEN_TYPES = [
  { name: 'Membership', transferable: false, unique: true },
  { name: 'Equity', transferable: true, unique: false },
  { name: 'Reputation', transferable: false, unique: false },
]

export const PCT = 10 ** 16
export const DAYS = 60 * 60 * 24

const DEFAULT_VOTING_DURATION = 7
export const DEFAULT_VOTING_TYPES = [
  {
    name: 'Consensus',
    support: 99,
    acceptance: 99,
    duration: DEFAULT_VOTING_DURATION,
  },
  {
    name: 'Absolute Majority',
    support: 50,
    acceptance: 50,
    duration: DEFAULT_VOTING_DURATION,
  },
  {
    name: 'Simple Majority',
    support: 50,
    acceptance: 15,
    duration: DEFAULT_VOTING_DURATION,
  },
  { name: 'Custom Voting', support: 0, acceptance: 0, duration: 0 },
]

export const DEFAULT_MEMBER = ['', -1]
export const DEFAULT_ADDRESS = '0x0000000000000000000000000000000000000000'

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
    support === 99 && acceptance === 99
      ? 'Consensus'
      : support === 50 && acceptance === 50
      ? 'Absolute Majority'
      : support === 50 && acceptance === 15
      ? 'Simple Majority'
      : 'Custom Voting'
  return { name, support, acceptance, duration }
}

function validateDuplicateAddresses(members, validateAddress) {
  const validAddresses = members
    .map(([address]) => address.toLowerCase())
    .filter(address => validateAddress(address))

  return validAddresses.length === new Set(validAddresses).size
}

export function validateMembers(members, isMembership) {
  if (!members.some(([address]) => isAddress(address)))
    return 'You need at least one valid address.'

  if (
    !isMembership &&
    !members.some(([address, stake]) => isAddress(address) && stake > 0)
  ) {
    return 'You need at least one valid address with a positive balance.'
  }

  if (!validateDuplicateAddresses(members, isAddress)) {
    return 'One of your members is using the same address than another member. Please ensure every member address is unique.'
  }
}

export function decoupleMembers(members, isUnique = true) {
  const addresses = members
    .filter(member => member[0] && member[0])
    .map(member => member[0])
  const stakes = members
    .filter((member, index) => index < addresses.length)
    .map(member => (isUnique ? 1 : member[1]))

  return [addresses, stakes]
}

export function validateVotingParams(support, acceptance, duration) {
  const votingErrors = []
  try {
    support = parseInt(support)
    acceptance = parseInt(acceptance)
    duration = parseInt(duration)

    if (isNaN(support) || support < 1 || support >= 100)
      votingErrors.push('Support must be a value between 1 and 99')

    if (
      isNaN(acceptance) ||
      acceptance < 1 ||
      acceptance > support ||
      acceptance >= 100
    ) {
      votingErrors.push(
        'Acceptance must be greater than 1 and not greater than support value'
      )
    }

    if (isNaN(duration) || duration < 1 || duration > 360) {
      votingErrors.push('Duration must be greater than 1 and less than 360')
    }
  } catch (err) {
    votingErrors.push('Please enter a number.')
  }
  return votingErrors
}
