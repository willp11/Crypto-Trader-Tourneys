import React, {Component} from 'react';
import './wallet.css';

class Wallet extends Component {
    
    state = {
        balance: 1.25432100,
        withdraw: { withdrawQty: '',
                    withdrawAddr: ''},
        deposits: [],
        withdrawals: []
    }

    componentDidMount() {
        // GET BALANCE AND UPDATE REDUX WALLET
        // GET DEPOST AND WITHDRAW HISTORY
    }

    componentDidUpdate() {
        console.log(this.state);
    }

    withdrawInputHandler = (event, field) => {
        let withdraw = {...this.state.withdraw};
        withdraw[field] = event.target.value;
        this.setState({withdraw});
    }
    
    submitWithdrawHandler = () => {
        // CALL API TO WITHDRAW
    }

    render () {
        
        let deposits = null;
        let withdrawals = null;
        
        return (
            <div className="walletDiv">
                <div className="walletSubDiv">
                    <h1>Wallet</h1>
                    <div className="walletPanel">  
                        <h3>Balance</h3>
                        <div className="balanceDiv">
                            <p>{this.state.balance} BTC</p>
                        </div>
                    </div>
                    <div className="walletPanel">
                        <h3>Deposit:</h3>
                        <h4>BTC Deposit Address</h4>
                        <div className="addressDiv">
                            <p>dshaskhdjasdjkbasdansadsnjands</p>
                        </div>
                        <div className="depositHistory">
                        </div>
                    </div>
                    <div className="walletPanel">
                        <h3>Withdraw:</h3>
                        <h4>Enter Amount to Withdraw (BTC)</h4>
                        <input type="text"  className="withdrawQtyInput" placeholder="Enter Quantity (BTC)" onChange={(event, field) => this.withdrawInputHandler(event, 'withdrawQty')} />
                        <h4>Enter BTC withdrawal address</h4>
                        <input type="text"  className="withdrawAddrInput" placeholder="BTC Withdrawal Address" onChange={(event, field) => this.withdrawInputHandler(event, 'withdrawAddr')} />
                        <button className="withdrawSubmitBtn" onClick={this.submitWithdrawHandler}>Submit</button>
                        <div className="depositHistory">
                        </div>
                    </div>
                    <div className="walletPanel">
                        <h3>History</h3>
                        <h4>Deposit History</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Quantity</th>
                                    <th>Txid</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deposits}
                            </tbody>
                        </table>
                        <h4>Withdraw History</h4>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Quantity</th>
                                    <th>Txid</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
    
}

export default Wallet;