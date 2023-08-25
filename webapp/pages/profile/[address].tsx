// import {
//   useAddress,
//   useContract,
//   useContractRead,
//   useOwnedNFTs,
// } from "@thirdweb-dev/react"
// import Router from "next/router"

import Router, { useRouter } from "next/router"
import React, { useState, useEffect } from "react"
import Container from "@/components/Container/Container"
import Skeleton from "@/components/Skeleton/Skeleton"

import styles from "@/styles/Profile.module.css"
import { randomColor } from "@/util/randomColor"
import { zeroAddress } from "@/const/Local"
import dynamic from "next/dynamic"
import { useTranslation } from "react-i18next"

const ProfileCollections = dynamic(
  () => import("@/components/Profile/Collections")
)
const ProfileNFTs = dynamic(() => import("@/components/Profile/Nfts"))
const ProfileHexagons = dynamic(() => import("@/components/Profile/Hexagons"))
const ProfileDomains = dynamic(() => import("@/components/Profile/Domains"))

const [randomColor1, randomColor2, randomColor3, randomColor4] = [
  randomColor(),
  randomColor(),
  randomColor(),
  randomColor(),
]

export default function ProfilePage() {
  const [tab, setTab] = useState<
    "nfts" | "collections" | "hexagons" | "domains"
  >("collections")
  const router = useRouter()
  const address = router.query.address || zeroAddress
  const { t } = useTranslation()

  return (
    <div className="profile_page">
      <Container maxWidth="lg">
        <div className={styles.profileHeader}>
          <div
            className={styles.coverImage}
            style={{
              background: `linear-gradient(90deg, ${randomColor1}, ${randomColor2})`,
            }}
          />
          <div
            className={styles.profilePicture}
            style={{
              background: `linear-gradient(90deg, ${randomColor3}, ${randomColor4})`,
            }}
          />
          <h1 className={styles.profileName}>
            {address ? (
              address.toString().substring(0, 4) +
              "..." +
              address.toString().substring(38, 42)
            ) : (
              <Skeleton width="320" />
            )}
          </h1>
        </div>

        {/* tab */}
        <div className={styles.tabs}>
          <h3
            className={`${styles.tab} 
            ${tab === "collections" ? styles.activeTab : ""}`}
            onClick={() => setTab("collections")}
          >
            {t("Collections")}
          </h3>

          <h3
            className={`${styles.tab} 
            ${tab === "nfts" ? styles.activeTab : ""}`}
            onClick={() => setTab("nfts")}
          >
            Nfts
          </h3>

          <h3
            className={`${styles.tab} 
            ${tab === "hexagons" ? styles.activeTab : ""}`}
            onClick={() => setTab("hexagons")}
          >
            {t("Hexagons")}
          </h3>

          <h3
            className={`${styles.tab} 
            ${tab === "domains" ? styles.activeTab : ""}`}
            onClick={() => setTab("domains")}
          >
            {t("Domains")}
          </h3>
        </div>

        {tab == "collections" && <ProfileCollections />}
        {tab == "nfts" && <ProfileNFTs />}
        {tab == "hexagons" && <ProfileHexagons />}
        {tab == "domains" && <ProfileDomains />}
      </Container>
    </div>
  )
}
