import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abiFile from './utils/WavePortal.json'

export default function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [minedHash, setMinedHash] = useState(null)
  const [currentAcct, setCurrentAcct] = useState("");
  const [numOfWaves, setNumOfWaves] = useState(0);

  useEffect(() => {
    checkWalletConnection()
    getPreviousWaveCount()
  }, []);

  const getPreviousWaveCount = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract('0xe821DB566ef664D70CD3043f3779D92528D8189C', abiFile.abi, signer)

    let count = await waveportalContract.getTotalWaves()
    setNumOfWaves(count.toNumber())
  }

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

  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract('0xe821DB566ef664D70CD3043f3779D92528D8189C', abiFile.abi, signer)

    let count = await waveportalContract.getTotalWaves();
    console.log('Retrieved total wave count...', count.toNumber());

    const waveTxn = await waveportalContract.wave();
    console.log('Mining...', waveTxn.hash);
    setIsLoading(true);
    setMinedHash(waveTxn.hash)

    await waveTxn.wait();
    console.log('Mined -- ', waveTxn.hash);
    setIsLoading(false);
    setHasLoaded(true);

    setTimeout(() => {
      setHasLoaded(false);
    }, 2500);

    count = await waveportalContract.getTotalWaves();
    console.log('Retrieved total wave count...', count.toNumber());
    setNumOfWaves(count.toNumber())
  }

  const connectBtn = currentAcct ? null : (
    <button className="waveButton" onClick={connectWallet}>
      Connect Wallet
    </button>
  )
  
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

        {isLoading && (
          <div>
            <p>Mining...</p>
            <p>{minedHash}</p>
          </div>
        )}

        {hasLoaded && (
          <div>
            <p>Mined...</p>
            <p>{minedHash}</p>
          </div>
        )}

        {!isLoading && (
          <div>
            <p style={{textAlign: "center",}}>
              I've already been waved at {numOfWaves} times!
            </p>
          </div>
        )}

        {!isLoading && (
          <>
            <button className="waveButton" onClick={wave}>
              Wave at Me
            </button>

            {connectBtn}
          </>
        )}
      </div>
    </div>
  );
}