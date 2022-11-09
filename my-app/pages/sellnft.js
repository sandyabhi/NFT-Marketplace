import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../utils/pinata";
import { abi, CONTRACT_ADDRESS } from "../constants";
import Layout from "../components/Layout";
import { ethers } from "ethers";

export default function Sellnft() {
  const [formParams, updateFormParams] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [fileURL, setFileURL] = useState(null);
  const [message, updateMessage] = useState("");

  async function onChangeFile(e) {
    let file = e.target.files[0];

    try {
      const res = await uploadFileToIPFS(file);
      if (res.success === true) {
        console.log("Uploaded Image to Pinata", res.pinataURL);
        setFileURL(res.pinataURL);
      }
    } catch (error) {
      console.log("Error during file upload", error);
    }
  }

  async function uploadMetadataToIPFS() {
    const { name, description, price } = formParams;
    //console.log(name, description, price, fileURL);
    if (!name || !description || !price || !fileURL) return;

    const nftJSON = {
      name,
      description,
      price,
      image: fileURL,
    };

    try {
      const res = await uploadJSONToIPFS(nftJSON);
      if (res.success === true) {
        console.log("Uploaded JSON to Pinata: ", res);
        return res.pinataURL;
      }
    } catch (error) {
      console.log("Error uploading JSON metadata:", error);
    }
  }

  async function listNFT(e) {
    e.preventDefault();

    try {
      const metadataURL = await uploadMetadataToIPFS();
      //console.log(metadataURL, "sss");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      updateMessage("Please wait ... uploading (upto 5 mins)");

      let contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      const price = ethers.utils.parseUnits(formParams.price, "ether");
      let listingPrice = await contract.getListPrice();
      listingPrice = listingPrice.toString();

      let tx = await contract.createToken(metadataURL, price, {
        value: listingPrice,
      });

      await tx.wait();
      updateMessage("");
      updateFormParams({ name: "", description: "", price: "" });
      window.location.replace("/");
    } catch (error) {
      alert("Upload Error ", error);
    }
  }

  return (
    <Layout title="sellnft">
      <div className="flex flex-col place-items-center mt-10" id="nftForm">
        <form className="bg-blue-100 shadow-md rounded px-8 pt-4 pb-8 mb-4">
          <h3 className="text-center font-bold text-blue-800 mb-8">
            Upload your NFT to the marketplace
          </h3>
          <div className="mb-4">
            <label
              className="block text-blue-800 text-sm font-bold mb-2"
              htmlFor="name"
            >
              NFT Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="NFT#123"
              onChange={(e) =>
                updateFormParams({ ...formParams, name: e.target.value })
              }
              value={formParams.name}
            ></input>
          </div>
          <div className="mb-6">
            <label
              className="block text-blue-800 text-sm font-bold mb-2"
              htmlFor="description"
            >
              NFT Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              cols="40"
              rows="5"
              id="description"
              type="text"
              placeholder="NFT Collection"
              value={formParams.description}
              onChange={(e) =>
                updateFormParams({ ...formParams, description: e.target.value })
              }
            ></textarea>
          </div>
          <div className="mb-6">
            <label
              className="block text-blue-800 text-sm font-bold mb-2"
              htmlFor="price"
            >
              Price (in ETH)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="number"
              placeholder="Min 0.01 ETH"
              step="0.01"
              value={formParams.price}
              onChange={(e) =>
                updateFormParams({ ...formParams, price: e.target.value })
              }
            ></input>
          </div>
          <div>
            <label
              className="block text-blue-800 text-sm font-bold mb-2"
              htmlFor="image"
            >
              Upload Image
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              type="file"
              onChange={onChangeFile}
            ></input>
          </div>
          <br></br>
          <div className="text-green text-center">{message}</div>
          <button
            onClick={listNFT}
            className="font-bold mt-10 w-full bg-gradient-to-bl from-violet-900 to-blue-700 text-white rounded p-2 shadow-lg"
          >
            List NFT
          </button>
        </form>
      </div>
    </Layout>
  );
}
