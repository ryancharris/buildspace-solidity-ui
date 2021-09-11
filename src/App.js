import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';

export default function App() {
  const [currentAcct, setCurrentAcct] = useState("");

  useEffect(() => {
    checkWalletConnection()
  }, []);

  const checkWalletConnection = () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Make sure to connect to MetaMask!')
    } else {
      console.log("Ethereum object", ethereum)
    }

    ethereum.request({ method: 'eth_accounts' })
    .then(accounts => {
      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found an authorized account: ', account)
        
        setCurrentAcct(account)
      } else {
        console.log('No authorized account')
      }
    })
  }

  const connectWallet = () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert('Get MetaMask!');
    }

    ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => {
      console.log('Connected: ', accounts[0]);
      setCurrentAcct(accounts[0])
    })
    .catch(err => console.log(err))
  }

  const wave = () => {
    console.log('wave')
  }
  
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        <span role="img" aria-label="wave">👋</span>
        Hey there!
        </div>

        <div className="bio">
        I am Ryan. Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {currentAcct ? null : (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}