import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abiFile from './utils/WavePortal.json'

export default function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [minedHash, setMinedHash] = useState(null)
  const [currentAcct, setCurrentAcct] = useState("");
  const [numOfWaves, setNumOfWaves] = useState(0);
  const [allWaves, setAllWaves] = useState([])
  const [messageInput, setMessageInput] = useState("");
  console.log(messageInput)

  useEffect(() => {
    checkWalletConnection()
    getPreviousWaveCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAllWaves = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract('0x35DA2edDB11C57c06C2Aabe963cA2E38061F6227', abiFile.abi, signer)

    let waves = await waveportalContract.getAllWaves();
    let wavesCleaned = [];
    
    waves.forEach(wave => {
      wavesCleaned.push({
        address: wave.waver,
        timestamp: new Date(wave.timestamp * 1000),
        message: wave.message
      })
    })

    setAllWaves(wavesCleaned)

    waveportalContract.on("NewWave", (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message)
      setAllWaves(oldArray => [...oldArray, {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message
      }])
    })
  }

  const getPreviousWaveCount = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const waveportalContract = new ethers.Contract('0x35DA2edDB11C57c06C2Aabe963cA2E38061F6227', abiFile.abi, signer)

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
    .then(async accounts => {
      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found an authorized account: ', account)
        
        setCurrentAcct(account)

        getAllWaves();
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
    const waveportalContract = new ethers.Contract('0x35DA2edDB11C57c06C2Aabe963cA2E38061F6227', abiFile.abi, signer)

    let count = await waveportalContract.getTotalWaves();
    console.log('Retrieved total wave count...', count.toNumber());

    const waveTxn = await waveportalContract.wave(messageInput, {
      gasLimit: 300000,
    });
    console.log('Mining...', waveTxn.hash);
    setIsLoading(true);
    setMinedHash(waveTxn.hash)

    await waveTxn.wait();
    console.log('Mined -- ', waveTxn.hash);
    setIsLoading(false);
    getAllWaves();

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
        <h1 className="header" style={{marginTop: 0}}>
          <span role="img" aria-label="wave">👋</span>
          Hey there!
        </h1>

        <div className="bio">
          I am Ryan. Connect your Ethereum wallet and wave at me!
        </div>

        {isLoading && (
          <div style={{textAlign: 'center'}}>
            <p>Mining...</p>
            <p>{minedHash}</p>
          </div>
        )}

        {!isLoading && (
          <>
            <p style={{textAlign: "center",}}>
              I've already been waved at {numOfWaves} times!
            </p>

            <input type="text" value={messageInput} onChange={(event) => {
              setMessageInput(event.target.value);
            }}
            style={{
              margin: '8px 0',
              padding: '12px',
            }}
            />
            <button className="waveButton" onClick={() => {
              setMessageInput('');
              wave();
            }}>
              Wave at Me
            </button>

            {connectBtn}
          </>
        )}

        <div style={{marginTop: '36px'}}>
          <h2>Message Log:</h2>
          {allWaves
            .sort((a, b) => {
              if (a.timestamp < b.timestamp) {
                return 1;
              } else {
                return -1;
              }
            })
            .map(wave => {
            return (
              <div style={{
                border: '1px solid black',
                borderRadius: '4px',
                boxShadow: '2px 1.5px rgba(0, 0, 0, 0.15)',
                padding: '8px 12px',
                margin: '0 0 16px 0'
              }}>
                <p><strong>Address:</strong> {wave.address}</p>
                <p><strong>Timestamp:</strong> {wave.timestamp.toString()}</p>
                <p><strong>Message:</strong> {wave.message}</p>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  );
}