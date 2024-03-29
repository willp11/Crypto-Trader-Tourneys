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

export const clearError = () => {
    return {
        type: actionTypes.CLEAR_ERROR
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

                    const expirationDate = new Date(new Date().getTime() + 3600*1000);
                    localStorage.setItem('userId', response.user.uid);
                    localStorage.setItem('expirationDate', expirationDate);
                    localStorage.setItem('token', response.user.xa);
                
                    dispatch(authSuccess(response.user.xa, response.user.uid));
                    dispatch(checkAuthTimeout(3600));
                    firebaseAuth.currentUser.sendEmailVerification().then(() => {
                        console.log("email sent");
                    }).catch(error => {
                        console.error(error);
                    });
                
                    axios.post('/api/createUser', {userId: response.user.uid, username: username, email: email}).then(res => {
                        console.log(res.data);                                                              
                    }).catch(error => {
                        console.error(error);
                    });
                    
                })
                .catch((error) => {
                    // Handle Errors here.
                    const errorCode = error.code;
                    const errorMessage = error.message;
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

export const getUsernameEmail = (userId, email) => {
    return dispatch => {
        // call API to get username and email
        axios.post('/api/getUsernameEmail', {userId: userId}).then(res => {
            let username = res.data.response.username;
            dispatch(setUsernameEmail(username, email));
        })
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

        }).catch((error)=> {
            // An error happened.
        });

        return {
            type: actionTypes.UPDATE_PASSWORD
        };
    }

};

export const resetPassword = (email) => {
    
    firebaseAuth.sendPasswordReset(email).then(() => {
        console.log('Password Reset Email Sent Successfully!');
    })
    .catch(error => {
        console.error(error);
    });
    
}

export const updateUserIdToken = (userId, token) => {
    return {
        type: actionTypes.UPDATE_USERID_NAME,
        userId: userId,
        token: token
    };
}




