import firebase from "firebase";

// TESTING FIREBASE CONFIG
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

// CRYPTO TOURNEYS FIREBASE CONFIG
//const firebaseConfig = {
//    apiKey: "AIzaSyCq_u1wTF5fOngVzZuYs4cyxoFIGdj6aqg",
//    authDomain: "cryptotourneys-1f822.firebaseapp.com",
//    databaseURL: "https://cryptotourneys-1f822.firebaseio.com",
//    projectId: "cryptotourneys-1f822",
//    storageBucket: "cryptotourneys-1f822.appspot.com",
//    messagingSenderId: "782222984199",
//    appId: "1:782222984199:web:14ccdc785f7abc819ad6a2",
//    measurementId: "G-YRG4QC7JQK"
//  };

firebase.initializeApp(firebaseConfig);
firebase.analytics();

const storage = firebase.storage();
const firebaseAuth = firebase.auth();
const firebaseDB = firebase.database();

export { storage, firebaseAuth, firebaseDB };