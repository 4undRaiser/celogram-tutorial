// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;


contract Celogram{

uint private postLength = 0;

    struct Post{
        address user;
        string image;
        string title;
        string description;
        uint likes;
    }

    struct Comment{
        address owner;
        string description;
    }


    mapping(uint => Post) internal posts;
    mapping (uint => Comment[]) internal commentsMapping;


    function newPost(
        string memory _image,
        string memory _title,
        string memory _description
         ) 
         public {
            address _user = msg.sender;
            uint _likes = 0;

            posts[postLength] = Post(
                _user,
                _image,
                _title,
                _description,
                _likes
            );
            postLength++;
    }

    function addComment(uint _index, string memory _description) public{
        commentsMapping[_index].push(Comment(msg.sender, _description));
    }

    function likePost(uint _index) public{
        posts[_index].likes++;
    }

    function getPost(uint _index) public view returns(
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


    function getPostsLength() public view returns(uint){
        return(postLength);
    }
}