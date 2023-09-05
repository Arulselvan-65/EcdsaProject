const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const secp  = require('ethereum-cryptography/secp256k1')
const { toHex } = require('ethereum-cryptography/utils')



const balances = {
  
  '04b9bd270b1669070c275efb441a79573499b291194ee0f049f46f95ecd1c7f3d72bda6af25a63fa699c184f5bdfd693f726d912b93e87b103abf13da322f9d8ff': 100, //fd4ed2c6d4a5b08484012362c032725af3c00d5856ad567630d863359be01625
  '04f0f9b0fb74283b7f43b1360942534a8055b4f2e9c4bd4ffaaad91d5bfdb7eae339428647371ac919c07b1db1c98a6c9e50e078c90f34f0e82c14389f4c13ece1': 50, //4a4ad2aae19ff9d0800c83fd143ec924025cf96c71a334a7ec8c014b4a876f80
  '041755dbd8659ccacf775c8743c2c53822ab17761460a38de88e54e10561194f8e69ef9752c71ebed8b2f193a631de2dd26b625856b7b5fa5abc865dd629df85dd': 75, //7f4d35d67c6e9e2d801f65fbebb50cd19965fc11bf15e905296685c902738c91
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  let { sender, recipient, sign,amount,mesg1 } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);
  sender = toHex(secp.getPublicKey(sender));
  let isValid = isValidTransaction(mesg1,sign,sender);
  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } 
  else if(!isValid){
    res.status(400).send({ message: "Not valid Key." });
  }
  else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function isValidTransaction(messageHash, sign, sender) {
  const signature = Uint8Array.from(Object.values(sign[0]))
  const recoveryBit = sign[1]
  // console.log(recoveredPublicKey)
  // console.log(recoveryBit)
  const recoveredPublicKey = secp.recoverPublicKey(messageHash, signature, recoveryBit)
  // console.log("hello")
  const isSigned = secp.verify(signature, messageHash, recoveredPublicKey)
  

  const isValidSender = (sender.slice(-40).toString() === toHex(recoveredPublicKey.slice(1).slice(-20)).toString()) ? true:false
  if(isValidSender && isSigned) return true

  return false
}
