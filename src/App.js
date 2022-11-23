import logo from './logo.svg';
import './App.css';
import { im } from './utils';
import { useEffect, useState } from 'react';
import { WayCbEvents } from 'way-sdk-test/dist/constants';
import { ethers, providers } from 'ethers';
import { userIDToWayID, wayIDToUserID } from 'way-sdk-test'


function App() {
  const [owner, setOwner] = useState("")
  const [address, setAddress] = useState("")
  const [content, setContent] = useState("")
  const [loginState, setLoginState] = useState(false)
  const [signer, setSigner] = useState({})
  const [network, setNetwork] = useState(-1)

  useEffect(() => {
    //do register
    if (loginState) {
      im.on(WayCbEvents.ONRECVNEWMESSAGE, newMsgHandler)
    }
  }, [loginState])
  let connectHandler = async () => {
    if (window.ethereum) {
      console.log("ethereum exists")
      let provider = new ethers.providers.Web3Provider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      let signer = provider.getSigner()
      let addr = await signer.getAddress()
      let networkId = await signer.getChainId()
      setNetwork(networkId)
      setOwner(addr)
      setSigner(signer)

    }
  }
  let newMsgHandler = async (data) => {
    console.log("get new message")
    console.log(data)
  }
  let loginHandler = async () => {

    let signature = await signer.signMessage("hello")
    console.log("loggin in")
    let config = {
      msgServer: "ws://192.168.91.128:10003",
      appServer: "http://192.168.91.128:8001",
      loginParams: {
        signature: signature,
        senderAddress: owner,
        network: network
      }
    }
    let resLog = await im.loginWay(config)
    console.log(resLog)
    setLoginState(true)
  }
  let listConvHandler = async () => {
    console.log("listing conversations")
    let convList = await im.listAllConversation()
    console.log(convList)
  }
  let textChangeHandler = (e) => {
    setAddress(e.target.value)
  }
  let historyMessageHandler = async () => {
    let params = {
      userID: userIDToWayID(address),
      count: 20,
      startClientMsgID: ""
    }
    let res = await im.getHistoryMsg(params)
    console.log(res)
  }
  let initHandler = async () => {
    //user input field

    let params = {
      receiver: userIDToWayID(address)
    }
    let res = await im.initConversation(params)
    console.log(res)
  }
  let contentChangeHandler = (e) => {
    setContent(e.target.value)
  }
  let messageHandler = async () => {
    let params = {
      content: content,
      receiver: userIDToWayID(address)
    }
    let sendMsg = await im.sendMessage(params)
    console.log(sendMsg)
  }
  let ownerHandler = (e) => {
    setOwner(e.target.value)
  }
  let markReadHandler = async () => {
    let params = userIDToWayID(address)
    let mark = await im.markAsRead(params)
    console.log(mark)
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div>
          <label>Connect to wallet:</label>
          <button onClick={connectHandler}>connect</button>
        </div>
        <div>
          <label>Log in Account:</label>
          <input value={owner} onChange={ownerHandler}></input>
        </div>

        <button onClick={loginHandler}>log in</button>
        <button onClick={listConvHandler}>list conversation</button>
        <div>
          <label>opponent:</label>
          <input type="text" value={address} onChange={textChangeHandler} />
        </div>

        <button onClick={historyMessageHandler}>get history message</button>
        <button onClick={markReadHandler}>mark as read</button>
        <button onClick={initHandler}> init conversation</button>
        <div>
          <label>Msg to be sent:</label>
          <input type="text" value={content} onChange={contentChangeHandler} />
        </div>

        <button onClick={messageHandler}>send message</button>
      </header>
    </div>
  );
}

export default App;
