import 'core-js/stable'
import 'regenerator-runtime/runtime'
// import { of } from 'rxjs'
// import AragonApi from '@aragon/api'
import Aragon, { events } from '@aragon/api'
import { hexToUtf8 } from 'web3-utils'

import tokenManagerAbi from './abi/TokenManager.json'

import {
  updateCommitteesMembers,
  deleteCommittee,
  testCommittee,
  testCommittee1,
  testCommittee2,
} from '../src/lib/committee-utils'

import { getTokenName } from '../src/lib/token-utils'

const INITIAL_STATE = {
  committees: [testCommittee, testCommittee1, testCommittee2],
  isSyncing: false,
}

const app = new Aragon()

app.store(async (state, { event, returnValues }) => {
  console.log(state, event, returnValues)
  let nextState = { ...state }

  if (state == null) nextState = INITIAL_STATE

  switch (event) {
    case 'CreateCommittee':
      const {
        committeeAddress: address,
        name,
        description,
        initialMembers,
        committeeType,
        votingType,
        tokenSymbol,
      } = returnValues
      nextState = {
        ...state,
        committees: [
          ...state.committees,
          {
            name: hexToUtf8(name),
            description,
            address,
            committeeType,
            votingType,
            tokenSymbol,
            tokenName: getTokenName(tokenSymbol),
            members: initialMembers,
          },
        ],
      }
      break
    case 'RemoveCommittee':
      nextState = {
        ...state,
        committees: deleteCommittee(
          state.committees,
          returnValues.committeeAddress
        ),
      }
      break
    case 'RemoveMember':
    case 'AddMember':
      const { member } = returnValues
      nextState = {
        ...state,
        committees: updateCommitteesMembers(
          state.committees,
          returnValues.committeeAddress,
          member,
          event === 'AddMember'
        ),
      }
      break
  }

  return nextState
})
