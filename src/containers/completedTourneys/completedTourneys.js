import React, {Component} from 'react';
import './completedTourneys.css';
import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';
import Tourney from '../tourney/tourney';
import {NavLink} from 'react-router-dom';
import axios from 'axios';

class CompletedTourneys extends Component {
    
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
            hoursUntilEnd: ''
        },
        searchArray: []
    }
    
    componentDidMount() {
        //this.props.getTourneys();
        axios.get('/getCompletedTourneys').then(res => {
            console.log(res.data);
            let tourneys = res.data.response;
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
        }
        
        // copy all the found tournaments to the state search array
        this.setState({searchArray: [...tourneysFound]});
    }
    
    resetTourneys = () => {
        this.setState({search: {
                            tourneyId: '',
                            host: '',
                            product: '',
                            maxEntrants: ''
                        }, 
                       searchArray: [...this.state.tourneys]});
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
                    <td>{data.host}</td>
                    <td>
                        <button onClick={(event, i) => this.showProductsHandler(event, index)}>{showProdStr}</button> <br/> 
                        {productsDiv}
                    </td>
                    <td>{data.noEntrants}/{data.maxEntrants}</td>
                    <td>{data.startDate} </td>
                    <td>{data.startTime}</td>
                    <td>{data.endDate}</td>
                    <td>{data.endTime}</td>
                    <td><NavLink to={navPath}><button>Go to Lobby</button></NavLink></td>
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
                            <button className="submitBtn" onClick={this.searchTourneys}>Submit</button> <br/>
                            <button className="resetBtn" onClick={this.resetTourneys}>Reset</button>
                        </div>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="AllTourneysDiv">
                <div className="AllTourneys">
                    <h1 >Completed Tournaments</h1>
                    <div className="TourneyDiv">
                        <button className="toggleSearchBtn" onClick={this.toggleFiltersHandler}>Search</button>
                        {filtersDiv}
                        <table className="TourneyTable">
                            <thead>
                                <tr>
                                    <th>id</th>
                                    <th>Host</th>
                                    <th>Products</th>
                                    <th>Entrants</th>
                                    <th>Start Date</th>
                                    <th>Start Time</th>
                                    <th>End Date</th>
                                    <th>End Time</th>
                                    <th>Register</th>
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

export default connect(mapStateToProps, mapDispatchToProps)(CompletedTourneys);