//================================================================================
// Copyright (C) 2015 Lianja Inc.
// As an unpublished licensed proprietary work.
// All rights reserved worldwide.
//
//--------------------------------------------------------------------------------
//
// File:
//
// 		LianjaCloudDataServices.js
//
// Purpose:
//
// 		Lianja Cloud Data Services JavaScript library
//
// Dependencies:
//
//		jQuery
//
// Author:
//
//		Barry Mavin
//
//================================================================================


//================================================================================
window.Lianja = function() {
	this.requiremap = [];
};

//================================================================================
window.Lianja.User = function(param) 
{
    this.firstName = param.firstName;
    this.lastName = param.lastName;
    this.photo = param.photo;
    this.isAnonymous = param.isAnonymous;
};

//================================================================================
window.Lianja.rpc = function()
{
	var self = this;
	
	//----------------------------------------------------------------------------
	this.login = function(username, password, callback) {
		Lianja.removeCookieVar("LIANJAAUTHTOKEN");
		Lianja.removeCookieVar("LIANJAUSER");
		Lianja.removeCookieVar("LIANJAUSERDOMAIN");

		$.ajaxSetup({
			headers: {
				'lianjaAuthorization': "Basic " + base64_encode(username + ":" + password)
			}
		});
		
		// POST the request 
		var request = $.ajax({
			cache: false,
			async: false,
			dataType: "text",
			url: "/authenticate.rsp",
			type: "get"
		});

		if (typeof callback !== 'undefined')
		{
			request.done(function (response, textStatus, jqXHR) {
				if (response === "Ok") 
				{
					callback(true);
				}
				else callback(false);
			});

			request.fail(function (jqXHR, textStatus, errorThrown){
				callback(false);
			});
		}
		
		return request;
	};
	
	//----------------------------------------------------------------------------
	this.isLoggedIn = function(callback) {
		// POST the request 
		var request = $.ajax({
			url: "/authenticate.rsp",
			type: "get"
		});

		if (typeof callback !== 'undefined')
		{
			request.done(function (response, textStatus, jqXHR) {
				if (response === "Ok") callback(true);
				else callback(false);
			});

			request.fail(function (jqXHR, textStatus, errorThrown){
				callback(false);
			});
		}
		
		return request;
	};
	
	//----------------------------------------------------------------------------
	this.logout = function() {
		Lianja.removeCookieVar("LIANJAAUTHTOKEN");
		Lianja.removeCookieVar("LIANJAUSER");
		Lianja.removeCookieVar("LIANJAUSERDOMAIN");
	};
	
	//----------------------------------------------------------------------------
	this.evaluateSync = function(expr)
	{
		var url = "/odata?$eval="+expr;
		var result = $.ajax({
			url: url,
			type: "get",
			dataType: 'json',
			contentType: "application/json",
			cache: false,
			async: false
		});
		var retval = str_replace("\r\n", "", result.responseText);
		return retval;
	};
	
	//----------------------------------------------------------------------------
	this.evaluate = function(expr, onsuccess, onerror, args)
	{
		if (typeof onsuccess === 'undefined' && typeof onerror === 'undefined' && typeof args === 'undefined')
		{
			var result = self.evaluateSync(expr);
			try
			{
				var oresult = JSON.parse(result);
				return oresult.result;
			}
			catch (e)
			{
				console.log(result);
				return undefined;
			}
		}
		var url = "/odata?$eval="+expr;
		Lianja.OData_ReadJSON(
			url, 
			function(status, result, args)
			{
				if (status) args.onsuccess(result.result, args.args);
				else args.onerror(args.args);
			},
			{ "onsuccess" : onsuccess, "onerror" : onerror, "args":args }
		);
	};
};

//================================================================================
window.Lianja.hasHtml5Storage = function() {
  	try {
    	return 'localStorage' in window && window['localStorage'] !== null;
  	} catch (e) {
    	return false;
  	}
};

//================================================================================
window.Lianja.readCookie = function(name)
{
	if (Lianja.hasHtml5Storage())
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
};

//================================================================================
window.Lianja.createCookie = function(name, value, days)
{
	var expires;
	
	if (typeof days === 'undefined') days = 365;
	
	if (Lianja.hasHtml5Storage())
	{
		return window.localStorage.setItem(name, value);
	}
	else
	{
    	if (days>0) {
    	    var date = new Date();
    	    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    	    expires = "; expires=" + date.toGMTString();
    	}
    	else 
		{
			expires = "; expires=Thu, 01 Jan 1970 00:00:01 GMT";
		}
    	document.cookie = name + "=" + value + expires + "; path=/";
    }
};

//================================================================================
window.Lianja.removeCookie = function(name)
{
	if (Lianja.hasHtml5Storage())
	{
		return window.localStorage.removeItem(name);
	}
	else
	{
    	Lianja.createCookie(name, "", -1);
    }
};

//================================================================================
window.Lianja.readCookieVar = function(name)
{
	try {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1, c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
		}
	} 
	catch(e)
	{
		return null;
	}
};

//================================================================================
window.Lianja.createCookieVar = function(name, value, days)
{
	var expires;
	
	if (typeof days === 'undefined') days = 365;
	
	if (days>0) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toGMTString();
		document.cookie = name + "=" + value + expires + "; path=/";
	}
	else 
	{
		var date = new Date();
		date.setDate(date.getDate() -1);
		document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";	
	}
};

//================================================================================
window.Lianja.removeCookieVar = function(name)
{
   	Lianja.createCookieVar(name, "", -1);
};

//================================================================================
window.Lianja.isDevMode = function()
{
	return false;
};

//================================================================================
window.Lianja.login = function(username, pw, callback)
{
	if (username.length==0 || pw.length==0)
	{
		if (typeof callback !== 'undefined')
		{
			callback(false);
		}
		return;
	}
	
	Lianja.removeCookieVar("LIANJAUSER");
	Lianja.removeCookieVar("LIANJADOMAIN");
	
	var promise = Lianja.cloudserver.login(username, pw, callback);
	
	return promise;
};
	
//================================================================================
window.Lianja.verifyLoggedIn = function()
{
	if (typeof LianjaAppBuilder !== 'undefined') return;
	var username = Lianja.readCookieVar("LIANJAUSER");
	
	if (username == null || username.length == 0)
	{
		return false;
	}
	else
	{
		return true;
	}	
};
	
//================================================================================
window.Lianja.logout = function()
{
	Lianja.removeCookieVar("LIANJAUSER");
	Lianja.removeCookieVar("LIANJAUSERDOMAIN");
	Lianja.cloudserver.logout();
	return false;
};


//================================================================================
window.Lianja.hasHTML5Storage = function() {
  	try {
    	return 'localStorage' in window && window['localStorage'] !== null;
  	} catch (e) {
    	return false;
  	}
};

//================================================================================
window.Lianja.readCookie = function(name)
{
	if (Lianja.hasHTML5Storage())
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
};

//================================================================================
window.Lianja.createCookie = function(name, value, days)
{
	if (Lianja.hasHTML5Storage())
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
};

//================================================================================
window.Lianja.removeCookie = function(name)
{
	if (Lianja.hasHTML5Storage())
	{
		return window.localStorage.removeItem(name);
	}
	else
	{
    	createCookie(name, "", -1);
    }
};

//================================================================================
window.Lianja.getUser = function()
{
	var username = Lianja.readCookieVar("LIANJAUSER");
	var anon = false;
	if (username == null || username.length == 0) 
	{
		if (typeof LianjaAppBuilder !== 'undefined') username = LianjaAppBuilder.userName();
	}
	if (username == null || username.length == 0)
	{
	    username = "Guest";
	    anon = true;
	}
	
	return username;
};
window.username = window.Lianja.getUser;
window.userName = window.Lianja.getUser;

//================================================================================
window.Lianja.getProfileName = function()
{
	var username = Lianja.readCookieVar("LIANJAUSER");
	if (username == null || username.length == 0) username = Lianja.userName();
	if (username == null || username.length == 0)
	{
	    username = "Guest";
	}
	return username;
};

//================================================================================
window.Lianja.postForm = function(id, targeturl, callback)
{
	// variable to hold request
	var request;
	
	// bind to the submit event of our form
	$(id).submit(function(event) {
		// abort any pending request
		if (request) {
			request.abort();
		}
		
		// setup some local variables
		var $form = $(this);
		
		// let's select and cache all the fields
		var $inputs = $form.find("input, select, button, textarea");
		
		// serialize the data in the form
		var serializedData = $form.serialize();

		// let's disable the inputs for the duration of the ajax request
		$inputs.prop("disabled", true);

		// POST the request 
		request = $.ajax({
			url: targeturl,
			type: "POST",
			data: serializedData
		});

		// callback handler that will be called on success
		request.done(function (response, textStatus, jqXHR){
			// log a message to the console
			//////c_onsole.log("postForm Ok");
			if (typeof callback === 'function') callback(true, response);
		});

		// callback handler that will be called on failure
		request.fail(function (jqXHR, textStatus, errorThrown){
			// log the error to the console
			////c_onsole.log("postForm failed error: " + textStatus, errorThrown);
			if (typeof callback === 'function') callback(true, response);
		});

		// callback handler that will be called regardless
		// if the request failed or succeeded
		request.always(function () {
			// reenable the inputs
			$inputs.prop("disabled", false);
		});

		// prevent default posting of form
		event.preventDefault();
	});
};

//================================================================================
window.Lianja.postData = function(postdata, targeturl, callback)
{
	// variable to hold request
	var request;
	
	// POST the request 
	request = $.ajax({
		url: targeturl,
		type: "POST",
		data: postdata
	});

	// callback handler that will be called on success
	request.done(function (response, textStatus, jqXHR){
		// log a message to the console
		//////c_onsole.log("postData Ok");
		if (typeof callback === 'function') callback(true, response);
	});

	// callback handler that will be called on failure
	request.fail(function (jqXHR, textStatus, errorThrown){
		// log the error to the console
		////c_onsole.log("postData failed error: " + textStatus, errorThrown);
		if (typeof callback === 'function') callback(false);
	});

	// prevent default posting of form
	event.preventDefault();
};

//================================================================================
window.Lianja.getBaseURL = function()
{
	var url = location.href;  			// window.location.href;
	var pathname = location.pathname;  	// window.location.pathname;
	var index1 = url.indexOf(pathname);
	var index2 = url.indexOf("/", index1 + 1);
	var baseLocalUrl = url.substr(0, index2);
	return baseLocalUrl + "/";
};

//================================================================================
window.Lianja.getUrl = function(url, args, callback)
{
	var seqno;
	
	if (typeof args === 'undefined') args = {};
	
	var promise = $.ajax({
		url: url,
		type: "get",
		crossDomain: true,
		dataType: "html",
		async:true,
		contentType: "application/html; charset=utf-8",
        //jsonpCallback: self.jsonpcallback,
		mycallback: callback,
		myargs: args,
		success: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(true, response, this.myargs);
		},
		error: function (jqXHR, textStatus, errorThrown) {
			if (typeof this.mycallback === 'function') this.mycallback(false, "", this.myargs);
		}
	});
	
	return promise;
};

//================================================================================
window.Lianja.OData_Create = function(url, data, callback, args, async)
{
	if (typeof LianjaAppBuilder === "object")
	{
		if (typeof data === 'object') data = JSON.stringify(data);
		var result = LianjaAppBuilder.OData("create", url, data);
		if (result[0] == '{')
		{
			callback(true, result, args);
		}
		else if (result === "Ok")
		{
			callback(true, result, args);
		}
		else if (result.length > 2 && result.substring(0, 6) !== "error:")
		{
			callback(true, result, args);
		}
		else
		{
			callback(false, result, args);
		}
		return;
	}
	
	if (typeof async !== 'boolean') async = false;
	if (typeof callback === 'undefined') async = false;
	if (typeof data === 'object') data = JSON.stringify(data);
	
	var request = $.ajax({
		url: url,
		contentType: "application/json",
		dataType: 'json',
		async: async,
		cache: false,
		type: "POST",
		data: data,
		mycallback: callback,
		myargs: args,
		success: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(true, response, this.myargs);
		},
		error: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(false, textStatus, this.myargs);
		}
	});
	
	if (!async)
	{
		return request.status == 200;
	}
	else
	{
		return false;
	}
};

//================================================================================
window.Lianja.OData_ReadHTML = function(url, callback, args, async)
{
	if (typeof async !== 'boolean') async = true;
	
	var promise = $.ajax({
		url: url,
		dataType: 'html',
		contentType: "application/html; charset=utf-8",
		async: async,
		cache: false,
		type: "GET",
		mycallback: callback,
		myargs: args,
		success: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(true, response, this.myargs);
		},
		error: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(false, textStatus, this.myargs);
		}
	});
	
	return promise;
};

//================================================================================
window.Lianja.OData_Read = function(url, callback, args, async)
{
	if (typeof LianjaAppBuilder === "object")
	{
		var result = LianjaAppBuilder.OData("read", url, "");
		if (result[0] == '{')
		{
			callback(true, result, args);
		}
		else if (result === "Ok")
		{
			callback(true, result, args);
		}
		else if (result.length > 2 && result.substring(0, 6) !== "error:")
		{
			callback(true, result, args);
		}
		else
		{
			callback(false, result, args);
		}
		return;
	}

	if (typeof async !== 'boolean') async = true;

	var promise = $.ajax({
		url: url,
		type: "GET",
		contentType: "application/html; charset=utf-8",
		mycallback: callback,
		dataType: 'json',
		async: async,
		cache: false,
		myargs: args,
		success: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') 
			{
				this.mycallback(true, response, this.myargs);
			}
		},
		error: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(false, textStatus, this.myargs);
		}
	});

	return promise;
};

//================================================================================
window.Lianja.OData_ReadJSON = function(url, callback, args, async)
{
	if (typeof async !== 'boolean') async = true;
	if (typeof callback === 'undefined') async = false;

	var promise = $.ajax({
		url: url,
		type: "GET",
		dataType: 'json',
		contentType: "application/json",
		mycallback: callback,
		async: async,
		cache: false,
		myargs: args,
		success: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(true, response, this.myargs);
		},
		error: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(false, textStatus, this.myargs);
		}
	});

	return promise;
};

//================================================================================
window.Lianja.OData_Update = function(url, data, callback, args, async)
{
	if (typeof LianjaAppBuilder === "object")
	{
		if (typeof data === 'object') data = JSON.stringify(data);
		var result = LianjaAppBuilder.OData("update", url, data);
		if (result[0] == '{')
		{
			callback(true, result, args);
		}
		else if (result === "Ok")
		{
			callback(true, result, args);
		}
		else if (result.length > 2 && result.substring(0, 6) !== "error:")
		{
			callback(true, result, args);
		}
		else
		{
			callback(false, result, args);
		}
		return true;
	}

	if (typeof async !== 'boolean') async = false;	// BM-async
	if (typeof callback === 'undefined') async = false;
	if (typeof data === 'object') data = JSON.stringify(data);
	
	var request = $.ajax({
		url: url,
		async: async,
		cache: false,
		type: "PUT",
		dataType: 'json',
		contentType: "application/json",
		data: data, 
		mycallback: callback,
		myargs: args,
		success: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(true, response, this.myargs);
		},
		error: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(false, textStatus, this.myargs);
		}
	});
	
	if (!async)
	{
		return request.status == 200;
	}
	else
	{
		return false;
	}
};

//================================================================================
window.Lianja.OData_UpdateHTML = function(url, data, callback, args, async)
{
	if (typeof async !== 'boolean') async = true;
	if (typeof callback === 'undefined') async = false;

	var request = $.ajax({
		url: url,
		async: async,
		cache: false,
		type: "PUT",
		dataType: 'html',
		contentType: "application/html",
		data: data, 
		mycallback: callback,
		myargs: args,
		success: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(true, response, this.myargs);
		},
		error: function (response, textStatus, jqXHR) {
			console.log(response);
			if (typeof this.mycallback === 'function') this.mycallback(false, textStatus, this.myargs);
		}
	});

	if (!async)
	{
		return request.status == 200;
	}
	else
	{
		return false;
	}		
};

//================================================================================
window.Lianja.OData_Delete = function(url, data, callback, args, async)
{
	if (typeof LianjaAppBuilder === "object")
	{
		if (typeof data === 'object') data = JSON.stringify(data);
		var result = LianjaAppBuilder.OData("delete", url, data);
		if (result[0] == '{')
		{
			callback(true, result, args);
		}
		else if (result === "Ok")
		{
			callback(true, result, args);
		}
		else if (result.length > 2 && result.substring(0, 6) !== "error:")
		{
			callback(true, result, args);
		}
		else
		{
			callback(false, result, args);
		}
		return;
	}

	if (typeof async !== 'boolean') async = false;	
	if (typeof callback === 'undefined') async = false;
	if (typeof data === 'object') data = JSON.stringify(data);

	var request = $.ajax({
		url: url,
		async: async,
		cache: false,
		type: "DELETE",
		dataType: 'json',
		contentType: "application/json",
		data: data, 
		mycallback: callback,
		myargs: args,
		success: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(true, response, this.myargs);
		},
		error: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(false, textStatus, this.myargs);
		}
	});

	if (!async)
	{
		return request.status == 200;
	}
	else
	{
		return false;
	}	
};

//================================================================================
window.Lianja.evaluate = function(expr, onsuccess, onerror, args)
{
	if (typeof LianjaAppBuilder === "object")
	{
		var result = LianjaAppBuilder.evaluate(expr);
		if (typeof onsuccess == 'function') onsuccess(result, args);
		return result;
	}
	else
	{
		var result = Lianja.cloudserver.evaluate(expr, onsuccess, onerror, args);
		if (typeof result === 'string')
		{
			if (result === "True") result = true;
			if (result === "False") result = false;
		}
		return result;
	}
};

//================================================================================
window.Lianja.evaluateJavaScript = function(expr, onsuccess, onerror, args)
{
	if (typeof LianjaAppBuilder === "object")
	{
		var result = LianjaAppBuilder.evaluateFileFunction("javascript:"+expr);
		if (typeof onsuccess == 'function') onsuccess(result, args);
		return result;
	}
	else
	{
		var result = Lianja.cloudserver.evaluate("javascript:"+expr, onsuccess, onerror, args);
		if (typeof result === 'string')
		{
			if (result === "True") result = true;
			if (result === "False") result = false;
		}
		return result;
	}
};

//================================================================================
window.Lianja.evaluatePHP = function(expr, onsuccess, onerror, args)
{
	if (typeof LianjaAppBuilder === "object")
	{
		var result = LianjaAppBuilder.evaluateFileFunction("php:"+expr);
		if (typeof onsuccess == 'function') onsuccess(result, args);
		return result;
	}
	else
	{
		var result = Lianja.cloudserver.evaluate("php:"+expr, onsuccess, onerror, args);
		if (typeof result === 'string')
		{
			if (result === "True") result = true;
			if (result === "False") result = false;
		}
		return result;
	}
};

//================================================================================
window.Lianja.evaluatePython = function(expr, onsuccess, onerror, args)
{
	if (typeof LianjaAppBuilder === "object")
	{
		var result = LianjaAppBuilder.evaluateFileFunction("python:"+expr);
		if (typeof onsuccess == 'function') onsuccess(result, args);
		return result;
	}
	else
	{
		var result = Lianja.cloudserver.evaluate("python:"+expr, onsuccess, onerror, args);
		if (typeof result === 'string')
		{
			if (result === "True") result = true;
			if (result === "False") result = false;
		}
		return result;
	}
};

//================================================================================
window.Lianja.Base64 = {
 
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
 
        input = Lianja.Base64._utf8_encode(input);
 
        while (i < input.length) {
 
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
 
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
 
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
 
            output = output +
            Lianja.Base64._keyStr.charAt(enc1) + Lianja.Base64._keyStr.charAt(enc2) +
            Lianja.Base64._keyStr.charAt(enc3) + Lianja.Base64._keyStr.charAt(enc4);
        }
 
        return output;
    },
 
    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
 
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
        while (i < input.length) {
 
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
 
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
 
            output = output + String.fromCharCode(chr1);
 
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
 
        }
 
        output = Lianja.Base64._utf8_decode(output);
 
        return output;
 
    },
 
    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
 
        for (var n = 0; n < string.length; n++) {
 
            var c = string.charCodeAt(n);
 
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
 
        }
 
        return utftext;
    },
 
    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
 
        while ( i < utftext.length ) {
 
            c = utftext.charCodeAt(i);
 
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
 
        }
 
        return string;
    }
 
};

//================================================================================
window.base64_encode = function(text)
{
	if (typeof text === 'object') text = JSON.stringify(text);
	return Lianja.Base64.encode(text);
};

//================================================================================
window.base64_decode = function(text)
{
	return Lianja.Base64.decode(text);
};

//================================================================================
window.json_encode = function(obj)
{
	return JSON.stringify(obj);
};

//================================================================================
window.json_decode = function(text)
{
	return JSON.parse(text);
};

//================================================================================
window.Lianja.cloudserver = new Lianja.rpc();

