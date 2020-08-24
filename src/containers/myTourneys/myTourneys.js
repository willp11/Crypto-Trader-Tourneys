import React, {Component} from 'react';
import './myTourneys.css';
import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';
import {firebaseDB} from '../../firebase/firebase';
import {NavLink} from 'react-router-dom';
import {Redirect} from 'react-router-dom';
import axios from 'axios';

class MyTourneys extends Component {
    
    state = {
        tourneys: [],
        activeTourneys: [],
        completedTourneys: [],
        showProducts: false,
        productsToShow: [],
        indexToShow: null,
        tableToShow: null
    }
    
    componentDidMount() {
        let tourneys = [];
        axios.post('/getMyTourneys', {"userId": this.props.userId}).then(res => {
            tourneys = res.data.response;
            this.setState({
                tourneys: tourneys
            });
        });
        
        let activeTourneys = [];
        axios.post('/getMyActiveTourneys', {"userId": this.props.userId}).then(res => {
            activeTourneys = res.data.response;
            this.setState({
                activeTourneys: activeTourneys
            });
        });
        
        let completedTourneys = [];
        axios.post('/getMyCompletedTourneys', {"userId": this.props.userId}).then(res => {
            completedTourneys = res.data.response;
            this.setState({
                completedTourneys: completedTourneys
            });
        });
    }

    componentDidUpdate() {
        //console.log(this.state);
    }

    showProductsHandler = (event, index, table) => {
        let products;
        let showProducts;
        let tableToShow;
        if (!this.state.showProducts) {
            if (table == "registration") {
                products = this.state.tourneys[index].products;
                showProducts = true;
            } else if (table == "active") {
                products = this.state.activeTourneys[index].products;
                showProducts = true;
            } else if (table == "completed") {
                products = this.state.completedTourneys[index].products;
                showProducts = true;
            }
            tableToShow = table;
        } else {
            products = [];
            showProducts = false;
            tableToShow = null;
        }
        this.setState({showProducts: showProducts, productsToShow: products, indexToShow: index, tableToShow: tableToShow});
    }
    
    render (){
        
        let redirect = null;
        if (!this.props.userId) {
            redirect = (
                <Redirect to="/login" />
            )
        }
        
        let tourneys = null;
        if (this.state.tourneys.length > 0) {
            tourneys = this.state.tourneys.map((tourney, index) => {
                let navPath = "/tourneys/" + tourney.tourneyId;
                let showProdStr = "Show";
                let products = null;
                let productsDiv = null;
                if (index == this.state.indexToShow && this.state.showProducts && this.state.tableToShow == "registration") {
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
                    <tr key={tourney.tourneyId}>
                        <td>{tourney.tourneyId}</td>
                        <td>{tourney.host}</td>
                        <td>
                            <button onClick={(event, i, table) => this.showProductsHandler(event, index, "registration")}>{showProdStr}</button> <br/> 
                            {productsDiv}
                        </td>
                        <td>{tourney.noEntrants}/{tourney.maxEntrants}</td>
                        <td>{tourney.startDate} </td>
                        <td>{tourney.startTime}</td>
                        <td>{tourney.endDate}</td>
                        <td>{tourney.endTime}</td>
                        <td><NavLink to={navPath} style={{textDecoration: "none"}}><button>Go to Lobby</button></NavLink></td>
                    </tr>
                );
            })
        }
        
        let activeTourneys = null;
        if (this.state.activeTourneys.length > 0) {
            activeTourneys = this.state.activeTourneys.map((tourney, index) => {
                let navPath = "/tourneys/" + tourney.tourneyId;
                let showProdStr = "Show";
                let products = null;
                let productsDiv = null;

                if (index == this.state.indexToShow && this.state.showProducts && this.state.tableToShow == "active") {
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
                    <tr key={tourney.tourneyId}>
                        <td>{tourney.tourneyId}</td>
                        <td>{tourney.host}</td>
                        <td>
                            <button onClick={(event, i, table) => this.showProductsHandler(event, index, "active")}>{showProdStr}</button> <br/> 
                            {productsDiv}
                        </td>
                        <td>{tourney.noEntrants}/{tourney.maxEntrants}</td>
                        <td>{tourney.startDate} </td>
                        <td>{tourney.startTime}</td>
                        <td>{tourney.endDate}</td>
                        <td>{tourney.endTime}</td>
                        <td><NavLink to={navPath} style={{textDecoration: "none"}}><button>Go to Lobby</button></NavLink></td>
                    </tr>
                );
            })
        }
        
        let completedTourneys = null;
        if (this.state.completedTourneys.length > 0) {
            completedTourneys = this.state.completedTourneys.map((tourney, index) => {
                let navPath = "/tourneys/" + tourney.tourneyId;
                let showProdStr = "Show";
                let products = null;
                let productsDiv = null;

                if (index == this.state.indexToShow && this.state.showProducts && this.state.tableToShow == "completed") {
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
                    <tr key={tourney.tourneyId}>
                        <td>{tourney.tourneyId}</td>
                        <td>{tourney.host}</td>
                        <td>
                            <button onClick={(event, i, table) => this.showProductsHandler(event, index, "completed")}>{showProdStr}</button> <br/> 
                            {productsDiv}
                        </td>
                        <td>{tourney.noEntrants}/{tourney.maxEntrants}</td>
                        <td>{tourney.startDate} </td>
                        <td>{tourney.startTime}</td>
                        <td>{tourney.endDate}</td>
                        <td>{tourney.endTime}</td>
                        <td><NavLink to={navPath} style={{textDecoration: "none"}}><button>Go to Lobby</button></NavLink></td>
                    </tr>
                );
            })
        }
        
        return (
            <div className="AllTourneysDiv">
                {redirect}
                <div className="AllTourneys">
                    <h1>My Tournaments</h1>
                    <div className="TourneyDiv">
                        <h2>Registered Tournaments:</h2>
                        <table className="TourneyTable">
                            <thead>
                                <tr>
                                    <th>Tournament id</th>
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
                                {tourneys}
                            </tbody>
                        </table>
                    </div>
                    <div className="TourneyDiv">
                        <h2>Active Tournaments:</h2>
                        <table className="TourneyTable">
                            <thead>
                                <tr>
                                    <th>Tournament id</th>
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
                                {activeTourneys}
                            </tbody>
                        </table>
                    </div>
                    <div className="TourneyDiv">
                        <h2>Completed Tournaments:</h2>
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
                                {completedTourneys}
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
        getMyTourneys: (userId) => dispatch(actions.getMyTourneys(userId))
    };
};

const mapStateToProps = state => {
    return {
        loading: state.tourneys.loading,
        error: state.tourneys.error,
        tourneys: state.tourneys.myTourneys,
        userId: state.auth.userId
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyTourneys);