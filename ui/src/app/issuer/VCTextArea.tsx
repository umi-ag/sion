import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useState } from "react";
import { moveCallSponsored } from "src/libs/coco/sponsoredZkLogin";
import { useZkLoginSetup } from "src/store/zklogin";

export const VCTextArea = () => {
  const [isLoading, setIsLoading] = useState(false);
  const zkLoginSetup = useZkLoginSetup();
  const [digest, setDigest] = useState<string>("");
  const [err, setErr] = useState<string>("");

  const data = {
    odometer_reading: 1200,
    fuel_usage: 100,
  }

  const onClick = async () => {
    setIsLoading(true);
    const account = zkLoginSetup.account();
    console.log("account", account);
    console.log(zkLoginSetup.userAddr);
    const txb = new TransactionBlock();
    const result = await moveCallSponsored(txb, account);

    if (result.effects?.status.status === "success") {
      setDigest(result.digest);
      console.log("done!");
    } else {
      // setErr(`Transaction Failed: ${result.effects?.status.error}`);
      setErr("Transaction Failed...");
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <textarea
        defaultValue={JSON.stringify(data, null, 2)}
        style={{ width: '400px', height: '400px' }}
      />
      <button
        className={`text-white w-32 py-3 px-5 rounded-xl text-xl font-roboto
          ${!zkLoginSetup.zkProofs
            ? "bg-slate-800"
            : "bg-blue-600 hover:bg-blue-500"
          }`}
        onClick={() => {
          const objectEncryption = new ObjectEncryption(
            zkLoginSetup.zkloginAddress(),
            zkLoginSetup.addressSeed().toString()
          );
          const encryptedData = objectEncryption.encrypt(data);
          console.log(encryptedData)
          {
          const objectEncryption = new ObjectEncryption(
              zkLoginSetup.zkloginAddress(),
              zkLoginSetup.addressSeed().toString()
            );
            const data = objectEncryption.decrypt(encryptedData);
            console.log(data)
          }
        }}
      >
        {isLoading || zkLoginSetup.isProofsLoading ? "Loading..." : "Issue"}
      </button>
    </div>
  )
}
