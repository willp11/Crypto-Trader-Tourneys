import React, {Component} from 'react';
import './profile.css';
import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';
import { NavLink, Redirect } from 'react-router-dom';
import axios from 'axios';

class Profile extends Component {
    
    state = {
        API1: '',
        API2: '',
        API3: ''
    }
    
    componentDidMount() {
        if (this.props.userId) {
            this.props.getUsernameEmail(this.props.userId);
            this.props.getMyTourneys(this.props.userId);
            axios.post('/getAPIInfo', {"userId": this.props.userId}).then(res => {
                console.log(res.data);
                this.setState({
                    API1: res.data.API1,
                    API2: res.data.API2,
                    API3: res.data.API3
                });
            })
        } 
    }
    
    inputChangeHandler = (event, API) => {
        let APIKey = event.target.value;
        let newState = {};
        newState[API] = APIKey;
        this.setState(newState);
    }
    
    submitHandler = (API) => {
        console.log(this.state);
        
        axios.post('/updateAPI', {"userId": this.props.userId, "API": API, "APIKey": this.state[API]}).then(res => {
            console.log(res.data);
        })
    }
    
    render () {
        
        let content = (
                <Redirect to="/login" />
            );
        if (this.props.userId) {
            content = (
                <div>
                    <h1>My Account</h1>
                    <h2>Username:</h2>
                    <p>{this.props.username}</p>
                    <h2>Email:</h2>
                    <p>{this.props.email}</p>
                    <div>
                        <h2>APIs</h2>
                        <div>
                            <h3>Binance:</h3>
                            <input type="text" placeholder={this.state.API1 ? this.state.API1 : "Binance API Key"} onChange={(event, API) => this.inputChangeHandler(event, "API1")} />
                            <button onClick={(API) => this.submitHandler("API1")}>Update API Key</button>
                        </div>
                        <div>
                            <h3>FTX:</h3>
                            <input type="text" placeholder={this.state.API2 ? this.state.API2 : "FTX API Key"} onChange={(event, API) => this.inputChangeHandler(event, "API2")} />
                            <button onClick={(API) => this.submitHandler("API2")}>Update API Key</button>
                        </div>
                        <div>
                            <h3>Bitfinex:</h3>
                            <input type="text" placeholder={this.state.API3 ? this.state.API3 : "Bitfinex API Key"} onChange={(event, API) => this.inputChangeHandler(event, "API3")} />
                            <button onClick={(API) => this.submitHandler("API3")}>Update API Key</button>
                        </div>
                    </div>
                </div>
            );
        };
        
        return (
            <div>
                {content}
            </div>
        )
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        getUsernameEmail: (userId) => dispatch(actions.getUsernameEmail(userId)),
        getMyTourneys: (userId) => dispatch(actions.getMyTourneys(userId))
    }
};

const mapStateToProps = (state) => {
    return {
        userId: state.auth.userId,
        username: state.auth.username,
        email: state.auth.email
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);