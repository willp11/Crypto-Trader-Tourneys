import React, {Component} from 'react';
import Input from '../../components/UI/Input/Input';
import { connect } from 'react-redux';
import { NavLink, Redirect } from 'react-router-dom';
import './login.css';
import {firebaseAuth} from "../../firebase/firebase";
import Spinner from '../../components/UI/Spinner/Spinner';
import NavBottom from "../../components/navigation/nav-bottom/nav-bottom";

import * as actions from '../../store/actions/index';

class Login extends Component {
    
    state = {
        controls: {
            email: {
                elementType: 'input',
                elementConfig: {
                    type: 'email',
                    placeholder: 'E-mail address'
                },
                value: '',
                validation: {
                    required: true,
                    isEmail: true
                },
                valid: false,
                touched: false
            },
            password: {
                elementType: 'input',
                elementConfig: {
                    type: 'password',
                    placeholder: 'Password'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 6
                },
                valid: false,
                touched: false
            }
        },
        errorMsg: null,
        resetPassword: false,
        resetEmailAddress: '',
        loadingResetPass: false,
        resetPassSuccess: false,
        resetPassFailure: false
    };

    componentDidMount() {
        
        // set the redirect to profile page
        this.props.onSetAuthRedirectPath();
        // check if the user is already logged in
        firebaseAuth.onAuthStateChanged((user) => {
          if (user) {
            // User is signed in, redirect to profile page
            this.props.onSignedIn(firebaseAuth.currentUser.xa, firebaseAuth.currentUser.uid);
          } 
        });
    }
    
    // handler for input fields
    changeInputHandler = (event, controlName) => {
        const updatedControls = {
            ...this.state.controls,
            [controlName]: {
                ...this.state.controls[controlName],
                value: event.target.value,
                touched: true
            }
        }
        this.setState({controls: updatedControls});    
    };

    // submit button
    submitHandler = (event) => {
        event.preventDefault();
        this.props.onAuth(this.state.controls.email.value, this.state.controls.password.value, false);
    }
    
    // handler for reset password input field
    resetPassEmailInput = (event) => {
        let email = event.target.value;
        this.setState({resetEmailAddress: email});
    }
    // show the reset pass div
    resetPassHandler = () => {
        this.setState({resetPassword: true});
    }
    // hide the reset pass div
    cancelResetPassword = () => {
        this.setState({resetPassword: false, resetPassSuccess: false, resetpassFailure: false});
    }
    // reset the password
    onResetPassword = (email) => {
        this.setState({loadingResetPass: true});
        firebaseAuth.sendPasswordResetEmail(email).then(() => {
            // pass reset successfully
            this.setState({loadingResetPass: false, resetPassSuccess: true});
        })
        .catch(error => {
            this.setState({loadingResetPass: false, resetPassFailure: true});
        });
    }

    render () {
        
        let authRedirect = null;
        if (this.props.isAuthenticated) {
            authRedirect = <Redirect to={this.props.authRedirectPath} />
        }
        
        let errorMsg = null;
        if (this.state.errorMsg) {
            errorMsg = <p style={{"color": "#f7716d"}}>{this.state.errorMsg}</p>
        }
        if (this.props.error) {
            errorMsg = <p style={{"color": "#f7716d"}}>{this.props.error}</p>
        }

        // SUBMIT BTN
        let submitBtn = <button className="loginSubmitBtn" onClick={this.submitHandler}>Submit</button>
            
        // LOADING
        let spinner = null;
        if (this.props.loading) {
            spinner = <Spinner />
            submitBtn = null;
        }

        
        // RESET PASSWORD    
        let resetPasswordModal = null;
        if (this.state.resetPassword) {
            resetPasswordModal = (
                <div className="darkBg">
                    <div className="resetPasswordDiv">
                        <p>Enter your email address to send reset password email.</p>
                        <input className="resetPassInput" value={this.state.resetEmailAddress} placeholder="Email Address" onChange={(event) => this.resetPassEmailInput(event)}/>< br/>
                        <button className="resetBtn" onClick={this.cancelResetPassword}>Cancel</button>
                        <button className="submitBtn" onClick={(email) => this.onResetPassword(this.state.resetEmailAddress)}>Confirm</button>
                    </div>
                </div>
            );
        }

        if (this.state.loadingResetPass) {
            resetPasswordModal = (
                <div className="darkBg">
                    <div className="resetPasswordDiv">
                        <Spinner />
                    </div>
                </div>
            );
        }

        if (this.state.resetPassSuccess) {
            resetPasswordModal = (
                <div className="darkBg">
                    <div className="resetPasswordDiv">
                        <p>Reset password e-mail sent. Please check your e-mail for further instructions.</p>
                        <button className="loginSubmitBtn" onClick={this.cancelResetPassword}>Close</button>
                    </div>
                </div>
            )
        }

        if (this.state.resetPassFailure) {
            resetPasswordModal = (
                <div className="darkBg">
                    <div className="resetPasswordDiv">
                        <p>There was a problem with your request. Please try again and if the problem persists contact support@cryptotourneys.io.</p>
                        <button className="loginSubmitBtn" onClick={this.cancelResetPassword}>Close</button>
                    </div>
                </div>
            )
        }
        
        return (
            <div>
                <div className="loginDiv">
                    {authRedirect}
                    <div className="loginSubDiv">
                        <h1>Login</h1>
                        <div className="loginFormDiv">
                            <form className="Login" onSubmit={this.submitHandler}>
                                <Input type={this.state.controls.email.elementConfig.type} placeholder={this.state.controls.email.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "email")}/> <br/>
                                <Input type={this.state.controls.password.elementConfig.type} placeholder={this.state.controls.password.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "password")}/> <br />
                                {submitBtn} <br />
                                {errorMsg}
                            </form>
                            {spinner}
                        </div>
                        <div className="goToSignUpDiv" style={{textAlign: "center"}}>  
                            <p>Forgot your password?</p>
                            <button className="resetPassBtn" onClick={this.resetPassHandler}>Reset Password</button>
                            <p>Don't have an account yet?</p>
                            <NavLink to="/register" style={{textDecoration: "none"}}><button className="goToSignUpBtn">Go To Sign-up Page</button></NavLink>
                        </div>
                    </div>
                    {resetPasswordModal}
                </div>
                <NavBottom />
            </div>
        )
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onAuth: (email, password, isSignup) => dispatch(actions.auth(email, password, isSignup)),
        onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath('/profile')),
        onSignedIn: (token, userId) => dispatch(actions.authSuccess(token, userId))
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