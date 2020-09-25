import React, { Component } from 'react';
import axios from 'axios';
import './home.css';
import {firebaseAuth} from "../../firebase/firebase";

class Home extends Component {
    
    componentDidMount() {
        
        firebaseAuth.onAuthStateChanged(function(user) {
          if (user) {
            // User is signed in.
            console.log("hello logged in");
              console.log(firebaseAuth.currentUser);
            // ...
          } else {
            // User is signed out.
            // ...
            console.log("goodbye not logged in");
          }
        });
        
        axios.get('/getAllProducts').then(res => console.log(res.data));
        
    }
    
    render() {
        return (
            <div className="homeDiv">
                <div className="homeSubDiv">
                    <h1 className="homeMainHead">Crypto Tourneys</h1>
                    <h2 className="homeMainSubHead">Coming Soon!</h2>
                </div>
            </div>
        )
    }
};

export default Home;