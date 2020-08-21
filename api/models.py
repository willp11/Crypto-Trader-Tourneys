from init import db
from sqlalchemy.orm import relationship

class Usernames(db.Model):
    __tablename__ = "usernames"
    userId = db.Column(db.String(50), primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    entrants = relationship("Entrants", cascade="all, delete")
    activeEntrants = relationship("ActiveEntrants", cascade="all, delete")
    apis = relationship("UserAPI", cascade="all, delete")
    registerTourney = relationship("RegistrationTourneys", cascade="all, delete")
    
class ProductList(db.Model):
    __tablename__ = "productList"
    productId = db.Column(db.Integer, primary_key=True)
    exchange = db.Column(db.String(16), nullable=False)
    name = db.Column(db.String(16), nullable=False)
    productType = db.Column(db.String(16), nullable=False)
    baseCurrency = db.Column(db.String(16), nullable=True)
    quoteCurrency = db.Column(db.String(16), nullable=True)
    
class AllTourneys(db.Model):
    __tablename__ = "allTourneys"
    tourneyId = db.Column(db.Integer, primary_key=True)
    state = db.Column(db.String(16), nullable=False)

class RegistrationTourneys(db.Model):
    __tablename__ = "registrationTourneys"
    tourneyId = db.Column(db.Integer, primary_key=True)
    host = db.Column(db.String(100), nullable=False)
    hostId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), nullable=False)
    maxEntrants = db.Column(db.Integer, nullable=False)
    minEntrants = db.Column(db.Integer, nullable=False)
    noEntrants = db.Column(db.Integer, nullable=False)
    startDate = db.Column(db.String(16), nullable=False)
    startTime = db.Column(db.String(16), nullable=False)
    endDate = db.Column(db.String(16), nullable=False)
    endTime = db.Column(db.String(16), nullable=False)
    startTS = db.Column(db.Integer, nullable=False)
    endTS = db.Column(db.Integer, nullable=False)
    quoteCurrency = db.Column(db.String(16), nullable=False)
    entrants = relationship("Entrants", cascade="all, delete")
    products = relationship("RegisteringProducts", cascade="all, delete")
    
class Entrants(db.Model):
    __tablename__ = "entrants"
    entrantId = db.Column(db.Integer, primary_key=True)
    tourneyId = db.Column(db.Integer, db.ForeignKey('registrationTourneys.tourneyId'), nullable=False)
    userId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    balance = db.Column(db.Float, nullable=False)
    
class RegisteringProducts(db.Model):
    __tablename__ = "registeringProducts"
    productId = db.Column(db.Integer, primary_key=True)
    tourneyId = db.Column(db.Integer, db.ForeignKey('registrationTourneys.tourneyId'), nullable=False)
    productName = db.Column(db.String(20), nullable=False)
    exchange = db.Column(db.String(20), nullable=False)
    productType = db.Column(db.String(16), nullable=False)
    
class UserAPI(db.Model):
    __tablename__ = "userAPI"
    userId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), primary_key=True, nullable=False)
    API1 = db.Column(db.String(50), nullable=True)
    API2 = db.Column(db.String(50), nullable=True)
    API3 = db.Column(db.String(50), nullable=True)
    
class ActiveTourneys(db.Model):
    __tablename__ = "activeTourneys"
    tourneyId = db.Column(db.Integer, primary_key=True)
    host = db.Column(db.String(100), nullable=False)
    hostId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), nullable=False)
    maxEntrants = db.Column(db.Integer, nullable=False)
    noEntrants = db.Column(db.Integer, nullable=False)
    startDate = db.Column(db.String(16), nullable=False)
    startTime = db.Column(db.String(16), nullable=False)
    endDate = db.Column(db.String(16), nullable=False)
    endTime = db.Column(db.String(16), nullable=False)
    startTS = db.Column(db.Integer, nullable=False)
    endTS = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(16), nullable=False)
    quoteCurrency = db.Column(db.String(16), nullable=False)
    entrants = relationship("ActiveEntrants", cascade="all, delete")
    products = relationship("ActiveProducts", cascade="all, delete")
    
class ActiveEntrants(db.Model):
    __tablename__ = "activeEntrants"
    entrantId = db.Column(db.Integer, primary_key=True)
    tourneyId = db.Column(db.Integer, db.ForeignKey('activeTourneys.tourneyId'), nullable=False)
    userId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    totalInvested = db.Column(db.Float, nullable=False)
    totalValue = db.Column(db.Float, nullable=False)
    profit = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.Integer, nullable=True)
    balance = db.Column(db.Float, nullable=False)
    
class ActiveProducts(db.Model):
    __tablename__ = "activeProducts"
    productId = db.Column(db.Integer, primary_key=True)
    tourneyId = db.Column(db.Integer, db.ForeignKey('activeTourneys.tourneyId'), nullable=False)
    productName = db.Column(db.String(20), nullable=False)
    exchange = db.Column(db.String(20), nullable=False)
    productType = db.Column(db.String(16), nullable=False)
    
class Trades(db.Model):
    __tablename__ = "trades"
    tradeId = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.String(50), nullable=False)
    tourneyId = db.Column(db.Integer, nullable=False)
    productName = db.Column(db.String(16), nullable=False)
    exchange = db.Column(db.String(16), nullable=False)
    side = db.Column(db.String(16), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    price = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.BigInteger, nullable=False)
    
class CompletedTourneys(db.Model):
    __tablename__ = "completedTourneys"
    tourneyId = db.Column(db.Integer, primary_key=True)
    host = db.Column(db.String(100), nullable=False)
    hostId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), nullable=False)
    maxEntrants = db.Column(db.Integer, nullable=False)
    noEntrants = db.Column(db.Integer, nullable=False)
    startDate = db.Column(db.String(16), nullable=False)
    startTime = db.Column(db.String(16), nullable=False)
    endDate = db.Column(db.String(16), nullable=False)
    endTime = db.Column(db.String(16), nullable=False)
    startTS = db.Column(db.Integer, nullable=False)
    endTS = db.Column(db.Integer, nullable=False)
    quoteCurrency = db.Column(db.String(16), nullable=False)
    products = relationship("CompletedProducts", cascade="all, delete")
    
class CompletedEntrants(db.Model):
    __tablename__ = "completedEntrants"
    entrantId = db.Column(db.Integer, primary_key=True)
    tourneyId = db.Column(db.Integer, nullable=False)
    userId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    totalInvested = db.Column(db.Float, nullable=False)
    totalValue = db.Column(db.Float, nullable=False)
    profit = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.Integer, nullable=True)
    balance = db.Column(db.Float, nullable=False)
    
class CompletedProducts(db.Model):
    __tablename__ = "completedProducts"
    productId = db.Column(db.Integer, primary_key=True)
    tourneyId = db.Column(db.Integer, db.ForeignKey('completedTourneys.tourneyId'), nullable=False)
    productName = db.Column(db.String(20), nullable=False)
    exchange = db.Column(db.String(20), nullable=False)
    productType = db.Column(db.String(16), nullable=False)