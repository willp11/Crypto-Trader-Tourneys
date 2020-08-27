from init import db
from sqlalchemy.orm import sessionmaker
from models import RegistrationTourneys, Entrants, RegisteringProducts, ActiveTourneys, ActiveEntrants, ActiveProducts, AllTourneys
import datetime

engine = db.engine
Session = sessionmaker(bind=engine)

# Check the registrationTourneys table for tournaments starting the next hour
session = Session()

tourneysReady = []

for query in session.query(RegistrationTourneys).all():
    tourneyId = query.tourneyId
#    startDate = query.startDate
#    startTime = query.startTime
    
#    year = startDate[0:4]
#    month = startDate[5:7]
#    day = startDate[8:10]
#    hours = startTime[0:2]
#    minutes = startTime[3:5]
#    
#    startDateTime = datetime.datetime(int(year),int(month),int(day),int(hours),int(minutes))
#    print(startDateTime)
#    startTimestamp = startDateTime.timestamp()
    startTimestamp = query.startTS
    
    now = datetime.datetime.utcnow()
    print(now)
    nowTimestamp = now.timestamp()
    
    print(startTimestamp - nowTimestamp)
    
    if startTimestamp - nowTimestamp < 0:
        print("active tourney: " + str(tourneyId))
        
        # copy the tournament to ActiveTourneys
        dbEntry = ActiveTourneys(tourneyId=query.tourneyId, host=query.host, hostId=query.hostId, minEntrants=query.minEntrants, maxEntrants=query.maxEntrants, noEntrants=query.noEntrants, startTime=query.startTime, startDate=query.startDate, endTime=query.endTime, endDate=query.endDate, startTS=query.startTS, endTS=query.endTS, quoteCurrency=query.quoteCurrency, status="active", visibility=query.visibility, entryFee=query.entryFee)
        session.add(dbEntry)
        
        # copy the entrants to ActiveEntrants
        for entrant in session.query(Entrants).filter_by(tourneyId=query.tourneyId).all():
            dbEntry = ActiveEntrants(tourneyId=query.tourneyId, userId=entrant.userId, username=entrant.username, totalInvested=0.0, totalValue=0.0, profit=0.0, timestamp=startTimestamp, balance=entrant.balance)
            session.add(dbEntry)
        
        # copy the products to ActiveProducts
        for product in session.query(RegisteringProducts).filter_by(tourneyId=query.tourneyId).all():
            dbEntry = ActiveProducts(tourneyId=query.tourneyId, productName=product.productName, exchange=product.exchange, productType=product.productType)
            session.add(dbEntry)
            
        # update the all tourneys table
        dbQuery = session.query(AllTourneys).filter_by(tourneyId=query.tourneyId).one()
        dbQuery.state = "active"
        session.add(dbQuery)
        
        # delete the tournament from RegistrationTourneys, which will delete from entrants and products
        session.delete(query)
        

session.commit()    
session.close()

# Check the activeTourneys table for tournaments already started
#session = Session()
#
#tourneysActive = []
#
#for query in session.query(ActiveTourneys).all():
#    tourneyId = query.tourneyId
#    startDate = query.startDate
#    startTime = query.startTime
#    
#    year = startDate[0:4]
#    month = startDate[5:7]
#    day = startDate[8:10]
#    hours = startTime[0:2]
#    minutes = startTime[3:5]
#    
#    startDateTime = datetime.datetime(int(year),int(month),int(day),int(hours),int(minutes))
#    print(startDateTime)
#    startTimestamp = startDateTime.timestamp()
#    
#    now = datetime.datetime.utcnow()
#    print(now)
#    nowTimestamp = now.timestamp()
#    
#    print(startTimestamp - nowTimestamp)
#    
#    if startTimestamp - nowTimestamp <= 0:
#        print("active tourney: " + str(tourneyId))
#        
#        query.status = "active"
#        
#        session.add(query)
#        
#session.commit()    
#session.close()