from init import db
from sqlalchemy.orm import sessionmaker
from models import ActiveTourneys, ActiveEntrants, ActiveProducts, CompletedTourneys, CompletedEntrants, Trades
import datetime

engine = db.engine
Session = sessionmaker(bind=engine)
session = Session()

tourneysReady = []

for query in session.query(ActiveTourneys).all():
    
    tourneyId = query.tourneyId
    
    startTS = query.startTS
    endTimestamp = query.endTS
    
    now = datetime.datetime.utcnow()
    nowTimestamp = now.timestamp()
    
    if endTimestamp - nowTimestamp < 0:
        print("tourney finished: " + str(tourneyId))
        
        # get the list of products
        products = []
        for query in session.query(ActiveProducts).filter_by(tourneyId=tournament).all():
                products.append({'name': query.productName, 'exchange': query.exchange})
        
        # copy the tournament to CompletedTourneys
        dbEntry = CompletedTourneys(tourneyId=query.tourneyId, host=query.host, hostId=query.hostId, maxEntrants=query.maxEntrants, noEntrants=query.noEntrants, startTime=query.startTime, startDate=query.startDate, endTime=query.endTime, endDate=query.endDate, startTS=query.startTS, endTS=query.endTS, status="active")
        session.add(dbEntry)
        
        # copy the entrants to CompletedEntrants
        for entrant in session.query(ActiveEntrants).filter_by(tourneyId=query.tourneyId).all():
            dbEntry = CompletedEntrants(tourneyId=query.tourneyId, userId=entrant.userId, username=entrant.username, totalInvested=entrant.totalInvested, totalValue=entrant.totalValue, profit=entrant.profit, timestamp=endTimestamp)
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
        
        # delete the tournament from activeTourneys, which will delete from activeEntrants and activeProducts
        session.delete(query)
        session.commit()
        
        
session.close()