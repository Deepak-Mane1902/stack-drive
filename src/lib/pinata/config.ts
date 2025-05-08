"server only"

import { PinataSDK } from "pinata"
import { NEXT_PUBLIC_GATEWAY_URL, PINATA_JWT } from "../constant"


export const pinata = new PinataSDK({
  pinataJwt: `${PINATA_JWT}`,
  pinataGateway: `${NEXT_PUBLIC_GATEWAY_URL}`
})