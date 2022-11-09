import { useState } from "react";
import { abi, CONTRACT_ADDRESS } from "../../constants";
import { useRouter } from "next/router";
import axios from "axios";
import Layout from "../../components/Layout";

export default function NFTPage(props) {
  const [data, updateData] = useState({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  const [currAddress, updateCurrAddress] = useState("0x");

  const router = useRouter();
  //   const tokenId = params.tokenId;
  //   if (!dataFetched) getNFTData(tokenId);

  const { query } = useRouter();
  const { slug } = query;

  //const tokenId = params.tokenId;
  if (!dataFetched) getNFTData(slug);

  async function getNFTData(tokenId) {
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
    //create an NFT Token
    const tokenURI = await contract.tokenURI(tokenId);
    //const listedToken = await contract.getListedTokenForId(tokenId);
    const listedToken = await contract.getListforTokenId(tokenId);
    let meta = await axios.get(tokenURI);
    meta = meta.data;
    console.log(listedToken);

    let item = {
      price: meta.price,
      tokenId: tokenId,
      seller: listedToken.seller,
      owner: listedToken.owner,
      image: meta.image,
      name: meta.name,
      description: meta.description,
    };
    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr);
    updateCurrAddress(addr);
  }

  async function buyNFT(tokenId) {
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      let contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      const salePrice = ethers.utils.parseUnits(data.price, "ether");
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");
      //run the executeSale function
      let transaction = await contract.executeSale(tokenId, {
        value: salePrice,
      });
      await transaction.wait();

      alert("You successfully bought the NFT!");
      updateMessage("");
    } catch (e) {
      alert("Upload Error" + e);
    }
  }

  return (
    <Layout>
      <div style={{ "min-height": "100vh" }}>
        <div className="flex ml-20 mt-20">
          <img src={data.image} alt="" className="w-2/5" />
          <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
            <div>Name: {data.name}</div>
            <div>Description: {data.description}</div>
            <div>
              Price: <span className="">{data.price + " ETH"}</span>
            </div>
            <div>
              Owner: <span className="text-sm">{data.owner}</span>
            </div>
            <div>
              Seller: <span className="text-sm">{data.seller}</span>
            </div>
            <div>
              {currAddress == data.owner || currAddress == data.seller ? (
                <div className="text-emerald-700">
                  You are the owner of this NFT
                </div>
              ) : (
                <button
                  onClick={() => buyNFT(slug)}
                  className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  Buy this NFT
                </button>
              )}

              <div className="text-green text-center mt-3">{message}</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// export async function getServerSideProps(context) {
//   const { params } = context;
//   const { slug } = params;

//   //const tokenId = params.tokenId;
//   if (!dataFetched) getNFTData(slug);
// }
