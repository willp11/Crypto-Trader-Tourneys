import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from 'axios';
import {firebaseAuth, firebaseDB} from "../../firebase/firebase";
import './tourney.css';
import * as actions from '../../store/actions/index';
import {Redirect} from 'react-router-dom';
import Spinner from '../../components/UI/Spinner/Spinner';

class Tourney extends Component {
    
    state = {
        tourneyId: this.props.match.params.tourneyId,
        host: null,
        isHost: false,
        noEntrants: null, 
        minEntrants: null,
        maxEntrants: null,
        startDate: null,
        endDate: null, 
        startTime: null,
        endTime: null, 
        entrants: [],
        entrantProfits: [],
        registered: false,
        products: null,
        showConfirmDelete: false,
        tourneyDeleted: false,
        active: null,
        editingBalance: false,
        quoteCurrency: null,
        balance: null,
        tourneyState: null,
        visibility: null,
        showVisibilityConfirm: false,
        addUser: '',
        addedUserMsg: '',
        showRegistrationConfirm: false,
        showUnRegistrationConfirm: false,
        balanceErrorMsg: null,
        searchEntrants: '',
        visibleEntrants: [],
        authFail: false,
        loading: true,
        editBalanceLoading: false,
        editVisibilityLoading: false,
        inviteUserLoading: false,
        deleteTourneyLoading: false,
        error: false,
        usernameErr: null,
        loadingUsername: false
    }

    componentDidMount() {
        console.log(this.props.match.params.tourneyId);
        console.log(this.props.username);
        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                if (user.emailVerified == false) {
                    this.setState({authFail: true});
                } else {
                    // call API to get username and email
                    axios.post('/getUsernameEmail', {userId: user.uid}).then(res => {
                        let username = res.data.response.username;
                        this.props.setUsernameEmail(username, user.email);
                        this.props.updateUserIdToken(user.uid, user.xa);
                        if (!username) {
                            this.setState({usernameErr: true});
                        }
                    }).catch(error => {
                        this.setState({error: error});
                    })
                    
                    // find which state the tournament is, registering/active/completed
                    // call the API and check which state the tourney is
                    axios.post('/getTourneyState', {"tourneyId": this.props.match.params.tourneyId} ).then(res => {
                        let tourneyState = res.data.response.state;
                        let hostId = res.data.response.hostId;
                        let visibility = res.data.response.visibility;
                        
                        if (user.uid == hostId) {
                            this.setState({isHost: true})
                        }
                        
                        this.setState({tourneyState: tourneyState});

                        // registering tournaments
                        if (tourneyState == "registering") {

                            axios.post('/getTourneyInfo', {"tourneyId": this.props.match.params.tourneyId} ).then(res => { 
                                let tourneyData = res.data;

                                let products = tourneyData.products;
                                let entrants = tourneyData.entrants.entrants;
                                let isRegistered = entrants.includes(this.props.username);
                                let entrantProfits = tourneyData.entrants.profits;

                                let entrantsObjs = [];
                                for (let i=0; i<entrants.length; i++) {
                                    let entrant = {username: entrants[i], rank: i+1, profit: entrantProfits[i]};
                                    entrantsObjs.push(entrant);
                                }

                                let balance = null;
                                if (isRegistered) {
                                    // if registered, get the entrant's balance
                                    axios.post('/getEntrantBalance', {"tourneyType": "registering", "tourneyId": this.state.tourneyId, "userId": user.uid}).then(res => {
                                        balance = res.data.balance;
                                        this.setState({host: tourneyData.host,
                                            noEntrants: tourneyData.noEntrants, 
                                            minEntrants: tourneyData.minEntrants,
                                            maxEntrants: tourneyData.maxEntrants,
                                            startDate: tourneyData.startDate,
                                            endDate: tourneyData.endDate,
                                            startTime: tourneyData.startTime,
                                            endTime: tourneyData.endTime,
                                            quoteCurrency: tourneyData.quoteCurrency,
                                            entrants: entrants,
                                            entrantsObjs: entrantsObjs,
                                            entrantProfits: entrantProfits,
                                            registered: isRegistered,
                                            products: products,
                                            balance: balance,
                                            active: false,
                                            visibility: tourneyData.visibility,
                                            visibleEntrants: entrantsObjs,
                                            loading: false
                                        });
                                    }).catch(err => {
                                        this.setState({error: true});
                                    });
                                } else {
                                    this.setState({host: tourneyData.host,
                                        noEntrants: tourneyData.noEntrants, 
                                        minEntrants: tourneyData.minEntrants,
                                        maxEntrants: tourneyData.maxEntrants,
                                        startDate: tourneyData.startDate,
                                        endDate: tourneyData.endDate,
                                        startTime: tourneyData.startTime,
                                        endTime: tourneyData.endTime,
                                        quoteCurrency: tourneyData.quoteCurrency,
                                        entrants: entrants,
                                        entrantsObjs: entrantsObjs,
                                        entrantProfits: entrantProfits,
                                        registered: isRegistered,
                                        products: products,
                                        balance: balance,
                                        active: false,
                                        visibility: tourneyData.visibility,
                                        visibleEntrants: entrantsObjs,
                                        loading: false
                                    });
                                }
                            }).catch(err => {
                                this.setState({error: true});
                            });
                        } else if (tourneyState == "active") {
                            // active tournaments
                            axios.post('/getActiveTourneyInfo', {"tourneyId": this.state.tourneyId} ).then(res => { 

                                let tourneyData = res.data;
                                let products = tourneyData.products;
                                let entrants = tourneyData.activeEntrants.entrants;
                                let entrantProfits = tourneyData.activeEntrants.profits;
                                let liqEntrants = tourneyData.liqEntrants;
                                let isLiq = liqEntrants.includes(this.props.username);
                                let isRegistered = entrants.includes(this.props.username);

                                let entrantsObjs = [];
                                for (let i=0; i<entrants.length; i++) {
                                    let entrant = {username: entrants[i], rank: i+1, profit: entrantProfits[i]};
                                    entrantsObjs.push(entrant);
                                }

                                // if user is registered and not liquidated get the entrant's balance else set balance to 0.
                                if (!isLiq) {
                                    axios.post('/getEntrantBalance', {"tourneyType": "active", "tourneyId": this.state.tourneyId, "userId": user.uid}).then(res => {
                                        let balance = res.data.balance;
                                        this.setState({host: tourneyData.host,
                                                    noEntrants: tourneyData.noEntrants,
                                                    minEntrants: tourneyData.minEntrants,
                                                    maxEntrants: tourneyData.maxEntrants,
                                                    startDate: tourneyData.startDate,
                                                    endDate: tourneyData.endDate,
                                                    startTime: tourneyData.startTime,
                                                    endTime: tourneyData.endTime,
                                                    quoteCurrency: tourneyData.quoteCurrency,
                                                    entrants: entrants,
                                                    entrantsObjs: entrantsObjs,
                                                    entrantProfits: entrantProfits,
                                                    products: products,
                                                    registered: isRegistered,
                                                    active: true,
                                                    balance: balance,
                                                    visibility: tourneyData.visibility,
                                                    visibleEntrants: entrantsObjs,
                                                    loading: false
                                        });
                                    }).catch(err => {
                                        this.setState({error: true});
                                    });
                                } else {
                                    let balance = 0;
                                    this.setState({host: tourneyData.host,
                                                noEntrants: tourneyData.noEntrants,
                                                minEntrants: tourneyData.minEntrants,
                                                maxEntrants: tourneyData.maxEntrants,
                                                startDate: tourneyData.startDate,
                                                endDate: tourneyData.endDate,
                                                startTime: tourneyData.startTime,
                                                endTime: tourneyData.endTime,
                                                quoteCurrency: tourneyData.quoteCurrency,
                                                entrants: entrants,
                                                entrantsObjs: entrantsObjs,
                                                products: products,
                                                registered: isRegistered,
                                                active: true,
                                                balance: balance,
                                                visibility: tourneyData.visibility,
                                                visibleEntrants: entrantsObjs,
                                                loading: false
                                    });
                                }
                            }).catch(err => {
                                this.setState({error: true});
                            });
                        } else if (tourneyState == "completed") {
                            // active tournaments
                            axios.post('/getCompletedTourneyInfo', {"tourneyId": this.state.tourneyId} ).then(res => { 
                                let tourneyData = res.data;

                                let products = tourneyData.products;
                                let entrants = tourneyData.entrants.entrants;
                                let isRegistered = entrants.includes(this.props.username);
                                let entrantProfits = tourneyData.entrants.profits;

                                let entrantsObjs = [];
                                for (let i=0; i<entrants.length; i++) {
                                    let entrant = {username: entrants[i], rank: i+1, profit: entrantProfits[i]};
                                    entrantsObjs.push(entrant);
                                }

                                let balance = null;
                                if (isRegistered) {
                                    // if registered, get the entrant's balance
                                    axios.post('/getEntrantBalance', {"tourneyType": "registering", "tourneyId": this.state.tourneyId, "userId": user.uid}).then(res => {
                                        balance = res.data.balance;
                                        this.setState({host: tourneyData.host,
                                            noEntrants: tourneyData.noEntrants, 
                                            minEntrants: tourneyData.minEntrants,
                                            maxEntrants: tourneyData.maxEntrants,
                                            startDate: tourneyData.startDate,
                                            endDate: tourneyData.endDate,
                                            startTime: tourneyData.startTime,
                                            endTime: tourneyData.endTime,
                                            quoteCurrency: tourneyData.quoteCurrency,
                                            entrants: entrants,
                                            entrantsObjs: entrantsObjs,
                                            entrantProfits: entrantProfits,
                                            registered: isRegistered,
                                            products: products,
                                            balance: balance,
                                            active: false,
                                            visibility: tourneyData.visibility,
                                            visibleEntrants: entrantsObjs,
                                            loading: false
                                        });
                                    }).catch(err => {
                                        this.setState({error: true});
                                    });
                                } else {
                                    this.setState({host: tourneyData.host,
                                        noEntrants: tourneyData.noEntrants, 
                                        minEntrants: tourneyData.minEntrants,
                                        maxEntrants: tourneyData.maxEntrants,
                                        startDate: tourneyData.startDate,
                                        endDate: tourneyData.endDate,
                                        startTime: tourneyData.startTime,
                                        endTime: tourneyData.endTime,
                                        quoteCurrency: tourneyData.quoteCurrency,
                                        entrants: entrants,
                                        entrantsObjs: entrantsObjs,
                                        entrantProfits: entrantProfits,
                                        registered: isRegistered,
                                        products: products,
                                        balance: balance,
                                        active: false,
                                        visibility: tourneyData.visibility,
                                        visibleEntrants: entrantsObjs,
                                        loading: false
                                    });
                                }
                            }).catch(err => {
                                this.setState({error: true});
                            });
                        }
                    }).catch(err => {
                        this.setState({error: true});
                    });
                }
            } else {
                this.setState({authFail: true});
            }
        });
        
    }
    
    showRegistrationConfirmHandler = () => {
        if (this.state.balance) {
            this.setState({showRegistrationConfirm: true});
        } else {
            let errorMsg = <p style={{"color": "#C62828", "fontWeight": "bold"}}>Please enter a starting balance.</p>
            this.setState({balanceErrorMsg: errorMsg});
        }
        
    }
    
    cancelRegistrationConfirmHandler = () => {
        this.setState({showRegistrationConfirm: false});
    }
    
    showUnRegistrationConfirmHandler = () => {
        this.setState({showUnRegistrationConfirm: true});
    }
    
    cancelUnRegistrationConfirmHandler = () => {
        this.setState({showUnRegistrationConfirm: false});
    }
    
    submitHandler = () => {
        if (this.props.username) {
            let entrants = this.state.entrants;
            this.setState({editBalanceLoading: true});
            if (entrants.includes(this.props.username)) {

                // remove from SQL entrants list
                let dbEntrantData = {};
                dbEntrantData["tourneyId"] = this.state.tourneyId;
                dbEntrantData["userId"] = this.props.userId;
                axios.post("/tourneyUnregister", dbEntrantData).then(res => {
                    axios.post('/getTourneyEntrants', {"tourneyId": this.state.tourneyId}).then(res => {
                        let newEntrantsArr = res.data.response.entrants; 
                        let newProfitsArr = res.data.response.profits; 

                        let entrantsObjs = [];
                        for (let i=0; i<newEntrantsArr.length; i++) {
                            let entrant = {username: newEntrantsArr[i], rank: i+1, profit: newProfitsArr[i]};
                            entrantsObjs.push(entrant);
                        }

                        let currentState = {...this.state};
                        currentState['showUnRegistrationConfirm'] = false;
                        currentState['registered'] = false;
                        currentState['noEntrants'] -= 1;
                        currentState['entrants'] = newEntrantsArr;
                        currentState['entrantsObjs'] = entrantsObjs;
                        currentState['visibleEntrants'] = entrantsObjs;;
                        currentState['entrantProfits'] = newProfitsArr;
                        currentState['balance'] = null;
                        currentState['editBalanceLoading'] = false;
                        this.setState(currentState);
                    });
                })

                this.props.getMyTourneys(this.props.userId);

            } else {

                // write to SQL entrants list
                let dbEntrantData = {};
                dbEntrantData["tourneyId"] = this.state.tourneyId;
                dbEntrantData["userId"] = this.props.userId;
                dbEntrantData["username"] = this.props.username;
                dbEntrantData["balance"] = this.state.balance;
                axios.post("/tourneyRegistration", dbEntrantData).then(res => {
                    axios.post('/getTourneyEntrants', {"tourneyId": this.state.tourneyId}).then(res => {

                        let newEntrantsArr = res.data.response.entrants; 
                        let newProfitsArr = res.data.response.profits; 

                        let entrantsObjs = [];
                        for (let i=0; i<newEntrantsArr.length; i++) {
                            let entrant = {username: newEntrantsArr[i], rank: i+1, profit: newProfitsArr[i]};
                            entrantsObjs.push(entrant);
                        }

                        let currentState = {...this.state};
                        currentState['showRegistrationConfirm'] = false;
                        currentState['balanceErrorMsg'] = null;
                        currentState['registered'] = true;
                        currentState['noEntrants'] += 1;
                        currentState['entrants'] = newEntrantsArr;
                        currentState['entrantsObjs'] = entrantsObjs;
                        currentState['visibleEntrants'] = entrantsObjs;
                        currentState['entrantProfits'] = newProfitsArr;
                        currentState['editBalanceLoading'] = false;
                        this.setState(currentState);
                    });
                })

                this.props.getMyTourneys(this.props.userId);
            }
        } else {
            this.setState({usernameErr: true});
        }
    }
    
    // BALANCE HANDLERS
    showBalanceInput = () => {
        this.setState({editingBalance: !this.state.editingBalance})
    }
    
    editBalanceHandler = (event) => {
        this.setState({balance: event.target.value});
    }
    
    submitBalanceHandler = (event) => {
        this.setState({editBalanceLoading: true});
        if (this.state.balance <= 0) {
            alert("Please enter a number greater than 0.")
        } else {
            axios.post("/updateStartBalance", {"balance": this.state.balance, "tourneyId": this.state.tourneyId, "userId": this.props.userId}).then(res => {
                this.setState({editingBalance: false, editBalanceLoading: false});
            });
        }
    }
    
    // HOST CONTROL HANDLERS
    inviteUserHandler = () => {
        this.setState({inviteUserLoading: true});
        axios.post('/sendTourneyInvite', {"hostId": this.props.userId, "host": this.props.username, "tourneyId": this.state.tourneyId, "username": this.state.addUser}).then(res => {
            this.setState({addUser: '', addedUserMsg: res.data.response, inviteUserLoading: false});
        })
    }
    
    addUserInputHandler = (event) => {
        this.setState({addUser: event.target.value});
    }
    
    changeVisibilityHandler = (event, visibility) => {
        if (this.state.visibility != visibility) this.setState({showVisibilityConfirm: true, visibility: visibility});
    }
    
    confirmVisibilityChange = () => {
        this.setState({editVisibilityLoading: true});
        // call api and change visibility in database
        axios.post('/updateTourneyVisibility', {"tourneyId": this.state.tourneyId, "userId": this.props.userId, "visibility": this.state.visibility}).then(res => {
            this.setState({showVisibilityConfirm: false, editVisibilityLoading: false});
        });
    }
    
    cancelVisibilityChange = () => {
        if (this.state.visibility == "public") {
            this.setState({showVisibilityConfirm: false, visibility: "private"});
        } else if (this.state.visibility == "private") {
            this.setState({showVisibilityConfirm: false, visibility: "public"});
        }
    }
    
    deleteHandler = () => {
        this.setState({showConfirmDelete: true});
    }
    
    confirmDeleteHandler = () => {
        this.setState({deleteTourneyLoading: true})
        axios.post("/deleteTournament", {"tourneyId": this.state.tourneyId, "userId": this.props.userId}).then(res => {
            this.setState({showConfirmDelete: false, tourneyDeleted: true, deleteTourneyLoading: false});
        });
    }
    
    cancelDeleteHandler = () => {
        this.setState({showConfirmDelete: false});
    }
    
    cancelSubmitBalanceHandler = () => {
        this.setState({editingBalance: false});
    }
    
    // SEARCH ENTRANTS HANDLER
    
    searchEntrantsInputHandler = (event) => {
        
        let visibleEntrants = [];
        if (event.target.value == '') {
            visibleEntrants = this.state.entrantsObjs;
        } else {
            for (let  i=0; i<this.state.entrantsObjs.length; i++) {
                if (event.target.value == this.state.entrantsObjs[i].username) {
                    let entrant = {username: this.state.entrantsObjs[i].username, rank: this.state.entrantsObjs[i].rank, profit: this.state.entrantsObjs[i].profit};
                    visibleEntrants.push(entrant);
                } 
            }
        }
        this.setState({searchEntrants: event.target.value, visibleEntrants: visibleEntrants});
    }
    
    render() {
        
        // HOST CONTROLS
        let confirmationBox = null;
        if (this.state.showConfirmDelete)
        {
            confirmationBox = (
                <div>
                    <p>Are you sure?</p>
                    <button className="resetBtn" onClick={this.cancelDeleteHandler}>Cancel</button>
                    <button className="submitBtn" onClick={this.confirmDeleteHandler}>Confirm</button>
                </div>
            );
        }
        
        if (this.state.deleteTourneyLoading)
        {
            confirmationBox = (
                <Spinner />
            );
        }
        
        let visibilityConfirmationBox = null;
        if (this.state.showVisibilityConfirm)
        {
            visibilityConfirmationBox = (
                <div>
                    <p>Are you sure?</p>
                    <button className="resetBtn" onClick={this.cancelVisibilityChange}>Cancel</button>
                    <button className="submitBtn" onClick={this.confirmVisibilityChange}>Confirm</button>
                </div>
            );
        }
        
        if (this.state.editVisibilityLoading)
        {
            visibilityConfirmationBox = (
                <Spinner />
            );
        }
        
        let visibilityButtons = (
                <div>
                    <button onClick={(event, visibility) => this.changeVisibilityHandler(event, "public")}>Public</button>
                    <button onClick={(event, visibility) => this.changeVisibilityHandler(event, "private")}>Private</button> <br/>
                </div>
            );
        if (this.state.visibility == "public") {
            visibilityButtons = (
                <div>
                    <button className="highlight" onClick={(event, visibility) => this.changeVisibilityHandler(event, "public")}>Public</button>
                    <button onClick={(event, visibility) => this.changeVisibilityHandler(event, "private")}>Private</button> <br/>
                </div>
            );
        } else if (this.state.visibility == "private") {
            visibilityButtons = (
                <div>
                    <button onClick={(event, visibility) => this.changeVisibilityHandler(event, "public")}>Public</button>
                    <button className="highlight" onClick={(event, visibility) => this.changeVisibilityHandler(event, "private")}>Private</button> <br/>
                </div>
            );
        }
        
        let addedUserMsg = null;
        if (this.state.addedUserMsg) {
            if (this.state.addedUserMsg.substring(0,19) == "Invitation sent to ") {
                addedUserMsg = <p style={{"color": "#57eb7e", "fontWeight": "bold"}}>{this.state.addedUserMsg}</p>
            } else {
                addedUserMsg = <p style={{"color": "#f7716d", "fontWeight": "bold"}}>{this.state.addedUserMsg}</p>
            }
        }
        
        let inviteUserSpinner = null;
        if (this.state.inviteUserLoading) inviteUserSpinner = <Spinner />;
        
        let hostControls = null;
        if (this.state.isHost === true && this.state.tourneyState == "registering") {
            hostControls = (
                <div className="hostControls">
                    <h3>Host Controls</h3>
                    <p>Invite User:</p>
                    <input value={this.state.addUser} placeholder="Enter username" onChange={(event)=>this.addUserInputHandler(event)}/>
                    <button className="submitInviteBtn" onClick={this.inviteUserHandler}>Submit</button> <br />
                    {inviteUserSpinner}
                    {addedUserMsg}
                    <p>Tournament Visibility:</p>
                    {visibilityButtons}
                    {visibilityConfirmationBox}
                    <p>Delete tournament:</p>
                    <button className="deleteTournamentBtn" onClick={this.deleteHandler}>Delete Tournament</button> <br />
                    {confirmationBox}
                </div>
            );
        }
        
        
        // ENTRANTS 
        let tourneyBody = (
            <Spinner />
        )
        
        let entrantsRows = null;
        if (this.state.entrants && this.state.visibleEntrants) {
            entrantsRows = this.state.visibleEntrants.map((entrant, index) => {
                return (
                    <tr key={index}>
                        <td>{index+1}</td>
                        <td>{entrant.username}</td>
                        <td>{entrant.profit}</td>
                    </tr>
                );
            })
        }

        let entrants = (
            <table className="entrantsListTable">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Profit (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {entrantsRows}
                </tbody>
            </table>
        );
        

        // BALANCE

        // REGISTER BUTTON
        let registerBtn = null;

        // IF NOT REGISTERED AND TOURNAMENT IN REGISTRATION
        let balance;
        if (!this.state.registered && this.state.tourneyState == "registering") {
            registerBtn = (
                <button className="submitBtn" onClick={this.showRegistrationConfirmHandler}>Register</button>
            );
            balance = (
                <div>
                    <h2>Registration:</h2>
                    <p>The tournament is in registration.</p>
                    <h3>Starting Balance:</h3>
                    <p>Enter tournament starting balance <b>({this.state.quoteCurrency})</b> to register:</p>
                    <p style={{"fontSize": "0.9rem"}}>Your starting balance should reflect the balance in your trading account so that profit can be calculated as a percentage. If your tournament balance drops below zero at any point, you are liquidated from the tournament.</p>
                    <p style={{"fontSize": "0.9rem"}}>For example, if you enter a starting balance of $1000 and trade with a $10,000 position then you are effectively using 10x leverage.</p>
                    <input className="balanceInput" type="text" placeholder=" Enter Starting Balance" onChange={(event) => this.editBalanceHandler(event)} />
                </div>
            );
        }
        
        // IF REGISTERED AND TOURNAMENT IS ACTIVE
        if (this.state.registered && this.state.tourneyState == "active") {
            balance = (
                <div>
                    <h2>Registration:</h2>
                    <p>The tournament is already active.</p>
                    <h3>Starting Balance:</h3>
                    <p>{this.state.balance} {this.state.quoteCurrency}</p>
                </div>
            );
        }

        // IF NOT REGISTERED AND TOURNAMENT IS ACTIVE
        if (!this.state.registered && this.state.tourneyState == "active") {
            balance = (
                <div>
                    <h2>Registration:</h2>
                    <p>The tournament is already active.</p>
                    <h3>Starting Balance:</h3>
                    <p>You are not registered</p>
                </div>
            )
        }
        
        // IF REGISTERED AND THE TOURNAMENT IN REGISTRATION 
        // EDIT BALANCE 
        let editStartBalanceBtn = null;
        if (this.state.registered && this.state.tourneyState == "registering") {
            
            balance = (
                <div>
                    <h2>Registration:</h2>
                    <p>You are already registered.</p>
                    <h3>Starting Balance:</h3>
                    <p>{this.state.balance} {this.state.quoteCurrency}</p>
                </div>
            )
            registerBtn = (
                <button className="resetBtn" onClick={this.showUnRegistrationConfirmHandler}>Unregister</button>
            );
            
            if (this.state.editingBalance) {
                editStartBalanceBtn = (
                    <div className="editStartBalBtnDiv">
                        <button className="resetBtn" style={{"marginRight": "20px"}} onClick={this.cancelSubmitBalanceHandler}>Cancel</button>
                        <input className="editBalanceInput" type="number" placeholder={this.state.balance} onChange={(event) => this.editBalanceHandler(event)} />
                        <button className="submitBtn" onClick={this.submitBalanceHandler}>Submit</button>
                    </div>
                );
            } else {
                editStartBalanceBtn = (
                    <button className="editStartBalBtn" onClick={this.showBalanceInput}>Edit Starting Balance</button>
                );
            }
        }
        
        
        // TOURNAMENT OVERVIEW

        let startTimePa = <p>{this.state.startDate} - {this.state.startTime}</p>
        let endTimePa = <p>{this.state.endDate} - {this.state.endTime}</p>
        
        if (this.state.active) {
            registerBtn = null;
            startTimePa = (
                <div>
                    <p>Started</p>
                    <p>{this.state.startDate} - {this.state.startTime}</p>
                </div>
            )
        }
        if (this.state.tourneyState == "completed") {
            registerBtn = null;
            startTimePa = (
                <div>
                    <p>{this.state.startDate} - {this.state.startTime}</p>
                </div>
            )
            endTimePa = (
                <div>
                    <p>Ended</p>
                    <p>{this.state.endDate} - {this.state.endTime}</p>
                </div>
            )
        }
        
        // CONFIRM REGISTRATION MODAL
        let confirmRegistration = null; 
        let balanceErrorMsg = this.state.balanceErrorMsg;
        if (this.state.showRegistrationConfirm) {
            
            confirmRegistration = (
                <div className="confirmRegistrationWrapper">
                    <div className="confirmRegistrationDiv">   
                        <p>Are you sure?</p>
                        <button className="resetBtn" onClick={this.cancelRegistrationConfirmHandler}>Cancel</button>
                        <button className="submitBtn" onClick={this.submitHandler}>Submit</button>
                    </div>
                </div>
            );
  
        }
        // CONFIRM UN-REGISTRATION MODAL
        let confirmUnRegistration = null;
        if (this.state.showUnRegistrationConfirm) {
            confirmUnRegistration = (
                <div className="confirmRegistrationWrapper">
                    <div className="confirmRegistrationDiv">   
                        <p>Are you sure?</p>
                        <button className="resetBtn" onClick={this.cancelUnRegistrationConfirmHandler}>Cancel</button>
                        <button className="submitBtn" onClick={this.submitHandler}>Submit</button>
                    </div>
                </div>
            );
        }

        let balanceDiv = (
            <div>
                {balance}
                {registerBtn}<br/>
                {balanceErrorMsg}
                {editStartBalanceBtn}<br/>
            </div>
        )
        
        if (this.state.editBalanceLoading) {
            balanceDiv = <Spinner />
        }
        
        let entrantsDiv = <Spinner />
        if (!this.state.loading){
            entrantsDiv = (
                <div className="entrantsList">
                    {balanceDiv}
                    <h2>List of Entrants:</h2>
                    <h3>Search Entrants:</h3>
                    <input value={this.state.searchEntrants} className="searchEntrantsInput" placeholder="Username" onChange={(event) => this.searchEntrantsInputHandler(event)}/>
                    <ul>{entrants}</ul>
                </div>
            );
        } 

        // PRODUCTS
        let FTXProducts = null;

        if (this.state.products) { 
            if (this.state.products['FTX']) {
                FTXProducts = Object.keys(this.state.products['FTX']).map(index => {
                    return (
                        <p key={index}>{this.state.products['FTX'][index]}</p>
                    )
                });
            };
        }
        
        // REDIRECT
        let redirect = null;
        if (this.state.tourneyDeleted) redirect = <Redirect to="/myTourneys"/>
        if (this.state.authFail) {
            redirect = (
                <Redirect to="/login" />
            )
        }

        if (this.state.error) {
            redirect = (
                <Redirect to="/error" />
            )
        }

        if (this.state.usernameErr) {
            redirect = (
                <Redirect to="/profile" />
            )
        }
         
        if (this.state.host != null) {
            tourneyBody = (
                <div className="tourneyBody">
                    <h2>Overview:</h2>
                    <h3>Status</h3>
                    <p>{this.state.tourneyState}</p>
                    <h3>Host</h3>
                    <p>{this.state.host}</p>
                    <h3>Entrants</h3>
                    <p>Minimum: {this.state.minEntrants}</p>
                    <p>Maximum: {this.state.maxEntrants}</p>
                    <h3>Start Time</h3>
                    {startTimePa}
                    <h3>End Time</h3>
                    {endTimePa}
                    <h3>Products:</h3>
                    <div className="productListDiv">
                        <div className="exchangeSublist">
                            {FTXProducts}
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className="tourneyDiv">
                {redirect}
                <div className="tourneySubDiv">
                    <h1>Tournament {this.state.tourneyId}</h1>
                    {hostControls}
                </div>
                <div className="tourneySubDiv2">
                    <div className="tourneyWrapper">
                        {tourneyBody}
                        {entrantsDiv}
                    </div>
                </div>
                {confirmRegistration}
                {confirmUnRegistration}
            </div>
        )
    }

};

const mapDispatchToProps = dispatch => {
    return {
        updateUserIdToken: (userId, token) => dispatch(actions.updateUserIdToken(userId, token)),
        setUsernameEmail: (username, email) => dispatch(actions.setUsernameEmail(username, email))
    };
};

const mapStateToProps = (state) => {
    return {
        username: state.auth.username,
        userId: state.auth.userId
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Tourney);