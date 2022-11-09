import NFTTile from "../components/NFTTile";
import { useState } from "react";
import Layout from "../components/Layout";
import { ethers } from "ethers";
import { abi, CONTRACT_ADDRESS } from "../constants";
import axios from "axios";

export default function Home() {
  const [data, updateData] = useState([]);
  const [dataFetched, updateFetched] = useState(false);

  async function getAllNFTs() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    let contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

    let tx = await contract.getAllNFTs();

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

        return item;
      })
    );

    updateFetched(true);
    updateData(items);
  }

  if (!dataFetched) {
    getAllNFTs();
  }

  return (
    <Layout>
      <div>
        <div className="flex flex-col place-items-center mt-20">
          <div className="md:text-xl font-bold text-white">Top NFTs</div>
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
            {data.length === 0 ? (
              <h1 className="text-3xl">Loading...</h1>
            ) : (
              data.map((value, index) => {
                return <NFTTile data={value} key={index}></NFTTile>;
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
