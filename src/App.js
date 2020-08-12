import React, {Component} from 'react';
import './App.css';
import { Route, Switch, withRouter, Redirect } from 'react-router-dom';
import NavTop from './components/navigation/nav-top/nav-top';
import Home from './containers/home/home';
import CreateTournament from './containers/createTournament/createTournament';
import AllTourneys from './containers/allTourneys/allTourneys';
import MyTourneys from './containers/myTourneys/myTourneys';
import Login from './containers/login/login';
import Register from './containers/register/register';
import Profile from './containers/profile/profile';
import Logout from './containers/logout/logout';
import Tourney from './containers/tourney/tourney';

class App extends Component {
    render() {
        
        let routes = (
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/register" component={Register} />
                <Route path="/login" component={Login} />
                <Route path="/createTournament" component={CreateTournament} />
                <Route path="/allTournaments" component={AllTourneys} />
                <Route path="/myTournaments" component={MyTourneys} />
                <Route path="/profile" component={Profile} />
                <Route path="/logout" component={Logout} />
                <Route path="/tourneys/:tourneyId" component={Tourney} />
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
