const CryptoJS = require("crypto-js");
elliptic = require("elliptic");
utils = require("./utils");

const ec = new elliptic.ec("secp256k1");

class TxOut {
  constructor(address, amount) {
    this.address = address;
    this.amount = amount;
  }
}

class TxIn {
  // uTxOutId
  // uTxOutIndex
  // Signature
}

class Transaction {
  // ID
  // txIns[]
  // txOuts[]
}

class UTxout {
  constructor(uTxOutId, txOutIndex, address, amount) {
    this.uTxOutId = uTxOutId;
    this.txOutIndex = txOutIndex;
    this.address = address;
    this.amount = amount;
  }
}

let uTxOuts = [];

const getTxId = tx => {
  const txInContent = tx.txIns
    .map(txIn => txIn.uTxOutId + txIn.txOutIndex)
    .reduce((a, b) => a + b, "");

  const txOutContent = tx.txOuts
    .map(txOut => txOut.address + txOut.amount)
    .reduce((a, b) => a + b, "");
  return CtyproJS.SHA256(txInContent + txOutContent).toString();
};

const findUTxOut = (uTxOutId, txOutIndex, uTxOutList) => {
  return uTxOutList.find(
    uTxOut => uTxOut.txOutId === txOutId && uTxOut.txOutIndex === txOutIndex
  );
};

const signTxIn = (tx, txInIndex, privateKey, uTxOut) => {
  const txIn = tx.txIns[txInIndex];
  const dataToSign = tx.id;

  const referencedUTxOut = findUTxOut(txIn.txOutId, tx.txOutIndex, uTxOuts);
  if (referencedUTxOut === null) {
    return;
  }

  const key = ec.keyFromPrivate(privateKey, "hex");
  const signature = utils.toHexString(key.sign(dataToSign).toDER());
  return signature;
};

const updateUTxOuts = (newTxs, uTxOutList) => {
  const newUTxOuts = newTxs
    .map(tx => {
      tx.txOuts.map((txOut, index) => {
        new UTXOut(tx.id, index, txOut.address, txOut.amount);
      });
    })
    .reduce((a, b) => a.concat(b), []);

  const spentTxOuts = newTxs
    .map(tx => tx.txIns)
    .reduce((a, b) => a.concat(b), [])
    .map(txIn => new UTxout(txIn.txOutId, txIn.txOutIndex, "", 0));

  const resultingUTxOuts = uTxOutList
    .finter(uTx0 => !findUTxOut(uTx0.txOutId, uTx0.uTxOutIndex, spentTxOuts))
    .concat(newTxOuts);

  return resultingUTxOuts;
};
