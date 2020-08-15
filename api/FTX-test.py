import time
import hmac
import requests
from requests import Request, Session
import datetime
from init import db
from models import ProductList
from sqlalchemy.orm import sessionmaker

engine = db.engine
Session = sessionmaker(bind=engine)

API_key = 'mW4bIM9k5Fz-EnSotKhr-3WdXXbPaF6h_WKveN6z'
API_secret = 'ExCgCNok6eaQwCXMwfiohq5Yt580O3ef21ldyljI'

#string = "https://ftx.com/api/fills?market=MTA-PERP"
string = "https://ftx.com/api/markets"

ts = int(time.time() * 1000)

request = Request('GET', string)
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

results = res.json()['result']

session = Session()

for result in results:
    if result['type'] == "future":
        if result['name'][len(result['name'])-4:len(result['name'])] == "PERP": 
            dbEntry = ProductList(name=result['name'], exchange='FTX', productType=result['type'], baseCurrency=result['baseCurrency'],  quoteCurrency=result['quoteCurrency'])
            session.add(dbEntry)
    if result['type'] == "spot":
        dbEntry = ProductList(name=result['name'], exchange='FTX', productType=result['type'], baseCurrency=result['baseCurrency'],  quoteCurrency=result['quoteCurrency'])
        session.add(dbEntry)
        
session.commit()
session.close()
