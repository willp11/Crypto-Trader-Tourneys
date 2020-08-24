import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from 'axios';
import {firebaseAuth, firebaseDB} from "../../firebase/firebase";
import './tourney.css';
import * as actions from '../../store/actions/index';
import {Redirect} from 'react-router-dom';

class Tourney extends Component {
    
    state = {
        tourneyId: this.props.match.params.tourneyId,
        host: null,
        hostId: false,
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
        redirect: false,
        active: null,
        editingBalance: false,
        quoteCurrency: null,
        balance: null,
        tourneyState: null,
        visibility: null,
        showVisibilityConfirm: false,
        addUser: '',
        addedUserMsg: null
    }

    componentDidMount() {
        console.log(this.props.match.params.tourneyId);
        
        
        // find which state the tournament is, registering/active/completed

        // call the API and check which state the tourney is
        axios.post('/getTourneyState', {"tourneyId": this.props.match.params.tourneyId} ).then(res => {
            let tourneyState = res.data.tourneyState;
            this.setState({tourneyState: tourneyState});
            
            // registering tournaments
            if (tourneyState == "registering") {

                axios.post('/getTourneyInfo', {"tourneyId": this.props.match.params.tourneyId} ).then(res => { 
                    let tourneyData = res.data;

                    console.log(res.data);
                    this.setState({quoteCurrency: res.data.quoteCurrency});

                    axios.post('/checkIfHost', {"tourneyId": this.state.tourneyId, "userId": this.props.userId, "tourneyType": "registering"}).then(res => {

                        if (res.data.response) this.setState({hostId: true});

                        axios.post('/getProducts', {"tourneyId": this.state.tourneyId}).then(res => {
                            let products = res.data;

                            axios.post('/getTourneyEntrants', {"tourneyId": this.state.tourneyId}).then(res => {

                                let entrants = res.data.response.entrants;
                                let isRegistered = entrants.includes(this.props.username);
                                let entrantProfits = res.data.response.profits;

                                // if registered, get the entrant's balance
                                axios.post('/getEntrantBalance', {"tourneyType": "registering", "tourneyId": this.state.tourneyId, "userId": this.props.userId}).then(res => {
                                    let balance = res.data.balance;
                                    this.setState({host: tourneyData.host,
                                                noEntrants: tourneyData.noEntrants, 
                                                minEntrants: tourneyData.minEntrants,
                                                maxEntrants: tourneyData.maxEntrants,
                                                startDate: tourneyData.startDate,
                                                endDate: tourneyData.endDate,
                                                startTime: tourneyData.startTime,
                                                endTime: tourneyData.endTime,
                                                entrants: entrants,
                                                entrantProfits: entrantProfits,
                                                registered: isRegistered,
                                                products: products,
                                                balance: balance,
                                                active: false,
                                                visibility: tourneyData.visibility
                                    });
                                })
                            });
                        });   
                    });
                });
            } else if (tourneyState == "active") {
                // active tournaments
                axios.post('/getActiveTourneyInfo', {"tourneyId": this.state.tourneyId} ).then(res => { 

                    let tourneyData = res.data;

                    // check if the user is the host
                    axios.post('/checkIfHost', {"tourneyId": this.state.tourneyId, "userId": this.props.userId, "tourneyType": "active"}).then(res => {
                        if (res.data.response) this.setState({hostId: true});

                        // get the product list
                        axios.post('/getActiveProducts', {"tourneyId": this.state.tourneyId}).then(res => {
                            let products = res.data;

                            // get the active entrants list
                            axios.post('/getActiveEntrants', {"tourneyId": this.state.tourneyId, "entrantType": "active"}).then(res => {
                                let entrants = res.data.response.entrants;
                                let entrantProfits = res.data.response.profits;
                                let isRegistered = entrants.includes(this.props.username);

                                // get the liquidated entrants list
                                axios.post('/getActiveEntrants', {"tourneyId": this.state.tourneyId, "entrantType": "liquidated"}).then(res => {
                                    let liqEntrants = res.data.response.entrants;
                                    let isLiq = liqEntrants.includes(this.props.username);

                                    // if user is registered and not liquidated get the entrant's balance else set balance to 0.
                                    if (!isLiq) {
                                        axios.post('/getEntrantBalance', {"tourneyType": "active", "tourneyId": this.state.tourneyId, "userId": this.props.userId}).then(res => {
                                            let balance = res.data.balance;
                                            this.setState({host: tourneyData.host,
                                                        noEntrants: tourneyData.noEntrants,
                                                        minEntrants: tourneyData.minEntrants,
                                                        maxEntrants: tourneyData.maxEntrants,
                                                        startDate: tourneyData.startDate,
                                                        endDate: tourneyData.endDate,
                                                        startTime: tourneyData.startTime,
                                                        endTime: tourneyData.endTime,
                                                        entrants: entrants,
                                                        entrantProfits: entrantProfits,
                                                        products: products,
                                                        registered: isRegistered,
                                                        active: true,
                                                        balance: balance,
                                                        visibility: tourneyData.visibility
                                            });
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
                                                    entrants: entrants,
                                                    products: products,
                                                    registered: isRegistered,
                                                    active: true,
                                                    balance: balance,
                                                    visibility: tourneyData.visibility
                                        });
                                    }
                                })
                            });
                        });
                    });
                });
            } else if (tourneyState == "completed") {
                // active tournaments
                axios.post('/getCompletedTourneyInfo', {"tourneyId": this.state.tourneyId} ).then(res => { 
                    let tourneyData = res.data;

                    // check if the user is the host
                    axios.post('/checkIfHost', {"tourneyId": this.state.tourneyId, "userId": this.props.userId, "tourneyType": "completed"}).then(res => {
                        if (res.data.response) this.setState({hostId: true});

                        // get the product list
                        axios.post('/getCompletedProducts', {"tourneyId": this.state.tourneyId}).then(res => {
                            let products = res.data;

                            axios.post('/getCompletedEntrants', {"tourneyId": this.state.tourneyId}).then(res => {

                                let entrants = res.data.response.entrants;
                                let isRegistered = entrants.includes(this.props.username);
                                let entrantProfits = res.data.response.profits;

                                // if registered, get the entrant's balance
                                axios.post('/getEntrantBalance', {"tourneyType": "completed", "tourneyId": this.state.tourneyId, "userId": this.props.userId}).then(res => {
                                    let balance = res.data.balance;
                                    this.setState({host: tourneyData.host,
                                                noEntrants: tourneyData.noEntrants, 
                                                maxEntrants: tourneyData.maxEntrants,
                                                startDate: tourneyData.startDate,
                                                endDate: tourneyData.endDate,
                                                startTime: tourneyData.startTime,
                                                endTime: tourneyData.endTime,
                                                entrants: entrants,
                                                entrantProfits: entrantProfits,
                                                registered: isRegistered,
                                                products: products,
                                                balance: balance,
                                                completed: true
                                    });
                                })
                            });
                        });   
                    });
                });
            }
        });
    }

    componentDidUpdate() {
        console.log(this.state.visibility);
    }

    submitHandler = () => {
        let entrants = this.state.entrants;
        
        if (entrants.includes(this.props.username)) {
            
            // remove from SQL entrants list
            let dbEntrantData = {};
            dbEntrantData["tourneyId"] = this.state.tourneyId;
            dbEntrantData["userId"] = this.props.userId;
            axios.post("/tourneyUnregister", dbEntrantData).then(res => {
                console.log(res);
                axios.post('/getTourneyEntrants', {"tourneyId": this.state.tourneyId}).then(res => {
                    let newEntrantsArr = res.data.response.entrants; 
                    let newProfitsArr = res.data.response.profits; 
                    let currentState = {...this.state};
                    currentState['registered'] = false;
                    currentState['noEntrants'] -= 1;
                    currentState['entrants'] = newEntrantsArr;
                    currentState['entrantProfits'] = newProfitsArr;
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
                console.log(res);
                axios.post('/getTourneyEntrants', {"tourneyId": this.state.tourneyId}).then(res => {
                    let newEntrantsArr = res.data.response.entrants; 
                    let newProfitsArr = res.data.response.profits; 
                    let currentState = {...this.state};
                    currentState['registered'] = true;
                    currentState['noEntrants'] += 1;
                    currentState['entrants'] = newEntrantsArr;
                    currentState['entrantProfits'] = newProfitsArr;
                    this.setState(currentState);
                });
            })
            
            this.props.getMyTourneys(this.props.userId);
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
        if (this.state.balance <= 0) {
            alert("Please enter a number greater than 0.")
        } else {
            axios.post("/updateStartBalance", {"balance": this.state.balance, "tourneyId": this.state.tourneyId, "userId": this.props.userId}).then(res => {
                console.log(res.data);
                this.setState({editingBalance: false});
            });
        }
    }
    
    // HOST CONTROL HANDLERS
    inviteUserHandler = () => {
        axios.post('/sendTourneyInvite', {"hostId": this.props.userId, "host": this.props.username, "tourneyId": this.state.tourneyId, "username": this.state.addUser}).then(res => {
            console.log(res.data);
            this.setState({addUser: '', addedUserMsg: res.data.response});
        })
    }
    
    addUserInputHandler = (event) => {
        this.setState({addUser: event.target.value});
    }
    
    changeVisibilityHandler = (event, visibility) => {
        this.setState({showVisibilityConfirm: true, visibility: visibility});
    }
    
    confirmVisibilityChange = () => {
        // call api and change visibility in database
        axios.post('/updateTourneyVisibility', {"tourneyId": this.state.tourneyId, "userId": this.props.userId, "visibility": this.state.visibility}).then(res => {
            this.setState({showVisibilityConfirm: false});
            console.log(res.data);
        });
    }
    
    cancelVisibilityChange = () => {
        this.setState({showVisibilityConfirm: false, visibility: null});
    }
    
    deleteHandler = () => {
        this.setState({showConfirmDelete: true});
    }
    
    confirmDeleteHandler = () => {
        axios.post("/deleteTournament", {"tourneyId": this.state.tourneyId, "userId": this.props.userId}).then(res => {
            this.setState({showConfirmDelete: false, redirect: true});
        });
    }
    
    cancelDeleteHandler = () => {
        this.setState({showConfirmDelete: false});
    }
    
    cancelSubmitBalanceHandler = () => {
        this.setState({editingBalance: false});
    }
    
    render() {
        
        let confirmationBox = null;
        if (this.state.showConfirmDelete)
        {
            confirmationBox = (
                <div>
                    <p>Are you sure?</p>
                    <button onClick={this.cancelDeleteHandler}>Cancel</button>
                    <button onClick={this.confirmDeleteHandler}>Confirm</button>
                </div>
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
        
        let hostControls = null;
        if (this.state.hostId === true && this.state.tourneyState == "registering") {
            hostControls = (
                <div className="hostControls">
                    <h3>Host Controls</h3>
                    <p>Invite User:</p>
                    <input value={this.state.addUser} placeholder="Enter username" onChange={(event)=>this.addUserInputHandler(event)}/>
                    <button className="submitInviteBtn" onClick={this.inviteUserHandler}>Submit</button> <br />
                    <p style={{"color": "rgb(77, 134, 247)"}}>{this.state.addedUserMsg}</p>
                    <p>Tournament Visiblity:</p>
                    {visibilityButtons}
                    {visibilityConfirmationBox}
                    <p>Delete tournament:</p>
                    <button className="deleteTournamentBtn" onClick={this.deleteHandler}>Delete Tournament</button> <br />
                    {confirmationBox}
                </div>
            );
        }
        

        let tourneyBody = (
            <h2>Loading</h2>
        )
        
        let entrants = null;
        if (this.state.entrants && this.state.entrantProfits) {
            entrants = this.state.entrants.map((entrant, index) => {
                return (
                    <li key={entrant}>{index+1}. {entrant}: {this.state.entrantProfits[index]}% </li>
                );
            })
        }
        
        let registerBtn = (
            <button className="submitBtn" onClick={this.submitHandler}>Register</button>
        );
        let balance = (
            <div>
                <h3>Balance:</h3>
                <p>Enter tournament starting balance ({this.state.quoteCurrency}):</p>
                <input className="balanceInput" type="text" placeholder=" Enter Starting Balance" onChange={(event) => this.editBalanceHandler(event)} />
            </div>
        );
        let editStartBalanceBtn = null;
        let startTimePa = <p>{this.state.startDate} - {this.state.startTime}</p>
        let endTimePa = <p>{this.state.endDate} - {this.state.endTime}</p>
        
        if (this.state.registered) {
            balance = (
                <div>
                    <h2>Balance:</h2>
                    <p>{this.state.balance} {this.state.quoteCurrency}</p>
                </div>
            )
            registerBtn = (
                <button className="resetBtn" onClick={this.submitHandler}>Unregister</button>
            );
        }
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
        
        if (this.state.registered && this.state.tourneyState == "registering") {
            if (this.state.editingBalance) {
                editStartBalanceBtn = (
                    <div>
                        <button className="resetBtn" style={{"marginRight": "20px"}} onClick={this.cancelSubmitBalanceHandler}>Cancel</button>
                        <input className="editBalanceInput" type="text" placeholder={this.state.balance} onChange={(event) => this.editBalanceHandler(event)} />
                        <button className="submitBtn" onClick={this.submitBalanceHandler}>Submit</button>
                    </div>
                );
            } else {
                editStartBalanceBtn = (
                    <button className="editStartBalBtn" onClick={this.showBalanceInput}>Edit Starting Balance</button>
                );
            }
        }
        
        if (this.state.host != null) {
            tourneyBody = (
                <div className="tourneyBody">
                    <h3>Host</h3>
                    <p>{this.state.host}</p>
                    <h3>Minimum Entrants</h3>
                    <p>{this.state.minEntrants}</p>
                    <h3>Maximum Entrants</h3>
                    <p>{this.state.maxEntrants}</p>
                    <h3>Start Time</h3>
                    {startTimePa}
                    <h3>End Time</h3>
                    {endTimePa}
                    {balance}
                    {registerBtn}<br/>
                    {editStartBalanceBtn}<br/>
                </div>
            )
        }

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
        
        let redirect = null;
        if (this.state.redirect) redirect = <Redirect to="/allTournaments"/>
        if (!this.props.userId) {
            redirect = (
                <Redirect to="/login" />
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
                        <div className="productList">
                            <h2>Products:</h2>
                            <div className="productListDiv">
                                <div className="exchangeSublist">
                                    <h3>FTX:</h3>
                                    {FTXProducts}
                                </div>
                            </div>
                        </div>
                        <div className="entrantsList">
                            <h2>List of Entrants:</h2>
                            <ul>{entrants}</ul>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

};

const mapDispatchToProps = dispatch => {
    return {
        getMyTourneys: (userId) => dispatch(actions.getMyTourneys(userId))
    };
};

const mapStateToProps = (state) => {
    return {
        username: state.auth.username,
        userId: state.auth.userId
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Tourney);