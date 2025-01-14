import { Redis } from "@upstash/redis"
import i18n from "../../util/i18n"
import NextCors from 'nextjs-cors';

require("dotenv").config()
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  let { chainId, creator } = req.body

  if (!chainId) {
    return res.status(200).send({ status: 500 })
  }

  let collections = await redis.hgetall(`${chainId}_collections`)
  let ops = []
  for (let item in collections) {
    let citem = collections[item]
    if (citem.tags.length) {
      citem.tags = JSON.parse(citem.tags)
    }
    if (creator && creator == citem.creator) {
      ops.push(citem)
      continue
    }
    // select all
    if (!creator) {
      ops.push(citem)
    }
  }

  ops = ops.sort((a, b) => a.collection - b.collection)

  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
 });
 
  return res
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
    .status(200)
    .send({
      code: 200,
      data: { collections: ops },
      message: i18n.t("success")
    })
}
