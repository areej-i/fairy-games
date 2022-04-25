Connect4
Areej Irfan
Open Stack IP address: 134.117.133.38
username: student
password: fish123

Files:
server.js - Server that links the pages. Hosted at http://localhost:3000. Intially takes user to home page. 

home.pug - Title page for site, user can go to either login, register or instructions pages through the buttons.

login.pug - Login page for user to sign in, user can cancel and return to the main page, pressing log in button will take user to profile page. 
If user forgets passwords they can request new one. Use username:"noname" and password:1234 to test.

connect4.css - Stylesheet

connect4.js - Javascript for profile.html and login.html. Password() function: If user presses "forgot password?" while they were in login page, 
the prompt for username and email will display. OpenNav() and CloseNav() open and close the settings menu if the user presses it in the profile page.

profile.pug - Displays user information (game stats, profile pic, username etc) in profile. By clicking on settings, the user can modify their profile.

otherProfile.pug - Displays other users profile

profile.css - Stylesheet for profile.pug

help.js - js file for profile.pug

games.json - data for games

users.json- data for users

game.pug - Where user searches for game/creates game

register.pug - User enters information to sign up and play (or cancel and return back to title page). Essentially any input above 5 characters will work, 
you can create username: user123, password: 1234, repeat password: 1234, email: u@mail.com

instructions.pug - Displays instructions and gives option to login, register or return back to title page.

businessLogic.js - This is the client for the server





