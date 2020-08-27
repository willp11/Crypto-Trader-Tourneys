import React, { Component } from 'react';
import axios from 'axios';
import './home.css';

class Home extends Component {
    
    componentDidMount() {
        axios.get('/getAllProducts').then(res => console.log(res.data));
        
    }
    
    render() {
        return (
            <div className="homeDiv">
                <div className="homeSubDiv">
                    <h1>Crypto Trading Tournaments!</h1>
                    <h3>Play and Win bitcoin in our cryptocurrency trading tournaments!</h3>
                </div>
            </div>
        )
    }
};

export default Home;