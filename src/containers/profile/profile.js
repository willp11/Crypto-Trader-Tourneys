import React, {Component} from 'react';
import './profile.css';
import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';
import { NavLink, Redirect } from 'react-router-dom';
import axios from 'axios';
import {firebaseAuth} from "../../firebase/firebase";

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
        updatePassRepeatError: null
    }
    
    componentDidMount() {
        
        let user = firebaseAuth.currentUser;
        if (user) {
            user.reload();
            console.log(user.emailVerified);
            if (user.emailVerified == false) {
                this.setState({showVerifyModal: true, emailVerified: false});
            } else if (user.emailVerified == true) {
                this.setState({showVerifyModal: false, emailVerified: true});
            }
        }
        
        if (this.props.userId) {
            this.props.getUsernameEmail(this.props.userId);
            this.props.getMyTourneys(this.props.userId);
            axios.post('/getAPIInfo', {"userId": this.props.userId}).then(res => {
                console.log(res.data);
                this.setState({
                    APIs: {FTX: {key: res.data.FTX.key, secret: res.data.FTX.secret}}
                });
            })
            axios.post('/getTourneyInvites',  {"userId": this.props.userId}).then(res => {
                console.log(res.data);
                this.setState({
                    invites: res.data.response
                });
            })
        } 
        
    }
    
    inputChangeHandler = (event, exchange, field) => {
        let newState = {...this.state.updateAPIs};
        newState[exchange][field] = event.target.value;
        this.setState(newState);
    }
    
    submitHandler = (exchange, field) => {
        
        let APIKey = this.state.APIs[exchange].key;
        let APISecret = this.state.APIs[exchange].secret;
        if (field = "key") {
            APIKey = this.state.updateAPIs[exchange].key;
        } else if (field = "secret") {
            APISecret = this.state.updateAPIs[exchange].secret;
        }
        let APIData = {"userId": this.props.userId, 
                        "exchange": exchange, 
                        "fieldToUpdate": field, 
                        "APIKey": this.state.updateAPIs[exchange].key, 
                        "APISecret": this.state.updateAPIs[exchange].secret};
        axios.post('/updateAPI', APIData).then(res => {
            console.log(res.data);
            if (res.data.response == "success") {
                this.setState({APIUpdatedMsg: "API Updated Successfully", APIs: {FTX: {key: APIKey, secret: APISecret}} });
            }
        })
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
        
        if (this.state.newPassword.password == this.state.newPassword.repeat) {
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
        } else {
            this.setState({updatePassRepeatError: "Repeat password does not match!"});
        }
            
    }
    
    redirectToLoginHandler = () => {
        this.props.onLogout();
        this.setState({redirectToLogin: true});
    }
    
    showVerifyModal = () => {
        this.setState({showVerifyModal: true});
    }
    
    hideVerifyModal = () => {
        this.setState({showVerifyModal: false});
    }
    
    sendVerificationEmail = () => {
        firebaseAuth.currentUser.sendEmailVerification().then(() => {
            console.log("email sent");
            this.setState({emailSent: true});
        }).catch(error => {
            console.error(error);
        })
    }
    
    render () {
        
        let redirect = null;
        if (this.state.redirectToLogin) {
            redirect = <Redirect to="/login" />
        }
        
        let updatePassErrMsg = null;
        if (this.state.updatePassRepeatError) 
        {
            updatePassErrMsg = (
                <p>{this.state.updatePassRepeatError}</p>
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
                        <p>{this.state.updatePassError}</p>
                        <button className="passModalBtns" onClick={this.redirectToLoginHandler}>Go to Login Page</button>
                    </div>
                </div>
            )
        }
        
        if (this.state.updatePassSuccess) {
            updatePassModal = (
                <div className="darkBg">
                    <div className="updatePassModal">
                        <p>Password change successful!</p>
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
                            <input value={this.state.balance} onChange={(event) => this.inputBalanceHandler(event)} style={{"textAlign": "center"}} placeholder="Enter Balance" />
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
            APIUpdatedMsg = <p style={{"color": "#00897B", "fontWeight": "bold"}}>{this.state.APIUpdatedMsg}</p>
        }
        
        let verifyEmailMsg = <p>Please check your email address and click the link to confirm your registration.</p> ;
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

        let verifyEmailBtn = null;
        if (this.state.emailVerified == false) {
            verifyEmailBtn = <button onClick={this.showVerifyModal}>Verify Email</button>
        }
        
        if (this.props.userId) {
            content = (
                <div className="profileDiv">
                    <div className="profileSubDiv">
                        <h1>Account</h1>
                        <div className="profilePanel">
                            <h2>Username:</h2>
                            <p>{this.props.username}</p>
                            <h2>Email:</h2>
                            <p>{this.props.email}</p>
                            {verifyEmailBtn}
                            <h2>VIP level</h2>
                            <p>Gold (level 3)</p>
                            <h2>Update Password</h2>
                            <button className="updatePassBtn" onClick={this.showPassModalHandler}>Update Password</button>
                            <div>
                                <h2>APIs</h2>
                                <h3>FTX:</h3>
                                <input className="apiInput" type="text" placeholder={this.state.APIs.FTX.key ? this.state.APIs.FTX.key : "FTX API Key"} onChange={(event, exchange, field) => this.inputChangeHandler(event, "FTX", "key")} />
                                <button className="updateAPIbtn" onClick={(exchange, field) => this.submitHandler("FTX", "key")}>Update API Key</button><br/>
                                <input className="apiInput" type="text" placeholder={this.state.APIs.FTX.secret ? this.state.APIs.FTX.secret : "FTX API Secret"} onChange={(event, exchange, field) => this.inputChangeHandler(event, "FTX", "secret")} />
                                <button className="updateAPIbtn" onClick={(exchange, field) => this.submitHandler("FTX", "secret")}>Update API Secret</button>
                                {APIUpdatedMsg}
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
                {content}
            </div>
        )
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        onLogout: () => dispatch(actions.logout()),
        getUsernameEmail: (userId) => dispatch(actions.getUsernameEmail(userId)),
        getMyTourneys: (userId) => dispatch(actions.getMyTourneys(userId))
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