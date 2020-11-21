import React, { Component } from 'react';
import {connect} from 'react-redux';
import Input from '../../components/UI/Input/Input';
import './createTournament.css';
import CheckDropdown from '../../components/UI/CheckDropDown/CheckDropDown';
import * as actions from '../../store/actions/index';
import {Redirect} from 'react-router-dom';
import axios from 'axios';
import NavBottom from '../../components/navigation/nav-bottom/nav-bottom';
import Spinner from '../../components/UI/Spinner/Spinner';

import { firebaseAuth } from '../../firebase/firebase';

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
            quoteCurrency: null,
            visibility: null,
            profitType: null
        },
        redirect: false,
        errorMsg: '',
        productList: null,
        showProducts: false,
        newTourneyId: null,
        loading: false,
        authFail: false,
        error: false,
        loadingProducts: true
    }
    
    componentDidMount() {
        
        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                if (user.emailVerified == false) {
                    this.setState({authFail: true});
                } else {
                    this.props.updateUserIdToken(user.uid, user.xa);
                    if (!this.props.username) this.props.getUsernameEmail(user.uid);
                    let productList;
                    axios.get('/api/getAllProducts').then(res => {
                        if (res.data.error) {
                            this.setState({error: true});
                        } else {
                            productList=res.data;
                            this.setState({productList: productList, loadingProducts: false});
                        }
                    }).catch(err => {
                        this.setState({error: true});
                    });
                }
            } else {
                this.setState({authFail: true});
            }
        });
        
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
        let latestTS = utcNow + (60*60*24*1000*7);
        
        let givenStart = dbData.startDate + ' ' + dbData.startTime;
        let givenStartTS = new Date(givenStart).getTime();
        
        if (dbData.maxEntrants === null || dbData.minEntrants === null || dbData.startDate === null ||  dbData.startTime === null || dbData.duration === null) {
            valid = false;
            errorMsg = <p style={{"fontWeight": "bold", "color": "#f7716d"}}>Not all required information has been entered.</p>
        } else {
            if (parseInt(dbData.maxEntrants) < 2 || parseInt(dbData.maxEntrants) > 200) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold", "color": "#f7716d"}}>The maximum number of entrants must be between 2 and 200.</p>
            }

            if (parseInt(dbData.minEntrants) < 2 || parseInt(dbData.minEntrants) > 200) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold", "color": "#f7716d"}}>The minimum number of entrants must be between 2 and 200.</p>
            }
            
            if (parseInt(dbData.maxEntrants) < parseInt(dbData.minEntrants)) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold", "color": "#f7716d"}}>The minimum number of entrants must be less than the maximum number of entrants.</p>       
            }

            if (dbData.startTime[3] != 0 || dbData.startTime[4] != 0 ) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold", "color": "#f7716d"}}>Tournaments must start on the hour. E.g. 12:00</p>
            }
            
            if (dbData.productList.FTX.future.length + dbData.productList.FTX.spot.length < 1 || dbData.productList.FTX.future.length + dbData.productList.FTX.spot.length > 5) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold", "color": "#f7716d"}}>You must choose between 1 and 5 trading products.</p>
            }
            
//            if (givenStartTS < earliestTS) {
//                valid = false;
//                errorMsg = <p style={{"fontWeight": "bold", "color": "#f7716d"}}>The start time must be more than 1 hour from now.</p>
//            }
            
            if (givenStartTS > latestTS) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold", "color": "#f7716d"}}>The start time must be less than 7 days from now.</p>
            }

            if (parseInt(dbData.duration) < 1 || parseInt(dbData.duration) > 30) {
                valid = false;
                errorMsg = <p style={{"fontWeight": "bold", "color": "#f7716d"}}>The duration must be between 1 to 30 days.</p>
            }
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
            let tourneyNumber = Math.floor(100000000 + Math.random()*900000000);
            let inviteCode = Math.floor(1000000 + Math.random() * 9000000)
    
            let newDbData = {"host": this.props.username,
                "hostId": this.props.userId,
                "maxEntrants": this.state.formData.maxEntrants,
                "minEntrants": this.state.formData.minEntrants,
                "noEntrants": 0,                 
                "startDate": this.state.formData.startDate,
                "startTime": this.state.formData.startTime,
                "duration": this.state.formData.duration,
                "quoteCurrency": this.state.formData.quoteCurrency,
                "visibility": this.state.formData.visibility,
                "products": this.props.productList,
                "profitType": this.state.formData.profitType
            }

            this.setState({loading: true});
            axios.post('/api/createTournament', newDbData).then(res => {
                let tourneyId = res.data.response.tourneyId;
                
                this.props.emptyProductList();
                this.setState({loading: false, redirect: true, newTourneyId: tourneyId});
            }).catch(err => {
                this.setState({error: true});
            });
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
    
    selectVisibilityHandler = (event) => {
        event.preventDefault();
        let visibility = event.target.name;
        let newData = {...this.state.formData};
        newData['visibility'] = visibility;
        this.setState({formData: newData});
    }
    
    selectProfitTypeHandler = (event) => {
        event.preventDefault();
        let profitType = event.target.name;
        let newData = {...this.state.formData};
        newData['profitType'] = profitType;
        this.setState({formData: newData});
    }
    
    render() {
        
        // REDIRECTS
        let redirect = null;
        if (this.state.redirect && !this.state.loading) {
            redirect = (
                <Redirect to={"/tourneys/"+this.state.newTourneyId} />
            );
        }
        
        if (this.state.authFail) {
            redirect = (
                <Redirect to="/login" />
            )
        }
            
        if (this.state.error) {
            redirect = (
                <Redirect to="/error" />
            )
        }
        
        // PRODUCTS
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
                        <p style={{'fontWeight': 'normal', 'fontSize': '0.8rem'}}>Maximum 5 products per tournament</p>
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
                    <div >
                        <div className="No-display">
                            <CheckDropdown exchange="FTX" title="FTX: Spot" products={FTXSpotProductBTC} productType="spot" /> <br />
                            <CheckDropdown exchange="FTX" title="FTX: Futures" products={FTXFuturesProductsBTC} productType="future" /> <br />
                        </div>
                        <div>
                            <CheckDropdown exchange="FTX" title="FTX: Spot" products={FTXSpotProductUSD} productType="spot" /> <br />
                            <CheckDropdown exchange="FTX" title="FTX: Futures" products={FTXFuturesProductsUSD} productType="future" /> <br />
                        </div>
                        <p style={{'fontWeight': 'normal', 'fontSize': '0.8rem'}}>Maximum 5 products per tournament</p>
                    </div>
                );
            } 
        }
        
        // VISIBILITY
        let visibilityBtns = (
            <div>
                <button name="public" onClick={(event) => this.selectVisibilityHandler(event)}>Public</button>
                <button name="private" onClick={(event) => this.selectVisibilityHandler(event)}>Private</button>
            </div>
        );

        if (this.state.formData.visibility == "public") {
            visibilityBtns = (
                <div>
                    <button className="Selected" name="public" onClick={(event) => this.selectVisibilityHandler(event)}>Public</button>
                    <button name="private" onClick={(event) => this.selectVisibilityHandler(event)}>Private</button>
                </div>
            );
        } else if (this.state.formData.visibility == "private") {
            visibilityBtns = (
                <div>
                    <button name="public" onClick={(event) => this.selectVisibilityHandler(event)}>Public</button>
                    <button className="Selected" name="private" onClick={(event) => this.selectVisibilityHandler(event)}>Private</button>
                </div>
            );
        }
        
        // PROFIT TYPE
        let profitTypeBtns = (
            <div>
                <button name="relative" onClick={(event) => this.selectProfitTypeHandler(event)}>Relative</button>
                <button name="absolute" onClick={(event) => this.selectProfitTypeHandler(event)}>Absolute</button>
            </div>
        )
        
        if (this.state.formData.profitType == "relative") {
            profitTypeBtns = (
                <div>
                    <button name="relative" className="Selected" onClick={(event) => this.selectProfitTypeHandler(event)}>Relative</button>
                    <button name="absolute" onClick={(event) => this.selectProfitTypeHandler(event)}>Absolute</button>
                </div>
            )
        } else if (this.state.formData.profitType == "absolute") {
            profitTypeBtns = (
                <div>
                    <button name="relative" onClick={(event) => this.selectProfitTypeHandler(event)}>Relative</button>
                    <button name="absolute" className="Selected" onClick={(event) => this.selectProfitTypeHandler(event)}>Absolute</button>
                </div>
            )
        }
        
        // SUBMIT BTN
        let submitBtn = <button className="submitTournBtn" type="submit" onClick={(event) => this.submitHandler(event)}>Submit</button>
        
        // LOADING AFTER CLICKING SUBMIT
        let spinner = null;
        if (this.state.loading) {
            spinner = <Spinner />
            submitBtn = null;
        }
        
        // MAIN DIV
        let createTournamentDiv = (
            <div className="createTournSubDiv">
                <h1>Create New Tournament</h1>
                <form className="createTournForm">
                    <h3>Minimum Number of Entrants:</h3>
                    <input type="number" min="2" max="200" placeholder="Min no. entrants" style={{"width": "180px", "textAlign": "center"}} onChange={(event, key) => this.hostInputHandler(event, 'minEntrants')}/> <br />
                    <h3>Maximum Number of Entrants:</h3>
                    <input type="number" min="2" max="200" placeholder="Max no. entrants" style={{"width": "180px", "textAlign": "center"}} onChange={(event, key) => this.hostInputHandler(event, 'maxEntrants')}/> <br />

                    <h3>Currency:</h3>
                    <p style={{'fontWeight': 'normal', 'fontSize': '0.8rem'}}>All trading products will use this currency as the quote currency.</p>
                    {buttonsDiv}

                    <h3>Trading Products:</h3>
                    {productsDiv}
                    {selectedProductsTitle}
                    {selectedProducts}

                    <h3>Start Date:</h3>
                    <input type="date" onChange={(event, key) => this.hostInputHandler(event, 'startDate')}/>
                    <h3>Start Time:</h3>
                    <input type="time" step="3600000" min="00:00" onChange={(event, key) => this.hostInputHandler(event, 'startTime')}/>

                    <h3>Duration:</h3>
                    <Input type="number" min="1" max="7" placeholder="Duration in days" changed={(event, key) => this.hostInputHandler(event, 'duration')} /> <br/>
                    <h3 style={{"fontSize":"0.8rem", "fontWeight":"normal"}}>Maximum 30 days</h3>

                    <h3>Visibility:</h3>
                    {visibilityBtns}    

                    <h3>Profit Type:</h3>
                    {profitTypeBtns}

                    {submitBtn}
                    {this.state.errorMsg}
                    {spinner}
                </form>
            </div>
        );
        
        // LOADING PAGE AT START
        if (this.state.loadingProducts) {
            createTournamentDiv = <Spinner />
        }
        
        return (
            <div>
                <div className="createTournDiv">
                    {redirect}
                    {createTournamentDiv}
                </div>
                <NavBottom />
            </div>
        )
    }
};


const mapDispatchToProps = dispatch => {
    return {
        updateProductList: (productList) => dispatch(actions.updateProductList(productList)),
        emptyProductList: () => dispatch(actions.emptyProductList()),
        updateUserIdToken: (userId, token) => dispatch(actions.updateUserIdToken(userId, token)),
        getUsernameEmail: (userId) => dispatch(actions.getUsernameEmail(userId))
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