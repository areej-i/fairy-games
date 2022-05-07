const express = require('express');
const app = express();
const fs = require('fs');
const users = require('./users.json');
const connect4Data = require('./games.json');
const model = require('./businessLogic.js');
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.json());
app.set('views',path.join(__dirname,'views'));
app.set('public',path.join(__dirname,'public'));
app.set('view engine','pug');
app.use(express.urlencoded({extended:true}));

//Create session
const session = require('express-session');
app.use(session({ 
    cookie:{ maxAge: 1000000000000},
    secret: 'hello cat',
    resave: true,
    saveUninitialized: true
}));

//set up socket
const sessionMiddleware = session({secret: 'hellocat', resave: false, saveUninitialized: true});
app.use(sessionMiddleware);
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

//connect middlewares
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'pug')

//open port
const port=3000
server.listen(3000, ()=>{console.log('http://localhost:3000/');});

//socket functions
io.on('connection', (socket) => {
    const session = socket.request.session;
    io.emit("chat message", `${session.username} entered the chat`)
    socket.on('chat message', (msg) => {
        io.emit('chat message', `${session.username}: `+msg);
      });
    socket.on('disconnect', () => {
        io.emit("chat message", `${session.username} left the chat`)
    });
});

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
app.get('/instructions',(_req,res)=>{
    res.render('instructions');
})
app.get('/chat',(_req,res)=>{
    res.render('chat');
})
app.get('/chatroom',(_req,res)=>{
    res.render('chatroom');
})

//game functions
app.get("/connect4/:id", auth,renderConnect4)
app.get("/games",publicGameHandler)
app.post("/play/:id/:turn/:col",auth,playMove)
app.post("/creategame",createGame);
app.get("/load/:id/",auth, gameDataHandler)
app.get("/spectateGame/:id",auth,renderSpectateGame)


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
        if(model.createUser(req.body.username,req.body.password,req.body.email))
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
            req.session.badges = users[req.body.username].badges;
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

//auth middleware
function auth(req, _res, next) {
	if(!req.session.loggedin){
     		return;
    }
	next();
}


/*********************  Handling Profile  **************************/
let reqUser;
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
            req.params.profilePic = users[req.params.username].profilePic;
            req.params.badges = users[req.params.username].badges;
            res.status(200).render('otherProfile',{request: req.params});
        }
    }
    else
        res.status(404).send("Profile unavailable");
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

/************************  display info  ***************************/
app.get('/displayUsers', displayUsers);
function displayUsers(req,res)
{
    let UUsers = [];
    for (let u in users){
        if(u != req.session.username){
            UUsers.push(u);
        }
    }
    res.send(JSON.stringify(UUsers));
}
app.get('/getUsersinConvo', getUsersinConvo);
function getUsersinConvo(req,res)
{
    res.send(JSON.stringify(req.session.username));
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

//**************************************** */

app.get('/displayActiveGames', displayActiveGames);
function displayActiveGames(req,res)
{
    res.send(JSON.stringify(users[req.session.username].activeGames))
}

//create a last() function for array types
//get last item of array
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
}
//return data for loading connect4Data
//spectate game, view past game and play game uses this
function gameDataHandler(req,res){
    let id  = req.params.id;
    let query = req.query
    let gameData = getGame(id)
    let index;
    let board;
    if(req.header("Accept") == "application/json"){
        gameData.gameBoard = gameData["history"].last()
        gameData.end = gameData.result != "na"
        res.json(gameData)
    }
    if(Object.keys(query).length != 0){
        if(query.index){
            // console.log("specific game board was requested")
            index = req.query.index
            board = JSON.stringify(getPastGameBoard(id,index))
            let next = parseInt(index) + 1
            let prev = parseInt(index) - 1 
            
            res.render('viewgame',{display:board,id:id,players:gameData.players,index:index,next:next,prev:prev,length:gameData.history.length})
        }
        else{
            // console.log('query param does not exist')
        }
    }
    else{
        // console.log('returning data on game')
    }
}

//return a specific game board
function getPastGameBoard(gid,index){
    return connect4Data[gid].history[index]
}

//render screen
function renderCreateGameScreen(_req,res){
    res.render("game")
}

//user creating game
//check if form is good
//assumption is that a public user is open for connect4Data
//create object
//update users
function createGame(req,res,_next){
    let user = req.session.username
    let opponent = req.body.opponent
    let privacy = req.body.privacy
    
    if(!opponent || !privacy){
        res.status(400).send("incomplete form")
    }
    else if(!Object.keys(users).includes(opponent)){
        res.status(400).send("user does not exist")
    }
    else{
        //make the game, add game to database,update userA active, update opponent active
        let ctr = 0;
        
        for (let key in connect4Data) 
        {
            ctr++;
        }

        ctr++;
        let uid = ctr.toString();

        var obj = {};
        var j = {
            "id":uid,
            "players":[user,opponent],
            "chat":[],
            "turn": 1,
            "history":[[
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0]
            ]],
            "result":"na",
            "privacy":privacy
        };
        obj[uid] = j;
        var t = Object.assign(connect4Data,obj);
        fs.writeFile('games.json',JSON.stringify(t),(err) => {
            if (err) throw err});

        //update users
        users[user].activeGames.push(ctr);
        users[opponent].activeGames.push(ctr);
        fs.writeFile('users.json',JSON.stringify(users),(err) => {
            if (err) throw err});

        res.render("game",{user:req.session.username,activeGames:users[user].activeGames})
    }
}

app.get("/forfeit/:id",auth,forfeitGame)
function forfeitGame(req,res,_next){
    let user = req.session.username
    let opponent; 
    let id = req.params.id
    
    //set winner
    if(connect4Data[id].players[0] == user){
        opponent = connect4Data[id].players[1];
    }
    else{
        opponent = connect4Data[id].players[0];
    }
    connect4Data[id].winner = opponent

    id = Number(id);

    users[user].activeGames = users[user].activeGames.filter((e)=>e != id)
    users[opponent].activeGames = users[opponent].activeGames.filter((e)=>e != id)
    users[opponent].achievements[1] = users[opponent].achievements[1] + 1;

    users[user].gamesHistory.push(id);
    users[opponent].gamesHistory.push(id);

    fs.writeFile('users.json',JSON.stringify(users),(err) => {
        if (err) throw err});

    fs.writeFile('games.json',JSON.stringify(connect4Data),(err) => {
        if (err) throw err});

    console.log("should be redirecting...");
    let activeGames = users[user].activeGames
    res.render("game",{user:req.session.username,activeGames:activeGames})
    console.log("redirected!");
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

/*************************************************************** */
app.get("/game", renderGames);
function renderGames(req,res){
    let user = req.session.username
    let activeGames = users[user].activeGames
    res.render("game",{user:user,activeGames:activeGames})
}

//helper function
function getGame(id){
    for(g in connect4Data){
        if(g == id){
            return connect4Data[g]
        }
    }
}

//user playing a move
//check if the game is good
//check if the move is good
//check if there is winner -> end game, update users
//oherwise make move
//respond with data to update with AJAX
function playMove(req,res,_next){
    let user = req.session.username
    let id = req.params.id
    let col = parseInt(req.params.col) - 1  
    let gameData = getGame(id)
    let board = gameData["history"].last()
    let userB = gameData.players.indexOf(user) == 0 ?  gameData.players.slice(1)[0] : gameData.players.slice(0,1)[0]
    let data = {}

    if(gameData.players.indexOf(user) != gameData.turn-1){
        res.status(200).send("not your turn")
    } 
    else if(gameData.result != "na" ){
        res.json({end:true})
    }
    else{
        if(checkMoveValid(col,board)){
            //update board
            //check winner
            let newBoard = updateBoard(col,board,gameData.turn)
            let winStyle = checkWinner(newBoard)
            data = {}
            if(!winStyle){
                gameData.history.push(newBoard)
                gameData.turn = gameData.turn == 1 ? 2 : 1
                gameData.moves.push(col)
                data = {
                    gameBoard:newBoard,
                    turn:gameData.players[gameData.turn - 1],
                    id:id,
                    end:false
                }

            }
            else{
                //update winner
                //remove from active
                //add to history
                gameData.result = user
                gameData.winStyle = winStyle
                removeFromActive(user,userB,id)
                addGameToHistory(user,userB,id)
                data.gameBoard = newBoard
                data.end = true
                data.winStyle = winStyle
            }
            res.json(data)
        }
        else{
            res.status(400).send("move not valid ")
        }
    }
}


//take in column number 
//return 1 if move is valid, 0 if move is not valid
function checkMoveValid(col_num, board) {
    if (!board[0][col_num]) {
        for (let i = 9; i >= 0; i--) {
            if (!board[i][col_num])
                return 1;
        }
    } 
    else
        return 0;
}

//take move and board
//return modified board
function updateBoard(c, b, t) {
    for (let i = 9; i >= 0; i--) {
        if (!b[i][c]) {
            b[i][c] = t;
            return b;
        }
    }
}

//take in board state
//return 1 if there is a win, return 0 if no winners
function checkWinner(board) {
    let count = 0;
    let game_row = 10
    let game_col = 8
    for (let i = 0; i < game_col; i++) {
        if (board[0][i] != 0) {
            count++;
        }
    }
    if (count == 8) {
        return null; //draw 
    }
    for (let i = 0; i < game_row; i++) {
        for (let j = 0; j < game_col; j++) {
            try {
                let node = board[i][j];
                if (node != 0) {
                    if (j < 5) {
                        if (board[i][j] == board[i][j + 1] && board[i][j] == board[i][j + 2] && board[i][j] == board[i][j + 3]) {return 1;}
                    }
                    if (i < 7) {
                        if (board[i][j] == board[i + 1][j] && board[i][j] == board[i + 2][j] && board[i][j] == board[i + 3][j]) {return 2;}

                        if (node == board[i + 1][j - 1] && node == board[i + 2][j - 2] && node == board[i + 3][j - 3]) {return 3;}

                        if (j < 5) {
                            if (node == board[i + 1][j + 1] && node == board[i + 2][j + 2] && node == board[i + 3][j + 3]) {return 4;}
                        }
                    }
                }

            } catch (err) {
                console.log(err);
            }
        }
    }
    return 0;
}

//add game to both player's history
function addGameToHistory(u,uB,id){
    accountsData[u].history.push(id)
    accountsData[uB].history.push(id)
}
//helper function
//remove games from both player's active array
function removeFromActive(u,uB,id){
    users[u].activeGames = users[u].activeGames.filter((e)=>e != id)
    users[uB].activeGames = users[uB].activeGames.filter((e)=>e != id)
}
//return data on connect4Data for rendering AJAX
function publicGameHandler(req,res){
    let result= [];
    let gameArr = Object.keys(connect4Data)
    //filter if params are given
    if(Object.keys(req.query).length != 0 ){
        if(req.query.player){
            gameArr = result.filter((id)=>connect4Data[id].players.include(req.query.player))
        }
        if(req.query.active){
            gameArr = result.filter((id)=>connect4Data[id].result=="na")
        }
    }
    gameArr.forEach((id)=>{
        let status = connect4Data[id].result=="na"?"in progress":"completed"
        let info = {
            name:connect4Data[id].players,
            status:status
        }
        let completeData;
        if(status == "completed"){
            completeData = {
                winner:connect4Data[id].result, 
                numberOfTurns:connect4Data[id].history.length,
                forfeited:connect4Data[id].forfeit
            }
            info = Object.assign({},info,completeData)
        }
        if(req.query.detail == "full"){
            info = Object.assign({},info,{moves:connect4Data[id].moves})
        }
        result.push(info)      
    })
    res.status(200).json(result)
}

//compare user with user 
//return viewable connect4Data
function getViewableActiveGames(u,uB){
    let results = []

    uB.active.forEach((id)=>{
        let p = connect4Data[id].privacy
        if(p=="friends_only"){
            if(uB.friends.includes(u)){
                results.push(id)
            }
        }
        else if(p=="public"){
            results.push(id)
        }
    })
    return results
}

//compare user with user 
//return viewable connect4Data
function getViewableHistoryGames(u,uB){
    let results = []
    let len = uB.gamesHistory.length
    let last5Arr = len<=5 ? uB.gamesHistory : uB.gamesHistory.slice(len-5,len)
    last5Arr.forEach((id)=>{
        results.push( {
                "id": id,
                "players":connect4Data[id].players,
                "viewable": uB["friends"].includes(u),
                "winner":connect4Data[id].result
        })
    })
    return results
}

function renderSpectateGame(req,res){
    let id = req.params.id
    let gameData = connect4Data[id]
    let board = JSON.stringify(gameData.history[gameData.history.length-1])
    let players = gameData.players
    let chat = gameData.chat
    let turn = gameData.turn
    let privacy = gameData.privacy
    let spectate = true
    res.render("connect4",{gameBoard:board,players:players,chat:chat,turn:turn,privacy:privacy,id:id,spectate:spectate})

}

//render screen
function renderConnect4(req,res){
    let id = req.params.id;
    let gameData = connect4Data[id];
    let board = JSON.stringify(gameData.history[gameData.history.length-1]);
    let players = gameData.players;
    let turn = gameData.turn;
    let privacy = gameData.privacy;
    res.render("connect4",{gameBoard:board,players:players,turn:turn,privacy:privacy,id:id});
}

/*************************************************************** */
