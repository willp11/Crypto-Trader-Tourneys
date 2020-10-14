import React, { Component } from 'react';
import {connect} from 'react-redux';
import './myTrades.css';
import * as actions from '../../store/actions/index';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import Spinner from '../../components/UI/Spinner/Spinner';
import {firebaseAuth} from "../../firebase/firebase";

class MyTrades extends Component {
    
    state = {
        trades: [],
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
                    let trades = [];
                    axios.post('/getMyTrades', {"userId": user.uid}).then(res => {
                        this.setState({trades: res.data.response, loading: false});
                    }).catch(err => {
                        this.setState({error: true});
                    });
                }
            } else {
                this.setState({authFail: true});
            }
        });
    }
    
    render() {
        
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
        
        let spinner = null;
        if (this.state.loading) spinner = <Spinner />
        
        let tableBody = null;
        console.log(this.state.trades);
        if (this.state.trades.length > 0) {
            tableBody = this.state.trades.map((trade, index) => {
                return (
                    <tr key={index}>
                        <td>{trade.tourneyId}</td>
                        <td>{trade.date}</td>
                        <td>{trade.time}</td>
                        <td>{trade.productName}</td>
                        <td>{trade.side}</td>
                        <td>{trade.quantity}</td>
                        <td>{trade.price}</td>
                    </tr>
                );
            })
        }
        
        return (
            <div className="MyTradesDiv">
                {redirect}
                <div className="MyTradesSubSiv">
                    <h1>My Trades</h1>
                    {spinner}
                    <div className="MyTradesSubSiv2">
                        <p>A full list of all trades found from your API for every trading tournament that you have entered.</p>
                        <table className="TradesTable">
                            <thead>
                                <tr>
                                    <th>Tourney id</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Product</th>
                                    <th>Side</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableBody}
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
        updateUserIdToken: (userId, token) => dispatch(actions.updateUserIdToken(userId, token))
    };
};

const mapStateToProps = state => {
    return {
        userId: state.auth.userId
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(MyTrades);