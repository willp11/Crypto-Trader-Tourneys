import React, {Component} from 'react';
import './allTourneys.css';
import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';
import Tourney from '../tourney/tourney';
import {NavLink} from 'react-router-dom';
import axios from 'axios';

class AllTourneys extends Component {
    
    state = {
        tourneys: [],
        activeTourneys: []
    }
    
    componentDidMount() {
        //this.props.getTourneys();
        axios.get('/getAllTourneys').then(res => {
            console.log(res.data);
            let tourneys = res.data.response;
            this.setState({tourneys: tourneys});
        });
        
        axios.get('/getActiveTourneys').then(res => {
            console.log(res.data);
            let activeTourneys = res.data.response;
            this.setState({activeTourneys: activeTourneys});
        });
    }
    
    componentDidUpdate() {
        //console.log(this.props.tourneys);
        console.log(this.state.tourneys);
    }
    
    render (){
        let tourneyData = this.state.tourneys.map(data => {
            let navPath = "/tourneys/" + data.tourneyId;
            return (
                <tr key={data.tourneyId}>
                    <td>{data.tourneyId}</td>
                    <td>{data.host}</td>
                    <td>{data.noEntrants}/{data.maxEntrants}</td>
                    <td>{data.startDate} - {data.startTime}</td>
                    <td>{data.endDate} - {data.endTime}</td>
                    <td><NavLink to={navPath} style={{textDecoration: "none"}}><button>Go to Lobby</button></NavLink></td>
                </tr>
            )
        });
        
        let activeTourneyData = this.state.activeTourneys.map(data => {
            let navPath = "/tourneys/" + data.tourneyId;
            let startTime = <td>{data.startDate} - {data.startTime}</td>
            if (data.status == "active") startTime = <td>Started</td>
            return (
                <tr key={data.tourneyId}>
                    <td>{data.tourneyId}</td>
                    <td>{data.host}</td>
                    <td>{data.noEntrants}/{data.maxEntrants}</td>
                    <td>{data.startDate} - {data.startTime}</td>
                    <td>{data.endDate} - {data.endTime}</td>
                    <td><NavLink to={navPath} style={{textDecoration: "none"}}><button>Go to Lobby</button></NavLink></td>
                </tr>
            )
        });

        return (
            <div>
                <h1>All Tournaments</h1>
                <div className="AllTourneys">
                    <div className="NotActiveTourneys">
                        <h2>In Registration:</h2>
                        <table className="NotActiveTable">
                            <thead>
                                <tr>
                                    <th>Tournament id</th>
                                    <th>Host</th>
                                    <th>Entrants</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Register</th>
                                </tr>
                            </thead>
                            <tbody>
                               {tourneyData}
                            </tbody>
                        </table>
                    </div>
                    <div className="ActiveTourneys">
                        <h2>All Active Tournaments:</h2>
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
                                {activeTourneyData}
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

export default connect(mapStateToProps, mapDispatchToProps)(AllTourneys);