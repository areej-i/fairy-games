function Password() {
    var x = document.getElementById("content");
    if (x.style.display === "none") {
    	x.style.display = "block";
    } else {
    	x.style.display = "none";
    }
}

function openNav() {
  document.getElementById("sidenav").style.width = "400px";
  document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
  document.getElementById("sidenav").style.width = "0";
  document.getElementById("main").style.marginLeft= "0";
}

// function displayUsers()
// {
// 	console.log("Okay it work");
// 	let req = new XMLHttpRequest();
	
// 	req.onreadystatechange = function()
// 	{
// 		if (this.readyState == 4 && this.status== 200)
// 		{
//       console.log("ummm");
// 			console.log(this.responseText);
// 			let userss = JSON.parse(this.responseText);
			
// 			let usersPlaceHolder = document.getElementById("userList") 
// 			let userList = document.createElement("ul") 
// 			usersPlaceHolder.appendChild(userList);

// 			userss.forEach(u=>{
// 				let li = document.createElement('li');
// 				li.innerHTML = u.username;
// 				userList.appendChild(li);
// 			})
// 		}
// 	}
// 	req.open("GET",`/displayUsers`);
// 	req.send();
// }
//var input, filter, ul, li, a, i, txtValue;

// import('./users.json')
//   .then((users) => {
//     // Do something with the module.
//   });

// function displayUsers() 
// {
// 	import users from "./users.json";
// 	console.log("ummmm");
// 	for (let u in users)
// 	{
// 		var uName = JSON.stringify(users[u].username);
// 		let ul = document.getElementById("usersList");
// 		let li = document.createElement("li");
// 		li.appendChild(document.createTextNode(uName));
// 		ul.appendChild(li);
// 	}
// }
// function myFunction()
// {
// 	// Declare variables
// 	var input, filter, ul, li, a, i, txtValue;
// 	input = document.getElementById('myInput');
// 	filter = input.value.tolowerCase();
// 	ul = document.getElementById("myUL");
// 	li = ul.getElementsByTagName('li');

// 	// Loop through all list items, and hide those who don't match the search query
// 	for (i = 0; i < li.length; i++) {
// 		a = li[i].getElementsByTagName("a")[0];
// 		txtValue = a.textContent || a.innerText;
// 		if (txtValue.toLowerCase().indexOf(filter) > -1) {
// 			li[i].style.display = "";
// 		} else {
// 			li[i].style.display = "none";
// 		}
// 	}
// }

// function search()
// {
// 	var input, filter, ul, li, a, i, txtValue;
// 	input = document.getElementById("myInput");
// 	filter = input.value.toUpperCase();
// 	ul = document.getElementById("userList");
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




