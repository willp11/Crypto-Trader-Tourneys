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
            startTime: null,
            duration: null,
            quoteCurrency: null
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
//        console.log(this.props.productList);
    }

    componentWillUnmount() {
        this.props.emptyProductList();
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
        
        if (dbData.maxEntrants === null || dbData.minEntrants === null || dbData.startDate === null ||  dbData.startTime === null || dbData.duration === null) {
            valid = false;
            errorMsg = <p style={{"fontWeight": "bold"}}>Not all required information has been entered.</p>
        } else {
//            if (dbData.maxEntrants < 2 || dbData.maxEntrants > 1000) {
//                valid = false;
//                errorMsg = <p style={{"fontWeight": "bold"}}>You must have between 2 and 1000 maximum entrants.</p>
//            }
//
//            if (dbData.minEntrants < 2 || dbData.minEntrants > 1000) {
//                valid = false;
//                errorMsg = <p style={{"fontWeight": "bold"}}>You must have between 2 and 1000 minimum entrants.</p>
//            }
//
//            if (dbData.startTime[3] != 0 || dbData.startTime[4] != 0 ) {
//                valid = false;
//                errorMsg = <p style={{"fontWeight": "bold"}}>You must enter a start time in minutes 00.</p>
//            }
//            
//            if (dbData.productList.length == 0) {
//                valid = false;
//                errorMsg = <p style={{"fontWeight": "bold"}}>You must choose at least 1 trading product.</p>
//            }
            
//            if (givenStartTS < earliestTS) {
//                valid = false;
//                errorMsg = <p style={{"fontWeight": "bold"}}>The start time must be more than 1 hour from now.</p>
//            }
//            if (givenStartTS > latestTS) {
//                valid = false;
//                errorMsg = <p style={{"fontWeight": "bold"}}>The start time must be less than 30 days from now.</p>
//            }
//
//            if (dbData.duration < 1 || dbData.duration > 7) {
//                valid = false;
//                errorMsg = <p style={{"fontWeight": "bold"}}>The duration must be between 1 to 7 days.</p>
//            }
            
        }
        
        this.setState({errorMsg: errorMsg});

        return valid;
    }

    submitHandler = (event) => {
        event.preventDefault();

        let dbData = {host: this.props.username,
            noEntrants: 1,
            minEntrants: this.state.formData.minEntrants,
            maxEntrants: this.state.formData.maxEntrants,
            startDate: this.state.formData.startDate,
            startTime: this.state.formData.startTime,
            productList: this.props.productList,
            tourneyId: null,
            duration: this.state.formData.duration
        }
        
        if (this.checkValidity(dbData)) {
            let tourneyNumber = Math.floor(Math.random()*1000000000);
            
            let newDbData = {"host": this.props.username,
            "hostId": this.props.userId,
            "maxEntrants": this.state.formData.maxEntrants,
            "minEntrants": this.state.formData.minEntrants,
            "noEntrants": 0,                 
            "startDate": this.state.formData.startDate,
            "startTime": this.state.formData.startTime,
            "tourneyId": tourneyNumber,
            "duration": this.state.formData.duration,
            "quoteCurrency": this.state.formData.quoteCurrency
            }
            
            console.log(newDbData);
            axios.post('/createTournament', newDbData).then(res => {
                console.log(res.data);
                let balance;
                if (this.state.formData.quoteCurrency == 'USD') {
                    balance = 500;
                } else if (this.state.formData.quoteCurrency == 'BTC') {
                    balance = 1;
                }
                axios.post('/tourneyRegistration', {"tourneyId": tourneyNumber, "userId": this.props.userId, "username": this.props.username, "balance": balance}).then(res => {
                    console.log(res.data);
                    axios.post('/registerProducts', {"products": this.props.productList, "tourneyId": tourneyNumber}).then(res => {
                        console.log(res.data);
                        this.props.emptyProductList();
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
        this.props.emptyProductList();
        let oldFormData = {...this.state.formData};
        oldFormData['quoteCurrency'] = product;
        this.setState({formData: oldFormData, showProducts: product});
    }
    
    render() {
        
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
 
        let FTXSpotProductUSD = null;
        let FTXFuturesProductsUSD = null;
        let FTXSpotProductBTC = null;
        let FTXFuturesProductsBTC = null;

        if (this.state.productList) {
            FTXSpotProductUSD = this.state.productList.products.FTX.spot.USD;
            FTXFuturesProductsUSD = this.state.productList.products.FTX.future;
            FTXSpotProductBTC = this.state.productList.products.FTX.spot.BTC;
            FTXFuturesProductsBTC = null;
        }
        
        let productsDiv = <p style={{'fontWeight': 'normal', 'fontSize': '0.8rem'}}>Choose a currency first.</p>

        let buttonsDiv = (
            <div>
                <button onClick={(event, product)=>this.showProductsHandler(event, "BTC")}>BTC</button>
                <button onClick={(event, product)=>this.showProductsHandler(event, "USD")}>USD</button>
            </div>
        );

        let selectedProducts = null;
        let selectedProductsTitle = null;
        if (this.props.productList.FTX.spot.length > 0 || this.props.productList.FTX.future.length > 0)
        {
            let allProducts = [];
            for (let i=0; i<this.props.productList.FTX.spot.length; i++) {
                allProducts.push(this.props.productList.FTX.spot[i]);
            }
            for (let i=0; i<this.props.productList.FTX.future.length; i++) {
                allProducts.push(this.props.productList.FTX.future[i]);
            }
            //console.log(allProducts);
            selectedProductsTitle = <h4>Selected Products:</h4>
            selectedProducts = allProducts.map(product => {
                return (
                    <p key={product} style={{"fontWeight": "normal", "fontSize": "0.9rem"}}>{product}</p>
                );
            });
        }
        
        if (this.state.showProducts != false) {
            if (this.state.showProducts == 'BTC') {
                buttonsDiv = (
                    <div>
                        <button className="Selected" onClick={(event, product)=>this.showProductsHandler(event, "BTC")}>BTC</button>
                        <button onClick={(event, product)=>this.showProductsHandler(event, "USD")}>USD</button>
                    </div>
                );
                productsDiv = (
                    <div>
                        <div>
                            <CheckDropdown exchange="FTX" title="FTX: Spot" products={FTXSpotProductBTC} productType="spot" /> <br />
                            <CheckDropdown exchange="FTX" title="FTX: Futures" products={FTXFuturesProductsBTC} productType="future" /> <br />
                        </div>
                        <div className="No-display">
                            <CheckDropdown exchange="FTX" title="FTX: Spot" products={FTXSpotProductUSD} productType="spot" /> <br />
                            <CheckDropdown exchange="FTX" title="FTX: Futures" products={FTXFuturesProductsUSD} productType="future" /> <br />
                        </div>
                        <p style={{'fontWeight': 'normal', 'fontSize': '0.8rem'}}>Maximum 10 products per tournament</p>
                    </div>
                );
            } else if (this.state.showProducts == 'USD') {
                buttonsDiv = (
                    <div>
                        <button onClick={(event, product)=>this.showProductsHandler(event, "BTC")}>BTC</button>
                        <button className="Selected" onClick={(event, product)=>this.showProductsHandler(event, "USD")}>USD</button>
                    </div>
                );
                productsDiv = ( 
                    <div>
                        <div className="No-display">
                            <CheckDropdown exchange="FTX" title="FTX: Spot" products={FTXSpotProductBTC} productType="spot" /> <br />
                            <CheckDropdown exchange="FTX" title="FTX: Futures" products={FTXFuturesProductsBTC} productType="future" /> <br />
                        </div>
                        <div>
                            <CheckDropdown exchange="FTX" title="FTX: Spot" products={FTXSpotProductUSD} productType="spot" /> <br />
                            <CheckDropdown exchange="FTX" title="FTX: Futures" products={FTXFuturesProductsUSD} productType="future" /> <br />
                        </div>
                        <p style={{'fontWeight': 'normal', 'fontSize': '0.8rem'}}>Maximum 10 products per tournament</p>
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
                    {selectedProductsTitle}
                    {selectedProducts}
            
                    <p>Start Date:</p>
                    <input type="date" onChange={(event, key) => this.hostInputHandler(event, 'startDate')}/>
                    <p>Start Time:</p>
                    <input type="time" step="3600000" min="00:00" onChange={(event, key) => this.hostInputHandler(event, 'startTime')}/>
                    
                    <p>Duration:</p>
                    <Input type="number" min="1" max="7" placeholder="Duration in days" changed={(event, key) => this.hostInputHandler(event, 'duration')} /> <br/>
                    <p style={{"fontSize":"0.8rem", "fontWeight":"normal"}}>Maximum 7 days</p>
            
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
        getMyTourneys: (userId) => dispatch(actions.getMyTourneys(userId)),
        emptyProductList: () => dispatch(actions.emptyProductList())
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