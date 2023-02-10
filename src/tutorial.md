The following code is a React application that allows users to connect to a wallet and view posts. To start, we import the necessary components and libraries.

import React from "react";
import "./App.css";
import Home from "./components/home";
import { Posts } from "./components/Posts";
import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import celogram from "./contracts/celogram.abi.json";

We set the ERC20 decimals and the contract address:

const ERC20_DECIMALS = 18;
const contractAddress = "0x7A6c28ada0153b8B8b605Acf5617896660D22Bc8";

We use React Hooks to set the initial state for the contract, address, kit, cUSDBalance and posts:

const [contract, setcontract] = useState(null);
const [address, setAddress] = useState(null);
const [kit, setKit] = useState(null);
const [cUSDBalance, setcUSDBalance] = useState(0);
const [posts, setPosts] = useState([]);

We create a connectToWallet function that allows the user to connect to their wallet and sets the address and kit:

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

We create a getBalance function that allows us to get the user's cUSD balance and set the contract:

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

We also create a getPosts function that allows us to get all the posts from the contract and set them in the state:

const getPosts = useCallback(async () => {
const postsLength = await contract.methods.getPostsLength().call();
const posts = [];
for (let index = 0; index < postsLength; index++) {
let \_posts = new Promise(async (resolve, reject) => {
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

We create the addPost, addComment and likePost functions that allow users to interact with the contract:

const addPost = async (\_image, \_title, \_description) => {
try {
await contract.methods
.newPost(\_image, \_title, \_description)
.send({ from: address });
getPosts();
} catch (error) {
alert(error);
}
};

const addComment = async (\_index, \_description) => {
try {
await contract.methods
.addComment(\_index, \_description)
.send({ from: address });
getPosts();
} catch (error) {
alert(error);
}
};

const likePost = async (\_index) => {
try {
await contract.methods.likePost(\_index).send({ from: address });
getPosts();
} catch (error) {
alert(error);
}
};

Finally, we use useEffect to call the connectToWallet, getBalance, and getPosts functions at the appropriate times:

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

And we render the App component and return the Home and Posts components with the necessary props:

return (

<div className="App">
<Home cUSDBalance={cUSDBalance} addPost={addPost} />
<Posts
        posts={posts}
        likePost={likePost}
        addComment={addComment}
        walletAddress={address}
      />
</div>
);

The code above is a Solidity contract called Celogram . Its purpose is to allow users to share posts and comments in a social media platform. The code below is a tutorial that explains each line of the code.

Line 1:
pragma solidity >=0.7.0 <0.9.0;

This line indicates that the code is written for Solidity versions 0.7.0 or higher and 0.9.0 or lower.

Line 3:
contract Celogram{

This line begins the definition of the Celogram contract.

Line 5:
uint private postLength = 0;

This line declares a private variable called postLength that will be used to keep track of the number of posts. It is initialized to 0.

Lines 7-14:
struct Post{
address user;
string image;
string title;
string description;
uint likes;
}

This block creates a custom data type called Post. It is composed of an address that indicates the user who posted the post, a string that contains the image associated with the post, a string that contains the title of the post, a string that contains the description of the post, and a uint (unsigned integer) that stores the number of likes the post has received.

Lines 16-20:
struct Comment{
address owner;
string description;
}

This block creates a custom data type called Comment. It is composed of an address that indicates the user who posted the comment, and a string that contains the description of the comment.

Lines 22-23:
mapping(uint => Post) internal posts;
mapping (uint => Comment[]) internal commentsMapping;

These lines declare two mappings that will be used to store posts and comments. The first mapping (posts) will store posts using an uint as the key and a Post struct as the value. The second mapping (commentsMapping) will store comments using an uint as the key and an array of Comment structs as the value.

Lines 25-45:
function newPost(
string memory \_image,
string memory \_title,
string memory \_description
)
public {
address \_user = msg.sender;
uint \_likes = 0;

        posts[postLength] = Post(
            _user,
            _image,
            _title,
            _description,
            _likes
        );
        postLength++;

}

This function allows a user to create a new post. The function takes three parameters: \_image, \_title, and \_description. It then stores the address of the sender of the transaction (the user who posted the post) in a variable called \_user. It also sets the \_likes value to 0. Finally, it stores the Post in the posts mapping using the postLength variable as the key, and increments postLength.

Lines 47-51:
function addComment(uint \_index, string memory \_description) public{
commentsMapping[_index].push(Comment(msg.sender, \_description));
}

This function allows a user to add a comment to a post. The function takes two parameters: the index of the post the comment is being added to, and the \_description of the comment. It then pushes the Comment struct (containing the address of the sender of the transaction and the comment description) to the commentsMapping mapping, with the post index as the key.

Lines 53-56:
function likePost(uint \_index) public{
posts[_index].likes++;
}

This function allows a user to like a post. The function takes one parameter: the index of the post to be liked. It then increments the likes value of the post stored in the posts mapping.

Lines 58-72:
function getPost(uint \_index) public view returns(
address,
string memory,
string memory,
string memory,
uint,
Comment[] memory
){
Post memory post = posts[_index];
Comment[] memory comments = commentsMapping[_index];
return(
post.user,
post.image,
post.title,
post.description,
post.likes,
comments
);
}

This function allows a user to retrieve a post and its associated comments. The function takes one parameter: the index of the post to be retrieved. It then retrieves the Post struct from the posts mapping and the array of Comment structs from the commentsMapping mapping. Finally, it returns the user address, the image, the title, the description, the number of likes, and the array of comments associated with the post.

Lines 74-77:
function getPostsLength() public view returns(uint){
return(postLength);
}

This function allows a user to retrieve the number of posts. It simply returns the value of the postLength variable.

Line 79:
}

This line closes the definition of the Celogram contract.
