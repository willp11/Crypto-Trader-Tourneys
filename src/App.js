import React, {Component} from 'react';
import './App.css';
import { Route, Switch, withRouter, Redirect } from 'react-router-dom';
import NavTop from './components/navigation/nav-top/nav-top';
import NavBottom from './components/navigation/nav-bottom/nav-bottom';
import Home from './containers/home/home';
import CreateTournament from './containers/createTournament/createTournament';
import RegistrationTourneys from './containers/registrationTourneys/registrationTourneys';
import ActiveTourneys from './containers/activeTourneys/activeTourneys';
import CompletedTourneys from './containers/completedTourneys/completedTourneys';
import MyTourneys from './containers/myTourneys/myTourneys';
import Login from './containers/login/login';
import Register from './containers/register/register';
import Profile from './containers/profile/profile';
import Logout from './containers/logout/logout';
import Tourney from './containers/tourney/tourney';
import Wallet from './containers/wallet/wallet';
import MyTrades from './containers/myTrades/myTrades';

class App extends Component {
    render() {
        
        let routes = (
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/register" component={Register} />
                <Route path="/login" component={Login} />
                <Route path="/createTournament" component={CreateTournament} />
                <Route path="/registrationTourneys" component={RegistrationTourneys} />
                <Route path="/activeTourneys" component={ActiveTourneys} />
                <Route path="/completedTourneys" component={CompletedTourneys} />
                <Route path="/myTournaments" component={MyTourneys} />
                <Route path="/profile" component={Profile} />
                <Route path="/wallet" component={Wallet} />
                <Route path="/logout" component={Logout} />
                <Route path="/tourneys/:tourneyId" component={Tourney} />
                <Route path="/myTrades" component={MyTrades} />
                <Redirect to="/" />
            </Switch>
        )
        
        return (
            <div className="App">
                <NavTop />
                {routes}
            </div>
        )   
    }
};

export default withRouter(App);
