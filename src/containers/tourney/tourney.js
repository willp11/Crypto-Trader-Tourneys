import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from 'axios';
import {firebaseAuth, firebaseDB} from "../../firebase/firebase";
import './tourney.css';
import * as actions from '../../store/actions/index';
import {Redirect} from 'react-router-dom';
import Spinner from '../../components/UI/Spinner/Spinner';
import NavBottom from "../../components/navigation/nav-bottom/nav-bottom";

class Tourney extends Component {
    
    state = {
        tourneyId: this.props.match.params.tourneyId,
        host: null,
        isHost: false,
        noEntrants: null, 
        minEntrants: null,
        maxEntrants: null,
        startDate: null,
        endDate: null, 
        startTime: null,
        endTime: null, 
        entrants: [],
        entrantProfits: [],
        registered: false,
        products: null,
        showConfirmDelete: false,
        tourneyDeleted: false,
        active: null,
        editingBalance: false,
        quoteCurrency: null,
        balance: null,
        profit: null,
        inviteCodeInput: null,
        tourneyState: null,
        visibility: null,
        showVisibilityConfirm: false,
        editVisibilityMsg: null,
        addUser: '',
        addedUserMsg: '',
        showRegistrationConfirm: false,
        showUnRegistrationConfirm: false,
        registerErr: null,
        unregisterErr: null,
        balanceErrorMsg: null,
        searchEntrants: '',
        visibleEntrants: [],
        authFail: false,
        loading: true,
        editBalanceLoading: false,
        editVisibilityLoading: false,
        inviteUserLoading: false,
        deleteTourneyLoading: false,
        deleteTourneyMsg: null,
        error: false,
        usernameErr: null,
        loadingUsername: false,
        APIErr: false,
        noInviteErr: null,
        inviteCode: null,
        tourneyCancelled: false,
        showTradeSummary: false,
        positions: [],
        showConfirmImportPos: false,
        importPositions: false,
        loadingImportChange: false,
        importChangeMsg: null
    }

    componentDidMount() {
        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                if (user.emailVerified == false) {
                    this.setState({authFail: true});
                } else {
                    
                    // check if we have the username in props - if not call API to get it
                    if (!this.props.username) {
                        // call API to get username 
                        axios.post('/api/getUsernameEmail', {userId: user.uid}).then(res => {
                            let username = res.data.response.username;
                            this.props.setUsernameEmail(username, user.email);
                            this.props.updateUserIdToken(user.uid, user.xa);
                            if (!username) {
                                this.setState({usernameErr: true});
                            }
                        }).catch(error => {
                            this.setState({error: error});
                        })
                    }
                        
                    // find which state the tournament is, registering/active/completed
                    // call the API and check which state the tourney is
                    axios.post('/api/getTourneyState', {"tourneyId": this.props.match.params.tourneyId} ).then(res => {
                        let tourneyState = res.data.response.state;
                        let hostId = res.data.response.hostId;
                        let visibility = res.data.response.visibility;
                        
                        if (user.uid == hostId) {
                            this.setState({isHost: true, tourneyState: tourneyState})
                        } else {
                            this.setState({isHost: false, tourneyState: tourneyState});
                        }

                        // registering tournaments
                        if (tourneyState == "registering") {

                            axios.post('/api/getTourneyInfo', {"tourneyId": this.props.match.params.tourneyId} ).then(res => { 
                                let tourneyData = res.data;

                                let products = tourneyData.products;
                                let entrants = tourneyData.entrants.entrants;
                                let isRegistered = entrants.includes(this.props.username);
                                let entrantProfits = tourneyData.entrants.profits;
                                
                                let unitProfit;
                                if (tourneyData.profitType == "absolute") {
                                    unitProfit = tourneyData.quoteCurrency;
                                } else if (tourneyData.profitType == "relative") {
                                    unitProfit = "%";
                                }

                                let entrantsObjs = [];
                                for (let i=0; i<entrants.length; i++) {
                                    let entrant = {username: entrants[i], rank: i+1, profit: entrantProfits[i]};
                                    entrantsObjs.push(entrant);
                                }

                                let balance = null;
                                if (isRegistered) {
                                    // if registered, get the entrant's balance and import position boolean
                                    axios.post('/api/getEntrantBalance', {"tourneyType": "registering", "tourneyId": this.state.tourneyId, "userId": user.uid}).then(res => {
                                        balance = res.data.balance;
                                        this.setState({host: tourneyData.host,
                                            noEntrants: tourneyData.noEntrants, 
                                            minEntrants: tourneyData.minEntrants,
                                            maxEntrants: tourneyData.maxEntrants,
                                            startDate: tourneyData.startDate,
                                            endDate: tourneyData.endDate,
                                            startTime: tourneyData.startTime,
                                            endTime: tourneyData.endTime,
                                            quoteCurrency: tourneyData.quoteCurrency,
                                            entrants: entrants,
                                            entrantsObjs: entrantsObjs,
                                            entrantProfits: entrantProfits,
                                            registered: isRegistered,
                                            products: products,
                                            balance: balance,
                                            active: false,
                                            visibility: tourneyData.visibility,
                                            visibleEntrants: entrantsObjs,
                                            inviteCode: tourneyData.inviteCode,
                                            loading: false,
                                            importPositions: res.data.importPositions,
                                            profitType: tourneyData.profitType,
                                            unitProfit: unitProfit
                                        });
                                    }).catch(err => {
                                        this.setState({error: true});
                                    });
                                } else {
                                    this.setState({host: tourneyData.host,
                                        noEntrants: tourneyData.noEntrants, 
                                        minEntrants: tourneyData.minEntrants,
                                        maxEntrants: tourneyData.maxEntrants,
                                        startDate: tourneyData.startDate,
                                        endDate: tourneyData.endDate,
                                        startTime: tourneyData.startTime,
                                        endTime: tourneyData.endTime,
                                        quoteCurrency: tourneyData.quoteCurrency,
                                        entrants: entrants,
                                        entrantsObjs: entrantsObjs,
                                        entrantProfits: entrantProfits,
                                        registered: isRegistered,
                                        products: products,
                                        balance: balance,
                                        active: false,
                                        visibility: tourneyData.visibility,
                                        visibleEntrants: entrantsObjs,
                                        inviteCode: tourneyData.inviteCode,
                                        loading: false,
                                        profitType: tourneyData.profitType,
                                        unitProfit: unitProfit
                                    });
                                }
                            }).catch(err => {
                                this.setState({error: true});
                            });
                        } else if (tourneyState == "active") {
                            // active tournaments
                            axios.post('/api/getActiveTourneyInfo', {"tourneyId": this.state.tourneyId} ).then(res => { 
                                
                                let tourneyData = res.data;
                                let products = tourneyData.products;
                                
                                let unitProfit;
                                if (tourneyData.profitType == "absolute") {
                                    unitProfit = tourneyData.quoteCurrency;
                                } else if (tourneyData.profitType == "relative") {
                                    unitProfit = "%";
                                }
                                
                                // entrants
                                let entrants = tourneyData.activeEntrants.entrants;
                                let entrantProfits = tourneyData.activeEntrants.profits;
                                
                                let entrantsObjs = [];
                                for (let i=0; i<entrants.length; i++) {
                                    let entrant = {username: entrants[i], rank: i+1, profit: entrantProfits[i]};
                                    entrantsObjs.push(entrant);
                                }
                                
                                let liqEntrants = tourneyData.liqEntrants;
                                let isLiq = liqEntrants.entrants.includes(this.props.username);
                                for (let i=0; i<liqEntrants.entrants.length; i++) {
                                    let liqEntrant = {username: liqEntrants.entrants[i], rank: i+1, profit: "liquidated"};
                                    entrantsObjs.push(liqEntrant);
                                    entrants.push(liqEntrants.entrants[i]);
                                    entrantProfits.push("liquidated");
                                }
                                
                                let isRegistered = entrants.includes(this.props.username);

                                // if user is registered gets the entrants balance and profit
                                axios.post('/api/getEntrantBalance', {"tourneyType": "active", "tourneyId": this.state.tourneyId, "userId": user.uid}).then(res => {
                                    let balance = res.data.balance;
                                    let profit = res.data.profit;
                                    this.setState({host: tourneyData.host,
                                                noEntrants: tourneyData.noEntrants,
                                                minEntrants: tourneyData.minEntrants,
                                                maxEntrants: tourneyData.maxEntrants,
                                                startDate: tourneyData.startDate,
                                                endDate: tourneyData.endDate,
                                                startTime: tourneyData.startTime,
                                                endTime: tourneyData.endTime,
                                                quoteCurrency: tourneyData.quoteCurrency,
                                                entrants: entrants,
                                                entrantsObjs: entrantsObjs,
                                                entrantProfits: entrantProfits,
                                                products: products,
                                                registered: isRegistered,
                                                active: true,
                                                balance: balance,
                                                visibility: tourneyData.visibility,
                                                visibleEntrants: entrantsObjs,
                                                loading: false,
                                                profit: profit,
                                                profitType: tourneyData.profitType,
                                                unitProfit: unitProfit
                                    });
                                }).catch(err => {
                                    this.setState({error: true});
                                });
                                 
                            }).catch(err => {
                                this.setState({error: true});
                            });
                        } else if (tourneyState == "completed") {
                            // active tournaments
                            axios.post('/api/getCompletedTourneyInfo', {"tourneyId": this.state.tourneyId} ).then(res => { 
                                let tourneyData = res.data;
                                let products = tourneyData.products;
                                
                                let unitProfit;
                                if (tourneyData.profitType == "absolute") {
                                    unitProfit = tourneyData.quoteCurrency;
                                } else if (tourneyData.profitType == "relative") {
                                    unitProfit = "%";
                                }
                                
                                let entrants = tourneyData.entrants.entrants;
                                let entrantProfits = tourneyData.entrants.profits;

                                let entrantsObjs = [];
                                for (let i=0; i<entrants.length; i++) {
                                    let entrant = {username: entrants[i], rank: i+1, profit: entrantProfits[i]};
                                    entrantsObjs.push(entrant);
                                }
                                
                                let liqEntrants = tourneyData.liqEntrants;
                                let isLiq = liqEntrants.entrants.includes(this.props.username);
                                for (let i=0; i<liqEntrants.entrants.length; i++) {
                                    let liqEntrant = {username: liqEntrants.entrants[i], rank: i+1, profit: "liquidated"};
                                    entrantsObjs.push(liqEntrant);
                                    entrants.push(liqEntrants.entrants[i]);
                                    entrantProfits.push("liquidated");
                                }
                                
                                let isRegistered = entrants.includes(this.props.username);
                                
                                console.log(entrants);

                                let balance = null;
                                if (isRegistered) {
                                    // if registered, get the entrant's balance
                                    axios.post('/api/getEntrantBalance', {"tourneyType": "completed", "tourneyId": this.state.tourneyId, "userId": user.uid}).then(res => {
                                        balance = res.data.balance;
                                        let profit = res.data.profit;
                                        this.setState({host: tourneyData.host,
                                            noEntrants: tourneyData.noEntrants, 
                                            minEntrants: tourneyData.minEntrants,
                                            maxEntrants: tourneyData.maxEntrants,
                                            startDate: tourneyData.startDate,
                                            endDate: tourneyData.endDate,
                                            startTime: tourneyData.startTime,
                                            endTime: tourneyData.endTime,
                                            quoteCurrency: tourneyData.quoteCurrency,
                                            entrants: entrants,
                                            entrantsObjs: entrantsObjs,
                                            entrantProfits: entrantProfits,
                                            registered: isRegistered,
                                            products: products,
                                            balance: balance,
                                            active: false,
                                            visibility: tourneyData.visibility,
                                            visibleEntrants: entrantsObjs,
                                            loading: false,
                                            profit: profit,
                                            profitType: tourneyData.profitType,
                                            unitProfit: unitProfit
                                        });
                                    }).catch(err => {
                                        this.setState({error: true});
                                    });
                                } else {
                                    this.setState({host: tourneyData.host,
                                        noEntrants: tourneyData.noEntrants, 
                                        minEntrants: tourneyData.minEntrants,
                                        maxEntrants: tourneyData.maxEntrants,
                                        startDate: tourneyData.startDate,
                                        endDate: tourneyData.endDate,
                                        startTime: tourneyData.startTime,
                                        endTime: tourneyData.endTime,
                                        quoteCurrency: tourneyData.quoteCurrency,
                                        entrants: entrants,
                                        entrantsObjs: entrantsObjs,
                                        entrantProfits: entrantProfits,
                                        registered: isRegistered,
                                        products: products,
                                        balance: balance,
                                        active: false,
                                        visibility: tourneyData.visibility,
                                        visibleEntrants: entrantsObjs,
                                        loading: false,
                                        profitType: tourneyData.profitType,
                                        unitProfit: unitProfit
                                    });
                                }
                            }).catch(err => {
                                this.setState({error: true});
                            });
                        } else if (tourneyState == "cancelled") {
                            this.setState({tourneyCancelled: true});
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
    
    showRegistrationConfirmHandler = () => {
        if ((this.state.balance && this.state.profitType == "relative") || this.state.profitType == "absolute") {
            this.setState({showRegistrationConfirm: true});
        } else {
            let errorMsg = <p style={{"color": "#C62828", "fontWeight": "bold"}}>Please enter a starting balance.</p>
            this.setState({balanceErrorMsg: errorMsg});
        }
        
    }
    
    cancelRegistrationConfirmHandler = () => {
        this.setState({showRegistrationConfirm: false});
    }
    
    showUnRegistrationConfirmHandler = () => {
        this.setState({showUnRegistrationConfirm: true});
    }
    
    cancelUnRegistrationConfirmHandler = () => {
        this.setState({showUnRegistrationConfirm: false});
    }
    
    inviteCodeInputHandler = (event) => {
        this.setState({inviteCodeInput: event.target.value});
    }
    
    submitHandler = () => {
        if (this.props.username) {
            let entrants = this.state.entrants;
            this.setState({editBalanceLoading: true});
            if (entrants.includes(this.props.username)) {
                this.setState({showUnRegistrationConfirm: false});
                // remove user from db
                let dbEntrantData = {};
                dbEntrantData["tourneyId"] = this.state.tourneyId;
                dbEntrantData["userId"] = this.props.userId;
                axios.post("/api/tourneyUnregister", dbEntrantData).then(res => {
                    // If fail give error message
                    if (res.data.response == "fail") {
                        this.setState({unregisterErr: res.data.errorMsg, editBalanceLoading: false});
                    }
                    // If success get new entrants list and update state
                    if (res.data.response == "success") {
                        axios.post('/api/getTourneyEntrants', {"tourneyId": this.state.tourneyId}).then(res => {
                            let newEntrantsArr = res.data.response.entrants; 
                            let newProfitsArr = res.data.response.profits; 

                            let entrantsObjs = [];
                            for (let i=0; i<newEntrantsArr.length; i++) {
                                let entrant = {username: newEntrantsArr[i], rank: i+1, profit: newProfitsArr[i]};
                                entrantsObjs.push(entrant);
                            }

                            let currentState = {...this.state};
                            currentState['registered'] = false;
                            currentState['noEntrants'] -= 1;
                            currentState['entrants'] = newEntrantsArr;
                            currentState['entrantsObjs'] = entrantsObjs;
                            currentState['visibleEntrants'] = entrantsObjs;;
                            currentState['entrantProfits'] = newProfitsArr;
                            currentState['balance'] = null;
                            currentState['editBalanceLoading'] = false;
                            this.setState(currentState);
                        });
                    }
                }).catch(err => {
                    this.setState({unregisterErr: "There was a problem with your request."})
                });

            } else {
                this.setState({showRegistrationConfirm: false});
                // add user to db
                let dbEntrantData = {};
                dbEntrantData["tourneyId"] = this.state.tourneyId;
                dbEntrantData["userId"] = this.props.userId;
                dbEntrantData["balance"] = this.state.balance;
                dbEntrantData["inviteCode"] = this.state.inviteCodeInput;
                dbEntrantData["profitType"] = this.state.profitType;
                axios.post("/api/tourneyRegistration", dbEntrantData).then(res => {
                    // If fail give error message
                    if (res.data.response == "registration failed") {
                        this.setState({registerErr: res.data.errorMsg, editBalanceLoading: false, showRegistrationConfirm: false});
                    }
                    // if successful, get the new entrants and update the state
                    else if (res.data.response == "success") {
                        axios.post('/api/getTourneyEntrants', {"tourneyId": this.state.tourneyId}).then(res => {

                            let newEntrantsArr = res.data.response.entrants; 
                            let newProfitsArr = res.data.response.profits; 

                            let entrantsObjs = [];
                            for (let i=0; i<newEntrantsArr.length; i++) {
                                let entrant = {username: newEntrantsArr[i], rank: i+1, profit: newProfitsArr[i]};
                                entrantsObjs.push(entrant);
                            }

                            let currentState = {...this.state};
                            currentState['showRegistrationConfirm'] = false;
                            currentState['balanceErrorMsg'] = null;
                            currentState['registered'] = true;
                            currentState['noEntrants'] += 1;
                            currentState['entrants'] = newEntrantsArr;
                            currentState['entrantsObjs'] = entrantsObjs;
                            currentState['visibleEntrants'] = entrantsObjs;
                            currentState['entrantProfits'] = newProfitsArr;
                            currentState['editBalanceLoading'] = false;
                            this.setState(currentState);
                        });
                    } else if (res.data.response == "API not valid") {
                        let currentState = {...this.state};
                        currentState['showRegistrationConfirm'] = false;
                        currentState['balanceErrorMsg'] = null;
                        currentState['registered'] = false;
                        currentState['editBalanceLoading'] = false;
                        currentState['APIErr'] = true;
                        this.setState(currentState);
                        
                    } else if (res.data.response == "No invitation") {
                        let currentState = {...this.state};
                        currentState['showRegistrationConfirm'] = false;
                        currentState['balanceErrorMsg'] = null;
                        currentState['registered'] = false;
                        currentState['editBalanceLoading'] = false;
                        currentState['noInviteErr'] = "You are not invited to this tournament.";
                        this.setState(currentState);
                        
                    } else if (res.data.response == "Invalid invite code") {
                        let currentState = {...this.state};
                        currentState['showRegistrationConfirm'] = false;
                        currentState['balanceErrorMsg'] = null;
                        currentState['registered'] = false;
                        currentState['editBalanceLoading'] = false;
                        currentState['noInviteErr'] = "Invalid invite code.";
                        this.setState(currentState);
                    }
                }).catch(error => {
                    this.setState({error: error});
                })
            }
        } else {
            this.setState({usernameErr: true});
        }
    }
    
    // BALANCE HANDLERS
    showBalanceInput = () => {
        this.setState({editingBalance: !this.state.editingBalance})
    }
    
    editBalanceHandler = (event) => {
        this.setState({balance: event.target.value});
    }
    
    submitBalanceHandler = (event) => {
        this.setState({editBalanceLoading: true});
        if (this.state.balance <= 0) {
            this.setState({editBalanceLoading: false});
            alert("Please enter a number greater than 0.");
        } else {
            axios.post("/api/updateStartBalance", {"balance": this.state.balance, "tourneyId": this.state.tourneyId, "userId": this.props.userId}).then(res => {
                this.setState({editingBalance: false, editBalanceLoading: false});
            });
        }
    }
    
    // HOST CONTROL HANDLERS
    inviteUserHandler = () => {
        this.setState({inviteUserLoading: true});
        axios.post('/api/sendTourneyInvite', {"hostId": this.props.userId, "host": this.props.username, "tourneyId": this.state.tourneyId, "username": this.state.addUser}).then(res => {
            this.setState({addUser: '', addedUserMsg: res.data.response, inviteUserLoading: false});
        }).catch(err => {
            this.setState({error: true});
        })
    }
    
    addUserInputHandler = (event) => {
        this.setState({addUser: event.target.value});
    }
    
    changeVisibilityHandler = (event, visibility) => {
        if (this.state.visibility != visibility) this.setState({showVisibilityConfirm: true, visibility: visibility});
    }
    
    confirmVisibilityChange = () => {
        this.setState({editVisibilityLoading: true});
        // call api and change visibility in database
        axios.post('/api/updateTourneyVisibility', {"tourneyId": this.state.tourneyId, "userId": this.props.userId, "visibility": this.state.visibility}).then(res => {
            this.setState({showVisibilityConfirm: false, editVisibilityLoading: false, editVisibilityMsg: res.data.response});
        }).catch(err => {
            this.setState({error: true});
        });
    }
    
    cancelVisibilityChange = () => {
        if (this.state.visibility == "public") {
            this.setState({showVisibilityConfirm: false, visibility: "private"});
        } else if (this.state.visibility == "private") {
            this.setState({showVisibilityConfirm: false, visibility: "public"});
        }
    }
    
    deleteHandler = () => {
        this.setState({showConfirmDelete: true});
    }
    
    confirmDeleteHandler = () => {
        this.setState({deleteTourneyLoading: true})
        axios.post("/api/deleteTournament", {"tourneyId": this.state.tourneyId, "userId": this.props.userId}).then(res => {
            if (res.data.response == "success") {
                this.setState({showConfirmDelete: false, tourneyDeleted: true, deleteTourneyLoading: false});
            } else if (res.data.response == "fail") {
                this.setState({showConfirmDelete: false, tourneyDeleted: false, deleteTourneyLoading: false, deleteTourneyMsg: res.data.errorMsg});
            }
        }).catch(err => {
            this.setState({error: true, deleteTourneyLoading: false});
        });
    }
    
    cancelDeleteHandler = () => {
        this.setState({showConfirmDelete: false});
    }
    
    cancelSubmitBalanceHandler = () => {
        this.setState({editingBalance: false});
    }
    
    // IMPORT POSITION HANDLERS 
    showImportPosHandler = (importPositions) => {
        if (importPositions == "no" && this.state.importPositions) {
            this.setState({showConfirmImportPos: true, importPositions: false});
        } else if (importPositions == "yes" && !this.state.importPositions) {
            this.setState({showConfirmImportPos: true, importPositions: true});
        }
    }
    
    cancelImportPosChange = () => {
        this.setState({importPositions: !this.state.importPositions, showConfirmImportPos: false})
    }
    
    submitImportPosChange = () => {
        this.setState({loadingImportChange: true});
        axios.post("/api/updateImportPositions", {"tourneyId": this.state.tourneyId, "userId": this.props.userId, "importPositions": this.state.importPositions}).then(res => {
            if (res.data.response == "success") {
                this.setState({showConfirmImportPos: false, loadingImportChange: false, importChangeMsg: <p style={{"color": "#57eb7e", "fontWeight": "bold"}}>Import positions updated successfully.</p>});
            } else if (res.data.response == "fail") {
                this.setState({showConfirmImportPos: false, loadingImportChange: false, importChangeMsg: <p style={{"color": "#f7716d", "fontWeight": "bold"}}>There was an error processing your request. Please try again.</p>});
            }
        }).catch(err => {
            this.setState({showConfirmImportPos: false, error: true, loadingImportChange: false});
        });
    }
    
    // SEARCH ENTRANTS HANDLER
    
    searchEntrantsInputHandler = (event) => {
        
        let visibleEntrants = [];
        if (event.target.value == '') {
            visibleEntrants = this.state.entrantsObjs;
        } else {
            for (let  i=0; i<this.state.entrantsObjs.length; i++) {
                if (event.target.value == this.state.entrantsObjs[i].username) {
                    let entrant = {username: this.state.entrantsObjs[i].username, rank: this.state.entrantsObjs[i].rank, profit: this.state.entrantsObjs[i].profit};
                    visibleEntrants.push(entrant);
                } 
            }
        }
        this.setState({searchEntrants: event.target.value, visibleEntrants: visibleEntrants});
    }
    
    // TRADE SUMMARY HANDLERS
    showTradeSummary = (event) => {
        event.preventDefault();
        this.setState({loadingTradeSummary: true});
        axios.post('/api/getPositions', {tourneyId: this.props.match.params.tourneyId, userId: this.props.userId} ).then(res => {
            this.setState({positions: res.data.response, showTradeSummary: true, loadingTradeSummary: false});
        });
    }
    
    hideTradeSummary = () => {
        this.setState({showTradeSummary: false});
    }
    
    render() {
        
        // HOST CONTROLS
        let confirmationBox = null;
        if (this.state.showConfirmDelete)
        {
            confirmationBox = (
                <div>
                    <p>Are you sure?</p>
                    <button className="resetBtn" onClick={this.cancelDeleteHandler}>Cancel</button>
                    <button className="submitBtn" onClick={this.confirmDeleteHandler}>Confirm</button>
                </div>
            );
        }
        
        if (this.state.deleteTourneyLoading)
        {
            confirmationBox = (
                <Spinner />
            );
        }
                
        let deleteTourneyMsg = null;
        if (this.state.deleteTourneyMsg) {
            deleteTourneyMsg = <p style={{"color": "#f7716d", "fontWeight": "bold"}}>{this.state.deleteTourneyMsg}</p>
        }
        
        let visibilityConfirmationBox = null;
        if (this.state.showVisibilityConfirm)
        {
            visibilityConfirmationBox = (
                <div className="confirmRegistrationWrapper">
                    <div className="confirmRegistrationDiv">   
                        <p>Are you sure?</p>
                        <button className="resetBtn" onClick={this.cancelVisibilityChange}>Cancel</button>
                        <button className="submitBtn" onClick={this.confirmVisibilityChange}>Confirm</button>
                    </div>
                </div>
            );
        }
        
        if (this.state.editVisibilityLoading)
        {
            visibilityConfirmationBox = (
                <Spinner />
            );
        }
        
        let visibilityButtons = (
                <div>
                    <button onClick={(event, visibility) => this.changeVisibilityHandler(event, "public")}>Public</button>
                    <button onClick={(event, visibility) => this.changeVisibilityHandler(event, "private")}>Private</button> <br/>
                </div>
            );
        if (this.state.visibility == "public") {
            visibilityButtons = (
                <div>
                    <button className="highlight" onClick={(event, visibility) => this.changeVisibilityHandler(event, "public")}>Public</button>
                    <button onClick={(event, visibility) => this.changeVisibilityHandler(event, "private")}>Private</button> <br/>
                </div>
            );
        } else if (this.state.visibility == "private") {
            visibilityButtons = (
                <div>
                    <button onClick={(event, visibility) => this.changeVisibilityHandler(event, "public")}>Public</button>
                    <button className="highlight" onClick={(event, visibility) => this.changeVisibilityHandler(event, "private")}>Private</button> <br/>
                </div>
            );
        }

        let editVisibilityMsg = null;
        if (this.state.editVisibilityMsg) {
            if (this.state.editVisibilityMsg == "Visibility changed successfully.") {
                editVisibilityMsg = <p style={{"color": "#57eb7e", "fontWeight": "bold"}}>{this.state.editVisibilityMsg}</p>
            }
            else {
                editVisibilityMsg = <p style={{"color": "#f7716d", "fontWeight": "bold"}}>{this.state.editVisibilityMsg}</p>
            }
        }
        
        let addedUserMsg = null;
        if (this.state.addedUserMsg) {
            if (this.state.addedUserMsg.substring(0,19) == "Invitation sent to ") {
                addedUserMsg = <p style={{"color": "#57eb7e", "fontWeight": "bold"}}>{this.state.addedUserMsg}</p>
            } else {
                addedUserMsg = <p style={{"color": "#f7716d", "fontWeight": "bold"}}>{this.state.addedUserMsg}</p>
            }
        }
        
        let inviteUserSpinner = null;
        if (this.state.inviteUserLoading) inviteUserSpinner = <Spinner />;
        
        let hostControls = null;
        if (this.state.isHost === true && this.state.tourneyState == "registering") {
            hostControls = (
                <div className="hostControls">
                    <h3>Host Controls</h3>
                    <h4>Invite Code</h4>
                    <p>{this.state.inviteCode}</p>
                    <h4>Invite User</h4>
                    <input value={this.state.addUser} placeholder="Enter username" onChange={(event)=>this.addUserInputHandler(event)}/>
                    <button className="submitInviteBtn" onClick={this.inviteUserHandler}>Submit</button> <br />
                    {inviteUserSpinner}
                    {addedUserMsg}
                    <h4>Tournament Visibility</h4>
                    {visibilityButtons}
                    {editVisibilityMsg}
                    {visibilityConfirmationBox}
                    <h4>Delete tournament</h4>
                    <button className="deleteTournamentBtn" onClick={this.deleteHandler}>Delete Tournament</button> <br />
                    {deleteTourneyMsg}
                    {confirmationBox}
                </div>
            );
        }
        
        
        // ENTRANTS 
        let tourneyBody = (
            <Spinner />
        )
        
        let entrantsRows = null;
        if (this.state.entrants && this.state.visibleEntrants) {
            entrantsRows = this.state.visibleEntrants.map((entrant, index) => {
                return (
                    <tr key={index}>
                        <td>{index+1}</td>
                        <td>{entrant.username}</td>
                        <td>{entrant.profit}</td>
                    </tr>
                );
            })
        }

        let entrants = (
            <table className="entrantsListTable">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>Profit ({this.state.unitProfit})</th>
                    </tr>
                </thead>
                <tbody>
                    {entrantsRows}
                </tbody>
            </table>
        );
        
        
        /////////////////////////////////
        // TRADE SUMMARY DIV
        /////////////////////////////////
        
        let tradeSummary = null;
        
        if (this.state.showTradeSummary) {
            
            let totalProfit = 0;
            
            // GET ALL POSITIONS
            let positions = this.state.positions.map((position, index) => {
                
                totalProfit += position.profit;
                
                let netPosition;
                
                if (position.inventory > 0) {
                    netPosition = "long";
                } else if (position.inventory < 0) {
                    netPosition = "short";
                } else {
                    netPosition = "none"
                }
                
                return (
                    <div className="positionDiv" key={position.productName}>
                        <h4><u>{position.productName}</u></h4>
                        <p><b>Last Updated:</b> {position.lastUpdatedStr}</p>
                        <h4><u>Buys:</u></h4>
                        <p><b>Amount Bought:</b> {position.amountBought} {position.baseCurrency}</p>
                        <p><b>Average Buy Price:</b> {position.avgBuyPrice} {position.quoteCurrency}</p>
                        <p><b>Total:</b> {position.totalBought} {position.quoteCurrency}</p>
                        <h4><u>Sales:</u></h4>
                        <p><b>Amount Sold:</b> {position.amountSold} {position.baseCurrency}</p>
                        <p><b>Average Sell Price:</b> {position.avgSellPrice} {position.quoteCurrency}</p>
                        <p><b>Total:</b> {position.totalSold} {position.quoteCurrency}</p>
                        <h4><u>Position:</u></h4>
                        <p><b>Net position:</b> {netPosition}</p>
                        <p><b>Inventory:</b> {position.inventory} {position.baseCurrency}</p>
                        <p><b>Current Price ({position.quoteCurrency}):</b> {position.currentPrice} </p>
                        <p><b>Value of Inventory:</b> {position.inventoryValue} {position.quoteCurrency}</p>
                        <h4><u>Totals:</u></h4>
                        <p><b>Total Sales:</b> {position.totalSold} {position.quoteCurrency}</p>
                        <p><b>Value of Inventory:</b> {position.inventoryValue} {position.quoteCurrency}</p>
                        <p><b>Total Buys:</b> {position.totalBought} {position.quoteCurrency}</p>
                        <p style={position.profit >= 0 ? {"color": "#57eb7e"} : {"color": "#f7716d"}}><b>Profit:</b> {position.profit} {position.quoteCurrency}</p>
                    </div>
                )
            })
            
            if (this.state.quoteCurrency == "BTC") totalProfit = totalProfit.toFixed(9);
            if (this.state.quoteCurrency == "USD") totalProfit = totalProfit.toFixed(4);
            
            let totalProfitDiv = null;
            if (this.state.profitType == "relative") {
                totalProfitDiv = (
                    <div className="positionDiv">
                        <h4><u>Total Profit</u></h4>
                        <p>Starting balance: {this.state.balance} {this.state.quoteCurrency}</p>
                        <p style={totalProfit >= 0 ? {"color": "#57eb7e"} : {"color": "#f7716d"}}>Profit: {totalProfit} {this.state.quoteCurrency}</p>
                        <p style={this.state.profit >= 0 ? {"color": "#57eb7e"} : {"color": "#f7716d"}}>Profit ({this.state.unitProfit}): {this.state.profit}</p>
                    </div>
                )
            } else if (this.state.profitType == "absolute") {
                totalProfitDiv = (
                    <div className="positionDiv">
                        <h4><u>Total Profit</u></h4>
                        <p style={this.state.profit >= 0 ? {"color": "#57eb7e"} : {"color": "#f7716d"}}>Profit ({this.state.unitProfit}): {this.state.profit}</p>
                    </div>
                )
            }

            tradeSummary = (
                <div className="tradeSummaryWrapper">
                    <div className="tradeSummaryDiv">   
                        <h3>Trade Summary:</h3>
                        {positions}
                        {totalProfitDiv}
                        <button className="resetBtn" onClick={this.hideTradeSummary}>Close</button>
                    </div>
                </div>
            );
        }

        let loadingTradeSummary = null;
    
        if (this.state.loadingTradeSummary) {
            loadingTradeSummary = <Spinner />
        }
        
        /////////////////////////////////
        // TOURNAMENT OVERVIEW
        /////////////////////////////////
            
        // REGISTER BUTTON
        let registerBtn = null;

        let startTimePa =   (
                            <div>
                                <p>{this.state.startDate}</p>
                                <p>{this.state.startTime}</p>
                            </div>
                            );
        let endTimePa = (
                        <div>
                            <p>{this.state.endDate}</p>
                            <p>{this.state.endTime}</p>
                        </div>
                        );
        if (this.state.active) {
            registerBtn = null;
            startTimePa = (
                <div>
                    <p>The tournament has started.</p>
                    <p>{this.state.startDate}</p>
                    <p>{this.state.startTime}</p>
                </div>
            )
        }
        if (this.state.tourneyState == "completed") {
            registerBtn = null;
            startTimePa = (
                <div>
                    <p>{this.state.startDate}</p>
                    <p>{this.state.startTime}</p>
                </div>
            )
            endTimePa = (
                <div>
                    <p>The tournament has ended.</p>
                    <p>{this.state.endDate}</p>
                    <p>{this.state.endTime}</p>
                </div>
            )
        }
            
        /////////////////////////////////////////////////////////
        ////////    BALANCE  ////////////////////
        /////////////////////////////////
            
        // register error msg
        let registerErr = null;
            
        if (this.state.registerErr) {
            registerErr = <p style={{"color": "#f7716d", "fontWeight": "bold"}}>{this.state.registerErr}</p>
        }
        
        // IF NOT REGISTERED AND TOURNAMENT IN REGISTRATION
        let balance;
        if (!this.state.registered && this.state.tourneyState == "registering") {
            
            // IF THE TOURNAMENT IS PRIVATE - INPUT FOR THE INVITE CODE
            let inviteCodeInput = null; 
            if (this.state.visibility == "private" && !this.state.isHost) {
                inviteCodeInput = 
                    <div>
                        <p style={{"fontSize": "0.9rem"}}>The tournament is <b>private</b> - if you do not have an invitation please enter the invite code to register for the tournament.</p>
                        <input className="inviteCodeInput" type="text" placeholder="Invite Code" onChange={(event) => this.inviteCodeInputHandler(event)} />
                    </div>
            }
                
            registerBtn = (
                <div>
                    <button className="submitBtn" onClick={this.showRegistrationConfirmHandler}>Register</button>
                    <p style={{"fontWeight": "bold", "color": "#f7716d"}}>{this.state.noInviteErr}</p>
                    {registerErr}
                </div>
            );
            if (this.state.profitType == "relative") {
                balance = (
                    <div>
                        <h2>Registration:</h2>
                        <p>The tournament is in registration.</p>
                        <h3>Starting Balance:</h3>
                        <p>Enter tournament starting balance <b>({this.state.quoteCurrency})</b> to register:</p>
                        <p style={{"fontSize": "0.9rem"}}>The starting balance is used to determine your percentage profit. If you have losses equal to or greater than your starting balance you will be liquidated out of the tournament.</p>
                        {inviteCodeInput} <br/>
                        <input className="balanceInput" type="text" placeholder="Enter Starting Balance" onChange={(event) => this.editBalanceHandler(event)} />
                    </div>
                );
            } else if (this.state.profitType == "absolute") {
                balance = (
                    <div>
                        <h2>Registration:</h2>
                        <p>The tournament is in registration.</p>
                        <p style={{"fontSize": "0.9rem"}}>This tournament ranks entrants based on their absolute profit in <b>{this.state.quoteCurrency}</b></p>
                        {inviteCodeInput} <br/>
                    </div>
                );
            }
                
        }

        // IF REGISTERED AND TOURNAMENT IS ACTIVE
        if (this.state.registered && this.state.tourneyState == "active" && this.state.profitType == "relative") {
            balance = (
                <div>
                    <h2>Active Tournament</h2>
                    <h3>Starting Balance:</h3>
                    <p>{this.state.balance} {this.state.quoteCurrency}</p>
                    <h3>Your Profit:</h3>
                    <p>{this.state.profit} {this.state.unitProfit}</p>
                    <button className="showSummaryBtn" onClick={(event)=>this.showTradeSummary(event)}>Trade Summary</button>
                    {loadingTradeSummary}
                    {tradeSummary}
                </div>
            );
        } else if (this.state.registered && this.state.tourneyState == "active" && this.state.profitType == "absolute") {
            balance = (
                <div>
                    <h2>Active Tournament</h2>
                    <h3>Your Profit:</h3>
                    <p>{this.state.profit} {this.state.unitProfit}</p>
                    <button className="showSummaryBtn" onClick={(event)=>this.showTradeSummary(event)}>Trade Summary</button>
                    {loadingTradeSummary}
                    {tradeSummary}
                </div>
            );
        }

        // IF NOT REGISTERED AND TOURNAMENT IS ACTIVE
        if (!this.state.registered && this.state.tourneyState == "active") {
            balance = (
                <div>
                    <h2>Active Tournament</h2>
                    <p>You are not registered.</p>
                </div>
            )
        }

        // IF REGISTERED AND TOURNAMENT IS COMPLETED
        if (this.state.registered && this.state.tourneyState == "completed") {
            balance = (
                <div>
                    <h2>Completed Tournament</h2>
                    <h3>Starting Balance:</h3>
                    <p>{this.state.balance} {this.state.quoteCurrency}</p>
                    <h3>Your Profit:</h3>
                    <p>{this.state.profit} %</p>
                    <button className="showSummaryBtn" onClick={(event)=>this.showTradeSummary(event)}>Trade Summary</button>
                    {loadingTradeSummary}
                    {tradeSummary}
                </div>
            );
        }
        
        // IF NOT REGISTERED AND TOURNAMENT IS COMPLETED
        if (!this.state.registered && this.state.tourneyState == "completed") {
            balance = (
                <div>
                    <h2>Completed Tournament</h2>
                    <p>You are not registered.</p>
                </div>
            )
        }

        // CONFIRM IMPORT POSITION MODAL
        let confirmImportPos = null;
        if (this.state.showConfirmImportPos) {
            confirmImportPos = (
                <div className="confirmRegistrationWrapper">
                    <div className="confirmRegistrationDiv">   
                        <p>Are you sure?</p>
                        <button className="resetBtn" onClick={this.cancelImportPosChange}>Cancel</button>
                        <button className="submitBtn" onClick={this.submitImportPosChange}>Submit</button>
                    </div>
                </div>
            )
        }
        
        // IF REGISTERED AND THE TOURNAMENT IN REGISTRATION 
        // EDIT BALANCE 
        let editStartBalanceBtn = null;
        let importPositions = null;
        if (this.state.registered && this.state.tourneyState == "registering") {
            
            if (this.state.profitType == "relative") {
                balance = (
                    <div>
                        <h2>Registration:</h2>
                        <p>You are already registered.</p>
                        <h3>Starting Balance:</h3>
                        <p>{this.state.balance} {this.state.quoteCurrency}</p>
                    </div>
                )
            } else if (this.state.profitType == "absolute") {
                balance = (
                    <div>
                        <h2>Registration:</h2>
                        <p>You are already registered.</p>
                    </div>
                )
            }
            
            let importPosBtns;
            if (this.state.importPositions == false) {
                importPosBtns = (
                    <div>
                        <button className="importBtn highlight" onClick={()=>this.showImportPosHandler("no")}>No</button>
                        <button className="importBtn" onClick={()=>this.showImportPosHandler("yes")}>Yes</button><br/>
                        {this.state.importChangeMsg}
                    </div>
                )
                
            } else if (this.state.importPositions == true) {
                importPosBtns = (
                    <div>
                        <button className="importBtn" onClick={()=>this.showImportPosHandler("no")}>No</button>
                        <button className="importBtn highlight" onClick={()=>this.showImportPosHandler("yes")}>Yes</button><br/>
                        {this.state.importChangeMsg}
                    </div>
                )
            } 
            
            if (this.state.loadingImportChange) {
                importPosBtns = <Spinner />
            }
        
            
            importPositions = (
                <div className="importPosDiv">
                    <p>Would you like to import any positions you already have open when the tournament starts? Only applies to futures products.</p>
                    {importPosBtns}
                    {confirmImportPos}
                </div>
            )
            
            // unregister error msg
            let unregisterErr = null;
            if (this.state.unregisterErr) {
                unregisterErr = <p style={{"color": "#f7716d", "fontWeight": "bold"}}>{this.state.unregisterErr}</p>
            }
            
            registerBtn = (
                <div>
                    <button className="resetBtn" onClick={this.showUnRegistrationConfirmHandler}>Unregister</button>
                    {unregisterErr}
                </div>
            );
            
            if (this.state.profitType == "relative") {
                if (this.state.editingBalance) {
                    editStartBalanceBtn = (
                        <div className="editStartBalBtnDiv">
                            <button className="resetBtn" style={{"marginRight": "20px"}} onClick={this.cancelSubmitBalanceHandler}>Cancel</button>
                            <input className="editBalanceInput" type="number" placeholder={this.state.balance} onChange={(event) => this.editBalanceHandler(event)} />
                            <button className="submitBtn" onClick={this.submitBalanceHandler}>Submit</button>
                        </div>
                    );
                } else {
                    editStartBalanceBtn = (
                        <button className="editStartBalBtn" onClick={this.showBalanceInput}>Edit Starting Balance</button>
                    );
                }
            }
        
        }
    
        
        // IF NOT REGISTERED, TOURNAMENT IS REGISTERING AND MAX NO ENTRANTS REACHED
        if (this.state.tourneyState == "registering" && this.state.noEntrants == this.state.maxEntrants && this.state.registered == false) {
            balance = (
                <div>
                    <h2>Registration:</h2>
                    <p>The tournament has the maximum number of entrants.</p>
                </div>
            )
            
            registerBtn = null;
        }
        
        // CONFIRM REGISTRATION MODAL
        let confirmRegistration = null; 
        let balanceErrorMsg = this.state.balanceErrorMsg;
        if (this.state.showRegistrationConfirm) {
            
            confirmRegistration = (
                <div className="confirmRegistrationWrapper">
                    <div className="confirmRegistrationDiv">   
                        <p>Are you sure?</p>
                        <button className="resetBtn" onClick={this.cancelRegistrationConfirmHandler}>Cancel</button>
                        <button className="submitBtn" onClick={this.submitHandler}>Submit</button>
                    </div>
                </div>
            );
  
        }
        // CONFIRM UN-REGISTRATION MODAL
        let confirmUnRegistration = null;
        if (this.state.showUnRegistrationConfirm) {
            confirmUnRegistration = (
                <div className="confirmRegistrationWrapper">
                    <div className="confirmRegistrationDiv">   
                        <p>Are you sure?</p>
                        <button className="resetBtn" onClick={this.cancelUnRegistrationConfirmHandler}>Cancel</button>
                        <button className="submitBtn" onClick={this.submitHandler}>Submit</button>
                    </div>
                </div>
            );
        }

        let balanceDiv = (
            <div>
                {balance}
                {registerBtn}<br/>
                {balanceErrorMsg}
                {editStartBalanceBtn}<br/>
                {importPositions}<br/>
            </div>
        )
        
        if (this.state.editBalanceLoading) {
            balanceDiv = <Spinner />
        }
        
        //////////////////
        // ENTRANTS
        //////////////////
        let entrantsDiv = <Spinner />
        if (!this.state.loading){
            entrantsDiv = (
                <div className="entrantsList">
                    {balanceDiv}
                    <h2>Entrants:</h2>
                    <p>{this.state.noEntrants} / {this.state.maxEntrants} (min. {this.state.minEntrants})</p>
                    <h3>Search:</h3>
                    <input value={this.state.searchEntrants} className="searchEntrantsInput" placeholder="Username" onChange={(event) => this.searchEntrantsInputHandler(event)}/>
                    <ul>{entrants}</ul>
                </div>
            );
        } 
        
        /////////////////////
        // PRODUCTS
        /////////////////////
        let FTXProducts = null;

        if (this.state.products) { 
            if (this.state.products['FTX']) {
                FTXProducts = Object.keys(this.state.products['FTX']).map(index => {
                    return (
                        <p key={index}>{this.state.products['FTX'][index]}</p>
                    )
                });
            };
        }
        
        // REDIRECT
        let redirect = null;
        if (this.state.tourneyDeleted) redirect = <Redirect to="/myTourneys"/>
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
        
        if (this.state.usernameErr || this.state.APIErr) {
            redirect = (
                <Redirect to="/profile" />
            )
        }

        if (this.state.tourneyCancelled) {
            redirect = (
                <Redirect to="/tourneyNotFound" />
            )
        }
         
        if (this.state.host != null) {
            tourneyBody = (
                <div className="tourneyBody">
                    <h3>Status</h3>
                    <p>{this.state.tourneyState}</p>
                    <h3>Host</h3>
                    <p>{this.state.host}</p>
                    <h3>Start Time</h3>
                    {startTimePa}
                    <h3>End Time</h3>
                    {endTimePa}
                    <h3>Profit Type</h3>
                    <p>{this.state.profitType}</p>
                    <h3>Products</h3>
                    {FTXProducts}
                </div>
            )
        }

        return (
            <div>
                <div className="tourneyDiv">
                    {redirect}
                    <div className="tourneySubDiv">
                        <h1>Tournament {this.state.tourneyId}</h1>
                        {hostControls}
                    </div>
                    <div className="tourneySubDiv2">
                        <div className="tourneyWrapper">
                            {tourneyBody}
                            {entrantsDiv}
                        </div>
                    </div>
                    {confirmRegistration}
                    {confirmUnRegistration}
                </div>
                <NavBottom />
            </div>
        )
    }

};

const mapDispatchToProps = dispatch => {
    return {
        updateUserIdToken: (userId, token) => dispatch(actions.updateUserIdToken(userId, token)),
        setUsernameEmail: (username, email) => dispatch(actions.setUsernameEmail(username, email))
    };
};

const mapStateToProps = (state) => {
    return {
        username: state.auth.username,
        userId: state.auth.userId
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Tourney);