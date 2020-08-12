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
        activeTourneys: []
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
    }
    
    render (){
        
        let tourneys = null;
        if (this.state.tourneys.length > 0) {
            tourneys = this.state.tourneys.map((tourney) => {
                let navPath = "/tourneys/" + tourney.tourneyId;
                return (
                    <tr key={tourney.tourneyId}>
                        <td>{tourney.tourneyId}</td>
                        <td>{tourney.host}</td>
                        <td>{tourney.noEntrants}/{tourney.maxEntrants}</td>
                        <td>{tourney.startDate} - {tourney.startTime}</td>
                        <td>{tourney.endDate} - {tourney.endTime}</td>
                        <td><NavLink to={navPath} style={{textDecoration: "none"}}><button>Go to Lobby</button></NavLink></td>
                    </tr>
                );
            })
        }
        
        let activeTourneys = null;
        if (this.state.activeTourneys.length > 0) {
            activeTourneys = this.state.activeTourneys.map((tourney) => {
                let navPath = "/tourneys/" + tourney.tourneyId;
                return (
                    <tr key={tourney.tourneyId}>
                        <td>{tourney.tourneyId}</td>
                        <td>{tourney.host}</td>
                        <td>{tourney.noEntrants}/{tourney.maxEntrants}</td>
                        <td>{tourney.startDate} - {tourney.startTime}</td>
                        <td>{tourney.endDate} - {tourney.endTime}</td>
                        <td><NavLink to={navPath} style={{textDecoration: "none"}}><button>Go to Lobby</button></NavLink></td>
                    </tr>
                );
            })
        }
        
        let redirect = null;
        if (!this.props.userId) {
            redirect = (
                <Redirect to="/login" />
            )
        }
        
        return (
            <div>
                {redirect}
                <h1>My Tournaments</h1>
                <div className="AllTourneys">
                    <div className="NotActiveTourneys">
                        <h2>Registered:</h2>
                        <table className="NotActiveTable">
                            <thead>
                                <tr>
                                    <th>Tournament id</th>
                                    <th>Host</th>
                                    <th>Entrants</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Lobby</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tourneys}
                            </tbody>
                        </table>
                    </div>
                    <div className="ActiveTourneys">
                        <h2>Active Tournaments:</h2>
                        <table className="ActiveTable">
                            <thead>
                                <tr>
                                    <th>Tournament id</th>
                                    <th>Host</th>
                                    <th>Entrants</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Lobby</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTourneys}
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