import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {BrowserRouter} from 'react-router-dom';

import {createStore, applyMiddleware, compose, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';

import authReducer from './store/reducers/auth';
import tourneyReducer from './store/reducers/tourneys';
import newTourneyReducer from './store/reducers/newTourney';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const rootReducer = combineReducers({
    tourneys: tourneyReducer,
    auth: authReducer,
    newTourney: newTourneyReducer
});

const store = createStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
