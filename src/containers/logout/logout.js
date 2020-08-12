import React, {Component} from 'react';
import Input from '../../components/UI/Input/Input';
import { connect } from 'react-redux';
import { NavLink, Redirect } from 'react-router-dom';
import './logout.css';

import * as actions from '../../store/actions/index';

class Login extends Component {
    
    submitHandler = (event) => {
        this.props.onLogout();
    }

    render () {
        let authRedirect = null;
        if (!this.props.isAuthenticated) {
            authRedirect = <Redirect to={this.props.authRedirectPath} />
        }
            
        return (
            <div>  
                {authRedirect}
                <p>Are you sure you want to log out?</p>
                <NavLink to="/profile" style={{textDecoration: "none"}}><button>Cancel</button></NavLink>
                <button onClick={this.submitHandler}>Logout</button>
            </div>
        )
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onLogout: () => dispatch(actions.logout()),
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

export default connect(mapStateToProps, mapDispatchToProps)(Login);
