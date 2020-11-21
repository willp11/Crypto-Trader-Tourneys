import React, {Component} from 'react';
import './completedTourneys.css';
import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';
import Tourney from '../tourney/tourney';
import {NavLink, Redirect} from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../components/UI/Spinner/Spinner';
import {firebaseAuth} from "../../firebase/firebase";
import NavBottom from "../../components/navigation/nav-bottom/nav-bottom";

class CompletedTourneys extends Component {
    
    state = {
        tourneys: [],
        showProducts: false,
        productsToShow: [],
        indexToShow: null,
        showFilters: false,
        search: {
            tourneyId: '',
            host: ''
        },
        notFoundMsg: null,
        authFail: false,
        loading: true,
        error: false
    }
    
    componentDidMount() {
        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                if (user.emailVerified == false) {
                    this.setState({authFail: true});
                } else {
                    this.props.updateUserIdToken(user.uid, user.xa);
                    this.setState({loading: false})
                }
            } else {
                this.setState({authFail: true});
            }
        });
    }

    showProductsHandler = (event, index) => {
        let products;
        let showProducts;
        if (!this.state.showProducts) {
            products = this.state.tourneys[index].products;
            showProducts = true;
        } else {
            products = [];
            showProducts = false;
        }
        this.setState({showProducts: showProducts, productsToShow: products, indexToShow: index});
    }
    
    toggleFiltersHandler = (event) => {
        this.setState({showFilters: !this.state.showFilters,
                            search: {
                                tourneyId: '',
                                host: '',
                                product: '',
                                maxEntrants: ''
                            }
                      });
    }
    
    updateSearch = (event, key) => {
        let newVal = event.target.value;
        let newState = {...this.state.search};
        newState[key] = newVal;
        this.setState({search: newState})
    }
    
    searchByTourneyIdHandler = (tourneyId) => {
        this.setState({loading: true});
        axios.post('/api/getCompletedTourneys', {"fieldToSearch": "tourneyId", "tourneyId": tourneyId}).then(res => {
            let tourneys = res.data.response;
            let notFoundMsg = null;
            if (tourneys.length == 0) {
                notFoundMsg = <p style={{"color": "#f7716d", "fontWeight": "bold"}}>No results found!</p>
            } else {
                for (let i=0; i<tourneys.length; i++) {
                    // duration
                    let duration = (tourneys[i].endTS - tourneys[i].startTS) / 60 / 60 / 24;
                    tourneys[i]['duration'] = duration;
                }
            }
            this.setState({tourneys: tourneys, notFoundMsg: notFoundMsg, loading: false});
        }).catch(err => {
            this.setState({error: true});
        });;
    }
    
    searchByHostHandler = (host) => {
        this.setState({loading: true});
        axios.post('/api/getCompletedTourneys', {"fieldToSearch": "host", "host": host}).then(res => {

            let tourneys = res.data.response;
            let notFoundMsg = null;
            if (tourneys.length == 0) {
                notFoundMsg = <p style={{"color": "#f7716d", "fontWeight": "bold"}}>No results found!</p>
            } else {
                for (let i=0; i<tourneys.length; i++) {
                    // duration
                    let duration = (tourneys[i].endTS - tourneys[i].startTS) / 60 / 60 / 24;
                    tourneys[i]['duration'] = duration;
                }
            }
                                                                                          
            this.setState({tourneys: tourneys, notFoundMsg: notFoundMsg, loading: false});
        }).catch(err => {
            this.setState({error: true});
        });
    }
    
    render (){
        
        // REDIRECT
        let redirect = null;
        if (this.state.authFail) redirect = <Redirect to="/login" />
            
        if (this.state.error) redirect = <Redirect to="/error" />
            
        // LOADING SPINNER
        let spinner = null;
        if (this.state.loading) spinner= <Spinner/>
        
        let tourneyData = this.state.tourneys.map((data, index) => {
            let navPath = "/tourneys/" + data.tourneyId;
            
            let showProdStr = "Show";
            let products = null;
            let productsDiv = null;
            
            if (index == this.state.indexToShow && this.state.showProducts) {
                showProdStr = "Hide";
                products = this.state.productsToShow.map(product => {
                    return (
                        <li key={product}>{product}</li> 
                    )
                });
                productsDiv = (
                    <div className="showProducts">
                        <ul>
                            {products}
                        </ul>
                    </div>
                );
            }
            
            return (
                <tr key={data.tourneyId}>
                    <td>{data.tourneyId}</td>
                    <td><NavLink to={navPath}><button>Go to Lobby</button></NavLink></td>
                    <td>{data.host}</td>
                    <td>{data.profitType}</td>
                    <td>
                        <button onClick={(event, i) => this.showProductsHandler(event, index)}>{showProdStr}</button> <br/> 
                        {productsDiv}
                    </td>
                    <td>{data.startDate} </td>
                    <td>{data.startTime}</td>
                    <td>{data.duration}d</td>
                </tr>
            )
        });
        
        let tourneyTable = null;
        let notFoundMsg = this.state.notFoundMsg;
        if (this.state.tourneys.length > 0) {
            tourneyTable = (
                <table className="TourneyTable">
                    <thead>
                        <tr>
                            <th>id</th>
                            <th>Lobby</th>
                            <th>Host</th>
                            <th>Profit Type</th>
                            <th>Products</th>
                            <th>Start Date</th>
                            <th>Start Time</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                       {tourneyData}
                    </tbody>
                </table>
            )
        } 
        
        return (
            <div>
                <div className="AllTourneysDiv">
                    {redirect}
                    <div className="AllTourneys">
                        <h1 >Completed Tournaments</h1>
                        <div className="TourneyDiv">
                            <h2>Search</h2>
                            <p>You can find any tournament that has already been completed by searching for the tournament id or host name.</p>
                            <input className="searchCompletedTourneysInput" placeholder="Tournament id" onChange={(event) => this.updateSearch(event, "tourneyId")} />
                            <button className="submitBtn" onClick={() => this.searchByTourneyIdHandler(this.state.search.tourneyId)}>Search</button> <br/>
                            <input className="searchCompletedTourneysInput" placeholder="Host" onChange={(event) => this.updateSearch(event, "host")} />
                            <button className="submitBtn" onClick={() => this.searchByHostHandler(this.state.search.host)}>Search</button> <br/>
                            {spinner}
                            {tourneyTable}
                            {notFoundMsg}
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
        loading: state.tourneys.loading,
        error: state.tourneys.error,
        tourneys: state.tourneys.allTourneys
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(CompletedTourneys);