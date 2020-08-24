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
                    <h1>The Crypto Trading Tournament App!</h1>
                    <h3>Prove your trading skills by entering our trading tournaments!</h3>
                </div>
            </div>
        )
    }
};

export default Home;