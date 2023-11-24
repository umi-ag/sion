// import { SENDER_ADDRESS, GAS_BUDGET, sponsor, suiProvider } from "@/config/sui";
import {
  TransactionBlock,
  TransactionArgument,
} from "@mysten/sui.js/transactions";
import { PACKAGE_ID, EVENT_CONFIG_ID, CLOCK_ID, EVENT_KEY } from "src/config";
import { create, updateField } from "../moveCall/sion/vc/functions";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui.js/utils";


export const moveCallCreate = async (txb: TransactionBlock, args: {

})=>{
  create(txb,  SUI_CLOCK_OBJECT_ID);
  // updateField(txb, {
  //   vc: SUI_CLOCK_OBJECT_ID,
  //   string:
  // })
}

export const moveCallUpdateField = async (txb: TransactionBlock, args: {
  vcObjectID: string,
  claimKey: string,
  claimDigest: Buffer,
})=>{
  updateField(txb, {
    vc: args.vcObjectID,
    string: args.claimKey,
    vecU8: Array.from(args.claimDigest),
  })
}
