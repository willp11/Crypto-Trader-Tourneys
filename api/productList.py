import ccxt
from init import db
from models import ProductList
from sqlalchemy.orm import sessionmaker

engine = db.engine
Session = sessionmaker(bind=engine)

binance = ccxt.binance({
    'apiKey': "APQ7CSj5WesK7n61jSa8zSWobWoB0chASN9o3raiVTcE064iVK1YgscmeIJ5ZDod",
    'secret': "oaYyrIkPV0HmFaRfvGArY0Tp3kl50PxXvWkUKTNv9BFemwBazjtWepFiasocijp7"
})

markets = binance.load_markets()

session = Session()

ProductList.__table__.drop(engine)
ProductList.__table__.create(session.bind)

products= []

for key in markets.keys():
    products.append(key)
    
marketsList = []
    
for product in products:
    productObj = {'symbol': product,
                    'spot': markets[product]['spot'],
                    'margin': markets[product]['margin']}
    marketsList.append(productObj)
    
btcMarkets = []
usdtMarkets = []

for market in marketsList:
    if market['symbol'][len(market['symbol'])-3:len(market['symbol'])] == 'BTC':
        btcMarkets.append(market)
        dbEntry = ProductList(symbol=market['symbol'], exchange='Binance', spot=market['spot'], margin=market['margin'], baseSymbol='BTC')
        session.add(dbEntry)
    elif market['symbol'][len(market['symbol'])-4:len(market['symbol'])] == 'USDT':
        usdtMarkets.append(market)
        dbEntry = ProductList(symbol=market['symbol'], exchange='Binance', spot=market['spot'], margin=market['margin'], baseSymbol='USDT')
        session.add(dbEntry)
        
session.commit()
session.close()
