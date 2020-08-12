import React, { Component } from 'react';
import {connect} from 'react-redux';
import Input from '../../components/UI/Input/Input';
import './createTournament.css';
import CheckDropdown from '../../components/UI/CheckDropDown/CheckDropDown';
import * as actions from '../../store/actions/index';
import {Redirect} from 'react-router-dom';
import axios from 'axios';

import { firebaseDB } from '../../firebase/firebase';

class CreateTournament extends Component {
    
    state = {
        formData: {
            host: 'will',
            noEntrants: null,
            maxEntrants: null,
            minEntrants: null,
            startDate: null,
            endDate: null,
            startTime: null,
            endTime: null
        },
        redirect: false,
        errorMsg: '',
        productList: null,
        showProducts: false
    }
    
    componentDidMount() {
        let productList;
        axios.get('/getAllProducts').then(res => {
            productList=res.data;
            this.setState({productList: productList});
        });
    }

    componentDidUpdate() {
        console.log(this.props.productList);
    }

    checkValidity = (dbData) => {
        let valid = true;
        let errorMsg = null;
        
        // the given start time must be more than 1 day and less than 30 days from now - the given end time must be within 1 year from the given start time
        let now = new Date();
        let utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000).getTime();
        let earliestTS = utcNow + (60*60*1000);
        let latestTS = utcNow + (60*60*24*1000*30);
        
        let givenStart = dbData.startDate + ' ' + dbData.startTime;
        let givenStartTS = new Date(givenStart).getTime();

        let givenEnd = dbData.endDate + ' ' + dbData.endTime;
        let givenEndTS = new Date(givenEnd).getTime();

        let latestEndTS = givenStartTS + (60*60*24*1000*365);
        
        console.log(dbData.startTime);
        
        if (dbData.maxEntrants === null || dbData.minEntrants === null || dbData.startDate === null || dbData.endDate === null || dbData.startTime === null || dbData.endTime === null) {
            valid = false;
            errorMsg = <p style={{"fontWeight": "bold"}}>Not all required information has been entered.</p>
        } else {
            if (dbData.maxEntrants < 2 || dbData.maxEntrants > 1000) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold"}}>You must have between 2 and 1000 maximum entrants.</p>
            }

            if (dbData.minEntrants < 2 || dbData.minEntrants > 1000) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold"}}>You must have between 2 and 1000 minimum entrants.</p>
            }

            if (dbData.startTime[3] != 0 || dbData.startTime[4] != 0 || dbData.endTime[3] != 0 || dbData.endTime[4] != 0) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold"}}>You must enter a start and end time with minutes 00.</p>
            }
            
            if (dbData.productList.length == 0) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold"}}>You must choose at least 1 trading product.</p>
            }
            
//            if (givenStartTS < earliestTS) {
//                valid = false;
//                errorMsg = <p style={{"fontWeight": "bold"}}>The start time must be more than 1 hour from now.</p>
//            }
            if (givenStartTS > latestTS) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold"}}>The start time must be less than 30 days from now.</p>
            }
            if (givenEndTS > latestEndTS) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold"}}>The end time must be less than 1 year from the start time.</p>
            }
            if (givenStartTS + (60*60*24*1000) > givenEndTS) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold"}}>The end time must be more than 1 day from the start time.</p>
            }
            
        }
        
        this.setState({errorMsg: errorMsg});

        return valid;
    }

    submitHandler = (event) => {
        event.preventDefault();

        let dbData = {host: this.props.username,
            noEntrants: 1,
            maxEntrants: this.state.formData.maxEntrants,
            startDate: this.state.formData.startDate,
            endDate: this.state.formData.endDate,
            startTime: this.state.formData.startTime,
            endTime: this.state.formData.endTime,
            productList: this.props.productList,
            tourneyId: null
        }
        
        if (this.checkValidity(dbData)) {
            let tourneyNumber = Math.floor(Math.random()*1000000000);
            
            let newDbData = {"host": this.props.username,
            "hostId": this.props.userId,
            "maxEntrants": this.state.formData.maxEntrants,
            "minEntrants": this.state.formData.minEntrants,
            "noEntrants": 0,                 
            "startDate": this.state.formData.startDate,
            "endDate": this.state.formData.endDate,
            "startTime": this.state.formData.startTime,
            "endTime": this.state.formData.endTime,
            "tourneyId": tourneyNumber
            }
            axios.post('/createTournament', newDbData).then(res => {
                console.log(res.data);
                
                axios.post('/tourneyRegistration', {"tourneyId": tourneyNumber, "userId": this.props.userId, "username": this.props.username}).then(res => {
                    console.log(res.data);
                    axios.post('/registerProducts', {"products": this.props.productList, "tourneyId": tourneyNumber}).then(res => {
                         console.log(res.data);
                    });
                });
            });

            let newState = {
                ...this.state
            };
            newState["redirect"] = true;
            this.setState(newState);

            //this.props.getMyTourneys(this.props.userId);
        }
        
    }
    
    hostInputHandler = (event, key) => {
        
        let newData = {...this.state.formData};
        newData[key] = event.target.value;
        
        this.setState({
            formData: newData
        })
    }
    
    showProductsHandler = (event, product) => {
        event.preventDefault();
        this.setState({showProducts: product});
    }
    
    render() {
        
        let productData = {
            Binance: ["BTCUSD", "ETHUSD", "EOSUSD", "ETHBTC", "LTCBTC"],
            FTX: ["BTCUSD", "ETHUSD", "EOSUSD", "ETHBTC", "LTCBTC"],
            Bitfinex: ["BTCUSD", "ETHUSD", "EOSUSD", "ETHBTC", "LTCBTC"]
        }
        
        let redirect = null;
        if (this.state.redirect) {
            redirect = (
                <Redirect to="/allTournaments" />
            );
        }
        
        if (!this.props.userId) {
            redirect = (
                <Redirect to="/login" />
            )
        }
        
        let binanceSpotProductsBTC = null;
        let binanceMarginProductsBTC = null;
        let binanceSpotProductsUSDT = null;
        let binanceMarginProductsUSDT = null;
        if (this.state.productList) {
            binanceSpotProductsBTC = this.state.productList.products.Binance.spot.BTC;
            binanceMarginProductsBTC = this.state.productList.products.Binance.margin.BTC;
            binanceSpotProductsUSDT = this.state.productList.products.Binance.spot.USDT;
            binanceMarginProductsUSDT = this.state.productList.products.Binance.margin.USDT;
        }
        
        let productsDiv = <p style={{'fontWeight': 'normal', 'fontSize': '0.8rem'}}>Choose a currency first.</p>

        let buttonsDiv = (
            <div>
                <button onClick={(event, product)=>this.showProductsHandler(event, "BTC")}>BTC</button>
                <button onClick={(event, product)=>this.showProductsHandler(event, "USDT")}>USDT</button>
            </div>
        );
        
        if (this.state.showProducts != false) {
            if (this.state.showProducts == 'BTC') {
                buttonsDiv = (
                    <div>
                        <button className="Selected" onClick={(event, product)=>this.showProductsHandler(event, "BTC")}>BTC</button>
                        <button onClick={(event, product)=>this.showProductsHandler(event, "USDT")}>USDT</button>
                    </div>
                );
                productsDiv = (
                    <div>
                        <div>
                            <CheckDropdown exchange="Binance" title="Binance: Spot" products={binanceSpotProductsBTC} /> <br />
                            <CheckDropdown exchange="Binance" title="Binance: Margin" products={binanceMarginProductsBTC} /> <br />
                        </div>
                        <div className="No-display">
                            <CheckDropdown exchange="Binance" title="Binance: Spot" products={binanceSpotProductsUSDT} /> <br />
                            <CheckDropdown exchange="Binance" title="Binance: Margin" products={binanceMarginProductsUSDT} /> <br />
                        </div>
                        <p style={{'fontWeight': 'normal', 'fontSize': '0.8rem'}}>Maximum 50 products per tournament</p>
                    </div>
                );
            } else if (this.state.showProducts == 'USDT') {
                buttonsDiv = (
                    <div>
                        <button onClick={(event, product)=>this.showProductsHandler(event, "BTC")}>BTC</button>
                        <button className="Selected" onClick={(event, product)=>this.showProductsHandler(event, "USDT")}>USDT</button>
                    </div>
                );
                productsDiv = ( 
                    <div>
                        <div className="No-display">
                            <CheckDropdown exchange="Binance" title="Binance: Spot" products={binanceSpotProductsBTC} /> <br />
                            <CheckDropdown exchange="Binance" title="Binance: Margin" products={binanceMarginProductsBTC} /> <br />
                        </div>
                        <div>
                            <CheckDropdown exchange="Binance" title="Binance: Spot" products={binanceSpotProductsUSDT} /> <br />
                            <CheckDropdown exchange="Binance" title="Binance: Margin" products={binanceMarginProductsUSDT} /> <br />
                        </div>
                        <p style={{'fontWeight': 'normal', 'fontSize': '0.8rem'}}>Maximum 50 products per tournament</p>
                    </div>
                );
            } 
        }
        
        return (
            <div>
                {redirect}
                <h1>Create New Tournament</h1>
                <form className="createTournForm">
                    <p>Minimum Number of Entrants:</p>
                    <Input placeholder="Min no. entrants" changed={(event, key) => this.hostInputHandler(event, 'minEntrants')}/> <br />
                    <p>Maximum Number of Entrants:</p>
                    <Input placeholder="Max no. entrants" changed={(event, key) => this.hostInputHandler(event, 'maxEntrants')}/> <br />
                    
                    <p>Choose currency:</p>
                    {buttonsDiv}
                    
                    <p>Choose Trading Products:</p>
                    {productsDiv}
            
                    <p>Start Date:</p>
                    <input type="date" onChange={(event, key) => this.hostInputHandler(event, 'startDate')}/>
                    <p>Start Time:</p>
                    <input type="time" step="3600000" min="00:00" onChange={(event, key) => this.hostInputHandler(event, 'startTime')}/>
                    
                    <p>End Date:</p>
                    <input type="date" onChange={(event, key) => this.hostInputHandler(event, 'endDate')}/> <br/>
                    <p>End Time:</p>
                    <input type="time" step="3600000" min="00:00" onChange={(event, key) => this.hostInputHandler(event, 'endTime')}/> <br/>
            
                    <button className="submitBtn" type="submit" onClick={(event) => this.submitHandler(event)}>Submit</button>
                </form>
                {this.state.errorMsg}
            </div>
        )
    }
};


const mapDispatchToProps = dispatch => {
    return {
        updateProductList: (productList) => dispatch(actions.updateProductList(productList)),
        getMyTourneys: (userId) => dispatch(actions.getMyTourneys(userId))
    };
};

const mapStateToProps = state => {
    return {
        productList: state.newTourney.productList,
        username: state.auth.username,
        userId: state.auth.userId
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(CreateTournament);