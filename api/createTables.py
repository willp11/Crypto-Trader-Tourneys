from init import db
from models import RegistrationTourneys, Usernames, Entrants, UserAPI, RegisteringProducts, ActiveTourneys, ActiveEntrants, ActiveProducts
from sqlalchemy.orm import sessionmaker

engine = db.engine

Session = sessionmaker(bind=engine)
session = Session()

# delete a table
#Entrants.__table__.drop(engine)
#UserAPI.__table__.drop(engine)
#RegisteringProducts.__table__.drop(engine)
#RegistrationTourneys.__table__.drop(engine)
#Usernames.__table__.drop(engine)
#ActiveProducts.__table__.drop(engine)
ActiveEntrants.__table__.drop(engine)
#ActiveTourneys.__table__.drop(engine)
#session.commit()

# create a table 
#Usernames.__table__.create(session.bind)
#RegistrationTourneys.__table__.create(session.bind)
#RegisteringProducts.__table__.create(session.bind)
#UserAPI.__table__.create(session.bind)
#Entrants.__table__.create(session.bind)
#ActiveTourneys.__table__.create(session.bind)
ActiveEntrants.__table__.create(session.bind)
#ActiveProducts.__table__.create(session.bind)
#session.commit()

# add data to table
#dbEntry = RegistrationTourneys(tourneyId=487453599, host="will", hostId="cGLF6C4EsGdDDQBKvuw2vAaX3Wn1", maxEntrants=10, noEntrants=1, minEntrants=2, startDate="2020-06-01", startTime="12:00", endDate="2020-09-01", endTime="12:00")
#sdbEntry = Usernames(userId="cGLF6C4EsGdDDQBKvuw2vAaX3Wn1", username="will")
#session.add(dbEntry)
#session.commit()
#dbEntry = UserAPI(userId="cGLF6C4EsGdDDQBKvuw2vAaX3Wn1")
#session.add(dbEntry)
#session.commit()
dbEntry = ActiveEntrants(tourneyId=980262956 , userId="cGLF6C4EsGdDDQBKvuw2vAaX3Wn1", username="will", totalInvested=0.0, totalValue=0.0, profit=0.0)
session.add(dbEntry)
session.commit()

# query table
#dbQuery = session.query(RegistrationTourneys).all()
#
#tourneyInfo = {'id': dbQuery[0].tourneyId,
#            'host': dbQuery[0].host,
#            'startDate': dbQuery[0].startDate,
#            'startTime': dbQuery[0].startTime,
#            'endDate': dbQuery[0].endDate,
#            'endTime': dbQuery[0].endTime
#           }

# to delete, query the database first and save object in variable before deleting with session.delete()
#dbQuery = session.query(RegistrationTourneys).filter_by(tourneyId=1).one()
#session.delete(dbQuery)

#dbQuery = session.query(Usernames).filter_by(username="will").first()
#session.delete(dbQuery)
#session.commit()


session.close()


