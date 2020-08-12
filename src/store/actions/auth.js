import * as actionTypes from './actionTypes';
import axios from 'axios';
import {firebaseAuth, firebaseDB} from "../../firebase/firebase";

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    };
};

export const authSuccess = (token, userId) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        token: token,
        userId: userId
    };
};

export const authFail = (error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    };
};

export const logoutFinal = () => {
    return {
        type: actionTypes.AUTH_LOGOUT
    };
}

export const logout = () => {
    
    return dispatch => {
        
        firebaseAuth.signOut().then((res)=>{
            // Sign-out successful.
            localStorage.removeItem('token');
            localStorage.removeItem('expirationDate');
            localStorage.removeItem('userId');

        }).catch((error)=> {
            // An error happened.
            console.log(error);
        });

        dispatch(logoutFinal());
    }

};

export const checkAuthTimeout = (expirationTime) => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime*1000);
    };
};

export const auth = (email, password, isSignup, username) => {
    return dispatch => {
        dispatch(authStart());
        const authData = {
            email: email,
            password: password,
            returnSecureToken: true
        };
        
        if (!isSignup) {
            firebaseAuth.signInWithEmailAndPassword(email, password)
                .then((response) => {
    //                console.log(response.user);
    //                console.log(response.user.uid);
    //                console.log(response.user.xa);

                    const expirationDate = new Date(new Date().getTime() + 3600*1000);
                    localStorage.setItem('userId', response.user.uid);
                    localStorage.setItem('expirationDate', expirationDate);
                    localStorage.setItem('token', response.user.xa);
                    dispatch(authSuccess(response.user.xa, response.user.uid));
                    dispatch(checkAuthTimeout(3600));
                })
                .catch((error) => {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode, errorMessage);
                    dispatch(authFail(error.message));
                });
        } else if (isSignup) {
            firebaseAuth.createUserWithEmailAndPassword(email, password)
                .then((response) => {
    //                console.log(response.user);
    //                console.log(response.user.uid);
    //                console.log(response.user.xa);

                    const expirationDate = new Date(new Date().getTime() + 3600*1000);
                    localStorage.setItem('userId', response.user.uid);
                    localStorage.setItem('expirationDate', expirationDate);
                    localStorage.setItem('token', response.user.xa);
                
                    // store user in realtime database
                    let dbData = {username: username,
                        userId: response.user.uid,
                        email: email
                    }

                    let newRef = "users/" +  response.user.uid + '/';
                    firebaseDB.ref(newRef).set(dbData).then(()=> {
                        console.log("finished writing to db");
                        
                        dispatch(authSuccess(response.user.xa, response.user.uid));
                        dispatch(checkAuthTimeout(3600));
                    });
        
                    axios.post('/createUser', {userId: response.user.uid, username: username}).then(res => {
                       axios.post('/createAPI', {userId: response.user.uid, API1: '', API2: '', API3: ''}).then(res => console.log(res.data));
                    });
                    
                })
                .catch((error) => {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(errorCode, errorMessage);
                    dispatch(authFail(error.message));
                });
        }
        
    };
};

export const setUsernameEmail = (username, email) => {
    return {
        type: actionTypes.SET_USERNAME_EMAIL,
        username: username,
        email: email
    };
};

export const getUsernameEmail = (userId) => {
    return dispatch => {
        
        let newRef = "users/" + userId + "/";
        firebaseDB.ref(newRef).once('value').then((snapshot) => {
            let username = snapshot.val().username;
            let email = snapshot.val().email;
            dispatch(setUsernameEmail(username, email));
        });
    }
}

export const setAuthRedirectPath = (path) => {
    return {
        type: actionTypes.SET_AUTH_REDIRECT_PATH,
        path: path
    };
};

export const authCheckState = () => {
    return dispatch => {
        const token = localStorage.getItem('token');
        if (!token) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate'));
            if (expirationDate <= new Date()) {
                dispatch(logout());
            } else {
                const userId = localStorage.getItem('userId');
                dispatch(authSuccess(token, userId));
                dispatch(checkAuthTimeout((expirationDate.getTime() - new Date().getTime())/1000));
            }
        }
    }
}


export const updatePassword = (newPassword) => {
    
    return dispatch => {
        
        let user = firebaseAuth.currentUser;
        
        user.updatePassword(newPassword).then((res)=>{
            // update successful
            console.log("Password changed");

        }).catch((error)=> {
            // An error happened.
            console.log(error);
        });

        return {
            type: actionTypes.UPDATE_PASSWORD
        };
    }

};