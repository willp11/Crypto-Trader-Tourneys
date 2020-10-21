import React, {Component} from 'react';
import './home.css';
import winMoneyImg from "../../assets/winMoney.jpg";
import hostTourneyImg from "../../assets/hostTourneyImg.jpg";
import { NavLink } from 'react-router-dom';

class Home extends Component {
    
    render () {
        
        return (
            <div>
                <div className="homeDiv">
                    <div className="homeSubDiv">
                        <h1 className="homeMainHead">Crypto Tourneys</h1>
                        <NavLink to="/register"><button>Sign Up Now!</button></NavLink>
                        <h2>The ONLY place for crypto trading tournaments!</h2>
                            <div className="infoDiv">
                                <h3>ENTER TOURNAMENTS!</h3>
                                <p>Compete in public cryptocurrency trading tournaments!</p>
                                <h3>HOST TOURNAMENTS!</h3>
                                <p>Create a new tournament in seconds customized exactly how you want it!</p>
                                <h3>INVITE YOUR FRIENDS!</h3>
                                <p>Invite your friends and trading community to participate in your tournament!</p>
                            </div>
                    </div>
                </div>
                <div className="homeDiv2">
                    <div className="homeLowerSubDivWrapper">
                        <div className="homeLowerSubDiv">
                            <h2>Compete in Trading Tournaments</h2>
                            <img className="winMoneyImg" src={winMoneyImg} />
                            <p>Choose from all the publicly listed trading tournaments created by our members from all around the world completely free!</p>
                            <p>To find the tournament that suits you; filter by trading products, host, number of entrants and more!</p>
                            <p>Create an account with <a href="https://www.ftx.com">FTX Exchange</a>.</p>
                            <p>Then link your exchange API key and secret found in your FTX account to your <b>CryptoTourneys</b> account and enter tournaments.</p>
                        </div>
                        <div className="homeLowerSubDiv">
                            <h2>Host Your Own Tournaments</h2>
                            <img className="hostTourneyImg" src={hostTourneyImg} />
                            <p>Host your own trading tournaments in seconds!</p>
                            <p>Customize your tournament to fit your needs!</p>
                            <p>Choose the trading products, number of entrants, start time and duration of the tournament.</p>
                            <p>Make the tournament public for anyone in the world to enter!</p>
                            <p>Make the tournament private and invite your friends!</p>
                        </div>
                    </div>
                </div>
                <div className="howItWorksDiv">
                    <div className="howItWorksSubDiv">
                        <h2>How It Works</h2>
                        <div className="stepSubDiv">
                            <h3>Step 1:</h3>
                            <p>Create a <NavLink to="/register">CryptoTourneys Account</NavLink>.</p>
                        </div>
                        <div className="stepSubDiv">
                            <h3>Step 2:</h3>
                            <p>Create a trading account with <a href="https://www.ftx.com">FTX Exchange</a>.</p>
                        </div>
                        <div className="stepSubDiv">
                            <h3>Step 3:</h3>
                            <p>Link your FTX exchange API key and secret to CryptoTourneys.</p>
                        </div>
                        <div className="stepSubDiv">
                            <h3>Step 4:</h3>
                            <p>Start competing in trading tournament!</p>
                        </div>
                    </div>
                </div>
            </div>
        );       
    }
}

export default Home;