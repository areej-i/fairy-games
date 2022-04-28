
var fs = require('fs');
const { callbackify } = require('util');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let users = require("./users.json");

var size = Object.keys(users).length;
let publicUsers = [];


for (let key in users) 
{
  let value = users[key]; //object
  let items = Object.values(value);
  if(items[6] == "public")
  {
    publicUsers.push(value);
    //fs.writeFile('publicUsers.json',value,(err) => {
      //if (err) throw err});
  }
}

/***********************************************************
Parameter is key (string) and array
returns object
*************************************************************/
function getUser(nameKey)
{
  if(!nameKey)
  {
    return null;
  }
  if (userArr[nameKey].hasOwnProperty(nameKey)) 
  {
    return userArr[j];
  }
}
/********************************************************************************
Parameter is object with username, password, email
*********************************************************************************/

function createUser(user,password,email)
{
  user.toLowerCase();
  password.toLowerCase();
  email.toLowerCase();

  if(isUserTaken(user) || !password){
    return false;
  }
  if(password=="password" ||user=="username"){
    return false;
  }
  if((3 > user > 13)){
    return false;
  }
  if((5 > email)){
    return false;
  }
  if(users.hasOwnProperty(email)){
    return false;
  }

  var obj = {};
  var j = {username:user,password:password,email:email,achievements:[0,0],gameHistory:[],friends:[],status:"public",requests:[],
  online:false,profilePic:'profilepic.jpg',badges:[]};
  obj[user] = j;
  var t = Object.assign(users,obj);
  fs.writeFile('users.json',JSON.stringify(t),(err) => {
    if (err) throw err});
   
  return true;
}

/*******************************************************************************
Parameter is object with username, password, repeated password, email
*******************************************************************************/
function isUserTaken(user)
{
	if(users.hasOwnProperty[user]) 
    	return true;
}
/*******************************************
input: string
output: object
********************************************/
function searchUsers(searchTerm)
{
  	for(let b = 0; b < publicUsers.length; b++){
    	if(publicUsers[b].username == searchTerm){
      		return publicUsers[b];
    	}
  	}
  // let results = [];

  // if(!isValidUser(requestingUser)){
  //   return results;
  // }

  // for(let username in users){
  //   let user = users[username];
  //   if(user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0)
  //   {
  //     if(user.username === requestingUser.username || requestingUser.friends.includes(user.username)){
  //       results.push(user);
  //     }
  //   }
  // }
  // return results;
}
/*******************************************
input: string
output: object
*******************************************/
function searchFriends(searchingUser,user)
{
  	if(users[user].friends.length == 0){
    	return;
  	}
  	for(let o = 0; o < users[user].friends.length; o++)
  	{
    	if(users[user].friends[o].hasOwnProperty(searchingUser))
    	{
      		return(users[searchingUser]);
    	}
  	}
  
  return null;
}
/*******************************************
 * input: objects
/*******************************************/
function deleteFriends(userB, userA)
{
	users[userA].friends.pop(userB);
	users[userB].friends.pop(userA);
	fs.writeFile('users.json',JSON.stringify(users),(err) => {
		if (err) throw err});
}
/*******************************************/
/*******************************************/
function requestAccepted()
{
  return true;
}
/*******************************************/
/*******************************************/
function makeFriends(userA, userB){
	users[userA].friends.push(userB);
	users[userB].friends.push(userA);

	for(let b = 0; b<users[userB].requests.length; b++)
	{
		if(users[userB].requests[b] == userA)
		{
			users[userB].requests.splice(b,1);
		}
	}
	fs.writeFile('users.json',JSON.stringify(users),(err) => {
		if (err) throw err});
}
/***********************************
Parameter is object with username, password
************************************/
function login(username, password)
{
  username.toLowerCase();
  password.toLowerCase();
  return (users.hasOwnProperty(username) && users[username].password == password);
}
/***********************************
 * userID
***********************************/
function changeStatus(user)
{
	if(users[user].status == "private")
	{
		users[user].status = "public";
		publicUsers.push(user);
	}
	else 
	{
		users[user].status = "private";
		publicUsers.pop(user);
	}

	publicUsers = [];
	for (let key in users) 
	{
		let value = users[key]; //object
		let items = Object.values(value);
		if(items[6] == "public")
		{
			publicUsers.push(value);
		}
	}
	fs.writeFile('users.json',JSON.stringify(users),(err) => {
		if (err) throw err});
	
	return(users[user].status);
}
/*********************
************************/
function forgotPassword(username,email)
{
  if(users[username].email==email)
  {
    return true;
  }
}
/*********************
************************/
function doesUserExist(name)
{
  if (users.hasOwnProperty(name))
  {
    return true;
  }
}

function deleteRequest(u,other)
{
	console.log(u);
	console.log(other);
	console.log(users);
	console.log(users[u]);
	for (let i = 0; i < users[u].requests.length; i++)
  {
    if(users[u].requests[i]==other)
    {
      users[u].requests.splice(i,1);
    }
  }
  fs.writeFile('users.json',JSON.stringify(users),(err) => {
  if (err) throw err});
}


module.exports = {
  createUser,
  getUser,
  searchUsers,
  makeFriends,
  doesUserExist,
  forgotPassword,
  changeStatus,
  login,
  requestAccepted,
  isUserTaken,
  deleteRequest,
}
