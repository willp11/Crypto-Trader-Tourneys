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
        hostedTourneys: [],
        showProducts: false,
        productsToShow: [],
        indexToShow: null,
        tableToShowProducts: null,
        loading: true,
        tableToShow: "Registered"
    }
    
    componentDidMount() {
        
        let tourneys = [];
        axios.post('/getMyTourneys', {"userId": this.props.userId}).then(res => {
            tourneys = res.data.response;
            
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
            
            this.setState({
                tourneys: tourneys
            });
        
            let activeTourneys = [];
            axios.post('/getMyActiveTourneys', {"userId": this.props.userId}).then(res => {
                activeTourneys = res.data.response;

                // get the time in days, hours, minutes until tournament starts
                for (let i=0; i<activeTourneys.length; i++) {
                    let date = new Date(); 
                    let timezone = date.getTimezoneOffset() * 60 * 1000;

                    let currentTS = date.getTime() + timezone;
                    let endTS = activeTourneys[i].endTS * 1000;

                    let currentHrs = currentTS / 1000 / 60 / 60;
                    let endHrs = endTS / 1000 / 60 / 60;

                    let daysUntilEnd;
                    let hoursUntilEnd = endHrs - currentHrs;
                    let minutesUntilEnd;
                    if (hoursUntilEnd > 0) {
                        daysUntilEnd = Math.floor(hoursUntilEnd/24);
                        hoursUntilEnd = (hoursUntilEnd - (daysUntilEnd*24)).toFixed(2);
                        minutesUntilEnd = (hoursUntilEnd % 1)*60;

                        hoursUntilEnd = Math.floor(hoursUntilEnd);
                        minutesUntilEnd = Math.ceil(minutesUntilEnd);
                    } else {
                        daysUntilEnd = 0;
                        hoursUntilEnd = 0;
                        minutesUntilEnd = 0;
                    }
                    
                    let untilEnd = {days: daysUntilEnd, hours: hoursUntilEnd, minutes: minutesUntilEnd};
                    activeTourneys[i]['untilEnd'] = untilEnd;

                    // duration
                    let duration = (tourneys[i].endTS - tourneys[i].startTS) / 60 / 60 / 24;
                    activeTourneys[i]['duration'] = duration;
                }

                this.setState({
                    activeTourneys: activeTourneys
                });
                let completedTourneys = [];
                axios.post('/getMyCompletedTourneys', {"userId": this.props.userId}).then(res => {
                    completedTourneys = res.data.response;
                    this.setState({
                        completedTourneys: completedTourneys
                    });
                    
                    let hostedTourneys = [];
                    axios.post('/getMyHostedTourneys', {"userId": this.props.userId}).then(res => {
                        hostedTourneys = res.data.response;
                        console.log(hostedTourneys);
                        this.setState({
                            hostedTourneys: hostedTourneys,
                            loading: false
                        })
                    });
                });
            });
        });      
    }

    componentDidUpdate() {
        //console.log(this.state.tableToShow);
    }

    showProductsHandler = (event, index, table) => {
        let products;
        let showProducts;
        let tableToShowProducts;
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
            tableToShowProducts = table;
        } else {
            products = [];
            showProducts = false;
            tableToShowProducts = null;
        }
        this.setState({showProducts: showProducts, productsToShow: products, indexToShow: index, tableToShowProducts: tableToShowProducts});
    }
    
    selectTourneyTable = (event) => {
        let table = event.target.innerHTML;
        this.setState({tableToShow: table});
    }
    
    render (){
        
        let redirect = null;
        if (!this.props.userId) {
            redirect = (
                <Redirect to="/login" />
            )
        }
        
        let tourneys = null;
        if (this.state.tourneys.length > 0 && !this.state.loading) {
            tourneys = this.state.tourneys.map((tourney, index) => {
                let navPath = "/tourneys/" + tourney.tourneyId;
                let showProdStr = "Show";
                let products = null;
                let productsDiv = null;
                if (index == this.state.indexToShow && this.state.showProducts && this.state.tableToShowProducts == "registration") {
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
                        <td><NavLink to={navPath} style={{textDecoration: "none"}}><button>Go to Lobby</button></NavLink></td>
                        <td>{tourney.host}</td>
                        <td>{tourney.entryFee}</td>
                        <td>
                            <button onClick={(event, i, table) => this.showProductsHandler(event, index, "registration")}>{showProdStr}</button> <br/> 
                            {productsDiv}
                        </td>
                        <td>{tourney.noEntrants}/{tourney.maxEntrants}</td>
                        <td>{tourney.untilStart.days}d {tourney.untilStart.hours}h {tourney.untilStart.minutes}m</td>
                        <td>{tourney.duration}d</td>
                    </tr>
                );
            });   
        }
        
        let activeTourneys = null;
        if (this.state.activeTourneys.length > 0 && !this.state.loading) {
            activeTourneys = this.state.activeTourneys.map((tourney, index) => {
                let navPath = "/tourneys/" + tourney.tourneyId;
                let showProdStr = "Show";
                let products = null;
                let productsDiv = null;

                if (index == this.state.indexToShow && this.state.showProducts && this.state.tableToShowProducts == "active") {
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
                        <td><NavLink to={navPath} style={{textDecoration: "none"}}><button>Go to Lobby</button></NavLink></td>
                        <td>{tourney.host}</td>
                        <td>{tourney.entryFee}</td>
                        <td>
                            <button onClick={(event, i, table) => this.showProductsHandler(event, index, "active")}>{showProdStr}</button> <br/> 
                            {productsDiv}
                        </td>
                        <td>{tourney.noEntrants}/{tourney.maxEntrants}</td>
                        <td>{tourney.untilEnd.days}d {tourney.untilEnd.hours}h {tourney.untilEnd.minutes}m</td>
                        <td>{tourney.duration}d</td>
                    </tr>
                );
            });
        }
        
        let completedTourneys = null;
        if (this.state.completedTourneys.length > 0 && !this.state.loading) {
            completedTourneys = this.state.completedTourneys.map((tourney, index) => {
                let navPath = "/tourneys/" + tourney.tourneyId;
                let showProdStr = "Show";
                let products = null;
                let productsDiv = null;

                if (index == this.state.indexToShow && this.state.showProducts && this.state.tableToShowProducts == "completed") {
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
                        <td><NavLink to={navPath} style={{textDecoration: "none"}}><button>Go to Lobby</button></NavLink></td>
                        <td>{tourney.host}</td>
                        <td>{tourney.entryFee}</td>
                        <td>{tourney.startDate} </td>
                        <td>{tourney.startTime}</td>
                        <td>{tourney.endDate}</td>
                        <td>{tourney.endTime}</td>
                    </tr>
                );
            })
        }

        let hostedTourneys = null;
        if (this.state.hostedTourneys.length > 0 && !this.state.loading) {
            hostedTourneys = this.state.hostedTourneys.map((tourney, index) => {
                let navPath = "/tourneys/" + tourney.tourneyId;

                return (
                    <tr key={tourney.tourneyId}>
                        <td>{tourney.tourneyId}</td>
                        <td><NavLink to={navPath} style={{textDecoration: "none"}}><button>Go to Lobby</button></NavLink></td>
                        <td>{tourney.status}</td>
                        <td>{tourney.entryFee}</td>
                        <td>{tourney.startDate} </td>
                        <td>{tourney.startTime}</td>
                        <td>{tourney.endDate}</td>
                        <td>{tourney.endTime}</td>
                    </tr>
                );
            })
        }
        
        let tourneySelectButtons;
        if (this.state.tableToShow == "Registered") {
            tourneySelectButtons = (
                <div>
                    <button style={{"backgroundColor": "#303F9F"}} onClick={(event) => this.selectTourneyTable(event)}>Registered</button>
                    <button style={{"backgroundColor": "rgb(77, 134, 247)"}} onClick={(event) => this.selectTourneyTable(event)}>Active</button>
                    <button style={{"backgroundColor": "rgb(77, 134, 247)"}} onClick={(event) => this.selectTourneyTable(event)}>Completed</button>
                    <button style={{"backgroundColor": "rgb(77, 134, 247)"}} onClick={(event) => this.selectTourneyTable(event)}>Hosted</button>
                </div>
            )
        } else if (this.state.tableToShow == "Active") {
            tourneySelectButtons = (
                <div>
                    <button style={{"backgroundColor": "rgb(77, 134, 247)"}} onClick={(event) => this.selectTourneyTable(event)}>Registered</button>
                    <button style={{"backgroundColor": "#303F9F"}} onClick={(event) => this.selectTourneyTable(event)}>Active</button>
                    <button style={{"backgroundColor": "rgb(77, 134, 247)"}} onClick={(event) => this.selectTourneyTable(event)}>Completed</button>
                    <button style={{"backgroundColor": "rgb(77, 134, 247)"}} onClick={(event) => this.selectTourneyTable(event)}>Hosted</button>
                </div>
            )
        } else if (this.state.tableToShow == "Completed") {
            tourneySelectButtons = (
                <div>
                    <button style={{"backgroundColor": "rgb(77, 134, 247)"}} onClick={(event) => this.selectTourneyTable(event)}>Registered</button>
                    <button style={{"backgroundColor": "rgb(77, 134, 247)"}} onClick={(event) => this.selectTourneyTable(event)}>Active</button>
                    <button style={{"backgroundColor": "#303F9F"}} onClick={(event) => this.selectTourneyTable(event)}>Completed</button>
                    <button style={{"backgroundColor": "rgb(77, 134, 247)"}} onClick={(event) => this.selectTourneyTable(event)}>Hosted</button>
                </div>
            )
        } else if (this.state.tableToShow == "Hosted") {
            tourneySelectButtons = (
                <div>
                    <button style={{"backgroundColor": "rgb(77, 134, 247)"}} onClick={(event) => this.selectTourneyTable(event)}>Registered</button>
                    <button style={{"backgroundColor": "rgb(77, 134, 247)"}} onClick={(event) => this.selectTourneyTable(event)}>Active</button>
                    <button style={{"backgroundColor": "rgb(77, 134, 247)"}} onClick={(event) => this.selectTourneyTable(event)}>Completed</button>
                    <button style={{"backgroundColor": "#303F9F"}} onClick={(event) => this.selectTourneyTable(event)}>Hosted</button>
                </div>
            )
        }
        
        let tableToShow;
        if (this.state.tableToShow == "Registered") {
            tableToShow = (
                <div className="TourneyDiv">
                    <h2>Registered Tournaments:</h2>
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
                            {tourneys}
                        </tbody>
                    </table>
                </div>
            )
        } else if (this.state.tableToShow == "Active") {
            tableToShow = (
                <div className="TourneyDiv">
                    <h2>Active Tournaments:</h2>
                    <table className="TourneyTable">
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>Lobby</th>
                                <th>Host</th>
                                <th>Entry Fee</th>
                                <th>Products</th>
                                <th>Entrants</th>
                                <th>Until End</th>
                                <th>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeTourneys}
                        </tbody>
                    </table>
                </div>
            )
        } else if (this.state.tableToShow == "Completed") {
            tableToShow = (
                <div className="TourneyDiv">
                    <h2>Completed Tournaments:</h2>
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
                            {completedTourneys}
                        </tbody>
                    </table>
                </div>
            )
        } else if (this.state.tableToShow == "Hosted") {
            tableToShow = (
                <div className="TourneyDiv">
                    <h2>Hosted Tournaments:</h2>
                    <table className="TourneyTable">
                        <thead>
                            <tr>
                                <th>id</th>
                                <th>Lobby</th>
                                <th>Status</th>
                                <th>Entry Fee</th>
                                <th>Start Date</th>
                                <th>Start Time</th>
                                <th>End Date</th>
                                <th>End Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hostedTourneys}
                        </tbody>
                    </table>
                </div>
            )   
        }
        
        return (
            <div className="AllTourneysDiv">
                {redirect}
                <div className="AllTourneys">
                    <h1>My Tournaments</h1>
                    <div className="selectTourneyTableDiv">
                        <h2>Select Table</h2>
                        {tourneySelectButtons}
                    </div>
                    {tableToShow}
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