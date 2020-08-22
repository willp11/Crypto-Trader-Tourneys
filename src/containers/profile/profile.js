import React, {Component} from 'react';
import './profile.css';
import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';
import { NavLink, Redirect } from 'react-router-dom';
import axios from 'axios';

class Profile extends Component {
    
    state = {
        API1: '',
        API2: '',
        API3: '',
        invites: [],
        inviteToShowKey: null,
        enterBalance: false,
        invitationBalance: null,
        balance: '',
        inviteTourneyId: ''
    }
    
    componentDidMount() {
        if (this.props.userId) {
            this.props.getUsernameEmail(this.props.userId);
            this.props.getMyTourneys(this.props.userId);
            axios.post('/getAPIInfo', {"userId": this.props.userId}).then(res => {
                console.log(res.data);
                this.setState({
                    API1: res.data.API1,
                    API2: res.data.API2,
                    API3: res.data.API3
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
    
    inputChangeHandler = (event, API) => {
        let APIKey = event.target.value;
        let newState = {};
        newState[API] = APIKey;
        this.setState(newState);
    }
    
    submitHandler = (API) => {
        console.log(this.state);
        
        axios.post('/updateAPI', {"userId": this.props.userId, "API": API, "APIKey": this.state[API]}).then(res => {
            console.log(res.data);
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
            <button onClick={this.acceptInvitationHandler}>Yes</button>
        );
        
        let invites = null;
        if (this.state.invites) {
            invites = this.state.invites.map((invite, index) => {
                let tourneyId=this.state.invites[index].tourneyId;
                if (this.state.enterBalance == true) {
                    acceptInvitation = (
                        <div>
                            <button onClick={this.cancelAcceptInvitationHandler}>Cancel</button>
                            <input value={this.state.balance} onChange={(event) => this.inputBalanceHandler(event)} style={{"textAlign": "center"}} placeholder="Enter Balance" />
                            <button onClick={(id) => this.submitAcceptInvitationHandler(tourneyId)}>Confirm</button>
                        </div>
                    );
                }
                return (
                    <tr key="index">
                        <td><NavLink to={"/tourneys/"+tourneyId}>{invite.tourneyId}</NavLink></td>
                        <td>{invite.host}</td>
                        <td>
                            <button onClick={(i) => this.declineInvitationHandler(index)}>No</button>
                            {acceptInvitation}
                        </td>
                    </tr>
                );
            })
        }
        
        if (this.props.userId) {
            content = (
                <div>
                    <h1>My Account</h1>
                    <h2>Username:</h2>
                    <p>{this.props.username}</p>
                    <h2>Email:</h2>
                    <p>{this.props.email}</p>
                    <div>
                        <h2>APIs</h2>
                        <div>
                            <h3>FTX:</h3>
                            <input type="text" placeholder={this.state.API2 ? this.state.API2 : "FTX API Key"} onChange={(event, API) => this.inputChangeHandler(event, "API2")} />
                            <button onClick={(API) => this.submitHandler("API2")}>Update API Key</button>
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