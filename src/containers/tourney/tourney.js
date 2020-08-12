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
        registered: false,
        products: null,
        showConfirm: false,
        redirect: false,
        active: null
    }

    componentDidMount() {
        console.log(this.props.match.params.tourneyId);
        // registering tournaments
        axios.post('/getTourneyInfo', {"tourneyId": this.props.match.params.tourneyId} ).then(res => { 
            let tourneyData = res.data;
            
            console.log(res.data);
            
            if (res.data.tourneyId != "No match") {
                
                let isRegistered = false;

                let entrants;

                axios.post('/checkIfHost', {"tourneyId": this.state.tourneyId, "userId": this.props.userId}).then(res => {

                    if (res.data.response) this.setState({hostId: true});

                    axios.post('/getProducts', {"tourneyId": this.state.tourneyId}).then(res => {
                        let products = res.data;
                        axios.post('/getTourneyEntrants', {"tourneyId": this.state.tourneyId}).then(res => {

                            entrants = res.data.response;

                            isRegistered = entrants.includes(this.props.username);

                            this.setState({host: tourneyData.host,
                                        noEntrants: tourneyData.noEntrants, 
                                        maxEntrants: tourneyData.maxEntrants,
                                        startDate: tourneyData.startDate,
                                        endDate: tourneyData.endDate,
                                        startTime: tourneyData.startTime,
                                        endTime: tourneyData.endTime,
                                        entrants: entrants,
                                        registered: isRegistered,
                                        products: products
                            });
                        });
                    });   
                });
            } else {
                // active tournaments
                axios.post('/getActiveTourneyInfo', {"tourneyId": this.state.tourneyId} ).then(res => { 

                    let tourneyData = res.data;
                    if (res.data.response) this.setState({hostId: true});

                    axios.post('/getActiveProducts', {"tourneyId": this.state.tourneyId}).then(res => {
                        let products = res.data;
                        axios.post('/getActiveEntrants', {"tourneyId": this.state.tourneyId}).then(res => {
                            let entrants = res.data.response;

                            this.setState({host: tourneyData.host,
                                        noEntrants: tourneyData.noEntrants, 
                                        maxEntrants: tourneyData.maxEntrants,
                                        startDate: tourneyData.startDate,
                                        endDate: tourneyData.endDate,
                                        startTime: tourneyData.startTime,
                                        endTime: tourneyData.endTime,
                                        entrants: entrants,
                                        products: products,
                                        active: true
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
                    let newEntrantsArr = res.data.response; 
                    let currentState = {...this.state};
                    currentState['registered'] = false;
                    currentState['noEntrants'] -= 1;
                    currentState['entrants'] = newEntrantsArr;
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
            axios.post("/tourneyRegistration", dbEntrantData).then(res => {
                console.log(res);
                axios.post('/getTourneyEntrants', {"tourneyId": this.state.tourneyId}).then(res => {
                    let newEntrantsArr = res.data.response; 
                    let currentState = {...this.state};
                    currentState['registered'] = true;
                    currentState['noEntrants'] += 1;
                    currentState['entrants'] = newEntrantsArr;
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
    
    render() {
        
        let deleteBtn = null;
        if (this.state.hostId === true) {
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
        if (this.state.entrants) {
            entrants = this.state.entrants.map(entrant => {
                return (
                    <li key={entrant}>{entrant}</li>
                );
            })
        }
        
        let registerBtn = (
            <button onClick={this.submitHandler}>Register</button>
        );
        let startTimePa = <p>{this.state.startDate} - {this.state.startTime}</p>
        
        if (this.state.registered) {
            registerBtn = (
                <button onClick={this.submitHandler}>Unregister</button>
            )
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
                    <p>{this.state.endDate} - {this.state.endTime}</p>
                    {registerBtn}
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
                                <h3>Binance:</h3>
                                {binanceProducts}
                            </div>
                            <div className="exchangeSublist">
                                <h3>FTX:</h3>
                                {FTXProducts}
                            </div>
                            <div className="exchangeSublist">
                                <h3>Bitfinex:</h3>
                                {bitfinexProducts}
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