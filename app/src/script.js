import 'core-js/stable'
import 'regenerator-runtime/runtime'
// import { of } from 'rxjs'
// import AragonApi from '@aragon/api'
import Aragon, { events } from '@aragon/api'
import { hexToUtf8 } from 'web3-utils';


import { getTokenName, updateCommitteesMembers, deleteCommittee } from '../src/util/'

// const INITIALIZATION_TRIGGER = Symbol('INITIALIZATION_TRIGGER')

// const api = new AragonApi()

const INITIAL_STATE = {
  committees: [],
}

const app = new Aragon()

app.store(
  async (state, { event, returnValues }) => {
    console.log(state, event, returnValues);
    let nextState = { ...state }
    
    if(state == null)
      nextState = INITIAL_STATE

    switch (event) {
      case 'CreateCommittee':
        let { committeeAddress: address, name, description, initialMembers, committeeType, votingType, tokenSymbol} = returnValues
        nextState = {
          ...state,
          committees: [ ...state.committees, 
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
        break
      case 'RemoveCommittee':
          nextState = {
            ...state,
            committees: deleteCommittee(state.committees, returnValues.committeeAddress)
          }
          break
      case 'RemoveMember':
      case 'AddMember':
        let  { member } = returnValues
        nextState = {
          ...state,
          committees: updateCommitteesMembers(state.committees, returnValues.committeeAddress, member, event === 'AddMember')
        }
        break
      
    }

    return nextState
    
  }
)
