import React, {Component} from 'react';
import './nav-bottom.css';
import logo from "../../../assets/logoNew1.PNG";

class NavBottom extends Component {
    
    render () {
        
        return (
            <div className="NavBottom">
                <img alt="Crypto Tourneys Logo" src={logo}/>
                <p>For all enquiries contact support@cryptotourneys.io</p>
            </div>
        );
    }
}

export default NavBottom;