import time
from init import app, db
from flask import request
from sqlalchemy.orm import sessionmaker
from models import RegistrationTourneys, Usernames, Entrants, UserAPI, RegisteringProducts, ActiveTourneys, ActiveEntrants, ActiveProducts, ProductList

engine = db.engine
Session = sessionmaker(bind=engine)

@app.route('/getAllProducts', methods=['GET'])
def getAllProducts():
    session = Session()
    
    response = {'products': {'Binance': {'spot': {'BTC': [], 'USDT': []}, 'margin': {'BTC': [], 'USDT': []} }} }
    
    for query in session.query(ProductList).all():
#        product = {'symbol': query.symbol,
#                    'exchange': query.exchange,
#                    'spot': query.spot,
#                    'margin': query.margin,
#                    'baseSymbol': query.baseSymbol}
        product = query.symbol
        if query.spot == True and query.margin == True:
            if query.baseSymbol == 'BTC':
                response['products']['Binance']['spot']['BTC'].append(product)
                response['products']['Binance']['margin']['BTC'].append(product)
            elif query.baseSymbol == 'USDT':
                response['products']['Binance']['spot']['USDT'].append(product)
                response['products']['Binance']['margin']['USDT'].append(product)
        elif query.spot == True and query.margin == False:
            if query.baseSymbol == 'BTC':
                response['products']['Binance']['spot']['BTC'].append(product)
            elif query.baseSymbol == 'USDT':
                response['products']['Binance']['spot']['USDT'].append(product)
        elif query.spot == False and query.margin == True:
            if query.baseSymbol == 'BTC':
                response['products']['Binance']['margin']['BTC'].append(product)
            elif query.baseSymbol == 'USDT':
                response['products']['Binance']['margin']['USDT'].append(product)
        
    session.close()
        
    return response

@app.route('/getTourneyInfo', methods=['POST'])
def getTourneyInfo():
    content = request.json
    print(content["tourneyId"])
    session = Session()
    dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).all()
    if len(dbQuery) > 0:
        tourneyInfo = {'tourneyId': dbQuery[0].tourneyId,
                    'host': dbQuery[0].host,
                    'maxEntrants': dbQuery[0].maxEntrants,
                    'minEntrants': dbQuery[0].minEntrants,
                    'noEntrants': dbQuery[0].noEntrants,
                    'startDate': dbQuery[0].startDate,
                    'startTime': dbQuery[0].startTime,
                    'endDate': dbQuery[0].endDate,
                    'endTime': dbQuery[0].endTime
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
                    'maxEntrants': dbQuery[0].maxEntrants,
                    'noEntrants': dbQuery[0].noEntrants,
                    'startDate': dbQuery[0].startDate,
                    'startTime': dbQuery[0].startTime,
                    'endDate': dbQuery[0].endDate,
                    'endTime': dbQuery[0].endTime,
                    'status': dbQuery[0].status
                   }
    else:
        tourneyInfo = {'tourneyId': "No match"}

    session.commit()
    session.close()
    
    return tourneyInfo

@app.route('/checkIfHost', methods=['POST'])
def checkIfHost():
    content = request.json
    
    session = Session()
    dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    
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
                'endTime': dbQuery.endTime
        }
        tourneys.append(tourney)
        
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
                'status': dbQuery.status
        }
        tourneys.append(tourney)
        
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
                'endTime': dbQuery.endTime
        }
        tourneys.append(tourney)
        
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
                'status': dbQuery.status
        }
        tourneys.append(tourney)
        
    session.close()
    
    return {"response": tourneys}

@app.route('/createUser', methods=['POST'])
def createUser():
    content = request.json
    
    session = Session()
    dbEntry = Usernames(userId=content["userId"], username=content["username"])
    session.add(dbEntry)
    session.commit()
    session.close
    
    return {"response": "success"}

@app.route('/createTournament', methods=['POST'])
def createTournament():
    content = request.json
    print(content)
    
    session = Session()
    dbEntry = RegistrationTourneys(hostId=content["hostId"] ,tourneyId = int(content["tourneyId"]), host=content["host"], maxEntrants=content["maxEntrants"],  minEntrants=content["minEntrants"],  noEntrants=0, startDate=content["startDate"], startTime=content["startTime"], endDate=content["endDate"], endTime=content["endTime"])
    session.add(dbEntry)
    session.commit()
    session.close()
    
    return {"response": "success"}

@app.route('/deleteTournament', methods=['POST'])
def deleteTournament():
    
    content = request.json
    print(content)
    
    session = Session()
    dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    if dbQuery.hostId == content["userId"]:
        session.delete(dbQuery)
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
    dbEntry = Entrants(tourneyId=content["tourneyId"], userId=content["userId"], username=content["username"], balance=100)
    session.add(dbEntry)
    session.commit()
    
    dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    dbQuery.noEntrants += 1
    session.add(dbQuery)
    session.commit()
    
    session.close()
    
    return {"response": "success"}

@app.route('/tourneyUnregister', methods=['POST'])
def unregisterTourneys():
    content = request.json
    
    session = Session()
    dbQuery = session.query(Entrants).filter_by(tourneyId=content["tourneyId"], userId=content["userId"]).one()
    session.delete(dbQuery)
    session.commit()
    
    dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=content["tourneyId"]).one()
    dbQuery.noEntrants -= 1
    session.add(dbQuery)
    session.commit()
    
    session.close()
    
    return content

@app.route('/registerProducts', methods=['POST'])
def registerProducts():
    content = request.json
    
    print(content)
    
    session = Session()
    
    for exchange in content['products']:
        for product in content['products'][exchange]:
            dbEntry = RegisteringProducts(exchange=exchange, productName=product, tourneyId=content['tourneyId'])
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
    

@app.route('/getTourneyEntrants', methods=['POST'])
def getTourneyEntrants():
    content = request.json
    
    session = Session()
    dbQuery = session.query(Entrants).filter_by(tourneyId=content["tourneyId"]).all()
    
    entrants = []
    for query in dbQuery:
        print(query.username)
        entrants.append(query.username)
    
    session.commit()
    session.close()
    
    print(entrants)
    
    return {"response": entrants}

@app.route('/getActiveEntrants', methods=['POST'])
def getActiveEntrants():
    content = request.json
    
    session = Session()
    dbQuery = session.query(ActiveEntrants).filter_by(tourneyId=content["tourneyId"]).all()
    
    entrants = []
    for query in dbQuery:
        print(query.username)
        entrants.append(query.username)
    
    session.commit()
    session.close()
    
    print(entrants)
    
    return {"response": entrants}
    
@app.route('/updateAPI', methods=['POST'])
def updateAPI():
    content = request.json
    
    print(content)
    
    session = Session()
    dbQuery = session.query(UserAPI).filter_by(userId=content["userId"]).one()
    
    if content["API"] == "API1":
        dbQuery.API1 = content["APIKey"]
    elif content["API"] == "API2":
        dbQuery.API2 = content["APIKey"]
    elif content["API"] == "API3":
        dbQuery.API3 = content["APIKey"]

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
    dbQuery = session.query(UserAPI).filter_by(userId=content["userId"]).one()
    API1 = dbQuery.API1
    API2 = dbQuery.API2
    API3 = dbQuery.API3
    
    session.close()
    
    return {"API1": API1, "API2": API2, "API3": API3}
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    