import datetime
import math

#date = datetime.datetime.fromtimestamp(math.floor(1597469289021/1000)).isoformat()
#date = datetime.datetime.fromtimestamp(1597441447).isoformat()

#arr = []
#
#tuple1 = ("will", 20)
#tuple2 = ("bill", 50)
#tuple3 = ("phil", 10)
#
#arr.append(tuple1)
#arr.append(tuple2)
#arr.append(tuple3)
#
#print(arr)
#
#arr = sorted(arr, key=lambda entrant: entrant[1], reverse=True)
#
#print(arr)

#entryFee = 1
#noEntrants = 25
#
#def calcPrizes(entryFee, noEntrants):
#    prizePool = entryFee * noEntrants
#    
#    # calculate how many entrants in the top 10%
#    paidEntrants = math.ceil(noEntrants * 0.1)
#    
#    # 1/3 of paid get their buy in back and 1/3 get 2x buy in
#    tier = 0
#    buyinBack = math.floor(paidEntrants/3)
#    print("tier: {2}, {0} entrants get {1}".format(buyinBack, entryFee, tier))
#    
#    tier = 1
#    doubleBuyinBack = math.floor(paidEntrants/3)
#    print("tier: {2}, {0} entrants get {1}".format(doubleBuyinBack, entryFee*3, tier))
#    
#    prizePool -= (buyinBack*entryFee + doubleBuyinBack*entryFee*3)
#    
#    remainingEntrants = paidEntrants - buyinBack - doubleBuyinBack
#    payout = entryFee*3
#    
#    while remainingEntrants > 0:
#        
#        tier += 1
#        #print(prizePool)
#        
#        if remainingEntrants == 1:
#            print("tier: {2}, {0} entrants get {1}".format(remainingEntrants, prizePool, tier))
#            remainingEntrants -= 1
#        else:
#            newPayouts = math.ceil(remainingEntrants/2)
#            payout = payout*2
#            print("tier: {2}, {0} entrants get {1}".format(newPayouts, payout, tier))
#
#            remainingEntrants = remainingEntrants - newPayouts
#
#            prizePool -= (newPayouts*payout)
#            
#
#calcPrizes(entryFee, noEntrants)

entryFee = 0.1
noEntrants = 36
prizePool = entryFee*noEntrants
tiers = []
# get total paid entrants
paidEntrants = math.ceil(noEntrants*0.1)

noTiers = math.floor(math.log2(paidEntrants) ) 
tier = 0

noTier = paidEntrants - 2**noTiers

#print("tier: {0}, noEntrants: {1}".format(tier, noTier))
tierObj = {"tier": tier, "noEntrants": noTier, "payout": entryFee}
tiers.append(tierObj)

paidEntrants -= noTier

while paidEntrants > 0:
    
    tier += 1
    noTier = math.ceil(paidEntrants/2)
    #print("tier: {0}, noEntrants: {1}".format(tier, noTier))
    tierObj = {"tier": tier, "noEntrants": noTier}
    tiers.append(tierObj)
    
    paidEntrants -= noTier

# give everyone in the first tier the initial buyin
# then divide the remainder by the number of tiers, give double to 1st place, then every tier gets the same, split between everyone in the tier
tierPayout = (prizePool - tiers[0]["noEntrants"] * tiers[0]["payout"]) / len(tiers)

for i in range(1, len(tiers)-1):
    tiers[i]["payout"] = round(tierPayout / tiers[i]["noEntrants"], 2)
    
tiers[len(tiers)-1]["payout"] = round(tierPayout*2, 2)

sumPayout = 0
for tier in tiers:
    sumPayout += tier["noEntrants"]*tier["payout"]

tiers[len(tiers)-1]["payout"] += (entryFee*noEntrants) - sumPayout

tiers[len(tiers)-1]["payout"] = round(tiers[len(tiers)-1]["payout"], 2)

payoutList = []

rank = 1
for i in range(len(tiers)-1, -1, -1):
    for j in range(tiers[i]["noEntrants"]):
        entrant = {"rank": rank, "payout": tiers[i]["payout"]}
        payoutList.append(entrant)
        rank += 1

for entrant in payoutList:
    print(entrant)

















