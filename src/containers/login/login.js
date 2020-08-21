import React, {Component} from 'react';
import Input from '../../components/UI/Input/Input';
import { connect } from 'react-redux';
import { NavLink, Redirect } from 'react-router-dom';
import './login.css';

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
        errorMsg: null
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

    render () {
        
        let authRedirect = null;
        if (this.props.isAuthenticated) {
            authRedirect = <Redirect to={this.props.authRedirectPath} />
        }
        
        return (
            <div>
                {authRedirect}
                <h1>Login</h1>
                <form className="Login" onSubmit={this.submitHandler}>
                    <Input  type={this.state.controls.email.elementConfig.type} placeholder={this.state.controls.email.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "email")}/> <br/>
                    <Input type={this.state.controls.password.elementConfig.type} placeholder={this.state.controls.password.elementConfig.placeholder} changed={(event)=>this.changeInputHandler(event, "password")}/> <br />
                    <button onClick={this.submitHandler}>Submit</button><br/>
                    {this.state.errorMsg}
                    {this.props.error}
                </form>
                <div style={{textAlign: "center"}}>  
                    <p>Don't have an account yet?</p>
                    <NavLink to="/register" style={{textDecoration: "none"}}><button>Go To Sign-up Page</button></NavLink>
                </div>
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