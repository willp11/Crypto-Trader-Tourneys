import React, {Component} from 'react';
import './error.css';

class Home extends Component {
    
    render () {
        
        return (
            <div className="errorDiv">
                <div className="errorSubDiv">
                    <h2>Something went wrong...</h2>
                    <p>There was a problem with your request, please check your connection.</p>
                    <p>If the problem persists please contact us.</p>
                </div>
            </div>
        );       
    }
}

export default Home;