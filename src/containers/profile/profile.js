import React, {Component} from 'react';
import './profile.css';
import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';
import { NavLink, Redirect } from 'react-router-dom';
import axios from 'axios';
import {firebaseAuth} from "../../firebase/firebase";
import Spinner from "../../components/UI/Spinner/Spinner";
import NavBottom from "../../components/navigation/nav-bottom/nav-bottom";

class Profile extends Component {
    
    state = {
        APIs: {
            FTX: {key: '', secret: ''}
        },
        updateAPIs: {
            FTX: {key: '', secret: ''}
        },
        APIUpdatedMsg: '',
        showUpdatePassModal: false,
        newPassword: {password: '', repeat: ''},
        updatePassError: null,
        redirectToLogin: false,
        updatePassSuccess: false,
        showVerifyModal: false,
        email: '',
        emailVerified: false,
        emailSent: false,
        updatePassRepeatError: null,
        APIValidErr: null,
        updatingAPI: false,
        loadingApiInfo: true,
        loadingAPIErr: null,
        usernameValidErr: null,
        newUsername: '',
        validUsername: true,
        loadingUsername: true,
        loadingUpdateAPI: false,
        passChangeLoading: false,
        tourneyRegisterErr: false,
        tourneyRegisterErrMsg: null
    }
    
    componentDidMount() {
        
        let user = firebaseAuth.currentUser;
        if (user) {
            this.setState({email: user.email});
            // check the user is email verified - if not, show the modal
            if (user.emailVerified == false) {
                this.setState({showVerifyModal: true, emailVerified: false});
            } else if (user.emailVerified == true) {
                this.setState({showVerifyModal: false, emailVerified: true});
            }
            
            if (!this.props.username) {
                // call API to get username and email
                axios.post('/api/getUsernameEmail', {userId: user.uid}).then(res => {
                    this.setState({loadingUsername: false});
                    let username = res.data.response.username;
                    if (username) {
                        this.props.setUsernameEmail(username, user.email);
                        this.props.updateUserIdToken(user.uid, user.xa);
                    } else {
                        this.setState({validUsername: false});
                    }

                }).catch(error => {
                    this.setState({error: error});
                })
            }
            
            // get users API info
            axios.post('/api/getAPIInfo', {"userId": this.props.userId}).then(res => {
                this.setState({
                    APIs: {FTX: {key: res.data.FTX.key, secret: res.data.FTX.secret}},
                    loadingApiInfo: false
                });
                if (res.data.validity == "invalid") {
                    this.setState({APIValidErr: "Your API key and secret are not valid. Update them to enter tournaments."});
                }
            }).catch(error => {
                this.setState({loadingApiInfo: false, loadingAPIErr: "There was a problem loading your API information."});
            })
        }
    }
    
    // UPDATE API HANDLERS
    inputChangeHandler = (event, exchange, field) => {
        let newState = {...this.state.updateAPIs};
        newState[exchange][field] = event.target.value;
        this.setState(newState);
    }
    
    submitHandler = (exchange) => {
        
        let APIKey = this.state.updateAPIs[exchange].key;
        let APISecret = this.state.updateAPIs[exchange].secret;

        let APIData = {"userId": this.props.userId, 
                        "exchange": exchange, 
                        "APIKey": this.state.updateAPIs[exchange].key, 
                        "APISecret": this.state.updateAPIs[exchange].secret};
        this.setState({loadingUpdateAPI: true});
        axios.post('/api/updateAPI', APIData).then(res => {
            if (res.data.response == "success") {
                this.setState({APIUpdatedMsg: "API Updated Successfully", APIs: {FTX: {key: APIKey, secret: APISecret}}, updatingAPI: false, APIValidErr: null, loadingUpdateAPI: false });
            } else if (res.data.response == "invalid") {
                this.setState({APIValidErr: "The API Key and Secret you entered were not valid.", updatingAPI: false, loadingUpdateAPI: false});
            }
        })
    }
    
    updateAPI = () => {
        this.setState({updatingAPI: true});
    }
    
    updateApiCancel = () => {
        this.setState({updatingAPI: false});
    }
    
    // CHANGE PASSWORD HANDLERS
    showPassModalHandler = () => {
        this.setState({showUpdatePassModal: true});
    }
    
    hidePassModalHandler = () => {
        this.setState({showUpdatePassModal: false});
        this.setState({updatePassSuccess: false});
    }
    
    updatePassInputHandler = (event, field) => {
        let newPassword = {...this.state.newPassword};
        newPassword[field] = event.target.value;
        this.setState({newPassword: newPassword});
    }
    
    updatePassword = () => {
        
        if (this.state.newPassword.password != this.state.newPassword.repeat) {
            this.setState({updatePassRepeatError: "Repeat password does not match!"});
        } else if (this.state.newPassword.password.length < 6) {
            this.setState({updatePassRepeatError: "Passwords must have a length of 6 more characters!"});
        } else {      
            this.setState({passChangeLoading: true});
            let user = firebaseAuth.currentUser;
            user.updatePassword(this.state.newPassword.password).then((res)=>{
                // update successful
                this.setState({updatePassSuccess: true, passChangeLoading: false})
            }).catch((error)=> {
                // An error happened.
                if (error.code == "auth/requires-recent-login") {
                    // update the modal to show the error message with a link to the login page
                    this.setState({updatePassError: error.message, passChangeLoading: false});
                    // user clicks link to login page, then logout the user and redirect to login page
                }
            });
        }
            
    }
    
    redirectToLoginHandler = () => {
        this.props.onLogout();
        this.setState({redirectToLogin: true});
    }
    
    showVerifyModal = () => {
        this.setState({showVerifyModal: true});
        let user = firebaseAuth.currentUser;
        user.reload();
    }
    
    hideVerifyModal = () => {
        this.setState({showVerifyModal: false});
        let user = firebaseAuth.currentUser;
        user.reload();
    }
    
    sendVerificationEmail = () => {
        firebaseAuth.currentUser.sendEmailVerification().then(() => {
            this.setState({emailSent: true});
        }).catch(error => {
            
        })
    }
    
    updateUsernameInputHandler = (event) => {
        let username = event.target.value;
        this.checkUsernameValid(username);
        this.setState({newUsername: username});
    }
    
    checkUsernameValid = (username) => {
        if (username.length < 3) {
            this.setState({usernameValidErr: "Username must be at least 3 characters."});
            return false;
        } else if (username.length > 25) {
            this.setState({usernameValidErr: "Username must be no longer than 25 characters."});
            return false;
        } else {
            this.setState({usernameValidErr: null});
            return true;
        }
    }
    
    updateUsernameSubmitHandler = (event) => {
        event.preventDefault();
        if (this.checkUsernameValid(this.state.newUsername)) {
            this.setState({loadingUpdateUsername: true});
            let user = firebaseAuth.currentUser
            let email = user.email;
            axios.post('/api/createUser', {userId: this.props.userId, username: this.state.newUsername, email: email}).then(res => {
                let response = res.data.response;
                if (response == "success") {
                    this.props.setUsernameEmail(this.state.newUsername, email);
                    this.setState({validUsername: true, loadingUpdateUsername: false, newUsername: ""});
                } else if (response == "username not available" ) {
                    this.setState({validUsername: false, loadingUpdateUsername: false, usernameValidErr: "Username is not available", newUsername: ""});
                } else {
                    this.setState({validUsername: false, loadingUpdateUsername: false, usernameValidErr: "Invalid username", newUsername: ""});
                }

            }).catch(error => {

            });
        }
    }
    
    render () {
        
        let redirect = null;
        if (this.state.redirectToLogin || this.state.authFail) {
            redirect = <Redirect to="/login" />
        }
        
        // UPDATE PASSWORD
        let updatePassErrMsg = null;
        if (this.state.updatePassRepeatError) 
        {
            updatePassErrMsg = (
                <p style={{"color": "#f7716d"}}>{this.state.updatePassRepeatError}</p>
            );
        }
        let updatePassModal = null;
        let updatePassSpinner = null;
        let updatePassBtns = (
                                <div>
                                    <button className="resetBtn" onClick={this.hidePassModalHandler}>Cancel</button>
                                    <button className="submitBtn" onClick={this.updatePassword}>Confirm</button>
                                </div>
                              );
            
        if (this.state.passChangeLoading) {
            updatePassSpinner = <Spinner />
            updatePassBtns = null;
        }
        if (this.state.showUpdatePassModal) {
            updatePassModal = (
                <div className="darkBg">
                    <div className="updatePassModal">
                        <h2>Update Password</h2>
                        <input className="updatePassInput" type="password" placeholder="Enter Password" onChange={(event)=>this.updatePassInputHandler(event, "password")}/> <br/>
                        <input className="updatePassInput" type="password" placeholder="Repeat Password" onChange={(event)=>this.updatePassInputHandler(event, "repeat")}/> <br/>
                        {updatePassBtns}
                        {updatePassSpinner}
                        {updatePassErrMsg}
                    </div>
                </div>
            )
        }
        

        if (this.state.updatePassError) {
            updatePassModal = (
                <div className="darkBg">
                    <div className="updatePassModal">
                        <p style={{"color": "#f7716d"}}>{this.state.updatePassError}</p>
                        <button className="passModalBtns" onClick={this.redirectToLoginHandler}>Go to Login Page</button>
                    </div>
                </div>
            )
        }
        
        if (this.state.updatePassSuccess) {
            updatePassModal = (
                <div className="darkBg">
                    <div className="updatePassModal">
                        <p style={{"color": "#57eb7e"}}>Password change successful!</p>
                        <button className="passModalBtns" onClick={this.hidePassModalHandler}>Close</button>
                    </div>
                </div>
            )
        }
        
        let content = (
            <Redirect to="/login" />
        );
        
        // UPDATE API    
        let APIUpdatedMsg = null;
        if (this.state.APIUpdatedMsg) {
            APIUpdatedMsg = <p style={{"color": "#57eb7e", "fontWeight": "bold"}}>{this.state.APIUpdatedMsg}</p>
        }
        
        let APIInvalidErr = null;
        if (this.state.APIValidErr) {
            APIInvalidErr = <p style={{"color": "#f7716d"}}>{this.state.APIValidErr}</p>
        }
        
        let verifyEmailMsg = <p>Please check your email address and click the link to confirm your registration. If you have already verified and still see this message, please refresh the page.</p>;
        if (this.state.emailSent) verifyEmailMsg = <p>E-mail sent. Please click the link to confirm your registration.</p>;
        
        let verifyEmailModal = null;
        if (this.state.showVerifyModal) 
        {
            verifyEmailModal = (
                <div className="darkBg">
                    <div className="verifyEmailModal">
                        <h2>Verify Email</h2>
                        {verifyEmailMsg}
                        <button className="resetBtn" onClick={this.hideVerifyModal}>Close</button>
                        <button className="submitBtn" onClick={this.sendVerificationEmail}>Re-send Email</button>
                    </div>
                </div>
            );
        }
        
        let apiKey = <p>No API Key Found</p>
        let apiSecret = <p>No API Secret Found</p>

        if (this.state.APIs.FTX.key != '' && this.state.APIs.FTX.key != null) {
            apiKey = <p>{this.state.APIs.FTX.key}</p>
        }
        if (this.state.APIs.FTX.secret != '' && this.state.APIs.FTX.secret != null) {
            apiSecret = <p>{this.state.APIs.FTX.secret}</p>
        }
        
        let apiDiv = (
            <div className="apiDiv">
                <div className="apiKeySecret">
                    <h3>API Key</h3>
                    {apiKey}
                </div>
                <div className="apiKeySecret">
                    <h3>API Secret</h3>
                    {apiSecret}
                </div>
                <button className="updateAPIbtn" onClick={this.updateAPI}>Update API</button>
                {APIInvalidErr}
                {APIUpdatedMsg}
            </div>
        );
        
        if (this.state.updatingAPI) {
            apiDiv = (
                <div className="apiDiv">
                    <h3>API Key</h3>
                    <input className="apiInput" type="text" placeholder="FTX API Key" onChange={(event, exchange, field) => this.inputChangeHandler(event, "FTX", "key")} /> <br />
                    <h3>API Secret</h3>
                    <input className="apiInput" type="text" placeholder="FTX API Secret" onChange={(event, exchange, field) => this.inputChangeHandler(event, "FTX", "secret")} /> <br />
                    <div style={{"marginTop": "10px"}}>
                        <button className="resetBtn" onClick={this.updateApiCancel}>Cancel</button>
                        <button className="submitBtn" onClick={(exchange) => this.submitHandler("FTX")}>Submit</button>
                    </div>
                </div>
            );
        }
        
        if (this.state.loadingApiInfo || this.state.loadingUpdateAPI) {
            apiDiv = <Spinner />
        }
            
        if (this.state.loadingAPIErr) {
            apiDiv = (
                <p style={{"color": "#f7716d", "fontWeight": "bold"}}>{this.state.loadingAPIErr}</p>
            );
        }

        let verifyEmailBtn = null;
        if (this.state.emailVerified == false) {
            verifyEmailBtn = <button className="verifyEmailBtn" onClick={this.showVerifyModal}>Verify Email</button>
        }
            
        let username = (
            <p>{this.props.username}</p>
        );
            
        if (this.state.loadingUsername) {
            username = <Spinner />
        }

        let usernameDiv = (
            <div>
                <h2>Username:</h2>
                <p>{this.props.username}</p>
            </div>
        );
        
        let updateUsernameSpinner = null;
        if (this.state.loadingUpdateUsername) {
            updateUsernameSpinner = <Spinner />
        }
        
        let updatingUsernameModal = null;
        if (this.state.updatingUsername || !this.state.validUsername) {
            // show update username modal
            updatingUsernameModal = (
                <div className="darkBg">
                    <div className="updateUsernameModal">
                        <h2>Update Username</h2>
                        <input style={{"marginBottom": "10px", "textAlign": "center"}} placeholder="Enter Username" onChange={(event)=>this.updateUsernameInputHandler(event)}/><br/>
                        <button className="submitBtn" onClick={(event)=>this.updateUsernameSubmitHandler(event)}>Submit</button>
                        <p>{this.state.usernameValidErr}</p>
                        {updateUsernameSpinner}
                    </div>
                </div>
            )
        }
        
        if (this.props.userId) {
            content = (
                <div className="profileDiv">
                    <div className="profileSubDiv">
                        <h1>Account</h1>
                        <div className="profilePanel">
                            {usernameDiv}
                            <h2>Email:</h2>
                            <p>{this.state.email}</p>
                            {verifyEmailBtn}
                            <h2>Update Password</h2>
                            <button className="updatePassBtn" onClick={this.showPassModalHandler}>Update Password</button>
                            <div>
                                <h2>APIs</h2>
                                <p style={{"fontSize": "0.8rem"}}>To register for trading tournaments you need to link your exchange API to your Crypto Tourneys account. Currently the only supported exchange is FTX.</p>
                                <p style={{"fontSize": "0.8rem"}}><b>IMPORTANT:</b> For security reasons, create a <b>Read-only</b> API key to ensure the API key cannot be used to access funds in your account or place trades from your account.</p>
                                {apiDiv}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        
        return (
            <div>
                {redirect}
                {verifyEmailModal}
                {updatePassModal}
                {updatingUsernameModal}
                {content}
                <NavBottom />
            </div>
        )
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        onLogout: () => dispatch(actions.logout()),
        updateUserIdToken: (userId, token) => dispatch(actions.updateUserIdToken(userId, token)),
        setUsernameEmail: (username, email) => dispatch(actions.setUsernameEmail(username, email))
    }
};

const mapStateToProps = (state) => {
    return {
        userId: state.auth.userId,
        username: state.auth.username,
        email: state.auth.email
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);