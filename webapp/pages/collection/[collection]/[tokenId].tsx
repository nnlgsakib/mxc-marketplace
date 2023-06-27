import React, { useState, useEffect } from "react"

import {
  useContractWrite,
  useContract,
  useContractRead,
  useAddress,
  Web3Button,
} from "@thirdweb-dev/react"

import { useRouter } from "next/router"
import { Toaster } from "react-hot-toast"
import { ABI, CONTRACTS_MAP } from "@/const/Network"
import Container from "@/components/Container/Container"
import randomColor from "@/util/randomColor"
import Link from "next/link"
import { BigNumber, ethers } from "ethers"
import { zeroAddress } from "viem"
import Skeleton from "@/components/Skeleton/Skeleton"
import PriceInput from "@/components/PriceInput"
import { toast } from "react-toastify"
import Image from "@/components/Image"
import defaultPng from "@/assets/placeholder.png"
import { getNFTDetail, getCollectInfo } from "@/util/getNFT"

const [randomColor1, randomColor2] = [randomColor(), randomColor()]

export default function TokenPage() {
  const [collectionDta, setCollectionDta] = useState<any>(null)
  const [nft, SetNFT] = useState<any>({ metadata: {}, owner: null })
  const [nftPrice, setNftPrice] = useState<BigNumber>(BigNumber.from(0))
  const [inputPrice, setInputPrice] = useState<any>("")
  const router = useRouter()
  const address = useAddress() || zeroAddress

  const { collection = zeroAddress, tokenId = "0" } = router.query as {
    tokenId: string
    collection: string
  }

  // get collection info
  const { contract: factoryContract } = useContract(
    CONTRACTS_MAP.COLLECTION_FACTORY,
    ABI.collectionFactory
  )
  const { data: collectionInfo } = useContractRead(
    factoryContract,
    "fetchCollection",
    [collection]
  )

  // get nft info
  const { contract: nftContract } = useContract(collection, ABI.collection)
  const { data: isApproved } = useContractRead(nftContract, "getApproved", [
    tokenId,
  ])
  const { data: isApprovedForAll } = useContractRead(
    nftContract,
    "isApprovedForAll",
    [collectionInfo?.owner || zeroAddress, CONTRACTS_MAP.MARKETPLACE]
  )
  const { mutateAsync: setApprovalForAll } = useContractWrite(
    nftContract,
    "setApprovalForAll"
  )

  // get market info
  const { contract: mkpContract } = useContract(
    CONTRACTS_MAP.MARKETPLACE,
    ABI.marketplace
  )
  const { data: mkp_info, isLoading: mkpLoading } = useContractRead(
    mkpContract,
    "orderByAssetId",
    [collection, tokenId]
  )
  const { mutateAsync: createOrder } = useContractWrite(
    mkpContract,
    "createOrder"
  )
  const { mutateAsync: cancelOrder } = useContractWrite(
    mkpContract,
    "cancelOrder"
  )
  const { mutateAsync: executeOrder } = useContractWrite(
    mkpContract,
    "executeOrder"
  )

  useEffect(() => {
    const fetchData = async () => {
      if (!tokenId || !collectionInfo || !collectionInfo.ipfs) {
        return
      }

      let id = tokenId as string
      let nft = await getNFTDetail(collection, id)
      SetNFT(nft)

      try {
        // let ipfsObject = (await getJsonFromIPFS(collectionInfo.ipfs)) || {}
        // let nwData = Object.assign({}, ipfsObject, {
        //   collection: collectionInfo.collection,
        //   owner: collectionInfo.owner,
        // })
        // setCollectionDta(nwData)
        let nwData = await getCollectInfo(collectionInfo)
        setCollectionDta(nwData)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [tokenId, collectionInfo])

  useEffect(() => {
    if (!mkp_info) {
      return
    }
    let { expiresAt, price, seller } = mkp_info
    setNftPrice(price)
  }, [mkp_info])

  const clickAttr = async (item: any) => {
    // if (item.trait_type == "Location Proofs") {
    //   const contract = new ethers.Contract(
    //     MEP1004ContractAddr,
    //     mep1004abi,
    //     provider
    //   )
    //   let { MEP1002TokenId } = await contract.latestLocationProofs(tokenId)
    //   let hexId = MEP1002TokenId._hex.replace("0x", "")
    //   window.open(
    //     `https://wannsee-explorer.mxc.com/mapper?hexid=${hexId}`,
    //     "_blank"
    //   )
    // }
  }

  const getAttrCss = (item: any) => {
    if (item.trait_type == "Location Proofs") {
      return "csp"
    }
    return ""
  }

  const approveForSale = async () => {
    if (nft.owner !== address) {
      toast.warn("You are not the nft owner.")
      return
    }

    let txResult
    try {
      txResult = await setApprovalForAll({
        args: [CONTRACTS_MAP.MARKETPLACE, true],
      })
      toast.success("Approve successfully. Now you can List for sale!")
    } catch (error) {
      // console.error(error)
      console.log(error)
      toast.error(`Approve for sale failed`)
    }

    return txResult
  }

  const listForSale = async () => {
    if (!nftPrice.eq(0)) {
      toast.warn("This NFT not for sale.")
      return
    }
    if (nft.owner !== address) {
      toast.warn("You are not the nft owner.")
      return
    }
    if (!inputPrice || parseFloat(inputPrice) == 0) {
      toast.warn("Please input your nft price.")
      return
    }

    let date = new Date()
    date.setMonth(date.getMonth() + 6)
    let expiresAt = Math.floor(date.getTime() / 1000)

    let txResult
    try {
      // Simple one-liner for buying the NFT
      txResult = await createOrder({
        args: [
          collection,
          tokenId,
          ethers.utils.parseEther(inputPrice),
          expiresAt,
        ],
      })
      toast.success("List for sale successfully!")
    } catch (error) {
      // console.error(error)
      console.log(error)
      toast.error(`List for sale failed`)
    }

    return txResult
  }

  const cancelMakeOrder = async () => {
    if (nft.owner !== address) {
      toast.warn("You are not the nft owner.")
      return
    }
    let txResult
    try {
      // Simple one-liner for buying the NFT
      txResult = await cancelOrder({
        args: [collection, tokenId],
      })
      toast.success("Cancel list for sale successfully!")
    } catch (error) {
      // console.error(error)
      console.log(error)
      toast.error(`Cancel list for sale failed`)
    }

    return txResult
  }

  const buyMakeOrder = async () => {
    if (nft.owner == address) {
      toast.warn("You cannot buy your self nft.")
      return
    }
    let txResult
    try {
      // Simple one-liner for buying the NFT
      txResult = await executeOrder({
        args: [collection, tokenId],
        overrides: {
          value: nftPrice,
        },
      })
      toast.success("Purchase success!")
    } catch (error) {
      console.log(error)
      toast.error(`Purchase failed`)
    }

    return txResult
  }

  return (
    <div className="nft_detail">
      <Toaster position="bottom-center" reverseOrder={false} />
      {nft.owner ? (
        <Container maxWidth="lg">
          <div className="container">
            <div className="metadataContainer">
              <div className="token_image">
                <Image src={nft.image} defaultImage={defaultPng.src} alt="" />
              </div>
              <h3 className="descriptionTitle">Description</h3>
              <p className="description">{nft.metadata.description}</p>

              <h3 className="descriptionTitle">Traits</h3>
              <div className="traitsContainer">
                {nft?.metadata?.attributes.map((item: any, index: number) => (
                  <div
                    onClick={() => clickAttr(item)}
                    className={`traitContainer ${getAttrCss(item)}`}
                    key={index}
                  >
                    <p className="traitName text-xs">{item.trait_type}</p>
                    <p className="traitValue text-sm">
                      {item.value?.toString() || ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="listingContainer">
              {collectionDta && (
                <div className="flexbox">
                  <div className="collectionImg">
                    <Image
                      src={collectionDta.cover}
                      defaultImage={defaultPng.src}
                      alt=""
                    />
                  </div>

                  <div className="collectionName text-base">
                    {collectionDta.name}
                  </div>
                </div>
              )}
              <div className="title">
                {nft.metadata.name}
                <div> Token ID #{nft.metadata.id}</div>
              </div>

              <div className="owner">
                <Link
                  href={`/profile/${nft.owner}`}
                  className="nftOwnerContainer"
                >
                  <div
                    className="nftOwnerImage"
                    style={{
                      background: `linear-gradient(90deg, ${randomColor1}, ${randomColor2})`,
                    }}
                  />
                  <div className="nftOwnerInfo">
                    <p className="label">Current Owner</p>
                    <p className="nftOwnerAddress">
                      {nft.owner.slice(0, 8)}...
                      {nft.owner.slice(-4)}
                    </p>
                  </div>
                </Link>
              </div>

              <div className="pricingContainer">
                <div className="pricingInfo">
                  <p>Price</p>
                  <div className="pricingValue">
                    {mkpLoading ? (
                      <Skeleton width="120" height="24" />
                    ) : (
                      <>
                        {!nftPrice.eq(0) ? (
                          <>
                            {ethers.utils.formatEther(nftPrice)}
                            {"  MXC"}
                          </>
                        ) : (
                          "Not for sale"
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {address !== zeroAddress &&
              nft.owner == address &&
              nftPrice.eq(0) ? (
                <div className="sell_info">
                  <h4 className="formSectionTitle">Price </h4>

                  <PriceInput
                    className="input"
                    placeholder="NFT Price"
                    decimals={8}
                    value={"" + inputPrice}
                    onChange={(val: any) => setInputPrice(val)}
                  />

                  {isApproved &&
                  isApproved !== CONTRACTS_MAP.MARKETPLACE &&
                  !isApprovedForAll ? (
                    <Web3Button
                      contractAddress={collection}
                      contractAbi={ABI.collection}
                      action={async () => await approveForSale()}
                      className="list_btn"
                    >
                      Approve item for marketplace
                    </Web3Button>
                  ) : null}

                  <Web3Button
                    isDisabled={
                      isApproved &&
                      isApproved !== CONTRACTS_MAP.MARKETPLACE &&
                      !isApprovedForAll
                    }
                    contractAddress={CONTRACTS_MAP.MARKETPLACE}
                    contractAbi={ABI.marketplace}
                    action={async () => await listForSale()}
                    className="list_btn"
                  >
                    List for sale
                  </Web3Button>
                </div>
              ) : null}

              {address !== zeroAddress &&
              nft.owner == address &&
              !nftPrice.eq(0) ? (
                <div className="sell_info">
                  <h4 className="formSectionTitle">Cancel Order </h4>
                  <Web3Button
                    contractAddress={CONTRACTS_MAP.MARKETPLACE}
                    contractAbi={ABI.marketplace}
                    action={async () => await cancelMakeOrder()}
                    className="list_btn"
                  >
                    Cancel list for sale
                  </Web3Button>
                </div>
              ) : null}

              {address !== zeroAddress &&
              nft.owner !== address &&
              !nftPrice.eq(0) ? (
                <div className="sell_info">
                  <h4 className="formSectionTitle">Cancel Order </h4>

                  <Web3Button
                    contractAddress={CONTRACTS_MAP.MARKETPLACE}
                    contractAbi={ABI.marketplace}
                    action={async () => await buyMakeOrder()}
                    className="list_btn"
                  >
                    Buy at asking price
                  </Web3Button>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      ) : null}
    </div>
  )
}