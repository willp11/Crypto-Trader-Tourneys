import ccxt
import datetime
from datetime import timezone 
from binance.client import Client
from init import db
from sqlalchemy.orm import sessionmaker
from models import ActiveTourneys, ActiveEntrants, ActiveProducts, Trades, CompletedEntrants
import math
import time
import hmac
import requests
from requests import Request, Session

engine = db.engine
Session = sessionmaker(bind=engine)

API_key = 'mW4bIM9k5Fz-EnSotKhr-3WdXXbPaF6h_WKveN6z'
API_secret = 'ExCgCNok6eaQwCXMwfiohq5Yt580O3ef21ldyljI'

# GET ALL ACTIVE TOURNAMENTS
session = Session()

for tournament in session.query(ActiveTourneys).all():
    
    # get the tournament Id and starting timestamp
    tourneyId = tournament.tourneyId
    startTS = tournament.lastUpdated
    
    # get the current UTC timestamp
    utc_dt_aware = datetime.datetime.now(datetime.timezone.utc)
    utc_timestamp = int(utc_dt_aware.timestamp())
    
    print("tournament: " + str(tourneyId))
    
    # get the list of products traded in the tournament
    products = []
    for productQuery in session.query(ActiveProducts).filter_by(tourneyId=tourneyId).all():
        products.append({'name': productQuery.productName, 'exchange': productQuery.exchange})
    
    # iterate over all the tournament entrants
    for entrant in session.query(ActiveEntrants).filter_by(tourneyId=tourneyId).all():
        
        # get the user Id and starting balance
        userId = entrant.userId
        username = entrant.username
        
        print("User: " + userId)
        
        for product in products:
            
            productName=product['name']
            print(product)
            
            string = "https://ftx.com/api/fills?market=" + productName

            ts = int(time.time() * 1000)
            
            payload = {"start_time": startTS, "end_time": utc_timestamp}
            
            # call the FTX API
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
            
            print(trades)
            
            # iterate over all trades and add to trades table
            for trade in trades:
                tradeDate = trade['time'][0:10]
                tradeTime = trade['time'][11:19]
                side = trade['side']
                price = trade['price']
                qty = trade['size']

                dbEntry = Trades(userId=entrant.userId, tourneyId=tourneyId, productName=productName, exchange=product['exchange'], side=side, quantity=qty, price=price, date=tradeDate, time=tradeTime)
                session.add(dbEntry)
    
    # commit the db changes at the end of every tournament
    tournament.lastUpdated = utc_timestamp
    session.add(tournament)
    session.commit()
    
session.close()

            