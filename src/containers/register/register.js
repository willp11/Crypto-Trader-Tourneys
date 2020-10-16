import React, {Component} from 'react';
import Input from '../../components/UI/Input/Input';
import './register.css';
import { NavLink, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';
import {firebaseAuth} from "../../firebase/firebase";
import Spinner from '../../components/UI/Spinner/Spinner';
import axios from 'axios';

class Register extends Component {
    
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
            },
            repeatPassword: {
                elementType: 'input',
                elementConfig: {
                    type: 'password',
                    placeholder: 'Repeat Password'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 6
                },
                valid: false,
                touched: false
            },
            username: {
                elementType: 'input',
                elementConfig: {
                    type: 'text',
                    placeholder: 'Username'
                },
                value: '',
                validation: {
                    required: true,
                    minLength: 3,
                    maxLength: 25
                },
                valid: false,
                touched: false
            }
        },
        errorMsg: null
    };

    componentDidMount() {
        
        this.props.clearErrorMsg();
        
        this.props.onSetAuthRedirectPath();
        firebaseAuth.onAuthStateChanged((user) => {
          if (user) {
            // User is signed in.
            this.props.onSignedIn(firebaseAuth.currentUser.xa, firebaseAuth.currentUser.uid);
          } 
        });
    }

    checkValidity = (event, controlName) => {
        let errorMessage = null;
        
        if (event.target.value.length < this.state.controls[controlName].validation.minLength && event.target.value.length>0) {
            errorMessage = <p style={{"color": "#f7716d"}} className="errorMsg">{this.state.controls[controlName].elementConfig.placeholder} must be at least {this.state.controls[controlName].validation.minLength} characters!</p>;
            this.setState({errorMsg: errorMessage});
        };
        
        if (controlName == "username") {
            if (event.target.value.length > this.state.controls[controlName].validation.maxLength) {
                errorMessage = <p style={{"color": "#f7716d"}} className="errorMsg">Usernames must be {this.state.controls[controlName].validation.maxLength} characters or less!</p>;
            }
            this.setState({errorMsg: errorMessage});
        }
        
        if (controlName == "repeatPassword") {
            if (event.target.value != this.state.controls["password"].value) {
                errorMessage = <p style={{"color": "#f7716d"}} className="errorMsg">Passwords don't match!</p>;
            }
            this.setState({errorMsg: errorMessage});
        }
    };

    checkValidityAll = () => {
        let errorMessage = null;
        
        // check username is between 3 and 25 characters
        if (this.state.controls.username.value.length < this.state.controls.username.validation.minLength )
        {
            errorMessage = <p style={{"color": "#f7716d"}} className="errorMsg">Usernames must be at least {this.state.controls.username.validation.minLength} characters!</p>;
        } else if (this.state.controls.username.value.length > this.state.controls.username.validation.maxLength )
        {
            errorMessage = <p style={{"color": "#f7716d"}} className="errorMsg">Usernames must be {this.state.controls.username.validation.maxLength} characters or less!</p>;
        }
        
        // check password is more than 6 characters
        if (this.state.controls.password.value.length < this.state.controls.password.validation.minLength )
        {
            errorMessage = <p style={{"color": "#f7716d"}} className="errorMsg">Password must be at least {this.state.controls.password.validation.minLength} characters!</p>;
        }
        
        // check the repeat password is the same as the password field
        if (this.state.controls.password.value != this.state.controls.repeatPassword.value )
        {
            errorMessage = <p style={{"color": "#f7716d"}} className="errorMsg">Passwords don't match!</p>;
        }
        this.setState({errorMsg: errorMessage});
        if (errorMessage == null) {
            axios.post('/checkUsername', {username: this.state.controls.username.value}).then(res => {
                if (res.data.response == "username available") {
                    this.props.onAuth(this.state.controls.email.value, this.state.controls.password.value, true, this.state.controls.username.value);
                } else {
                    errorMessage = <p style={{"color": "#f7716d"}} className="errorMsg">Username is not available</p>;
                }
                this.setState({errorMsg: errorMessage});                                                                           
            }) 
        }
        
    }

    checkFormBlanks = () => {
        let errorMessage = null;
        if (this.state.controls.emailvalue == '' || this.state.controls.password.value == '' || this.state.controls.repeatPassword.value == '' || this.state.controls.username.value == '') {
            errorMessage = <p style={{"color": "#f7716d"}} className="errorMsg">Not all required information has been completed!</p>
            this.setState({errorMsg: errorMessage})
            return false;
        } else {
            return true;
        }
    }
    
    changeInputHandler = (event, controlName) => {
        this.checkValidity(event,controlName);
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
        let noBlanks = this.checkFormBlanks();
        if (noBlanks) {
            this.checkValidityAll();
        }
    };
    
    render() {
        
        let authRedirect = null;
        if (this.props.isAuthenticated) {
            authRedirect = <Redirect to={this.props.authRedirectPath} />
        }
            
        let errorMsg = null;
        if (this.state.errorMsg) {
            errorMsg = this.state.errorMsg;
        }
        if (this.props.error) {
            errorMsg = <p>{this.props.error}</p>;
        }
            
                
        let spinner = null;
        if (this.props.loading) {
            spinner = <Spinner />
        }
        
        return (
            <div className="registerDiv">
                {authRedirect}
                <div className="registerSubDiv">
                    <h1>Create Account</h1>
                    <div className="registerFormDiv">
                        <form className="SignUp" onSubmit={this.submitHandler}>
                            <Input  type={this.state.controls.username.elementConfig.type} placeholder={this.state.controls.username.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "username")}/> <br/>
                            <Input  type={this.state.controls.email.elementConfig.type} placeholder={this.state.controls.email.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "email")}/> <br/>
                            <Input type={this.state.controls.password.elementConfig.type} placeholder={this.state.controls.password.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "password")}/> <br />
                            <Input type={this.state.controls.repeatPassword.elementConfig.type} placeholder={this.state.controls.repeatPassword.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "repeatPassword")}/> <br />
                            <button className='registerSubmitBtn'>Submit</button><br />
                            {errorMsg}
                        </form>
                        {spinner}
                    </div>
                    <div className="goToLoginDiv" style={{textAlign: "center"}}>  
                        <p>Already have an account?</p>
                        <NavLink to="/login" style={{textDecoration: "none"}}><button className="goToLoginBtn">Go To Login Page</button></NavLink>
                    </div>
                </div>
            </div>
        )
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onAuth: (email, password, isSignup, username) => dispatch(actions.auth(email, password, isSignup, username)),
        onSetAuthRedirectPath: () => dispatch(actions.setAuthRedirectPath('/profile')),
        onSignedIn: (token, userId) => dispatch(actions.authSuccess(token, userId)),
        clearErrorMsg: () => dispatch(actions.clearError())
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


export default connect(mapStateToProps, mapDispatchToProps)(Register);