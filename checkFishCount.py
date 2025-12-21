import requests
import json
from datetime import datetime, timedelta

# 0x894263150587D6d8ab80C41f02F9b90B5B1a69bE

ACCOUNT = "0x0887dA058E31681C2befDaCaa17dBc339F47fE1D"
START_DATE = "2024-12-20T16:00:00.000Z"


# GraphQL endpoint
url = "http://api.evrloot.io:4350/graphql"

# Query string with rewardedNfts_some filter
query = """
query MyQuery($accountId: String!, $startTime: DateTime!) {
          playerMissions (where: {initiator: {rootowner_containsInsensitive: $accountId}, startTime_gte: $startTime}) {
            id
            rewardedResources {
              id
              amount
            }
            endingExperience
            rewardedNfts {
              amount
              contractAddress
              id
              itemId
            }
              mission {
                missionId
              }
            }
            trades (where: {ownerAddress_containsInsensitive: $accountId, startTime_gte: $startTime}, orderBy: startTime_DESC) {
              startTime
              ownerAddress
              id
              active
            }
            bids(where: {ownerAddress_containsInsensitive: $accountId, startTime_gte: $startTime}, orderBy: startTime_DESC) {
              id
              ownerAddress
              startTime
              erc1155s {
                amount
                contractAddress
                id
                tokenId
              }
              erc721s {
                contractAddress
                id
                tokenId
              }
            }
              orderEvents(
                orderBy: timestamp_DESC, 
                where: {
                  eventType_in: [OrderPartiallyFilled, OrderFilled]
                }
              ) {
                id
                eventType
                quantity
                timestamp
                trader
                unclaimedQuantity
                order {
                  filled
                  quantity
                  selling
                  tokenIds
                  trader
                  unclaimedQuantity
                  unitPrice
                  withdrawn
                  withdrawnByTrader
                  id
                }
                  orderGroup {
        itemId
      }
              }
          }
"""

# Example variables
variables = {
    "startTime": "2024-12-20T16:00:00.000Z",
    "accountId": "0x4A51D429030ebf02bD2FA29b788CfE2A29c0EC96",
    # "accountId": "0x0887dA058E31681C2befDaCaa17dBc339F47fE1D",
}

# HTTP headers
headers = {"Content-Type": "application/json"}

# POST request
response = requests.post(
    url, json={"query": query, "variables": variables}, headers=headers
)

# Check response
if response.status_code == 200:
    data = response.json()
    print(json.dumps(data["data"]["playerMissions"], indent=2))
else:
    print("Query failed:", response.status_code)
    print(response.text)
