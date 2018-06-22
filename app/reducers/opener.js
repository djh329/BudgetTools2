import {
  OPEN_COLLAPSE,
  CLOSE_COLLAPSE,
  ADD_COLLAPSE,
  REMOVE_COLLAPSE,
  INIT} from '../actions'

var initialState = {init: false}

function modify(array, value, index) {
  return array.map((orig, ind) => {
    if(ind == index) {
      return value
    }
    return orig
  })
}

function insertItem(array, value) {
  var index = array.length
    return ([
        ...array.slice(0, index),
        value,
        ...array.slice(index)
    ])
}

function removeItem(array, index) {
    return [
        ...array.slice(0, index),
        ...array.slice(index + 1)
    ];
}

export default function(state=initialState, action) {
  // console.log('reduce: ', action)
	switch(action.type) {
  case INIT:
    return {...state, init: true}
  case ADD_COLLAPSE:
    var temp = {}
    if(!state[`${action.payload.form}_${action.payload.field}`]) {
      state[`${action.payload.form}_${action.payload.field}`] = []
    }
    temp[`${action.payload.form}_${action.payload.field}`] = insertItem(state[`${action.payload.form}_${action.payload.field}`], !action.payload.isInit, action.payload.index)
    return {...state,...temp}
  case REMOVE_COLLAPSE:
    var temp = {}
    if(!state[`${action.payload.form}_${action.payload.field}`]) {
      state[`${action.payload.form}_${action.payload.field}`] = []
    }
    temp[`${action.payload.form}_${action.payload.field}`] = removeItem(state[`${action.payload.form}_${action.payload.field}`], action.payload.index)
    return {...state,...temp}
	case OPEN_COLLAPSE:
    var temp = {}
    temp[`${action.payload.form}_${action.payload.field}`] = modify(state[`${action.payload.form}_${action.payload.field}`], true, action.payload.index)
    return {...state,...temp}
	case CLOSE_COLLAPSE:
    var temp = {}
    temp[`${action.payload.form}_${action.payload.field}`] = modify(state[`${action.payload.form}_${action.payload.field}`], false, action.payload.index)
    return {...state,...temp}
	default:
		return state;
	}
}