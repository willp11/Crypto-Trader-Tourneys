#!/home/will/cryptotourneys/tourneysenv/bin python3

from init import app, db
from sqlalchemy.orm import sessionmaker
from models import RegistrationTourneys, Entrants, RegisteringProducts, ActiveTourneys, ActiveEntrants, ActiveProducts, AllTourneys, TourneyInvites, Positions
import time
import datetime
import hmac
import requests
from requests import Request, Session
import pytz

engine = db.engine
Session = sessionmaker(bind=engine)

while True:
    
    # variable to check closest tournament start time
    timeUntilNextTourney = 10000000000000000
    
    now = datetime.datetime.utcnow()
    timezone = pytz.timezone('UTC')
    timezone_date_time_obj = timezone.localize(now)
    nowTimestamp = timezone_date_time_obj.timestamp()
    
    API_key = 'mW4bIM9k5Fz-EnSotKhr-3WdXXbPaF6h_WKveN6z'
    API_secret = 'ExCgCNok6eaQwCXMwfiohq5Yt580O3ef21ldyljI'
    
    session = Session()

    for query in session.query(RegistrationTourneys).all():
        
        tourneyId = query.tourneyId
        startTimestamp = query.startTS
        
        # update the time until next tournament starts
        if startTimestamp - nowTimestamp < timeUntilNextTourney:
            timeUntilNextTourney = startTimestamp - nowTimestamp
        
        # check the tournament has started
        if startTimestamp - nowTimestamp < 0:
            
#            f = open("updateActiveTourneysLog.txt", "a")
#            f.write("Tournament " + str(tourneyId) + " started at: " + str(now) + "\n")
#            f.close()
#            
            print("Tournament " + str(tourneyId))

            # check we have enough entrants
            if query.noEntrants < query.minEntrants:
                # update the all tourneys table
                dbQuery = session.query(AllTourneys).filter_by(tourneyId=query.tourneyId).one()
                dbQuery.state = "cancelled"
                session.add(dbQuery)

                # delete the tournament from RegistrationTourneys, which will delete from entrants and products
                session.delete(query)
            else:
                # copy the tournament to ActiveTourneys
                dbEntry = ActiveTourneys(tourneyId=query.tourneyId, host=query.host, hostId=query.hostId, inviteCode=query.inviteCode, minEntrants=query.minEntrants, maxEntrants=query.maxEntrants, noEntrants=query.noEntrants, startTime=query.startTime, startDate=query.startDate, endTime=query.endTime, endDate=query.endDate, startTS=query.startTS, endTS=query.endTS, quoteCurrency=query.quoteCurrency, visibility=query.visibility, lastUpdated=query.startTS, profitType=query.profitType)
                session.add(dbEntry)
                    
                # copy the products to ActiveProducts and store the products in an array
                products = []
                for product in session.query(RegisteringProducts).filter_by(tourneyId=query.tourneyId).all():
                    dbEntry = ActiveProducts(tourneyId=query.tourneyId, productName=product.productName, exchange=product.exchange, productType=product.productType)
                    session.add(dbEntry)
                    # get the product's price at the start of the tournament
                    string = 'https://ftx.com/api/markets/'+ product.productName + '/candles?resolution=3600&start_time=' + str(query.startTS-3600) + '&end_time=' + str(query.startTS)
                    ts = int(time.time() * 1000)
                    request = Request('GET', string)
                    prepared = request.prepare()
                    signature_payload = f'{ts}{prepared.method}{prepared.path_url}'.encode()
                    if prepared.body:
                        signature_payload += prepared.body
                    signature = hmac.new(API_secret.encode(), signature_payload, 'sha256').hexdigest()
                    prepared.headers['FTX-KEY'] = API_key
                    prepared.headers['FTX-SIGN'] = signature
                    prepared.headers['FTX-TS'] = str(ts)
                    s = requests.Session()
                    res = s.send(prepared)
                    
                    if 'result' in res.json():
                        results = res.json().get('result')
                        price = results[-1]['open']
                    else:
                        print("API key not valid")
                        price = None
                    productDict = {"productName": product.productName, "exchange": product.exchange, "productType": product.productType, "currentPrice": price}
                    products.append(productDict)
                
                
                # copy the entrants to ActiveEntrants
                for entrant in session.query(Entrants).filter_by(tourneyId=query.tourneyId).all():
                    dbEntry = ActiveEntrants(tourneyId=query.tourneyId, userId=entrant.userId, username=entrant.username, profit=0.0, profitPercent=0.0, balance=entrant.balance, liquidated=False, rank=1)
                    session.add(dbEntry)
                    print("User: " + entrant.userId)
                    # check if the entrant wants to import their current positions
                    if entrant.importPositions == True:
                        tries = 0
                        success = False
                        while tries < 10 and success == False:
                            try:
                                print("getting positions")
                                # for each product, get the user's position
                                string = "https://ftx.com/api/positions"
                                ts = int(time.time() * 1000)
                                request = Request('GET', string)
                                prepared = request.prepare()
                                signature_payload = f'{ts}{prepared.method}{prepared.path_url}'.encode()
                                if prepared.body:
                                    signature_payload += prepared.body
                                signature = hmac.new(API_secret.encode(), signature_payload, 'sha256').hexdigest()
                                prepared.headers['FTX-KEY'] = API_key
                                prepared.headers['FTX-SIGN'] = signature
                                prepared.headers['FTX-TS'] = str(ts)
                                s = requests.Session()
                                res = s.send(prepared)
                                
                                if 'result' in res.json():
                                    results = res.json().get('result')
                                    
                                    for result in results:
                                        netSize = float(result['netSize'])
                                        if netSize != 0:
                                            for product in products:
                                                if product["productType"] == "future":
                                                    if product["productName"] == result['future']:
                                                            
                                                        productName = result['future']
                                                        quoteCurrency = 'USD'
                                                        baseCurrency = result['future']
                                                        currentPrice = product["currentPrice"]
                                                        
                                                        # to ensure the position is correct from the start of the tournament, need to check if any fills have occurred after the tournament start time and edit the position size if necessary
                                                        string = "https://ftx.com/api/fills?start_time=" + str(startTimestamp)
                                                        ts = int(time.time() * 1000)
                                                        request = Request('GET', string)
                                                        prepared = request.prepare()
                                                        signature_payload = f'{ts}{prepared.method}{prepared.path_url}'.encode()
                                                        if prepared.body:
                                                            signature_payload += prepared.body
                                                        signature = hmac.new(API_secret.encode(), signature_payload, 'sha256').hexdigest()
                                                        prepared.headers['FTX-KEY'] = API_key
                                                        prepared.headers['FTX-SIGN'] = signature
                                                        prepared.headers['FTX-TS'] = str(ts)
                                                        s = requests.Session()
                                                        res = s.send(prepared)

                                                        if 'result' in res.json():
                                                            results = res.json().get('result')
                                                            for result in results:
                                                                if product["productName"] == result['future']:
                                                                    if result['side'] == "buy":
                                                                        netSize -= float(result['size'])
                                                                    elif result['side'] == "sell":
                                                                        netSize += float(result['size'])

                                                        # create a position entry in the positions table
                                                        if netSize < 0:
                                                            amountBought = 0
                                                            amountSold = abs(netSize)
                                                            avgBuyPrice = 0
                                                            avgSellPrice = float(product["currentPrice"])
                                                        elif netSize > 0:
                                                            amountSold = 0
                                                            amountBought = netSize
                                                            avgSellPrice = 0
                                                            avgBuyPrice = float(product["currentPrice"])
                                                
                                                        positionEntry = Positions(userId=entrant.userId, tourneyId=query.tourneyId, productName=productName, exchange=product["exchange"], lastUpdated=query.startTS, price=currentPrice, amountBought=amountBought, amountSold=amountSold, avgBuyPrice=avgBuyPrice, avgSellPrice=avgSellPrice, profit=0, quoteCurrency=quoteCurrency, baseCurrency=baseCurrency, currentPrice=currentPrice)
                                                        session.add(positionEntry)
                                    
                                success = True
                            except:
                                tries += 1
                                print("error - retrying")
                                time.sleep(5)

                # update the all tourneys table
                dbQuery = session.query(AllTourneys).filter_by(tourneyId=query.tourneyId).one()
                dbQuery.state = "active"
                session.add(dbQuery)

                # delete all invitations for this tournament
                for inviteQuery in session.query(TourneyInvites).filter_by(tourneyId=query.tourneyId).all():
                    session.delete(inviteQuery)

                # delete the tournament from RegistrationTourneys, which will delete from entrants and products
                session.delete(query)
                
    # decide how long to sleep
    # if more than 1 hour, sleep for 59 minutes
    if timeUntilNextTourney > 60*60:
        sleepTime = 60*59
    else:
        sleepTime = 10
        
#    f = open("updateActiveTourneysLog.txt", "a")
#    f.write("Scan complete at: " + str(now) + "\n" + "Sleeping for " + str(sleepTime) + " seconds.\n")
#    f.close()
#    
#    print("Scan complete at: " + str(now) + "\n" + "Sleeping for " + str(sleepTime) + " seconds.\n")

    session.commit()    
    session.close()
    
    print("scan complete - sleeping " + str(sleepTime) + " seconds")
    time.sleep(sleepTime)

