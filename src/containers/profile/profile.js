import React, {Component} from 'react';
import './profile.css';
import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';
import { NavLink, Redirect } from 'react-router-dom';
import axios from 'axios';

class Profile extends Component {
    
    state = {
        APIs: {
            FTX: {key: '', secret: ''}
        },
        invites: [],
        inviteToShowKey: null,
        enterBalance: false,
        invitationBalance: null,
        balance: '',
        inviteTourneyId: '',
        APIUpdatedMsg: ''
    }
    
    componentDidMount() {
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
        
    componentDidUpdate() {
        //console.log(this.state.APIs);
    }
    
    inputChangeHandler = (event, exchange, field) => {
        let newState = {...this.state.APIs};
        newState[exchange][field] = event.target.value;
        this.setState(newState);
    }
    
    submitHandler = (exchange, field) => {
        
        axios.post('/updateAPI', {"userId": this.props.userId, 
                                    "exchange": exchange, 
                                    "fieldToUpdate": field, 
                                    "APIKey": this.state.APIs[exchange].key, 
                                    "APISecret": this.state.APIs[exchange].secret}
        ).then(res => {
            console.log(res.data);
            if (res.data.response == "success") {
                this.setState({APIUpdatedMsg: "API Updated Successfully"});
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
    
    render () {
        
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
        
        if (this.props.userId) {
            content = (
                <div className="profileDiv">
                    <div className="profileSubDiv">
                        <h1>My Account</h1>
                        <div className="profilePanel">
                            <h2>Username:</h2>
                            <p>{this.props.username}</p>
                            <h2>Email:</h2>
                            <p>{this.props.email}</p>
                            <div>
                                <h2>APIs</h2>
                                <div>
                                    <h3>FTX:</h3>
                                    <input className="apiInput" type="text" placeholder={this.state.APIs.FTX.key ? this.state.APIs.FTX.key : "FTX API Key"} onChange={(event, exchange, field) => this.inputChangeHandler(event, "FTX", "key")} />
                                    <button className="updateAPIbtn" onClick={(exchange, field) => this.submitHandler("FTX", "key")}>Update API Key</button><br/>
                                    <input className="apiInput" type="text" placeholder={this.state.APIs.FTX.secret ? this.state.APIs.FTX.secret : "FTX API Secret"} onChange={(event, exchange, field) => this.inputChangeHandler(event, "FTX", "secret")} />
                                    <button className="updateAPIbtn" onClick={(exchange, field) => this.submitHandler("FTX", "secret")}>Update API Secret</button>
                                    {APIUpdatedMsg}
                                </div>
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
                {content}
            </div>
        )
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
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