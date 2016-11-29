//================================================================================
// Copyright (C) 2013 Lianja Inc.
// As an unpublished licenced proprietary work.
// All rights reserved worldwide.
//
//--------------------------------------------------------------------------------
//
// File:
//
// 		lianja.js
//
// Purpose:
//
// 		Lianja Web Client library for interacting with the Lianja Cloud Server and
// 		the Lianja desktop client
//
//
// Author:
//
//		Barry Mavin
//
//================================================================================


//================================================================================
function lianja_hasHTML5Storage() {
  	try {
    	return 'localStorage' in window && window['localStorage'] !== null;
  	} catch (e) {
    	return false;
  	}
}

//================================================================================
function readCookie(name)
{
	if (lianja_hasHTML5Storage())
	{
		return window.localStorage.getItem(name);
	}
	else
	{
	    var nameEQ = name + "=";
    	var ca = document.cookie.split(';');
    	for (var i = 0; i < ca.length; i++) {
        	var c = ca[i];
        	while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        	if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    	}
	}
}

//================================================================================
function createCookie(name, value)
{
	if (lianja_hasHTML5Storage())
	{
		return window.localStorage.setItem(name, value);
	}
	else
	{
    	if (days) {
    	    var date = new Date();
    	    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    	    var expires = "; expires=" + date.toGMTString();
    	}
    	else var expires = "";
    	document.cookie = name + "=" + value + expires + "; path=/";
    }
}

//================================================================================
function removeCookie(name)
{
	if (lianja_hasHTML5Storage())
	{
		return window.localStorage.removeItem(name);
	}
	else
	{
    	createCookie(name, "", -1);
    }
}

//================================================================================
function lianja_resize()
{
	var heightOfBody;
	heightOfBody = document.documentElement.clientHeight;
	document.getElementById('body').style.height = heightOfBody;
}

//================================================================================
function lianja_navigate(url)
{
	Lianja.navigate(url);
	return false;
}
	
//================================================================================
function lianja_editprofilesettings()
{
	var changed = Lianja.editProfileSettings(lianja_getprofilename());
	if (changed) 
	{
		//lianja_getuser();
		//lianja_navigate("cloudserver:/appcenter/appcenter.rsp");
		lianja_getprofilepicture();
	}
	return false;
}
	
//================================================================================
function lianja_showDocument(url)
{
	Lianja.showDocument(url);
	return false;
}	
    	
//================================================================================
function lianja_login()
{
	var username = $("#username").val();
	var pw = $("#password").val();
	createCookie("LIANJA_USER", username, 2);
	var rc = Lianja.login(username, pw);
	if (rc)
	{
		window.currentUser = new User({
        		firstName: username,
        		lastName: "",
        		photo: lianja_getprofilepicture(),
        		isAnonymous: false
    	});
		$('#username').val('');
		$('#password').val('');
		$('#username').focus();
	}	
	else
	{
		createCookie("LIANJA_USER", "");
		Lianja.logout();
	}
	return false;
}
	
//================================================================================
function lianja_logout()
{
	createCookie("LIANJA_USER", "");
	Lianja.logout();
	window.currentUser = new User({
        	firstName: "Guest",
        	lastName: "",
        	photo: "../tenants/public/guest/guest.png",
        	isAnonymous: true
	});
	return false;
}

//================================================================================
function lianja_getuser()
{
	var username = readCookie("LIANJA_USER");
	var anon = false;
	if (username == null || username.length == 0) username = Lianja.userName();
	if (username == null || username.length == 0)
	{
	    username = "Guest";
	    anon = true;
	}
	window.currentUser = new User({
        	firstName: username,
        	lastName: "",
        	photo: Lianja.getProfilePicture(username),
        	isAnonymous: anon
    	});
}

//================================================================================
function lianja_getprofilename()
{
	var username = readCookie("LIANJA_USER");
	if (username == null || username.length == 0) username = Lianja.userName();
	if (username == null || username.length == 0)
	{
	    username = "Guest";
	}
	return username;
}

//================================================================================
function lianja_getprofilepicture()
{
	var photo = Lianja.getProfilePicture(lianja_getprofilename());
	if (typeof window.currentUser !== 'undefined') window.currentUser.photo = photo;
	// read the users avatar. 
	// note the use of ?+Math.random() which causes jquery to bypass the cache :)
	var img = new Image();
	$(img)
		.load(function () {
			$("#photo").html(this);
			$(this).fadeIn();
		})
		.attr('src', photo+"?"+Math.random());		
}

//================================================================================
function lianja_signup()
{
	/* TODO: */
	return false;
}

//================================================================================
function lianja_openApp(app)
{
	Lianja.openApp(app);
	return false;
}

//================================================================================
function lianja_isruntimemode()
{
	return Lianja.isRuntimeMode();
}	


//================================================================================
function lianja_iskioskmode()
{
	return Lianja.isKioskMode();
}	


//================================================================================
function lianja_dynamicTileTextReady(app)
{
	var contents = Lianja.getDynamicTileText(app);
	if (contents.indexOf("http:") == 0 || contents.indexOf("https:") == 0)
	{
		// We handle google chart apis so that can be loaded asynchronously preventing any flicker
		if (contents.indexOf("chart.apis.google.com") > 0 || contents.indexOf("chart.googleapis.com") > 0)
		{
 			var img = new Image();
			$(img)
				.load(function () {
					$("#"+app).html(this);
					$(this).fadeIn();
				})
			.attr('src', contents.substr(8));		

			return false;
		}
		else
		{
 			$.ajax({
  				url: contents,
  				success: function(data) {
					$("#"+app).html(data);
  				}
			});
		}

		return false;
	}
	// We handle image urls so that can be loaded asynchronously preventing any flicker
	else if (contents.indexOf("urlimg::") == 0)
	{
 		var img = new Image();
		$(img)
			.load(function () {
				$("#"+app).html(this);
				$(this).fadeIn();
			})
			.attr('src', contents.substr(8));		

		return false;
	}
	// We handle external urls so that can be loaded asynchronously preventing any flicker
	else if (contents.indexOf("url::") == 0)
	{
 		$.ajax({
  			url: contents.substr(5),
  			success: function(data) {
				$("#"+app).html(data);
  			}
		});
		return false;
	}

	// raw html is just replaced in the DOM
	$("#"+app).html(contents);
	return false;
}
