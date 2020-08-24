import React, {Component} from 'react';
import './nav-top.css';
import logo from "../../../assets/crown.png";
import { connect } from 'react-redux';
import { NavLink, Redirect } from 'react-router-dom';

import * as actions from '../../../store/actions/index';

class NavTop extends Component {
    
    render() {
        let dropdownContent = (<div className="dropdown-content">
                    <NavLink to="/" style={{textDecoration: "none"}}><p>Home</p></NavLink>
                    <NavLink to="/registrationTourneys" style={{textDecoration: "none"}}><p>Tournament Registration</p></NavLink>
                    <NavLink to="/activeTourneys" style={{textDecoration: "none"}}><p>Active Tournaments</p></NavLink>
                    <NavLink to="/completedTourneys" style={{textDecoration: "none"}}><p>Completed Tournaments</p></NavLink>
                    <NavLink to="/register" style={{textDecoration: "none"}}><p>Create Account</p></NavLink>
                    <NavLink to="/login" style={{textDecoration: "none"}}><p>Login</p></NavLink>
                  </div>
                 );
        
        if (this.props.isAuthenticated) {
            dropdownContent = (<div className="dropdown-content">
                    <NavLink to="/" style={{textDecoration: "none"}}><p>Home</p></NavLink>
                    <NavLink to="/registrationTourneys" style={{textDecoration: "none"}}><p>Tournament Registration</p></NavLink>
                    <NavLink to="/activeTourneys" style={{textDecoration: "none"}}><p>Active Tournaments</p></NavLink>
                    <NavLink to="/completedTourneys" style={{textDecoration: "none"}}><p>Completed Tournaments</p></NavLink>
                    <NavLink to="/createTournament" style={{textDecoration: "none"}}><p>Create Tournament</p></NavLink>
                    <NavLink to="/myTournaments" style={{textDecoration: "none"}}><p>My Tournaments</p></NavLink>
                    <NavLink to="/profile" style={{textDecoration: "none"}}><p>My Account</p></NavLink>
                    <NavLink to="/wallet" style={{textDecoration: "none"}}><p>Wallet</p></NavLink>
                    <NavLink to="/logout" style={{textDecoration: "none"}}><p>Logout</p></NavLink>
                  </div>
                 );
        }
        return (
            <div className="NavTop">
                <img alt="Crypto Tourneys Logo" src={logo}/>

                <h2>Crypto Tourneys</h2>
                <div className="dropdown">
                    <button className="dropbtn">
                        <div className="menuLine"></div>
                        <div className="menuLine"></div>
                        <div className="menuLine"></div>
                    </button>
                  {dropdownContent}
                </div>
            </div>
        )
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onAuth: (email, password, isSignup) => dispatch(actions.auth(email, password, isSignup)),
        onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath('/'))
    };
};

const mapStateToProps = state => {
    return {
        loading: state.auth.loading,
        error: state.auth.error,
        isAuthenticated: state.auth.token !== null,
        authRedirectPath: state.auth.authRedirectPath
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(NavTop);