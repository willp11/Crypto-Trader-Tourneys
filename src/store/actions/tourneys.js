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
