from init import db
from sqlalchemy.orm import relationship

class Usernames(db.Model):
    __tablename__ = "usernames"
    userId = db.Column(db.String(50), primary_key=True)
    username = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    entrants = relationship("Entrants", cascade="all, delete")
    activeEntrants = relationship("ActiveEntrants", cascade="all, delete")
    apis = relationship("UserAPI", cascade="all, delete")
    registerTourney = relationship("RegistrationTourneys", cascade="all, delete")
    balances = relationship("AccountBalances", cascade="all, delete")
    
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
    hostId = db.Column(db.String(50), nullable=False)

class RegistrationTourneys(db.Model):
    __tablename__ = "registrationTourneys"
    tourneyId = db.Column(db.Integer, primary_key=True)
    host = db.Column(db.String(100), nullable=False)
    hostId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), nullable=False)
    inviteCode = db.Column(db.String(50), nullable=False)
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
    visibility = db.Column(db.String(16), nullable=False)
    entrants = relationship("Entrants", cascade="all, delete")
    products = relationship("RegisteringProducts", cascade="all, delete")
    invitations = relationship("TourneyInvites", cascade="all, delete")
    
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
    FTXKey = db.Column(db.String(50), nullable=True)
    FTXSecret = db.Column(db.String(50), nullable=True)
    
class ActiveTourneys(db.Model):
    __tablename__ = "activeTourneys"
    tourneyId = db.Column(db.Integer, primary_key=True)
    host = db.Column(db.String(100), nullable=False)
    hostId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), nullable=False)
    inviteCode = db.Column(db.String(50), nullable=False)
    minEntrants = db.Column(db.Integer, nullable=False)
    maxEntrants = db.Column(db.Integer, nullable=False)
    noEntrants = db.Column(db.Integer, nullable=False)
    startDate = db.Column(db.String(16), nullable=False)
    startTime = db.Column(db.String(16), nullable=False)
    endDate = db.Column(db.String(16), nullable=False)
    endTime = db.Column(db.String(16), nullable=False)
    startTS = db.Column(db.Integer, nullable=False)
    endTS = db.Column(db.Integer, nullable=False)
    quoteCurrency = db.Column(db.String(16), nullable=False)
    visibility = db.Column(db.String(16), nullable=False)
    lastUpdated = db.Column(db.Integer, nullable=True)
    entrants = relationship("ActiveEntrants", cascade="all, delete")
    products = relationship("ActiveProducts", cascade="all, delete")
    
class ActiveEntrants(db.Model):
    __tablename__ = "activeEntrants"
    entrantId = db.Column(db.Integer, primary_key=True)
    tourneyId = db.Column(db.Integer, db.ForeignKey('activeTourneys.tourneyId'), nullable=False)
    userId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    profit = db.Column(db.Float, nullable=False)
    profitPercent = db.Column(db.Float, nullable=False)
    balance = db.Column(db.Float, nullable=False)
    liquidated = db.Column(db.Boolean, nullable=False)
    
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
    date = db.Column(db.String(16), nullable=False)
    time = db.Column(db.String(16), nullable=False)
    
class CompletedTourneys(db.Model):
    __tablename__ = "completedTourneys"
    tourneyId = db.Column(db.Integer, primary_key=True)
    host = db.Column(db.String(100), nullable=False)
    hostId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), nullable=False)
    inviteCode = db.Column(db.String(50), nullable=False)
    minEntrants = db.Column(db.Integer, nullable=False)
    maxEntrants = db.Column(db.Integer, nullable=False)
    noEntrants = db.Column(db.Integer, nullable=False)
    startDate = db.Column(db.String(16), nullable=False)
    startTime = db.Column(db.String(16), nullable=False)
    endDate = db.Column(db.String(16), nullable=False)
    endTime = db.Column(db.String(16), nullable=False)
    startTS = db.Column(db.Integer, nullable=False)
    endTS = db.Column(db.Integer, nullable=False)
    quoteCurrency = db.Column(db.String(16), nullable=False)
    visibility = db.Column(db.String(16), nullable=False)
    entrants = relationship("CompletedEntrants", cascade="all, delete")
    products = relationship("CompletedProducts", cascade="all, delete")
    
class CompletedEntrants(db.Model):
    __tablename__ = "completedEntrants"
    entrantId = db.Column(db.Integer, primary_key=True)
    tourneyId = db.Column(db.Integer, db.ForeignKey('completedTourneys.tourneyId'), nullable=False)
    userId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    profit = db.Column(db.Float, nullable=False)
    profitPercent = db.Column(db.Float, nullable=False)
    balance = db.Column(db.Float, nullable=False)
    
class CompletedProducts(db.Model):
    __tablename__ = "completedProducts"
    productId = db.Column(db.Integer, primary_key=True)
    tourneyId = db.Column(db.Integer, db.ForeignKey('completedTourneys.tourneyId'), nullable=False)
    productName = db.Column(db.String(20), nullable=False)
    exchange = db.Column(db.String(20), nullable=False)
    productType = db.Column(db.String(16), nullable=False)
    
class TourneyInvites(db.Model):
    __tablename__ = "tourneyInvites"
    inviteId = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.String(50), nullable=False)
    tourneyId = db.Column(db.Integer, db.ForeignKey('registrationTourneys.tourneyId'), nullable=False)
    host = db.Column(db.String(100), nullable=False)
    
class AccountBalances(db.Model):
    __tablename__ = "accountBalances"
    userId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), primary_key=True)
    balance = db.Column(db.Float, nullable=False)
    
class DepositWithdrawHistory(db.Model):
    __tablename__ = "depositWithdrawHistory"
    transactionId = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.String(50), db.ForeignKey('usernames.userId'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    txHash = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(16), nullable=False)
    noConfirmations = db.Column(db.Integer, nullable=False)
    
class PayoutsCustomProvisional(db.Model):
    __tablename__ = "payoutsCustomProvisional"
    payoutId = db.Column(db.Integer, primary_key=True)
    tourneyId = db.Column(db.Integer, nullable=False)
    rank = db.Column(db.Integer, nullable=False)
    payoutPercent = db.Column(db.Float, nullable=False)
    
    
    
    
    
    
    