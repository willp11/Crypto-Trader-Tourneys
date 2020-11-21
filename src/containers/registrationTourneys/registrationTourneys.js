import React, {Component} from 'react';
import './registrationTourneys.css';
import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';
import Tourney from '../tourney/tourney';
import {NavLink, Redirect} from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../components/UI/Spinner/Spinner';
import {firebaseAuth} from "../../firebase/firebase";
import NavBottom from "../../components/navigation/nav-bottom/nav-bottom";

class RegistrationTourneys extends Component {
    
    state = {
        tourneys: [],
        showProducts: false,
        productsToShow: [],
        indexToShow: null,
        showFilters: false,
        search: {
            tourneyId: '',
            host: '',
            product: '',
            maxEntrants: '',
            hoursUntilStart: ''
        },
        searchArray: [],
        sortDirections: {tourneyId: null, 
                duration: null,
                startTS: null,
                endTS: null,
                maxEntrants: null},
        loading: true,
        authFail: false,
        error: false
    }
    
    componentDidMount() {
        
        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                if (user.emailVerified == false) {
                    this.setState({authFail: true});
                } else {
                    this.props.updateUserIdToken(user.uid, user.xa);
                }
            } else {
                this.setState({authFail: true});
            }
        });
        
        axios.get('/api/getAllTourneys').then(res => {
            let tourneys = res.data.response;
            
            // get the time in days, hours, minutes until tournament starts
            for (let i=0; i<tourneys.length; i++) {
                
                // get utc timestamp
                let date = new Date(); 
                let currentTS = date.getTime();
                
                // calculate the time until tournament starts
                let startTS = tourneys[i].startTS * 1000;
                let currentHrs = currentTS / 1000 / 60 / 60;
                let startHrs = startTS / 1000 / 60 / 60;

                let daysUntilStart;
                let hoursUntilStart = startHrs - currentHrs;
                let minutesUntilStart;
                if (hoursUntilStart > 0) {
                    daysUntilStart = Math.floor(hoursUntilStart/24);
                    hoursUntilStart = (hoursUntilStart - (daysUntilStart*24)).toFixed(2);
                    minutesUntilStart = (hoursUntilStart % 1)*60;
                    
                    hoursUntilStart = Math.floor(hoursUntilStart);
                    minutesUntilStart = Math.ceil(minutesUntilStart);
                } else {
                    daysUntilStart = 0;
                    hoursUntilStart = 0;
                    minutesUntilStart = 0;
                }
                
                let untilStart = {days: daysUntilStart, hours: hoursUntilStart, minutes: minutesUntilStart};
                tourneys[i]['untilStart'] = untilStart;
                
                // duration
                let duration = (tourneys[i].endTS - tourneys[i].startTS) / 60 / 60 / 24;
                tourneys[i]['duration'] = duration;
            }
            
            this.setState({tourneys: tourneys, searchArray: tourneys, loading: false});
        }).catch(err => {
            this.setState({error: true});
        });
    }
    
    showProductsHandler = (event, index) => {
        let products;
        let showProducts;
        if (!this.state.showProducts) {
            products = this.state.searchArray[index].products;
            showProducts = true;
        } else {
            products = [];
            showProducts = false;
        }
        this.setState({showProducts: showProducts, productsToShow: products, indexToShow: index});
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
    
    // handler to update the search object in state
    updateSearch = (event, key) => {
        let newVal = event.target.value;
        let newState = {...this.state.search};
        newState[key] = newVal;
        this.setState({search: newState})
    }
    
    // search all the tournaments
    searchTourneys = () => {
        // copy all the tournaments to an array
        let tourneysFound = [...this.state.tourneys];
        
        // iterate over all the tournaments
        for (let i=0; i<tourneysFound.length; i++) {
            // check if we need to check that field, if we do and it passes the critera then leave it in the array and move onto the next field
            if (this.state.search.tourneyId) {
                // if it doesnt meet the search criteria, remove it from the array and move to next tournament 
                if (this.state.search.tourneyId != tourneysFound[i].tourneyId) {
                    tourneysFound.splice(i, 1);
                    i--
                    continue;
                } 
            }
            if (this.state.search.host) {
                if (this.state.search.host != tourneysFound[i].host) {
                    tourneysFound.splice(i, 1);
                    i--
                    continue;
                } 
            }
            if (this.state.search.product) {
                if (!tourneysFound[i].products.includes(this.state.search.product)) {
                    tourneysFound.splice(i, 1);
                    i--
                    continue;
                } 
            }
            if (this.state.search.maxEntrants) {
                if (this.state.search.maxEntrants < tourneysFound[i].maxEntrants) {
                    tourneysFound.splice(i, 1);
                    i--
                    continue;
                } 
            }
            if (this.state.search.hoursUntilStart) {
                
                // get utc timestamp
                let date = new Date(); 
                let currentTS = date.getTime();
                
                let hours = this.state.search.hoursUntilStart;
                let startTS = tourneysFound[i].startTS * 1000;
                if (currentTS < startTS - (hours * 60 * 60 * 1000) || currentTS > startTS) {
                    tourneysFound.splice(i, 1);
                    i--
                    continue;
                }
            }
        }
        
        // copy all the found tournaments to the state search array
        this.setState({searchArray: [...tourneysFound]});
    }
    
    // reset the tournaments table
    resetTourneys = () => {
        this.setState({searchArray: [...this.state.tourneys],
                      search: {tourneyId: '',
                                host: '',
                                product: '',
                                maxEntrants: '',
                                hoursUntilStart: ''
                              }
                      });
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
        
        // sort all the tournaments
        let tourneysArr = this.state.tourneys;
        let len = tourneysArr.length;
        for (let i = len-1; i>=0; i--) {
            for (let j = 1; j<=i; j++) {
                if (direction == "ascending") {
                    // sort into ascending order
                    if (tourneysArr[j-1][field] > tourneysArr[j][field]) {
                        let temp = tourneysArr[j-1];
                        tourneysArr[j-1] = tourneysArr[j];
                        tourneysArr[j] = temp;
                    }
                } else if (direction == "descending") {
                    // sort into descending order
                    if (tourneysArr[j-1][field] < tourneysArr[j][field]) {
                        let temp = tourneysArr[j-1];
                        tourneysArr[j-1] = tourneysArr[j];
                        tourneysArr[j] = temp;
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
        
        this.setState({tourneys: tourneysArr, searchArr: searchArr, sortDirections: sortDirections})
    }
    
    render (){
        
        // REDIRECT IF NOT LOGGED IN
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
        if (this.state.loading) spinner = <Spinner/>
        
        // TOURNAMENT TABLE INFO
        let tourneyData = this.state.searchArray.map((data, index) => {
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
                    <td>{data.noEntrants}/{data.maxEntrants}</td>
                    <td>{data.untilStart.days}d {data.untilStart.hours}h {data.untilStart.minutes}m</td>
                    <td>{data.duration}d</td>
                </tr>
            )
        });

        let filtersDiv = null;

        if (this.state.showFilters) {
            filtersDiv = (
                <div className="darkBg">
                    <div className="modalDiv">
                        <h3>Filter Tournaments</h3>
                        <button className="toggleSearchBtn" onClick={this.toggleFiltersHandler}>Hide Search</button> <br/>
                        <div className="searchForm">
                            <input value={this.state.search.tourneyId} onChange={(event, key) => this.updateSearch(event, "tourneyId")} placeholder="Tournament id" /> <br/>
                            <input value={this.state.search.host} onChange={(event, key) => this.updateSearch(event, "host")} placeholder="Host" /> <br/>
                            <input value={this.state.search.product} onChange={(event, key) => this.updateSearch(event, "product")} placeholder="Product" /> <br/>
                            <input value={this.state.search.maxEntrants} onChange={(event, key) => this.updateSearch(event, "maxEntrants")} placeholder="Max Entrants" /> <br/>
                            <input value={this.state.search.hoursUntilStart} onChange={(event, key) => this.updateSearch(event, "hoursUntilStart")} placeholder="Hours until start" /> <br/>
                            <button className="submitBtn searchTourneySubmitBtn" onClick={this.searchTourneys}>Submit</button> <br/>
                            <button className="resetBtn" onClick={this.resetTourneys}>Reset</button>
                        </div>
                    </div>
                </div>
            );
        }
        
        return (
            <div>
                <div className="AllTourneysDiv">
                    {redirect}
                    <div className="AllTourneys">
                        <h1>Tournament Registration</h1>
                        {spinner}
                        <div className="TourneyDiv">
                            <p>The full list of all <b>public</b> tournaments currently in registration.</p>
                            <button className="toggleSearchBtn" onClick={this.toggleFiltersHandler}>Filter</button>
                            {filtersDiv}
                            <table className="TourneyTable">
                                <thead>
                                    <tr>
                                        <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("tourneyId")}>id</th>
                                        <th>Register</th>
                                        <th>Host</th>
                                        <th>Profit Type</th>
                                        <th>Products</th>
                                        <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("maxEntrants")}>Entrants</th>
                                        <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("startTS")}>Until Start</th>
                                        <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("duration")}>Duration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                   {tourneyData}
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
        loading: state.tourneys.loading,
        error: state.tourneys.error,
        tourneys: state.tourneys.allTourneys
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationTourneys);