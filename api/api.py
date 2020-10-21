import time
import hmac
import requests
from requests import Request, Session
from init import app, db
from flask import request
from sqlalchemy.orm import sessionmaker
from models import RegistrationTourneys, Usernames, Entrants, UserAPI, RegisteringProducts, ActiveTourneys, ActiveEntrants, ActiveProducts, ProductList, CompletedTourneys, CompletedEntrants, CompletedProducts, AllTourneys, TourneyInvites, AccountBalances, PayoutsCustomProvisional, Trades, Positions
import datetime
import random

engine = db.engine
Session = sessionmaker(bind=engine)

# gets all the products in the product list table -  no verification required
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

# gets the username given a userId - no further verification required
@app.route('/getUsernameEmail', methods=['POST'])
def getUsernameEmail():
    
    content = request.json
    session = Session()
    dbQuery = session.query(Usernames).filter_by(userId=content["userId"]).one()
    username = dbQuery.username
    email = dbQuery.email
    
    return {"response": {"username": username, "email": email}}

# gets the current state of a tournament - all public information - no verification required
@app.route('/getTourneyState', methods=['POST'])
def getTourneyState():
    content = request.json
    session = Session()
    dbQuery = session.query(AllTourneys).filter_by(tourneyId=content["tourneyId"]).all()
    if len(dbQuery) == 1:
        data = {}
        data["state"] = dbQuery[0].state
        data["hostId"] = dbQuery[0].hostId
        if dbQuery[0].state == "registering":
            dbQuery2 = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
            data["visibility"] = dbQuery2.visibility
        elif dbQuery[0].state == "active":
            dbQuery2 = session.query(ActiveTourneys).filter_by(tourneyId=content["tourneyId"]).one()
            data["visibility"] = dbQuery2.visibility
        elif dbQuery[0].state == "completed":
            dbQuery2 = session.query(CompletedTourneys).filter_by(tourneyId=content["tourneyId"]).one()
            data["visibility"] = dbQuery2.visibility

        session.close()

        return {'response': data}
    else:
        session.close
        
        return {'response': "request failed"}
    
# get the information on a tournament in registration 
@app.route('/getTourneyInfo', methods=['POST'])
def getTourneyInfo():
    content = request.json
    tourneyId = content["tourneyId"]
    session = Session()
    dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=tourneyId).all()
    
    
    if len(dbQuery) > 0:
        FTXProducts = []
        for query in session.query(RegisteringProducts).filter_by(tourneyId=tourneyId):
            if query.exchange == "FTX":
                FTXProducts.append(query.productName)
        
        entrantsQuery = session.query(Entrants).filter_by(tourneyId=tourneyId).all()

        entrantsList = []
        profits = []

        for query in entrantsQuery:
            entrantsList.append(query.username)
            profits.append(0)
            
        entrants = {"entrants": entrantsList, "profits": profits}
        
        tourneyInfo = {'tourneyId': tourneyId,
                    'host': dbQuery[0].host,
                    'inviteCode': dbQuery[0].inviteCode,
                    'maxEntrants': dbQuery[0].maxEntrants,
                    'minEntrants': dbQuery[0].minEntrants,
                    'noEntrants': dbQuery[0].noEntrants,
                    'startDate': dbQuery[0].startDate,
                    'startTime': dbQuery[0].startTime,
                    'endDate': dbQuery[0].endDate,
                    'endTime': dbQuery[0].endTime,
                    'quoteCurrency': dbQuery[0].quoteCurrency,
                    'visibility': dbQuery[0].visibility,
                    'products': {'FTX': FTXProducts},
                    'entrants': entrants
        }

    else:
        tourneyInfo = {'tourneyId': "No match"}

    session.commit()
    session.close()
    
    return tourneyInfo

# get the information on an active tournament 
@app.route('/getActiveTourneyInfo', methods=['POST'])
def getActiveTourneyInfo():
    content = request.json
    tourneyId = content["tourneyId"]
    session = Session()
    dbQuery = session.query(ActiveTourneys).filter_by(tourneyId=tourneyId).all()
    
    
    if len(dbQuery) > 0:
        FTXProducts = []
        for query in session.query(ActiveProducts).filter_by(tourneyId=tourneyId):
            if query.exchange == "FTX":
                FTXProducts.append(query.productName)
                
        #####################################################################################################
        dbQueryActive = session.query(ActiveEntrants).filter_by(tourneyId=content["tourneyId"]).all()
        
        # Active Entrants
        profits = []
        entrants = []
        entrantObjs = []
        
        # Liquidated Entrants
        liqEntrants = []
        liqEntrantsObjs = []

        for query in dbQueryActive:
            if query.liquidated == False:
                entrant = (query.username, query.profitPercent)
                entrantObjs.append(entrant)
            else:
                liqEntrant = (query.username, query.liquidatedTS)
                liqEntrantsObjs.append(liqEntrant)

        # sort entrants based on profit
        entrantObjs = sorted(entrantObjs, key=lambda entrant: entrant[1], reverse=True)

        for entrant in entrantObjs:
            entrants.append(entrant[0])
            profits.append(entrant[1])
            
        activeEntrants = {"entrants": entrants, "profits": profits}
        
        # sort liquidated entrants based on timestamp
        liqEntrantsObjs = sorted(liqEntrantsObjs, key=lambda entrant: entrant[1], reverse=False)

        for entrant in liqEntrantsObjs:
            liqEntrants.append(entrant[0])
            
        liquidatedEntrants = {"entrants": entrants}
    
        #####################################################################################################
        
        tourneyInfo = {'tourneyId': tourneyId,
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
                    'products': {'FTX': FTXProducts},
                    'activeEntrants': activeEntrants,
                    'liqEntrants': liquidatedEntrants
        }

    else:
        tourneyInfo = {'tourneyId': "No match"}

    session.commit()
    session.close()
    
    return tourneyInfo

# get the information on a completed tournament 
@app.route('/getCompletedTourneyInfo', methods=['POST'])
def getCompletedTourneyInfo():
    content = request.json
    tourneyId = content["tourneyId"]
    session = Session()
    dbQuery = session.query(CompletedTourneys).filter_by(tourneyId=tourneyId).all()
    
    if len(dbQuery) > 0:
        FTXProducts = []
        for query in session.query(CompletedProducts).filter_by(tourneyId=tourneyId):
            if query.exchange == "FTX":
                FTXProducts.append(query.productName)
        
        entrantsQuery = session.query(CompletedEntrants).filter_by(tourneyId=tourneyId).all()

        # Active Entrants
        profits = []
        entrants = []
        entrantObjs = []
        
        # Liquidated Entrants
        liqEntrants = []
        liqEntrantsObjs = []

        for query in entrantsQuery:
            if query.liquidated == False:
                entrant = (query.username, query.profitPercent)
                entrantObjs.append(entrant)
            else:
                liqEntrant = (query.username, query.liquidatedTS)
                liqEntrantsObjs.append(liqEntrant)

        # sort entrants based on profit
        entrantObjs = sorted(entrantObjs, key=lambda entrant: entrant[1], reverse=True)

        for entrant in entrantObjs:
            entrants.append(entrant[0])
            profits.append(entrant[1])
            
        completedEntrants = {"entrants": entrants, "profits": profits}
        
         # sort liquidated entrants based on timestamp
        liqEntrantsObjs = sorted(liqEntrantsObjs, key=lambda entrant: entrant[1], reverse=False)

        for entrant in liqEntrantsObjs:
            liqEntrants.append(entrant[0])
            
        liquidatedEntrants = {"entrants": entrants}
        
        tourneyInfo = {'tourneyId': tourneyId,
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
                    'products': {'FTX': FTXProducts},
                    'entrants': completedEntrants,
                    'liqEntrants': liquidatedEntrants
        }

    else:
        tourneyInfo = {'tourneyId': "No match"}

    session.commit()
    session.close()
    
    return tourneyInfo

# get an entrants tournament balance in a given tournament - no further verification required 
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
            profit = 0
    elif content['tourneyType'] == 'active':
        dbQuery = session.query(ActiveEntrants).filter_by(tourneyId=content["tourneyId"], userId=content["userId"]).all()
        if len(dbQuery) == 0:
            return {"balance": "not registered"}
        else:
            balance = dbQuery[0].balance
            profit = round(dbQuery[0].profitPercent, 4)
    elif content['tourneyType'] == 'completed':
        dbQuery = session.query(CompletedEntrants).filter_by(tourneyId=content["tourneyId"], userId=content["userId"]).all()
        if len(dbQuery) == 0:
            return {"balance": "not registered"}
        else:
            balance = dbQuery[0].balance
            profit = round(dbQuery[0].profitPercent, 4)
    
    return {"balance": balance, "profit": profit}

# update a user's tournament starting balance - no further verification required
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

# check if a given userId is the host of a given tournament - no further verification required
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

# get all tournaments in registration
@app.route('/getAllTourneys', methods=['GET'])
def getAllTourneys():
    content = request.json
    
    tourneys = []
    session = Session()
    for dbQuery in session.query(RegistrationTourneys).all():
        if dbQuery.visibility == "public":
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
                    'endTS': dbQuery.endTS
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

# get all active tournaments
@app.route('/getActiveTourneys', methods=['GET'])
def getActiveTourneys():
    content = request.json
    
    tourneys = []
    session = Session()
    for dbQuery in session.query(ActiveTourneys).all():
        if dbQuery.visibility == "public":
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
                    'endTS': dbQuery.endTS
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

# get all completed tournaments
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
                'endTS': query.endTS
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

# gets all tournaments for a given userId - no further verification required
@app.route('/getAllMyTourneys', methods=["POST"])
def getAllMyTourneys():
    
    content = request.json
    
    session = Session()
    
    # GET TOURNAMENTS IN REGISTRATION
    registrationTourneys = []
    registrationTourneyIds = []
    
    for dbQuery in session.query(Entrants).filter_by(userId=content["userId"]).all():
        registrationTourneyIds.append(dbQuery.tourneyId)
        
    for tourneyId in registrationTourneyIds:
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
                'endTS': dbQuery.endTS
        }
        registrationTourneys.append(tourney)
        
    for tourney in registrationTourneys:
        products = []
        for dbQuery in session.query(RegisteringProducts).filter_by(tourneyId = tourney['tourneyId']).all():
            products.append(dbQuery.productName)
        tourney['products'] = products
        
    # GET ACTIVE TOURNAMENTS 
    activeTourneys = []
    activeTourneyIds = []
    
    for dbQuery in session.query(ActiveEntrants).filter_by(userId=content["userId"]).all():
        activeTourneyIds.append(dbQuery.tourneyId)
        
    for tourneyId in activeTourneyIds:
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
                'endTS': dbQuery.endTS
        }
        activeTourneys.append(tourney)
        
    for tourney in activeTourneys:
        products = []
        for dbQuery in session.query(ActiveProducts).filter_by(tourneyId = tourney['tourneyId']).all():
            products.append(dbQuery.productName)
        tourney['products'] = products
        
    # GET COMPLETED TOURNEYS
    completedTourneys = []
    completedTourneyIds = []
    session = Session()
    
    for dbQuery in session.query(CompletedEntrants).filter_by(userId=content["userId"]).all():
        completedTourneyIds.append(dbQuery.tourneyId)
        
    for tourneyId in completedTourneyIds:
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
                'endTS': dbQuery.endTS
        }
        completedTourneys.append(tourney)
        
    for tourney in completedTourneys:
        products = []
        for dbQuery in session.query(CompletedProducts).filter_by(tourneyId = tourney['tourneyId']).all():
            products.append(dbQuery.productName)
        tourney['products'] = products
        
    # GET HOSTED TOURNEYS
    hostedTourneys = []
    
    for tourney in session.query(AllTourneys).filter_by(hostId=content["userId"]).all():
        if tourney.state != "cancelled":
            hostedTourneys.append({'tourneyId': tourney.tourneyId, 'status': tourney.state});
    
    if len(hostedTourneys) > 0:
        for tourney in hostedTourneys:

            products = []
        
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
                
                for product in session.query(RegisteringProducts).filter_by(tourneyId = tourney['tourneyId']).all():
                    products.append(product.productName)
                tourney['products'] = products
                
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
                
                for product in session.query(ActiveProducts).filter_by(tourneyId = tourney['tourneyId']).all():
                    products.append(product.productName)
                tourney['products'] = products
                
            elif tourney['status'] == "completed":
                tourneyObj = session.query(CompletedTourneys).filter_by(tourneyId=tourney["tourneyId"]).one()
                tourney['host'] = tourneyObj.host
                tourney['maxEntrants'] = tourneyObj.maxEntrants
                tourney['noEntrants'] = tourneyObj.noEntrants
                tourney['startDate'] = tourneyObj.startDate
                tourney['startTime'] = tourneyObj.startTime
                tourney['endDate'] = tourneyObj.endDate
                tourney['endTime'] = tourneyObj.endTime
                tourney['startTS'] = tourneyObj.startTS
                tourney['endTS'] = tourneyObj.endTS
                
                for product in session.query(CompletedProducts).filter_by(tourneyId = tourney['tourneyId']).all():
                    products.append(product.productName)
                tourney['products'] = products
                
    session.close()
    
    return {"response": {"registrationTourneys": registrationTourneys, "activeTourneys": activeTourneys, "completedTourneys": completedTourneys, "hostedTourneys": hostedTourneys}}

# Takes username as input and says if its available or not - no verification required
@app.route('/checkUsername', methods=['POST'])
def checkUsername():
    content = request.json
    username = content["username"]
    
    session = Session()
    # check the username is not already taken
    usernameSearch = session.query(Usernames).filter_by(username=content["username"]).all()
    if len(usernameSearch) != 0:
        session.close()
        return {"response": "username not available"}
    else:
        session.close()
        return {"response": "username available"}

# Creates a user given a userId, username and email / updates a user record
@app.route('/createUser', methods=['POST'])
def createUser():
    content = request.json
    
    # check username is between 3 and 25 characters
    if (len(content["username"]) >= 3 and len(content["username"]) <= 25):
        session = Session()

        # check the username is not already taken
        usernameSearch = session.query(Usernames).filter_by(username=content["username"]).all()
        if len(usernameSearch) != 0:
            return {"response": "username not available"}
        else:
            # check if user is already registered
            userIdSearch = session.query(Usernames).filter_by(userId=content["userId"]).all()
            if len(userIdSearch) == 0:
                # add the user to the usernames and API tables
                dbEntry = Usernames(userId=content["userId"], username=content["username"], email=content["email"])
                dbEntry2 = UserAPI(userId=content["userId"])
                session.add(dbEntry)
                session.add(dbEntry2)
            elif len(userIdSearch) == 1:
                # update the username
                userSearch = session.query(Usernames).filter_by(userId=content["userId"]).one()
                userSearch.username = content["username"]
                session.add(userSearch)

            session.commit()
            session.close()

            return {"response": "success"}
    else:
        return {"response": "invalid username"}

@app.route('/updateUsername', methods=['POST'])

# Create a new tournament - requires verification - invite code and tourneyId should be generated server side
@app.route('/createTournament', methods=['POST'])
def createTournament():
    content = request.json
    
    # check the form data is valid
    validData = True
    # get the current timestamp and starting timestamp
    currentUTC = datetime.datetime.utcnow().timestamp()
    startString = content["startDate"] + " " + content["startTime"]
    startTS = datetime.datetime.strptime(startString, "%Y-%m-%d %H:%M").timestamp()
    # check start time is more than 1 hour from now
#    if (startTS - 60*60) < currentUTC:
#        validData = False
    # check start time is less than 7 days from now
    if (startTS - 60*60*24*7) > currentUTC:
        validData = False
    # check duration is between 1 and 30 days
    if int(content["duration"]) < 1 or int(content["duration"]) > 30:
        validData = False
    # check there is maximum 5 trading products
    noProducts = 0
    for exchange in content['products']:
        for productType in content['products'][exchange]:
            for product in content['products'][exchange][productType]:
                noProducts += 1
    if noProducts < 1 or noProducts > 5:
        validData = False
    # check the minimum and maximum number of entrants is between 2 and 200
    maxEntrants = int(content["maxEntrants"])
    minEntrants = int(content["minEntrants"])
    if minEntrants < 2 or maxEntrants < 2 or minEntrants > 200 or maxEntrants > 200:
        validData = False
    # check the minimum number of entrants is equal to or less than the maximum number of entrants
    if minEntrants > maxEntrants:
        validData = False
    
    if validData == True:
    
        session = Session()

        # check the user is valid
        userQuery = session.query(Usernames).filter_by(userId=content["hostId"]).all()

        if len(userQuery) == 1:

            # generate a tourneyId and invite code
            tourneyIdValid = False
            while tourneyIdValid == False:
                tourneyId = random.randint(100000000, 999999999)
                # check the tourneyId is unique
                tourneyIdQuery = session.query(AllTourneys).filter_by(tourneyId=tourneyId).all()
                if len(tourneyIdQuery) == 0:
                    tourneyIdValid = True

            inviteCode = str(random.randint(100000, 999999))

            # create the date and time strings and timestamps
            startString = content["startDate"] + " " + content["startTime"]
            startTS = datetime.datetime.strptime(startString, "%Y-%m-%d %H:%M").timestamp()
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

            # add the new tournament to the database in registration table and all tourneys table
            dbEntry = AllTourneys(tourneyId = tourneyId, state = "registering", hostId=content["hostId"])
            dbEntry2 = RegistrationTourneys(hostId=content["hostId"] , tourneyId = tourneyId, host=content["host"], inviteCode=inviteCode, maxEntrants=content["maxEntrants"],  minEntrants=content["minEntrants"],  noEntrants=0, startDate=content["startDate"], startTime=content["startTime"], endDate=endDate, endTime=endTime, startTS=startTS, endTS=endTS, quoteCurrency=content["quoteCurrency"], visibility=content["visibility"])
            
            session.add(dbEntry)
            session.add(dbEntry2)

            for exchange in content['products']:
                for productType in content['products'][exchange]:
                    for product in content['products'][exchange][productType]:
                        dbEntry = RegisteringProducts(exchange=exchange, productName=product, tourneyId=tourneyId, productType=productType)
                        session.add(dbEntry)

            session.commit()
            session.close()

            return {"response": {"tourneyId": tourneyId}}
        else:
            session.close()

            return {"response": "verification failed"}
    else:
        return {"response": "invalid form data"}

# delete a tournament if the user is the host - no further verification required
@app.route('/deleteTournament', methods=['POST'])
def deleteTournament():
    
    content = request.json
    
    session = Session()
    
    #Check the tournament is still in registration
    tourneyQuery = session.query(AllTourneys).filter_by(tourneyId=content["tourneyId"]).one()

    if tourneyQuery.state == "active":
        session.close()
        return {"response": "fail", "errorMsg": "The tournament has already started."}
    elif tourneyQuery.state == "completed":
        session.close()
        return {"response": "fail", "errorMsg": "The tournament has already finished."}
    elif tourneyQuery.state == "cancelled":
        session.close()
        return {"response": "fail", "errorMsg": "The tournament has been cancelled."}
    else:
        dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
        dbQuery2 = session.query(AllTourneys).filter_by(tourneyId=content["tourneyId"]).one()
        if dbQuery.hostId == content["userId"]:
            session.delete(dbQuery)
            dbQuery2.state = "cancelled"
            session.add(dbQuery2)
            session.commit()
            session.close()

            return {"response": "success", "errorMsg": None}
        else:
            session.close()
            return {"response": "fail", "errorMsg": "Unauthorized."}

# update visibility status for a tournament - no further verification required
@app.route('/updateTourneyVisibility', methods=['POST'])
def updateTourneyVisibility():
    content = request.json
    session = Session()
    
    # check the tourney is in registration
    tourneyQuery = session.query(AllTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    if tourneyQuery.state == "active":
        session.close()
        return {"response": "The tournament is already active."}
    elif tourneyQuery.state == "completed":
        session.close()
        return {"response": "The tournament is already finished."}
    elif tourneyQuery.state == "cancelled":
        session.close()
        return {"response": "The tournament has been cancelled."}
    elif tourneyQuery.state == "registering":
        dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
        if dbQuery.hostId == content["userId"]:
            dbQuery.visibility = content['visibility']
            session.add(dbQuery)
            session.commit()
            session.close()
            return {"response": "Visibility changed successfully."}
        else:
            session.close()
            return {"response": "unauthorized"}

# register for a tournament - check the user has a valid API linked, if the tournament is private check if the user has an invitation, is the host or entered the invite code
@app.route('/tourneyRegistration', methods=['POST'])
def registerTourneys():
    content = request.json

#    # check the user has large enough balance
#    balanceQuery = session.query(AccountBalances).filter_by(userId=content["userId"]).one()
#    userBalance = balanceQuery.balance
#    # get the entry fee from the tourney id
#    entryFeeQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
#    entryFee = entryFeeQuery.entryFee
#    # check the user has enough money
#    if (userBalance >= entryFee):
#        #deduct the entry fee from the balance
#        balanceQuery.balance -= entryFee
#        session.add(balanceQuery)
#        
#        # add the user to entrants table
#        dbEntry = Entrants(tourneyId=content["tourneyId"], userId=content["userId"], username=content["username"], balance=content["balance"])
#        session.add(dbEntry)
#
#        # update the number of entrants in registration tourneys table
#        dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
#        dbQuery.noEntrants += 1
#        session.add(dbQuery)
#
#        # check if the user has an invitation to this tournament, if they do then delete the invitation
#        dbQuery2 = session.query(TourneyInvites).filter_by(userId=content["userId"], tourneyId=content["tourneyId"]).all()
#        if len(dbQuery2) > 0:
#            session.delete(dbQuery2[0])
#            
#        session.commit()
#    
#        session.close()
#
#        return {"response": "success"}
#    else:
#        session.close()
#        return {"response": "insufficient funds"}

    session = Session()

    # Check that the tournament hasn't already started
    tourneyQuery = session.query(AllTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    if tourneyQuery.state == "active":
        session.close()
        return {"response": "registration failed", "errorMsg": "Tournament has already started."}
    elif tourneyQuery.state == "cancelled":
        session.close()
        return {"response": "registration failed", "errorMsg": "Tournament has been cancelled."}
    elif tourneyQuery.state == "completed":
        session.close()
        return {"response": "registration failed", "errorMsg": "Tournament has already finished."}
    else:
        
        # Check the maximum number of entrants hasnt been reached
        statusQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()

        if statusQuery.noEntrants == statusQuery.maxEntrants:
            session.close()
            return {"response": "registration failed", "errorMsg": "Tournament has the maximum number of entrants."}
        
        # check the user has a valid API linked
        apiQuery = session.query(UserAPI).filter_by(userId=content["userId"]).all()

        if (apiQuery == None):
            return {"response": "API not valid"}
        else:
            if apiQuery[0].FTXKey == None or apiQuery[0].FTXSecret == None:
                session.close()
                return {"response": "API not valid"}
            else:
                # ping FTX to check API is valid
                API_key = apiQuery[0].FTXKey
                API_secret = apiQuery[0].FTXSecret

                # check the user isn't already registered to the tournament
                entrantQuery = session.query(Entrants).filter_by(userId=content["userId"], tourneyId=content["tourneyId"]).all()

                if len(entrantQuery) > 0:
                    session.close()
                    return {"response": "User is already registered."}

                validEntrant = False

                # check if the tournament is private
                if statusQuery.visibility == "private":
                    # check if the user has an invitation
                    inviteQuery = session.query(TourneyInvites).filter_by(tourneyId=content["tourneyId"], userId=content["userId"]).all()
                    if len(inviteQuery) == 1:
                        validEntrant = True
                        # delete the invitation
                        session.delete(inviteQuery[0])
                    else:
                        # if no invitation, check if the user is the host
                        hostQuery = session.query(AllTourneys).filter_by(tourneyId=content["tourneyId"]).one()
                        if hostQuery.hostId == content["userId"]:
                            validEntrant = True
                        else:
                            # if they're not the host, check if they entered the invite code
                            if content["inviteCode"] == None:
                                session.close()
                                return {"response": "No invitation"}
                            else:
                                # check if the invite code is valid
                                if statusQuery.inviteCode == content["inviteCode"]:
                                    validEntrant = True
                                else:
                                    session.close()
                                    return {"response": "Invalid invite code"}
                else:
                    validEntrant = True
                    # check if the user has an invitation
                    inviteQuery = session.query(TourneyInvites).filter_by(tourneyId=content["tourneyId"], userId=content["userId"]).all()
                    if len(inviteQuery) == 1:
                        # delete the invitation
                        session.delete(inviteQuery[0])


                if validEntrant == True:
                    # get the username
                    usernameQuery = session.query(Usernames).filter_by(userId=content["userId"]).one()

                    # add the user to entrants table
                    dbEntry = Entrants(tourneyId=content["tourneyId"], userId=content["userId"], username=usernameQuery.username, balance=content["balance"])
                    session.add(dbEntry)

                    # update the number of entrants in registration tourneys table
                    dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
                    dbQuery.noEntrants += 1
                    session.add(dbQuery)

                    session.commit()
                    session.close()

                    return {"response": "success"}
                else:
                    session.commit()
                    session.close()

                    return {"response": "Registration Not Valid"}
    
# unregister a user from a tournament given a user Id 
@app.route('/tourneyUnregister', methods=['POST'])
def unregisterTourneys():
    try:
        content = request.json
        session = Session()

        #Check the tournament is still in registration
        tourneyQuery = session.query(AllTourneys).filter_by(tourneyId=content["tourneyId"]).one()

        if tourneyQuery.state == "active":
            session.close()
            return {"response": "fail", "errorMsg": "The tournament has already started."}
        elif tourneyQuery.state == "completed":
            session.close()
            return {"response": "fail", "errorMsg": "The tournament has already finished."}
        elif tourneyQuery.state == "cancelled":
            session.close()
            return {"response": "fail", "errorMsg": "The tournament has been cancelled."}
        else:
            # Check the user is registered
            dbQuery1 = session.query(Entrants).filter_by(tourneyId=content["tourneyId"], userId=content["userId"]).all()
            if len(dbQuery1) == 1:
                # delete the user from the tournament
                session.delete(dbQuery1[0])

                # reduce the no. entrants in the registration tourneys table
                dbQuery2 = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
                dbQuery2.noEntrants -= 1
                session.add(dbQuery2)

                # add the entry fee back to user's balance
            #    entryFeeQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
            #    entryFee = entryFeeQuery.entryFee
            #    balanceQuery = session.query(AccountBalances).filter_by(userId=content["userId"]).one()
            #    balanceQuery.balance += entryFee
            #    session.add(balanceQuery)

                session.commit()

                session.close()
                return {"response": "success"}
            else:
                session.close()
                return {"response": "fail", "errorMsg": "You are not registered to this tournament."}
    except:
        session.close()
        return {"response": "fail", "errorMsg": "There was a problem with your request."}

# get all products for a tournament in registration 
@app.route('/getProducts', methods=['POST'])
def getProducts():
    tourneyId = request.json["tourneyId"]
    
    FTXProducts = []
    
    session = Session()
    for query in session.query(RegisteringProducts).filter_by(tourneyId=tourneyId):
        if query.exchange == "FTX":
            FTXProducts.append(query.productName)
    session.close()
    
    return ({"FTX": FTXProducts})

# get all products for an active tournament 
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

# get all products for a completed tournament 
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
    
# get all entrants for a tournament in registration 
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

# get all entrants for an active tournament 
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

# get all entrants for a completed tournament
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

# update a users API information given an API key and secret and a userId - pings FTX API to check the API key and secret are valid
@app.route('/updateAPI', methods=['POST'])
def updateAPI():
    content = request.json
    
    # get the API key and secret
    API_key = content['APIKey']
    API_secret = content['APISecret']

    # check if the key and secret are valid
    string = "https://ftx.com/api/fills?market=ETC-PERP"
    ts = int(time.time() * 1000)
    HTTPrequest = Request('GET', string)
    prepared = HTTPrequest.prepare()
    signature_payload = f'{ts}{prepared.method}{prepared.path_url}'.encode()
    if prepared.body:
        signature_payload += prepared.body
    signature = hmac.new(API_secret.encode(), signature_payload, 'sha256').hexdigest()
    prepared.headers['FTX-KEY'] = API_key
    prepared.headers['FTX-SIGN'] = signature
    prepared.headers['FTX-TS'] = str(ts)
    s = requests.Session()
    res = s.send(prepared)
    
    # if not valid, return invalid
    if 'result' in res.json():
        valid = True
    else:
        return {"response": "invalid"}
    
    # update the database
    session = Session()
    dbQuery = session.query(UserAPI).filter_by(userId=content["userId"]).one()
    
    dbQuery.FTXKey = API_key
    dbQuery.FTXSecret = API_secret

    session.commit()
    session.close()
    
    return {"response": "success"}

# creates an entry in the API table for a user
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

# gets the API info for a given userId
@app.route('/getAPIInfo', methods=['POST'])
def getAPIInfo():
    content = request.json
    
    session = Session()
    dbQuery = session.query(UserAPI).filter_by(userId=content["userId"]).all()
    if len(dbQuery) > 0:
        # get the API key and secret
        API_key = dbQuery[0].FTXKey
        API_secret = dbQuery[0].FTXSecret
        
        # check the key and secret are not none
        if API_key != None and API_secret != None:
            validity = "valid"

            # make encrypted key and secret to give to user
            FTXKeyEncrypt = API_key[0:5]
            FTXSecretEncrypt = API_secret[0:5]

            for i in range(5, len(API_key)):
                FTXKeyEncrypt += '*'
            for i in range(5, len(API_secret)):
                FTXSecretEncrypt += '*'
        else:
            validity = "invalid"
            FTXKeyEncrypt = ''
            FTXSecretEncrypt = ''
        
        session.close()
        return {"FTX": {"key": FTXKeyEncrypt, "secret": FTXSecretEncrypt}, "validity": validity}
    else:
        session.close()
        return {"FTX": {"key": '', "secret": ''}, "validity": "no API info found"}

# edit a user's starting balance for a tournament given a userId and tourneyId
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
    
# send an invitation to a user - check the host is sending the invite and check the user is valid, isnt already registered and doesnt already have an invitation
@app.route('/sendTourneyInvite', methods=['POST'])
def sendTourneyInvite():
    content = request.json
    
    session = Session()
    
     #Check the tournament is still in registration
    tourneyQuery = session.query(AllTourneys).filter_by(tourneyId=content["tourneyId"]).one()

    if tourneyQuery.state == "active":
        session.close()
        return {"response": "fail", "errorMsg": "The tournament has already started."}
    elif tourneyQuery.state == "completed":
        session.close()
        return {"response": "fail", "errorMsg": "The tournament has already finished."}
    elif tourneyQuery.state == "cancelled":
        session.close()
        return {"response": "fail", "errorMsg": "The tournament has been cancelled."}
    else:
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
                        session.close()
                        return {"response": "User already has an invitation"}
                else:
                    session.close()
                    return {"response": "User already registered"}
            else:
                session.close()
                return {"response": "User not found"}
        else: 
            session.close()
            return {"response": "Unauthorized"}
    
# get all invitations for a given user
@app.route('/getTourneyInvites', methods=['POST'])
def getTourneyInvites():
    content = request.json
    
    invites = []
    session = Session()
    
    for query in session.query(TourneyInvites).filter_by(userId=content["userId"]).all():
        tourneyQuery = session.query(RegistrationTourneys).filter_by(tourneyId=query.tourneyId).one()
        invite = {"tourneyId": query.tourneyId, "host": query.host, "quoteCurrency": tourneyQuery.quoteCurrency}
        invites.append(invite)
        
    session.close()
        
    return {"response": invites}
    
# remove an invitation for a given user from a given tournament
@app.route('/removeTourneyInvite', methods=['POST'])
def declineTourneyInvite():
    content = request.json
    
    session = Session()
    dbQuery = session.query(TourneyInvites).filter_by(userId=content["userId"], tourneyId=content["tourneyId"]).one()
    session.delete(dbQuery)
    session.commit()
    session.close()
    
    return {"response": "success"}
    
# get all the trades for a given user
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

# get positions for a user for a given tournament
@app.route('/getPositions', methods=['POST'])
def getPositions():
    content = request.json
    
    session = Session()
    
    positions = []
    
    for query in session.query(Positions).filter_by(userId=content["userId"], tourneyId=content["tourneyId"]).all():
        
        # convert last updated timestamp to a string
        TIME_FORMAT='%Y-%m-%d %H:%M:%S'
        
        lastUpdatedStr = datetime.datetime.fromtimestamp(query.lastUpdated).strftime(TIME_FORMAT)
        
        position = {}
        position["tourneyId"] = query.tourneyId
        position["productName"] = query.productName
        position["exchange"] = query.exchange
        position["lastUpdated"] = query.lastUpdated
        position["lastUpdatedStr"] = lastUpdatedStr
        position["price"] = query.price
        position["amountBought"] = query.amountBought
        position["amountSold"] = query.amountSold
        position["avgBuyPrice"] = round(query.avgBuyPrice, 9)
        position["avgSellPrice"] = round(query.avgSellPrice, 9)
        position["totalBought"] = round(query.avgBuyPrice * query.amountBought, 9)
        position["totalSold"] = round(query.avgSellPrice * query.amountSold, 9)
        position["inventory"] = round(query.amountBought - query.amountSold, 9)
        position["inventoryValue"] = round((query.amountBought - query.amountSold)*query.price, 9)
        position["profit"] = round(query.profit, 9)
        position["baseCurrency"] = query.baseCurrency
        position["quoteCurrency"] = query.quoteCurrency
        positions.append(position)
        
    session.close()
    
    return {"response": positions}
    
## get user's account balance
#@app.route('/getBalance', methods=['POST'])
#def getBalance():
#    content = request.json
#    
#    session = Session()
#    dbQuery = session.query(AccountBalances).filter_by(userId=content["userId"]).one()
#    balance = dbQuery.balance
#    session.close()
#    
#    return {"balance": balance}
#    
## create custom payout structure
#@app.route('/createCustomPayout', methods=['POST'])
#def createCustomPayout():
#    content = request.json
#    
#    session = Session()
#    
#    for payout in content["payoutValues"]:
#        dbEntry = PayoutsCustomProvisional(tourneyId=content["tourneyId"], rank=payout["rank"], payoutPercent=payout["payout"])
#        session.add(dbEntry)
#        
#    session.commit()
#    session.close()
#    
#    return {"response": "success"}
#    
## get the custom payout structure for a given tournament
#@app.route('/getCustomPayout', methods=['POST'])
#def getCustomPayout():
#    content = request.json
#    
#    session = Session()
#    
#    payouts = []
#    
#    for query in session.query(PayoutsCustomProvisional).filter_by(tourneyId=content["tourneyId"]):
#        payout = {"rank": query.rank, "payoutPercent": query.payoutPercent}
#        payouts.append(payout)
#
#    session.close()
#    
#    return {"response": payouts} 
#    
    
    
    
    
    
    
    
    
    
    
    
    