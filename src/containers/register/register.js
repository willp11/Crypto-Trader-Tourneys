import React, {Component} from 'react';
import Input from '../../components/UI/Input/Input';
import './register.css';
import { NavLink, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

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

    checkValidity = (event, controlName) => {
        let errorMessage = null;
        
        if (event.target.value.length < this.state.controls[controlName].validation.minLength && event.target.value.length>0) {
            errorMessage = <p className="errorMsg">{this.state.controls[controlName].elementConfig.placeholder} must be at least {this.state.controls[controlName].validation.minLength} characters!</p>;
        };
        
        if (controlName == "username") {
            if (event.target.value.length > this.state.controls[controlName].validation.maxLength) {
                errorMessage = <p className="errorMsg">Usernames must be less than {this.state.controls[controlName].validation.maxLength} characters!</p>;
            }
        }
        
        if (controlName == "repeatPassword") {
            if (event.target.value != this.state.controls["password"].value) {
                errorMessage = <p className="errorMsg">Passwords don't match!</p>;
            }
        }
        
        this.setState({errorMsg: errorMessage});
    };

    checkFormBlanks = () => {
        let errorMessage = null;
        if (this.state.controls.email.value == '' || this.state.controls.password.value == '' || this.state.controls.repeatPassword.value == '' || this.state.controls.username.value == '') {
            errorMessage = <p className="errorMsg">Not all required information has been completed!</p>
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
             if (this.state.errorMsg === null) {
                this.props.onAuth(this.state.controls.email.value, this.state.controls.password.value, true, this.state.controls.username.value);
            }
        }
        
    };
    
    render() {
        
        let authRedirect = null;
        if (this.props.isAuthenticated) {
            authRedirect = <Redirect to={this.props.authRedirectPath} />
        }
        
        return (
            <div>
                {authRedirect}
                <div>
                    <h1>Sign Up</h1>
                    <form className="SignUp" onSubmit={this.submitHandler}>
                        <Input  type={this.state.controls.username.elementConfig.type} placeholder={this.state.controls.username.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "username")}/> <br/>
                        <Input  type={this.state.controls.email.elementConfig.type} placeholder={this.state.controls.email.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "email")}/> <br/>
                        <Input type={this.state.controls.password.elementConfig.type} placeholder={this.state.controls.password.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "password")}/> <br />
                        <Input type={this.state.controls.repeatPassword.elementConfig.type} placeholder={this.state.controls.repeatPassword.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "repeatPassword")}/> <br />
                        <button>Submit</button><br />
                        {this.state.errorMsg}
                        {this.props.error}
                    </form>
                    <div style={{textAlign: "center"}}>  
                        <p>Already have an account?</p>
                        <NavLink to="/login" style={{textDecoration: "none"}}><button>Go To Login Page</button></NavLink>
                    </div>
                </div>
            </div>
        )
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onAuth: (email, password, isSignup, username) => dispatch(actions.auth(email, password, isSignup, username)),
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


export default connect(mapStateToProps, mapDispatchToProps)(Register);