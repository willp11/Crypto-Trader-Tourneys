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
                            <p>Currently all tournaments are hosted on FTX Exchange as we believe they have the best selection of trading products in the cryptocurrency space. We will look to add support for more exchanges in the future.</p>
                            <p>To start entering trading tournaments just simply create an account with us and an account with FTX exchange. Then link your FTX account to CryptoTourneys using your API key.</p>
                            <p>To find the tournament that suits you; filter by trading products, host, number of entrants and more!</p>
                            <p>In the future we will add paid entry tournaments where users will win BTC prizes!</p>
                        </div>
                        <div className="homeLowerSubDiv">
                            <h2>Host Your Own Tournaments</h2>
                            <img className="hostTourneyImg" src={hostTourneyImg} />
                            <p>Host your own trading tournaments in seconds!</p>
                            <p>Select the trading products allowed for the tournament (e.g. BTCUSD), entry fee, start time, duration, maximum number of entrants and more!</p>
                            <p>Make the tournament private and invite your friends only or make it public for anyone in the world to enter!</p>
                            <p>When we release paid entry tournaments, hosts will receive up to 50% of the fees generated for tournaments that they host!</p>
                        </div>
                    </div>
                </div>
            </div>
        );       
    }
}

export default Home;