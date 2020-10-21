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
        dbEntry = CompletedTourneys(tourneyId=query.tourneyId, host=query.host, hostId=query.hostId, inviteCode=query.inviteCode, minEntrants=query.minEntrants, maxEntrants=query.maxEntrants, noEntrants=query.noEntrants, startTime=query.startTime, startDate=query.startDate, endTime=query.endTime, endDate=query.endDate, startTS=query.startTS, endTS=query.endTS, quoteCurrency=query.quoteCurrency, visibility=query.visibility)
        session.add(dbEntry)
        
        # copy the entrants to CompletedEntrants
        for entrant in session.query(ActiveEntrants).filter_by(tourneyId=query.tourneyId).all():
            dbEntry = CompletedEntrants(tourneyId=query.tourneyId, userId=entrant.userId, username=entrant.username, profit=entrant.profit, profitPercent=entrant.profitPercent, balance=entrant.balance, liquidated=entrant.liquidated, liquidatedTS=entrant.liquidatedTS)
            session.add(dbEntry)
                    
        # update the all tourneys table
        dbQuery = session.query(AllTourneys).filter_by(tourneyId=query.tourneyId).one()
        dbQuery.state = "completed"
        session.add(dbQuery)
        
        # delete the tournament from activeTourneys, which will delete from activeEntrants and activeProducts
        session.delete(query)
        session.commit()
        
        
session.close()