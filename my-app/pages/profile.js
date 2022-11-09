import axios from "axios";
import { useEffect, useState } from "react";
import NFTTile from "../components/NFTTile";
import { abi, CONTRACT_ADDRESS } from "../constants";
import Layout from "../components/Layout";
import { ethers } from "ethers";

export default function Profile() {
  const [data, updateData] = useState([]);
  const [dataFetched, updateFetched] = useState([]);
  const [address, updateAddress] = useState("0x");
  const [totalPrice, updateTotalPrice] = useState("0");

  useEffect(() => {
    getNFTData();
  }, []);

  async function getNFTData() {
    let sumPrice = 0;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();

    let contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

    let tx = await contract.getMyNFTs();

    const items = await Promise.all(
      tx.map(async (i) => {
        const tokenURI = await contract.tokenURI(i.tokenId);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.image,
          name: meta.name,
          description: meta.description,
        };
        sumPrice += Number(price);
        return item;
      })
    );

    updateData(items);
    updateFetched(true);
    updateAddress(addr);
    updateTotalPrice(sumPrice.toPrecision(3));
  }

  return (
    <Layout title="Profile">
      <div className="profileClass" style={{ "min-height": "100vh" }}>
        <div className="profileClass">
          <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
            <div className="mb-5">
              <h2 className="font-bold">Wallet Address</h2>
              {address}
            </div>
          </div>
          <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
            <div>
              <h2 className="font-bold">No. of NFTs</h2>
              {data.length}
            </div>
            <div className="ml-20">
              <h2 className="font-bold">Total Value</h2>
              {totalPrice} ETH
            </div>
          </div>
          <div className="flex flex-col text-center items-center mt-11 text-white">
            <h2 className="font-bold">Your NFTs</h2>
            <div className="flex justify-center flex-wrap max-w-screen-xl">
              {data.map((value, index) => {
                return <NFTTile data={value} key={index}></NFTTile>;
              })}
            </div>
            <div className="mt-10 text-xl">
              {data.length == 0
                ? "Oops, No NFT data to display (Are you logged in?)"
                : ""}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
