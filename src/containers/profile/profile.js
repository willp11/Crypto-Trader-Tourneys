import React, {Component} from 'react';
import './profile.css';
import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';
import { NavLink, Redirect } from 'react-router-dom';
import axios from 'axios';
import {firebaseAuth} from "../../firebase/firebase";
import Spinner from "../../components/UI/Spinner/Spinner";

class Profile extends Component {
    
    state = {
        APIs: {
            FTX: {key: '', secret: ''}
        },
        updateAPIs: {
            FTX: {key: '', secret: ''}
        },
        invites: [],
        inviteToShowKey: null,
        enterBalance: false,
        invitationBalance: null,
        balance: '',
        inviteTourneyId: '',
        APIUpdatedMsg: '',
        showUpdatePassModal: false,
        newPassword: {password: '', repeat: ''},
        updatePassError: null,
        redirectToLogin: false,
        updatePassSuccess: false,
        showVerifyModal: false,
        emailVerified: false,
        emailSent: false,
        updatePassRepeatError: null,
        APIValidErr: null,
        updatingAPI: false,
        loadingApiInfo: true,
        usernameValidErr: null,
        newUsername: '',
        validUsername: true,
        loadingUsername: true
    }
    
    componentDidMount() {
        
        let user = firebaseAuth.currentUser;
        if (user) {
            // check the user is email verified - if not, show the modal
            if (user.emailVerified == false) {
                this.setState({showVerifyModal: true, emailVerified: false});
            } else if (user.emailVerified == true) {
                this.setState({showVerifyModal: false, emailVerified: true});
            }
            
            // call API to get username and email
            axios.post('/getUsernameEmail', {userId: user.uid}).then(res => {
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
            
            // get users API info
            axios.post('/getAPIInfo', {"userId": this.props.userId}).then(res => {
                this.setState({
                    APIs: {FTX: {key: res.data.FTX.key, secret: res.data.FTX.secret}},
                    loadingApiInfo: false
                });
                if (res.data.validity == "invalid") {
                    this.setState({APIValidErr: "Your API key and secret are not valid. Update them to enter tournaments."});
                }
            })
            
            // get users tourney invites
            axios.post('/getTourneyInvites',  {"userId": this.props.userId}).then(res => {
                this.setState({
                    invites: res.data.response
                });
            })
        }
    }
    
//    componentDidUpdate() {
//        console.log(this.state.APIs.FTX);
//    }
    
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
        this.setState({updatingAPI: true});
        axios.post('/updateAPI', APIData).then(res => {
            console.log(res.data);
            if (res.data.response == "success") {
                this.setState({APIUpdatedMsg: "API Updated Successfully", APIs: {FTX: {key: APIKey, secret: APISecret}}, updatingAPI: false, APIValidErr: null });
            } else if (res.data.response == "invalid") {
                this.setState({APIValidErr: "The API Key and Secret you entered were not valid.", updatingAPI: false});
            }
        })
    }
    
    updateAPI = () => {
        this.setState({updatingAPI: true});
    }
    
    updateApiCancel = () => {
        this.setState({updatingAPI: false});
    }
    
    declineInvitationHandler = (index) => {
        axios.post('/removeTourneyInvite', {"userId": this.props.userId, "tourneyId": this.state.invites[index].tourneyId}).then(res => {
            console.log(res.data);
            axios.post('/getTourneyInvites',  {"userId": this.props.userId}).then(res => {
                console.log(res.data);
                this.setState({
                    invites: res.data.response
                });
            })
        })
    }
    
    acceptInvitationHandler = (tourneyId) => {
        this.setState({enterBalance: true, inviteTourneyId: tourneyId});
    }
    
    cancelAcceptInvitationHandler = () => {
        this.setState({enterBalance: false});
    }
    
    inputBalanceHandler = (event) => {
        this.setState({balance: event.target.value});
    }
    
    submitAcceptInvitationHandler = (tourneyId) => {
        
        let data = {
            "tourneyId": tourneyId,
            "userId": this.props.userId,
            "username": this.props.username,
            "balance": this.state.balance
        }
        
        let invites = [...this.state.invites];
        let newInvites = [];
        
        console.log(invites);
        
        for (let i=0; i<invites.length; i++) {

            if (invites[i].tourneyId == tourneyId) {
                console.log("match");
                newInvites = invites.splice[i, 1];
            }
        }
        
        this.setState({invites: newInvites, enterBalance: false});
        
        axios.post('/tourneyRegistration', data).then(res => {
            console.log(res.data);
            axios.post('/removeTourneyInvite', {"userId": this.props.userId, "tourneyId": tourneyId}).then(res => {
                console.log(res.data);
            });
        });   
    }
    
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
            let user = firebaseAuth.currentUser;

            user.updatePassword(this.state.newPassword.password).then((res)=>{
                // update successful
                console.log("Password changed");
                this.setState({updatePassSuccess: true})
            }).catch((error)=> {
                // An error happened.
                console.log(error);
                if (error.code == "auth/requires-recent-login") {
                    // update the modal to show the error message with a link to the login page
                    this.setState({updatePassError: error.message});
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
            console.log("email sent");
            this.setState({emailSent: true});
        }).catch(error => {
            console.error(error);
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
            axios.post('/createUser', {userId: this.props.userId, username: this.state.newUsername, email: email}).then(res => {
                let response = res.data.response;
                console.log(response);
                if (response == "success") {
                    this.props.setUsernameEmail(this.state.newUsername, email);
                    this.setState({validUsername: true, loadingUpdateUsername: false, newUsername: ""});
                } else if (response == "username not available" ) {
                    this.setState({validUsername: false, loadingUpdateUsername: false, usernameValidErr: "Username is not available", newUsername: ""});
                } else {
                    this.setState({validUsername: false, loadingUpdateUsername: false, usernameValidErr: "Invalid username", newUsername: ""});
                }

            }).catch(error => {
                console.error(error);
            });
        }
    }
    
    render () {
        
        let redirect = null;
        if (this.state.redirectToLogin || this.state.authFail) {
            redirect = <Redirect to="/login" />
        }
        
        let updatePassErrMsg = null;
        if (this.state.updatePassRepeatError) 
        {
            updatePassErrMsg = (
                <p style={{"color": "#f7716d"}}>{this.state.updatePassRepeatError}</p>
            );
        }
        let updatePassModal = null;
        if (this.state.showUpdatePassModal) {
            updatePassModal = (
                <div className="darkBg">
                    <div className="updatePassModal">
                        <h2>Update Password</h2>
                        <input className="updatePassInput" type="password" placeholder="Enter Password" onChange={(event)=>this.updatePassInputHandler(event, "password")}/> <br/>
                        <input className="updatePassInput" type="password" placeholder="Repeat Password" onChange={(event)=>this.updatePassInputHandler(event, "repeat")}/> <br/>
                        <button className="resetBtn" onClick={this.hidePassModalHandler}>Cancel</button>
                        <button className="submitBtn" onClick={this.updatePassword}>Confirm</button>
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
        
        let acceptInvitation = (
            <button className="yesBtn" onClick={this.acceptInvitationHandler}>Yes</button>
        );
        
        let invites = null;
        if (this.state.invites) {
            invites = this.state.invites.map((invite, index) => {
                let tourneyId=this.state.invites[index].tourneyId;
                let declineInvitation = <button className="noBtn" onClick={(i) => this.declineInvitationHandler(index)}>No</button>
                if (this.state.enterBalance == true) {
                    declineInvitation = null;
                    acceptInvitation = (
                        <div>
                            <button className="noBtn" onClick={this.cancelAcceptInvitationHandler}>Cancel</button>
                            <input value={this.state.balance} onChange={(event) => this.inputBalanceHandler(event)} style={{"textAlign": "center"}} placeholder="Enter Starting Balance" />
                            <button className="yesBtn" onClick={(id) => this.submitAcceptInvitationHandler(tourneyId)}>Confirm</button>
                        </div>
                    );
                }
                return (
                    <tr key="index">
                        <td><NavLink style={{"color": "rgb(77, 134, 247)", "fontWeight": "bold"}} to={"/tourneys/"+tourneyId}>{invite.tourneyId}</NavLink></td>
                        <td>{invite.host}</td>
                        <td>
                            {declineInvitation}
                            {acceptInvitation}
                        </td>
                    </tr>
                );
            })
        }
        
        let APIUpdatedMsg = null;
        if (this.state.APIUpdatedMsg) {
            APIUpdatedMsg = <p style={{"color": "#57eb7e", "fontWeight": "bold"}}>{this.state.APIUpdatedMsg}</p>
        }
        
        let APIInvalidErr = null;
        if (this.state.APIValidErr) {
            APIInvalidErr = <p style={{"color": "#f7716d"}}>{this.state.APIValidErr}</p>
        }
        
        let verifyEmailMsg = <p>Please check your email address and click the link to confirm your registration. If you have already verified and still see this message, please reload the page.</p> ;
        if (this.state.emailSent) verifyEmailMsg = <p>E-mail sent. Please click the link to confirm your registration.</p> ;
        
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

        if (this.state.loadingApiInfo) {
            apiDiv = <Spinner />
        }
        
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

        let verifyEmailBtn = null;
        if (this.state.emailVerified == false) {
            verifyEmailBtn = <button onClick={this.showVerifyModal}>Verify Email</button>
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
                            <p>{this.props.email}</p>
                            {verifyEmailBtn}
                            <h2>VIP level</h2>
                            <p>Gold (level 3)</p>
                            <h2>Update Password</h2>
                            <button className="updatePassBtn" onClick={this.showPassModalHandler}>Update Password</button>
                            <div>
                                <h2>APIs</h2>
                                <p style={{"fontSize": "0.8rem"}}>To register for trading tournaments you need to link your exchange API to your Crypto Tourneys account. Currently the only supported exchange is FTX.</p>
                                <p style={{"fontSize": "0.8rem"}}><b>IMPORTANT:</b> For security reasons, create a <b>Read-only</b> API key to ensure the API key cannot be used to access funds in your account or place trades from your account.</p>
                                {apiDiv}
                            </div>
                            <div>
                                <h2>Invitations</h2>
                                <table className="invitesTable">
                                    <thead>
                                        <tr>
                                            <th>Tournament id</th>
                                            <th>Host</th>
                                            <th>Response</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invites}
                                    </tbody>
                                </table>
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