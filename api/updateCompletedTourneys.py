from init import db
from sqlalchemy.orm import sessionmaker
from models import ActiveTourneys, ActiveEntrants, ActiveProducts, CompletedTourneys, CompletedEntrants, Trades, AllTourneys, CompletedProducts
import datetime
import time
import time
import hmac
import requests
from requests import Request

engine = db.engine
Session = sessionmaker(bind=engine)
session = Session()

tourneysReady = []

API_key = 'mW4bIM9k5Fz-EnSotKhr-3WdXXbPaF6h_WKveN6z'
API_secret = 'ExCgCNok6eaQwCXMwfiohq5Yt580O3ef21ldyljI'

for query in session.query(ActiveTourneys).all():
    
    tourneyId = query.tourneyId
    
    startTS = query.startTS
    endTimestamp = query.endTS
    
    now = datetime.datetime.utcnow()
    nowTimestamp = now.timestamp()
    
    if endTimestamp - nowTimestamp < 0:
        print("tourney finished: " + str(tourneyId))
        
        # get the list of products and copy the products to completed products table
        products = []
        for productQuery in session.query(ActiveProducts).filter_by(tourneyId=tourneyId).all():
            products.append({'name': productQuery.productName, 'exchange': productQuery.exchange})
            dbEntry = CompletedProducts(tourneyId=query.tourneyId, productName=productQuery.productName, exchange=productQuery.exchange, productType=productQuery.productType)
            session.add(dbEntry)
        
        # copy the tournament to CompletedTourneys
        dbEntry = CompletedTourneys(tourneyId=query.tourneyId, host=query.host, hostId=query.hostId, minEntrants=query.minEntrants, maxEntrants=query.maxEntrants, noEntrants=query.noEntrants, startTime=query.startTime, startDate=query.startDate, endTime=query.endTime, endDate=query.endDate, startTS=query.startTS, endTS=query.endTS, quoteCurrency=query.quoteCurrency, entryFee=query.entryFee)
        session.add(dbEntry)
        
        # copy the entrants to CompletedEntrants
        for entrant in session.query(ActiveEntrants).filter_by(tourneyId=query.tourneyId).all():
            dbEntry = CompletedEntrants(tourneyId=query.tourneyId, userId=entrant.userId, username=entrant.username, totalInvested=entrant.totalInvested, totalValue=entrant.totalValue, profit=entrant.profit, timestamp=endTimestamp, balance=entrant.balance)
            session.add(dbEntry)
        
            # Get each entrants's list of trades and store in the trades table
            for product in products:
                
                productName=product['name']
                
                # call the FTX API
                string = "https://ftx.com/api/fills?market=" + productName
                ts = int(time.time() * 1000)
                payload = {"start_time": startTS}
                request = Request('GET', string, params=payload)
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
                trades = res.json()['result']
                
                # iterate over all trades and add to trades table
                for trade in trades:
                    side = trade['side']
                    price = trade['price']
                    qty = trade['size']

                    tradeTime = trade['time'][0:len(trade['time'])-13]

                    timestamp = datetime.datetime.strptime(tradeTime, "%Y-%m-%dT%H:%M:%S").timestamp()
                    
                    dbEntry = Trades(userId=userId, tourneyId=tournament, productName=productName, exchange=product['exchange'], side=side, quantity=qty, price=price, timestamp=timestamp)
                    session.add(dbEntry)
                    
        # update the all tourneys table
        dbQuery = session.query(AllTourneys).filter_by(tourneyId=query.tourneyId).one()
        dbQuery.state = "completed"
        session.add(dbQuery)
        
        # delete the tournament from activeTourneys, which will delete from activeEntrants and activeProducts
        session.delete(query)
        session.commit()
        
        
session.close()