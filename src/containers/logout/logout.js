import React, {Component} from 'react';
import Input from '../../components/UI/Input/Input';
import { connect } from 'react-redux';
import { NavLink, Redirect } from 'react-router-dom';
import './logout.css';
import {firebaseAuth} from "../../firebase/firebase";
import NavBottom from "../../components/navigation/nav-bottom/nav-bottom";

import * as actions from '../../store/actions/index';

class Logout extends Component {
    
    state = {
        isAuthenticated: null
    }
    
    componentDidMount() {
        
        
        // set the redirect to login page
        this.props.onSetAuthRedirectPath();
        // check if the user is already logged in
        firebaseAuth.onAuthStateChanged((user) => {
          if (user) {
            // User is signed in
            this.setState({isAuthenticated: true});
          } else {
              // User is signed out
            this.setState({isAuthenticated: false});
          }
        });
    }
    
    submitHandler = () => {
        this.props.onLogout();
    }
    
    goBackHandler = () => {
        this.props.history.goBack();
    }

    render () {
        let authRedirect = null;
        if (this.state.isAuthenticated == false) {
            authRedirect = <Redirect to={this.props.authRedirectPath} />
        }
            
        return (
            <div>
                <div className="logoutDiv">  
                    <div className="logoutSubDiv">
                        {authRedirect}
                        <h3>Are you sure you want to log out?</h3>
                        <button className="logoutCancelBtn" onClick={this.goBackHandler}>Cancel</button>
                        <button className="logoutConfirmBtn" onClick={this.submitHandler}>Logout</button>
                    </div>
                </div>
                <NavBottom />
            </div>
        )
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onLogout: () => dispatch(actions.logout()),
        onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath('/login'))
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

export default connect(mapStateToProps, mapDispatchToProps)(Logout);
