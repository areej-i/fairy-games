// var fs = require('fs');
// const { callbackify } = require('util');
// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
function displayActiveGames()
{
	let req = new XMLHttpRequest();
	
	req.onreadystatechange = function()
	{
		let games = this.responseText;
		if (this.readyState == 4 && this.status== 200)
		{
			for(let i = 0; i < games.length;i++)
			{
				if(games[i][2]!="private")
				{
					var table = document.getElementById("table");
					var tr = document.createElement("tr");
					var td = document.createElement("td");
					var td2 = document.createElement("td");
					var td3 = document.createElement("td");
					td.innerHTML = games[i][0];
					td2.setAttribute('onclick',"location.href='/users/"+games[i][1]+"'")
					td2.setAttribute('style',"cursor:pointer","text-decoration: underline")
					td2.innerHTML = games[i][1];
					td3.innerHTML = games[i][2];
					tr.appendChild(td);
					tr.appendChild(td2);
					tr.appendChild(t3);
					table.appendChild(tr);
				}
			}
		}
	}
	req.open("GET",`/displayActiveGames`,true);
	req.send();
}


function displayUsers()
{
	let req = new XMLHttpRequest();
	
	req.onreadystatechange = function()
	{
		let users = JSON.parse(this.responseText);
		if (this.readyState == 4 && this.status== 200){
			console.log(this.responseText);
			for (let u in users){
				var ul = document.getElementById("userList");
				var li = document.createElement("li");
				var a = document.createElement("a");
				a.setAttribute('href',"/users/"+users[u].username)
				li.appendChild(a);
				a.appendChild(document.createTextNode(users[u].username));
				ul.appendChild(li);
			}
		}
	}
	req.open("GET",`/displayUsers`,true);
	req.send();
}

function displayFriends()
{
	let req = new XMLHttpRequest();
	
	req.onreadystatechange = function()
	{
		let friends = JSON.parse(this.responseText);
		//let friends = this.responseText;
		if (this.readyState == 4 && this.status== 200)
		{
			for(let v = 0; v<friends.length; v++)
			{
				var ul = document.getElementById("friendList");
				var li = document.createElement("li");
				var a = document.createElement("a");
				var button1 = document.createElement("button");

				button1.innerHTML = "✕";
				button1.setAttribute('id',"delete");
				button1.setAttribute("style","cursor:pointer");
				button1.onclick = function() {
					modal.style.display = "block";
				}

				var but = document.getElementById("myBtn");
				var str = "location.href = '../deleteFriend/"+friends[v]+"'";
				but.setAttribute("onclick",str);

				a.setAttribute('href',"/users/"+friends[v]);
				li.appendChild(a);
				li.appendChild(button1);
				a.appendChild(document.createTextNode(friends[v]));
				ul.appendChild(li);


			}
		}
	}
	req.open("GET",`/displayFriends`,true);
	req.send();
}

function displayRequests()
{
	let req = new XMLHttpRequest();
	
	req.onreadystatechange = function()
	{
		let friends = JSON.parse(this.responseText);
		//let friends = this.responseText;
		if (this.readyState == 4 && this.status== 200)
		{
			for(let v = 0; v<friends.length; v++)
			{
				var ul = document.getElementById("requestList");
				var sum = document.getElementById("sum");
				sum.setAttribute('style','border-radius: 1rem 1rem 0rem 0rem');
				var li = document.createElement("li");
				var a = document.createElement("a");

				var button1 = document.createElement("button");
				button1.innerHTML = "✕";
				a.setAttribute('href',"/users/"+friends[v]);
				button1.setAttribute('id',"delete");
				var str = "location.href = '../deleteRequest/"+friends[v]+"'";
				button1.setAttribute("onclick",str)
				button1.setAttribute("style","cursor:pointer")
				
				var button2 = document.createElement("button");
				button2.setAttribute('id',"add");
				var str2 = "location.href = '../addRequest"+friends[v]+"'";
				button2.setAttribute("onclick",str2)
				button2.innerHTML = " <img src = \"/checkmark.png\" style= \"width:16px\"alt = \"check\">";
				button2.setAttribute("style","cursor:pointer")
				
				li.appendChild(button1);
				li.appendChild(button2);
				li.appendChild(a);
				a.appendChild(document.createTextNode(friends[v]));
				ul.appendChild(li);
			}

			var closebtns = document.getElementById("delete");
			var i;

			/* Loop through the elements, and hide the parent, when clicked on */
			for (i = 0; i < closebtns.length; i++) {
				closebtns[i].addEventListener("click", function() 
				{
					req.open("GET",`/deleteRequests`,true);
					req.send();
				});
			}
		}
	}
	req.open("GET",`/displayRequests`,true);
	req.send();
}

function displayInfo()
{
	let req = new XMLHttpRequest();
	
	req.onreadystatechange = function()
	{
		let friends = JSON.parse(this.responseText);
		//let friends = this.responseText;
		if (this.readyState == 4 && this.status== 200)
		{
			for(let v = 0; v<friends.length; v++)
			{
				var ul = document.getElementById("friendList");
				var li = document.createElement("li");
				var a = document.createElement("a");
				// a.style.color = "white";
				a.setAttribute('href',"/users/"+friends[v]);
				li.appendChild(a);
				a.appendChild(document.createTextNode(friends[v]));
				ul.appendChild(li);
			}
		}
	}
	req.open("GET",`/otherInfo`,true);
	req.send();
}

function searchReq()
{
	var closebtns = document.getElementsByClassName("close");
	var i;

	/* Loop through the elements, and hide the parent, when clicked on */
	for (i = 0; i < closebtns.length; i++) {
		closebtns[i].addEventListener("click", function() 
		{
			this.parentElement.style.display = 'none';
		});
	}

}

function sendRequest(user,other)
{
	let c = 0
	var button = document.getElementById("button");
	for (let g = 0; g < userss[other].requests.length;g++)
	{
		if(userss[other].requests[g] == user)
		{
			c++;
		}
	}
	if(c == 0)
	{
		userss[other].requests.push(user);
		fs.writeFile('users.json',JSON.stringify(userss),(err) => {
			if (err) throw err});
    }
    else
    {
        button.setAttribute("style","pointer-events:none");
	}
	// 	button.setAttribute("style","display:show");
}


function search()
{
	var input, filter, ul, li, a, i, txtValue;
	input = document.getElementById("myInput");
	// input.setAttribute('style','color:#373795;');
	filter = input.value.toUpperCase();
	ul = document.getElementById("userList");
	li = ul.getElementsByTagName("li");
	for (i = 0; i < li.length; i++) 
	{
		a = li[i].getElementsByTagName("a")[0];
		txtValue = a.textContent || a.innerText;
		// a.style.color = "white";
		if (txtValue.toUpperCase().indexOf(filter) > -1) 
		{
			li[i].style.display = "";
		}
		else
		{
			li[i].style.display = "none";
		}
	}
}

function searchFriends()
{
	var input, filter, ul, li, a, i, txtValue;
	input = document.getElementById("fInput");
	filter = input.value.toUpperCase();
	ul = document.getElementById("friendList");
	li = ul.getElementsByTagName("li");
	for (i = 0; i < li.length; i++) 
	{
		a = li[i].getElementsByTagName("a")[0];
		txtValue = a.textContent || a.innerText;
		if (txtValue.toUpperCase().indexOf(filter) > -1) 
		{
			li[i].style.display = "";
		}
		else
		{
			li[i].style.display = "none";
		}
	}
}

// function displayGames(){

// }
// function searchGames()
// {
// 	var input, filter, ul, li, a, i, txtValue;
// 	input = document.getElementById("fInput");
// 	filter = input.value.toUpperCase();
// 	ul = document.getElementById("friendList");
// 	li = ul.getElementsByTagName("li");
// 	for (i = 0; i < li.length; i++) 
// 	{
// 		a = li[i].getElementsByTagName("a")[0];
// 		txtValue = a.textContent || a.innerText;
// 		if (txtValue.toUpperCase().indexOf(filter) > -1) 
// 		{
// 			li[i].style.display = "";
// 		}
// 		else
// 		{
// 			li[i].style.display = "none";
// 		}
// 	}
// }