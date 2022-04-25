const express = require('express');
const app = express();
const fs = require('fs');
const users = require('./users.json');
const model = require('./businessLogic.js')
const path = require('path');
// const io = require('socket.io')(server)
const pug = require('pug');

app.use(express.json());
app.set('views',path.join(__dirname,'views'));
app.set('public',path.join(__dirname,'public'));
app.set('view engine','pug');
app.use(express.urlencoded({extended:true}));

//Create session
const session = require('express-session');
//const { searchUsers } = require('./businessLogic.js');
app.use(session({ 
    cookie:{ maxAge: 1000000000000},
    secret: 'hello cat',
    resave: true,
    saveUninitialized: true
}));

// io.on('connection', socket => {
//     console.log('Some client connected')
// })

app.use("/", function(req, _res, next)
{
    console.log(req.session);
    console.log("Request from user: " + req.session.username);
    next();
});

app.use(express.static(__dirname +'/public'))

//Rendering pages
app.get('/',(_req,res)=>{
    res.render('home');
})
app.get('/home',(_req,res)=>{
    res.render('home');
})
app.get('/games',(_req,res)=>{
    res.render('game');
})
app.get('/instructions',(_req,res)=>{
    res.render('instructions');
})


/**********************  Handling register  **********************/
app.get('/register',(req,res)=>
{
    res.render('register',{session:req.session});
})
app.post('/signUpUser', signUpUser);
function signUpUser(req, res)
{
    if(session.loggedin)
    {
        res.send("You are already logged in");
    }
    else
    {
        if(model.createUser(req.body.username,req.body.password,req.body.repeatPass,req.body.email))
        {
            req.session.username = req.body.username;
            req.session.loggedin = true;
            req.session.online = true;
            users[req.body.username].online = true;
            fs.writeFile('users.json',JSON.stringify(users),(err) => {
                if (err) throw err});
            req.session.status = users[req.body.username].status;
            req.session.achievements = users[req.body.username].achievements;
            req.session.gamesHistory = users[req.body.username].gamesHistory;
            req.session.friends = users[req.body.username].friends;
            req.session.requests = users[req.body.username].requests;
            req.session.profilePic = users[req.body.username].profilePic;
            res.status(200).redirect('/users/' + req.body.username);
        }
        else
            res.status(401).send("Invalid credentials.");
    }
}

/**********************  Handling Log in  *************************/
app.get('/login',(req,res)=>
{
    res.render('login',{session:req.session});
})
app.post('/loginUser', loginUser);
function loginUser (req, res)
{
    console.log("Trying to log in with: "+req.body.username);
    if(session.loggedin)
    {
        res.status(401).send("You are already logged in");
    }
    else
    {
        if(model.login(req.body.username, req.body.password))
        {   
            req.session.username = req.body.username;
            req.session.loggedin = true;
            req.session.online = true;
            users[req.body.username].online = true;
            fs.writeFile('users.json',JSON.stringify(users),(err) => {
                if (err) throw err});
            req.session.status = users[req.body.username].status;
            req.session.achievements = users[req.body.username].achievements;
            req.session.gamesHistory = users[req.body.username].gamesHistory;
            req.session.friends = users[req.body.username].friends;
            req.session.requests = users[req.body.username].requests;
            req.session.profilePic = users[req.body.username].profilePic;
            res.status(200).redirect('/users/' + req.body.username);
        }
        else
        {   //they did not log in successfully.
            res.status(401).send("Wrong username or password was entered.");
        }
    }
}
app.get("/logOut", function logOut(req,res)
{
    users[req.session.username].online = false;
        fs.writeFile('users.json',JSON.stringify(users),(err) => {
        if (err) throw err});
    req.session.destroy();
    res.redirect('/home');
})
/****************************************************************/

let reqUser;


/*********************  Handling Profile  **************************/
app.get("/users",getUserProfile);
function getUserProfile (req, res)
{
    res.status(200).render('profile',{session: req.session}); 
}
app.get("/users/:username", getProfile);
function getProfile (req, res)
{
    console.log("Getting user with name: " + req.params.username);
    //let findUser = req.query.username;
    //let y = model.searchUsers(findUser);

    if(model.doesUserExist(req.params.username) && req.session.loggedin)
    {
        if(req.session.username == req.params.username)
        {
            res.status(200).render('profile',{session: req.session});  
        }  
        else if(users[req.params.username].status == 'public')
        {
            reqUser = req.params.username;
            req.params.status = users[req.params.username].status;
            req.params.online = users[req.params.username].online;
            req.params.achievements = users[req.params.username].achievements;
            req.params.gamesHistory = users[req.params.username].gamesHistory;
            req.params.friends = users[req.params.username].friends;
            req.params.requests = users[req.params.username].requests;
            res.status(200).render('otherProfile',{request: req.params});
        }
    }
    else
        res.status(404).send("Profile unavailable");
}

/************************  display info  ***************************/
app.get('/displayUsers', displayUsers);
function displayUsers(_req,res)
{
    res.send(JSON.stringify(users))
}
app.get('/otherInfo', otherInfo);
function otherInfo(_req,res)
{
    res.send(JSON.stringify(users[reqUser].friends))
}
app.get('/displayFriends', displayFriends);
function displayFriends(req,res){
    res.send(JSON.stringify(users[req.session.username].friends))
}
app.get('/getRequests/:username', getRequests);
function getRequests(req,_res,_next)
{
    let c = 0;
    for (let g = 0; g < users[reqUser].requests.length;g++)
	{
        if(users[reqUser].requests[g] == req.session.username)
        {
            c++;
        }
	}
    if(c == 0)
    {
        users[reqUser].requests.push(req.session.username);
        //res.sendRequest(JSON.stringify(users[reqUser].requests));
        fs.writeFile('users.json',JSON.stringify(users),(err) => {
            if (err) throw err});
    }
}
app.get('/displayRequests', displayRequests);
function displayRequests(req,res)
{
    res.send(JSON.stringify(users[req.session.username].requests))
}
app.get('/displayActiveGames', displayActiveGames);
function displayActiveGames(req,res)
{
    res.send(JSON.stringify(users[req.session.username].activeGames))
}

/****************************************************************/

app.get('/deleteRequest/:username', deleteRequests);
function deleteRequests(req,res)
{
    console.log(req.params.username);
    model.deleteRequest(req.session.username,req.params.username);
    res.status(200).redirect('/users/' + req.session.username);
}
app.get('/deleteFriend/:username', deleteRequests);
function deleteFriends(req,res)
{
    console.log(req.params.username);
    model.deleteFriends(req.session.username,req.params.username);
    res.status(200).redirect('/users/' + req.session.username);
}
app.get('/addRequest/:username', addRequests);
function addRequests(req,res)
{
    model.makeFriends(req.params.username,req.session.username);
    res.status(200).redirect('/users/' + req.session.username);
}
app.post('/searchUsers',searchUsers);
function searchUsers(req,res)
{
    let findUser = req.query.username;

    console.log('searching for user: '+findUser);

    let y = model.searchUsers(findUser);
    if(model.doesUserExist(findUser))
    {
        console.log('user found');
        res.send(JSON.stringify(y));
    }
}
app.get('/changeStatus', function(req, res)
{
    console.log("Changing status...")
    if (req.session.status == 'public')
        req.session.status = 'private';
    else if (req.session.status == 'private')
        req.session.status = 'public';
    let stat = model.changeStatus(req.session.username);
    req.session.status = stat;
    res.status(200).redirect('/users/' + req.session.username);
});

/*************************************************************** */

app.get('searchGames')
/*************************************************************** */
var server = app.listen(3000);
// HTTP Keep-Alive to a short time to allow graceful shutdown
server.on('connection', function (socket) {
    socket.setTimeout(4 * 1000);
});
// Handle ^C
process.on('SIGINT', shutdown);
// Do graceful shutdown
function shutdown() {
  console.log('shutting down express...');
  server.close(function () 
  {
    users[req.session.username].online = false;
    fs.writeFile('users.json',JSON.stringify(users),(err) => {
    if (err) throw err});
    process.exit()
  });
}
console.log("Server listening at http://localhost:3000")

