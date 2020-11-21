import React, { Component } from 'react';
import {connect} from 'react-redux';
import './myTrades.css';
import * as actions from '../../store/actions/index';
import {Redirect, NavLink} from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../components/UI/Spinner/Spinner';
import {firebaseAuth} from "../../firebase/firebase";
import NavBottom from "../../components/navigation/nav-bottom/nav-bottom";

class MyTrades extends Component {
    
    state = {
        trades: [],
        loading: true,
        authFail: false,
        error: false,
        showFilters: false,
        search: {
            tourneyId: '',
            product: '',
            side: ''
        },
        searchArray: [],
        sortDirections: {tourneyId: null, 
                timestamp: null,
                product: null,
                side: null,
                quantity: null,
                price: null}
    }

    componentDidMount() {
        
        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                if (user.emailVerified == false) {
                    this.setState({authFail: true});
                } else {
                    this.props.updateUserIdToken(user.uid, user.xa);
                    axios.post('/api/getMyTrades', {"userId": user.uid}).then(res => {
                        let trades = res.data.response;

                        for (let i=0; i<trades.length; i++) {
                            let dateStr = trades[i].date + ' ' + trades[i].time;
                            let dateObj = new Date(dateStr);
                            let timestamp = dateObj.getTime();
                            trades[i]["timestamp"] = timestamp;
                        }
                        this.setState({trades: trades, loading: false, searchArray: res.data.response});
                    }).catch(err => {
                        this.setState({error: true});
                    });
                }
            } else {
                this.setState({authFail: true});
            }
        });
    }

    // handler to update the search object in state
    updateSearch = (event, key) => {
        let newVal = event.target.value;
        let newState = {...this.state.search};
        newState[key] = newVal;
        this.setState({search: newState})
    }
    
    // SHOW/HIDE FILTERS DIV
    toggleFiltersHandler = (event) => {
        this.setState({showFilters: !this.state.showFilters,
                        search: {
                            tourneyId: '',
                            host: '',
                            product: '',
                            maxEntrants: '',
                            hoursUntilStart: ''
                        }
                    });
    }
    
    // SEARCH TRADES
    searchTrades = () => {
        // copy all the trades to an array
        let tradesFound = [...this.state.trades];
        
        // iterate over all the tournaments
        for (let i=0; i<tradesFound.length; i++) {
            // check if we need to check that field, if we do and it passes the critera then leave it in the array and move onto the next field
            if (this.state.search.tourneyId) {
                // if it doesnt meet the search criteria, remove it from the array and move to next tournament 
                if (this.state.search.tourneyId != tradesFound[i].tourneyId) {
                    tradesFound.splice(i, 1);
                    i--
                    continue;
                } 
            }

            if (this.state.search.product) {
                if (this.state.search.product != tradesFound[i].productName) {
                    tradesFound.splice(i, 1);
                    i--
                    continue;
                } 
            }
            
            if (this.state.search.side) {
                if (this.state.search.side != tradesFound[i].side) {
                    tradesFound.splice(i, 1);
                    i--
                    continue;
                } 
            }
        }
        
        // copy all the found tournaments to the state search array
        this.setState({searchArray: [...tradesFound]});
    }
    
    // RESET TRADES TABLE
    resetTrades = () => {
        this.setState(
            {searchArray: [...this.state.trades],
              search: {tourneyId: '',
                        product: '',
                        side: ''
                      }
            }
        );
    }
    
    // SORT TABLE
    sortColumn = (field) => {
        
        // check the current sorted direction of the field
        let direction = this.state.sortDirections[field]

        if (direction == null || direction == "descending") {
            direction = "ascending";
        } else if (direction == "ascending") {
            direction = "descending";
        }
        
        // sort all the trades
        let tradesArr = this.state.trades;
        let len = tradesArr.length;
        for (let i = len-1; i>=0; i--) {
            for (let j = 1; j<=i; j++) {
                if (direction == "ascending") {
                    // sort into ascending order
                    if (tradesArr[j-1][field] > tradesArr[j][field]) {
                        let temp = tradesArr[j-1];
                        tradesArr[j-1] = tradesArr[j];
                        tradesArr[j] = temp;
                    }
                } else if (direction == "descending") {
                    // sort into descending order
                    if (tradesArr[j-1][field] < tradesArr[j][field]) {
                        let temp = tradesArr[j-1];
                        tradesArr[j-1] = tradesArr[j];
                        tradesArr[j] = temp;
                    }
                }
                    
            }
        }
        
        // sort the filtered search array
        let searchArr = this.state.searchArray;
        len = searchArr.length;
        for (let i = len-1; i>=0; i--) {
            for (let j = 1; j<=i; j++) {
                if (direction == "ascending") {
                    // sort into ascending order
                    if (searchArr[j-1][field] > searchArr[j][field]) {
                        let temp = searchArr[j-1];
                        searchArr[j-1] = searchArr[j];
                        searchArr[j] = temp;
                    }
                } else if (direction == "descending") {
                    // sort into descending order
                    if (searchArr[j-1][field] < searchArr[j][field]) {
                        let temp = searchArr[j-1];
                        searchArr[j-1] = searchArr[j];
                        searchArr[j] = temp;
                    }
                }
            }
        }
        
        let sortDirections = {...this.state.sortDirections};
        sortDirections[field] = direction;
        
        this.setState({trades: tradesArr, searchArr: searchArr, sortDirections: sortDirections})
    }
    
    render() {
        
        // REDIRECTS
        let redirect = null;
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
        
        // LOADING SPINNER
        let spinner = null;
        if (this.state.loading) spinner = <Spinner />
        
            
        // TRADES TABLE
        let tableBody = null;
        
        if (this.state.searchArray.length > 0) {
            tableBody = this.state.searchArray.map((trade, index) => {
                return (
                    <tr key={index}>
                        <td><NavLink style={{"color": "rgb(77, 134, 247)", "fontWeight": "bold"}} to={"/tourneys/"+trade.tourneyId}>{trade.tourneyId}</NavLink></td>
                        <td>{trade.date}</td>
                        <td>{trade.time}</td>
                        <td>{trade.productName}</td>
                        <td>{trade.side}</td>
                        <td>{trade.quantity}</td>
                        <td>{trade.price}</td>
                    </tr>
                );
            })
        }
        
        // SEARCH FILTERS
        let filtersDiv = null;
        
        if (this.state.showFilters) {
            filtersDiv = (
                <div className="darkBg">
                    <div className="modalDiv">
                        <h3>Filter Tournaments</h3>
                        <button className="toggleSearchBtn" onClick={this.toggleFiltersHandler}>Hide Search</button> <br/>
                        <div className="searchForm">
                            <input type="text" onChange={(event, key) => this.updateSearch(event, "tourneyId")} placeholder="Tournament id" /> <br/>
                            <input type="text" onChange={(event, key) => this.updateSearch(event, "product")} placeholder="Product" /> <br/>
                            <input type="text" onChange={(event, key) => this.updateSearch(event, "side")} placeholder="Side" /> <br/>
                            <button className="submitBtn searchTourneySubmitBtn" onClick={this.searchTrades}>Submit</button> <br/>
                            <button className="resetBtn" onClick={this.resetTrades}>Reset</button>
                        </div>
                    </div>
                </div>
            );
        }
        
        return (
            <div>
                <div className="MyTradesDiv">
                    {redirect}
                    <div className="MyTradesSubSiv">
                        <h1>My Trades</h1>
                        {spinner}
                        <div className="MyTradesSubSiv2">
                            <p>A full list of all trades found from your API for every trading tournament that you have entered.</p>
                            <button className="toggleSearchBtn" onClick={this.toggleFiltersHandler}>Filter</button>
                            {filtersDiv}
                            <table className="TradesTable">
                                <thead>
                                    <tr>
                                        <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("tourneyId")}>Tourney id</th>
                                        <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("timestamp")}>Date</th>
                                        <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("timestamp")}>Time</th>
                                        <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("productName")}>Product</th>
                                        <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("side")}>Side</th>
                                        <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("quantity")}>Quantity</th>
                                        <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("price")}>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableBody}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <NavBottom />
            </div>
        )
    }
};


const mapDispatchToProps = dispatch => {
    return {
        updateUserIdToken: (userId, token) => dispatch(actions.updateUserIdToken(userId, token))
    };
};

const mapStateToProps = state => {
    return {
        userId: state.auth.userId
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(MyTrades);