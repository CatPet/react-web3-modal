import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import React, { ReactElement, useCallback, useContext, useMemo, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

type onChainProvider = {
  connect: () => Promise<Web3Provider>;
  checkNetwork: () => Promise<boolean>;
  provider: JsonRpcProvider | undefined;
  address: string;
  connected: Boolean;
  chainId: number;
};

export type Web3ContextData = {
  onChainProvider: onChainProvider;
} | null;

const Web3Context = React.createContext<Web3ContextData>(null);

export const useWeb3Context = () => {
  const web3Context = useContext(Web3Context);
  if (!web3Context) {
    throw new Error("useWeb3Context() can only be used inside of <Web3ContextProvider />, " + "please declare it at a higher level.");
  }
  const { onChainProvider } = web3Context;
  return useMemo(() => {
    return { ...onChainProvider };
  }, [web3Context]);
}

export const Web3ContextProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const [chainId, setChainId] = useState(0);
  const [providerChainId, setProviderChainId] = useState(0);
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState<JsonRpcProvider>();

  const connect = useCallback(async () => {
    const web3 = new Web3Modal();
    const provider_raw = await web3.connect();
    const provider_count = new ethers.providers.Web3Provider(provider_raw);
    const network = await provider_count.getNetwork();
    setProviderChainId(network.chainId);

    const connected_address = await provider_count.getSigner().getAddress();
    setAddress(connected_address);

    if (network.chainId == 5) {
      setProvider(provider_count);
      setChainId(network.chainId);
    }

    setConnected(true);
    return provider_count;
  }, [provider, connected]);

  const checkNetwork = async (): Promise<boolean> => {
    if (providerChainId != 5) {
      return false;
    }
    return true;
  }

  const onChainProvider = useMemo(() => (
    {
      provider,
      chainId,
      address,
      connected,

      connect,
      checkNetwork,
    }
  ), [provider, connected, chainId, address, connect, checkNetwork]);

  return (
    <Web3Context.Provider value={{ onChainProvider }}>{children}</Web3Context.Provider>
  )
}