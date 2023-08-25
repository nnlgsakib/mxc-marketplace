import type { NextPage } from "next"
import ApiClient from "@/util/request"
import React, { useEffect, useState, useRef } from "react"
import HexagonLogo from "@/components/HexagonLogo"
import { getHexagonWithAddress } from "@/const/StorgeUtils"
import { getColorFromH3Id } from "@/util/randomColor"
import { FaArrowDown, FaSpinner } from "react-icons/fa"
import Router, { useRouter } from "next/router"
import { zeroAddress } from "@/const/Local"
import SkeletonList from "@/components/Skeleton/SkeletonList"
import { useTranslation } from "react-i18next"

const ProfileHexagons: NextPage = () => {
  const hexsgonsRef = useRef<any[]>([])
  const [currenthexsgons, setCurrentHexsgons] = useState<any[]>([])
  const [loadmore, setLoadMore] = useState(false)
  const [targetLen, setTargetLen] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 30
  const router = useRouter()
  const address = router.query.address || zeroAddress
  const [isLoading, setLoading] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      let hexs: any = await getHexagonWithAddress(address)
      hexsgonsRef.current = hexs

      setTargetLen(hexs.length)
      let currHexs = getPageData(1)
      setCurrentHexsgons(currHexs)
      setLoading(false)
    }
    fetchData()
  }, [])

  const loadMoreData = async () => {
    setLoadMore(true)

    let newData = getPageData(page + 1)
    setCurrentHexsgons((prevData) => {
      return [...prevData, ...newData]
    })
    setPage((prevPage) => prevPage + 1)

    setLoadMore(false)
  }

  const getPageData = (page: number = 1) => {
    const start = (page - 1) * pageSize
    const pageItems = hexsgonsRef.current.slice(start, start + pageSize)
    return pageItems
  }

  return (
    <div className="pb-5">
      <div className="nfts_hexagons">
        {currenthexsgons && !isLoading
          ? currenthexsgons.map((item, index) => {
              return (
                <div
                  className="nft_item"
                  key={item.tokenId}
                  onClick={() => Router.push(`/hexagon/${item.tokenId}`)}
                >
                  <div className="nft_image flex flex-col items-center justify-center">
                    <HexagonLogo fill={getColorFromH3Id(item.tokenId)} />
                  </div>
                  <div className="token_id">{item.tokenId}</div>
                  <div className="token_name">MXC</div>
                </div>
              )
            })
          : isLoading && <SkeletonList />}
      </div>

      {currenthexsgons.length &&
      !isLoading &&
      currenthexsgons.length < targetLen ? (
        <div className="loadmore flex_c mt-3">
          <button
            disabled={loadmore}
            onClick={loadMoreData}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center space-x-2"
          >
            {loadmore ? (
              <>
                <FaSpinner className="animate-spin" /> <span>Loading...</span>
              </>
            ) : (
              <>
                <span>{t("More")}</span>
                <FaArrowDown />
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default ProfileHexagons
