import * as actionTypes from '../actions/actionTypes';
import {updateObject} from '../utility';

const initialState = {
    allTourneys: [],
    myTourneys: [],
    loading: false,
    error: false,
};

const startLoadingTourneys = (state, action) => {
    return updateObject(state, {loading: action.loading});
}

const finishLoadingTourneys = (state, action) => {
    return updateObject(state, {loading: action.loading});
}

const getTourneys = (state, action) => {
    return updateObject(state, {});
};

const getMyTourneys = (state, action) => {
    return updateObject(state, {});
};

const returnTourneys = (state, action) => {
    return updateObject(state, {allTourneys: action.tourneys});
};

const returnMyTourneys = (state, action) => {
    return updateObject(state, {myTourneys: action.tourneys});
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.START_LOADING_TOURNEYS: return startLoadingTourneys(state, action);
        case actionTypes.FINISH_LOADING_TOURNEYS: return finishLoadingTourneys(state, action);
        case actionTypes.GET_TOURNEYS: return getTourneys(state,action);
        case actionTypes.GET_MY_TOURNEYS: return getMyTourneys(state,action);
        case actionTypes.RETURN_TOURNEYS: return returnTourneys(state,action);
        case actionTypes.RETURN_MY_TOURNEYS: return returnMyTourneys(state,action);
        default:
            return state;
    }
};

export default reducer;