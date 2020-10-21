import ccxt
import datetime
from datetime import timezone 
from binance.client import Client
from init import db
from sqlalchemy.orm import sessionmaker
from models import ActiveTourneys, ActiveEntrants, ActiveProducts, Trades, CompletedEntrants, UserAPI
import math
import time
import hmac
import requests
from requests import Request, Session, ConnectionError

engine = db.engine
Session = sessionmaker(bind=engine)

#API_key = 'mW4bIM9k5Fz-EnSotKhr-3WdXXbPaF6h_WKveN6z'
#API_secret = 'ExCgCNok6eaQwCXMwfiohq5Yt580O3ef21ldyljI'

# GET ALL ACTIVE TOURNAMENTS
session = Session()

for tournament in session.query(ActiveTourneys).all():
    
    try:
        # get the tournament Id and starting timestamp
        tourneyId = tournament.tourneyId
        startTS = tournament.lastUpdated
        endTS = tournament.endTS

        # get the current UTC timestamp
        utc_dt_aware = datetime.datetime.now(datetime.timezone.utc)
        utc_timestamp = int(utc_dt_aware.timestamp())

        # if the current time is past the end time, make sure we only get the trades up until the tournament end time
        tourneyEndTime = utc_timestamp

        if utc_timestamp > endTS:
            tourneyEndTime = endTS

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

            # get the user's API key and secret
            apiQuery = session.query(UserAPI).filter_by(userId=userId).one()
            API_key = apiQuery.FTXKey
            API_secret = apiQuery.FTXSecret

            print("User: " + userId)

            for product in products:

                productName=product['name']
                print(product)

                string = "https://ftx.com/api/fills?market=" + productName

                ts = int(time.time() * 1000)

                payload = {"start_time": startTS, "end_time": tourneyEndTime}

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

                #print(trades)

                # iterate over all trades and add to trades table
                for trade in trades:
                    tradeDate = trade['time'][0:10]
                    tradeTime = trade['time'][11:19]
                    side = trade['side']
                    price = trade['price']
                    qty = trade['size']
                    quoteCurrency = trade['quoteCurrency']
                    baseCurrency = trade['baseCurrency']

                    dbEntry = Trades(userId=entrant.userId, tourneyId=tourneyId, productName=productName, exchange=product['exchange'], side=side, quantity=qty, price=price, date=tradeDate, time=tradeTime, quoteCurrency=quoteCurrency, baseCurrency=baseCurrency)
                    session.add(dbEntry)

        # commit the db changes at the end of every tournament
        tournament.lastUpdated = tourneyEndTime
        session.add(tournament)
        session.commit()
    except ConnectionError as e:
        print(e)
        time.sleep(5)

session.close()
            