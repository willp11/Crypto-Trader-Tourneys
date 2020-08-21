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
        maxEntrants: null,
        startDate: null,
        endDate: null, 
        startTime: null,
        endTime: null, 
        entrants: [],
        entrantProfits: [],
        registered: false,
        products: null,
        showConfirm: false,
        redirect: false,
        active: null,
        editingBalance: false,
        quoteCurrency: null,
        balance: null,
        tourneyState: null
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
                                                active: false
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
                                                        balance: balance
                                            });
                                        });
                                    } else {
                                        let balance = 0;
                                        this.setState({host: tourneyData.host,
                                                    noEntrants: tourneyData.noEntrants, 
                                                    maxEntrants: tourneyData.maxEntrants,
                                                    startDate: tourneyData.startDate,
                                                    endDate: tourneyData.endDate,
                                                    startTime: tourneyData.startTime,
                                                    endTime: tourneyData.endTime,
                                                    entrants: entrants,
                                                    products: products,
                                                    registered: isRegistered,
                                                    active: true,
                                                    balance: balance
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
        console.log(this.state);
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
    
    deleteHandler = () => {
        console.log("delete tourney");
        this.setState({showConfirm: true});
    }
    
    confirmHandler = () => {
        axios.post("/deleteTournament", {"tourneyId": this.state.tourneyId, "userId": this.props.userId}).then(res => {
            console.log("tourney deleted");
            this.setState({showConfirm: false, redirect: true});
        });
    }
    
    cancelHandler = () => {
        console.log("cancelled");
        this.setState({showConfirm: false});
    }
    
        
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
    
    render() {
        
        let deleteBtn = null;
        if (this.state.hostId === true && this.state.active == false) {
            deleteBtn = (
                <button onClick={this.deleteHandler}>Delete Tournament</button>
            );
        }
        
        let confirmationBox = null;
        if (this.state.showConfirm)
        {
            confirmationBox = (
                <div>
                    <p>Are you sure?</p>
                    <button onClick={this.cancelHandler}>Cancel</button>
                    <button onClick={this.confirmHandler}>Confirm</button>
                </div>
            );
        }

        let tourneyBody = (
            <h2>Loading</h2>
        )
        
        let entrants = null;
        if (this.state.entrants && this.state.entrantProfits) {
            console.log(this.state.entrants);
            entrants = this.state.entrants.map((entrant, index) => {
                return (
                    <li key={entrant}>{index+1}. {entrant}: {this.state.entrantProfits[index]}% </li>
                );
            })
        }
        
        let registerBtn = (
            <button onClick={this.submitHandler}>Register</button>
        );
        let balance = (
            <div>
                <h2>Balance:</h2>
                <p>Enter tournament starting balance ({this.state.quoteCurrency}):</p>
                <input className="balanceInput" type="text" placeholder="Starting Balance" onChange={(event) => this.editBalanceHandler(event)} />
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
                <button onClick={this.submitHandler}>Unregister</button>
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
                        <input className="editBalanceInput" type="text" placeholder={this.state.balance} onChange={(event) => this.editBalanceHandler(event)} />
                        <button onClick={this.submitBalanceHandler}>Submit</button>
                    </div>
                );
            } else {
                editStartBalanceBtn = (
                    <button onClick={this.showBalanceInput}>Edit Starting Balance</button>
                );
            }
        }
        
        if (this.state.host != null) {
            tourneyBody = (
                <div className="tourneyBody">
                    <h2>Host</h2>
                    <p>{this.state.host}</p>
                    <h2>Entrants</h2>
                    <p>{this.state.noEntrants}/{this.state.maxEntrants}</p>
                    <h2>Start Time</h2>
                    {startTimePa}
                    <h2>End Time</h2>
                    {endTimePa}
                    {balance}
                    {registerBtn}<br/>
                    {editStartBalanceBtn}<br/>
                    {deleteBtn}
                    {confirmationBox}
                </div>
            )
        }
        
        let binanceProducts = null;
        let FTXProducts = null;
        let bitfinexProducts = null;
        if (this.state.products) {
            
            if (this.state.products['Binance']) {
                binanceProducts = Object.keys(this.state.products['Binance']).map(index => {
                    return (
                        <p key={index}>{this.state.products['Binance'][index]}</p>
                    )
                });
            };
            
            if (this.state.products['FTX']) {
                FTXProducts = Object.keys(this.state.products['FTX']).map(index => {
                    return (
                        <p key={index}>{this.state.products['FTX'][index]}</p>
                    )
                });
            };
            
            if (this.state.products['Bitfinex']) {
                bitfinexProducts = Object.keys(this.state.products['Bitfinex']).map(index => {
                    return (
                        <p key={index}>{this.state.products['Bitfinex'][index]}</p>
                    )
                });
            }
        }
        
        let redirect = null;
        if (this.state.redirect) redirect = <Redirect to="/allTournaments"/>
        if (!this.props.userId) {
            redirect = (
                <Redirect to="/login" />
            )
        }
        

        return (
            <div>
                {redirect}
                <h1>Tournament {this.state.tourneyId}</h1>
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