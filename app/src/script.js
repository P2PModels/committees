import 'core-js/stable'
import 'regenerator-runtime/runtime'
import { of } from 'rxjs'
import AragonApi from '@aragon/api'
import { hexToUtf8 } from 'web3-utils';


import { getTokenName, updateCommitteesMembers, deleteCommittee } from '../src/util/'

const INITIALIZATION_TRIGGER = Symbol('INITIALIZATION_TRIGGER')

const api = new AragonApi()

api.store(
  async (state, event) => {
    let newState
    console.log("The event is")
    console.log(event.event)
    switch (event.event) {
      case INITIALIZATION_TRIGGER:
        newState = {
          committees: [],
        }
        break
      case 'Increment':
        newState = { count: await getValue() }
        break
      case 'Decrement':
        newState = { count: await getValue() }
        break
      case 'CreateCommittee':
        let { committeeAddress: address, name, description, initialMembers, committeeType, votingType, tokenSymbol} = event.returnValues
        newState = {
          ...state,
          committees: [...state.committees, 
            {
              name: hexToUtf8(name), 
              description,
              address,
              committeeType,
              votingType,
              tokenSymbol,
              tokenName: getTokenName(tokenSymbol),
              members: initialMembers
            }
          ]
        }
        console.log("[CreateCommittee Event] NewState:")
        console.log(newState)
        break
      case 'RemoveCommittee':
          newState = {
            ...state,
            committees: deleteCommittee(state.committees, event.returnValues.committeeAddress)
          }
          break
      case 'RemoveMember':
      case 'AddMember':
        let  {member} = event.returnValues
        newState = {
          ...state,
          committees: updateCommitteesMembers(state.committees, event.returnValues.committeeAddress, member, event.event === 'AddMember')
        }
        console.log("New state")
        console.log(newState)
        break
      default:
        newState = state
    }

    return newState
  },
  [
    // Always initialize the store with our own home-made event
    of({ event: INITIALIZATION_TRIGGER }),
  ]
)

async function getValue() {
  return parseInt(await api.call('value').toPromise(), 10)
}
