import { ipfs, json } from "@graphprotocol/graph-ts";
import {
  MarketTokenMinted as MarketTokenMintedEvent,
  MarketTokenSold as MarketTokenSoldEvent,
} from "../generated/CSMarket/CSMarket";
import { MarketTokenMinted, MarketTokenSold, User } from "../generated/schema";
import { fetchERC721, fetchERC721Token } from "./fetch/erc721";
import { fetchAccount } from "@openzeppelin/subgraphs/src/fetch/account";

export function handleMarketTokenMinted(event: MarketTokenMintedEvent): void {
  let entity = new MarketTokenMinted(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  let seller = fetchAccount(event.params.seller);
  let owner = fetchAccount(event.params.owner);

  entity.itemId = event.params.itemId;
  entity.nftContract = event.params.nftContract;
  entity.tokenId = event.params.tokenId;
  entity.seller = event.params.seller;
  entity.owner = event.params.owner;
  entity.price = event.params.price;
  entity.sold = event.params.sold;

  // Add extra values to token fields.
  let contract = fetchERC721(event.params.nftContract);
  if (contract != null) {
    let token = fetchERC721Token(contract, event.params.tokenId);

    // Add price value.
    token.price = event.params.price;
    // Add seller ID (address)
    token.seller = seller.id;
    // Add createdAtTimestamp value.
    token.createdAtTimestamp = event.block.timestamp;
    // Add ownerUser value.
    token.ownerUser = owner.id;
    // Add creatorUser value.
    token.creatorUser = seller.id;

    /* Fetch the token metadata from Infura IPFS */
    let tokenUriProp = token.uri;
    let tokenUri: string = tokenUriProp ? tokenUriProp : "";

    // Get only the IPFS CID hash from URL string.
    let tokenIPFSHash = tokenUri.substring(tokenUri.lastIndexOf("/") + 1);
    if (!tokenIPFSHash) {
      tokenIPFSHash = "";
    }

    let metadata = ipfs.cat(tokenIPFSHash);
    if (metadata) {
      const value = json.fromBytes(metadata).toObject();
      if (value) {
        /* using the metatadata from IPFS, update the token object with the values  */
        const image = value.get("image");
        const name = value.get("name");
        const description = value.get("description");

        if (name && image && description) {
          token.name = name.toString();
          token.image = image.toString();
          token.description = description.toString();
        }
      }
    }

    contract.save();
    token.save();
  }

  // Add ownerUser if doesn't exists.
  let ownerUser = User.load(owner.id);
  if (!ownerUser) {
    ownerUser = new User(owner.id);
    ownerUser.save();
  }

  // Add creatorUser if doesn't exists.
  let creatorUser = User.load(seller.id);
  if (!creatorUser) {
    creatorUser = new User(seller.id);
    creatorUser.save();
  }

  entity.save();
}

export function handleMarketTokenSold(event: MarketTokenSoldEvent): void {
  let entity = new MarketTokenSold(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  let owner = fetchAccount(event.params.owner);

  entity.itemId = event.params.itemId;
  entity.nftContract = event.params.nftContract;
  entity.tokenId = event.params.tokenId;
  entity.seller = event.params.seller;
  entity.owner = event.params.owner;
  entity.price = event.params.price;
  entity.sold = event.params.sold;

  // Update some values in token fields.
  let contract = fetchERC721(event.params.nftContract);
  if (contract != null) {
    let token = fetchERC721Token(contract, event.params.tokenId);

    // Add soldAtTimestamp value.
    token.soldAtTimestamp = event.block.timestamp;
    // Update ownerUser value.
    token.ownerUser = owner.id;

    contract.save();
    token.save();
  }

  // Add ownerUser if doesn't exists.
  let ownerUser = User.load(owner.id);
  if (!ownerUser) {
    ownerUser = new User(owner.id);
    ownerUser.save();
  }

  entity.save();
}
