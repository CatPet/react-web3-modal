import { useState, useEffect } from 'react';
import { ethers } from "ethers";
// import { StaticJsonRpcProvider, JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnect from "@walletconnect/web3-provider";

import { COUNT_ABI } from '../abi';
import { useWeb3Context } from '../hooks/useWeb3context';

interface ICountInfo {
  state: number;
  incrs: number;
  decrs: number;
}

export const providerOptions = {
  walletlink: {
    package: CoinbaseWalletSDK, // Required
    options: {
      appName: "Web 3 Modal Demo", // Required
      infuraId: process.env.REACT_APP_INFURA_KEY // Required unless you provide a JSON RPC url; see `rpc` below
    }
  },
  walletconnect: {
    package: WalletConnect, // required
    options: {
      infuraId: process.env.REACT_APP_INFURA_KEY // required
    }
  }
};

const web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions // required
});

const Count = () => {

  // const { provider, chainId, address, connected, connect, checkNetwork } = useWeb3Context();

  const [delta, setDelta] = useState("");
  const [balance, setBalance] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [countContract, setCountContract] = useState<ethers.Contract>();
  const [countInfo, setCountInfo] = useState<ICountInfo>();

  // useEffect(() => {
  //   connect().then(() => { });
  // }, [])

  const connectMetamask = async () => {
    // console.log(provider, chainId, address, connected);

    const provider_test = await web3Modal.connect();
    const library = new ethers.providers.Web3Provider(provider_test);
    const accounts_test = await library.listAccounts();
    const network = await library.getNetwork();

    console.log(network);

    // const contractAddress: string = "0xa51a82a51e7a702b561ecc6278a6b622715e0aec";
    // if (!window.ethereum) {
    //   alert("Please Install Metamask!");
    //   return;
    // }
    // const provider: JsonRpcProvider = new ethers.providers.Web3Provider(window.ethereum);

    // const signer = provider.getSigner();

    // const accounts = await provider.send("eth_requestAccounts", []);

    // const chainId = await provider.getNetwork().then(network => Number(network.chainId));
    // if (chainId != 5) {
    //   alert("Please Check Network");
    //   return;
    // }
    // const balanceAccount = await provider.getBalance(accounts[0]);
    // const balanceFormat = ethers.utils.formatEther(balanceAccount);

    // const contract = new ethers.Contract(contractAddress, COUNT_ABI, signer);

    // // const countState = await contract.state();
    // // const countDecrs = await contract.Decrs();
    // // const countDecrs = await contract.decrs();

    // setBalance(balanceFormat);
    // // setCountInfo({
    // //   state: parseInt(countState),
    // //   incrs: parseInt(countIncrs),
    // //   decrs: parseInt(countDecrs),
    // // });
    // setCountContract(contract);
    // setSelectedAddress(accounts[0]);
  }

  const connectWallet = async () => {
    try {
      await web3Modal.clearCachedProvider();

      const provider_test = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider_test);
      const accountsTest = await library.listAccounts();
      const network = await library.getNetwork();

      console.log(accountsTest);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const load = async () => {
      if (!countContract) {
        setCountInfo({
          state: 0,
          incrs: 0,
          decrs: 0,
        });
        return;
      }
      const countState = await countContract.state()
      const countIncrs = await countContract.incrs();
      const countDecrs = await countContract.incrs();
      setCountInfo({
        state: parseInt(countState),
        incrs: parseInt(countIncrs),
        decrs: parseInt(countDecrs),
      })
    }

    load();
  }, [countContract])

  const increment = async () => {
    if (!delta || !countContract) return;
    const result = await countContract.increment(delta);
    await result.wait();
    connectMetamask();
    setDelta("");
  }

  const decrement = async () => {
    if (!delta || !countContract) return;
    const result = await countContract.decrement(delta);
    await result.wait();
    connectMetamask();
    setDelta("");
  }

  return (
    <div>
      {!selectedAddress && <button className='btn btn-success' onClick={connectWallet}>Connect to Metamask</button>}
      {selectedAddress &&
        <div style={{ width: 500 }}>
          <div className='mb-5'>
            <div>Balance: {balance}</div>
            <div>State: {countInfo?.state}</div>
            <div>Increments: {countInfo?.incrs}</div>
            <div>Decrements: {countInfo?.decrs}</div>
          </div>
          <div className='d-flex justify-around w-full' >
            <button className="btn btn-primary" onClick={increment}>Increment</button>
            <input className='form-control' type="number"
              style={{ width: 250 }} value={delta} onChange={e => setDelta(e.target.value)} />
            <button className="btn btn-danger" onClick={decrement}>Decrement</button>
          </div>
        </div>
      }
    </div>
  );
}

export default Count;
