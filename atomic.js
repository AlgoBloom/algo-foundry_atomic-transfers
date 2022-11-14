const algosdk = require("algosdk");

const algodClient = new algosdk.Algodv2(
  process.env.ALGOD_TOKEN,
  process.env.ALGOD_SERVER,
  process.env.ALGOD_PORT
);

const creator = algosdk.mnemonicToSecretKey(process.env.MNEMONIC_CREATOR);

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

const submitAtomicTransfer = () => {

  // 1. Buyer account pays 1 Algo to the creator.

  const tx1 = () => {

  };

  // 2. Buyer opts into the asset. 
  const tx2 = () => {

  };

  // 3. Creator sends the NFT to the buyer.
  const tx3 = () => {

  };

  // 4. Creator sends 10% of the payment to the artist's account.
  const tx4 = () => {

  };


  txnArrayId = [tx1, tx2, tx3, tx4];

  // here the array has an Id attached to it
  
  
  // here we sign the transactions
  txn1Signed = tx1.signedTxn(creator.sk);
  txn2Signed = txn2.signedTxn(creator.sk);
  txn3Signed = txn3.signedTxn(creator.sk);
  txn4Signed = txn4.signedTxn(creator.sk);
  
  // now we create an array of signed transactions
  txnSignedArray = [];
  
  const submitAtomic = submitToNetwork(txnSignedArray);

  return submitAtomic;

};


(async () => {  

})();
