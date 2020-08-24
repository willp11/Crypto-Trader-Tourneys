import React, {Component} from 'react';
import './nav-bottom.css';
import logo from "../../../assets/crown.png";

class NavBottom extends Component {
    
    render () {
        
        return (
            <div className="NavBottom">
                <img alt="Crypto Tourneys Logo" src={logo}/>
                <h3>FAQ</h3>
                <h3>Terms of Service</h3>
                <h3>Privacy Policy</h3>
                <p>Follow us on Twitter for updates!</p>
            </div>
        );
    }
}

export default NavBottom;