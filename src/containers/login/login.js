import React, {Component} from 'react';
import Input from '../../components/UI/Input/Input';
import { connect } from 'react-redux';
import { NavLink, Redirect } from 'react-router-dom';
import './login.css';
import {firebaseAuth} from "../../firebase/firebase";

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
        
    };

    componentDidMount() {
        this.props.onSetAuthRedirectPath();
    }
    
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

    submitHandler = (event) => {
        event.preventDefault();
        this.props.onAuth(this.state.controls.email.value, this.state.controls.password.value, false);
    }
    
    resetPassEmailInput = (event) => {
        let email = event.target.value;
        this.setState({resetEmailAddress: email});
    }
    
    resetPassHandler = () => {
        this.setState({resetPassword: true});
    }
    
    cancelResetPassword = () => {
        this.setState({resetPassword: false});
    }
    
    onResetPassword = (email) => {
        console.log(email);
        console.log(firebaseAuth);
        firebaseAuth.sendPasswordResetEmail(email).then(() => {
            console.log('Password Reset Email Sent Successfully!');
        })
        .catch(error => {
            console.error(error);
        });
    }

    render () {
        
        let authRedirect = null;
        if (this.props.isAuthenticated) {
            authRedirect = <Redirect to={this.props.authRedirectPath} />
        }
        
        let errorMsg = null;
        if (this.state.errorMsg) {
            errorMsg = <p>{this.state.errorMsg}</p>
        }
        if (this.props.error) {
            errorMsg = <p>{this.props.error}</p>
        }
            
        let resetPasswordModal = null;
        if (this.state.resetPassword) {
            resetPasswordModal = (
                <div className="darkBg">
                    <div className="resetPasswordDiv">
                        <p>Enter your email address to send reset password email.</p>
                        <input value={this.state.resetEmailAddress} placeholder="Email Address" onChange={(event) => this.resetPassEmailInput(event)}/>< br/>
                        <button onClick={this.cancelResetPassword}>Cancel</button>
                        <button onClick={(email) => this.onResetPassword(this.state.resetEmailAddress)}>Confirm</button>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="loginDiv">
                {authRedirect}
                <div className="loginSubDiv">
                    <h1>Login</h1>
                    <div className="loginFormDiv">
                        <form className="Login" onSubmit={this.submitHandler}>
                            <Input type={this.state.controls.email.elementConfig.type} placeholder={this.state.controls.email.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "email")}/> <br/>
                            <Input type={this.state.controls.password.elementConfig.type} placeholder={this.state.controls.password.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "password")}/> <br />
                            <button className="loginSubmitBtn" onClick={this.submitHandler}>Submit</button><br/>
                            {errorMsg}
                        </form>
                    </div>
                    <div className="goToSignUpDiv" style={{textAlign: "center"}}>  
                        <p>Forgot your password?</p>
                        <button onClick={this.resetPassHandler}>Reset Password</button>
                        <p>Don't have an account yet?</p>
                        <NavLink to="/register" style={{textDecoration: "none"}}><button className="goToSignUpBtn">Go To Sign-up Page</button></NavLink>
                    </div>
                </div>
                {resetPasswordModal}
            </div>
        )
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onAuth: (email, password, isSignup) => dispatch(actions.auth(email, password, isSignup)),
        onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath('/profile'))
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