import * as actionTypes from '../actions/actionTypes';
import {updateObject} from '../utility';

const initialState = {
    token: null,
    userId: null,
    username: null,
    email: null,
    error: null,
    loading: false,
    authRedirectPath: '/'
};

const authStart = (state, action) => {
    return updateObject(state, {error: null, loading: true});
};

const authSuccess = (state, action) => {
    return updateObject(state, {token: action.token, userId: action.userId, error: null, loading: false, username: action.username, email: action.email});
};

const authFail = (state, action) => {
    return updateObject(state, {error: action.error, loading: false});
};

const authLogout = (state, action) => {
    return updateObject(state, { token: null, userId: null });
};

const setAuthRedirectPath = (state, action) => {
    return updateObject(state, {authRedirectPath: action.path});
};

const updatePassword = (state, action) => {
    return updateObject(state, {loading: false});
};

const setUsernameEmail = (state, action) => {
    return updateObject(state, {username: action.username, email: action.email});
}

const getUsernameEmail = (state, action) => {
    return updateObject(state, {});
}

const clearError = (state, action) => {
    return updateObject(state, {error: null});
}

const updateUserIdToken = (state, action) => {
    return updateObject(state, {userId: action.userId, token: action.token});
}

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.AUTH_START: return authStart(state, action);
        case actionTypes.AUTH_SUCCESS: return authSuccess(state, action);
        case actionTypes.AUTH_FAIL: return authFail(state, action);
        case actionTypes.AUTH_LOGOUT: return authLogout(state, action);
        case actionTypes.SET_AUTH_REDIRECT_PATH: return setAuthRedirectPath(state, action);
        case actionTypes.UPDATE_PASSWORD: return updatePassword(state, action);
        case actionTypes.SET_USERNAME_EMAIL: return setUsernameEmail(state, action);
        case actionTypes.GET_USERNAME_EMAIL: return getUsernameEmail(state, action);
        case actionTypes.CLEAR_ERROR: return clearError(state, action);
        case actionTypes.UPDATE_USERID_NAME: return updateUserIdToken(state, action);
        default:
            return state;
    }
};

export default reducer;