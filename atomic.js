const algosdk = require("algosdk");

const algodClient = new algosdk.Algodv2(
  process.env.ALGOD_TOKEN,
  process.env.ALGOD_SERVER,
  process.env.ALGOD_PORT
);

const creator = algosdk.mnemonicToSecretKey(process.env.MNEMONIC_CREATOR);
const receiver = algosdk.mnemonicToSecretKey(process.env.MNEMONIC_RECEIVER);

const submitToNetwork = async (signedTxn) => {
  let tx = await algodClient.sendRawTransaction(signedTxn).do();
  console.log("Transaction : " + tx.txId);
  confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
  console.log(
    "Transaction " +
      tx.txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );
  return confirmedTxn;
};

// 0. creator creates the NFT

const createNFT = async () => {
  const sugParams = await algodClient.getTransactionParams().do();
  const txn = algosdk.makeAssetCreateTxnWithSuggestedParams(
    creator.addr,
    undefined,
    1,
    0,
    undefined,
    creator.addr,
    undefined,
    undefined,
    undefined,
    "TST1",
    "Test NFT One",
    undefined,
    undefined,
    sugParams,
    undefined,
  );
  const signTxn = txn.signTxn(creator.sk);
  const confirmedTxn = await submitToNetwork(signTxn);
  return confirmedTxn["asset-index"];
};

const getCreatedAsset = async (account, assetId) => {
  let accountInfo = await algodClient.accountInformation(account.addr).do();
  const asset = accountInfo["created-assets"].find((asset) => {
    return asset["index"] === assetId;
  });
  return asset;
};

const submitAtomicTransfer = async () => {
  try {
    const sugParams = await algodClient.getTransactionParams().do();
    // 1. Buyer account pays 1 Algo to the creator.
    const tx1 = algosdk.makePaymentTxnWithSuggestedParams(
      receiver.addr, // receiver sends
      creator.addr, // creator receives
      1000000, // 1 algo
      undefined,
      undefined,
      sugParams,
      undefined
    );

    // 2. Buyer opts into the asset. 
    let tx2 = algosdk.makeAssetTransferTxnWithSuggestedParams(
      receiver.addr,
      receiver.addr,
      undefined,
      undefined,
      0,
      undefined,
      assetId,
      sugParams,
      undefined
    );

    // 3. Creator sends the NFT to the buyer.
    let tx3 = algosdk.makeAssetTransferTxnWithSuggestedParams(
      creator.addr,
      receiver.addr,
      undefined,
      undefined,
      1,
      undefined,
      assetId,
      sugParams,
      undefined,
    );

    // 4. Creator sends 10% of the payment to the artist's account.
    const tx4 = () => {

    };

    // put unsigned transactions in an array to be id'ed
    let txnArrayId = [tx1, tx2, tx3, tx4];
    // here the array has an Id attached to it 
    let txnGroup = algosdk.assignGroupID(txnArrayId);
    
    // here we sign the transactions
    let txn1Signed = txn1.signedTxn(creator.sk);
    let txn2Signed = txn2.signedTxn(creator.sk);
    let txn3Signed = txn3.signedTxn(creator.sk);
    let txn4Signed = txn4.signedTxn(creator.sk);
    
    // now we create an array of signed transactions
    let txnSignedArray = [];
    txnSignedArray.push(txn1Signed);
    txnSignedArray.push(txn2Signed);
    txnSignedArray.push(txn3Signed);
    txnSignedArray.push(txn4Signed);
    
    // submit atomic transaction to the network
    await submitToNetwork(txnSignedArray);

    // print account balances
    console.log(await algodClient.accountInformation(ADDRESS_CREATOR).do());
    console.log(await algodClient.accountInformation(ADDRESS_RECEIVER).do());

  } catch (err) {
    console.log('err', err);
  }
};

(async () => {  
    console.log("Creating NFT!");
    const assetId = await createNFT().catch(console.error);
    console.log("Here is the NFT information!");
    await getCreatedAsset(creator, assetId);
    console.log("Submitting atomic transfer!");
    await submitAtomicTransfer(assetId);
    console.log("Atomic transfer complete!");
})();
