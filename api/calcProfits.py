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

engine = db.engine
Session = sessionmaker(bind=engine)

session = Session()
        
for tournament in session.query(ActiveTourneys).all():
    
    # get the tournament Id and starting timestamp
    tourneyId = tournament.tourneyId
    
    print("tournament: " + str(tourneyId))
    
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

                openPositionFound = False

                # check if the user has already opened a position for that product
                for position in positions:
                    if position.product == trade.productName:
                        openPositionFound = True
                        positionToUpdate = position

                if openPositionFound:
                    position = positionToUpdate
                    # update the position object
                    if side == 'buy':
                        position.amountBought += quantity
                        position.avgBuyPrice = position.avgBuyPrice + ((price-position.avgBuyPrice)*(quantity/position.amountBought))
                    elif side == 'sell':
                        position.amountSold += quantity
                        position.avgSellPrice = position.avgSellPrice + ((price-position.avgSellPrice)*(quantity/position.amountSold))   

                    # calculate the size of the position still open, to calculate how much it is worth at current market price
                    position.sizeRemaining = position.amountBought - position.amountSold    
                    # get the current price of the product from FTX
                    string = "https://ftx.com/api/markets/" + product
                    res = requests.get(string)
                    bidPrice = res.json()['result']['bid']
                    askPrice = res.json()['result']['ask']
                    currentPrice = (float(bidPrice) + float(askPrice)) / 2

                    # calculate the value of the position
                    position.value = (position.sizeRemaining*currentPrice) + (position.amountSold*position.avgSellPrice)
                    position.invested = (position.amountBought * position.avgBuyPrice)
                    if position.invested != 0:
                        position.profit = position.value - position.invested

                else:
                    # create the new position object
                    position = Position(trade.productName,0,0,0,0,0,0,0,0)

                    if side == "buy":
                        position.amountBought += quantity
                        position.avgBuyPrice = price
                    elif side == "sell":
                        position.amountSold += quantity
                        position.avgSellPrice = price

                    # calculate the size of the position still open, to calculate how much it is worth at current market price
                    position.sizeRemaining = position.amountBought - position.amountSold    
                    # get the current price of the product from FTX
                    string = "https://ftx.com/api/markets/" + product
                    res = requests.get(string)
                    bidPrice = res.json()['result']['bid']
                    askPrice = res.json()['result']['ask']
                    currentPrice = (float(bidPrice) + float(askPrice)) / 2

                    # calculate the value of the position
                    position.value = (position.sizeRemaining*currentPrice) + (position.amountSold*position.avgSellPrice)
                    position.invested = (position.amountBought * position.avgBuyPrice)
                    if position.invested != 0:
                        position.profit = position.value - position.invested

                    positions.append(position)

            totalProfit = 0
            for position in positions:
                print(position.product, position.amountBought, position.amountSold, position.avgBuyPrice, position.avgSellPrice, position.sizeRemaining, position.value, position.invested, position.profit)
                totalProfit += position.profit

            # update the user's profit and profitPercent in entrants table
            entrant.profit = totalProfit
            entrant.profitPercent = round((totalProfit / entrant.balance) * 100, 2)
            if (entrant.balance + totalProfit) < 0:
                entrant.liquidated = True
            session.add(entrant)
    
    # commit every tournament
    session.commit()
        
session.close()
        
        