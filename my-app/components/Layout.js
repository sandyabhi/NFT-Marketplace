import { providers } from "ethers";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";

function Layout({ title, children }) {
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const web3ModalRef = useRef();
  const date = new Date();

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getProviderOrSigner = async () => {
    // Connect to Metamask
    // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the Goerli network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 80001) {
      window.alert("Change the network to Mumbai");
      throw new Error("Change network to Mumbai");
    }

    const signer = web3Provider.getSigner();
    // Get the address associated to the signer which is connected to  MetaMask
    const address = await signer.getAddress();

    setWalletAddress(address.substring(0, 6) + "...");
    return signer;
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "mumbai",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet();
    }
  }, [walletConnected]);

  return (
    <>
      <Head>
        <title>{title ? title + " - NFT-Bucket" : "NFT-Bucket"}</title>
        <meta name="description" content="Social Media" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex text-white bg-gradient-to-b from-blue-900 to-violet-900 min-h-screen flex-col justify-between">
        <header>
          <nav className="flex h-12 items-center px-4 bg-gradient-to-br  from-black to-blue-900 justify-between shadow-md">
            <Link href="/">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-blue-500 lg:text-2xl md:text-2xl sm:text-xl ">
                NFT-Bucket
              </span>
            </Link>
            <div className="flex items-center gap-5">
              <Link href="/sellnft">
                <p className="text-sm">Sell-NFT</p>
              </Link>

              <Link href="/profile">
                <p className="text-sm">Profile</p>
              </Link>

              {walletConnected ? (
                <p className="text-sm bottom-2 border-2 border-gray-600 rounded-md border-dotted p-1">
                  {walletAddress}
                </p>
              ) : (
                <button
                  className="text-sm bottom-2 border-2 border-gray-600 rounded-md border-dotted  p-1"
                  onClick={connectWallet}
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </nav>
        </header>
        <main className="container m-auto mt-4 px-4">{children}</main>
        <footer className="flex h-5 bg-black text-sm justify-center items-center shadow-inner">
          Copyright ©{date.getFullYear()} NFT-Bucket : by Sandeep Kumar Patel
        </footer>
      </div>
    </>
  );
}

export default Layout;
