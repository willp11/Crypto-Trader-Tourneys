import React, {Component} from 'react';
import './tourneyNotFound.css';

class TourneyNotFound extends Component {
    
    render () {
        
        return (
            <div className="errorDiv">
                <div className="errorSubDiv">
                    <h2>Tournament Cancelled</h2>
                    <p>This tournament is cancelled.</p>
                    <p>The host deleted the tournament or the minimum number of entrants failed to register.</p>
                </div>
            </div>
        );       
    }
}

export default TourneyNotFound;