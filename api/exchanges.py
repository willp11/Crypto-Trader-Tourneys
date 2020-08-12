import ccxt
import datetime
from binance.client import Client

binance = ccxt.binance({
    'apiKey': "APQ7CSj5WesK7n61jSa8zSWobWoB0chASN9o3raiVTcE064iVK1YgscmeIJ5ZDod",
    'secret': "oaYyrIkPV0HmFaRfvGArY0Tp3kl50PxXvWkUKTNv9BFemwBazjtWepFiasocijp7"
})

client = Client(api_key = "APQ7CSj5WesK7n61jSa8zSWobWoB0chASN9o3raiVTcE064iVK1YgscmeIJ5ZDod", api_secret="oaYyrIkPV0HmFaRfvGArY0Tp3kl50PxXvWkUKTNv9BFemwBazjtWepFiasocijp7")

## Get all binance markets

#markets = binance.load_markets()
#products= []
#
#for key in markets.keys():
#    products.append(key)
#    
#marketsList = []
#    
#for product in products:
#    productObj = {'symbol': product,
#                    'spot': markets[product]['spot'],
#                    'margin': markets[product]['margin']}
#    marketsList.append(productObj)
#    
#btcMarkets = []
#usdtMarkets = []
#
#for market in marketsList:
#    if market['symbol'][len(market['symbol'])-3:len(market['symbol'])] == 'BTC':
#        btcMarkets.append(market)
#    elif market['symbol'][len(market['symbol'])-4:len(market['symbol'])] == 'USDT':
#        usdtMarkets.append(market)
#        
#for market in usdtMarkets:
#    print(market)

#for market in markets:
#    print(market)

#######################################################################################

# Binance timestamps do not match python timestamp
# function to get the timestamp given a trade object
#def getBinanceTs(trade):
#    tradeDt = trade['datetime'][0:10]+ ' ' + trade['datetime'][11:16]
#    tradeTs =  datetime.datetime.strptime(tradeDt, '%Y-%m-%d %H:%M').timestamp()
#    return tradeTs

# ALGORITHM - INPUT LIST OF TRADES -> OUTPUT LIST OF POSITIONS WITH PROFIT, VALUE AND INVESTED VALUES

#startTs = datetime.datetime(2017,3,23,4,41).timestamp()
#print(startTs)
#
##trades = binance.fetchMyTrades(symbol = "BTC/USDT")
#
#trades = client.get_margin_trades(symbol='BTCUSDT')
#
#buyAmtQuote = 0
#sellAmtQuote = 0
#buyAmt= 0
#sellAmt = 0
#
#currentPosition = 0
#avgBuyPrice = 0
#
#avgSellPrice = 0
#currentSold = 0
#
#positions = []
#basePosition = {'side': 'long',
#            'size': 0,
#            'amountBought': 0,
#            'amountSold': 0,
#            'avgBuyPrice': 0,
#            'avgSellPrice': 0}
#
#position = basePosition
#
#for trade in trades:
#
#    #if getBinanceTs(trade) > startTs:
#    
#    # trade side
#    #side = trade['side']
#    if trade['isBuyer'] == True:
#        side = 'buy'
#    else:
#        side = 'sell'
#    
#    #BTC qty (or if ETH/BTC, ETH qty)
#    #tradeQtyBase = float(trade['info']['qty'])
#    tradeQtyBase = float(trade['qty'])
#    #USDT qty (or if ETH/BTC, BTC qty)
#    #tradeQtyQuote = float(trade['info']['quoteQty'])
#    #price
#    #tradePrice = float(trade['info']['price'])
#    tradePrice = float(trade['price'])
#
#    print(tradeQtyBase, tradePrice)
#
#    if side == 'buy':
#        # add the amount bought to the current position size
#        position['size'] += tradeQtyBase
#
#        # if its first buy, then trade price is the avg buy price. Else, calculate the avg buy price
#        if position['size'] == tradeQtyBase:
#            position['avgBuyPrice'] = tradePrice
#        else:
#            position['avgBuyPrice'] = position['avgBuyPrice'] + ((tradePrice-position['avgBuyPrice'])*(tradeQtyBase/position['size']))
#
#        position['amountBought'] += tradeQtyBase
#        print(position)
#    if side == 'sell':
#        # if no long position is already open, do nothing
#        if position['size'] != 0:
#            # if nothing had already been sold and the trade qty > current position, then the position is fully closed at avg sell price = trade price
#            if position['amountSold'] == 0 and tradeQtyBase > position['size']:
#                position['size'] = 0
#                position['avgSellPrice'] = tradePrice
#                positions.append(position)
#                position = basePosition
#            # if nothing had already been sold and the trade qty < current position, then the position is partially closed at avg sell price = trade price, update current sold quantity
#            elif position['amountSold'] == 0 and tradeQtyBase < position['size']:
#                position['size'] -= tradeQtyBase
#                position['avgSellPrice'] = tradePrice
#                position['amountSold'] += tradeQtyBase
#            # if something is already sold and trade qty < current position, need to calculate the avg sell price and update position['size]
#            elif position['amountSold'] > 0 and tradeQtyBase < position['size']:
#                position['amountSold'] += tradeQtyBase
#                position['avgSellPrice'] = position['avgSellPrice'] + ((tradePrice-position['avgSellPrice'])*(tradeQtyBase/(position['amountSold'])))
#                position['size'] -= tradeQtyBase
#            # if something is already sold and trade qty > current position, need to calculate the avg sell price and close position
#            elif position['amountSold'] > 0 and tradeQtyBase < position['size']:
#                position['amountSold'] -= tradeQtyBase
#                position['avgSellPrice'] = position['avgSellPrice'] + ((tradePrice-position['avgSellPrice'])*(tradeQtyBase/(position['amountSold'])))
#                position['size'] = 0       
#                positions.append(position)
#                position = basePosition
#            print(position)
#    
#positions.append(position)
#
#for position in positions:
#    # check its not a brand new position
#    if position['amountBought'] != 0:
#        
#        currentPrice = float(binance.fetchTicker('BTC/USDT')['bid'])
#        position['value'] = (position['size']*currentPrice) + (position['amountSold']*position['avgSellPrice'])
#        position['invested'] = (position['amountBought'] * position['avgBuyPrice'])
#        position['profit'] = (position['value'] / position['invested']) - 1
#             
#    print(position)

productList = ['BTCUSDT', 'ETHUSDT']
positions = []
basePosition = {'product': '',
                'amountBought': 0,
                'amountSold': 0,
                'avgBuyPrice': 0,
                'avgSellPrice': 0,
                'sizeRemaining': 0,
                'value': 0,
                'invested': 0,
                'profit': 0
               }

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

for product in productList:
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

            #print(side, tradeQty, tradePrice)

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
    
totalProfit = (totalVal/totalInvested) - 1
print(totalProfit)


# API METHOD INFO
    
#print(binance.load_markets())

#print(binance.fetchBalance())

#print(binance.has)

#bidPrice = float(binance.fetchTicker('BTC/USDT')['bid'])
#askPrice = float(binance.fetchTicker('BTC/USDT')['ask'])

#binance.fetchMyTrades(symbol = "BTC/USDT", since = undefined, limit = undefined, params = {})


