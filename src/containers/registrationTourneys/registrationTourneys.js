import React, {Component} from 'react';
import './registrationTourneys.css';
import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';
import Tourney from '../tourney/tourney';
import {NavLink} from 'react-router-dom';
import axios from 'axios';

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
            hoursUntilStart: '',
            minEntryFee: '',
            maxEntryFee: ''
        },
        searchArray: []
    }
    
    componentDidMount() {
        //this.props.getTourneys();
        axios.get('/getAllTourneys').then(res => {
            console.log(res.data);
            let tourneys = res.data.response;
            
            // get the time in days, hours, minutes until tournament starts
            for (let i=0; i<tourneys.length; i++) {
                let date = new Date(); 
                let timezone = date.getTimezoneOffset() * 60 * 1000;
                
                let currentTS = date.getTime() + timezone;
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
            
            this.setState({tourneys: tourneys, searchArray: tourneys});
        });
    }
    
    componentDidUpdate() {
        //console.log(this.props.tourneys);
        //console.log(this.state.tourneys);
        //console.log(this.state.search);
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
                                maxEntrants: '',
                                hoursUntilStart: '',
                                minEntryFee: '',
                                maxEntryFee: ''
                            }
                      });
    }
    
    updateSearch = (event, key) => {
        let newVal = event.target.value;
        let newState = {...this.state.search};
        newState[key] = newVal;
        this.setState({search: newState})
    }
    
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
                
                let date = new Date(); 
                let timezone = date.getTimezoneOffset() * 60 * 1000;
                
                let currentTS = date.getTime() + timezone;
                let hours = this.state.search.hoursUntilStart;
                let startTS = tourneysFound[i].startTS * 1000;
                if (currentTS < startTS - (hours * 60 * 60 * 1000) || currentTS > startTS) {
                    tourneysFound.splice(i, 1);
                    i--
                    continue;
                }
            }
            if (this.state.search.minEntryFee) {
                if (this.state.search.minEntryFee > tourneysFound[i].entryFee) {
                    tourneysFound.splice(i, 1);
                    i--
                    continue;
                } 
            }
            if (this.state.search.maxEntryFee) {
                if (this.state.search.maxEntryFee < tourneysFound[i].entryFee) {
                    tourneysFound.splice(i, 1);
                    i--
                    continue;
                } 
            }
        }
        
        // copy all the found tournaments to the state search array
        this.setState({searchArray: [...tourneysFound]});
    }
    
    resetTourneys = () => {
        this.setState({searchArray: [...this.state.tourneys],
                      search: {tourneyId: '',
                                tourneyId: '',
                                host: '',
                                product: '',
                                maxEntrants: '',
                                hoursUntilStart: '',
                                minEntryFee: '',
                                maxEntryFee: ''
                              }
                      });
    }
    
    render (){
        
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
                    <td>{data.entryFee} BTC</td>
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
                <div className="showFiltersDiv">
                    <div className="modalDiv">
                        <h3>Search Tournaments</h3>
                        <button className="toggleSearchBtn" onClick={this.toggleFiltersHandler}>Hide Search</button> <br/>
                        <div className="searchForm">
                            <input value={this.state.search.tourneyId} onChange={(event, key) => this.updateSearch(event, "tourneyId")} placeholder="Tournament id" /> <br/>
                            <input value={this.state.search.host} onChange={(event, key) => this.updateSearch(event, "host")} placeholder="Host" /> <br/>
                            <input value={this.state.search.product} onChange={(event, key) => this.updateSearch(event, "product")} placeholder="Product" /> <br/>
                            <input value={this.state.search.maxEntrants} onChange={(event, key) => this.updateSearch(event, "maxEntrants")} placeholder="Max Entrants" /> <br/>
                            <input value={this.state.search.hoursUntilStart} onChange={(event, key) => this.updateSearch(event, "hoursUntilStart")} placeholder="Hours until start" /> <br/>
                            <input value={this.state.search.minEntryFee} onChange={(event, key) => this.updateSearch(event, "minEntryFee")} placeholder="Min Entry Fee" /> <br/>
                            <input value={this.state.search.maxEntryFee} onChange={(event, key) => this.updateSearch(event, "maxEntryFee")} placeholder="Max Entry Fee" /> <br/>
                            <button className="submitBtn searchTourneySubmitBtn" onClick={this.searchTourneys}>Submit</button> <br/>
                            <button className="resetBtn" onClick={this.resetTourneys}>Reset</button>
                        </div>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="AllTourneysDiv">
                <div className="AllTourneys">
                    <h1>Tournament Registration</h1>
                    <div className="TourneyDiv">
                        <p>The full list of all tournaments currently in registration.</p>
                        <p>You can filter the tournaments by id, host, product, maximum number of entrants, hours until the tournament starts and entry fee.</p>
                        <button className="toggleSearchBtn" onClick={this.toggleFiltersHandler}>Filter</button>
                        {filtersDiv}
                        <table className="TourneyTable">
                            <thead>
                                <tr>
                                    <th>id</th>
                                    <th>Register</th>
                                    <th>Host</th>
                                    <th>Entry Fee</th>
                                    <th>Products</th>
                                    <th>Entrants</th>
                                    <th>Until Start</th>
                                    <th>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                               {tourneyData}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
        )
    }
};

const mapDispatchToProps = dispatch => {
    return {
        getTourneys: () => dispatch(actions.getTourneys())
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