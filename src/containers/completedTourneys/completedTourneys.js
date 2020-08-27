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
            host: ''
        },
        notFoundMsg: null
    }
    
    componentDidMount() {
        
    }
    
    componentDidUpdate() {
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
    
    searchByTourneyIdHandler = (tourneyId) => {
        axios.post('/getCompletedTourneys', {"fieldToSearch": "tourneyId", "tourneyId": tourneyId}).then(res => {
            console.log(res.data);
            let tourneys = res.data.response;
            let notFoundMsg = null;
            if (tourneys.length == 0) {
                notFoundMsg = <p style={{"fontWeight":"bold", "color":"#C62828"}}>No results found!</p>
            }
            this.setState({tourneys: tourneys, notFoundMsg: notFoundMsg});
        });
    }
    
    searchByHostHandler = (host) => {
        axios.post('/getCompletedTourneys', {"fieldToSearch": "host", "host": host}).then(res => {
            console.log(res.data);
            let tourneys = res.data.response;
            let notFoundMsg = null;
            if (tourneys.length == 0) {
                notFoundMsg = <p style={{"fontWeight":"bold", "color":"#C62828"}}>No results found!</p>
            }
            this.setState({tourneys: tourneys, notFoundMsg: notFoundMsg});
        });
    }
    
    render (){
        
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
                    <td>{data.entryFee}</td>
                    <td>{data.startDate} </td>
                    <td>{data.startTime}</td>
                    <td>{data.endDate}</td>
                    <td>{data.endTime}</td>
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
                            <th>Entry Fee</th>
                            <th>Start Date</th>
                            <th>Start Time</th>
                            <th>End Date</th>
                            <th>End Time</th>
                        </tr>
                    </thead>
                    <tbody>
                       {tourneyData}
                    </tbody>
                </table>
            )
        } 
        
        return (
            <div className="AllTourneysDiv">
                <div className="AllTourneys">
                    <h1 >Completed Tournaments</h1>
                    <div className="TourneyDiv">
                        <h2>Search</h2>
                        <p>You can find any tournament that has already been completed by searching for the tournament id or host name.</p>
                        <input className="searchCompletedTourneysInput" placeholder="Tournament id" onChange={(event) => this.updateSearch(event, "tourneyId")} />
                        <button className="submitBtn" onClick={() => this.searchByTourneyIdHandler(this.state.search.tourneyId)}>Search</button> <br/>
                        <input className="searchCompletedTourneysInput" placeholder="Host" onChange={(event) => this.updateSearch(event, "host")} />
                        <button className="submitBtn" onClick={() => this.searchByHostHandler(this.state.search.host)}>Search</button> <br/>
                        {tourneyTable}
                        {notFoundMsg}
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