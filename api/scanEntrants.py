import ccxt
import datetime
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

class Position:
    def __init__(self, product, amountBought, amountSold, avgBuyPrice, avgSellPrice, sizeRemaining, value, invested, profit):
        self.product = product
        self.amountBought = amountBought
        self.amountSold = amountSold
        self.avgBuyPrice = avgBuyPrice
        self.avgSellPrice = avgSellPrice
        self.sizeRemaining = sizeRemaining
        self.value = value
        self.invested = invested
        self.profit = profit

API_key = 'mW4bIM9k5Fz-EnSotKhr-3WdXXbPaF6h_WKveN6z'
API_secret = 'ExCgCNok6eaQwCXMwfiohq5Yt580O3ef21ldyljI'

# GET ALL ACTIVE TOURNAMENTS
session = Session()
activeTournaments = []
for query in session.query(ActiveTourneys).all():
    activeTournaments.append(query.tourneyId)
    
print(activeTournaments)

for tournament in activeTournaments:
    print("tournament: " + str(tournament))
    products = []
    for query in session.query(ActiveProducts).filter_by(tourneyId=tournament).all():

        products.append({'name': query.productName, 'exchange': query.exchange})
    
    for query in session.query(ActiveEntrants).filter_by(tourneyId=tournament).all():
        
        # get the user Id and starting balance
        userId = query.userId
        username = query.username
        startingBalance = 1000
        # startingbalance = query.startingBalance
        
        print("User: " + userId)
        
        # array to store position objects
        positions = []

        #get the tournament's starting timestamp to use as payload for api call
        startTS = query.timestamp
        
        for product in products:
            
            productName=product['name']
            print(product)
            
            string = "https://ftx.com/api/fills?market=" + productName

            ts = int(time.time() * 1000)
            
            payload = {"start_time": startTS}
            
            #print("tournament start timestamp: " + str(startTS))
            
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
            
            # Create a position object for each product
            if len(trades) > 0:
                
                # initialise position object
                position = Position(product, 0, 0, 0, 0, 0, 0, 0, 0)
                
                # iterate over all the trades and calculate the net position
                for trade in trades:
                    #print(trade)

                    side = trade['side']
                    price = trade['price']
                    qty = trade['size']

                    tradeTime = trade['time'][0:len(trade['time'])-13]

                    timestamp = datetime.datetime.strptime(tradeTime, "%Y-%m-%dT%H:%M:%S").timestamp()
                    #print("trade timestamp: " + str(timestamp))

                    if side == 'buy':
                        position.amountBought += qty
                        if position.amountBought == qty:
                                position.avgBuyPrice = price
                        else:
                            position.avgBuyPrice = position.avgBuyPrice + ((price-position.avgBuyPrice)*(qty/position.amountBought))
                    elif side == 'sell':
                        position.amountSold += qty
                        if position.amountSold == qty:
                            position.avgSellPrice = price
                        else:
                            position.avgSellPrice = position.avgSellPrice + ((price-position.avgSellPrice)*(qty/position.amountSold))   

                    position.sizeRemaining = position.amountBought - position.amountSold
                
                # get the current price and calculate the current value of the position then append to positions array
                string = "https://ftx.com/api/markets/" + productName

                res = requests.get(string)

                bidPrice = res.json()['result']['bid']
                askPrice = res.json()['result']['ask']
                currentPrice = (float(bidPrice) + float(askPrice)) / 2

                #print(currentPrice)
                #print(position.sizeRemaining)

                position.value = (position.sizeRemaining*currentPrice) + (position.amountSold*position.avgSellPrice)
                position.invested = (position.amountBought * position.avgBuyPrice)
                if position.invested != 0:
                    position.profit = position.value - position.invested

                positions.append(position)
                #print(position.value, position.invested, position.profit)
                    
        totalVal = 0
        totalInvested = 0
        for position in positions:
            totalVal += position.value
            totalInvested += position.invested

        totalProfit = totalVal - totalInvested
        print("Profit: " + str(totalProfit))
        
        # change the user's profit value in active entrants table
        dbQuery = session.query(ActiveEntrants).filter_by(userId=userId, tourneyId=tournament).one()
        dbQuery.profit = totalProfit
        session.add(dbQuery)
        
#        if totalProfit + startingBalance <= 0:
#            print("User is liquidated!")
#            
#            # if the user has been liquidated, then add all their trades to the trades list, add them to completed entrants table and remove from active entrants table
#            for product in products:
#                
#                currentTimestamp = datetime.datetime.utcnow().timestamp()
#                
#                # add to completed entrants
#                dbEntry = CompletedEntrants(tourneyId=tournament, userId=userId, username=username, totalInvested=totalInvested, totalValue=totalVal, profit=totalProfit, timestamp=currentTimestamp)
#                session.add(dbEntry)
#                
#                # delete from active entrants
#                session.delete(query)
#                        
#                # get all trades to add to trades list
#                productName=product['name']
#
#                string = "https://ftx.com/api/fills?market=" + productName
#
#                ts = int(time.time() * 1000)
#
#                payload = {"start_time": startTS}
#
#                # call the FTX API
#                request = Request('GET', string, params=payload)
#                prepared = request.prepare()
#
#                signature_payload = f'{ts}{prepared.method}{prepared.path_url}'.encode()
#                if prepared.body:
#                    signature_payload += prepared.body
#
#                signature = hmac.new(API_secret.encode(), signature_payload, 'sha256').hexdigest()
#
#                prepared.headers['FTX-KEY'] = API_key
#                prepared.headers['FTX-SIGN'] = signature
#                prepared.headers['FTX-TS'] = str(ts)
#
#                s = requests.Session()
#                res = s.send(prepared)
#
#                trades = res.json()['result']
#                
#                for trade in trades:
#                    side = trade['side']
#                    price = trade['price']
#                    qty = trade['size']
#
#                    tradeTime = trade['time'][0:len(trade['time'])-13]
#
#                    timestamp = datetime.datetime.strptime(tradeTime, "%Y-%m-%dT%H:%M:%S").timestamp()
#                    
#                    dbEntry = Trades(userId=userId, tourneyId=tournament, productName=productName,  exchange=product['exchange'], side=side, quantity=qty, price=price, timestamp=timestamp)
#                    session.add(dbEntry)
                
        #commit the changes for that user
        session.commit()
    
session.close()
    