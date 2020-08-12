import ccxt
import datetime
from binance.client import Client
from init import db
from sqlalchemy.orm import sessionmaker
from models import ActiveTourneys, ActiveEntrants, ActiveProducts

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


binance = ccxt.binance({
    'apiKey': "APQ7CSj5WesK7n61jSa8zSWobWoB0chASN9o3raiVTcE064iVK1YgscmeIJ5ZDod",
    'secret': "oaYyrIkPV0HmFaRfvGArY0Tp3kl50PxXvWkUKTNv9BFemwBazjtWepFiasocijp7"
})

client = Client(api_key = "APQ7CSj5WesK7n61jSa8zSWobWoB0chASN9o3raiVTcE064iVK1YgscmeIJ5ZDod", api_secret="oaYyrIkPV0HmFaRfvGArY0Tp3kl50PxXvWkUKTNv9BFemwBazjtWepFiasocijp7")

# GET ALL ACTIVE TOURNAMENTS
session = Session()
activeTournaments = []
for query in session.query(ActiveTourneys).all():
    activeTournaments.append(query.tourneyId)
    
print(activeTournaments)

for tournament in activeTournaments:
    products = []
    for query in session.query(ActiveProducts).all():
        products.append({'name': query.productName, 'exchange': query.exchange})
    print(products)
        
    users = []
    for query in session.query(ActiveEntrants).filter_by(tourneyId=tournament).all():
        users.append(query.userId)
    print(users)
    
    for user in users:
        for product in products:
            if product.exchange == 'Binance':
                trades = client.get_margin_trades(symbol=product)
    
            if len(trades) > 0:
                position = Position(product, 0, 0, 0, 0, 0, 0, 0, 0)

                for trade in trades:

                    if trade['isBuyer'] == True:
                        side = 'buy'
                    else:
                        side = 'sell'

                    tradeQty = float(trade['qty'])
                    tradePrice = float(trade['price'])

                    if side == 'buy':
                        position.amountBought += tradeQty
                        if position.amountBought == tradeQty:
                            position.avgBuyPrice = tradePrice
                        else:
                            position.avgBuyPrice = position.avgBuyPrice + ((tradePrice-position.avgBuyPrice)*(tradeQty/position.amountBought))
                    elif side == 'sell':
                        position.amountSold += tradeQty
                        if position.amountSold == tradeQty:
                            position.avgSellPrice = tradePrice
                        else:
                            position.avgSellPrice = position.avgSellPrice + ((tradePrice-position.avgSellPrice)*(tradeQty/position.amountSold))   

                    position.sizeRemaining = position.amountBought - position.amountSold

                currentPrice = float(binance.fetchTicker('BTC/USDT')['bid'])
                position.value = (position.sizeRemaining*currentPrice) + (position.amountSold*position.avgSellPrice)
                position.invested = (position.amountBought * position.avgBuyPrice)
                if position.invested != 0:
                    position.profit = (position.value / position.invested) - 1

                positions.append(position)
                print(position.value, position.invested, position.profit)
                
        totalVal = 0
        totalInvested = 0
        for position in positions:
            totalVal += position.value
            totalInvested += position.invested
            totalBought += position.amountBought
            totalSold += position.amountSold
            
        totalProfit = (totalVal/totalInvested) - 1
        print(totalProfit)
        
        dbQuery = session.query(activeEntrants).filter_by(userId=user, tourneyId=tournament).one()
        dbQuery.totalInvested = totalSold
        dbQuery.totalValue = totalVal
        dbQuery.profit = totalProfit
        #dbQuery.timestamp = 
        session.add(dbQuery)
        session.commit()
    
session.close()

#productList = ['BTCUSDT', 'ETHUSDT']
#
#positions = []
#basePosition = {'product': '',
#                'amountBought': 0,
#                'amountSold': 0,
#                'avgBuyPrice': 0,
#                'avgSellPrice': 0,
#                'sizeRemaining': 0,
#                'value': 0,
#                'invested': 0,
#                'profit': 0
#               }

#for product in productList:
#    trades = client.get_margin_trades(symbol=product)
#    
#    if len(trades) > 0:
#        position = Position(product, 0, 0, 0, 0, 0, 0, 0, 0)
#
#        for trade in trades:
#
#            if trade['isBuyer'] == True:
#                side = 'buy'
#            else:
#                side = 'sell'
#
#            tradeQty = float(trade['qty'])
#            tradePrice = float(trade['price'])
#
#            #print(side, tradeQty, tradePrice)
#
#            if side == 'buy':
#                position.amountBought += tradeQty
#                if position.amountBought == tradeQty:
#                    position.avgBuyPrice = tradePrice
#                else:
#                    position.avgBuyPrice = position.avgBuyPrice + ((tradePrice-position.avgBuyPrice)*(tradeQty/position.amountBought))
#            elif side == 'sell':
#                position.amountSold += tradeQty
#                if position.amountSold == tradeQty:
#                    position.avgSellPrice = tradePrice
#                else:
#                    position.avgSellPrice = position.avgSellPrice + ((tradePrice-position.avgSellPrice)*(tradeQty/position.amountSold))   
#
#            position.sizeRemaining = position.amountBought - position.amountSold
#
#        currentPrice = float(binance.fetchTicker('BTC/USDT')['bid'])
#        position.value = (position.sizeRemaining*currentPrice) + (position.amountSold*position.avgSellPrice)
#        position.invested = (position.amountBought * position.avgBuyPrice)
#        if position.invested != 0:
#            position.profit = (position.value / position.invested) - 1
#
#        positions.append(position)
#        print(position.value, position.invested, position.profit)
#    
#totalVal = 0
#totalInvested = 0
#for position in positions:
#    totalVal += position.value
#    totalInvested += position.invested
#    
#totalProfit = (totalVal/totalInvested) - 1
#print(totalProfit)