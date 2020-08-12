import firebase from "firebase";


const firebaseConfig = {
    apiKey: "AIzaSyC7f0xqKyXVdb2QSo30g9-vhpGuVaWGEbw",
    authDomain: "trading-tourneys-app.firebaseapp.com",
    databaseURL: "https://trading-tourneys-app.firebaseio.com",
    projectId: "trading-tourneys-app",
    storageBucket: "trading-tourneys-app.appspot.com",
    messagingSenderId: "697039814058",
    appId: "1:697039814058:web:aa9dd64b48325cb1177fd3",
    measurementId: "G-JWVHH7BDLM"
};

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();
const firebaseAuth = firebase.auth();
const firebaseDB = firebase.database();

export { storage, firebaseAuth, firebaseDB };