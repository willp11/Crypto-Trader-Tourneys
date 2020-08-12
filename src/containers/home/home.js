import React, { Component } from 'react';
import axios from 'axios';

class Home extends Component {
    
    componentDidMount() {
        axios.get('/getAllProducts').then(res => console.log(res.data));
        
    }
    
    render() {
        return (
            <div>
                <h1>The Crypto Trading Tournament App!</h1>
                <h2>Prove your trading skills by entering our trading tournaments!</h2>
            </div>
        )
    }
};

export default Home;