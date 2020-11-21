import React, {Component} from 'react';
import './myTourneys.css';
import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';
import {firebaseDB} from '../../firebase/firebase';
import {NavLink} from 'react-router-dom';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../components/UI/Spinner/Spinner';
import {firebaseAuth} from "../../firebase/firebase";
import NavBottom from "../../components/navigation/nav-bottom/nav-bottom";

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
        tableToShow: "Registered",
        sortDirections: {tourneys: {tourneyId: null, 
                                        duration: null,
                                        startTS: null,
                                        endTS: null,
                                        maxEntrants: null},
                        activeTourneys: {tourneyId: null, 
                                        duration: null,
                                        startTS: null,
                                        endTS: null,
                                        maxEntrants: null},
                        completedTourneys: {tourneyId: null, 
                                        duration: null,
                                        startTS: null,
                                        endTS: null,
                                        maxEntrants: null},
                        hostedTourneys: {tourneyId: null, 
                                        duration: null,
                                        startTS: null,
                                        endTS: null,
                                        maxEntrants: null}
                        },
        authFail: false,
        error: false,
        invites: [],
        inviteToShowKey: null,
        enterBalance: false,
        invitationBalance: null,
        balance: '',
        inviteTourneyId: '',
        loadingInvites: true,
        loadingInvitesErr: null,
        inviteResponseSuccess: null,
        removeInviteSuccess: null,
        confirmDeclineInvite: false
    }
    
    componentDidMount() {
        
        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                if (user.emailVerified == false) {
                    this.setState({authFail: true});
                } else {
                    this.props.updateUserIdToken(user.uid, user.xa);
                    
                    axios.post('/api/getAllMyTourneys', {"userId": user.uid}).then(res => {
                        
                        // REGISTRATION TOURNEYS
                        let tourneys = res.data.response.registrationTourneys;
                        // get the time in days, hours, minutes until tournament starts
                        for (let i=0; i<tourneys.length; i++) {
                            // get utc timestamp
                            let date = new Date(); 
                            let currentTS = date.getTime();
                            
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
                        
                        // ACTIVE TOURNEYS
                        let activeTourneys = res.data.response.activeTourneys;
                        // get the time in days, hours, minutes until tournament starts
                        for (let i=0; i<activeTourneys.length; i++) {
                            // get utc timestamp
                            let date = new Date(); 
                            let currentTS = date.getTime();
                            
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
                            let duration = (activeTourneys[i].endTS - activeTourneys[i].startTS) / 60 / 60 / 24;
                            activeTourneys[i]['duration'] = duration;
                        }
                        
                        // COMPLETED TOURNEYS
                        let completedTourneys = res.data.response.completedTourneys;
                        // duration
                        for (let i=0; i<completedTourneys.length; i++) {
                            let duration = (completedTourneys[i].endTS - completedTourneys[i].startTS) / 60 / 60 / 24;
                            completedTourneys[i]['duration'] = duration;
                        }
                        
                        // HOSTED TOURNEYS
                        let hostedTourneys = res.data.response.hostedTourneys;
                        // duration
                        for (let i=0; i<hostedTourneys.length; i++) {
                            let duration = (hostedTourneys[i].endTS - hostedTourneys[i].startTS) / 60 / 60 / 24;
                            hostedTourneys[i]['duration'] = duration;
                        }

                        this.setState({
                            tourneys: tourneys,
                            activeTourneys: activeTourneys,
                            completedTourneys: completedTourneys,
                            hostedTourneys: hostedTourneys,
                            loading: false
                        });
                    }).catch(err => {
                        this.setState({error: true});
                    });  
                    
                    // get users tourney invites
                    axios.post('/api/getTourneyInvites',  {"userId": this.props.userId}).then(res => {
                        console.log(res.data.response);
                        this.setState({
                            invites: res.data.response,
                            loadingInvites: false
                        });
                    }).catch(error => {
                        this.setState({loadingInvites: false, loadingInvitesErr: "There was a problem loading your invitations."});
                    })
                }
            } else {
                this.setState({authFail: true});
            }
        });
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
            } else if (table == "hosted") {
                products = this.state.hostedTourneys[index].products;
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
    
    sortColumn = (field, table) => {
        
        // check the current sorted direction of the field
        let direction = this.state.sortDirections[table][field]

        if (direction == null || direction == "descending") {
            direction = "ascending";
        } else if (direction == "ascending") {
            direction = "descending";
        }
        
        // sort all the tournaments
        let tourneysArr = this.state[table];

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
        
        let currState = {...this.state};
        
        currState[table] = tourneysArr;
        
        let sortDirections = {...this.state.sortDirections};
        sortDirections[table][field] = direction;
        
        currState[sortDirections] = sortDirections;
        
        this.setState(currState);
    }
    
    // INVITATIONS
    declineInvitationHandler = (tourneyId, index) => {
        this.setState({confirmDeclineInvite: true, inviteTourneyId: tourneyId, inviteToShowKey: index});
    }
    
    cancelDeclineInvitationHandler = () => {
        this.setState({confirmDeclineInvite: false});
    }
    
    submitDeclineInvitationHandler = (tourneyId) => {
        this.setState({enterBalance: false, loadingInvites: true});
        
        // decline invitiation
        axios.post('/api/removeTourneyInvite', {"userId": this.props.userId, "tourneyId": tourneyId}).then(res => {
            if (res.data.response == "success") {
                this.setState({removeInviteSuccess: true, inviteResponseSuccess: null});
            } else {
                this.setState({removeInviteSuccess: false, inviteResponseSuccess: null});
            }
            // get users tourney invites
            axios.post('/api/getTourneyInvites',  {"userId": this.props.userId}).then(res => {
                this.setState({
                    invites: res.data.response, 
                    loadingInvites: false
                });
            })
        }).catch(error => {
            this.setState({removeInviteSuccess: false, inviteResponseSuccess: null});
        });
    }
    
    acceptInvitationHandler = (tourneyId, index) => {
        this.setState({enterBalance: true, inviteTourneyId: tourneyId, inviteToShowKey: index});
    }
    
    cancelAcceptInvitationHandler = () => {
        this.setState({enterBalance: false});
    }
    
    inputBalanceHandler = (event) => {
        this.setState({balance: event.target.value});
    }
    
    submitAcceptInvitationHandler = (tourneyId, index) => {
        
        let data = {
            "tourneyId": tourneyId,
            "userId": this.props.userId,
            "balance": this.state.balance,
            "profitType": this.state.invites[index].profitType
        }
        
        this.setState({enterBalance: false, loadingInvites: true});
        
        axios.post('/api/tourneyRegistration', data).then(res => {
            if (res.data.response == "success") {
                this.setState({inviteResponseSuccess: true, removeinviteSuccess: null, tourneyRegisterErr: false});
            } else if (res.data.response == "registration failed") {
                this.setState({inviteResponseSuccess: null, removeinviteSuccess: null, tourneyRegisterErr: true, tourneyRegisterErrMsg: res.data.errorMsg});
            } else {
                this.setState({inviteResponseSuccess: false, removeinviteSuccess: null, tourneyRegisterErr: false});
            }
            // get users tourney invites
            axios.post('/api/getTourneyInvites',  {"userId": this.props.userId}).then(res => {
                this.setState({
                    invites: res.data.response,
                    loadingInvites: false
                });
            })
        }).catch(error => {
            this.setState({inviteResponseSuccess: false, removeinviteSuccess: null, loadingInvites: false});
        });;   
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
                        <td>{tourney.profitType}</td>
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
                        <td>{tourney.rank}</td>
                        <td>{tourney.profit} {tourney.unitProfit}</td>
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
                        <td>{tourney.rank}</td>
                        <td>{tourney.profit} {tourney.unitProfit}</td>
                        <td>
                            <button onClick={(event, i, table) => this.showProductsHandler(event, index, "completed")}>{showProdStr}</button> <br/> 
                            {productsDiv}
                        </td>
                        <td>{tourney.startDate} </td>
                        <td>{tourney.startTime}</td>
                        <td>{tourney.duration}d</td>
                    </tr>
                );
            })
        }

        let hostedTourneys = null;
        if (this.state.hostedTourneys.length > 0 && !this.state.loading) {
            hostedTourneys = this.state.hostedTourneys.map((tourney, index) => {
                let navPath = "/tourneys/" + tourney.tourneyId;
                let showProdStr = "Show";
                let products = null;
                let productsDiv = null;

                if (index == this.state.indexToShow && this.state.showProducts && this.state.tableToShowProducts == "hosted") {
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
                        <td>{tourney.status}</td>
                        <td>{tourney.profitType}</td>
                        <td>
                            <button onClick={(event, i, table) => this.showProductsHandler(event, index, "hosted")}>{showProdStr}</button> <br/> 
                            {productsDiv}
                        </td>
                        <td>{tourney.startDate} </td>
                        <td>{tourney.startTime}</td>
                        <td>{tourney.duration}d</td>
                    </tr>
                );
            })
        }
        
        let tourneySelectButtons;
        if (this.state.tableToShow == "Registered") {
            tourneySelectButtons = (
                <div>
                    <button style={{"backgroundColor": "#303F9F"}} onClick={(event) => this.selectTourneyTable(event)}>Registered</button>
                    <button style={{"backgroundColor": "#E1E1E1", "color": "#121212"}} onClick={(event) => this.selectTourneyTable(event)}>Active</button>
                    <button style={{"backgroundColor": "#E1E1E1", "color": "#121212"}} onClick={(event) => this.selectTourneyTable(event)}>Completed</button>
                    <button style={{"backgroundColor": "#E1E1E1", "color": "#121212"}} onClick={(event) => this.selectTourneyTable(event)}>Hosted</button>
                </div>
            )
        } else if (this.state.tableToShow == "Active") {
            tourneySelectButtons = (
                <div>
                    <button style={{"backgroundColor": "#E1E1E1", "color": "#121212"}} onClick={(event) => this.selectTourneyTable(event)}>Registered</button>
                    <button style={{"backgroundColor": "#303F9F"}} onClick={(event) => this.selectTourneyTable(event)}>Active</button>
                    <button style={{"backgroundColor": "#E1E1E1", "color": "#121212"}} onClick={(event) => this.selectTourneyTable(event)}>Completed</button>
                    <button style={{"backgroundColor": "#E1E1E1", "color": "#121212"}} onClick={(event) => this.selectTourneyTable(event)}>Hosted</button>
                </div>
            )
        } else if (this.state.tableToShow == "Completed") {
            tourneySelectButtons = (
                <div>
                    <button style={{"backgroundColor": "#E1E1E1", "color": "#121212"}} onClick={(event) => this.selectTourneyTable(event)}>Registered</button>
                    <button style={{"backgroundColor": "#E1E1E1", "color": "#121212"}} onClick={(event) => this.selectTourneyTable(event)}>Active</button>
                    <button style={{"backgroundColor": "#303F9F"}} onClick={(event) => this.selectTourneyTable(event)}>Completed</button>
                    <button style={{"backgroundColor": "#E1E1E1", "color": "#121212"}} onClick={(event) => this.selectTourneyTable(event)}>Hosted</button>
                </div>
            )
        } else if (this.state.tableToShow == "Hosted") {
            tourneySelectButtons = (
                <div>
                    <button style={{"backgroundColor": "#E1E1E1", "color": "#121212"}} onClick={(event) => this.selectTourneyTable(event)}>Registered</button>
                    <button style={{"backgroundColor": "#E1E1E1", "color": "#121212"}} onClick={(event) => this.selectTourneyTable(event)}>Active</button>
                    <button style={{"backgroundColor": "#E1E1E1", "color": "#121212"}} onClick={(event) => this.selectTourneyTable(event)}>Completed</button>
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
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("tourneyId", "tourneys")}>id</th>
                                <th>Register</th>
                                <th>Host</th>
                                <th>Profit Type</th>
                                <th>Products</th>
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("maxEntrants", "tourneys")}>Entrants</th>
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("startTS", "tourneys")}>Until Start</th>
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("duration", "tourneys")}>Duration</th>
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
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("tourneyId", "activeTourneys")}>id</th>
                                <th>Lobby</th>
                                <th>Host</th>
                                <th>Rank</th>
                                <th>Profit</th>
                                <th>Products</th>
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("maxEntrants", "activeTourneys")}>Entrants</th>
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("endTS", "activeTourneys")}>Until End</th>
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("duration", "activeTourneys")}>Duration</th>
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
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("tourneyId", "completedTourneys")}>id</th>
                                <th>Lobby</th>
                                <th>Host</th>
                                <th>Rank</th>
                                <th>Profit</th>
                                <th>Products</th>
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("startTS", "completedTourneys")}>Start Date</th>
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("startTS", "completedTourneys")}>Start Time</th>
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("duration", "completedTourneys")}>Duration</th>
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
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("tourneyId", "hostedTourneys")}>id</th>
                                <th>Lobby</th>
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("status", "hostedTourneys")}>Status</th>
                                <th>Profit Type</th>
                                <th>Products</th>
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("startTS", "hostedTourneys")}>Start Date</th>
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("startTS", "hostedTourneys")}>Start Time</th>
                                <th style={{"cursor":"pointer"}} onClick={()=>this.sortColumn("duration", "hostedTourneys")}>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hostedTourneys}
                        </tbody>
                    </table>
                </div>
            )   
        }
        
        // INVITATIONS
        let invites = null;
        if (this.state.invites) {
            invites = this.state.invites.map((invite, index) => {
                let tourneyId=this.state.invites[index].tourneyId;
                let profitType=this.state.invites[index].profitType;
                let declineInvitation = <button className="noBtn" onClick={() => this.declineInvitationHandler(tourneyId, index)}>No</button>
                let acceptInvitation = (
                    <button className="yesBtn" onClick={()=>this.acceptInvitationHandler(tourneyId, index)}>Yes</button>
                );
                let inputPlaceholder = "Starting Balance (" + invite.quoteCurrency + ")";
                // ACCEPT INVITATION
                if (this.state.enterBalance == true && this.state.inviteToShowKey == index) {
                    declineInvitation = null;
                    if (profitType == "relative") {
                        acceptInvitation = (
                            <div key={index}>
                                <input type="number" value={this.state.balance} onChange={(event) => this.inputBalanceHandler(event)} style={{"textAlign": "center", "margin": "10px 0"}} placeholder={inputPlaceholder} />
                                <button className="resetBtn" onClick={this.cancelAcceptInvitationHandler}>Cancel</button>
                                <button className="submitBtn" onClick={() => this.submitAcceptInvitationHandler(tourneyId, index)}>Confirm</button>
                            </div>
                        );
                    } else if (profitType == "absolute") {
                        acceptInvitation = (
                            <div key={index}>
                                <p style={{"color": "black"}}>Are you sure?</p>
                                <button className="resetBtn" style={{"margin": "5px 0"}} onClick={this.cancelAcceptInvitationHandler}>Cancel</button>
                                <button className="submitBtn" onClick={() => this.submitAcceptInvitationHandler(tourneyId, index)}>Confirm</button>
                            </div>
                        );
                    }
                }
                // DECLINE INVITATION
                if (this.state.confirmDeclineInvite == true && this.state.inviteToShowKey == index) {
                    acceptInvitation = null;
                    declineInvitation = (
                        <div key={index}>
                            <p style={{"color": "black"}}>Are you sure?</p>
                            <button className="resetBtn" style={{"margin": "5px 0"}} onClick={this.cancelDeclineInvitationHandler}>Cancel</button>
                            <button className="submitBtn" onClick={() => this.submitDeclineInvitationHandler(tourneyId, index)}>Confirm</button>
                        </div>
                    );
                }
                        
                return (
                    <tr key={index}>
                        <td><NavLink style={{"color": "rgb(77, 134, 247)", "fontWeight": "bold"}} to={"/tourneys/"+tourneyId}>{invite.tourneyId}</NavLink></td>
                        <td>{invite.host}</td>
                        <td>
                            {declineInvitation}
                            {acceptInvitation}
                        </td>
                    </tr>
                );
            })
        }
        
        let inviteResponse = null;
        if (this.state.inviteResponseSuccess == true) {
            inviteResponse = <p style={{"color": "#57eb7e", "fontWeight": "bold"}}>Registration was successful.</p>
        } else if (this.state.inviteResponseSuccess == false) {
            inviteResponse = <p style={{"color": "#f7716d", "fontWeight": "bold"}}>Registration failed. Check your connection.</p>
        }
        
        let removeInviteResponse = null;        
        if (this.state.removeInviteSuccess == true) {
            removeInviteResponse = <p style={{"color": "#57eb7e", "fontWeight": "bold"}}>Invitation declined.</p>
        } else if (this.state.removeInviteSuccess == false) {
            removeInviteResponse = <p style={{"color": "#f7716d", "fontWeight": "bold"}}>Error. Please try again.</p>
        }
        
        let tourneyRegisterErr = null;   
        if (this.state.tourneyRegisterErr) {
            tourneyRegisterErr = <p style={{"color": "#f7716d", "fontWeight": "bold"}}>{this.state.tourneyRegisterErrMsg}</p>
        }
        
        let invitesTable = (
            <table className="invitesTable">
                <thead>
                    <tr>
                        <th>Tournament id</th>
                        <th>Host</th>
                        <th>Response</th>
                    </tr>
                </thead>
                <tbody>
                    {invites}
                </tbody>
            </table>
        );

        if (this.state.loadingInvitesErr) {
            invitesTable = (
                <p style={{"color": "#f7716d", "fontWeight": "bold"}}>{this.state.loadingInvitesErr}</p>
            );
        }

        if (this.state.loadingInvites) {
            invitesTable = <Spinner />
        }
        
        return (
            <div>
                <div className="AllTourneysDiv">
                    {redirect}
                    <div className="AllTourneys">
                        <h1>My Tournaments</h1>
                        <div className="myInvitesDiv">
                            <h2>Invitations</h2>
                            {invitesTable}
                            {inviteResponse}
                            {removeInviteResponse}
                            {tourneyRegisterErr}
                        </div>
                        {spinner}
                        <div className="selectTourneyTableDiv">
                            <h2>Select Table</h2>
                            {tourneySelectButtons}
                        </div>
                        {tableToShow}
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
        tourneys: state.tourneys.myTourneys,
        userId: state.auth.userId
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyTourneys);