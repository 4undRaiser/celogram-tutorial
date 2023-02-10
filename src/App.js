import "./App.css";
import Home from "./components/home";
import { Posts } from "./components/Posts";
import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import celogram from "./contracts/celogram.abi.json";
import IERC from "./contracts/IERC.abi.json";

const ERC20_DECIMALS = 18;
const contractAddress = "0x2d6dcdA3A131Dc4819EF572c6CE5A0c573E7175E";
const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

function App() {
  const [contract, setcontract] = useState(null);
  const [address, setAddress] = useState(null);
  const [kit, setKit] = useState(null);
  const [cUSDBalance, setcUSDBalance] = useState(0);
  const [posts, setPosts] = useState([]);

  const connectToWallet = async () => {
    if (window.celo) {
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        let kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        const user_address = accounts[0];
        kit.defaultAccount = user_address;

        await setAddress(user_address);
        await setKit(kit);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("Error Occurred");
    }
  };

  const getBalance = useCallback(async () => {
    try {
      const balance = await kit.getTotalBalance(address);
      const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

      const contract = new kit.web3.eth.Contract(celogram, contractAddress);
      setcontract(contract);
      setcUSDBalance(USDBalance);
    } catch (error) {
      console.log(error);
    }
  }, [address, kit]);

  const getPosts = useCallback(async () => {
    const postsLength = await contract.methods.getPostsLength().call();
    const posts = [];
    for (let index = 0; index < postsLength; index++) {
      let _posts = new Promise(async (resolve, reject) => {
        let post = await contract.methods.getPost(index).call();

        resolve({
          index: index,
          user: post[0],
          image: post[1],
          title: post[2],
          description: post[3],
          likes: post[4],
          comments: post[5],
        });
      });
      posts.push(_posts);
    }

    const _posts = await Promise.all(posts);
    setPosts(_posts);
  }, [contract]);

  const addPost = async (_image, _title, _description) => {
    try {
      await contract.methods
        .newPost(_image, _title, _description)
        .send({ from: address });
      getPosts();
    } catch (error) {
      alert(error);
    }
  };

  const addComment = async (_index, _description) => {
    try {
      await contract.methods
        .addComment(_index, _description)
        .send({ from: address });
      getPosts();
    } catch (error) {
      alert(error);
    }
  };

  const likePost = async (_index) => {
    try {
      await contract.methods.likePost(_index).send({ from: address });
      getPosts();
    } catch (error) {
      alert(error);
    }
  };

  const sendTip = async (_index, _ammount) => {
    try {
      const cUSDContract = new kit.web3.eth.Contract(IERC, cUSDContractAddress);

      await cUSDContract.methods
        .approve(contractAddress, _ammount)
        .send({ from: address });
      await contract.methods.sendTip(_index, _ammount).send({ from: address });
      getPosts();
      getBalance();
      alert("you have successfully sent cusd to this user");
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    connectToWallet();
  }, []);

  useEffect(() => {
    if (kit && address) {
      getBalance();
    }
  }, [kit, address, getBalance]);

  useEffect(() => {
    if (contract) {
      getPosts();
    }
  }, [contract, getPosts]);

  return (
    <div className="App">
      <Home cUSDBalance={cUSDBalance} addPost={addPost} />
      <Posts
        posts={posts}
        likePost={likePost}
        addComment={addComment}
        sendTip={sendTip}
        walletAddress={address}
      />
    </div>
  );
}

export default App;
