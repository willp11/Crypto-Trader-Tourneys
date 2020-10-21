import ccxt
import datetime
from binance.client import Client
from init import db
from sqlalchemy.orm import sessionmaker
from models import AllTourneys, ActiveTourneys, ActiveEntrants, ActiveProducts, CompletedTourneys, CompletedEntrants, CompletedProducts, Positions, Trades
import math
import time
import hmac
import requests
from requests import Request, Session, ConnectionError

class Position:
    def __init__(self, product, amountBought, amountSold, avgBuyPrice, avgSellPrice, sizeRemaining, value, invested, profit, lastUpdated, quoteCurrency, baseCurrency):
        self.product = product
        self.amountBought = amountBought
        self.amountSold = amountSold
        self.avgBuyPrice = avgBuyPrice
        self.avgSellPrice = avgSellPrice
        self.sizeRemaining = sizeRemaining
        self.value = value
        self.invested = invested
        self.profit = profit
        self.lastUpdated = lastUpdated
        self.quoteCurrency = quoteCurrency
        self.baseCurrency = baseCurrency

engine = db.engine
Session = sessionmaker(bind=engine)

session = Session()

for tournament in session.query(ActiveTourneys).all():

    try:
        # get the tournament Id and starting timestamp
        tourneyId = tournament.tourneyId

        print("--------------------------------------")
        print("tournament: " + str(tourneyId))

        # if the tournament has ended, use end time instead of current time for prices, set last updated to the end time, move the tournament to completed 
        ts = datetime.datetime.utcnow().timestamp()
        startTS = tournament.startTS
        endTS = tournament.endTS

        if ts > endTS:
            tournamentEnded = True
            lastUpdated = endTS
        else:
            tournamentEnded = False
            lastUpdated = datetime.datetime.utcnow().timestamp()

        # get all the products in the tournament
        products = []
        for product in session.query(ActiveProducts).filter_by(tourneyId=tourneyId).all():
            products.append(product.productName)

        # get the prices for all the products in the tournament
        prices = {}

        for product in products:
            #if the tournament has ended, use end time instead of current time for prices
            if tournamentEnded == True:
                string = 'https://ftx.com/api/markets/'+ product + '/candles?resolution=3600&start_time=' + str(endTS-3600) + '&end_time=' + str(endTS)
                res = requests.get(string)
                # find the candle that ends with the same timestamp as the endTS
                lastCandle = res.json()["result"][0]
                prices[product] = float(lastCandle["close"])

            elif tournamentEnded == False:
                # get the current price of the product from FTX
                string = "https://ftx.com/api/markets/" + product
                res = requests.get(string)
                bidPrice = res.json()['result']['bid']
                askPrice = res.json()['result']['ask']
                prices[product] = (float(bidPrice) + float(askPrice)) / 2

        print(prices)
        print("--------------------------------------")

        # iterate over all the tournament entrants
        for entrant in session.query(ActiveEntrants).filter_by(tourneyId=tourneyId).all():

            # check the entrant hasn't already been liquidated
            if entrant.liquidated == False:

                userId = entrant.userId

                # array to store the entrants' trade position objects
                positions = []

                # iterate over all the trades and calculate the net position
                for trade in session.query(Trades).filter_by(tourneyId=tourneyId, userId=userId).all():

                    product = trade.productName
                    side = trade.side
                    quantity = trade.quantity
                    price = trade.price
                    quoteCurrency = trade.quoteCurrency
                    baseCurrency = trade.baseCurrency

                    openPositionFound = False

                    # check if the user has already opened a position for that product
                    for position in positions:
                        if position.product == trade.productName:
                            openPositionFound = True
                            positionToUpdate = position

                    if openPositionFound:
                        position = positionToUpdate

                        position.quoteCurrency = quoteCurrency
                        position.baseCurrency = baseCurrency

                        # update the position object
                        if side == 'buy':
                            position.amountBought += quantity
                            position.avgBuyPrice = position.avgBuyPrice + ((price-position.avgBuyPrice)*(quantity/position.amountBought))
                        elif side == 'sell':
                            position.amountSold += quantity
                            position.avgSellPrice = position.avgSellPrice + ((price-position.avgSellPrice)*(quantity/position.amountSold))   

                        # calculate the size of the position still open, to calculate how much it is worth at current market price
                        position.sizeRemaining = position.amountBought - position.amountSold    

                        # calculate the value of the position
                        position.lastUpdated = lastUpdated
                        position.currentPrice = prices[product]
                        position.value = (position.sizeRemaining*position.currentPrice) + (position.amountSold*position.avgSellPrice)
                        position.invested = (position.amountBought * position.avgBuyPrice)
                        if position.invested != 0:
                            position.profit = position.value - position.invested

                    else:
                        # create the new position object
                        position = Position(trade.productName,0,0,0,0,0,0,0,0,0,0,0)

                        position.quoteCurrency = quoteCurrency
                        position.baseCurrency = baseCurrency

                        if side == "buy":
                            position.amountBought += quantity
                            position.avgBuyPrice = price
                        elif side == "sell":
                            position.amountSold += quantity
                            position.avgSellPrice = price

                        # calculate the size of the position still open, to calculate how much it is worth at current market price
                        position.sizeRemaining = position.amountBought - position.amountSold    

                        # calculate the value of the position
                        position.lastUpdated = lastUpdated
                        position.currentPrice = prices[product] 
                        position.value = (position.sizeRemaining*position.currentPrice) + (position.amountSold*position.avgSellPrice)
                        position.invested = (position.amountBought * position.avgBuyPrice)
                        position.profit = position.value - position.invested

                        positions.append(position)

                totalProfit = 0
                for position in positions:
                    print(position.product, "Bought: " + str(position.amountBought),  "Sold: " + str(position.amountSold), "Current Price: " + str(position.currentPrice), "Avg Buy Price: " + str(position.avgBuyPrice),  "Avg Sell Price: " + str(position.avgSellPrice),  "Profit: " + str(position.profit))
                    totalProfit += position.profit

                    # check if there is already a position entry in db for this user, tourney and product
                    positionQuery = session.query(Positions).filter_by(userId=entrant.userId, tourneyId=tourneyId, productName=position.product).all()
                    if len(positionQuery) == 0:
                        # create new position entry
                        positionEntry = Positions(userId=entrant.userId, tourneyId=tourneyId, productName=position.product, exchange="FTX", lastUpdated=position.lastUpdated, price=position.currentPrice, amountBought=position.amountBought, amountSold=position.amountSold, avgBuyPrice=position.avgBuyPrice, avgSellPrice=position.avgSellPrice, profit=position.profit, baseCurrency=position.baseCurrency, quoteCurrency=position.quoteCurrency)
                        session.add(positionEntry)
                    elif len(positionQuery) == 1:
                        positionQuery[0].userId = entrant.userId
                        positionQuery[0].tourneyId = tourneyId
                        positionQuery[0].productName = position.product
                        positionQuery[0].exchange = "FTX"
                        positionQuery[0].lastUpdated = position.lastUpdated
                        positionQuery[0].price = position.currentPrice
                        positionQuery[0].amountBought = position.amountBought
                        positionQuery[0].amountSold = position.amountSold
                        positionQuery[0].avgBuyPrice = position.avgBuyPrice
                        positionQuery[0].avgSellPrice = position.avgSellPrice
                        positionQuery[0].profit = position.profit
                        positionQuery[0].quoteCurrency = position.quoteCurrency
                        positionQuery[0].baseCurrency = position.baseCurrency
                        session.add(positionQuery[0])

                print("Total Profit: " + str(round(totalProfit, 9)))
                print("---------------------------------------------")
                # update the user's profit and profitPercent in entrants table
                entrant.profit = round(totalProfit, 9)
                entrant.profitPercent = round((totalProfit / entrant.balance) * 100, 4)
                if (entrant.balance + totalProfit) < 0:
                    entrant.liquidated = True
                    ts = datetime.datetime.now().timestamp()
                    entrant.liquidatedTS = ts
                session.add(entrant)

        # commit every tournament
        session.commit()

        # if the tournament has ended - check that we have all the trades for the full tournament time window
        if tournamentEnded == True and tournament.lastUpdated == tournament.endTS:
            print("ready to move to completed tourneys")

            # copy the tournament to CompletedTourneys
            dbEntry = CompletedTourneys(tourneyId=tourneyId, host=tournament.host, hostId=tournament.hostId, inviteCode=tournament.inviteCode, minEntrants=tournament.minEntrants, maxEntrants=tournament.maxEntrants, noEntrants=tournament.noEntrants, startTime=tournament.startTime, startDate=tournament.startDate, endTime=tournament.endTime, endDate=tournament.endDate, startTS=tournament.startTS, endTS=tournament.endTS, quoteCurrency=tournament.quoteCurrency, visibility=tournament.visibility)
            session.add(dbEntry)

             # get the list of products and copy the products to completed products table
            products = []
            for productQuery in session.query(ActiveProducts).filter_by(tourneyId=tourneyId).all():
                products.append({'name': productQuery.productName, 'exchange': productQuery.exchange})
                dbEntry = CompletedProducts(tourneyId=tourneyId, productName=productQuery.productName, exchange=productQuery.exchange, productType=productQuery.productType)
                session.add(dbEntry)

            # copy the entrants to CompletedEntrants
            for entrant in session.query(ActiveEntrants).filter_by(tourneyId=tourneyId).all():
                dbEntry = CompletedEntrants(tourneyId=tourneyId, userId=entrant.userId, username=entrant.username, profit=entrant.profit, profitPercent=entrant.profitPercent, balance=entrant.balance, liquidated=entrant.liquidated, liquidatedTS=entrant.liquidatedTS)
                session.add(dbEntry)

            # update the all tourneys table
            dbQuery = session.query(AllTourneys).filter_by(tourneyId=tourneyId).one()
            dbQuery.state = "completed"
            session.add(dbQuery)

            # delete the tournament from activeTourneys, which will delete from activeEntrants and activeProducts
            session.delete(tournament)
            session.commit()
    except ConnectionError as e:
        print(e)
        time.sleep(5)

session.close()
        
        