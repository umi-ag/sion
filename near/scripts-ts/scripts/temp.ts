import { connect, keyStores, Account, Contract, KeyPair } from "near-api-js";

const CONTRACT_ADDRESS = "dev-1699903324054-39939793685574";
const ACCOUNT_ID = "dev-1699903324054-39939793685574"; // あなたのアカウントID
const PRIVATE_KEY = "ed25519:3P3ds38pcRbv1VZr83FKYyE1NtbC6js44mN11dUexy8t159JmWsY95AmEP2oZcof3RoLe4YB91ZGufYxaFkdzGcT"

const config = {
    networkId: "testnet",
    keyStore: new keyStores.InMemoryKeyStore(),
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
};

async function incrementCount() {
    // NEARとの接続を確立します
    const near = await connect(config);
    // const keyPair = keyStores.air.fromString(PRIVATE_KEY);
    const keyPair = KeyPair.fromString(PRIVATE_KEY);
    await config.keyStore.setKey(config.networkId, ACCOUNT_ID, keyPair);

    const account = new Account(near.connection, ACCOUNT_ID);

    const contract = new Contract(account, CONTRACT_ADDRESS, {
        viewMethods: [],
        changeMethods: ["increment"],
    });

    // increment_count メソッドを呼び出します
    try {
        await contract.increment({ args: { x: 1 }})
        console.log("Count incremented successfully.");
    } catch (error) {
        console.error("Error incrementing count:", error);
    }
}

incrementCount();
