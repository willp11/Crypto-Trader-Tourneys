import datetime
import math

#date = datetime.datetime.fromtimestamp(math.floor(1597469289021/1000)).isoformat()
#date = datetime.datetime.fromtimestamp(1597441447).isoformat()

arr = []

tuple1 = ("will", 20)
tuple2 = ("bill", 50)
tuple3 = ("phil", 10)

arr.append(tuple1)
arr.append(tuple2)
arr.append(tuple3)

print(arr)

arr = sorted(arr, key=lambda entrant: entrant[1], reverse=True)

print(arr)