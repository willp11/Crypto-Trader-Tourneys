from block_io import BlockIo
import requests

version = 2 # API version
block_io = BlockIo('4af8-390e-1344-93a7', '1budulike', version)

#print(block_io.get_new_address())

#print(block_io.get_balance())

#print(block_io.get_address_balance(addresses='2MvQJ71DxBR7w4yGQEu7DCew3U7uMxB6qaF'))

#print(block_io.create_notification(type='account', url='https%3A%2F%2Fwww.cryptotourneys.io%2Fapi%2FblockTest'))

#req = requests.get('https://www.cryptotourneys.io/api/blockTest')

print(block_io.disable_notification(notification_id='67f4e9da59ff6c43e59d96da'))