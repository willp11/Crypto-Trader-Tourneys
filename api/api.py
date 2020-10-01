import time
from init import app, db
from flask import request
from sqlalchemy.orm import sessionmaker
from models import RegistrationTourneys, Usernames, Entrants, UserAPI, RegisteringProducts, ActiveTourneys, ActiveEntrants, ActiveProducts, ProductList, CompletedTourneys, CompletedEntrants, CompletedProducts, AllTourneys, TourneyInvites, AccountBalances, PayoutsCustomProvisional, Trades
import datetime

engine = db.engine
Session = sessionmaker(bind=engine)

@app.route('/getAllProducts', methods=['GET'])
def getAllProducts():
    session = Session()
    
    response = {'products': {'FTX': {'spot': {'USD': [], 'BTC': []}, 'future': []} } }
    
    for query in session.query(ProductList).all():
        
        product = query.name
        if query.productType == "future":
            response['products']['FTX']['future'].append(product)
        elif query.productType == "spot":
            if (query.quoteCurrency) == "USD":
                response['products']['FTX']['spot']['USD'].append(product)
            elif (query.quoteCurrency) == "BTC":
                response['products']['FTX']['spot']['BTC'].append(product)
        
    session.close()
        
    return response

@app.route('/getUsernameEmail', methods=['POST'])
def getUsernameEmail():
    
    content = request.json
    session = Session()
    dbQuery = session.query(Usernames).filter_by(userId=content["userId"]).one()
    username = dbQuery.username
    email = dbQuery.email
    
    return {"response": {"username": username, "email": email}}

@app.route('/getTourneyState', methods=['POST'])
def getTourneyState():
    content = request.json
    session = Session()
    dbQuery = session.query(AllTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    state = dbQuery.state
    session.close()
    
    return {'tourneyState': state}
    

@app.route('/getTourneyInfo', methods=['POST'])
def getTourneyInfo():
    content = request.json
    print(content["tourneyId"])
    session = Session()
    dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).all()
    if len(dbQuery) > 0:
        # calculate the duration in days, calculate time until start in days and hours
        
        tourneyInfo = {'tourneyId': dbQuery[0].tourneyId,
                    'host': dbQuery[0].host,
                    'maxEntrants': dbQuery[0].maxEntrants,
                    'minEntrants': dbQuery[0].minEntrants,
                    'noEntrants': dbQuery[0].noEntrants,
                    'startDate': dbQuery[0].startDate,
                    'startTime': dbQuery[0].startTime,
                    'endDate': dbQuery[0].endDate,
                    'endTime': dbQuery[0].endTime,
                    'quoteCurrency': dbQuery[0].quoteCurrency,
                    'visibility': dbQuery[0].visibility,
                    'entryFee': dbQuery[0].entryFee,
                    'payoutStruct': dbQuery[0].payoutStruct
                   }
    else:
        tourneyInfo = {'tourneyId': "No match"}

    session.commit()
    session.close()
    
    return tourneyInfo

@app.route('/getActiveTourneyInfo', methods=['POST'])
def getActiveTourneyInfo():
    content = request.json
    
    session = Session()
    dbQuery = session.query(ActiveTourneys).filter_by(tourneyId=content["tourneyId"]).all()
    
    if len(dbQuery) > 0:
        tourneyInfo = {'tourneyId': dbQuery[0].tourneyId,
                    'host': dbQuery[0].host,
                    'minEntrants': dbQuery[0].minEntrants,
                    'maxEntrants': dbQuery[0].maxEntrants,
                    'noEntrants': dbQuery[0].noEntrants,
                    'startDate': dbQuery[0].startDate,
                    'startTime': dbQuery[0].startTime,
                    'endDate': dbQuery[0].endDate,
                    'endTime': dbQuery[0].endTime,
                    'quoteCurrency': dbQuery[0].quoteCurrency,
                    'visibility': dbQuery[0].visibility,
                    'entryFee': dbQuery[0].entryFee,
                    'payoutStruct': dbQuery[0].payoutStruct
                   }
    else:
        tourneyInfo = {'tourneyId': "No match"}

    session.commit()
    session.close()
    
    return tourneyInfo

@app.route('/getCompletedTourneyInfo', methods=['POST'])
def getCompletedTourneyInfo():
    content = request.json
    
    session = Session()
    dbQuery = session.query(CompletedTourneys).filter_by(tourneyId=content["tourneyId"]).all()
    
    if len(dbQuery) > 0:
        tourneyInfo = {'tourneyId': dbQuery[0].tourneyId,
                    'host': dbQuery[0].host,
                    'minEntrants': dbQuery[0].minEntrants,
                    'maxEntrants': dbQuery[0].maxEntrants,
                    'noEntrants': dbQuery[0].noEntrants,
                    'startDate': dbQuery[0].startDate,
                    'startTime': dbQuery[0].startTime,
                    'endDate': dbQuery[0].endDate,
                    'endTime': dbQuery[0].endTime,
                    'quoteCurrency': dbQuery[0].quoteCurrency,
                    'visibility': dbQuery[0].visibility,
                    'entryFee': dbQuery[0].entryFee,
                    'payoutStruct': dbQuery[0].payoutStruct
                   }
    else:
        tourneyInfo = {'tourneyId': "No match"}

    session.commit()
    session.close()
    
    return tourneyInfo

@app.route('/getEntrantBalance', methods=['POST'])
def getEntrantBalance():
    content = request.json

    session = Session()
    
    if content['tourneyType'] == 'registering':
        dbQuery = session.query(Entrants).filter_by(tourneyId=content["tourneyId"], userId=content["userId"]).all()
        if len(dbQuery) == 0:
            return {"balance": "not registered"}
        else:
            balance = dbQuery[0].balance
    elif content['tourneyType'] == 'active':
        dbQuery = session.query(ActiveEntrants).filter_by(tourneyId=content["tourneyId"], userId=content["userId"]).all()
        if len(dbQuery) == 0:
            return {"balance": "not registered"}
        else:
            balance = dbQuery[0].balance
    elif content['tourneyType'] == 'completed':
        dbQuery = session.query(CompletedEntrants).filter_by(tourneyId=content["tourneyId"], userId=content["userId"]).all()
        if len(dbQuery) == 0:
            return {"balance": "not registered"}
        else:
            balance = dbQuery[0].balance
    
    return {"balance": balance}

@app.route('/updateStartBalance', methods=['POST'])
def updateStartBalance():
    content = request.json
    
    session = Session()
    
    dbQuery = session.query(Entrants).filter_by(tourneyId=content["tourneyId"], userId=content["userId"]).one()
    
    dbQuery.balance = content['balance']
    
    session.add(dbQuery)
    session.commit()
    session.close()
    
    return {"response": "Balance Updated"}

@app.route('/checkIfHost', methods=['POST'])
def checkIfHost():
    content = request.json
    
    session = Session()
    if content["tourneyType"] == "registering":
        dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    elif content["tourneyType"] == "active":
        dbQuery = session.query(ActiveTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    elif content["tourneyType"] == "completed":
        dbQuery = session.query(CompletedTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    
    if dbQuery.hostId == content["userId"]:
        trueFalse = True
    else:
        trueFalse =  False
    
    session.close()
    
    return {"response": trueFalse}

@app.route('/getAllTourneys', methods=['GET'])
def getAllTourneys():
    content = request.json
    
    tourneys = []
    session = Session()
    for dbQuery in session.query(RegistrationTourneys).all():
        tourney = {}
        tourney = {'tourneyId': dbQuery.tourneyId,
                'host': dbQuery.host,
                'maxEntrants': dbQuery.maxEntrants,
                'minEntrants': dbQuery.minEntrants,
                'noEntrants': dbQuery.noEntrants,
                'startDate': dbQuery.startDate,
                'startTime': dbQuery.startTime,
                'endDate': dbQuery.endDate,
                'endTime': dbQuery.endTime,
                'startTS': dbQuery.startTS,
                'endTS': dbQuery.endTS,
                'entryFee': dbQuery.entryFee
        }
        tourneys.append(tourney)
        
    for tourney in tourneys:
        products = []
        for dbQuery in session.query(RegisteringProducts).filter_by(tourneyId = tourney['tourneyId']).all():
            products.append(dbQuery.productName)
        tourney['products'] = products
        print(products)
        
    session.close()
    
    return {"response": tourneys}

@app.route('/getActiveTourneys', methods=['GET'])
def getActiveTourneys():
    content = request.json
    
    tourneys = []
    session = Session()
    for dbQuery in session.query(ActiveTourneys).all():
        tourney = {}
        tourney = {'tourneyId': dbQuery.tourneyId,
                'host': dbQuery.host,
                'maxEntrants': dbQuery.maxEntrants,
                'noEntrants': dbQuery.noEntrants,
                'startDate': dbQuery.startDate,
                'startTime': dbQuery.startTime,
                'endDate': dbQuery.endDate,
                'endTime': dbQuery.endTime,
                'startTS': dbQuery.startTS,
                'endTS': dbQuery.endTS,
                'entryFee': dbQuery.entryFee
        }
        tourneys.append(tourney)
        
    for tourney in tourneys:
        products = []
        for dbQuery in session.query(ActiveProducts).filter_by(tourneyId = tourney['tourneyId']).all():
            products.append(dbQuery.productName)
        tourney['products'] = products
        print(products)
        
    session.close()
    
    return {"response": tourneys}

@app.route('/getCompletedTourneys', methods=['POST'])
def getCompletedTourneys():
    content = request.json
    
    tourneys = []
    session = Session()

    if content["fieldToSearch"] == "tourneyId":
        dbQuery = session.query(CompletedTourneys).filter_by(tourneyId = content["tourneyId"]).all()
    elif content["fieldToSearch"] == "host":
        dbQuery = session.query(CompletedTourneys).filter_by(host = content["host"]).all()
            
    for query in dbQuery:
        tourney = {}
        tourney = {'tourneyId': query.tourneyId,
                'host': query.host,
                'maxEntrants': query.maxEntrants,
                'noEntrants': query.noEntrants,
                'startDate': query.startDate,
                'startTime': query.startTime,
                'endDate': query.endDate,
                'endTime': query.endTime,
                'startTS': query.startTS,
                'endTS': query.endTS,
                'entryFee': query.entryFee
        }
        tourneys.append(tourney)
        
    for tourney in tourneys:
        products = []
        for dbQuery in session.query(CompletedProducts).filter_by(tourneyId = tourney['tourneyId']).all():
            products.append(dbQuery.productName)
        tourney['products'] = products
        print(products)
        
    session.close()
    
    return {"response": tourneys}

@app.route('/getMyTourneys', methods=["POST"])
def getMyTourneys():
    content = request.json
    
    tourneys = []
    tourneyIds = []
    session = Session()
    
    for dbQuery in session.query(Entrants).filter_by(userId=content["userId"]).all():
        tourneyIds.append(dbQuery.tourneyId)
        
    for tourneyId in tourneyIds:
        dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=tourneyId).one()
        tourney = {}
        tourney = {'tourneyId': dbQuery.tourneyId,
                'host': dbQuery.host,
                'maxEntrants': dbQuery.maxEntrants,
                'minEntrants': dbQuery.minEntrants,
                'noEntrants': dbQuery.noEntrants,
                'startDate': dbQuery.startDate,
                'startTime': dbQuery.startTime,
                'endDate': dbQuery.endDate,
                'endTime': dbQuery.endTime,
                'startTS': dbQuery.startTS,
                'endTS': dbQuery.endTS,
                'entryFee': dbQuery.entryFee
        }
        tourneys.append(tourney)
        
    for tourney in tourneys:
        products = []
        for dbQuery in session.query(RegisteringProducts).filter_by(tourneyId = tourney['tourneyId']).all():
            products.append(dbQuery.productName)
        tourney['products'] = products
        print(products)
        
    session.close()
    
    return {"response": tourneys}

@app.route('/getMyActiveTourneys', methods=["POST"])
def getMyActiveTourneys():
    content = request.json
    
    tourneys = []
    tourneyIds = []
    session = Session()
    
    for dbQuery in session.query(ActiveEntrants).filter_by(userId=content["userId"]).all():
        tourneyIds.append(dbQuery.tourneyId)
        
    for tourneyId in tourneyIds:
        dbQuery = session.query(ActiveTourneys).filter_by(tourneyId=tourneyId).one()
        tourney = {}
        tourney = {'tourneyId': dbQuery.tourneyId,
                'host': dbQuery.host,
                'maxEntrants': dbQuery.maxEntrants,
                'noEntrants': dbQuery.noEntrants,
                'startDate': dbQuery.startDate,
                'startTime': dbQuery.startTime,
                'endDate': dbQuery.endDate,
                'endTime': dbQuery.endTime,
                'startTS': dbQuery.startTS,
                'endTS': dbQuery.endTS,
                'entryFee': dbQuery.entryFee
        }
        tourneys.append(tourney)
        
    for tourney in tourneys:
        products = []
        for dbQuery in session.query(ActiveProducts).filter_by(tourneyId = tourney['tourneyId']).all():
            products.append(dbQuery.productName)
        tourney['products'] = products
        print(products)
        
    session.close()
    
    return {"response": tourneys}

@app.route('/getMyCompletedTourneys', methods=["POST"])
def getMyCompletedTourneys():
    content = request.json
    
    tourneys = []
    tourneyIds = []
    session = Session()
    
    for dbQuery in session.query(CompletedEntrants).filter_by(userId=content["userId"]).all():
        tourneyIds.append(dbQuery.tourneyId)
        
    for tourneyId in tourneyIds:
        dbQuery = session.query(CompletedTourneys).filter_by(tourneyId=tourneyId).one()
        tourney = {}
        tourney = {'tourneyId': dbQuery.tourneyId,
                'host': dbQuery.host,
                'maxEntrants': dbQuery.maxEntrants,
                'noEntrants': dbQuery.noEntrants,
                'startDate': dbQuery.startDate,
                'startTime': dbQuery.startTime,
                'endDate': dbQuery.endDate,
                'endTime': dbQuery.endTime,
                'startTS': dbQuery.startTS,
                'endTS': dbQuery.endTS,
                'entryFee': dbQuery.entryFee
        }
        tourneys.append(tourney)
        
    for tourney in tourneys:
        products = []
        for dbQuery in session.query(CompletedProducts).filter_by(tourneyId = tourney['tourneyId']).all():
            products.append(dbQuery.productName)
        tourney['products'] = products
        print(products)
        
    session.close()
    
    return {"response": tourneys}

@app.route('/getMyHostedTourneys', methods=["POST"])
def getMyHostedTourneys():
    content = request.json
    
    tourneys = []

    session = Session()
    
    for tourney in session.query(AllTourneys).filter_by(hostId=content["userId"]).all():
        tourneys.append({'tourneyId': tourney.tourneyId, 'status': tourney.state});
    print(tourneys);
    
    if len(tourneys) > 0:
        for tourney in tourneys:
            
            if tourney['status'] == "registering":
                tourneyObj = session.query(RegistrationTourneys).filter_by(tourneyId=tourney["tourneyId"]).one()
                tourney['host'] = tourneyObj.host
                tourney['maxEntrants'] = tourneyObj.maxEntrants
                tourney['noEntrants'] = tourneyObj.noEntrants
                tourney['startDate'] = tourneyObj.startDate
                tourney['startTime'] = tourneyObj.startTime
                tourney['endDate'] = tourneyObj.endDate
                tourney['endTime'] = tourneyObj.endTime
                tourney['startTS'] = tourneyObj.startTS
                tourney['endTS'] = tourneyObj.endTS
                tourney['entryFee'] = tourneyObj.entryFee
            elif tourney['status'] == "active":
                tourneyObj = session.query(ActiveTourneys).filter_by(tourneyId=tourney["tourneyId"]).one()
                tourney['host'] = tourneyObj.host
                tourney['maxEntrants'] = tourneyObj.maxEntrants
                tourney['noEntrants'] = tourneyObj.noEntrants
                tourney['startDate'] = tourneyObj.startDate
                tourney['startTime'] = tourneyObj.startTime
                tourney['endDate'] = tourneyObj.endDate
                tourney['endTime'] = tourneyObj.endTime
                tourney['startTS'] = tourneyObj.startTS
                tourney['endTS'] = tourneyObj.endTS
                tourney['entryFee'] = tourneyObj.entryFee
            elif tourney['status'] == "active":
                tourneyObj = session.query(ActiveTourneys).filter_by(tourneyId=tourney["tourneyId"]).one()
                tourney['host'] = tourneyObj.host
                tourney['maxEntrants'] = tourneyObj.maxEntrants
                tourney['noEntrants'] = tourneyObj.noEntrants
                tourney['startDate'] = tourneyObj.startDate
                tourney['startTime'] = tourneyObj.startTime
                tourney['endDate'] = tourneyObj.endDate
                tourney['endTime'] = tourneyObj.endTime
                tourney['startTS'] = tourneyObj.startTS
                tourney['endTS'] = tourneyObj.endTS
                tourney['entryFee'] = tourneyObj.entryFee

        
    session.close()

    return {"response": tourneys}

@app.route('/createUser', methods=['POST'])
def createUser():
    content = request.json
    
    session = Session()
    dbEntry = Usernames(userId=content["userId"], username=content["username"], email=content["email"])
    dbEntry2 = AccountBalances(userId=content["userId"], balance=1)
    session.add(dbEntry)
    session.add(dbEntry2)
    session.commit()
    session.close()
    
    return {"response": "success"}

@app.route('/createTournament', methods=['POST'])
def createTournament():
    content = request.json
    print(content)
    
    # get the start and end timestamps from startDate and startTime / endDate and endTime strings
    # datetime format: %Y-%m-%d %H:%M
    
    # calculate the end date and time given the start date and time and duration

    startString = content["startDate"] + " " + content["startTime"]
    #endString = content["endDate"] + " " + content["endTime"]
    startTS = datetime.datetime.strptime(startString, "%Y-%m-%d %H:%M").timestamp()
    #endTS = datetime.datetime.strptime(endString, "%Y-%m-%d %H:%M").timestamp()
    duration = int(content["duration"]) * 24 * 60 * 60 # convert days to seconds
    endTS = startTS + duration
    endDateTime = datetime.datetime.fromtimestamp(endTS)
    month = endDateTime.month
    day = endDateTime.day
    hour = endDateTime.hour
    minute = endDateTime.minute
    if month >= 0 and month <=9:
        month = "0" + str(month)
    if day >= 0 and day <=9:
        day = "0" + str(day)
    if hour >= 0 and hour <=9:
        hour = "0" + str(hour)
    if minute >= 0 and minute <=9:
        minute = "0" + str(minute)
    endDate = str(endDateTime.year) + "-" + str(month) + "-" + str(day)
    endTime = str(hour) + ":" + str(minute)
    print(endDate, endTime)
    
    session = Session()
    dbEntry = RegistrationTourneys(hostId=content["hostId"] ,tourneyId = int(content["tourneyId"]), host=content["host"], maxEntrants=content["maxEntrants"],  minEntrants=content["minEntrants"],  noEntrants=0, startDate=content["startDate"], startTime=content["startTime"], endDate=endDate, endTime=endTime, startTS=startTS, endTS=endTS, quoteCurrency=content["quoteCurrency"], visibility=content["visibility"], entryFee=content["entryFee"], payoutStruct=content["payoutStruct"])
    dbEntry2 = AllTourneys(tourneyId = int(content["tourneyId"]), state = "registering", hostId=content["hostId"])
    session.add(dbEntry)
    session.add(dbEntry2)
    session.commit()
    session.close()
    
    return {"response": "success"}

@app.route('/deleteTournament', methods=['POST'])
def deleteTournament():
    
    content = request.json
    print(content)
    
    session = Session()
    dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    dbQuery2 = session.query(AllTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    if dbQuery.hostId == content["userId"]:
        session.delete(dbQuery)
        session.delete(dbQuery2)
        session.commit()
        session.close()
    
        return {"response": "success"}
    else:
        session.close()
        return {"response": "unauthorized"}

@app.route('/updateTourneyVisibility', methods=['POST'])
def updateTourneyVisibility():
    content = request.json
    session = Session()
    dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    if dbQuery.hostId == content["userId"]:
        dbQuery.visibility = content['visibility']
        session.add(dbQuery)
        session.commit()
        session.close()
        return {"response": "success"}
    else:
        session.close()
        return {"response": "unauthorized"}
    
@app.route('/tourneyRegistration', methods=['POST'])
def registerTourneys():
    content = request.json
    
    session = Session()
    # check the user has large enough balance
    balanceQuery = session.query(AccountBalances).filter_by(userId=content["userId"]).one()
    userBalance = balanceQuery.balance
    # get the entry fee from the tourney id
    entryFeeQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    entryFee = entryFeeQuery.entryFee
    # check the user has enough money
    if (userBalance >= entryFee):
        #deduct the entry fee from the balance
        balanceQuery.balance -= entryFee
        session.add(balanceQuery)
        
        # add the user to entrants table
        dbEntry = Entrants(tourneyId=content["tourneyId"], userId=content["userId"], username=content["username"], balance=content["balance"])
        session.add(dbEntry)

        # update the number of entrants in registration tourneys table
        dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
        dbQuery.noEntrants += 1
        session.add(dbQuery)

        # check if the user has an invitation to this tournament, if they do then delete the invitation
        dbQuery2 = session.query(TourneyInvites).filter_by(userId=content["userId"], tourneyId=content["tourneyId"]).all()
        if len(dbQuery2) > 0:
            session.delete(dbQuery2[0])
            
        session.commit()
    
        session.close()

        return {"response": "success"}
    else:
        session.close()
        return {"response": "insufficient funds"}

@app.route('/tourneyUnregister', methods=['POST'])
def unregisterTourneys():
    content = request.json
    
    # delete the user from the tournament
    session = Session()
    dbQuery1 = session.query(Entrants).filter_by(tourneyId=content["tourneyId"], userId=content["userId"]).one()
    session.delete(dbQuery1)
    
    # reduce the no. entrants in the registration tourneys table
    dbQuery2 = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    dbQuery2.noEntrants -= 1
    session.add(dbQuery2)
    
    # add the entry fee back to user's balance
    entryFeeQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    entryFee = entryFeeQuery.entryFee
    balanceQuery = session.query(AccountBalances).filter_by(userId=content["userId"]).one()
    balanceQuery.balance += entryFee
    session.add(balanceQuery)
    
    session.commit()
    
    session.close()
    
    return content

@app.route('/registerProducts', methods=['POST'])
def registerProducts():
    content = request.json
    
    print(content)
    
    session = Session()
    
    for exchange in content['products']:
        for productType in content['products'][exchange]:
            for product in content['products'][exchange][productType]:
                dbEntry = RegisteringProducts(exchange=exchange, productName=product, tourneyId=content['tourneyId'], productType=productType)
                session.add(dbEntry)
    
    session.commit()
    session.close()
    
    return {"response": "success"}

@app.route('/getProducts', methods=['POST'])
def getProducts():
    tourneyId = request.json["tourneyId"]
    
    binanceProducts = []
    FTXProducts = []
    bitfinexProducts = []
    
    session = Session()
    for query in session.query(RegisteringProducts).filter_by(tourneyId=tourneyId):
        if query.exchange == "Binance":
            binanceProducts.append(query.productName)
        if query.exchange == "FTX":
            FTXProducts.append(query.productName)
        if query.exchange == "Bitfinex":
            bitfinexProducts.append(query.productName)
    session.close()
    
    return ({"Binance": binanceProducts, "FTX": FTXProducts, "Bitfinex": bitfinexProducts})

@app.route('/getActiveProducts', methods=['POST'])
def getActiveProducts():
    tourneyId = request.json["tourneyId"]
    
    binanceProducts = []
    FTXProducts = []
    bitfinexProducts = []
    
    session = Session()
    for query in session.query(ActiveProducts).filter_by(tourneyId=tourneyId):
        if query.exchange == "Binance":
            binanceProducts.append(query.productName)
        if query.exchange == "FTX":
            FTXProducts.append(query.productName)
        if query.exchange == "Bitfinex":
            bitfinexProducts.append(query.productName)
    session.close()
    
    return ({"Binance": binanceProducts, "FTX": FTXProducts, "Bitfinex": bitfinexProducts})

@app.route('/getCompletedProducts', methods=['POST'])
def getCompletedProducts():
    tourneyId = request.json["tourneyId"]
    
    binanceProducts = []
    FTXProducts = []
    bitfinexProducts = []
    
    session = Session()
    for query in session.query(CompletedProducts).filter_by(tourneyId=tourneyId):
        if query.exchange == "Binance":
            binanceProducts.append(query.productName)
        if query.exchange == "FTX":
            FTXProducts.append(query.productName)
        if query.exchange == "Bitfinex":
            bitfinexProducts.append(query.productName)
    session.close()
    
    return ({"Binance": binanceProducts, "FTX": FTXProducts, "Bitfinex": bitfinexProducts})
    

@app.route('/getTourneyEntrants', methods=['POST'])
def getTourneyEntrants():
    content = request.json
    
    session = Session()
    dbQuery = session.query(Entrants).filter_by(tourneyId=content["tourneyId"]).all()
    
    entrants = []
    profits = []
    for query in dbQuery:
        print(query.username)
        entrants.append(query.username)
        profits.append(0)
    
    session.commit()
    session.close()
    
    print(entrants)
    print(profits)
    
    return {"response": {"entrants": entrants, "profits": profits} }

@app.route('/getActiveEntrants', methods=['POST'])
def getActiveEntrants():
    content = request.json
    
    session = Session()
    
    if content["entrantType"] == "active":
        dbQuery = session.query(ActiveEntrants).filter_by(tourneyId=content["tourneyId"]).all()
    elif content["entrantType"] == "liquidated":
        dbQuery = session.query(CompletedEntrants).filter_by(tourneyId=content["tourneyId"]).all()
    
    profits = []
    
    entrants = []
    
    entrantObjs = []
    
    for query in dbQuery:
        entrant = (query.username, query.profitPercent)
        entrantObjs.append(entrant)
    
    session.commit()
    session.close()
    
    # sort entrants based on profit
    entrantObjs = sorted(entrantObjs, key=lambda entrant: entrant[1], reverse=True)
    
    for entrant in entrantObjs:
        entrants.append(entrant[0])
        profits.append(entrant[1])
    
    return {"response": {"entrants": entrants, "profits": profits}}

@app.route('/getCompletedEntrants', methods=['POST'])
def getCompletedEntrants():
    content = request.json
    
    session = Session()
    
    dbQuery = session.query(CompletedEntrants).filter_by(tourneyId=content["tourneyId"]).all()
    
    profits = []
    
    entrants = []
    
    entrantObjs = []
    
    for query in dbQuery:
        entrant = (query.username, query.profit)
        entrantObjs.append(entrant)
    
    session.commit()
    session.close()
    
    # sort entrants based on profit
    entrantObjs = sorted(entrantObjs, key=lambda entrant: entrant[1], reverse=True)
    
    for entrant in entrantObjs:
        entrants.append(entrant[0])
        profits.append(entrant[1])
    
    return {"response": {"entrants": entrants, "profits": profits}}
    
@app.route('/updateAPI', methods=['POST'])
def updateAPI():
    content = request.json
    
    print(content)
    
    session = Session()
    dbQuery = session.query(UserAPI).filter_by(userId=content["userId"]).one()
    
    if content["exchange"] == "FTX" and content["fieldToUpdate"] == "key":
        dbQuery.FTXKey = content["APIKey"]
    elif content["exchange"] == "FTX" and content["fieldToUpdate"] == "secret":
        dbQuery.FTXSecret = content["APISecret"]

    session.commit()
    session.close()
    
    return {"response": "success"}
    
@app.route('/createAPI', methods=['POST'])
def createAPI():
    content = request.json
    
    print(content)
    
    session = Session()
    dbEntry = UserAPI(userId=content["userId"])
    session.add(dbEntry)
    session.commit()
    session.close()
    
    return {"response": "success"}
    
@app.route('/getAPIInfo', methods=['POST'])
def getAPIInfo():
    content = request.json
    
    session = Session()
    dbQuery = session.query(UserAPI).filter_by(userId=content["userId"]).all()
    if len(dbQuery) > 0:
        FTXKey = dbQuery[0].FTXKey
        FTXSecret = dbQuery[0].FTXSecret
    
        session.close()
    
        return {"FTX": {"key": FTXKey, "secret": FTXSecret}}
    else:
        return {"FTX": {"key": '', "secret": ''}}
    
@app.route('/editStartBalance', methods=['POST'])
def editStartBalance():
    content = request.json
    
    session = Session()
    dbQuery = session.query(Entrants).filter_by(userId=content["userId"], tourneyId=content["tourneyId"]).one()
    dbQuery.balance = content['balance']
    session.add(dbQuery)
    session.commit()
    session.close()
    
    return {"response": "success"}
    
@app.route('/sendTourneyInvite', methods=['POST'])
def sendTourneyInvite():
    content = request.json
    
    session = Session()
    
    # check the host sent the request
    dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    if content["hostId"] == dbQuery.hostId:
    
        # get the user Id of the invited user
        dbQuery2 = session.query(Usernames).filter_by(username=content["username"]).all()
        if len(dbQuery2) > 0:
            userId = dbQuery2[0].userId
            
            # check the user is not already registered in the tournament
            dbQuery3 = session.query(Entrants).filter_by(tourneyId=content["tourneyId"], userId=userId).all()
            if len(dbQuery3) == 0:
                
                # check the user doesn't already have an invitation
                dbQuery4 = session.query(TourneyInvites).filter_by(userId=userId, tourneyId=content["tourneyId"]).all()
                if len(dbQuery4) == 0:

                    # add the invite to the invite table
                    dbEntry = TourneyInvites(userId=userId, tourneyId=content["tourneyId"], host=content["host"])
                    session.add(dbEntry)
                    session.commit()
                    session.close()

                    return {"response": "Invitation sent to " + content["username"]}
                else:
                    return {"response": "User already has an invitation"}
            else:
                return {"response": "User already registered"}
        else:
            return {"response": "User not found"}
    else: 
        return {"response": "Unauthorized"}
    
@app.route('/getTourneyInvites', methods=['POST'])
def getTourneyInvites():
    content = request.json
    
    invites = []
    session = Session()
    
    for query in session.query(TourneyInvites).filter_by(userId=content["userId"]).all():
        invite = {"tourneyId": query.tourneyId, "host": query.host}
        invites.append(invite)
        
    return {"response": invites}
    
@app.route('/removeTourneyInvite', methods=['POST'])
def declineTourneyInvite():
    content = request.json
    
    session = Session()
    dbQuery = session.query(TourneyInvites).filter_by(userId=content["userId"], tourneyId=content["tourneyId"]).one()
    session.delete(dbQuery)
    session.commit()
    session.close()
    
    return {"response": "invitation removed"}
    
@app.route('/getBalance', methods=['POST'])
def getBalance():
    content = request.json
    
    session = Session()
    dbQuery = session.query(AccountBalances).filter_by(userId=content["userId"]).one()
    balance = dbQuery.balance
    session.close()
    
    return {"balance": balance}
    
@app.route('/createCustomPayout', methods=['POST'])
def createCustomPayout():
    content = request.json
    
    session = Session()
    
    for payout in content["payoutValues"]:
        dbEntry = PayoutsCustomProvisional(tourneyId=content["tourneyId"], rank=payout["rank"], payoutPercent=payout["payout"])
        session.add(dbEntry)
        
    session.commit()
    session.close()
    
    return {"response": "success"}
    
@app.route('/getCustomPayout', methods=['POST'])
def getCustomPayout():
    content = request.json
    
    session = Session()
    
    payouts = []
    
    for query in session.query(PayoutsCustomProvisional).filter_by(tourneyId=content["tourneyId"]):
        payout = {"rank": query.rank, "payoutPercent": query.payoutPercent}
        payouts.append(payout)

    session.close()
    
    return {"response": payouts} 
    
@app.route('/getMyTrades', methods=['POST'])
def getMyTrades():
    content = request.json
    
    session = Session()
    
    trades = []
    
    for query in session.query(Trades).filter_by(userId=content["userId"]).all():
        trade = {}
        trade["tourneyId"] = query.tourneyId
        trade["productName"] = query.productName
        trade["exchange"] = query.exchange
        trade["side"] = query.side
        trade["quantity"] = query.quantity
        trade["price"] = query.price
        trade["date"] = query.date
        trade["time"] = query.time
        trades.append(trade)
        
    session.close()
    
    return {"response": trades}
    
    
    
    
    
    
    
    
    
    
    
    