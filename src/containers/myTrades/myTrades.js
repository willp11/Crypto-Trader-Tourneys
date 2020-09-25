import React, { Component } from 'react';
import {connect} from 'react-redux';
import './myTrades.css';
import * as actions from '../../store/actions/index';
import {Redirect} from 'react-router-dom';
import axios from 'axios';

class MyTrades extends Component {
    
    state = {
        trades: []
    }

    componentDidMount() {
        let trades = [];
        axios.post('/getMyTrades', {"userId": this.props.userId}).then(res => {
            this.setState({trades: res.data.response});
        });
    }
    
    render() {
        
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
                <h1>My Trades</h1>
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
        )
    }
};


const mapDispatchToProps = dispatch => {
    return {

    };
};

const mapStateToProps = state => {
    return {
        userId: state.auth.userId
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(MyTrades);