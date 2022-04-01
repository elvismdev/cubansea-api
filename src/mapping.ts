import {
  MarketTokenMinted as MarketTokenMintedEvent,
  MarketTokenSold as MarketTokenSoldEvent
} from "../generated/CSMarket/CSMarket"
import { MarketTokenMinted, MarketTokenSold } from "../generated/schema"

export function handleMarketTokenMinted(event: MarketTokenMintedEvent): void {
  let entity = new MarketTokenMinted(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.itemId = event.params.itemId
  entity.nftContract = event.params.nftContract
  entity.tokenId = event.params.tokenId
  entity.seller = event.params.seller
  entity.owner = event.params.owner
  entity.price = event.params.price
  entity.sold = event.params.sold
  entity.save()
}

export function handleMarketTokenSold(event: MarketTokenSoldEvent): void {
  let entity = new MarketTokenSold(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.itemId = event.params.itemId
  entity.nftContract = event.params.nftContract
  entity.tokenId = event.params.tokenId
  entity.seller = event.params.seller
  entity.owner = event.params.owner
  entity.price = event.params.price
  entity.sold = event.params.sold
  entity.save()
}
