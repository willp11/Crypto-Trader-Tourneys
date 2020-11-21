import React, {Component} from 'react';
import './home.css';
import winMoneyImg from "../../assets/winMoney.jpg";
import hostTourneyImg from "../../assets/hostTourneyImg.jpg";
import { NavLink } from 'react-router-dom';
import NavBottom from "../../components/navigation/nav-bottom/nav-bottom";

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
                            <div className="competeDiv">
                                <img className="winMoneyImg" src={winMoneyImg} />
                                <div className="competePara">
                                    <p><NavLink to="/register">Create an account</NavLink> and then go to <NavLink to="/registrationTourneys">tournament registration</NavLink> to choose from all the publicly listed trading tournaments created by our members from all around the world!</p>
                                    <p>To find the tournament that suits you; filter by trading products eg. ETH/BTC, BTC-PERP, the maximum number of entrants and more!</p>
                                    <p>To register to tournaments, create an account with <a href="https://www.ftx.com">FTX Exchange</a>.</p>
                                    <p>Then link your exchange API key and secret found in your FTX account to your <b>CryptoTourneys</b> account and enter tournaments.</p>
                                </div>
                            </div>
                        </div>
                        <div className="homeLowerSubDiv">
                            <h2>Create Your Own Tournaments</h2>
                            <div className="hostDiv">
                                <img className="hostTourneyImg" src={hostTourneyImg} />
                                <div className="hostPara">
                                    <p>Create your own trading tournaments in seconds!</p>
                                    <p>Choose the trading products that can be traded in the tournament, the maximum number of entrants allowed to register, the start time and the duration of the tournament.</p>
                                    <p>You can choose to make the tournament public for anyone in the world to enter. All public tournaments are listed on the <NavLink to="/registrationTourneys">tournament registration</NavLink> page for all users to find and register to.</p>
                                    <p>Or you can make the tournament private and invite your friends to join. To invite your friends to the tournament you can send them an invitation directly or you can give them the tournament lobby URL and the invite code.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="howTourneysWork">
                        <h2>How do tournaments work?</h2>
                        <p>All tournaments are ranked by profit percentage. Therefore, when you register for a tournament you enter a starting balance. This starting balance is used to determine your profit percentage.</p>
                        <p>If at any point during the tournament you have losses equal to or greater than your starting balance, you will be liquidated out of the tournament. Once liquidated, no further trades will be considered. Liquidated entrants are ranked based on the time they were liquidated.</p>
                        <p>When the tournament starts, we start scanning your FTX trading account for any trades that you make for the products listed in the tournament. Any positions opened before the start of the tournament will not count towards your tournament profit.</p>
                        <p>As the tournament is in progress, we constantly scan entrants APIs for trades and re-calculates the profit percentages based on the current prices of the trading products and any trades made by the tournament entrants.</p>
                        <h3>An Example:</h3>
                        <p>You enter a tournament with products; BTC/USD and ETH/USD.</p>
                        <p>You enter a starting balance of $1000.</p>
                        <p>The tournament starts and you place a BTC/USD trade by selling 1 BTC at price $10000. This effectively enters you into a short position for the tournament.</p>
                        <p>If the BTC/USD price goes to $11000, your position will have lost $1000 and you will be liquidated out of the tournament.</p>
                        <p>However, if the BTC/USD price goes to $12000, your profit will be $2000. Given a starting balance of $1000, your profit percentage will be 200%.</p>
                    </div>
                </div>
                <NavBottom />
            </div>
        );       
    }
}

export default Home;