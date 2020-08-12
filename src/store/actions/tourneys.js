import * as actionTypes from './actionTypes';
import axios from 'axios';
import {firebaseAuth, firebaseDB} from "../../firebase/firebase";

export const startLoadingTourneys = () => {
    return {
        type: actionTypes.START_LOADING_TOURNEYS,
        loading: true
    };
};

export const finishLoadingTourneys = () => {
    return {
        type: actionTypes.FINISH_LOADING_TOURNEYS,
        loading: false
    };
};

export const getTourneys = () => {
    
    return dispatch => {

        let tourneys;

        axios.get('https://trading-tourneys-app.firebaseio.com/allTourneys/'+ '.json').then(res => {
            let keys = Object.keys(res.data);
            
            tourneys = keys.map((key) => {
                if (res.data[key] != null) {
                    let result = res.data[key];
                    result.tourneyKey = key;
                    return result;
                };
            });
            
            
            for (let i=0; i<tourneys.length; i++) {
                if (tourneys[i] == null) {
                    tourneys.splice(i, 1);
                } else {
                    tourneys[i].tourneyKey = i;
                }
            }

            dispatch(returnTourneys(tourneys));
        })
        
    }
}

export const getMyTourneys = (userId) => {
    
    return dispatch => {

        let tourneys;
        
        let newRef = "users/" + userId + "/currentTourneys/";
        firebaseDB.ref(newRef).once('value').then((snapshot) => {
            tourneys = snapshot.val(); 
            dispatch(returnMyTourneys(tourneys));
        });
    }
}


export const returnTourneys = (tourneys) => {
    return {
        type: actionTypes.RETURN_TOURNEYS,
        tourneys: tourneys
    }
}

export const returnMyTourneys = (tourneys) => {
    return {
        type: actionTypes.RETURN_MY_TOURNEYS,
        tourneys: tourneys
    }
}
