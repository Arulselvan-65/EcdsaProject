import { useState } from "react";
import server from "./server";

import {keccak256} from 'ethereum-cryptography/keccak';
import * as secp from 'ethereum-cryptography/secp256k1';
import {toHex,utf8ToBytes} from 'ethereum-cryptography/utils';

function Transfer({ address, setBalance}) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [msg,setMsg] = useState("");
  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    const messageHash = toHex(keccak256(utf8ToBytes(msg)));
    const sign = await secp.sign(messageHash,privateKey,{ recovered: Boolean = true});
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: privateKey,
        amount: parseInt(sendAmount),
        mesg1: messageHash,
        sign,
        recipient,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <label>
        Private Key
        <input
          placeholder="We won't save it lol🤣"
          value={privateKey}
          onChange={setValue(setPrivateKey)}
        ></input>
      </label>

      <label>
        Message
        <input
          placeholder="Type any Message"
          value={msg}
          onChange={setValue(setMsg)}
        ></input>
      </label>



      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
