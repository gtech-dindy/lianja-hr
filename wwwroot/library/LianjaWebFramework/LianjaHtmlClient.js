//================================================================================
// Copyright (C) 2016 Lianja Inc.
// As an unpublished licensed proprietary work.
// All rights reserved worldwide.
//
//--------------------------------------------------------------------------------
//
// File:
//
// 		LianjaHtmlClient.js
//
// Purpose:
//
// 		Lianja HTML5 Client JavaScript library 
//
// Author:
//
//		Barry Mavin
//
//================================================================================

var ajaxcount = 0;
var ajaxurls = [];


//================================================================================
window.Lianja = function() {
	this.datamap = {};
	this.iframemap = {};
	this.pagetransitionmap = {};
	this.gesturesmap = [];
	this.uimap = {};
	this.requiremap = [];
	this.permsmap = {};
};

//================================================================================
window.Lianja.setDataMap = function(map)
{
	Lianja.datamap = map;
};

//================================================================================
window.Lianja.setIframeMap = function(map)
{
	Lianja.iframemap = map;
};

//================================================================================
window.Lianja.setPageTransitionMap = function(map)
{
	Lianja.pagetransitionmap = map;
};

//================================================================================
window.Lianja.setGesturesMap = function(map)
{
	Lianja.gesturesmap = map;
};

//================================================================================
window.Lianja.setPermsMap = function(map)
{
	Lianja.permsmap = map;
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
window.Lianja.setupSplitViews = function()
{
	for (var i=0; i<Lianja.pendingsplitviews.length; ++i)
	{
		$( "#" + Lianja.pendingsplitviews[i] ).simplesplitview();
	}
};

//================================================================================
window.Lianja.checkBoxViewChanged = function(formitemid, checkbox, index, clickaction)
{
	formitemid = formitemid.replace(/-/g, ".");
	var formitem = Lianja.getElementByID(formitemid);
	var checkboxlist = $(checkbox).data("lianjaFormitemCheckboxlist");
	if (typeof checkboxlist !== 'undefined' && checkboxlist.indexOf(",") > 0)
	{
		var checkboxes = checkboxlist.split(",");
		var value = "";
		var cb;
		var j;
		for (var i=0; i<checkboxes.length; ++i)
		{
			cb = $("#"+checkboxes[i]);
			if ($(cb).prop("checked"))
			{
				if (value.length > 0) value += ",";
				j = i+1;
				value = value + j;
			}
		}
		formitem.checkboxlistvalue = value;
		if (clickaction.length > 0) 
		{
			if (clickaction.indexOf("(") < 0) clickaction += "()";
			eval(clickaction);
		}
	}
	else
	{
		formitem.checkboxlistvalue = value;
		if (clickaction.length > 0) 
		{
			if (clickaction.indexOf("(") < 0) clickaction += "()";
			eval(clickaction);
		}
	}
	return false;
};

//================================================================================
window.Lianja.rpc = function()
{
	var self = this;
	
	if (Lianja.isPhoneGap())
	{
		$.ajaxSetup({
			headers: {
				'phonegap' : Lianja.isPhoneGap() ? "true" : "false",
				'PhonegapApp' : Lianja.App.name,
				'PhonegapDevice' : Lianja.App.targetui,
				'PhonegapPlatformId' : typeof window.cordova !== 'undefined' ? window.cordova.platformId : 'com.adobe.phonegap.app',
				'PhonegapPlatformVersion' : typeof window.cordova !== 'undefined' ?  window.cordova.platformVersion : "5.0"
			}
		});
	}
	else if (Lianja.isElectron())
	{
		$.ajaxSetup({
			headers: {
				'phonegap' : Lianja.isPhoneGap() ? "true" : "false",
				'ElectronApp' : Lianja.App.name,
				'ElectronDebug' : Lianja.App.buildmode==="debug"
			}
		});
	}
	else
	{
		$.ajaxSetup({
			headers: {
				'phonegap' : Lianja.isPhoneGap() ? "true" : "false"
			}
		});
	}
	
	//----------------------------------------------------------------------------
	this.login = function(username, password, callback) {
		Lianja.removeCookieVar("LIANJAAUTHTOKEN");
		Lianja.removeCookieVar("LIANJAUSER");
		Lianja.removeCookieVar("LIANJAUSERDOMAIN");
		Lianja.App.perms = false;

		if (Lianja.isPhoneGap())
		{
			$.ajaxSetup({
				headers: {
					'lianjaAuthorization': "Basic " + base64_encode(username + ":" + password),
					'PhonegapApp' : Lianja.App.name,
					'PhonegapDevice' : Lianja.App.targetui,
					'PhonegapPlatformId' : typeof window.cordova !== 'undefined' ? window.cordova.platformId : 'com.adobe.phonegap.app',
					'PhonegapPlatformVersion' : typeof window.cordova !== 'undefined' ?  window.cordova.platformVersion : "5.0"
				}
			});
		}
		else if (Lianja.isElectron())
		{
			$.ajaxSetup({
				headers: {
					'lianjaAuthorization': "Basic " + base64_encode(username + ":" + password),
					'phonegap' : Lianja.isPhoneGap() ? "true" : "false",
					'ElectronApp' : Lianja.App.name,
					'ElectronDebug' : Lianja.App.buildmode==="debug"
				}
			});
		}
		else
		{
			$.ajaxSetup({
				headers: {
					'lianjaAuthorization': "Basic " + base64_encode(username + ":" + password),
					'phonegap' : Lianja.isPhoneGap() ? "true" : "false"
				}
			});
		}
		
		// variable to hold request
		var request;
		
		// POST the request 
		request = $.ajax({
			cache: false,
			async: false,
			dataType: "text",
			url: Lianja.App.baseurl + "/authenticate.rsp",
			type: "get"
		});

		// callback handler that will be called on success
		request.done(function (response, textStatus, jqXHR) {
			if (response === "Ok") 
			{
				callback(true);
			}
			else callback(false);
		});

		// callback handler that will be called on failure
		request.fail(function (jqXHR, textStatus, errorThrown){
			callback(false);
		});
	};
	
	//----------------------------------------------------------------------------
	this.isLoggedIn = function(callback) {
		// variable to hold request
		var request;
		
		// POST the request 
		request = $.ajax({
			url: Lianja.App.getFullPathUrl("/authenticate.rsp"),
			type: "get"
		});

		// callback handler that will be called on success
		request.done(function (response, textStatus, jqXHR) {
			if (response === "Ok") callback(true);
			else callback(false);
		});

		// callback handler that will be called on failure
		request.fail(function (jqXHR, textStatus, errorThrown){
			callback(false);
		});
	};
	
	//----------------------------------------------------------------------------
	this.logout = function() {
		Lianja.removeCookieVar("LIANJAAUTHTOKEN");
		Lianja.removeCookieVar("LIANJAUSER");
		Lianja.removeCookieVar("LIANJAUSERDOMAIN");
		//Lianja.navigate("/logout.rsp");
		Lianja.App.perms = false;
		Lianja.navigate("/login.rsp");
	};
	
	//----------------------------------------------------------------------------
	this.getProfilePicture = function(username, callback) {
		// TODO: for the App Center integration
	};

	//----------------------------------------------------------------------------
	this.editProfileSettings = function(username, callback) {
		// TODO: for the App Center integration
	};

	//----------------------------------------------------------------------------
	this.getDynamicTileText = function(appname, callback) {
		// TODO: for the App Center integration
	};
	
	//----------------------------------------------------------------------------
	this.openApp = function(appname) {
		if (Lianja.isTablet())
		{
			Lianja.navigate("/apps/"+appname+"/"+"tablet_index.html");
		}
		else if (Lianja.isPhone())
		{
			Lianja.navigate("/apps/"+appname+"/"+"phone_index.html");
		}
		else
		{
			Lianja.navigate("/apps/"+appname+"/"+"index.html");
		}
	};
	
	//----------------------------------------------------------------------------
	this.expandMacroExpression = function(expr, callback, args)
	{
		var j;
		var newexpr = "";
		var name = "";
		var table = "";
		
		for (var i=0; i<expr.length; )
		{
			if (expr[i] == '.')
			{
				name = "";
				for (var j=i-1; j>=0; --j)
				{
					var str = ""+expr[j];
					if (str.match(/[A-Z]/i))
					{
						name += str.toLowerCase();
					}
					else 
					{
						break;
					}
				}
				table = name.split('').reverse().join('');
				newexpr = newexpr.substring(0,j+1) + table + ".";
				name = "";
				for (var j=i+1; j<expr.length; ++j)
				{
					var str = ""+expr[j];
					if (str.match(/[A-Z]/i))
					{
						name += str.toLowerCase();
					}
					else 
					{
						break;
					}
				}
				newexpr = newexpr + name;
				i = j;
			}
			else
			{
				newexpr += expr[i];
				++i;
			}
		}

		for (var i=0; i<Lianja.App.cursors.length; ++i)
		{
			cursor = Lianja.App.cursors[i];
			newexpr = cursor.expandText(newexpr, true);
		}
		
		var result;
		try
		{
			result = eval(newexpr);
			if (typeof callback === 'undefined') return result;
			callback(result, args);
		} 
		catch(e) 
		{
			if (newexpr.indexOf(".") > 0 && newexpr.indexOf("(") < 0)
			{
				if (typeof callback === 'undefined') return expr;
				callback(expr, args);
				return;
			}
			if (typeof callback === 'undefined') 
			{
				result = Lianja.evaluate(newexpr);
				if (typeof result === 'undefined') return newexpr;
				else return result;
			}
			
			Lianja.evaluate(newexpr,
				function(result, args)
				{
					callback(result, args.args);
				},
				function(args)
				{
					callback(args.newexpr, args.args);
				},
				{ "expr":newexpr, "args":args }
			);
		}
	};
	
	//----------------------------------------------------------------------------
	this._expandMacros = function(pageid, sectionid, text, callback, args, val)
	{
		if (typeof callback !== 'function') return text;
		if (typeof args === 'undefined') args = {};
		args.topcallback = callback;
		args.pageid = pageid;
		args.sectionid = sectionid;
		args.val = val;
		self.expandDoubleMacros(pageid, sectionid, text, "",
			function(text, args)
			{
				self.expandSingleMacros(args.pageid, args.sectionid, text, "",
					function(text, args)
					{
						args.topcallback(text, args);
					}
					,args
					,args.val,
					0);
			}
			,args
			,val,
			0);
	};
	
	//----------------------------------------------------------------------------
	this.expandMacrosSync = function(pageid, sectionid, text)
	{
		if (text.indexOf("{") < 0) return text;
		//text = self.expandTripleMacrosSync(pageid, sectionid, text);
		//text = self.expandDoubleMacrosSync(pageid, sectionid, text);
		text = self.expandSingleMacrosSync(pageid, sectionid, text);
		return text;
	};
	
	//----------------------------------------------------------------------------
	this.expandMacros = function(pageid, sectionid, text, callback, args, val)
	{
		if (typeof callback !== 'function') return text;
		if (typeof args === 'undefined') args = {};
		args.topcallback = callback;
		args.pageid = pageid;
		args.sectionid = sectionid;
		args.val = val;
		self.expandTripleMacros(pageid, sectionid, text, "",
			function(text, args)
			{
				self.expandDoubleMacros(args.pageid, args.sectionid, text, "",
					function(text, args)
					{
						self.expandSingleMacros(args.pageid, args.sectionid, text, "",
							function(text, args)
							{
								args.topcallback(text, args);
							}
							,args
							,args.val,
							0);
					}
					,args
					,val,
					0);
			}
			,args
			,val,
			0);
	};
	
	//----------------------------------------------------------------------------
	this.expandSingleMacros = function(pageid, sectionid, text, newtext, callback, args, val, ipos)
	{
		var macro = "";
		var inmacro = false;

		if (typeof val !== 'undefined') text = str_replace("{}", ""+val, text);

		if (pageid.length > 0)
		{
			var page = Lianja.App.getPage(pageid);
			if (typeof page == 'undefined')
			{
				if (typeof callback == 'function') callback(text, args);
				else return text;
			}
			var section = page.getSection(sectionid);
			var cursor = section.cursor;
			if (cursor !== null && typeof cursor !== 'undefined')
			{
				if (cursor._recno !== null) text = str_replace("{recno()}", ""+cursor._recno, text);
				if (cursor._reccount !== null) text = str_replace("{rowcount()}", ""+cursor._reccount, text);
				if (cursor._reccount !== null) text = str_replace("{reccount()}", ""+cursor._reccount, text);
			}
		}
		
		for (var i=ipos; i<text.length; ++i)
		{
			if (text[i] == '{')
			{
				inmacro = true;
				macro = "";
				continue;
			}
			
			if (text[i] == '}' && inmacro)
			{
				inmacro = false;
				args.callback = callback;
				args.text = text;
				self.expandMacroExpression(
					macro, 
					function(macro, args)
					{
						args.newtext = args.newtext + macro;
						self.expandSingleMacros(args.pageid, args.sectionid, args.text, args.newtext,
							function(text, args)
							{
								if (typeof args.args !== 'undefined') args.callback(text, args.args);
								else args.callback(text, args);
							}
							,args
							,val
							,i+1
						);
					},			
					{ "pageid":pageid, "sectionid":sectionid, "ipos":i+1, "text":text, "newtext": newtext, "maincallback": args.maincallback, "topcallback": args.topcallback, "callback": callback, "args":args, "val":val }
				);
				return;
			}
			
			if (inmacro)
			{
				macro += text[i];
			}
			else
			{
				newtext += text[i];
			}
		}
		
		if (typeof callback == 'function') callback(newtext, args);
		else return newtext;
	};
	
	//----------------------------------------------------------------------------
	this.expandSingleMacrosSync = function(pageid, sectionid, text)
	{
		var macro = "";
		var inmacro = false;
		var newtext = "";
		var mtext;

		if (pageid.length > 0)
		{
			var page = Lianja.App.getPage(pageid);
			if (typeof page == 'undefined')
			{
				return text;
			}
			var section = page.getSection(sectionid);
			var cursor = section.cursor;
			if (cursor !== null && typeof cursor !== 'undefined')
			{
				if (cursor._recno !== null) text = str_replace("{recno()}", ""+cursor._recno, text);
				if (cursor._reccount !== null) text = str_replace("{rowcount()}", ""+cursor._reccount, text);
				if (cursor._reccount !== null) text = str_replace("{reccount()}", ""+cursor._reccount, text);
			}
		}
		
		for (var i=0; i<text.length; ++i)
		{
			if (text[i] == '{')
			{
				inmacro = true;
				macro = "";
				continue;
			}
			
			if (text[i] == '}' && inmacro)
			{
				inmacro = false;
				mtext = self.expandMacroExpression(macro);
				newtext += mtext;
				continue;
			}
			
			if (inmacro)
			{
				macro += text[i];
			}
			else
			{
				newtext += text[i];
			}
		}
		
		return newtext;
	};
	
	//----------------------------------------------------------------------------
	this.expandDoubleMacros = function(pageid, sectionid, text, newtext, callback, args, val, ipos)
	{
		var macro = "";
		var inmacro = false;

		if (typeof callback !== 'function') 
		{
			return text;
		}

		if (typeof val !== 'undefined') text = str_replace("{}", ""+val, text);

		if (pageid.length > 0)
		{
			var page = Lianja.App.getPage(pageid);
			if (typeof page == 'undefined')
			{
				if (typeof callback == 'function') callback(text, args);
				else return text;
			}
			var section = page.getSection(sectionid);
			var cursor = section.cursor;
			if (cursor !== null && typeof cursor !== 'undefined')
			{
				if (cursor._recno !== null) text = str_replace("{recno()}", ""+cursor._recno, text);
				if (cursor._reccount !== null) text = str_replace("{rowcount()}", ""+cursor._reccount, text);
				if (cursor._reccount !== null) text = str_replace("{reccount()}", ""+cursor._reccount, text);
			}
		}
		
		//c_onsole.log("text="+text);
		var pos = text.indexOf("\{\{");
		if (pos < 0)
		{
			if (typeof callback == 'function') callback(text, args);
			else return text;
		}
		var prefix = text.substring(0, pos);
		var endpos = text.indexOf("}}");
		if (endpos < 0)
		{
			if (typeof callback == 'function') 
			{
				callback(text, args);
				return;
			}
			else return text;
		}
		var postfix = text.substring(endpos+2);
		macro = text.substring(pos+2, endpos);
		self.expandMacroExpression(
			macro, 
			function(macro, args)
			{
				args.text = args.prefix + macro + args.postfix;
				self.expandDoubleMacros(
					args.pageid, 
					args.sectionid, 
					args.text, 
					args.newtext,
					callback,
					args,
					val,
					args.ipos
				);
			},
			{ "prefix":prefix, "postfix":postfix, "containerid":args.containerid, "maincallback": args.maincallback, "topcallback": args.topcallback, "pageid":pageid, "sectionid":sectionid, "ipos":0, "text":text, "newtext": newtext, "args":args, "val":val }
		);
	};
	
	//----------------------------------------------------------------------------
	this.expandTripleMacros = function(pageid, sectionid, text, newtext, callback, args, val, ipos)
	{
		var macro = "";
		var inmacro = false;

		if (typeof callback !== 'function') 
		{
			return text;
		}

		if (typeof val !== 'undefined') text = str_replace("{}", ""+val, text);

		if (pageid.length > 0)
		{
			var page = Lianja.App.getPage(pageid);
			if (typeof page == 'undefined')
			{
				if (typeof callback == 'function') callback(text, args);
				else return text;
			}
			var section = page.getSection(sectionid);
			var cursor = section.cursor;
			if (cursor !== null && typeof cursor !== 'undefined')
			{
				if (cursor._recno !== null) text = str_replace("{recno()}", ""+cursor._recno, text);
				if (cursor._reccount !== null) text = str_replace("{rowcount()}", ""+cursor._reccount, text);
				if (cursor._reccount !== null) text = str_replace("{reccount()}", ""+cursor._reccount, text);
			}
		}
		
		//c_onsole.log("text="+text);
		var pos = text.indexOf("\{\{\{");
		if (pos < 0)
		{
			if (typeof callback == 'function') callback(text, args);
			else return text;
		}
		var prefix = text.substring(0, pos);
		var endpos = text.indexOf("}}}");
		if (endpos < 0)
		{
			if (typeof callback == 'function') 
			{
				callback(text, args);
				return;
			}
			else return text;
		}
		var postfix = text.substring(endpos+3);
		macro = text.substring(pos+3, endpos);
		self.expandMacroExpression(
			macro, 
			function(macro, args)
			{
				args.text = args.prefix + macro + args.postfix;
				self.expandTripleMacros(
					args.pageid, 
					args.sectionid, 
					args.text, 
					args.newtext,
					callback,
					args,
					val,
					args.ipos
				);
			},
			{ "prefix":prefix, "postfix":postfix, "containerid":args.containerid, "maincallback": args.maincallback, "topcallback": args.topcallback, "pageid":pageid, "sectionid":sectionid, "ipos":0, "text":text, "newtext": newtext, "args":args, "val":val }
		);
	};

	this._expandDoubleMacros = function(pageid, sectionid, text, newtext, callback, args, val, ipos)
	{
		var macro = "";
		var inmacro = false;

		if (typeof callback !== 'function') 
		{
			return text;
		}

		if (typeof val !== 'undefined') text = str_replace("{}", ""+val, text);

		if (pageid.length > 0)
		{
			var page = Lianja.App.getPage(pageid);
			if (typeof page == 'undefined')
			{
				if (typeof callback == 'function') callback(text, args);
				else return text;
			}
			var section = page.getSection(sectionid);
			var cursor = section.cursor;
			if (cursor !== null && typeof cursor !== 'undefined')
			{
				if (cursor._recno !== null) text = str_replace("{recno()}", ""+cursor._recno, text);
				if (cursor._reccount !== null) text = str_replace("{rowcount()}", ""+cursor._reccount, text);
				if (cursor._reccount !== null) text = str_replace("{reccount()}", ""+cursor._reccount, text);
			}
		}
		
		var nbrackets = 0;
		var ebrackets = 0;
		for (var i=ipos; i<text.length; ++i)
		{
			if (text[i] == '{')
			{
				macro = "";
				++nbrackets;
				if (nbrackets == 2) 
				{
					ebrackets = 0;
					inmacro = true;
				}
				continue;
			}
			
			if (text[i] == '}' && inmacro)
			{
				++ebrackets;
				if (ebrackets == 2)
				{
					inmacro = false;
					nbrackets = 0;
					ebrackets = 0;
					args.callback = callback;
					args.ipos = i+1;
					self.expandMacroExpression(
						macro, 
						function(macro, args)
						{
							args.newtext = args.newtext + macro;
							self.expandDoubleMacros(
								args.pageid, 
								args.sectionid, 
								args.text, 
								args.newtext,
								function(text, args)
								{
									args.callback(text, args);
								}
								,args
								,val
								,args.ipos
							);
						},
						{ "containerid":args.containerid, "topcallback": args.topcallback, "pageid":pageid, "sectionid":sectionid, "ipos":i+1, "text":text, "newtext": newtext, "callback": callback, "args":args, "val":val }
					);
					return;
				}
				continue;
			}
			
			if (inmacro)
			{
				macro += text[i];
				ebrackets = 0;
			}
			else
			{
				if (nbrackets == 1) 
				{
					nbrackets = 0;
					newtext += "{";
				}
				newtext += text[i];
			}
		}
		
		if (typeof callback == 'function') callback(newtext, args);
		else return newtext;
	};
	
	//----------------------------------------------------------------------------
	this.refreshText = function(nodeid, pageid, sectionid, text)
	{
		self.expandMacros(pageid, sectionid, text, function(text, args)
			{
				$(args.nodeid).text(text);
			},
			{ "nodeid": nodeid },
			""
		);
	};
	
	//----------------------------------------------------------------------------
	this.refreshHtml = function(nodeid, pageid, sectionid, text)
	{
		self.expandMacros(pageid, sectionid, text, function(text, args)
			{
				$(args.nodeid).html(text);
			},
			{ "nodeid": nodeid },
			""
		);
	};
	
	//----------------------------------------------------------------------------
	this.performPageAction = function(pageid, action, onsuccess, onfailure)
	{
		var page = Lianja.App.getPage(pageid);
		var section = page.getFirstSection();
		if (typeof section === 'undefined')
		{
			if (typeof onsuccess === 'function') onsuccess();
			return;
		}
		self.getActiveRecord(section, action, onsuccess, onfailure);
	};

	//----------------------------------------------------------------------------
	this.performSectionAction = function(sectionid, action, onsuccess, onfailure)
	{
		var page = Lianja.App.getPage(Lianja.App.currentpageid);
		var section = page.getSection(sectionid);
		if (section === null || typeof section === 'undefined')
		{
			console.log("Unknown section: "+sectionid);
			return;
		}
		if (action === "hide")
		{
			section.hide();
		}
		else if (action === "show")
		{
			section.show();
		}
		else if (action === "expand")
		{
			section.expand();
		}
		else if (action === "collapse")
		{
			section.collapse();
		}
		else
		{
			self.getActiveRecord(section, action, onsuccess, onfailure);
		}
	};

	//----------------------------------------------------------------------------
	this.getCurrentRowID = function(controlsource)
	{
		var pos = controlsource.indexOf(".");
		if (pos > 0) controlsource = controlsource.substring(0,pos);
		var cursor = Lianja.App.getCursor("", controlsource);
		return cursor.rowid;
	};
	
	//----------------------------------------------------------------------------
	this.getCursor = function(controlsource)
	{
		var pos = controlsource.indexOf(".");
		if (pos > 0) controlsource = controlsource.substring(0,pos);
		var cursor = Lianja.App.getCursor("", controlsource);
		return cursor;
	};
	
	//----------------------------------------------------------------------------
	this.getImageField = function(controlsource, maxwidth, maxheight, onsuccess, onerror, args)
	{
		var style = "style='width:{maxwidth};height:{maxheight};' title='Click to upload an image'";
		var cursor = Lianja.cloudserver.getCursor(controlsource);
		var database = cursor.database;
		var table = controlsource.substring(0, controlsource.indexOf("."));
		var rowid = this.getCurrentRowID(controlsource);
		var url = "/odata/" + database + "/" + table + "?$select=" + controlsource.toLowerCase() + "&$format=img&$filter=rowid eq "+rowid+"&$attributes="+ style + "&_v=" + Lianja.App.seqno();
		var data;

		Lianja.cloudserver.OData("readhtml", url, data, 
			function(data, args) {		// success
				data = str_replace("{maxwidth}", ""+maxwidth, data);
				data = str_replace("{maxheight}", ""+maxheight, data);
				//console.log("getImageField() len="+data.length);
				onsuccess(data, args);
			},
			function() {			// error
				onerror(args);
			},
			args,
			true
		);
	};
	
	//----------------------------------------------------------------------------
	this.getMemoEditor = function(args, onsuccess, onerror)
	{
		var url;
		if (Lianja.App.attributes['htmlEditor'] == 'Desktop') url = "library:/web_editor.rsp";
		else if (Lianja.App.attributes['htmlEditor'] == 'Web') url = "library:/web_editor.rsp";
		else url = "library:/mobile_editor.rsp";
		var pos = Lianja.App.cacheIndexOf(url);
		if (pos >= 0)
		{
			var text = Lianja.App.getCacheItem(pos);
			if (typeof onsuccess === 'function') onsuccess(args, text);
			return;
		}
		
		args.onerror = onerror;
		args.onsuccess = onsuccess;
		args._url = url;
		Lianja.getUrl(url, args, function(status, text, args) {
			if (status)
			{
				text = str_replace("library:/", "../../../library/", text);
				text = str_replace("lib:/", "../../../library/", text);
				Lianja.App.addToCache(args._url, text);
				var onsuccess = args.onsuccess;
				if (typeof onsuccess === 'function') onsuccess(args, text);
			}
			else
			{
				var onerror = args.onerror;
				if (typeof onerror === 'function') onerror(args);
			}
		});
	};
	
	//----------------------------------------------------------------------------
	this.getMemoField = function(controlsource, containerid, args, onsuccess, onerror)
	{
		var rowid = this.getCurrentRowID(controlsource);
		var cursor = Lianja.cloudserver.getCursor(controlsource);
		var database = cursor.database;
		var table = controlsource.substring(0, controlsource.indexOf("."));
		var url = "/odata/" + database + "/" + table + "?$select=" + controlsource.toLowerCase() + "&$format=html&$filter=rowid eq "+rowid;
		if (rowid === 0) 
		{
			if (typeof onsuccess === 'function') onsuccess(args, "");
			return;
		}
		args.onerror = onerror;
		args.onsuccess = onsuccess;
		args.activeurl = url;
		Lianja.getUrl(url, args, function(status, text, args) {
			if (status)
			{
				var onsuccess = args.onsuccess;
				if (typeof onsuccess === 'function') onsuccess(args, text);
			}
			else
			{
				var onerror = args.onerror;
				if (typeof onerror === 'function') onerror(args);
			}
		});
	};
	
	//----------------------------------------------------------------------------
	this.updateMemoField = function(database, table, controlsource, text, onsuccess, onerror)
	{
		var rowid = this.getCurrentRowID(controlsource);
		var pos = controlsource.indexOf(".");
		if (pos > 0) controlsource = controlsource.substring(pos+1);
		var url = "/odata/" + database + "/" + table + "?$column=" + controlsource.toLowerCase() + "&$format=html&$rowid="+rowid;
		var data = {};
		Lianja.cloudserver.OData("updatehtml", url, text, onsuccess, onerror);
	};
	
	//----------------------------------------------------------------------------
	this.evaluateSync = function(expr)
	{
		var url = "/odata?$eval="+expr+"&$app="+Lianja.App.name;
		var result = $.ajax({
			url: Lianja.App.getFullPathUrl(url),
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
			if (expr.indexOf("{") >= 0)
			{
				var strresult = undefined;
				Lianja.expandMacros("", "", expr, 
					function(result, args)
					{
						strresult = result;
					},
					{ "containerid": undefined, "onsuccess":onsuccess, "onerror":onerror },
					""
				);
				if (typeof strresult !== 'undefined') expr = strresult;
			}
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
		var url = "/odata?$eval="+expr+"&$app="+Lianja.App.name;
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
	
	//----------------------------------------------------------------------------
	this.OData = function(type, url, data, success_callback, error_callback, pkt, async)
	{
		if (type == "create")
		{
			return Lianja.OData_Create(url, data, function(status, result, args)
			{
				if (status) success_callback(result, args.pkt);
				else error_callback(args.pkt);
			}, 
			{ "onsuccess" : success_callback, "onerror" : error_callback, "pkt":pkt },
			async);
		}
		else if (type == "read")
		{
			return Lianja.OData_Read(url, function(status, result, args)
			{
				if (status) args.onsuccess(result, args.pkt);
				else args.onerror(args.pkt);
			}, 
			{ "onsuccess" : success_callback, "onerror" : error_callback, "pkt":pkt },
			async);
		}
		else if (type == "readsync")
		{
			return Lianja.OData_Read(url, function(status, result, args)
			{
				if (status) args.onsuccess(result, args.pkt);
				else args.onerror(args.pkt);
			}, 
			{ "onsuccess" : success_callback, "onerror" : error_callback, "pkt":pkt },
			false);
		}
		else if (type == "readhtml")
		{
			return Lianja.OData_ReadHTML(url, function(status, result, args)
			{
				if (status) 
				{
					if (typeof args.onsuccess !== 'undefined') args.onsuccess(result, args.pkt);
				}
				else 
				{
					if (typeof args.onerror !== 'undefined') args.onerror(args.pkt);
				}
			}, 
			{ "onsuccess" : success_callback, "onerror" : error_callback, "pkt":pkt },
			async);
		}
		else if (type == "update")
		{
			return Lianja.OData_Update(url, data, function(status, result, args)
			{
				if (status) args.onsuccess(result, args.pkt);
				else args.onerror(args.pkt);
			}, 
			{ "onsuccess" : success_callback, "onerror" : error_callback, "pkt":pkt },
			async);
		}
		else if (type == "updatehtml")
		{
			return Lianja.OData_UpdateHTML(url, data, function(status, result, args)
			{
				if (status) args.onsuccess(result, args.pkt);
				else args.onerror(args.pkt);
			}, 
			{ "onsuccess" : success_callback, "onerror" : error_callback, "pkt":pkt },
			async);
		}
		else if (type == "delete")
		{
			return Lianja.OData_Delete(url, data, function(status, result, args)
			{
				if (status) args.onsuccess(result, args.pkt);
				else args.onerror(args.pkt);
			}, 
			{ "onsuccess" : success_callback, "onerror" : error_callback, "pkt":pkt },
			async);
		}
	};
	
	//----------------------------------------------------------------------------
	this.getActiveRecord = function(section, position, callback, error_callback)
	{
		if (section.cursor == null) return;
		
		section.cursor.addPageListener(section.page);
		
		section.cursor.adding = section.page.adding;
		
		if (section.txcount == section.page.txcount)
		{
			if (typeof callback === 'function') callback();
			return;
		}
		
		section.txcount == section.page.txcount;
		
		if (position == 'next' && section.cursor.nextaction < 0)
		{
			position = "previous";
			section.cursor.nextaction = 1;
		}
		
		if (position == 'current' || position == 'refresh')
		{
			if (Lianja.App.phonegap) Lianja.showLoadingIcon();
			section.cursor.refresh(callback, error_callback);
		}
		else if (position == 'add')
		{
			section.cursor.clearData(section, callback, error_callback);
		}
		else if (position == 'first')
		{
			if (Lianja.App.phonegap) Lianja.showLoadingIcon();
			section.cursor.first(callback, error_callback);
		}
		else if (position == 'next')
		{
			if (section.cursor._recno == section.cursor._reccount)
			{
				Lianja.showMessage("No more records");
			}
			else
			{
				if (Lianja.App.phonegap) Lianja.showLoadingIcon();
				section.cursor.next(callback, error_callback);
			}
		}
		else if (position == 'previous')
		{
			if (section.cursor._recno == 1)
			{
				Lianja.showMessage("No previous records");
			}
			else
			{
				if (Lianja.App.phonegap) Lianja.showLoadingIcon();
				section.cursor.previous(callback, error_callback);
			}
		}
		else if (position == 'last')
		{
			if (Lianja.App.phonegap) Lianja.showLoadingIcon();
			section.cursor.last(callback, error_callback);
		}
		else if (position.substring(0, 7) == 'search:')
		{
			var value = position.substring(7);
			if (section.page.searchkeysectionid.length == 0)
			{
				Lianja.showMessage("No search enabled on this page");
			}
			else
			{
				if (Lianja.App.phonegap) Lianja.showLoadingIcon();
				section.cursor.search(section, value, callback, error_callback);
			}
		}
		else if (position.substring(0, 7) == 'filter:')
		{
			var value = position.substring(7);
			if (Lianja.App.phonegap) Lianja.showLoadingIcon();
			if (value.indexOf("@@") == 0)
			{
				section.cursor.findAll(section, value.substring(2), callback, error_callback);
			}
			else
			{
				section.cursor.setFilter(value);
				section.cursor.first(callback, error_callback);
			}
		}
		else if (position.substring(0, 7) == 'searchfilter:')
		{
			var value = position.substring(13);
			if (Lianja.App.phonegap) Lianja.showLoadingIcon();
			section.cursor.setSearchFilter(section, value);
			section.cursor.first(callback, error_callback);
		}
		else if (position.substring(0, 5) == 'goto:')
		{
			if (Lianja.App.phonegap) Lianja.showLoadingIcon();
			recno = parseInt(position.substring(5));
			section.cursor.fetch(recno, callback, error_callback);
		}
	};

	//================================================================================
	this.refreshSection = function(sectionid, onsuccess, onerror)
	{
		if (sectionid.length == 0) return;
		
		//console.log("refreshSection() sectionid="+sectionid);
		
		var key = sectionid.replace(/-/g, "_");
		var value = Lianja.datamap[key.toLowerCase()];
		var $section = $("#"+sectionid);
		var section = Lianja.getSection(sectionid);
		var page = section.page;

		if (section.type === 'pagecenter' && !section.firstrefresh) 
		{
			//console.log("refreshSection() skipped");
			return;
		}
		
		if (typeof value === "undefined") 
		{
			if (typeof $section == "undefined") 
			{
				onsuccess();
				return;
			}
			section = Lianja.getSection(sectionid);
			section.refresh(onsuccess, onerror);
			section.dirty = false;
			return;
		}
		
		var pos = value.indexOf(":");
		var type = value.substr(0,pos);
		var url = value.substr(pos+1);

		Lianja.refreshComponent(type, url, sectionid, false, page.adding, onsuccess, onerror, sectionid, sectionid);
		Lianja.refreshSectionHeader(sectionid);
		Lianja.refreshSectionFooter(sectionid);
	};

	//================================================================================
	this.refreshSectionChildren = function(sectionid, onsuccess, onerror)
	{
		onsuccess();
	};

	//================================================================================
	this.hasParentSection = function(section, sectionstack)
	{
		var i;
		var len = sectionstack.length;
		var psection;
		
		for (i=0; i<len; ++i)
		{
			psection = sectionstack[i];
			if (typeof psection.sectionid === 'undefined') continue;
			if (section.parentid.length > 0) return true;
		}
		
		return false;
	};
	
	//================================================================================
	this.refreshPage = function(pageid, allsections, onsuccess, onerror)
	{
		if (pageid[0] != '#') pageid = "#" + pageid;
		var pagediv = $(pageid);
		var sectionlist = pagediv.data("lianjaPageSectionlist");
		var pagetype = pagediv.data("lianjaPageType");
		var sections = sectionlist.split(",");
		var page = Lianja.App.getPage(pageid.substr(1));
		var count;
		var section;
		var sectionid;
		var funcstack = [];
		var argstack = [];
		var sectionstack = [];

		//console.log("refreshPage() pageid="+pageid+", allsections="+allsections);
		//Lianja.printStackTrace();
		//if (Lianja.App.liveview) Lianja.messageBox("refreshPage() "+pageid);
		
		page.refreshcnt = 0;
		
		for (var i=0; i<page.getSectionCount(); ++i)
		{
			section = page.getSection(i);
			section.refreshcnt = 0;
		}
		
		if (page.searchkeysectionid.length == 0 || typeof page.searchkeysectionid !== 'string')
		{
			allsections = true;
		}

		if (!allsections)
		{
			for (var i=0; i<page.getSectionCount(); ++i)
			{
				section = page.getSection(i);
				if (self.hasParentSection(section, sectionstack)) continue;
				//if (!section.firstrefresh) continue;
				section.firstrefresh = false;
				if (_.contains(argstack, section.pageid+"-"+section.id)) continue;
				funcstack.push(self.refreshSection);
				argstack.push(section.pageid+"-"+section.id);
				sectionstack.push(section);
				section.refreshcnt = 0;
			}
		}
		if (allsections)
		{
			for (var i=0; i<page.getSectionCount(); ++i)
			{
				section = page.getSection(i);
				if (self.hasParentSection(section, sectionstack)) continue;
				if (_.contains(argstack, section.pageid+"-"+section.id)) continue;
				funcstack.push(self.refreshSection);
				argstack.push(section.pageid+"-"+section.id);
				sectionstack.push(section);
				section.refreshcnt = 0;
			}
		}
		else if (typeof page.searchkeysectionid === "string")
		{
			if (!_.contains(argstack, page.searchkeysectionid)) 
			{
				funcstack.push(self.refreshSection);
				argstack.push(page.searchkeysectionid);
				section = page.getSection(page.searchkeysectionid);
				sectionstack.push(section);
			}
			page.refreshed = true;
			for (var i=0; i<page.getSectionCount(); ++i)
			{
				section = page.getSection(i);
				if (section.sectionid === page.searchkeysectionid) 
				{
					continue;
				}
				if (self.hasParentSection(section, sectionstack)) continue;
				if (!page.firstrefresh) continue;
				if (_.contains(argstack, section.pageid+"-"+section.id)) continue;
				funcstack.push(self.refreshSection);
				argstack.push(section.pageid+"-"+section.id);
				sectionstack.push(section);
				section.refreshcnt = 0;
			}
		}
		
		page.dirty = false;
		page.editing = false;
		page.adding = false;
		page.refreshing = true;
		page.firstrefresh = false;
		page.refreshcnt = 0;
		
		Lianja.App.refreshingpage = page;
		if (funcstack.length != 0) 
		{
			if (Lianja.App.phonegap) Lianja.showLoadingIcon();
			new Lianja.dispatchCalls(funcstack, argstack, 
				function(d, args) 		// success
				{
					Lianja.refreshPageHeader(pageid);
					Lianja.refreshPageFooter(pageid);	
					Lianja.refreshRightSideBar(pageid);
					page.dirty = false;
					page.editing = false;
					page.adding = false;
					page.refreshing = false;
					Lianja.App.refreshingpage = undefined;
					Lianja.hideLoadingIcon();
					page.addRecentlyViewed();
					if (typeof args.onsuccess === 'function') args.onsuccess();
					delete d;
				},
				function(d, args)		// error
				{
					Lianja.App.refreshingpage = undefined;
					Lianja.showErrorMessage("The server failed to respond", "Server connection lost");
					Lianja.hideLoadingIcon();
					page.refreshing = false;
					if (typeof args.onerror === 'function') args.onerror();
					delete d;
				},
				{ "onsuccess":onsuccess, "onerror":onerror, "page":page }
			);
		}
		else
		{
			page.addRecentlyViewed();
			Lianja.hideLoadingIcon();
			if (typeof onsuccess === 'function') onsuccess();
		}
	};
};

//================================================================================
window.Lianja.dispatchCalls = function(funcarray, argarray, onsuccess, onerror, args)
{
	var self = this;
	this.stackptr = 0;
	this.funcarray = funcarray;
	this.argarray = argarray;
	this.haderror = false;
	this.onsuccess = onsuccess;
	this.onerror = onerror;
	this.args = args;
	
	if (argarray.length == 0) 
	{
		onsuccess(self, self.args);
		return;
	}
	
	this.performCall = function()
	{
		if (self.stackptr >= self.funcarray.length)
		{
			if (typeof self.args.page !== 'undefined') self.args.page.addRecentlyViewed();
			Lianja.hideLoadingIcon();
			if (!self.haderror) self.onsuccess(self, self.args);
			else self.onerror(self, self.args);
			return;
		}
		var funcref = self.funcarray[self.stackptr];
		var arg = self.argarray[self.stackptr];
		++self.stackptr;
		
		funcref(arg,  
			function() 
			{
				self.performCall();
			},
			function()
			{
				self.stackptr = self.funcarray.length;
				self.haderror = true;
				Lianja.hideLoadingIcon();
				self.onerror(self, self.args);
			}
		);
	};
	
	self.performCall();
};

//================================================================================
window.Lianja.Application = function()
{
	var self = this;
	this.name = "";
	this.cursors = [];
	this.pages = [];
	this.properties = {};
	this.pagemap = {};
	this.user = null;
	this.currentpageid = "";
	this.currentsectionid = "";
	this.variables = {};
	this.memobuffers = {};
	this.message = "";
	this.seqnovalue = 0;
	this.ajaxcalls = [];
	this.ajaxretries = [];
	this.ajaxtimers = [];
	this.validationformitems = [];
	this.validationerror = false;
	this.validationcount = 0;
	this.initialized = false;
	this.controlsourcesaved = [];
	this.delegatemap = {};
	this.attributes = {};
	this.cachekeys = [];
	this.cachevalues = [];
	this.activeurls = [];
	this.locale = 'en';
	this.animating = false;
	this.norecords = false;
	this.textcache = {};
	this.methodhandlers = {};
	this.phonegap = false;
	this.electron = false;
	this.baseurl = "";
	this.statusbarsetup = false;
	this.fullscreen = true;
	this.statusbarheight = 0;
	this.liveview = false;
	this.pendingloadPage = "";
	this.perms = false;
	this.buildmode = "";
	this.separator = ",";
	this.point = ".";
	this.currency = "$";

	//----------------------------------------------------------------------------
	this.checkPermission = function(id, type)
	{
		var role;
		var item;
		var itemrole;
		var itemroles;
		var user = Lianja.readCookieVar("LIANJAUSER");
		if (typeof user === 'string' && user === 'admin') return true;
		var roles = Lianja.readCookieVar("LIANJAUSERROLES");
		if (typeof roles === 'undefined' || roles === null) return true;
		id = str_replace("-", "_", id);
		try
		{
			item = Lianja.permsmap[id.toLowerCase()+"__"+type];
		} 
		catch (e)
		{
			item = undefined;
		}
		if (typeof item === 'undefined' || item === null) return true;
		itemroles = item.roles;
		if (roles.length == 0 && itemroles.length > 0) 
		{
			itemroles = itemroles.split(",");
			for (var i=0; i<itemroles.length; ++i)
			{
				itemrole = itemroles[i].toLowerCase();
				if (itemrole[0] == "~")
				{
					return true;
				}
			}
			return false;
		}
		id = str_replace("-", "_", id);
		roles = roles.split(",");
		if (typeof itemroles === 'undefined' || itemroles === null) return true;
		if (itemroles.length == 0) return true;
		itemroles = itemroles.split(",");
		for (var i=0; i<itemroles.length; ++i)
		{
			itemrole = itemroles[i].toLowerCase();
			if (itemrole[0] == "~")
			{
				for (var j=0; j<roles.length; ++j)
				{
					if (itemrole.substr(1) == roles[j].toLowerCase()) 
					{
						return false;
					}
				}
				return true;
			}
			for (var j=0; j<roles.length; ++j)
			{
				if (itemrole == roles[j].toLowerCase()) 
				{
					return true;
				}
			}
		}
		
		return false;
	};
	
	//----------------------------------------------------------------------------
	this.isWebView = function(section)
	{
		return section.type == 'webview' 
			|| section.type == 'catalogview' 
			|| section.type == 'report' 
			|| section.type == 'chart' 
			|| section.type == 'orgchart'
			|| section.type == 'commentsview'  
			|| section.type == 'documentview'  
			|| section.type == 'galleryview';
	};
	
	//----------------------------------------------------------------------------
	this.setCurrentPageID = function(pageid)
	{
		if (pageid[0] == '#') pageid = pageid.substring(1);
		Lianja.App.currentpageid = pageid;
	};
	
	//----------------------------------------------------------------------------
	this.getFullPathUrl = function(url)
	{
		if (!(self.phonegap||self.electron) || self.baseurl.length == 0) return url;
		if (startswith(url, "http://") || startswith(url, "https://")) return url;
		if (self.electron && startswith(url, "../../../library/"))
		{
			url = url.substring(9);
			return self.baseurl + url;
		}
		if (self.electron && !startswith(url, "/odata/"))
		{
			url = self.apppath + url;
			return url;
		}
		else if (url[0] == '/' && self.baseurl[ self.baseurl.length-1] == '/') 
		{
			url = url.substring(1);
			url = self.baseurl + url;
		}
		else if (url[0] != '/' && self.baseurl[ self.baseurl.length-1] != '/') 
		{
			return self.baseurl + "/" + url;
		}
		else url = self.baseurl + url;
		return url;
	};
	
	//----------------------------------------------------------------------------
	this.getMethodHandler = function(id)
	{
		id = str_replace("-", "_", id);
		return self.methodhandlers[ id.toLowerCase() ];
	};
	
	//----------------------------------------------------------------------------
	this.setMethodHandler = function(id, fn)
	{
		id = str_replace("-", "_", id);
		self.methodhandlers[ id.toLowerCase() ] = fn;
	};
	
	//----------------------------------------------------------------------------
	this.getTextCache = function(key)
	{
		key = str_replace("-", "_", key);
		var text = self.textcache[ key.toLowerCase() ];
		if (typeof text === 'undefined') return "";
		return text;
	};
	
	//----------------------------------------------------------------------------
	this.setTextCache = function(key, text)
	{
		key = str_replace("-", "_", key);
		self.textcache[ key.toLowerCase() ] = text;
	};

	//----------------------------------------------------------------------------
	this.onPause = function(event)
	{
	};
	
	//----------------------------------------------------------------------------
	this.onResume = function(event)
	{
	};
	
	//----------------------------------------------------------------------------
	this.onMenuButton = function(event)
	{
		Lianja.showPagesMenu();
	};
	
	
	//----------------------------------------------------------------------------
	this.init = function()
	{
		if (Lianja.isPhoneGap())
		{
			$.ajaxSetup({
				headers: {
					'phonegap' : Lianja.isPhoneGap() ? "true" : "false",
					'PhonegapApp' : Lianja.App.name,
					'PhonegapDevice' : Lianja.App.targetui,
					'PhonegapPlatformId' : typeof window.cordova !== 'undefined' ? window.cordova.platformId : 'com.adobe.phonegap.app',
					'PhonegapPlatformVersion' : typeof window.cordova !== 'undefined' ?  window.cordova.platformVersion : "5.0"
				}
			});
		}
		else if (Lianja.isElectron())
		{
			$.ajaxSetup({
				headers: {
					'phonegap' : Lianja.isPhoneGap() ? "true" : "false",
					'ElectronApp' : Lianja.App.name,
					'ElectronDebug' : Lianja.App.buildmode==="debug"
				}
			});
		}
		else
		{
			$.ajaxSetup({
				headers: {
					'phonegap' : Lianja.isPhoneGap() ? "true" : "false"
				}
			});
		}
		
		bootbox.setDefaults({ "animate": false } );

		// This prevents fast double clicks from highlighting text in blue on grids and
		// other UI elements
		document.onselectstart = function() { return false; };
		
		$('.lianja-ui-touchable').bind('touchstart', function(){
			Lianja.showTouch(this, true);
		}).bind('touchend', function(){
			Lianja.showTouch(this, false);
		});

		$('.lianja-ui-touchable').bind('mousedown', function(){
			Lianja.showTouch(this, true);
		}).bind('mouseup', function(){
			Lianja.showTouch(this, false);
		});

		$(".ui-lianja-ignoreclick h2 a").each(function(){
			Lianja.App.ignoreClickEvents($(this));
		});
		
		$("div:jqmData(role='collapsible')").each(function(){
			Lianja.App.bindAccordionEvents($(this)); 
		});
			
		// bind in vertical splitters left sidebar
		$(".ui-lianja-splitter-right").each(function() {
			self.bindSplitter(this, "right");
		});
		// bind in vertical splitters right sidebar
		$(".ui-lianja-splitter-left").each(function() {
			self.bindSplitter(this, "left");
		});
		
		// handle window resize events and stretch last sections
		$( window ).on("resize", function() {
			var clientheight = document.documentElement.clientHeight;
			var bodyheight = $(".mainbody").height();	// force recalc by the browser
			var clientwidth = document.documentElement.clientWidth;
			var bodywidth = $(".mainbody").width();	// force recalc by the browser
			$(".mainbody").css("display", "none");
			self.relayout();
			$(".mainbody").css("display", "block");
		});
		
		// handle section animations.
		if (Lianja.App.animationsenabled)
		{
			$(".lianja-ui-collapsible").on('expand collapse', function(event) {
				var el = $(this).find('.ui-collapsible-content');
				if (typeof el === 'undefined' || el === null) return true;
				var first = $(this).data("lianjaFirst");
				if (typeof first === 'undefined')
				{
					$(this).data("lianjaFirst", 'true');
					return true;
				}
				var disp = $(el).css("display");
				if (disp === "none")
				{
					var elicon = $(this).find('.ui-icon');
					$(elicon).removeClass("ui-icon-plus");
					$(elicon).addClass("ui-icon-minus");
				}
				else
				{
					var elicon = $(this).find('.ui-icon');
					$(elicon).removeClass("ui-icon-minus");
					$(elicon).addClass("ui-icon-plus");
				}
				$(el).slideToggle({ duration:400, progress: function() { Lianja.resize() }}, function() {
					Lianja.resize();
				});
				return false;
			});		
		}
		
		// handle accordion animations
		if (Lianja.App.animationsenabled&&false)
		{
			$(document).on('pagecreate', function () {

				$(".lianja-ui-animate-accordion .ui-collapsible-heading-toggle").on("click", function (e) {   
					//Lianja.App.animating = true;
					var current = $(this).closest(".ui-collapsible");
					if (current.hasClass("ui-collapsible-collapsed")) {
						$(".ui-collapsible-content", current).slideDown("fast", function () {
							//Lianja.App.animating = false;
							current.trigger("expand");  
							//hide previously expanded
							$(".lianja-ui-animate-accordion  .ui-collapsible-content-collapsed").slideUp('fast', function() {
								//current.trigger("expand");  
								Lianja.App.Relayout();
							});
							
						});
					} else {
						$(".ui-collapsible-content", current).slideUp("fast", function () {
							//Lianja.App.animating = false;
							current.trigger("collapse");
							Lianja.App.Relayout();
						});
					}
				});

				/*
				$(".lianja-ui-animate-accordion .ui-collapsible-heading-toggle").not(".lianja-ui-animate-accordion .ui-collapsible-heading-toggle").on("click", function (e) {        
					var current = $(this).closest(".ui-collapsible");             
					if (current.hasClass("ui-collapsible-collapsed")) {
						$(".ui-collapsible-content", current).not(".lianja-ui-animate-accordion .ui-collapsible-content").slideDown("fast", function () {
							current.trigger("expand");  
							//hide previously expanded               
						});
					} else {
						$(".ui-collapsible-content", current).not(".lianja-ui-animate-accordion .ui-collapsible-content").slideUp("fast", function () {
							current.trigger("collapse");
						});
					}
				});
				*/
			});
		}
		
		// handle accordion animations
		if (Lianja.App.animationsenabled&&false)
		{
			$(document).one("pagebeforechange", function() {
				$(".lianja-ui-animate-accordion").on("click", function (e) { 
					var el = $(this).find('.ui-collapsible-heading-toggle');
					var current = $(el).closest(".lianja-ui-animate-accordion");             
					if (current.hasClass("ui-collapsible-collapsed")) {
						//collapse all others and then expand this one
						$(".lianja-ui-animate-accordion").not(".ui-collapsible-collapsed").find(".ui-collapsible-heading-toggle").click();
						$(".ui-collapsible-content", current).slideDown(300, function() { Lianja.App.relayout(); });
					} else {
						$(".ui-collapsible-content", current).slideUp(300, function() { Lianja.App.relayout(); });
					}
				});
			});
		}
		
		if (Lianja.App.animationsenabled&&false)	// BM: Not yet a satisfactory effect.
		{
			$(document).one("pagebeforechange", function() {
				// animation speed;
				var animationSpeedDown = 400;
				var animationSpeedUp = 400;

				function animateCollapsibleSet(elm) {
					var first = $(elm).data("lianjaFirst");
					if (typeof first === 'undefined')
					{
						$(elm).data("lianjaFirst", "true");
						return true;
					}
					// can attach events only one time, otherwise we create infinity loop;
					elm.one("expand", function() {
						// hide the other collapsibles first;
						$(this).parent().find(".ui-collapsible-content").not(".ui-collapsible-content-collapsed").trigger("collapse");
						
						// animate show on collapsible;
						$(this).find(".ui-collapsible-content").slideDown(animationSpeedDown, function() {
							animateCollapsibleSet($(this).parent().trigger("expand"));
							//$(this).parent().parent().find(".ui-collapsible-content").not(".ui-collapsible-content-collapsed").trigger("collapse");
							Lianja.App.relayout();
						});

						// we do our own call to the original event;
						return false;
					}).one("collapse", function() {
						// animate hide on collapsible;
						$(this).find(".ui-collapsible-content").slideUp(animationSpeedUp, function() {
							// trigger original event;
							$(this).parent().trigger("collapse");
							//Lianja.App.relayout();
						});

						// we do our own call to the original event;
						return false;
					});
				}

				// init;
				animateCollapsibleSet($("[data-role='collapsible-set'] > [data-role='collapsible']"));
			});		
		}

		self.initialized = true;
		self.targetui = $('body').data("lianjaTargetui");
	};
	
	this.setReadonly = function(el, state)
	{
		if (state) { 
			if (typeof el === 'string')
			{
				document.getElementById(el).readOnly = true;
			}
			else
			{
				$(el).attr("readonly", true);
			}
		} 
		else 
		{ 
			if (typeof el === 'string')
			{
				document.getElementById(el).readOnly = false;
				document.getElementById(el).removeAttribute("readonly");
			}
			else
			{
				$(el).removeAttr("readonly");
			}
		}
	};
	
	this.addToCache = function(url, text)
	{
		self.cachekeys.push(url);
		self.cachevalues.push(text);
	};
	
	this.cacheIndexOf = function(url)
	{
		var i;
		for (i=0; i<self.cachekeys.length; ++i)
		{
			if (self.cachekeys[i] == url) return i;
		}
		return -1;
	};
	
	this.getCacheItem = function(pos)
	{
		return self.cachevalues[pos];
	};
	
	this.addActiveUrl = function(url)
	{
		self.activeurls.push(url);
	};
	
	this.activeUrlIndexOf = function(url)
	{
		var i;
		for (i=0; i<self.activeurls.length; ++i)
		{
			if (self.activeurls[i] == url) return i;
		}
		return -1;
	};
	
	this.removeActiveUrl = function(url)
	{
		self.activeurls = _.without(self.activeurls, url);
	};
	
	this.resizeGadgets = function()
	{
		var gadgets = $(".ui-lianja-iframe-wrapper");
		if (typeof gadgets === 'array' || typeof gadgets === 'object')
		{
			_.each(gadgets, function(el) {
				var sectionid = $(el).data("lianjaSectionid");
				var ht = $("#"+sectionid).height();
				var top = $(el).offset().top;
				var rht = ht - top;
				var elbot = $(el).data("lianjaBottom");
				rht -= elbot;
				$(el).css("max-height", rht+"px");
			});
		}

		gadgets = $(".ui-lianja-resizeintoparent");
		if (typeof gadgets === 'array' || typeof gadgets === 'object')
		{
			_.each(gadgets, function(el) {
				var parent = $(el).parent().parent();
				var h = $(parent).height();
				var w = $(parent).width();
				var elbot = $(el).data("lianjaBottom");
				var sectionid = $(el).data("lianjaSectionid");
				var formitemid = $(el).data("lianjaFormitemid");
				if (elbot < 0) h += elbot;
				else h -= elbot;
				var maxh = $(el).css("max-height");
				var maxw = $(el).css("max-width");
				var ppos;
				ppos = maxh.indexOf("px");
				if (ppos > 0 && ppos == maxh.length-2) maxh = parseFloat(maxh.substring(0, ppos));
				ppos = maxw.indexOf("px");
				if (ppos > 0 && ppos == maxw.length-2) maxw = parseFloat(maxw.substring(0, ppos));			
				var changed = maxh !== h || maxw !== w;
				if (changed)
				{
					if (h <= 0 || w <= 0)
					{
						//console.log("setTimeout() self.resizeGadgets()");
						setTimeout(function() { self.resizeGadgets(); }, 100);
					}
					else
					{
						$(el).css("max-height", h+"px");
						$(el).css("max-width", w+"px");
						Lianja.refreshGadget(sectionid, formitemid);
					}
				}
			});
		}

		gadgets = $(".ui-lianja-resizewidthintotd");
		if (typeof gadgets === 'array' || typeof gadgets === 'object')
		{
			_.each(gadgets, function(el) {
				var parent = $(el).parent();
				while (lower($(parent).prop("tagName")) !== 'td') 
				{
					parent = $(parent).parent();
				}
				var table = parent;
				while (lower($(table).prop("tagName")) !== 'table') 
				{
					table = $(table).parent();
					if (table == null) break;
				}
				var columncount = -1;
				if (table != null) columncount = $(table).data("lianjaColumncount");
				if (typeof columncount === 'undefined' || columncount == null) columncount = -1;
				var tr = $(parent).parent();
				var trw = $(tr).width();
				var td = parent;
				var h = $(parent).height();
				var w = $(parent).width();
				var elbot = $(el).data("lianjaBottom");
				var sectionid = $(el).data("lianjaSectionid");
				var formitemtype = $(el).data("lianjaFormitemtype");
				if (formitemtype === null || typeof formitemtype === 'undefined') formitemtype = '';
				if (typeof elbot !== 'undefined') h -= elbot;
				var maxh = $(el).css("max-height");
				var maxw = $(el).css("max-width");
				var ppos;
				ppos = maxh.indexOf("px");
				if (ppos > 0 && ppos == maxh.length-2) maxh = parseFloat(maxh.substring(0, ppos));
				ppos = maxw.indexOf("px");
				if (ppos > 0 && ppos == maxw.length-2) maxw = parseFloat(maxw.substring(0, ppos));
				if (w > trw) w = trw;
				var changed = maxh !== h || maxw !== w;
				//console.log("maxh="+maxh+", maxw="+maxw+", h="+h+", w="+w+", changed="+changed);
				if (changed)
				{
					if (h > 0)
					{
						h += 30;
						if (lower($(el).prop("tagName")) === 'iframe')
						{
							$(el).css("max-height", "100%");
							$(el).css("height", "100%");
							$(el).css("max-width", "100%");
							$(el).css("width", "100%");
						}
						else if (columncount > 0)
						{
							var colspan = $(td).attr("colspan");
							if (typeof colspan === 'string') colspan = parseInt(colspan);
							else colspan = 1;
							w = 100 / columncount;
							w = w * colspan;
							$(el).css("max-height", h+"px");
							$(el).css("height", h+"px");
							$(el).css("max-width", w+"%");
							$(el).css("width", w+"%");
						}
						else if (formitemtype === 'webview')
						{
							$(el).css("max-height", h+"px");
							$(el).css("height", h+"px");
							$(el).css("max-width", "100%");
							$(el).css("width", "100%");
						}
						else
						{
							$(el).css("max-height", h+"px");
							$(el).css("height", h+"px");
							$(el).css("max-width", "100%");
							$(el).css("width", "100%");
							$(el).css("max-width", w+"px");
							$(el).css("width", w+"px");
							//if (typeof sectionid !== 'undefined') Lianja.refreshGadget(sectionid, formitemid);
						}
					}
				}
			});
		}

		gadgets = $(".ui-lianja-resizeheightintoparent");
		if (typeof gadgets === 'array' || typeof gadgets === 'object')
		{
			_.each(gadgets, function(el) {
				var parent = $(el).parent().parent();
				var h = $(parent).height();
				var elbot = $(el).data("lianjaBottom");
				var sectionid = $(el).data("lianjaSectionid");
				var formitemid = $(el).data("lianjaFormitemid");
				if (typeof elbot !== 'undefined') h -= elbot;
				var maxh = $(el).css("max-height");
				var ppos;
				ppos = maxh.indexOf("px");
				if (ppos > 0 && ppos == maxh.length-2) maxh = parseFloat(maxh.substring(0, ppos));
				var changed = maxh !== h;
				if (changed)
				{
					if (h <= 0)
					{
						//console.log("setTimeout() self.resizeGadgets()");
						setTimeout(function() { self.resizeGadgets(); }, 100);
					}
					else
					{
						$(el).css("max-height", h+"px");
						Lianja.refreshGadget(sectionid, formitemid);
					}
				}
			});
		}
	};

	this.bindSplitter = function(el, position)
	{
		if (self.initialized) return;
		$(el).data("closed", "false");
		$(el).data("splitterposition", position);
		$(el).on('mouseenter', function (e) {
			$(this).css("backgroundColor", "lightgray");
			var closed = $(this).data("closed");
			if (closed === "false")
			{
				$(this).css("cursor", "w-resize");
			}
			else
			{
				$(this).css("cursor", "e-resize");
			}
			e.preventDefault();
			return false;
		});

		$(el).on('mouseleave', function (e) {
			$(this).css("backgroundColor", "white");
			e.preventDefault();
			return false;
		});

		$(el).on('click', function (e) {
			var closed = $(this).data("closed");
			var splitterposition = $(this).data("splitterposition");
			var parent = $(this).parent().parent().parent();
			var width = $(this).parent().width();
			var targetdiv = $(this).data("lianja-targetdiv");
			var contdiv = $(this).data("lianja-contdiv");
			var tablediv = $(this).data("lianja-tablediv");
			var contentdiv = $(this).data("lianja-contentdiv");
			var expandedwidth = $(this).data("lianja-expanded-width");
			var pagediv = $(this).data("lianja-pagediv");
			var self = this;
			var animate = false;
			
			if (closed === "false")
			{
				$(this).data("closed", "true");
				if (splitterposition === 'right')
				{
					var pageid = $("#"+contdiv).data("lianjaPageid");
					var page = Lianja.App.getPage(pageid);
 
					if (animate)
					{
						$("#"+contdiv).animate(
							{width:"6px", maxWidth:"6px"}, 
							{ 
								progress: function() {
									$(".ui-lianja-pagecontent").trigger("updatelayout");
									Lianja.resize();
								},
								complete: function() {
									$("#"+contdiv).css("width", "6px");
									$("#"+contdiv).css("max-width", "6px");
									$("#"+tablediv).css("display", "none");
									$(self).css("right", undefined);
									$(self).css("left", "0px");
									$(parent).css("padding-left", "0px");
									$(".ui-lianja-pagecontent").trigger("updatelayout");
									Lianja.resize();
								}
							}
						);
					}
					else
					{
						$("#"+contdiv).css("width", "6px");
						$("#"+contdiv).css("max-width", "6px");
						$("#"+tablediv).css("display", "none");
						$(this).css("right", undefined);
						$(this).css("left", "0px");
						$(parent).css("padding-left", "6px");
						$(".ui-lianja-pagecontent").trigger("updatelayout");
						Lianja.resize();
						page.adjustAbsoluteSections("left", "6px");
					}
				}
				else
				{
					if (animate)
					{
						$("#"+targetdiv).animate({ width:"13px"}, {progress: function() {$(".ui-lianja-pagecontent").trigger("updatelayout");Lianja.resize();} }, 400, function()
						{
							$("#"+targetdiv+"panel").css("display", "none");
							$("#"+contentdiv+"-inner").css("padding-right", "15px");
							$(self).css("left", "8px");
							$(".ui-lianja-pagecontent").trigger("updatelayout");
							Lianja.resize();
						});
					}
					else
					{
						$("#"+targetdiv).width("6px");
						$("#"+targetdiv+"panel").css("display", "none");
						$("#"+contentdiv+"-inner").css("padding-right", "6px");
						$(this).css("left", "0px");
						$(".ui-lianja-pagecontent").trigger("updatelayout");
						Lianja.resize();
					}
				}
			}
			else
			{
				$(this).data("closed", "false");
				if (splitterposition === 'right')
				{
					var pageid = $("#"+contdiv).data("lianjaPageid");
					var page = Lianja.App.getPage(pageid);
					$("#"+tablediv).css("display", "block");
					if (animate)
					{
						$("#"+contdiv).animate({ width: expandedwidth+"px", maxWidth: expandedwidth+"px" }, 400, function()
						{
							$("#"+contdiv).css("max-width", expandedwidth+"px");
							$("#"+contdiv).css("width", expandedwidth+"px");
							$("#"+targetdiv).css("width", expandedwidth+"px");
							$(self).css("left", expandedwidth-6);
							$(parent).css("padding-left", expandedwidth);
							$(".ui-lianja-pagecontent").trigger("updatelayout");
							Lianja.resize();
						});
					}
					else
					{
						$("#"+contdiv).css("max-width", expandedwidth+"px");
						$("#"+contdiv).css("width", expandedwidth+"px");
						$("#"+targetdiv).css("width", expandedwidth+"px");
						$("#"+tablediv).css("display", "block");
						$(this).css("left", expandedwidth-6);
						$(parent).css("padding-left", expandedwidth);
						$(".ui-lianja-pagecontent").trigger("updatelayout");
						Lianja.resize();
						page.adjustAbsoluteSections("left", expandedwidth+"px");
					}
				}
				else
				{
					$("#"+targetdiv+"panel").css("display", "block");
					$("#"+contentdiv+"-inner").css("padding-right", (expandedwidth)+"px");
					$(self).css("left", "0px");
					if (animate)
					{
						$("#"+targetdiv).animate({ width: expandedwidth+"px", maxWidth: expandedwidth+"px" }, 400, function()
						{
							$("#"+targetdiv).width(expandedwidth+"px");
							$(".ui-lianja-pagecontent").trigger("updatelayout");
							Lianja.resize();
						});
					}
					else
					{
						$("#"+targetdiv).width(expandedwidth+"px");
						$(this).css("left", "0px");
						$(".ui-lianja-pagecontent").trigger("updatelayout");
						Lianja.resize();
					}
				}
			}
			e.preventDefault();
		});
	};
	
	//----------------------------------------------------------------------------
	this.initExtensions = function()
	{
		//$.extend($.inputmask.defaults.definitions, {
		Inputmask.extendDefinitions({
			'A': { 
				validator: "[A-Za-z]",
				cardinality: 1
			},
			'x': {
				validator: "[A-Za-z\u0410-\u044F\u0401\u04510-9 ]",
				cardinality: 1
			},
			'X': {
				validator: "[A-Za-z\u0410-\u044F\u0401\u04510-9 ]",
				cardinality: 1
			},
			'!': {
				validator: "[A-Za-z\u0410-\u044F\u0401\u04510-9 ]",
				cardinality: 1,
				casing: "upper"
			},
			'^': {
				validator: "[A-Za-z\u0410-\u044F\u0401\u0451]",
				cardinality: 1,
				casing: "upper"
			}
		});
		//$.extend($.inputmask.defaults, {
		Inputmask.extendDefaults({
			showMaskOnFocus:false,
			showMaskOnHover:false,
			autoUnmask:true,
			numericInput:false
		});
		if (Lianja.isPhoneGap())
		{
			$.fn.checkboxpicker.defaults.reverse = true;
		}
	};

	//----------------------------------------------------------------------------
	this.addDelegate = function(id, event, action)
	{
		if (action.indexOf("(") < 0) action = action + "()";
		self.delegatemap[id+"__"+event+"__"] = action;
	};
	
	//----------------------------------------------------------------------------
	this.dispatchDelegate = function(id, event, value)
	{
		id = id.replace(/-/g, "_");
		var action = self.delegatemap[ id+"__"+event+"__"];
		if (typeof action === 'undefined') return false;
		if (typeof value !== 'undefined') action = str_replace("{}", value, action);
		var rc = eval( action );
		if (typeof rc !== 'boolean') return true;
		return rc;
	};
	
	//----------------------------------------------------------------------------
	this.hasDelegate = function(id, event)
	{
		id = id.replace(/-/g, "_");
		var action = self.delegatemap[ id+"__"+event+"__"];
		return (typeof action !== 'undefined');
	};
	
	//----------------------------------------------------------------------------
	this.clearControlSourceSaved = function()
	{
		self.controlsourcesaved = [];
	};
	
	//----------------------------------------------------------------------------
	this.setControlSourceSaved = function(controlsource)
	{
		this.controlsourcesaved.push(controlsource);
	};
	
	//----------------------------------------------------------------------------
	this.getControlSourceSaved = function(controlsource)
	{
		return self.controlsourcesaved.indexOf(controlsource) >= 0;
	};
	
	//----------------------------------------------------------------------------
	this.clearValidationFormItems = function()
	{
		self.validationformitems = [];
	};
	
	//----------------------------------------------------------------------------
	this.addValidationFormItems = function(formitem)
	{
		self.validationformitems.push(formitem);
	};
	
	//----------------------------------------------------------------------------
	this.validationFormItemsCount = function()
	{
		return self.validationformitems.length;
	};
	
	//----------------------------------------------------------------------------
	this.validationFormItem = function(index)
	{
		return self.validationformitems[index];
	};
	
	//----------------------------------------------------------------------------
	this.addAjaxCall = function(promise, url)
	{
		self.ajaxcalls.push(promise);
		ajaxurls.push(url);
		self.ajaxretries.push(0);
		self.ajaxtimers.push( new Date() );
		++ajaxcount;
	};
	
	//----------------------------------------------------------------------------
	this.removeAjaxCall = function(promise)
	{
		var i = self.ajaxcalls.indexOf(promise);
		if (i != -1) 
		{
			self.ajaxcalls.splice(i, 1);
			self.ajaxretries.splice(i, 1);
			self.ajaxtimers.splice(i, 1);
			ajaxurls.splice(i, 1);
			--ajaxcount;
		}
	};

	//----------------------------------------------------------------------------
	this.handleAjaxRetries = function()
	{
	};
	
	//----------------------------------------------------------------------------
	this.seqno = function()
	{
		self.seqnovalue++;
		return self.seqnovalue;
	};
	
	//----------------------------------------------------------------------------
	this.getMessage = function()
	{
		return self.message;
	};
	
	//----------------------------------------------------------------------------
	this.setMessage = function(text)
	{
		self.message = text;
	};
	
	//----------------------------------------------------------------------------
	this.ignoreClickEvents = function(element) {
		$(element).off('click tap');
		$(element).on('click tap', function(event, ui) {
			event.preventDefault();
			return false;
		});
	};
	
	//----------------------------------------------------------------------------
	this.bindAccordionEvents = function(element) {
		//if (Lianja.App.animationsenabled) return;
		$(element).off('expand collapse');
		$(element).on('expand collapse', function(event, ui) {
			//if (Lianja.App.animating) return true;
			self.relayout();
			setTimeout( function() { self.relayout() }, 0);
		});
	};

	//----------------------------------------------------------------------------
	this.autoResizeSections = function()
	{
		var pagecount = Lianja.App.getPageCount();
		var i;
		var j;
		var page;
		var section;
		var sectioncount;
		var autolayoutlist;
		var list;
		var changed = false;
		var percent = "";
		var innerframe;
		var outerframe;
		
		for (i=0; i<pagecount; ++i)
		{
			page = Lianja.App.getPage(i);
			autolayoutlist = page.autolayoutlist;
			if (autolayoutlist == null || typeof autolayoutlist === 'undefined' || autolayoutlist.length === 0) continue;
			list = autolayoutlist.split(",");
			sectioncount = page.getSectionCount();
			changed = false;
			for (j=0; j<sectioncount; ++j)
			{
				if (list[j] === "0") continue;
				percent = "" + list[j] + "%";
				section = page.getSection(j);
				innerframe = $("#"+section.sectionid+"-container-innerframe");
				outerframe = $("#"+section.sectionid+"-container-outerframe");
				$(section.$element).css("height", percent);
				$(outerframe).css("max-height", undefined);
				$(outerframe).css("height", "100%");
				$(innerframe).css("max-height", undefined);
				$(innerframe).css("height", "100%");
				changed = true;
			}
		}
		
		if (!changed)
		{
			for (i=0; i<pagecount; ++i)
			{
				page = Lianja.App.getPage(i);
				autolayoutlist = page.autolayoutlist;
				if (autolayoutlist == null || typeof autolayoutlist === 'undefined' || autolayoutlist.length === 0) continue;
				list = autolayoutlist.split(",");
				sectioncount = page.getSectionCount();
				percent = "" + Math.round(100 / sectioncount) + "%";
				for (j=0; j<sectioncount; ++j)
				{					
					section = page.getSection(j);
					innerframe = $("#"+section.sectionid+"-container-innerframe");
					outerframe = $("#"+section.sectionid+"-container-outerframe");
					$(section.$element).css("height", percent);
					$(outerframe).css("max-height", undefined);
					$(outerframe).css("height", "100%");
					$(innerframe).css("max-height", undefined);
					$(innerframe).css("height", "100%");
				}
			}
		}
	};
	
	//----------------------------------------------------------------------------
	this.callResizeDelegates = function()
	{
		var pagecount = Lianja.App.getPageCount();
		var i;
		var j;
		var page;
		var section;
		var sectioncount;
		
		for (i=0; i<pagecount; ++i)
		{
			page = Lianja.App.getPage(i);
			sectioncount = page.getSectionCount();
			for (j=0; j<sectioncount; ++j)
			{
				section = page.getSection(j);
				if (section.type === "canvas" || section.type === "custom") 
				{
					Lianja.App.dispatchDelegate(section.sectionid, "resized"); 
				}
			}
		}		
	};
	
	//----------------------------------------------------------------------------
	this.relayoutSections = function()
	{
		if (!Lianja.ready) return;
		
		//console.log("relayout()");

		$(".ui-lianja-ignoreclick h2 a").each(function(){
			Lianja.App.ignoreClickEvents($(this));
		});
		
		self.autoResizeSections();
		
		$(".ui-lianja-stretchlastsection").each(function()
		{
			var me = this;
			self.stretchLastSection(this);
			//console.log("setTimeout()");
			//setTimeout(function() { self.stretchLastSection(me); }, 0);
		});
	
		var bartop = 0;
		var found = false;
		$(".ui-lianja-stretchaccordionsection").each(function()
		{
			if (found) return;
			var expanded = !$(this).hasClass("ui-collapsible-heading-collapsed");
			if (expanded) found = true;
			else
			{
				bartop += 35 + 80;
			}
		});

		$(".ui-lianja-stretchaccordionsection").each(function()
		{
			self.stretchAccordionSection(this, bartop);
		});
		
		// if (typeof LianjaAppBuilder !== 'undefined' && false)
		// {
			// $(".ui-lianja-div40").each(function()
			// {
				// var me = this;
				// $(me).css("bottom", "83px");
			// });
		// }
	};

	//----------------------------------------------------------------------------
	this.relayout = function()
	{
		if (!Lianja.ready) return;
		self.relayoutSections();
		setTimeout(self.resizeTimerExpired, 0);
	};

	//----------------------------------------------------------------------------
	this.resizeTimerExpired = function()
	{
		Lianja.App.resizeGadgets();
		Lianja.relayoutSections();
		self.callResizeDelegates();
	};
	
	//----------------------------------------------------------------------------
	this.stretchAccordionSection = function(element, bartop)
	{
		var page = Lianja.App.getPage(element.id);
		var count = page.getSectionCount();
		$(".ui-collapsible-heading", element).each(function()
		{
			var expanded = !$(this).hasClass("ui-collapsible-heading-collapsed");
			var sectionid = $(this).data("lianjaSectionid");
			if (expanded)
			{
				var section = page.getSection(sectionid);
				var container_height = $(window).height();
				var section_height;
				if (!self.hideheader) container_height -= 44;	// page header bar
				container_height -= 20;	// top and bottom margins
				container_height = container_height - ((count-1) * 35);
				container_height += 15;
				container_height -= page.getMargin();
				if (!section.hidenavbar) container_height -= 39;	// page navigation footer bar if visible
				var outerframe = $("#"+section.sectionid+"-container-outerframe");
				if (typeof outerframe === 'undefined' || typeof $(outerframe).attr('id') === 'undefined') 
				{
					return;
				}
				var innerframe = $("#"+section.sectionid+"-container-innerframe");
				section_height = container_height - bartop + 2;
				inner_height = section_height - 37;	// section header
				$(section.$element).css("max-height", section_height+"px");
				$(section.$element).css("height", section_height+"px");
				$(outerframe).css("max-height", inner_height+"px");
				$(outerframe).css("height", inner_height+"px");
				$(innerframe).css("max-height", (inner_height)+"px");
				$(innerframe).css("height", (inner_height)+"px");
			}
			else
			{
				var section = page.getSection(sectionid);
				$(section.$element).css("max-height", "36px");
				$(section.$element).css("height", "36px");
			}
		});
	};
	
	//----------------------------------------------------------------------------
	this.calcSectionTop = function(page, section)
	{
		var count = page.getSectionCount();
		if (count == 1) return 0;
		
		var i;
		var ypos = 0;
		var sect;
		var sht;
		
		for (i=0; i<count-1; ++i)
		{
			sect = page.getSection(i);
			sht = $("#"+sect.sectionid).height();
			//console.log("section["+i+"] ypos="+sht);
			ypos = ypos + sht;
		}
		
		//console.log("ypos="+ypos);
		return ypos;
	};
	
	//----------------------------------------------------------------------------
	this.stretchLastSection = function(element)
	{
		var heightoffset = $(element).data("lianjaHeightOffset");
		var nomargin = $(element).data("lianjaNomargin");
		if (typeof nomargin === 'undefined') nomargin = false;
		if (typeof heightoffset === 'undefined') heightoffset = 0;
		var page = Lianja.App.getPage(element.id);
		var count = page.getSectionCount();
		if (count == 0) return;
		var window_height = document.documentElement.clientHeight - Lianja.App.statusbarheight; 
		if (window_height <= 0) return;
		var window_fullheight = window_height;
		var section_height;
		var inner_height = undefined;
		var outer_height;
		var section = page.getSection(count-1);
		
		while (!section.permread)
		{
			--count;
			if (count == 0) return;
			section = page.getSection(count-1);
		}
		if (section.nostretch) return;
		var outerframe = $("#"+section.sectionid+"-container-outerframe");
		var innerframe = $("#"+section.sectionid+"-container-innerframe");
		if (typeof outerframe === 'undefined' || typeof $(outerframe).attr('id') === 'undefined') 
		{
			return;
		}
		var yoffset = outerframe.data('lianjaYoffset');
		if (typeof yoffset === 'undefined') yoffset = 0;
		var outerhadj = outerframe.data('lianjaHeightAdjustment');
		if (typeof outerhadj === 'undefined') outerhadj = 0;
		var hadj = $(element).data("lianjaHeightAdjustment");
		if (typeof hadj === 'undefined') hadj = 0;
		var inneryoffset = innerframe.data('lianjaYoffset');
		if (typeof inneryoffset === 'undefined') inneryoffset = 0;
		var innerheight = innerframe.data('lianjaInnerHeight');
		if (typeof innerheight === 'undefined') innerheight = "0";
		var hideheader = $("#"+section.sectionid).data("lianjaHideheader");
		if (typeof hideheader === 'undefined') hideheader = false;
		var hadj = innerframe.data('lianjaHeightAdjustment');
		if (typeof hadj === 'undefined') hadj = 0;		
		var child = $(section.$element).children()[0];
		var barheight = $(child).height();
		var bartop = $(child).position().top;
		var childName = $(child).prop("tagName"); 
		var classlist = $(child).attr("class");
		var inner_margin;
		var grid = false;
		var calendar = false;
		var lastgrid = false;
		var singlewebview = false;
		var singlegrid = false;
		var tabview = section.type == 'tabview';
		var canvas = section.type == 'canvas';
		var galleryview = section.type == 'galleryview';
		var imagestrip = section.type == 'imagestrip';
		var webview = Lianja.App.isWebView(section);
		var autoheight = section.autoheight;
		if (count == 1) window_height -= 7;
		if (webview) autoheight = false;
		grid = section.type == 'grid' || section.type == 'attachments';
		
		if ($(section.$element).css("position") === "absolute" && !grid && hideheader)
		{			
			if ($(innerframe).hasClass("lianja-ui-nostretch")) return;		
			$(innerframe).css("max-height", undefined);
			$(innerframe).css("height", "100%");
			return;
		}
		
		if (bartop == 0)
		{			
			bartop = $("#"+section.sectionid).position().top;
			if (bartop == 0 && count > 1) 
			{
				//bartop = self.calcSectionTop(page, section);
				if (typeof section.relayoutcnt === 'undefined') section.relayoutcnt = 0;
				++section.relayoutcnt;
				if (section.relayoutcnt > 100)
				{
				   section.relayoutcnt = 0;
				   clearTimeout(section.relayoutimerid);
				   return;
				}
				if (typeof section.relayoutimerid !== 'undefined') clearTimeout(section.relayoutimerid);
				section.relayoutimerid = setTimeout(function() { Lianja.App.relayoutSections(); }, 100);
				return;
			}
		}
		
		section_height = window_height - bartop + 2;
		window_height -= bartop;
		section_height += heightoffset;
		section_height -= 40;	// page header bar
		if (!section.hidenavbar) section_height -= 43;	// page navigation footer bar if visible
		if (hideheader) section_height += 40;
		
		if (grid) 
		{
			window_height -= 15;
			section_height -= 15;
			if (!$("#"+element.id+"-content").hasClass("splitviewcontainer")) section_height -= 5;
			if (count > 1 && yoffset == 0) 
			{
				window_height -= 20;
				section_height -= 5;
				lastgrid = true;
			}
			else if (count == 1)
			{
				if (hideheader) 
				{
					singlegrid = true;
					section_height += 12;
				}
			}
		}
		else if (section.type == 'tabview') 
		{
			window_height -= 10;
			section_height -= 10;
			if (!$("#"+element.id+"-content").hasClass("splitviewcontainer")) section_height -= 10;
		}
		else if (webview)
		{
			if (count > 1) 
			{
				window_height -= 5;	
				section_height -= 5;
			}
			else
			{
				window_height -= 6;	
				section_height -= 2;
				singlewebview = true;
				if (hideheader) 
				{
					section_height += 10;
					inner_height = section_height - 30;
				}
			}
			if (!$("#"+element.id+"-content").hasClass("splitviewcontainer")) 
			{
				section_height -= 20;
			}
		}
		else if (section.type == 'form') 
		{
			if (count > 1) 
			{
				if (!hideheader)
				{
					window_height -= 5;	
					section_height -= 5;
				}
			}
			else
			{
				window_height -= 2;	
				section_height -= 2;
				if (hideheader)
				{
					section_height += 15;
				}
			}
			if (!$("#"+element.id+"-content").hasClass("splitviewcontainer")) section_height -= 20;
		}
		else if (section.type == 'canvas' || section.type == 'custom') 
		{
			if (count > 1) 
			{
				window_height += 15;	
				section_height += 15;
			}
			else
			{
				window_height -= 2;	
				section_height -= 2;
			}
			if (!$("#"+element.id+"-content").hasClass("splitviewcontainer")) section_height -= 20;
		}
		else if (section.type == 'carouselview') 
		{
			if (count > 1) 
			{
				window_height += 15;	
				section_height += 15;
			}
			else
			{
				window_height -= 2;	
				section_height -= 2;
			}
		}
		else if (section.type == 'catalogview') 
		{
			if (count > 1) 
			{
				window_height -= 15;	
				section_height -= 15;
			}
			else
			{
				window_height -= 2;	
				section_height -= 2;
			}
			if (!$("#"+element.id+"-content").hasClass("splitviewcontainer")) section_height -= 20;
		}
		else if (section.type == 'calendar') 
		{
			calendar = true;
			if (count > 1) 
			{
				window_height -= 36;	
				section_height -= 6;
			}
			else
			{
				window_height -= 2;	
				section_height -= 2;
			}
			if (!$("#"+element.id+"-content").hasClass("splitviewcontainer")) section_height -= 20;
		}
		
		if (!section.hideheader) 
		{
			inner_height = section_height - 35;	// section header
		}
		else if (typeof inner_height === 'undefined') 
		{
			if (lastgrid) inner_height = window_height;
			else inner_height = section_height;			
		}
		
		inner_margin = $(innerframe).css("margin-bottom");
		if (typeof inner_margin == 'undefined') 
		{
			inner_margin = 5;
		}
		else 
		{
			var ppos = inner_margin.indexOf("px");
			if (ppos > 0 && ppos == inner_margin.length-2) inner_margin = parseInt(inner_margin.substring(0, ppos));
			else inner_margin = parseInt(inner_margin);
		}
		if (section.type == 'tabview') 
		{
			inner_height -= 5;
			inner_height -= inner_margin*2;
		}
		if (inner_margin == 0) inner_margin = 5;
		if (section.hideheader) 
		{
			inner_height -= 1;
			section_height -= 1;
			section_height -= (inner_margin*2);		// section margin
		}
		else
		{
			section_height -= inner_margin;		// section margin
			if (grid || lastgrid) inner_height -= inner_margin;
		}
		
		if (nomargin) 
		{
			inner_margin = 0;
			inner_height += 5;
			section_height += 5;
		}
		
		outer_height = inner_height;
		inner_height -= yoffset;
		inner_height -= inneryoffset;
		
		if (page.hideheader)
		{
			section_height += 40;
			outer_height += 40;
			inner_height += 40;
			inner_height += 40;
		}
		
		if (page.hasCarouselView())
		{
			outer_height += 5;
			inner_height += 5;
			inner_height += 5;
			section_height = inner_height;
		}
		
		if (grid)
		{
			section_height += 1;
			inner_height += 1;
			outer_height += 1;
		}

		if (section.type == 'commentsview')
		{
			if (!section.hideheader)
			{
				inner_height -= 6;
				outer_height -= 6;
			}
			else
			{
				section_height += 1;
			}
		}
		else if (section.type == 'canvas')
		{
			section_height -= 30; 
			inner_height -= 41;
			outer_height -= 41;
		}
		else if (section.type == 'documentview') 
		{
			section_height += 13;
			inner_height += 13;
			outer_height += 13;
		}
		else if (section.type === 'form' && Lianja.App.targetui === "phone")
		{
			section_height -= 30; 
			inner_height += 30;
			outer_height += 30;
		}
		
		// BM: v2.0 adjust into the viewport to accupy it all without margins
		section_height += 5;
		inner_height += 5;
		outer_height += 5;
		
		var fixedht = page.stretchfixedheight;
		var minht = page.stretchlastsectionminheight;
		if (fixedht > 0)
		{
			var new_height = section_height;
			section_height = fixedht;
			inner_height = fixedht;
			if (count > 1)
			{
				var prevsection = page.getSection(count-2);
				var previnnerframe = $("#"+prevsection.sectionid+"-container-innerframe");
				var prevouterframe = $("#"+prevsection.sectionid+"-container-outerframe");
				var py = prevsection.$element[0].offsetTop;
				var pht = $(prevsection.$element).css("height");
				var pxpos = pht.indexOf("px");
				if (pxpos > 0) pht = pht.substring(0, pxpos);
				var sy = section.$element[0].offsetTop;
				var diffh = new_height - section_height;
				pht = Number(pht);
				if (pht > 0)
				{
					var prevsection_height = pht+diffh;
					$(prevsection.$element).css("height", prevsection_height+"px");
					$(prevouterframe).css("max-height", prevsection_height+"px");
					$(prevouterframe).css("height", prevsection_height+"px");
					$(previnnerframe).css("max-height", prevsection_height+"px");
					$(previnnerframe).css("height", prevsection_height+"px");
				}
			}
		}
		else if (minht > 0 && section_height < minht)
		{
			var diffh = minht - section_height;
			section_height = minht;
			inner_height = inner_height + diffh;
		}
		if (singlewebview)
		{
			inner_height -= 3;
		}
		if (singlegrid)
		{
			inner_height -= 7;
		}
		
		section_height = Math.round(section_height);
		inner_height = Math.round(inner_height);
		outer_height = Math.round(outer_height);
		outer_height -= hadj;
		inner_height -= hadj;
		
		var margin = page.getMargin();
		inner_height -= margin;
		outer_height -= margin;
		section_height -= margin;
		
		$(innerframe).css("max-height", undefined);
		
		if (section.type == 'canvas')
		{
			section_height += 15;
			$(section.$element).css("height", section_height+"px");
			$(innerframe).css("max-height", undefined);
			$(innerframe).css("height", "100%");
		}
		else if (section.type == 'custom')
		{
			section_height += 15;
			$(section.$element).css("height", section_height+"px");
			$(innerframe).css("height", undefined);
		}
		else if (autoheight && !webview && !grid && !tabview && !imagestrip && !calendar)
		{
			$(outerframe).css("max-height", undefined);
			$(outerframe).css("height", "100%");
			$(innerframe).css("max-height", undefined);
			$(innerframe).css("height", "100%");
		}
		else if (calendar)
		{
			//if (inner_height+"px" === $(innerframe).css("height")) return;
			$(section.$element).css("height", undefined);
			$(outerframe).css("max-height", undefined);
			$(outerframe).css("height", outer_height+"px");
			$(innerframe).css("max-height", undefined);
			$(innerframe).css("height", inner_height+"px");
		}
		else if (grid && section.hideheader)
		{
			var gridcontainer = $("#"+section.sectionid+"-gridcontainer-basecontainer");
			if (inner_height+"px" === $(gridcontainer).css("height")) return;
			section_height -= 30;
			if (count==1) section_height -= 9;
			$(section.$element).css("height", section_height+"px");
			$(outerframe).css("max-height", undefined);
			$(outerframe).css("height", '100%');
			$(innerframe).css("max-height", undefined);
			$(innerframe).css("height", '100%');
			//$(gridcontainer).css("height", "100%");
		}
		else if (grid)
		{
			outer_height += 4;
			inner_height += 4;
			if (count === 1) inner_height -= 10; 
			var gridcontainer = $("#"+section.sectionid+"-gridcontainer-basecontainer");
			//if (inner_height+"px" === $(gridcontainer).css("height")) return;
			$(outerframe).css("max-height", undefined);
			$(outerframe).css("height", outer_height+"px");
			$(innerframe).css("max-height", undefined);
			$(innerframe).css("height", inner_height+"px");
			$(gridcontainer).css("height", inner_height+"px");
		}
		else if (tabview)
		{
			if (inner_height+"px" === $(innerframe).css("height")) return;
			$(section.$element).css("height", "auto");
			if (!grid) $(outerframe).css("max-height", undefined);
			if (!grid) $(outerframe).css("height", undefined);
			if (!grid) $(innerframe).css("max-height", undefined);
			$(innerframe).css("height", inner_height+"px");
		}
		else if (webview)
		{
			outer_height = outer_height - outerhadj;
			if (section.hideheader) 
			{
				section_height -= 30;
				inner_height = "100%";
				outer_height -= 30;
			}
			else
			{
				section_height += 8;
				inner_height += 6;
			}
			var maxht = window_fullheight - outerhadj;
			var eltop = document.getElementById(section.sectionid).getBoundingClientRect().top;
			var elsize = eltop + section_height;
			var eldiff = maxht - elsize;
			if (eldiff < 0) 
			{
				var newht = (maxht - eltop);
				if (newht < 0) newht = -newht;
				section_height = newht;
				inner_height = section_height;
				outer_height = section_height;
			}
			$(section.$element).css("height", section_height+"px");
			if (!grid) $(outerframe).css("max-height", undefined);
			if (!grid) $(outerframe).css("height", outer_height+"px");
			if (!grid) $(innerframe).css("max-height", undefined);
			$(innerframe).css("height", inner_height+"px");
			return;
		}
		else if (!grid)
		{
			if (inner_height+"px" === $(innerframe).css("height")) return;
			$(section.$element).css("height", section_height+"px");
			if (!grid) $(outerframe).css("max-height", undefined);
			if (!grid) $(outerframe).css("height", outer_height+"px");
			if (!grid) $(innerframe).css("max-height", undefined);
			$(innerframe).css("height", inner_height+"px");
		}
		else
		{
			var gridcontainer = $("#"+section.sectionid+"-gridcontainer-basecontainer");
			if (inner_height+"px" === $(gridcontainer).css("height")) return;
			$(section.$element).css("height", undefined);
			$(outerframe).css("max-height", undefined);
			$(outerframe).css("height", undefined);
			$(innerframe).css("max-height", undefined);
			$(innerframe).css("height", inner_height+"px");
			$(gridcontainer).css("height", inner_height+"px");
		}
		
		if (bartop == 0)
		{
			if (typeof section.relayoutcnt === 'undefined') section.relayoutcnt = 0;
			++section.relayoutcnt;
			if (section.relayoutcnt > 25)
			{
			   section.relayoutcnt = 0;
			   clearTimeout(section.relayoutimerid);
			   return;
			}
			if (typeof section.relayoutimerid !== 'undefined') clearTimeout(section.relayoutimerid);
			section.relayoutimerid = setTimeout(function() { Lianja.App.relayoutSections(); }, 100);
		}
		else if (($(section.$element).css("position") === "relative" && !hideheader))
		{
			if ((bartop == 0 && !section.accordionstack))
			{
				if (typeof section.relayoutcnt === 'undefined') section.relayoutcnt = 0;
				++section.relayoutcnt;
				if (section.relayoutcnt > 25)
				{
					section.relayoutcnt = 0;
					clearTimeout(section.relayoutimerid);
					return;
				}
				if (typeof section.relayoutimerid !== 'undefined') clearTimeout(section.relayoutimerid);
				section.relayoutimerid = setTimeout(function() { self.relayoutSections(); }, 100);
			}
		} 
	};
	
	//----------------------------------------------------------------------------
	this.setMemoBuffer = function(containerid, text)
	{
		containerid = containerid.replace(/-/g, "_");
		self.memobuffers[ containerid.toLowerCase() ] = text;
	};
	
	//----------------------------------------------------------------------------
	this.getMemoBuffer = function(containerid)
	{
		containerid = containerid.replace(/-/g, "_");
		return self.memobuffers[ containerid.toLowerCase() ];
	};
	
	//----------------------------------------------------------------------------
	this.addPages = function(pagelist)
	{
		var list = pagelist.split(",");
		_.each(list, function(itemid) {
			self.addPage(itemid);
		});
	};
	
	//----------------------------------------------------------------------------
	this.addPage = function(pageid)
	{
		pageid = pageid.replace(/-/g, "_");
		var page = new Lianja.PageBuilder(pageid);
		self.pages.push(pageid);
		self.pagemap[pageid.toLowerCase()] = page;
		return page;
	};

	//----------------------------------------------------------------------------
	this.getPageCount = function()
	{
		return self.pages.length;
	};

	//----------------------------------------------------------------------------
	this.getPage = function(pageid)
	{
		if (typeof pageid === 'number') pageid = self.pages[pageid];
		pageid = pageid.replace(/-/g, "_");
		if (pageid[0] == '#') pageid = pageid.substring(1);
		return self.pagemap[pageid.toLowerCase()];
	};

	//----------------------------------------------------------------------------
	this.addCursor = function(database, table)
	{
		var csr = self.getCursor(database, table);
		if (csr !== null) return csr;
		var cursor = new Lianja.Cursor(database, table);
		self.cursors.push(cursor);
		return cursor;
	};

	//----------------------------------------------------------------------------
	this.getCursor = function(database, table)
	{
		if (typeof database === 'undefined') return null;
		database = database.toLowerCase();
		table = table.toLowerCase();
		for (var i=0; i<self.cursors.length; ++i)
		{
			var cursor = self.cursors[i]; 
			if (database.length > 0 && cursor.database === database && cursor.table === table) 
			{
				return cursor;
			}
			if (cursor.table === table) 
			{
				return cursor;
			}
		};
		
		return null;
	};

	//----------------------------------------------------------------------------
	this.setUser = function(userobj)
	{
		self.user = userobj;
	};

	//----------------------------------------------------------------------------
	this.setProperty = function(key, value)
	{
		self.properties[key.toLowerCase()] = value;
	};
	
	//----------------------------------------------------------------------------
	this.getProperty = function(key)
	{
		return self.properties[key.toLowerCase()];
	};

	//----------------------------------------------------------------------------
	this.setVariable = function(name, value)
	{
		if (name.substring(0,2) == "m.") name = substring(2);
		self.variables[name.toLowerCase()] = value;
	};
	
	//----------------------------------------------------------------------------
	this.getVariable = function(name)
	{
		if (name.substring(0,2) == "m.") name = substring(2);
		return self.variables[name.toLowerCase()];
	};
};

//================================================================================
window.Lianja.PageBuilder = function(pageid)
{
	var self = this;
	
	this.id = pageid;
	this.sections = [];
	this.sectionmap = {};
	this.tabsections = [];
	this.tabsectionmap = {};
	this.properties = {};
	this.type = $("#"+pageid).data('lianjaPageType'); 
	this.searchkeysectionid = $("#"+pageid).data('lianjaSearchkeySection'); 
	this.autolayoutlist = $("#"+pageid).data("lianjaPageAutolayoutlist");
	if (this.autolayoutlist == null) autolayoutlist = [];
	this.searchtext = "";
	this.beforeediting = false;
	this.beforeedit = false;
	this.editing = false;
	this.adding = false;
	this.dirty = false;
	this.dirtysections = [];
	this.refreshed = false;
	this.txcount = 0;
	this.initedsidebars = false;
	this.initrightsidebar = false;
	this.instantselection = "";
	this.instantselectioncolor = "";
	this.lastsection = null;
	this.searchfailed = false;
	this.stretchlastsectionminheight = $("#"+pageid).data('lianjaStretchlastsectionminheight');
	this.stretchfixedheight = $("#"+pageid).data('lianjaStretchfixedheight');
	this.blank = false;
	this.action = false;
	this.firstedit = true;
	this.margin = $("#"+pageid).data('lianjaMargin');
	if (typeof this.margin === 'undefined') this.margin = 0;
	this.loaded = false;
	this.refreshwhenactivated = $("#"+pageid).data("lianjaRefreshWhenActivated");
	if (typeof this.refreshwhenactivated === 'undefined') this.refreshwhenactivated = true;
	this.queryform = $("#"+pageid).data('lianjaQueryForm');
	this.hideheader = $("#"+pageid).data('lianjaHideheader');
	if (typeof this.queryform === 'undefined') this.queryform = false;
	if (this.queryform) this.blank = true;
	if (this.searchkeysectionid === 'undefined') this.searchkeysectionid = "";
	if (this.stretchlastsectionminheight === 'undefined') this.stretchlastsectionminheight = 0;
	if (this.stretchfixedheight === 'undefined') this.stretchfixedheight = 0;
	this.permcreate = true;
	this.permread = true;
	this.permupdate = true;
	this.permdelete = true;
	this.firstload = true;

	//----------------------------------------------------------------------------
	this.adjustAbsoluteSections = function(pos, value)
	{
		var count = self.getSectionCount();
		var section;
		var el;
		for (var i=0; i<count; ++i)
		{
			section = self.getSection(i);
			el = $("#"+section.sectionid);
			if ($(el).css("position") === "absolute")
			{
				$(el).css(pos, value);
			}
		}
	};
	
	//----------------------------------------------------------------------------
	this.applyPermissions = function()
	{
		var count = self.getSectionCount();
		var section;
		
		self.permcreate = Lianja.App.checkPermission("__app__", "C") &&
						  Lianja.App.checkPermission(self.id, "C"); 
		self.permread =   Lianja.App.checkPermission(self.id, "R") && 
						  Lianja.App.checkPermission("__app__", "R"); 
		self.permupdate = Lianja.App.checkPermission(self.id, "U") && 
						  Lianja.App.checkPermission("__app__", "U"); 
		self.permdelete = Lianja.App.checkPermission(self.id, "D") && 
						  Lianja.App.checkPermission("__app__", "D"); 
		
		for (var i=0; i<count; ++i)
		{
			section = self.getSection(i);
			section.applyPermissions();
			self.permcreate &= section.permcreate;
			self.permupdate &= section.permupdate;
			self.permdelete &= section.permdelete;
		}
		
		if (!self.permread)
		{
			self.hide();
			var listitems = $(".ui-lianja-permread-"+self.id.toLowerCase());
			_.each(listitems, function(el)
			{
				$(el).remove();
			});
		}
	};
	
	//----------------------------------------------------------------------------
	this.hide = function()
	{
		$("#"+self.id).css("display", "none");
	};
	
	//----------------------------------------------------------------------------
	this.show = function()
	{
		$("#"+self.id).css("display", "block");
	};
	
	//----------------------------------------------------------------------------
	this.checkCreatePermission = function()
	{
		return self.permcreate;
	};
	
	//----------------------------------------------------------------------------
	this.checkReadPermission = function()
	{
		return self.permread;
	};
	
	//----------------------------------------------------------------------------
	this.checkUpdatePermission = function()
	{
		return self.permupdate;
	};
	
	//----------------------------------------------------------------------------
	this.checkDeletePermission = function()
	{
		return self.permdelete;
	};
	
	//----------------------------------------------------------------------------
	Object.defineProperty(this, "caption", 
	{
		get: function() 
		{ 
			var elid = "#"+self.id.toLowerCase() + "-pagetitle";
			var el = $(elid);
			var text = $(el).text();
			return text;
		},
		set: function(value) 
		{ 
			var elid = "#"+self.id.toLowerCase() + "-pagetitle";
			var el = $(elid);
			$(el).text(value);
		}
	});	

	//----------------------------------------------------------------------------
	this.getMargin = function()
	{
		return self.margin;
	};
	
	//----------------------------------------------------------------------------
	this.hasCarouselView = function()
	{
		var section;
		
		for (var i=0; i<self.sections.length; ++i)
		{
			section = self.getSection(i);
			if (section.type == "carouselview") return true;
		}
		
		return false;
	};

	//----------------------------------------------------------------------------
	this.clearSections = function()
	{
		var section;
		
		for (var i=0; i<self.sections.length; ++i)
		{
			section = self.getSection(i);
			section.clear();
		}
	};
	
	//----------------------------------------------------------------------------
	this.refreshPageHeader = function()
	{
		//console.log("refreshPageHeader()");
		var elid = "#"+self.id.toLowerCase() + "-pagetitle";
		var el = $(elid);
		if (el == null) return;
		var text = $(el).data("lianjaText");
		if (text == null) return;
		if (text.indexOf("{") < 0) return;
		if (typeof LianjaAppBuilder === 'object')
		{
			text = Lianja.expandMacros("", "", text);
			$(el).text(text);
		} 
		else
		{
			Lianja.cloudserver.refreshText(elid, "", "", text);
		}
	};
	
	//----------------------------------------------------------------------------
	this.getJSON = function()
	{
		var data = {};
		var section;
		var table;
		
		for (var i=0; i<self.sections.length; ++i)
		{
			section = self.getSection(i);
			if (section.type == 'form') 
			{
				var sectiondata = section.getJSON_form();
				table = section.table;
				if (typeof table === 'undefined' || table == null || table.length == 0) table = "data";
				data[ table ] = sectiondata;
			}
			else if (section.type == 'canvas') 
			{
				var sectiondata = section.getJSON_canvas();
				table = section.table;
				if (typeof table === 'undefined' || table == null || table.length == 0) table = "data";
				data[ table ] = sectiondata;
			}
			else if (section.type == 'grid' || section.type == 'attachments') 
			{
				var sectiondata = section.getJSON_grid();
				table = section.table;
				if (typeof table === 'undefined' || table == null || table.length == 0) table = "data";
				data[ table ] = sectiondata;
			}
		}
		return data;
	};
	
	//----------------------------------------------------------------------------
	this.setJSON = function(data)
	{
		var section;
		
		for (var i=0; i<self.sections.length; ++i)
		{
			section = self.getSection(i);
			if (section.type == 'form') 
			{
				section.setJSON_form(data);
			}
			else if (section.type == 'canvas') 
			{
				section.setJSON_canvas(data);
			}
			else if (section.type == 'grid' || section.type == 'attachments') 
			{
				section.getJSON_grid(data);
			}
		}
	};
	
	//----------------------------------------------------------------------------
	this.getFirstSection = function()
	{
		var mainsection;
		
		if (typeof self.searchkeysectionid === 'string' && self.searchkeysectionid.length !== 0)
		{
			mainsection = self.getSection(self.searchkeysectionid);
			return mainsection;
		}
		
		if (self.sections.length > 0)
		{
			for (var i=0; i<self.sections.length; ++i)
			{
				mainsection = self.getSection(i);
				if (mainsection.type == 'form') break;
				if (mainsection.type == 'canvas' && typeof mainsection.table !== 'undefined' && mainsection.table.length > 0) break;
			}
			if (mainsection.type !== 'form' && mainsection.type !== 'canvas') return null;
		}

		return mainsection;
	};
	
	//----------------------------------------------------------------------------
	this.getLastSection = function()
	{
		var section;
		
		for (var i=self.sections.length-1; i>0; --i)
		{
			section = self.getSection(i);
			if (typeof section.parentid != 'undefined') return section;
		}
		
		if (self.sections.length > 0) return this.getSection(self.sections.length-1);
		
		return null;
	};
	
	//----------------------------------------------------------------------------
	this.create = function(onsuccess, onerror)
	{
		var me = this;
		this.section = null;
		this.data = null;
		this.onsuccess = onsuccess;
		this.onerror = onerror;
		
		if (typeof self.searchkeysectionid === 'string' && self.searchkeysectionid.length !== 0)
		{
			this.section = this.getSection(self.searchkeysectionid);
		}
		else if (self.sections.length > 0)
		{
			for (var i=0; i<self.sections.length; ++i)
			{
				this.section = self.getSection(i);
				//section = self.sections[i];
				if (this.section.type == 'form') break;
			}
			if (this.section.type !== 'form') return;
		}
		else
		{
			return;
		}
		
		var args = { "onsuccess": onsuccess, "onerror": onerror };
		this.section.cursor.create(
			function (data, args)
			{
				args.onsuccess(data);
			},
			function (jqXHR, textStatus, errorThrown)
			{
				args.onerror(jqXHR, textStatus, errorThrown);
			},
			args
		);
	};
	
	//----------------------------------------------------------------------------
	this.update = function(onsuccess, onerror)
	{
		var me = this;
		
		if (self.adding)
		{
			this.create(onsuccess, onerror);
			return;
		}
		
		this.ok = true;
		this.err_section = null;
		this.jqXHR = null;
		this.textStatus = null;
		this.errorThrown = null;
		this.data = null;
		this.onsuccess = onsuccess;
		this.onerror = onerror;
		
		for (var i=0; i<self.dirtysections.length&&this.ok; ++i)
		{
			var section = self.dirtysections[i];
			var args = { "onsuccess": onsuccess, "onerror": onerror };
			section.cursor.update(
				function (data, args)
				{
					args.onsuccess(data);
					self.addRecentlyModified();
				},
				function (jqXHR, textStatus, errorThrown)
				{
					me.ok = false;
					args.onerror(jqXHR, textStatus, errorThrown);
				},
				args
			);
		}
	};
	
	//----------------------------------------------------------------------------
	this._delete = function(onsuccess, onerror)
	{
		var me = this;
		this.onsuccess = onsuccess;
		this.onerror = onerror;
		Lianja.confirm("Delete selected record. Are you sure?", function(result) {
			bootbox.hideAll();
			if (!result) return;
			self.performDelete(me.onsuccess, me.onerror);
		});
	};
		

	//----------------------------------------------------------------------------
	this.deleteChildren = function(section, onsuccess, onerror)
	{
		var count = section.getChildCount();
		var i;
		var me = this;
		this.section = section;
		this.childsection = null;
		this.onsuccess = onsuccess;
		this.onerror = onerror;

		//console.log("Cascade delete children "+me.section.id);
		
		if (count == 0 || typeof LianjaAppBuilder === 'object')
		{
			onsuccess();
			return;
		}
		
		for (var i=0; i<count; ++i)
		{
			var ofilter = "";
			//console.log("child("+i+")="+me.section.getChildID(i));
			me.childsection = section.page.getSection(me.section.getChildID(i));
			if (typeof me.childsection.parentid !== 'undefined' && me.childsection.parentid.length > 0)
			{
				var parentsection = Lianja.getSection(me.childsection.parentid);
				if (typeof parentsection === 'object')
				{
					var cursor = Lianja.App.getCursor(me.childsection.database, parentsection.table);
					if (cursor !== null)
					{
						var parentkeytype = me.childsection.parentkeytype;
						var parentkey = cursor.getValue(me.childsection.parentkeyexpr);
						if (typeof parentkey !== 'undefined')
						{
							if (parentkeytype == 'C')
							{
								ofilter = me.childsection.childkeyexpr.toLowerCase() + " eq '" + str_escape(alltrim(parentkey)) + "'";
							}
							else if (parentkeytype == 'N')
							{
								ofilter = me.childsection.childkeyexpr.toLowerCase() + " eq " + parentkey;
							}
							if (parentkeytype == 'D')
							{
								ofilter = me.childsection.childkeyexpr.toLowerCase() + " eq '" + alltrim(parentkey) + "'";
							}
						}
					}
				}
				
				//console.log("ofilter="+ofilter);

				me.childsection.cursor.deleteFilter(
					ofilter,
					function (data)
					{
						//console.log("me.childsection.cascadedeletes="+me.childsection.cascadedeletes);
						if (me.childsection.cascadedeletes)
						{
							new self.deleteChildren(me.childsection, 
								function()
								{
									me.onsuccess(data);
								},
								function(jqXHR, textStatus, errorThrown)
								{
									if (typeof me.onerror !== 'undefined') me.onerror(jqXHR, textStatus, errorThrown);
								}
							);
						}
						else
						{
							me.onsuccess(data);
						}
					},
					function(jqXHR, textStatus, errorThrown)
					{
						if (typeof me.onerror !== 'undefined') me.onerror(jqXHR, textStatus, errorThrown);
					}
				);			
			}
			else
			{
				me.onsuccess();
			}
		}
	};
	
	//----------------------------------------------------------------------------
	this.performDelete = function(onsuccess, onerror)
	{
		var me = this;
		this.section = null;
		this.data = null;
		this.onsuccess = onsuccess;
		this.onerror = onerror;
		
		if (typeof self.searchkeysectionid === 'string' && self.searchkeysectionid.length !== 0)
		{
			this.section = self.getSection(self.searchkeysectionid);
		}
		else if (self.sections.length > 0)
		{
			for (var i=0; i<self.sections.length; ++i)
			{
				this.section = self.getSection(i);
				if (this.section.type == 'form') break;
			}
			if (this.section.type !== 'form') return;
		}
		else
		{
			return;
		}
		
		if (this.section.cursor._recno == this.section.cursor._reccount)
		{
			this.section.cursor.nextaction = -1;
		}
		else
		{
			this.section.cursor.nextaction = 1;
		}
		this.section.cursor._delete(
			function (data)
			{
				if (self.section.cascadedeletes && typeof LianjaAppBuilder !== 'object')
				{
					new self.deleteChildren(self.section, 
						function()
						{
							me.onsuccess(data);
						},
						function(jqXHR, textStatus, errorThrown)
						{
							if (typeof me.onerror !== 'undefined') me.onerror(jqXHR, textStatus, errorThrown);
						}
					);
				}
				else
				{
					me.onsuccess(data);
				}
			},
			function (jqXHR, textStatus, errorThrown)
			{
				if (typeof me.onerror !== 'undefined') me.onerror(jqXHR, textStatus, errorThrown);
			}
		);
	};
	
	//----------------------------------------------------------------------------
	this.addSections = function(sectionlist, sectiontypes)
	{
		//console.log("addSections() list="+sectionlist);
		var list = sectionlist.split(",");
		var types = sectiontypes.split(",");
		var i = 0;
		for (i=0; i<list.length; ++i)
		{
			self.addSection(list[i], types[i]);
		}
	};

	//----------------------------------------------------------------------------
	this.addTabSections = function(sectionlist, sectiontypes)
	{
		var list = sectionlist.split(",");
		var types = sectiontypes.split(",");
		var i = 0;
		for (i=0; i<list.length; ++i)
		{
			self.addSection(list[i], types[i]);
		}
	};

	//----------------------------------------------------------------------------
	this.addTabSection = function(sectionid, type)
	{
		var section = new Lianja.Section(self.id, sectionid, type);
		if (typeof section.table !== 'undefined' && section.table !== null && section.table.length > 0)
		{
			var cursor = new Lianja.App.addCursor(section.database.toLowerCase(), section.table.toLowerCase());
			section.cursor = cursor;
			cursor.primarykey = self.primarykey;
		}
		self.tabsections.push(sectionid);
		self.tabsectionmap[sectionid.toLowerCase()] = section;
		return section;
	};
	
	//----------------------------------------------------------------------------
	this.addSection = function(sectionid, type)
	{
		var section = new Lianja.Section(self.id, sectionid, type);
		if (typeof section.table !== 'undefined' && section.table !== null && section.table.length > 0)
		{
			var cursor = new Lianja.App.addCursor(section.database.toLowerCase(), section.table.toLowerCase());
			section.cursor = cursor;
			cursor.primarykey = self.primarykey;
		}
		self.sections.push(sectionid);
		self.sectionmap[sectionid.toLowerCase()] = section;
		return section;
	};
	
	//----------------------------------------------------------------------------
	this.addDirtySection = function(section)
	{
		if (_.contains(self.dirtysections, section)) return;
		self.dirtysections.push(section);
		self.dirty = true;
	};
	
	//----------------------------------------------------------------------------
	this.getSectionCount = function()
	{
		return self.sections.length;
	};

	//----------------------------------------------------------------------------
	this.getTabSectionCount = function()
	{
		return self.tabsections.length;
	};

	//----------------------------------------------------------------------------
	this.getId = function(sectionid)
	{
		return self.id;
	};

	//----------------------------------------------------------------------------
	this.getSection = function(sectionid)
	{
		if (typeof sectionid === 'number') return this.getSection(self.sections[sectionid]);
		var pos = sectionid.indexOf("-");
		if (pos>0) sectionid = sectionid.substring(pos+1);
		var section = self.sectionmap[sectionid.toLowerCase()];
		if (typeof section === 'undefined') return self.getTabSection(sectionid);
		return section;
	};

	//----------------------------------------------------------------------------
	this.getTabSection = function(sectionid)
	{
		if (typeof sectionid === 'number') return this.getTabSection(self.tabsections[sectionid]);
		var pos = sectionid.indexOf("-");
		if (pos>0) sectionid = sectionid.substring(pos+1);
		return self.tabsectionmap[sectionid.toLowerCase()];
	};

	//----------------------------------------------------------------------------
	this.addRecentlyViewed = function()
	{
		if (typeof self.searchkeysectionid === 'string' && self.searchkeysectionid.length === 0) return;
		var section = this.getSection(self.searchkeysectionid);
		if (section.cursor === null) return;
		var searchfield = $("#"+section.page.searchkeysectionid).data("lianjaSectionSearchfield");
		if (searchfield === null) return;
		if (searchfield.indexOf(".") < 0) searchfield = section.table + "." + searchfield;
		searchfield = searchfield.toLowerCase();
		var key = section.cursor.expandText(searchfield, false);
		if (key === searchfield.toLowerCase()) return;
		Lianja.addRecentlyViewed(self.id, key);
	};

	//----------------------------------------------------------------------------
	this.addRecentlyModified = function()
	{
		if (typeof self.searchkeysectionid === 'string' && self.searchkeysectionid.length === 0) return;
		var section = this.getSection(self.searchkeysectionid);
		if (section.cursor === null) return;
		var searchfield = $("#"+section.page.searchkeysectionid).data("lianjaSectionSearchfield");
		if (searchfield === null) return;
		if (searchfield.indexOf(".") < 0) searchfield = section.table + "." + searchfield;
		searchfield = searchfield.toLowerCase();
		var key = section.cursor.expandText(searchfield, false);
		if (key === searchfield.toLowerCase()) return;
		Lianja.addRecentlyModified(self.id, key);
	};

	//----------------------------------------------------------------------------
	this.setInstantSelection = function(text, color)
	{
		this.instantselection = text;
		this.instantselectioncolor = color;
	};
	
	//----------------------------------------------------------------------------
	this.setProperty = function(key, value)
	{
		self.properties[key.toLowerCase()] = value;
	};
	
	//----------------------------------------------------------------------------
	this.getProperty = function(key)
	{
		return self.properties[key.toLowerCase()];
	};
};

//================================================================================
window.Lianja.Section = function(pageid, id, type)
{
	var self = this;
	
	this.page = Lianja.App.getPage(pageid);
	this.section = this.page.getSection(id);
	this.pageid = pageid;
	this.id = id;
	this.sectionid = pageid+"-"+id;
	this.type = type;
	this.children = [];
	this.formitems = [];
	this.searchkeyexpr = "";
	this.properties = {};
	this.formitemmap = {};
	this.$element = $("#"+pageid+"-"+id);
	this.accordion = $("#"+pageid+"-"+id).data('lianjaSectionAccordion') === "true";
	this.accordionstack = $("#"+pageid+"-"+id).data('lianjaSectionAccordionStack') === "true";
	this.database = $("#"+pageid+"-"+id).data('lianjaDatabase');
	if (typeof this.database === "undefined" || this.database == "") this.database = Lianja.App.database;
	this.table = $("#"+pageid+"-"+id).data('lianjaTable');
	this.parentid = $("#"+pageid+"-"+id).data('lianjaSectionParentid');
	this.parentkeytype = $("#"+pageid+"-"+id).data('lianjaSectionParentkeytype');
	this.parentkeyexpr = $("#"+pageid+"-"+id).data('lianjaSectionParentkeyexpr');
	this.childkeyexpr = $("#"+pageid+"-"+id).data('lianjaSectionChildkeyexpr');
	this.header = $("#"+pageid+"-"+id+"-sectionheader").text();
	this.footer = $("#"+pageid+"-"+id+"-sectionfooter").text();
	this.childlist = $("#"+pageid+"-"+id).data('lianjaSectionChildlist');
	this.hidenavbar = $("#"+pageid+"-"+id).data('lianjaHidenavbar') || $("#"+pageid).data('lianjaHidenavbar');
	this.hideheader = $("#"+pageid+"-"+id).data('lianjaHideheader');
	this.tabviewsectionlist = $("#"+pageid+"-"+id).data('lianjaTabviewSectionlist');
	this._grid = null;
	this._where = "";
	this.searchfilter = "";
	this.cursor = null;
	this.currenteditor = "";
	this.listeners = [];
	this.txcount = -1;
	this.searchsection = $("#"+pageid).data('lianjaSearchkeySection') == this.sectionid; 
	this.editable = $("#"+pageid+"-"+id).data('lianjaEditable');
	if (typeof this.editable === 'undefined') this.editable = false;
	this._filter = $("#"+pageid+"-"+id).data('lianjaFilter');
	if (typeof this._filter === 'undefined') this._filter = "";
	this.autoheight = $("#"+pageid+"-"+id).data('lianjaAutoheight');
	if (typeof this.autoheight === 'undefined') this.autoheight = false;
	this.canvasobjects = [];
	this.cascadedeletes = $("#"+pageid+"-"+id).data('lianjaCascadedeletes');
	if (typeof this.cascadedeletes === 'undefined' || typeof LianjaAppBuilder === 'object') this.cascadedeletes = false;
	this.primarykey = $("#"+pageid+"-"+id).data('lianjaPrimarykey');
	if (typeof this.primarykey === 'undefined') this.primarykey = "";
	this.refreshing = false;
	this.database = Lianja.getUserRuntimeDatabase(this.database);
	this.queryform = $("#"+pageid+"-"+id).data('lianjaQueryForm');
	if (typeof this.queryform === 'undefined') this.queryform = false;
	this.blank = false;	
	if (this.queryform) this.blank = true;
	this.firstrefresh = true;
	this.collapsed = false;
	this.permcreate = true;
	this.permread = true;
	this.permupdate = true;
	this.permdelete = true;
	this.nostretch = $("#"+pageid+"-"+id).data('lianjaSectionNoStretch');
	if (typeof this.nostretch === 'undefined') this.nostretch = false;

	//----------------------------------------------------------------------------
	this.applyPermissions = function()
	{
		var count = self.getFormItemCount();
		var formitem;
		
		self.permcreate = Lianja.App.checkPermission("__app__", "C") &&
		                  Lianja.App.checkPermission(self.sectionid, "C") && 
						  Lianja.App.checkPermission(self.pageid, "C"); 
		self.permread =   Lianja.App.checkPermission("__app__", "R") &&
		                  Lianja.App.checkPermission(self.sectionid, "R") && 
						  Lianja.App.checkPermission(self.pageid, "R"); 
		self.permupdate = Lianja.App.checkPermission("__app__", "U") &&
					      Lianja.App.checkPermission(self.sectionid, "U") && 
						  Lianja.App.checkPermission(self.pageid, "U"); 
		self.permdelete = Lianja.App.checkPermission("__app__", "D") &&
						  Lianja.App.checkPermission(self.sectionid, "D") && 
						  Lianja.App.checkPermission(self.pageid, "D"); 
		
		for (var i=0; i<count; ++i)
		{
			formitem = self.getFormItem(i);
			formitem.applyPermissions();
		}
		
		if (!self.permread)
		{
			self.hide();
		}
	};
	
	//----------------------------------------------------------------------------
	this.checkCreatePermission = function()
	{
		return self.permcreate;
	};
	
	//----------------------------------------------------------------------------
	this.checkReadPermission = function()
	{
		return self.permread;
	};
	
	//----------------------------------------------------------------------------
	this.checkUpdatePermission = function()
	{
		return self.permupdate;
	};
	
	//----------------------------------------------------------------------------
	this.checkDeletePermission = function()
	{
		return self.permdelete;
	};
	
	//----------------------------------------------------------------------------
	// bind the expand/collapse delegates. 
	$('#'+pageid).bind('pageinit', function(event) {
		$("#"+self.sectionid).on('expand', function (event, ui) {
			Lianja.App.dispatchDelegate(self.sectionid, "expanded"); 
		}).on('collapse', function (event, ui) {
			// The "collapse" event is fired instead of 'expand' event in JQM 3.2 so I have worked around it.
			if (self.collapsed) 
			{
				Lianja.App.dispatchDelegate(self.sectionid, "expanded"); 
			}
			else
			{				
				Lianja.App.dispatchDelegate(self.sectionid, "collapsed"); 
			}
			self.collapsed = !self.collapsed;
		});
	});
	
	//----------------------------------------------------------------------------
	Object.defineProperty(this, "grid", 
	{
		get: function() { return self._grid; },
		set: function(value) { self._grid = value; }
	});	
	
	//----------------------------------------------------------------------------
	Object.defineProperty(this, "caption", 
	{
		get: function() { return $("#"+self.sectionid+"-sectionheader").text(); },
		set: function(value) { 
			$("#"+self.sectionid+"-sectionheader").text(value);
		}
	});	
	
	//----------------------------------------------------------------------------
	Object.defineProperty(this, "filter", 
	{
		get: function() { return Lianja.expandMacrosSync(self.pageid, self.sectionid, self._filter); },
		set: function(value) { 
			self._filter = value; 
			if (this.cursor != null) this.cursor.filter = value;
			self.resetQueryForm();
		}
	});	

	//----------------------------------------------------------------------------
	Object.defineProperty(this, "where", 
	{
		get: function() { return Lianja.expandMacrosSync(self.pageid, self.sectionid, self._filter); },
		set: function(value) { 
			self._filter = value; 
			if (this.cursor != null) this.cursor.filter = value;
			self.resetQueryForm();
		}
	});	

	//----------------------------------------------------------------------------
	Object.defineProperty(this, "visible", 
	{
		get: function() { return $("#"+self.sectionid).css("display") === "block" },
		set: function(value) { 
			$("#"+self.sectionid).css("display", value ? "block" : "none");
		}
	});	
	
	//----------------------------------------------------------------------------
	Object.defineProperty(this, "width", 
	{
		get: function() 
		{ 
			var w = $("#"+self.sectionid).width(); 
			return w; 
		}
	});	
	
	//----------------------------------------------------------------------------
	Object.defineProperty(this, "height", 
	{
		get: function() 
		{ 
			var h = $("#"+self.sectionid).height(); 
			return h; 
		}
	});	
	
	
	//----------------------------------------------------------------------------
	this.hide = function()
	{
		$("#"+self.sectionid).css("display", "none");		
	};
	
	//----------------------------------------------------------------------------
	this.show = function()
	{
		$("#"+self.sectionid).css("display", "block");		
	};
	
	//----------------------------------------------------------------------------
	this.expand = function()
	{
		$("#"+self.sectionid).trigger("expand");
	};
	
	//----------------------------------------------------------------------------
	this.collapse = function()
	{
		$("#"+self.sectionid).trigger("collapse");
	};
		
	//----------------------------------------------------------------------------
	this.resetQueryForm = function()
	{
		if (!self.queryform) 
		{
			self.page.txcount = 0;
			if (self.cursor != null) self.cursor._recno = 0;
			return;
		}
		var value = self._filter + self.searchfilter;
		self.blank = value.length==0; 
		self.page.blank = self.blank; 
		self.page.searchfailed = false; 
		self.page.txcount = 0;
		if (self.cursor != null) self.cursor._recno = 0;
		if (self.blank) self.clear();
	};
	
	//----------------------------------------------------------------------------
	this.setSearchFilter = function(filter)
	{
		self.searchfilter = filter;
		if (self.cursor != null) self.cursor.setSearchFilter(filter);
		self.resetQueryForm();
	};
	
	//----------------------------------------------------------------------------
	this.print = function()
	{
		if (self.type !== 'webview' && self.type !== 'report')
		{
			console.log("You can only print() a webview section");
			return;
		}
		var sid = self.sectionid.replace(/_/g, "-");
		var theIframe = document.getElementById(sid+"-content");
		theIframe.contentWindow.print();		
	};
		
	//----------------------------------------------------------------------------
	this.clear = function()
	{
		if (self.type == 'canvas')
		{
			_.each(self.canvasobjects, function(obj) {
				if (obj._input != null) obj.value = "";
			});
		}
		if (self.cursor !== 'undefined' && self.cursor !== null)
		{
			self.cursor.resetData(self);
		}
	};
	
	//----------------------------------------------------------------------------
	this.setupDefaults = function(onsuccess, onerrors)
	{
		if (self.type == "form") self.setupDefaults_form(onsuccess, onerrors);
		else if (self.type == "canvas") self.setupDefaults_canvas(onsuccess, onerrors);
		else if (self.type == "grid") self.setupDefaults_grid(onsuccess, onerrors);
		else if (self.type == "attachments") self.setupDefaults_grid(onsuccess, onerrors);
	};
	
	//----------------------------------------------------------------------------
	this.setupDefaults_form = function(onsuccess, onerrors)
	{
		if (typeof onsuccess !== 'undefined') onsuccess();
		var cnt = self.getFormItemCount();
		var formitem;
		var controlsource;
		var value = "";
		var defaultexpr;
		for (var i=0; i<cnt; ++i)
		{
			formitem = self.getFormItem(i);
			controlsource = formitem.controlsource;
			if (typeof controlsource !== 'undefined' && controlsource !== null && controlsource.length > 0)
			{
				pos = controlsource.indexOf("*");
				if (pos >= 0) continue;
				pos = controlsource.indexOf("/");
				if (pos >= 0) continue;
				pos = controlsource.indexOf("(");
				if (pos >= 0) continue;
				pos = controlsource.indexOf("+");
				if (pos >= 0) continue;
				pos = controlsource.indexOf("-");
				if (pos >= 0) continue;
				formitem.setupDefaultValue();
			}
		}
	};
	
	//----------------------------------------------------------------------------
	this.setupDefaults_canvas = function(onsuccess, onerrors)
	{
		if (typeof onsuccess !== 'undefined') onsuccess();
		// TODO:
	};

	//----------------------------------------------------------------------------
	this.setupDefaults_grid = function(onsuccess, onerrors)
	{
		if (typeof onsuccess !== 'undefined') onsuccess();
		// TODO:
	};	
	
	//----------------------------------------------------------------------------
	this.getJSON = function()
	{
		if (self.type == "form") return self.getJSON_form();
		if (self.type == "canvas") return self.getJSON_canvas();
		if (self.type == "grid") return self.getJSON_grid();
		if (self.type == "attachments") return self.getJSON_grid();
		return {};
	};

	//----------------------------------------------------------------------------
	this.getJSON_grid = function()
	{
		var data = [];
		var griddata = self.grid.getData();	
		_.each(griddata.rows, function(rowdata)
		{
			data.push(rowdata);
		});
		return data;
	};
	
	//----------------------------------------------------------------------------
	this.getJSON_form = function()
	{
		var data = {};
		var cnt = self.getFormItemCount();
		var formitem;
		var controlsource;
		var value = "";
		var pos;
		
		for (var i=0; i<cnt; ++i)
		{
			formitem = self.getFormItem(i);
			controlsource = formitem.controlsource;
			if (typeof controlsource !== 'undefined' && controlsource !== null && controlsource.length > 0)
			{
				pos = controlsource.indexOf("*");
				if (pos >= 0) continue;
				pos = controlsource.indexOf("/");
				if (pos >= 0) continue;
				pos = controlsource.indexOf("(");
				if (pos >= 0) continue;
				pos = controlsource.indexOf("+");
				if (pos >= 0) continue;
				pos = controlsource.indexOf("-");
				if (pos >= 0) continue;
				pos = controlsource.indexOf(".");
				if (pos > 0) controlsource = controlsource.substring(pos+1);
				data[ controlsource ] = formitem.getValue();
			}
		}
		
		return data;
	};
	
	//----------------------------------------------------------------------------
	this.setJSON_form = function(data)
	{
		// TODO:
	};
	
	//----------------------------------------------------------------------------
	this.setJSON_grid = function(data)
	{
		// TODO:
	};
	
	//----------------------------------------------------------------------------
	this.getJSON_canvas = function()
	{
		var data = {};
		var controlsource;
		var value = "";
		var pos;
		var ignore;
		var type;
		
		_.each(self.canvasobjects, function(obj) {
			controlsource = obj.controlsource;
			type = obj.type;
			if (type == "label" || 
			    type == "commandbutton" || 
				type == "image" || 
				type == "container" || 
				type == "control" || 
				type == "line" || 
				type == "form") return;
			//console.log("obj.name="+obj.name+", obj.controlsource="+obj.controlsource+", obj.type="+obj.type);
			if (typeof controlsource !== 'undefined' && controlsource !== null && controlsource.length > 0)
			{
				pos = controlsource.indexOf("(");
				if (pos < 0) pos = controlsource.indexOf("+");
				if (pos < 0) pos = controlsource.indexOf("-");
				if (pos < 0) pos = controlsource.indexOf("*");
				if (pos < 0) pos = controlsource.indexOf("/");
				ignore = (pos >= 0);
				if (!ignore)
				{
					pos = controlsource.indexOf(".");
					if (pos > 0) controlsource = controlsource.substring(pos+1);
					data[ controlsource ] = obj.value;
				}
			}
			else
			{
				data[ obj.name ] = obj.value;
			}
		});
		
		return data;
	};
	
	//----------------------------------------------------------------------------
	this.setJSON = function(data)
	{
		var section = self;
		
		if (section.type == 'form') 
		{
			section.setJSON_form(data);
		}
		else if (section.type == 'canvas') 
		{
			section.setJSON_canvas(data);
		}
		else if (section.type == 'grid' || section.type == 'attachments') 
		{
			section.getJSON_grid(data);
		}
	};
	
	//----------------------------------------------------------------------------
	this.setJSON_canvas = function(data)
	{
		var controlsource;
		var value = "";
		var pos;
		var ignore;
		var type;
		
		//console.log( data );
		
		if (typeof data === 'string') data = JSON.parse(data);
		
		_.each(self.canvasobjects, function(obj) {
			controlsource = obj.controlsource;
			if (typeof controlsource === 'undefined' && controlsource === null || controlsource.length === 0) controlsource = obj.name;
			type = obj.type;
			if (type == "label" || 
			    type == "commandbutton" || 
				type == "image" || 
				type == "container" || 
				type == "control" || 
				type == "line" || 
				type == "form") return;
			//console.log("obj.name="+obj.name+", obj.controlsource="+obj.controlsource+", obj.type="+obj.type);
			if (typeof controlsource !== 'undefined' && controlsource !== null && controlsource.length > 0)
			{
				pos = controlsource.indexOf("(");
				if (pos < 0) pos = controlsource.indexOf("+");
				if (pos < 0) pos = controlsource.indexOf("-");
				if (pos < 0) pos = controlsource.indexOf("*");
				if (pos < 0) pos = controlsource.indexOf("/");
				ignore = (pos >= 0);
				if (!ignore)
				{
					pos = controlsource.indexOf(".");
					if (pos > 0) controlsource = controlsource.substring(pos+1);
					if (typeof data[ controlsource.toLowerCase() ] !== 'undefined') obj.value = data[ controlsource.toLowerCase() ];
				}
			}
			else
			{
				//data[ obj.name ] = obj.value;
				if (typeof data[ controlsource.toLowerCase() ] !== 'undefined') 
				{
					var cmd = "window." + controlsource.toLowerCase() + ".value = \"" + data[ controlsource.toLowerCase() ] + "\"";
					try
					{
						eval( cmd );
					} 
					catch (e)
					{
						console.log(e);
					}
				}
			}
		});
		
		return data;
	};
	
	//----------------------------------------------------------------------------
	this.addCanvasObject = function(object)
	{
		self.canvasobjects.push(object);
	};

	//----------------------------------------------------------------------------
	this.addListener = function(commandpkt)
	{
		self.listeners.push(commandpkt);
	};

	//----------------------------------------------------------------------------
	this.notifyListeners = function(type)
	{
		_.each(self.listeners, function(commandpkt) {
			if (commandpkt.type === type) commandpkt.func.apply(commandpkt.args);
		});
	};

	//----------------------------------------------------------------------------
	this.updateCursor = function(data, rowid, changed)
	{
		self.cursor.updateDataBuffer(data, rowid, changed);
	};

	//----------------------------------------------------------------------------
	this.addSearchPanel = function(obj)
	{
		var div = $("#"+this.sectionid+"-searchpanel");
		if (typeof div == 'undefined') 
		{
			return;
		}
		$(div).html("");
		$(obj._element).css("position", "relative");
		$(div).append(obj._element);
	};
	this.addsearchpanel = this.addSearchPanel;
	
	//----------------------------------------------------------------------------
	this.showSearchPanel = function(sectionid)
	{
		var div = document.getElementById( sectionid+"-searchpanel");
		if (typeof div == 'undefined') return;
		div.style.display = "block";
	};
	this.showsearchpanel = this.showSearchPanel;
	
	//----------------------------------------------------------------------------
	this.hideSearchPanel = function(sectionid)
	{
		var div = document.getElementById( sectionid+"-searchpanel");
		if (typeof div == 'undefined') return;
		div.style.display = "none";
	};
	this.hidesearchpanel = this.hideSearchPanel;
	
	//----------------------------------------------------------------------------
	this.toggleSearchPanel = function(sectionid)
	{
		var div = document.getElementById( sectionid+"-searchpanel");
		if (typeof div == 'undefined') return;
		var display = div.style.display;
		if (display === "block") div.style.display = "none";
		else div.style.display = "block";
	};
	this.togglesearchpanel = this.toggleSearchPanel;

	//----------------------------------------------------------------------------
	this.updateMemo = function(controlsource, text)
	{
		if (this.page.adding)
		{
			this.cursor.setMemoValue(controlsource, text);
		}
		else
		{
			Lianja.updateMemo(this.database, this.table, controlsource, text, 
				function()	// success
				{
					Lianja.showSuccessMessage("Record was updated");
				}
				,
				function()	// error
				{
					Lianja.showErrorMessage("Record could not be updated", "Update failed");
				}
			);
		}
	};
	
	//----------------------------------------------------------------------------
	this.setCurrentEditor = function(state, id)
	{
		if (self.currenteditor.length > 0)
		{
			var text = $("#"+self.currenteditor + "-editor").val();
			if (typeof text !== 'undefined')
			{
				text = str_replace("<a>", "", text);
				text = str_replace("</a>", "", text);
				$("#"+self.currenteditor).data("editing", "false");
				$("#"+self.currenteditor+"-inlineediticon").data("editing", "false");
				$("#"+self.currenteditor).html(text);
				Lianja.hideControl(self.currenteditor + "-editor");
			}
		}
		if (state) self.currenteditor = id;
		else self.currenteditor = "";
	};
	
	//----------------------------------------------------------------------------
	this.addFormItems = function(formitemlist, formitemtypes)
	{
		var list = formitemlist.split(",");
		var types = formitemtypes.split(",");
		var i = 0;
		_.each(list, function(itemid) {
			itemid = self.sectionid + "-" + itemid;
			var item = new Lianja.FormItem(self.pageid, self.sectionid, itemid, types[i++]);
			self.formitems.push(item);
			self.formitemmap[itemid.toLowerCase()] = item;
			item.cursor = self.cursor;
		});
	};

	//----------------------------------------------------------------------------
	this.setChildSections = function(sectionlist)
	{
		var list = sectionlist.split(",");
		_.each(list, function(id) {
			self.children.push(id.toLowerCase());
			//self.children.push(id.toLowerCase());
		});
	};
	
	//----------------------------------------------------------------------------
	this.getChildCount = function()
	{
		return self.children.length;
	};

	//----------------------------------------------------------------------------
	this.getChildID = function(index)
	{
		return self.children[index];
	};

	//----------------------------------------------------------------------------
	this.getFormItemCount = function()
	{
		return self.formitems.length;
	};

	//----------------------------------------------------------------------------
	this.getFormItem = function(formitemid)
	{
		if (typeof formitemid === 'number')
		{
			return self.formitems[formitemid];
		}
		return self.formitemmap[formitemid.toLowerCase()];
	};

	//----------------------------------------------------------------------------
	this.setSearchKey = function(keyexpr)
	{
		self.searchkeyexpr = keyexpr;
	};

	//----------------------------------------------------------------------------
	this.setProperty = function(key, value)
	{
		self.properties[key.toLowerCase()] = value;
	};
	
	//----------------------------------------------------------------------------
	this.getProperty = function(key)
	{
		return self.properties[key.toLowerCase()];
	};

	//----------------------------------------------------------------------------
	this.refreshHeader = function()
	{
		var el = $("#"+pageid+"-"+id+" h2 a span span");
		var text = $(el).first().html();
		if (typeof text === 'undefined') 
		{
			el = undefined;
			text = $("#"+pageid+"-"+id+"-sectionheader").text();
		}
		
		var pos;
		if (text !== null && typeof text !== 'undefined')
		{
			pos = text.indexOf("<span");
			if (pos > 0) text = trim(text.substring(0,pos));
		}
		
		if (typeof self.header === 'undefined' || self.header.length == 0) self.header = text;
		
		if (self.header.indexOf("{") < 0) 
		{
			if (self.page.instantselection.length == 0) 
			{
		        var $btn_text  = $("#"+pageid+"-"+id).find('.ui-btn-text');
				var text = self.header;
				if (typeof $btn_text === 'undefined') return;
				var html = $($btn_text).first().html();
				if (typeof html === 'undefined') return;
				if (html.indexOf("<span") > 0)
				{
					$($btn_text).first().html(text);
				}
				return;
			}
		}
		
		if (typeof el === 'undefined' || el === null)
		{
			Lianja.cloudserver.refreshText("#"+pageid+"-"+id+"-sectionheader", self.pageid, self.id, self.header);
		}
		else
		{
			var $btn_text  = $("#"+pageid+"-"+id).find('.ui-btn-text').first();
			var newtext = self.header;
			if (self.page.instantselection.length > 0 && self.searchsection) newtext = newtext + " <span class='ui-lianja-instantselection' style='font-weight:normal;font-size:14px;padding-left:20px;padding-right:20px;background-color:{1};color:white;padding-top:3px;padding-bottom:5px;margin-left:15px;text-align:center;vertical-align:top;'>" + self.page.instantselection + " ({reccount()})</span>";
			newtext = str_replace("{1}", self.page.instantselectioncolor, newtext);
			Lianja.cloudserver.refreshHtml($btn_text, self.pageid, self.id, newtext);
		}
	};

	//----------------------------------------------------------------------------
	this.refreshFooter = function()
	{
		if (self.footer.indexOf("{") < 0) return;
		if (typeof LianjaAppBuilder === 'object')
		{
			$("#"+self.pageid+"-"+self.id+"-sectionfooter").text(Lianja.expandMacros(self.pageid, self.id, self.footer))
		} 
		else
		{
			Lianja.cloudserver.refreshText("#"+self.pageid+"-"+self.id+"-sectionfooter", self.pageid, self.id, self.footer);
		}
	};

	//----------------------------------------------------------------------------
	this.requery = function(text)
	{
		if (typeof text !== 'undefined')
		{			
			self.filter = Lianja.Odata_Translate(text);
		}
		if (typeof LianjaAppBuilder === "object")
		{
			var text = self.filter;
			if (text.length > 0 && self.where.length > 0) text = text + " and " + Lianja.Odata_Translate(self.where);
			LianjaAppBuilder.showDocument("page:"+self.pageid+"."+self.id+"?action=requery&text="+text);
		}
		self.refresh();
	};
	
	//----------------------------------------------------------------------------
	this.refresh = function(onsuccess, onerror)
	{
		if (self.type === "form")
		{
			if (self.queryform && (self.blank || Lianja.searchFailed(self.sectionid)))
			{
				Lianja.refreshFormSection(self.sectionid, true);
				Lianja.blankSectionChildren(self.sectionid, true);
				Lianja.refreshSectionChildren(self.sectionid);
				Lianja.refreshSectionHeader(self.sectionid);
				Lianja.refreshSectionFooter(self.sectionid);
				if (typeof onsuccess === 'function') onsuccess();
				if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
				self.refreshing = false;
				return;
			}
			if (typeof LianjaAppBuilder === 'undefined')
			{
				if (self.cursor == null) 
				{
					if (typeof onsuccess === 'function') onsuccess();
					if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
					self.refreshing = false;
					return;
				}
				Lianja.cloudserver.getActiveRecord(self, "current", 
					function() {	// success
						if (!(self.page.editing && self.page.beforeediting)) Lianja.refreshFormSection(self.sectionid);
						Lianja.blankSectionChildren(self.sectionid, false);
						Lianja.refreshSectionChildren(self.sectionid);
						Lianja.refreshSectionHeader(self.sectionid);
						Lianja.refreshSectionFooter(self.sectionid);
						Lianja.App.dispatchDelegate(self.id, "refresh"); 
						Lianja.App.dispatchDelegate(self.id, "datachanged"); 
						if (typeof onsuccess == 'function') onsuccess();
						if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
						self.refreshing = false;
					},
					function() {	// error
						Lianja.blankSectionChildren(self.sectionid, true);
						if (typeof onerror == 'function') onerror();
						if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
						self.refreshing = false;
					});
				return;
			}
			else
			{
				if (!(self.page.editing && self.page.beforeediting)) Lianja.refreshFormSection(self.sectionid);
				Lianja.App.dispatchDelegate(self.id, "refresh"); 
				Lianja.App.dispatchDelegate(self.id, "datachanged"); 
				if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
				self.refreshing = false;
			}
		}
		else if (self.type === "canvas")
		{
			if (self.queryform && (self.blank || Lianja.searchFailed(self.sectionid)))
			{
				Lianja.refreshCanvasSection(self.sectionid);
				Lianja.blankSectionChildren(self.sectionid, true);
				Lianja.refreshSectionChildren(self.sectionid);
				Lianja.refreshSectionHeader(self.sectionid);
				Lianja.refreshSectionFooter(self.sectionid);
				if (typeof onsuccess == 'function') onsuccess();
				if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
				self.refreshing = false;
				return;
			}
			if (typeof LianjaAppBuilder === 'undefined')
			{
				if (self.cursor == null) 
				{
					if (typeof onsuccess == 'function') onsuccess();
					if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
					self.refreshing = false;
					return;
				}
				Lianja.cloudserver.getActiveRecord(self, "current", 
					function() {	// success
						Lianja.refreshCanvasSection(self.sectionid);
						Lianja.blankSectionChildren(self.sectionid, false);
						Lianja.refreshSectionChildren(self.sectionid);
						Lianja.refreshSectionHeader(self.sectionid);
						Lianja.refreshSectionFooter(self.sectionid);
						Lianja.App.dispatchDelegate(self.id, "refresh"); 
						Lianja.App.dispatchDelegate(self.id, "datachanged"); 
						if (typeof onsuccess == 'function') onsuccess();
						if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
						self.refreshing = false;
					},
					function() {	// error
						Lianja.blankSectionChildren(self.sectionid, true);
						if (typeof onerror == 'function') onerror();
						if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
						self.refreshing = false;
					});
				return;
			}
			else
			{
				Lianja.refreshCanvasSection(self.sectionid);
				Lianja.App.dispatchDelegate(self.id, "refresh"); 
				Lianja.App.dispatchDelegate(self.id, "datachanged"); 
				if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
				self.refreshing = false;
			}
		}
		else if (self.type === "grid")
		{
			if (self.queryform && (self.blank || Lianja.searchFailed(self.sectionid)))
			{
				Lianja.clearGridSection(self.sectionid, false);
				Lianja.blankSectionChildren(self.sectionid, true);
				Lianja.refreshSectionChildren(self.sectionid);
				Lianja.refreshSectionHeader(self.sectionid);
				Lianja.refreshSectionFooter(self.sectionid);
				if (typeof onsuccess == 'function') onsuccess();
				if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
				self.refreshing = false;
				return;
			}
			Lianja.refreshGridSection(self.sectionid, false, self.parentid, self.parentkeytype, self.parentkeyexpr, self.childkeyexpr, false, 
				function(args) 										// onsuccess
				{
					Lianja.blankSectionChildren(self.sectionid, false);
					Lianja.refreshSectionChildren(self.sectionid);
					Lianja.refreshSectionHeader(self.sectionid);
					Lianja.refreshSectionFooter(self.sectionid);
					Lianja.App.dispatchDelegate(self.id, "refresh"); 
					Lianja.App.dispatchDelegate(self.id, "datachanged"); 
					if (typeof args.onsuccess === 'function') args.onsuccess();
					if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
					self.refreshing = false;
				},
				function(args) 										// onerror
				{
					Lianja.refreshSectionChildren(self.sectionid);
					Lianja.refreshSectionHeader(self.sectionid);
					Lianja.refreshSectionFooter(self.sectionid);
					Lianja.blankSectionChildren(self.sectionid, true);
					if (typeof args.onerror === 'function') args.onerror();
					if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
					self.refreshing = false;
				},
				{ "onsuccess": onsuccess, "onerror":onerror}	// args
			);
		}
		else if (self.type === "attachments")
		{
			if (self.queryform && (self.blank || Lianja.searchFailed(self.sectionid)))
			{
				Lianja.blankSectionChildren(self.sectionid, true);
				Lianja.clearGridSection(self.sectionid, true);
				Lianja.refreshSectionChildren(self.sectionid);
				Lianja.refreshSectionHeader(self.sectionid);
				Lianja.refreshSectionFooter(self.sectionid);
				if (typeof onsuccess == 'function') onsuccess();
				if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
				self.refreshing = false;
				return;
			}
			Lianja.refreshGridSection(self.sectionid, true, self.parentid, self.parentkeytype, self.parentkeyexpr, self.childkeyexpr, true,
				function(args) 										// onsuccess
				{
					Lianja.blankSectionChildren(self.sectionid, false);
					Lianja.refreshSectionChildren(self.sectionid);
					Lianja.refreshSectionHeader(self.sectionid);
					Lianja.refreshSectionFooter(self.sectionid);
					Lianja.App.dispatchDelegate(self.id, "refresh"); 
					Lianja.App.dispatchDelegate(self.id, "datachanged"); 
					if (typeof args.onsuccess === 'function') args.onsuccess();
					if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
					self.refreshing = false;
				},
				function(args) 										// onerror
				{
					Lianja.blankSectionChildren(self.sectionid, true);
					Lianja.refreshSectionChildren(self.sectionid);
					Lianja.refreshSectionHeader(self.sectionid);
					Lianja.refreshSectionFooter(self.sectionid);
					if (typeof args.onerror === 'function') args.onerror();
					if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
					self.refreshing = false;
				},
				{ "onsuccess": onsuccess, "onerror":onerror}	// args
			);
		}
		else if (self.type === "tabview")
		{
			if (self.queryform && (self.blank || Lianja.searchFailed(self.sectionid)))
			{
				Lianja.refreshSectionChildren(self.sectionid);
				Lianja.refreshSectionHeader(self.sectionid);
				Lianja.refreshSectionFooter(self.sectionid);
				if (typeof onsuccess == 'function') onsuccess();
				if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
				self.refreshing = false;
				return;
			}
			Lianja.refreshTabViewSection(self.pageid, self.sectionid, self.tabviewsectionlist);
			Lianja.App.dispatchDelegate(self.id, "refresh"); 
			Lianja.App.dispatchDelegate(self.id, "datachanged"); 
			if (typeof onsuccess == 'function') onsuccess();
			Lianja.refreshSectionChildren(self.sectionid);
			Lianja.refreshSectionHeader(self.sectionid);
			Lianja.refreshSectionFooter(self.sectionid);
			if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
			self.refreshing = false;
		}
		else if (self.type == 'webview' || 
				 self.type == 'report' || 
				 self.type == 'chart' || 
				 self.type == 'orgchart' || 
				 self.type == 'commentsview' || 
				 self.type == 'documentview' || 
				 self.type == 'galleryview' ||
				 self.type == 'calendarview' ||
				 self.type == 'calendar' ||
				 self.type == 'report' ||
				 self.type == 'chart')
		{
			Lianja.refreshWebViewSection(self.pageid, self.sectionid, self.url);
			Lianja.App.dispatchDelegate(self.id, "refresh"); 
			Lianja.App.dispatchDelegate(self.id, "datachanged"); 
			if (typeof onsuccess == 'function') onsuccess();
			Lianja.refreshSectionChildren(self.sectionid);
			Lianja.refreshSectionHeader(self.sectionid);
			Lianja.refreshSectionFooter(self.sectionid);
			if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
			self.refreshing = false;
		}
		else
		{
			Lianja.App.dispatchDelegate(self.id, "refresh"); 
			Lianja.App.dispatchDelegate(self.id, "datachanged"); 
			if (typeof onsuccess == 'function') onsuccess();
			if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
			self.refreshing = false;
			return;
		}

		if (typeof LianjaAppBuilder !== 'undefined')
		{
			Lianja.refreshSectionChildren(self.sectionid);
			Lianja.refreshSectionHeader(self.sectionid);
			Lianja.refreshSectionFooter(self.sectionid);
			if (typeof self.cursor !== 'undefined' && self.cursor !== null) self.cursor.refreshcurrent = false;
			self.refreshing = false;
		}
	};
	
	if (typeof self.sectionlist !== "undefined") self.setChildSections(self.childlist);
};

//================================================================================
window.Lianja.FormItem = function(pageid, sectionid, formitemid, datatype)
{
	var self = this;
	this.page = Lianja.App.getPage(pageid);
	this.section = this.page.getSection(sectionid);
	this.pageid = pageid;
	this.sectionid = sectionid;
	this.id = formitemid;
	this.datatype = datatype;
	this.cursor = null;
	this.properties = {};
	this.editor = null;
	this.editortype = null;
	this.controlsource = $("#"+formitemid).data("lianjaControlsource");
	this.formitemtype = $("#"+formitemid).data("lianjaFormitemType");
	this.checkboxlist = $("#"+formitemid).data("lianjaFormitemCheckboxlist");
	this.dirty = false;
	this.input = undefined;
	this.choicelist = $("#"+formitemid).data("lianjaFormitemChoicelist");
	if (typeof this.choicelist === 'undefined') this.choicelist = "";
	this.defaultexpr = $("#"+formitemid).data("lianjaFormitemDefaultexpr");
	if (typeof this.defaultexpr === 'undefined') this.defaultexpr = "";
	this.checkboxlistvalue = "";
	this.permcreate = true;
	this.permread = true;
	this.permupdate = true;
	this.permdelete = true;
	this.maxlength = $("#"+formitemid).data("lianjaMaxlength");
	this.inputmask = $("#"+formitemid).data("lianjaInputmask");

	//----------------------------------------------------------------------------
	this.applyPermissions = function()
	{
		self.permcreate = Lianja.App.checkPermission("__app__", "C") &&
		                  Lianja.App.checkPermission(self.id, "C") && 
		                  Lianja.App.checkPermission(self.sectionid, "C") && 
						  Lianja.App.checkPermission(self.pageid, "C"); 
		self.permread =   Lianja.App.checkPermission("__app__", "R") &&
		                  Lianja.App.checkPermission(self.id, "R") && 
		                  Lianja.App.checkPermission(self.sectionid, "R") && 
						  Lianja.App.checkPermission(self.pageid, "R"); 
		self.permupdate = Lianja.App.checkPermission("__app__", "U") &&
		                  Lianja.App.checkPermission(self.id, "U") && 
					      Lianja.App.checkPermission(self.sectionid, "U") && 
						  Lianja.App.checkPermission(self.pageid, "U"); 
		self.permdelete = Lianja.App.checkPermission("__app__", "D") &&
		                  Lianja.App.checkPermission(self.id, "D") && 
						  Lianja.App.checkPermission(self.sectionid, "D") && 
						  Lianja.App.checkPermission(self.pageid, "D"); 
		if (!self.permread)
		{
			self.hide();
		}
	};

	//----------------------------------------------------------------------------
	Object.defineProperty(this, "visible", 
	{
		get: function() { return $("#"+self.id).css("display") === "block" },
		set: function(value) { 
			$("#"+self.id).css("display", value ? "block" : "none");
		}
	});	
	
	//----------------------------------------------------------------------------
	this.show = function()
	{
		$("#"+self.id).css("display", "block");
	};
	
	//----------------------------------------------------------------------------
	this.hide = function()
	{
		$("#"+self.id).css("display", "none");
	};
	
	//----------------------------------------------------------------------------
	this.checkCreatePermission = function()
	{
		return self.permcreate;
	};
	
	//----------------------------------------------------------------------------
	this.checkReadPermission = function()
	{
		return self.permread;
	};
	
	//----------------------------------------------------------------------------
	this.checkUpdatePermission = function()
	{
		return self.permupdate;
	};
	
	//----------------------------------------------------------------------------
	this.checkDeletePermission = function()
	{
		return self.permdelete;
	};
	
	//----------------------------------------------------------------------------
	this.setCheckBoxViewValue = function(values)
	{
		var cb;
		if (typeof self.checkboxlist === 'undefined') 
		{
			return;
		}
		if (self.checkboxlist.indexOf(",") < 0)
		{
			cb = $("#"+checkboxes[0]);
			$(cb).prop("checked", values === "1");
			return;
		}
		values = values.split(",");
		var checkboxes = self.checkboxlist.split(",");
		var j;
		var i;
		for (i=0; i<checkboxes.length; ++i)
		{
			cb = $("#"+checkboxes[i]);
			$(cb).prop("checked", false).checkboxradio("refresh");
		}
		for (i=0; i<values.length; ++i)
		{
			if (typeof values[i] === 'string') j = parseInt(values[i]);
			else j = values[i];
			cb = $("#"+checkboxes[j-1]);
			$(cb).prop("checked", true).checkboxradio("refresh");
		}
	};
	
	//----------------------------------------------------------------------------
	this.getCheckBoxViewValue = function()
	{
		var cb;
		if (typeof self.checkboxlist === 'undefined') 
		{
			return "";
		}
		if (self.checkboxlist.indexOf(",") < 0)
		{
			cb = $("#"+checkboxes[0]);
			if ($(cb).prop("checked")) return "1";
			return "";
		}
		var checkboxes = self.checkboxlist.split(",");
		var j;
		var i;
		var value = "";
		for (i=0; i<checkboxes.length; ++i)
		{
			cb = $("#"+checkboxes[i]);
			if ($(cb).prop("checked"))
			{
				if (value.length > 0) value = value + ",";
				j = i+1;
				value = value + j;
			}
		}
		return value;
	};
	
	//----------------------------------------------------------------------------
	this.setupDefaultValue = function()
	{
		if (self.defaultexpr.length == 0) return;
		try
		{
			var result = eval(self.defaultexpr);
			self.text = result;
		} 
		catch(e) 
		{
			Lianja.evaluate(self.defaultexpr,
				function(result)
				{
					self.text = result;
				},
				function()
				{
					console.log("setupDefaultValue() returned an error.");
				}
			);
		}
	};
	
	//----------------------------------------------------------------------------
	this.setProperty = function(key, value)
	{
		self.properties[key.toLowerCase()] = value;
	};
	
	//----------------------------------------------------------------------------
	this.getProperty = function(key)
	{
		return self.properties[key.toLowerCase()];
	};

	//----------------------------------------------------------------------------
	this.getInputType = function()
	{
		if (self.datatype == "C")
		{
			return "text";
		}
		if (self.datatype == "N" || self.datatype == 'Y')
		{
			return "number";
		}
		if (self.datatype == "D")
		{
			return "date";
		}
		if (self.datatype == "T")
		{
			return "datetime";
		}
		if (self.datatype == "L")
		{
			return "checkbox";
		}
		return "text";
	};

	//----------------------------------------------------------------------------
	this.clear = function()
	{
		//console.log(self.formitemtype);
		if (self.formitemtype === "field")
		{
			if (typeof self.controlsource === 'undefined') return;
			$("#"+self.id).text("");
			this.cursor.clearValue(self.controlsource);
		}
		else if (self.formitemtype === "webview")
		{
		}
		else if (self.formitemtype === "image")
		{
		}
		else if (self.formitemtype === "memo")
		{
		}
		else if (self.formitemtype === "checklistview")
		{
			self.value = "";
		}
		else if (self.formitemtype === null && self.section.type === 'canvas')
		{
			self.value = "";
		}
	};
	
	//----------------------------------------------------------------------------
	this.save = function(inline, value)
	{
		var page = Lianja.App.getPage(self.pageid);
		var section = page.getSection(self.sectionid);
		var el = $("#"+self.id+"-editor");
		var text = typeof value === 'undefined' ? $(el).val() : value;
		var valid = true;
		
		if (text == null) return true;
		
		//console.log("value="+value);
		//console.log("text="+text);
		
		text = str_replace("<a>", "", text);
		text = str_replace("</a>", "", text);

		if (inline) 
		{
			if (self.inputtype === 'checkbox') 
			{
				var checked = $("#"+self.id+"-editor").prop('checked');
				if (checked) text = "Yes";
				else text = "No";
				$("#"+self.id).text( text );
				self.dirty = section.cursor.setChangedValue(self.controlsource, checked, "L");
				return valid;
			}
			
			var mask = $("#"+self.id).data("lianjaInputmask");
			if (typeof mask !== 'undefined' && mask !== null)
			{
				$("#"+self.id).text( transform(text, mask) );			}
			else
			{
				$("#"+self.id).text( text );
			}
			//console.log("saveformitem: text="+text+", controlsource="+self.controlsource);
		}
		
		if (self.formitemtype == "checklistview")
		{
			text = self.getCheckBoxViewValue();
		}

		self.dirty = section.cursor.setChangedValue(self.controlsource, text, self.datatype);
		return valid;
	};
	
	//----------------------------------------------------------------------------
	this.getValue = function()
	{
		var page = Lianja.App.getPage(self.pageid);
		var section = page.getSection(self.sectionid);
		var text = section.cursor.getValue(self.controlsource);
		return text;
	};

	//----------------------------------------------------------------------------
	this.cancel = function()
	{
		var page = Lianja.App.getPage(self.pageid);
		var section = page.getSection(self.sectionid);
		var text = section.cursor.getValue(self.controlsource);
		if (self.formitemtype == "checklistview")
		{
			self.setCheckBoxViewValue(text);
		}
		else
		{
			var mask = $("#"+self.id).data("lianjaInputmask");
			if (typeof mask !== 'undefined' && mask !== null)
			{
				$("#"+self.id).text( transform(text, mask) );			}
			else
			{
				$("#"+self.id).text( text );
			}
		}
		self.dirty = false;
	};

	//----------------------------------------------------------------------------
	this.inputtype = this.getInputType();

	//----------------------------------------------------------------------------
	this.setAttribute = function(name, value)
	{
		if (typeof self.input !== 'undefined') $(self.input).css(name, value);
		else $("#"+self.id).css(name, value);
	};
	
	//----------------------------------------------------------------------------
	this.getAttribute = function(name)
	{
		var el;
		if (typeof self.input !== 'undefined') el = self.input;
		else el = "#"+self.id;
		var value = $(el).prop(name);
		if (typeof value === 'undefined')
		{
			value = $(el).prop(name);
			if (typeof value === 'undefined') value = $(el).css(name);
		}
		if (typeof value === 'string')
		{
			var ppos = value.indexOf("px");
			if (ppos > 0 && ppos == value.length-2) value = parseFloat(value.substring(0, ppos));
		}
		return value;
	};
	
	//----------------------------------------------------------------------------
	this.setFocus = function()
	{
		if (typeof self.input !== 'undefined') $(self.input).focus();
	};
	this.setfocus = this.setFocus;

	//----------------------------------------------------------------------------
	Object.defineProperty(this, "text", 
	{
		get: function() { 
			if (self.formitemtype == 'checklistview') return self.getCheckBoxViewValue();
			if (typeof self.input !== 'undefined') 
			{
				if (self.datatype == 'L') return $(self.input).prop("checked");
				return $(self.input).val();
			}
			return $("#"+self.id).text(); 
		},
		set: function(value) { 
			if (self.formitemtype == 'checklistview') self.setCheckBoxViewValue(value);
			else if (typeof self.input !== 'undefined') 
			{
				if (self.datatype == 'L') return $(self.input).prop("checked", values === "1");
				return $(self.input).val(value);
			}
			else if (self.datatype == 'L')
			{
				if (typeof val === 'string')
				{
					if (val === "false") val = "No";
					else val = "Yes";
				}
				else if (typeof val === 'boolean')
				{
					if (val) val = "Yes";
					else val = "No";
				}
				$("#"+self.id).text(val);
			}
			else $("#"+self.id).text(value); 
		}
	});	

	//----------------------------------------------------------------------------
	Object.defineProperty(this, "caption", 
	{
		get: function() { 
			if (self.formitemtype == 'checklistview') return self.getCheckBoxViewValue();
			if (typeof self.input !== 'undefined') 
			{
				if (self.datatype == 'L') return $(self.input).prop("checked");
				return $(self.input).val();
			}
			return $("#"+self.id).text(); 
		},
		set: function(value) { 
			if (self.formitemtype == 'checklistview') self.setCheckBoxViewValue(value);
			else if (typeof self.input !== 'undefined') 
			{
				if (self.datatype == 'L') return $(self.input).prop("checked", values === "1");
				return $(self.input).val(value);
			}
			else if (self.datatype == 'L')
			{
				if (typeof val === 'string')
				{
					if (val === "false") val = "No";
					else val = "Yes";
				}
				else if (typeof val === 'boolean')
				{
					if (val) val = "Yes";
					else val = "No";
				}
				$("#"+self.id).text(val);
			}
			else $("#"+self.id).text(value); 
		}
	});	

	//----------------------------------------------------------------------------
	Object.defineProperty(this, "value", 
	{
		get: function() { 
			if (self.formitemtype == 'checklistview') return self.getCheckBoxViewValue();
			if (typeof self.input !== 'undefined') 
			{
				if (self.datatype == 'L') return $(self.input).prop("checked");
				return $(self.input).val();
			}
			return $("#"+self.id).text(); 
		},
		set: function(val) { 
			if (self.formitemtype == 'checklistview') self.setCheckBoxViewValue(val);
			else if (typeof self.input !== 'undefined') 
			{
				if (self.datatype == 'L') return $(self.input).prop("checked", val);
				return $(self.input).val(val);
			}
			else if (self.datatype == 'L')
			{
				if (typeof val === 'string')
				{
					if (val === "false") val = "No";
					else val = "Yes";
				}
				else if (typeof val === 'boolean')
				{
					if (val) val = "Yes";
					else val = "No";
				}
				$("#"+self.id).text(val);
			}
			else $("#"+self.id).text(val); 
		}
	});	

	//----------------------------------------------------------------------------
	Object.defineProperty(this, "backcolor", 
	{
		get: function() { return self.getAttribute("background-color"); },
		set: function(value) { self.setAttribute("background-color", value); }
	});	

	//----------------------------------------------------------------------------
	Object.defineProperty(this, "forecolor", 
	{
		get: function() { return self.getAttribute("color"); },
		set: function(value) { self.setAttribute("color", value); }
	});	
};

//================================================================================
window.Lianja.Grid = function(pageid, sectionid, formitemid, canupload)
{
	var self = this;
	
	var readonly = $("#"+sectionid+"-gridcontainer").data("lianjaReadonly");
	if (typeof readonly === 'undefined') readonly = false;
	this.readonly = readonly;

	this.colModel = [];
	this.cellInputID = [];
	this.section = $("#"+sectionid);
	this.columns = [];
	this.pageid = pageid;
	this.sectionid = sectionid;
	this.formitemid = formitemid;
	this.caption = "";
	this.backcolor = "";
	this.forecolor = "";
	this._grid = null;
	this.sql = "";
	this.divid = "";
	this.database = this.section.data("lianjaDatabase");
	this.table = this.section.data("lianjaTable");
	this.section = null;
	this.filter = "";
	this.searchfilter = "";
	this.currentrow = -1;
	this.currentrowid = -1;
	this.parentid = "";
	this.editing = false;
	this.adding = false;
	this.dirty = false;
	this.trselected = null;
	this.canupload = canupload;
	this.hyperlinkdelegate = $("#"+sectionid+"-gridcontainer").data("lianjaGridHyperlinkDelegate");
	this.orderby = "";
	this.where = "";
	var sortable = $("#"+sectionid+"-gridcontainer").data("lianjaSortable");
	if (typeof sortable === 'undefined') sortable = false;
	this.sortable = sortable;
	this.primarykey = '';
	this.database = Lianja.getUserRuntimeDatabase(this.database);
	this.deferredLinkClick = null;
	var pagination = $("#"+sectionid+"-gridcontainer").data("lianjaPagination");
	if (typeof pagination === 'undefined') pagination = true;
	this.pagination = pagination;

	//----------------------------------------------------------------------------
	this.refresh = function(row, onsuccess, onerror, args)
	{
		var url = self.getUrl();
		self.editing = false;
		self.dirty = false;
		self.adding = false;
		$(self.divid).flexEditing(false);
		$(self.divid).flexOptions( 
			{ 
				"url": url, 
				"onsuccess": 
					function(args)	// onsuccess
					{
						if (typeof args.row === 'string')
						{
							$('#'+args.row).click();
						}
						else
						{
							$(self.divid).scrollTop();
						}
						if (typeof args.calleronsuccess === 'function') args.calleronsuccess(args.callerargs);
					},
				"onerror": 
					function(args)	// onerror
					{
						if (typeof args.calleronerror === 'function') args.calleronerror(args.callerargs);
					},
				"row": row, 
				"calleronsuccess": onsuccess, 
				"calleronerror": onerror, 
				"callerargs":args 
			}
		);
		
		$(self.divid).flexReload();
	};
	
	//----------------------------------------------------------------------------
	this.getColumnModel = function()
	{
		_.each(self.columns, function(column) {
			var coldef = {};
			coldef.display = column.caption;
			if (typeof column.controlsource == 'undefined') return;
			coldef.name = column.controlsource.toLowerCase();
			coldef.width = column.width + 20;
			coldef.type = column.type;
			coldef.table = self.table;
			coldef.hyperlink = column.hyperlink;
			coldef.readonly = column.readonly;
			coldef.hidden = column.hidden;
			if (column.type == 'N') coldef.align = 'right';
			else coldef.align = 'left';
			self.colModel.push(coldef);
		});		
		
		return self.colModel;
	};
	
	//----------------------------------------------------------------------------
	this.getPrimaryKey = function()
	{
		return $(self.divid).flexGetPrimaryKey();
	};
	
	//----------------------------------------------------------------------------
	this.getPrimaryKeyValue = function()
	{
		return self.section.cursor.getValue(self.getPrimaryKey());
	};

	//----------------------------------------------------------------------------
	this.getTableType = function()
	{
		return $(self.divid).flexGetTableType();
	};
	
	//----------------------------------------------------------------------------
	this.getData = function()
	{
		var data = $(self.divid).flexGetData();
		return data;
	};
	
	//----------------------------------------------------------------------------
	this.getColumn = function(index)
	{
		return self.columns[index];
	};
	
	//----------------------------------------------------------------------------
	this.getUrl = function()
	{
		var ofilter = "";
		if (typeof self.section.parentkeyexpr === 'undefined' || self.section.parentkeyexpr.length == 0)
		{
			if (self.filter.length > 0) 
			{
				ofilter = "&$filter=" + Lianja.Odata_Translate(self.filter);
			}
			if (self.section.filter.length > 0) 
			{
				if (ofilter.length > 0) ofilter = ofilter + " and " + Lianja.Odata_Translate(self.section.filter);
				else ofilter = "&$filter=" + Lianja.Odata_Translate(self.section.filter);
			}
			if (self.section.where.length > 0 && self.section.where !== self.section.filter) 
			{
				if (ofilter.length > 0) ofilter = ofilter + " and " + Lianja.Odata_Translate(self.section.where);
				else ofilter = "&$filter=" + Lianja.Odata_Translate(self.section.where);
			}
			if (self.section.cursor.searchfilter.length > 0) 
			{
				if (ofilter.length > 0) ofilter = ofilter + " and " + Lianja.Odata_Translate(self.section.cursor.searchfilter);
				else ofilter = "&$filter=" + Lianja.Odata_Translate(self.section.cursor.searchfilter);
			}
			if (self.where.length > 0) 
			{
				if (ofilter.length > 0) ofilter = ofilter + " and " + Lianja.Odata_Translate(self.where);
				else ofilter = "&$filter=" + self.where;
			}
			if (self.orderby.length == 0) return '/odata/' + self.database + '/' + self.table + '?$format=jsongrid' + ofilter;
			else return '/odata/' + self.database + '/' + self.table + '?$format=jsongrid' + ofilter + "&$orderby=" + self.orderby;
		}
		else
		{
			if (self.section.parentid.length > 0)
			{
				var parentsection = Lianja.getSection(self.section.parentid);
				if (typeof parentsection === 'object')
				{
					var cursor = Lianja.App.getCursor(self.database, parentsection.table);
					if (cursor !== null)
					{
						var parentkeytype = self.section.parentkeytype;
						var parentkey = cursor.getValue(self.section.parentkeyexpr);
						if (typeof parentkey !== 'undefined')
						{
							if (parentkeytype == 'C')
							{
								ofilter = "&$filter=" + self.section.childkeyexpr.toLowerCase() + " eq '" + str_escape(alltrim(parentkey)) + "'";
							}
							else if (parentkeytype == 'N')
							{
								ofilter = "&$filter=" + self.section.childkeyexpr.toLowerCase() + " eq " + parentkey;
							}
							if (parentkeytype == 'D')
							{
								ofilter = "&$filter=" + self.section.childkeyexpr.toLowerCase() + " eq '" + alltrim(parentkey) + "'";
							}
						}
					}
				}
			}
			if (self.filter.length > 0) 
			{
				if (ofilter.length > 0) ofilter = ofilter + " and " + Lianja.Odata_Translate(self.filter);
				else ofilter = "&$filter=" + Lianja.Odata_Translate(self.filter);
			}
			if (self.section.filter.length > 0) 
			{
				if (ofilter.length > 0) ofilter = ofilter + " and " + Lianja.Odata_Translate(self.section.filter);
				else ofilter = "&$filter=" + Lianja.Odata_Translate(self.section.filter);
			}
			if (self.section.where.length > 0) 
			{
				if (ofilter.length > 0) ofilter = ofilter + " and " + Lianja.Odata_Translate(self.section.where);
				else ofilter = "&$filter=" + Lianja.Odata_Translate(self.section.where);
			}
			if (self.section.cursor.searchfilter.length > 0) 
			{
				if (ofilter.length > 0) ofilter = ofilter + " and " + Lianja.Odata_Translate(self.section.cursor.searchfilter);
				else ofilter = "&$filter=" + Lianja.Odata_Translate(self.section.cursor.searchfilter);
			}
			if (self.where.length > 0) 
			{
				if (ofilter.length > 0) ofilter = ofilter + " and " + Lianja.Odata_Translate(self.where);
				else ofilter = "&$filter=" + Lianja.Odata_Translate(self.where);
			}
			if (self.orderby.length == 0) return '/odata/' + self.database + '/' + self.table + '?$format=jsongrid' + ofilter;
			else return '/odata/' + self.database + '/' + self.table + '?$format=jsongrid' + ofilter + "&$orderby=" + self.orderby;
		}
	};
	
	//----------------------------------------------------------------------------
	this.init = function(divid)
	{
		self.divid = divid;
		var buttons;

		if (false && !Lianja.isPhoneGap() && Lianja.App.targetui == "web")
		{
			buttons = [ 
				{
					name : 'Save',
					bclass : 'save',
					editbtn:true,
					tooltip: 'Save Changes',
					onpress : buttonHandler
				},
				{
					name : 'Cancel',
					bclass : 'cancel',
					editbtn:true,
					tooltip: 'Undo Changes',
					onpress : buttonHandler
				},				
				{
					name : 'Add',
					bclass : 'add',
					tooltip: 'Add New Record',
					onpress : buttonHandler
				},
				{
					name : 'Edit',
					bclass : 'edit',
					tooltip: 'Edit Record',
					onpress : buttonHandler
				},
				{
					name : 'Delete',
					bclass : 'delete',
					tooltip: 'Delete Record',
					onpress : buttonHandler
				}
			];
		}
		else
		{
			buttons = [ 
				{
					name : 'Add',
					bclass : 'add',
					tooltip: 'Add New Record',
					onpress : buttonHandler
				},
				{
					name : 'Edit',
					bclass : 'edit',
					tooltip: 'Edit Record',
					onpress : buttonHandler
				},
				{
					name : 'Delete',
					bclass : 'delete',
					tooltip: 'Delete Record',
					onpress : buttonHandler
				}
			];
		}

		
		if (self.canupload)
		{
			buttons.push( 
				{
					name : 'Upload',
					bclass : 'upload',
					tooltip: 'Upload attachment',
					onpress : buttonHandler
				}
			);
		}
		
		if (self.readonly) buttons = false;
		$(divid).flexigrid({
			url : self.getUrl(),
			buttons: buttons,
			dataType : 'json',
			colModel : self.getColumnModel(),
			sortname : "",
			sortorder : "asc",
			title : false,
			useRp : true,
			rp : 25,
			rpOptions: [25,50,100,200,500],
			showTableToggleBtn : false,
			width : "100%",
			height : "100%",
			resizable:false,
			novstripe:true,
			colResize:false,
			colMove:false,
			searchitems:false,
			showToggleBtn:false,
			autoload:false,
			__primarykey:'',
			idProperty: '__rowid',
			multisel: false,
			novstripe:false,
			singleSelect:true,
			divid: self.divid,
			onLinkClicked: self.hyperlinkdelegate,
			onClick: RowClicked,
			sortable: self.sortable,
			onChangeSort: SortBy,
			onDoubleClick: RowDoubleClicked,
			pageid: self.pageid,
			sectionid: self.sectionid,
			uniqueid: self.sectionid+"-",
			readonly: self.readonly,
			usepager:self.pagination,
			useRp:self.pagination,
			mobile: Lianja.isMobile() || Lianja.App.targetui == "phone" || Lianja.App.targetui == "tablet"
		});
		self._grid = $(self.divid).flexGrid();
		self._grid.ogrid = self;
				
		function SortBy(col, order)
		{
			var coldef = self.colModel[col];
			var controlsource = coldef.name.toLowerCase();
			if (order == "asc") self.orderby = controlsource;
			else self.orderby = controlsource + " " + order;
			self.refresh();
		}
		
		function RowDoubleClicked(tr, grid, prop)
		{
			self.section.refreshing = false;
			if (typeof tr === 'undefined' || typeof tr.id === 'undefined') 
			{
				//console.log("RowDoubleClicked() invalid tr");
				return;
			}
			if (!self.readonly) 
			{
				RowClicked(tr, grid, prop);
				if (Lianja.isPhoneGap() || Lianja.App.targetui == "phone" || Lianja.App.targetui == "tablet" || true)
				{
					self.pg_editRow(grid);
				}
				else
				{
					self.editRow(grid);
				}
			}
		}
		
		function RowClicked(tr, grid, prop)
		{
			$.pnotify_remove_all();
			if (typeof tr === 'undefined' || typeof tr.id === 'undefined' || tr.id === '') 
			{
				return;
			}
			var items = tr.id.split("-");
			var page = items[0];
			var section = items[1];
			var row = items[2].substring(3);
			var rowid = items[3].substring(5);
			var id;
			var coldef;
			var controlsource;
			var rowdata = {};
			self.grid = grid;
			self.trselected = tr;
			self.trselectedid = tr.id;
			self.currentrow = row;
			self.currentrowid = rowid;
			self.rowid = rowid;
			self.section.cursor.setRecno(rowid);
			for (var i=0; i<self.colModel.length; ++i)
			{
				id = self.sectionid + "-row" + row + '-col' + i;
				coldef = self.colModel[i];
				controlsource = coldef.name.toLowerCase();
				value = $('#'+id).text();
				if (coldef.type == "N" || coldef.type == "Y") rowdata[controlsource] = parseFloat(value);
				else rowdata[controlsource] = value;
				if (coldef.readonly) self.section.cursor.setReadonlyColumn(controlsource);
			}
			self.section.updateCursor(rowdata, rowid, true);
			self.section.refreshing = false;
			Lianja.refreshSectionChildren(self.section.pageid + "-" + self.section.id, true);
			if (self.section.page.getLastSection() == self.section) Lianja.refreshRightSideBar(self.section.pageid);
			if (self.deferredLinkClick !== null)
			{
				var controlsource = self.deferredLinkClick.controlsource;
				var delegate = self.deferredLinkClick.delegate;
				var text = self.deferredLinkClick.text;
				self.deferredLinkClick = null;
				Lianja.linkClickedGridColumn(controlsource, delegate, text);
			}
		}

		function buttonHandler(command, grid) {
			if (self.readonly) return;
			if (command == 'Add') 
			{
				if (Lianja.isPhoneGap() || Lianja.App.targetui == "phone" || Lianja.App.targetui == "tablet" || true)
				{
					self.pg_addRow(grid);
				}
				else
				{
					self.addRow(grid);
				}
			}
			else if (command == 'Edit') 
			{
				if (Lianja.isPhoneGap() || Lianja.App.targetui == "phone" || Lianja.App.targetui == "tablet" || true)
				{
					self.pg_editRow(grid);
				}
				else
				{
					self.editRow(grid);
				}
			}
			else if (command == 'Delete') 
			{
				self.deleteRow(grid);
			}
			else if (command == 'Save') 
			{
				self.validateRow( 
					function()
					{
						self.save();
					}
				);
			}
			else if (command == 'Cancel') 
			{
				self.cancel();
			}
			else if (command == 'Upload') 
			{
				self.upload();
			}
		}
	};
	
	//----------------------------------------------------------------------------
	Object.defineProperty(this, "activerow", 
	{
		get: function() { return self.currentrow; },
		set: function(value) { 
			self.selectRow(value);
		}
	});	

	//----------------------------------------------------------------------------
	this.item = function(row, col)
	{
		var trid = self.sectionid;
		var id = trid + '-row' + row + '-col' + col;
		var coldef = self.colModel[col];
		var value = $('#'+id).text();
		if (coldef.type == "N" || coldef.type == "Y") value = parseFloat(value);
		return value;
	};
	
	//----------------------------------------------------------------------------
	this.validateRow = function(onsuccess)
	{
		var hasvalidation = false;
		Lianja.App.validationerror = false;
		Lianja.App.validationcount = 0;
		self.validationcomplete = onsuccess;

		for (var i=0; i<self.colModel.length; ++i)
		{
			var column = self.getColumn(i);
			if (column.validation.length > 0)
			{
				hasvalidation = true;
				++Lianja.App.validationcount;
			}
		}

		if (!hasvalidation) 
		{
			onsuccess();
			return;
		}
		
		for (var i=0; hasvalidation && i<self.colModel.length; ++i)
		{
			var column = self.getColumn(i);
			if (column.validation.length > 0)
			{
				Lianja.validate(self.pageid, self.sectionid, undefined, column.input,
					function(pageid, sectionid, formitem, input)			// onsuccess
					{
						--Lianja.App.validationcount;
						if (Lianja.App.validationcount == 0 && !Lianja.App.validationerror)
						{
							self.validationcomplete();
						}
					},
					function(pageid, sectionid, formitem, input, errmsg)	// onerror
					{
						--Lianja.App.validationcount;
						Lianja.App.validationerror = true;
						Lianja.showErrorMessage(errmsg);
						if (!Lianja.App.validationerror) $(input).focus();
					}					
				);
			}
		}
	};
	
	//----------------------------------------------------------------------------
	this.blankDataRow = function(defaults)
	{
		var data = '{ "rows" : [ { "__rowid":0, ';
		var field;
		
		for (var i=0; i<self.colModel.length; ++i)
		{
			var coldef = self.colModel[i];
			if (coldef.type == 'N' || coldef.type == 'Y')
			{
				if (typeof defaults === 'undefined' || typeof defaults[i] === 'undefined')
				{				
					field = '"' + coldef.name + '":0';
				}
				else
				{
					field = '"' + coldef.name + '":' + defaults[i];
				}
			}
			else
			{
				if (typeof defaults === 'undefined' || typeof defaults[i] === 'undefined') 
				{
					field = '"' + coldef.name + '":""';
				}
				else
				{
					field = '"' + coldef.name + '":"' + defaults[i] + '"';
				}
			}
			if (i > 0) data += ",";
			data += field;
		}

		// add the parent->child relationship key if this section has a parent
		field = "";
		if (self.section.parentid.length > 0)
		{
			var parentsection = Lianja.getSection(self.section.parentid);
			if (typeof parentsection === 'object')
			{
				var cursor = Lianja.App.getCursor(self.database, parentsection.table);
				if (cursor !== null)
				{
					var parentkeytype = self.section.parentkeytype;
					var parentkey = cursor.getValue(self.section.parentkeyexpr);
					if (typeof parentkey !== 'undefined')
					{
						if (parentkeytype == 'C')
						{
							field = '"' + self.section.childkeyexpr.toLowerCase() + '":"' + alltrim(parentkey) + '"';
						}
						else if (parentkeytype == 'N')
						{
							field = '"' + self.section.childkeyexpr.toLowerCase() + '":' + parentkey;
						}
						if (parentkeytype == 'D')
						{
							field = '"' + self.section.childkeyexpr.toLowerCase() + '":"' + alltrim(parentkey) + '"';
						}
					}
				}
			}
			data += ",";
			data += field;
		}
		
		data += '}], "total": 1, "__rowid": 0 }';
		return data;
	};
	
	//----------------------------------------------------------------------------
	this.addRow = function(grid)
	{
		if (self.editing) 
		{
			Lianja.showWarningMessage("Please Save or Cancel editing first");
			return;
		}
		if (typeof grid === 'undefined') grid = self.grid;
		
		var hasdefaults = false;
		for (var i=0; i<self.colModel.length; ++i)
		{
			var column = self.getColumn(i);
			if (column.defaultvalue.length > 0)
			{
				hasdefaults = true;
				break;
			}
		}
		
		if (!hasdefaults)
		{
			var data = self.blankDataRow();
			$(self.divid).flexAddData($.parseJSON(data), true);
			self.adding = true;
			self.editRow(grid);
		}
		else
		{
			var defaults = [];
			self.setupColumnDefaults(defaults, 0, self.colModel,
				function(defaults)
				{
					var data = self.blankDataRow(defaults);
					$(self.divid).flexAddData($.parseJSON(data), true);
					self.adding = true;
					self.editRow(self.grid);
				}
			);
		}
	};
	
	//----------------------------------------------------------------------------
	this.clear = function()
	{
		var data = '{ "rows" : [ { "__rowid":0, ';
		$(self.divid).flexAddData(data, false);
	};
	
	//----------------------------------------------------------------------------
	this.selectRow = function(row)
	{
		$(self.divid).flexSetSelectedRow(row);
	};
	
	//----------------------------------------------------------------------------
	this.setupColumnDefaults = function(defaults, index, colmodel, callback)
	{
		for (var i=index; i<colmodel.length;)
		{
			var column = self.getColumn(i);
			if (column.defaultvalue.length > 0)
			{
				try
				{
					var result = eval(column.defaultvalue);
					defaults.push(result);
					++i;
					if (i >= colmodel.length-1)
					{
						callback(defaults);
						return;
					}
				} 
				catch(e) 
				{
					Lianja.evaluate(column.defaultvalue,
									function(result, args)
									{
										args.defaults.push(result);
										if (args.index < self.colmodel.length-1)
										{
											self.setupColumnDefaults(args.defaults, args.index+1, args.colmodel, args.callback);
										}
										else
										{
											args.callback(args.defaults);
										}
									},
									function()
									{
									},
									{ "index": i, "defaults": defaults, "callback": callback, "colmodel":colmodel }
					);
				}
			}
			else
			{
				defaults.push(undefined);
				++i;
				if (i >= colmodel.length-1)
				{
					callback(defaults);
					return;
				}
			}
		}
	};

	//----------------------------------------------------------------------------
	this.deleteChildren = function(onsuccess, onerror)
	{
		new self.section.page.deleteChildren(self.section, onsuccess, onerror);
	};

	//----------------------------------------------------------------------------
	this.isVirtualTable = function()
	{
		var tabletype = self.getTableType();
		if (typeof tabletype !== 'undefined' && tabletype == "virtualtable") return true;
		else return false;
	};
	
	//----------------------------------------------------------------------------
	this.setupPrimaryKey = function()
	{
		var tabletype = self.getTableType();
		var primarykey = self.getPrimaryKey();
		var primarykeyvalue;
		if (typeof tabletype !== 'undefined' && tabletype == "virtualtable" && typeof primarykey !== 'undefined')
		{
			if (primarykey.length == 0)
			{
				Lianja.showWarningMessage("You have not specified a primarykey for this VirtualTable");
				return false;
			}
			primarykeyvalue = self.getPrimaryKeyValue();
			self.section.cursor.primarykey = primarykey;
			self.section.cursor.primarykeyvalue = primarykeyvalue;
		}
		return true;
	};
	
	//----------------------------------------------------------------------------
	this.deleteRow = function(grid)
	{
		if (self.editing) 
		{
			Lianja.showWarningMessage("Please Save or Cancel editing first");
			return;
		}

		if (!self.setupPrimaryKey()) return;
		
		if (typeof grid === 'undefined') grid = self.grid;
		Lianja.confirm("Delete selected record. Are you sure?", function(result) {
			if (!result) return;
			//bootbox.hideAll();
			self.section.cursor._delete(
				function (data)
				{
					if (self.section.cascadedeletes && typeof LianjaAppBuilder !== 'object')
					{
						new self.deleteChildren(
							function ()
							{
								self.refresh(self.trselectedid);
								Lianja.showSuccessMessage("Record was deleted");
							},
							function (jqXHR, textStatus, errorThrown)
							{
								Lianja.showErrorMessage("Cannot delete the record", "Delete failed");
							}
						);
					}
					else
					{
						self.refresh(self.trselectedid);
						Lianja.showSuccessMessage("Record was deleted");
					}
				},
				function (jqXHR, textStatus, errorThrown)
				{
					Lianja.showErrorMessage("Cannot delete the record", "Delete failed");
				}
			);
		}); 
	};

	//----------------------------------------------------------------------------
	this.attachDatePickers = function()
	{
		for (var i=0; i<self.datepickers.length; ++i)
		{
			var input = self.datepickers[i];
			var text = self.datepickerstext[i];
			if (Lianja.App.locale !== 'en')
			{
				$(input).datepicker(
				{
					format: 'yyyy-mm-dd', 
					autoclose:true,
					language:Lianja.App.locale
				})
					.on('changeDate', function(ev) {
						$(input).datepicker('hide');
				});
			}
			else
			{
				$(input).datepicker({format: 'yyyy-mm-dd', autoclose:true})
					.on('changeDate', function(ev) {
						$(input).datepicker('hide');
				});
			}
			$(input).datepicker("setValue", text);
			$(input).datepicker('place');		}
	};
	
	//----------------------------------------------------------------------------
	this.pg_createGridEditForm = function()
	{
		var mobile = Lianja.isPhoneGap(); //Lianja.isMobile();
		var supportsdate = Lianja.supportsDate();
		var supportsdatetime = Lianja.supportsDateTime();
		var html = "";
		
		if (self.trselected == null)
		{	
			Lianja.showNotification("Please select a row to edit first");
			return undefined;
		}
		if (typeof grid === 'undefined') grid = self.grid;
		
		if (self.editing) return;
		self.editing = true;
		self.dirty = false;
		self.datepickers = [];
		self.datepickerstext = [];

		$(self.divid).flexEditing(true);
		
		var coldef;
		var rowheight = "25px";
		self.cellInputID = [];

		var outerdiv = document.createElement('div');
		$(outerdiv).css( "width", "100%");
		$(outerdiv).css( "height", "100%");
		$(outerdiv).css( "overflow-y", "auto");
		$(outerdiv).css( "overflow-x", "hidden");

		var table = document.createElement('table');
		table.cellSpacing = "0";
		table.cellPadding = "0";
		$(outerdiv).append(table);

		for (var i=0; i<self.colModel.length; ++i)
		{
			var coldef = self.colModel[i];
			if (coldef.type == 'M' || coldef.type == 'G')
			{
				self.cellInputID.push("");
				continue;
			}
			//var id = self.trselected.id + '-col' + i;
			var id = self.sectionid + "-row" + self.currentrow + '-col' + i;
			var tr = document.createElement('tr');
			var tdcaption = document.createElement('td');
			var td = document.createElement('td');
			var div = document.createElement('div');
			var input = document.createElement('input');
			var text = $('#'+id).text();
			var type = "text";	
			var datatype = coldef.type;
			var column = self.getColumn(i);
			
			if (datatype == 'C')
			{
				type = 'text';
			}
			else if (datatype == 'N' || datatype == 'Y')
			{
				type = 'number';
			}
			else if (datatype == 'D')
			{
				type = 'date';
				text = alltrim(text);
			}
			else if (datatype == 'T')
			{
				type = 'datetime';
			}
			else if (datatype == 'L')
			{
				type = 'checkbox';
			}

			$(table).css( "width", "100%");
			$(table).css( "padding", "0");
			$(table).css("border-bottom", "0");
			
			$(tr).css( "height", rowheight );
			$(tr).css( "min-height" , rowheight );
			$(tr).css( "max-height" , rowheight );
			$(tr).css("vertical-align", "middle");
			$(tr).css( "line-height", rowheight );
			$(tr).css( "border-bottom", "1px solid white" );
			$(tr).css( "border-right", "1px solid white" );
			if (i == 0) $(tr).css("padding-top", "2px");
			
			$(tdcaption).css( "height", rowheight );
			$(tdcaption).css( "min-height" , rowheight );
			$(tdcaption).css( "max-height" , rowheight );
			$(tdcaption).css( "width", "50%");
			$(tdcaption).css("vertical-align", "middle");
			$(tdcaption).css("background-color", "#f9f9f9");
			$(tdcaption).css("color", "#000000");
			$(tdcaption).css("padding-right", "5px");
			$(tdcaption).css("text-align", "right");
			$(tdcaption).append(coldef.display);
			if (i == 0) $(tdcaption).css("padding-top", "2px");
			
			$(td).css( "height", rowheight );
			$(td).css( "min-height" , rowheight );
			$(td).css( "max-height" , rowheight );
			$(td).css( "width", "50%");
			$(td).css("vertical-align", "middle");
			$(td).css("padding-right", "2px");
			if (i == 0) $(td).css("padding-top", "2px");
			
			$(div).css( "height", rowheight );
			$(div).css( "min-height" , rowheight );
			$(div).css( "max-height" , rowheight );
			$(div).css( "width", "100%");
			$(div).css( "padding", 0);
			$(div).css("display", "table");
			
			if (column.hidden) $(tr).css("display", "none");
			$(table).append(tr);
			$(tr).append(tdcaption);			
			$(tr).append(td);
						
			$(input).css( "width", "100%");
			$(input).css( "height", rowheight);
			$(input).css( "min-height", rowheight);
			$(input).css("vertical-align", "middle");
			$(input).css("display", "table-cell");
			$(input).css("margin-bottom", "0");
			$(input).css("font-size", "11px");
			
			input.id = id + "-editor";
			if (type === 'checkbox') 
			{
				//$("#"+id).text("");
				$(input).checkboxpicker();
				$(input).prop('checked', text == 'Yes' || text == "true");
			}
			else
			{	
				if (datatype == 'D' && text.length==0)
				{
					//$("#"+id).text("");
					$(input).val(text);
				}
				else
				{
					//$("#"+id).text("");
					$(input).val(text);
				}
			}
			$(input).css( "width", "100%");
			$(input).css( "padding", "0");
			$(input).data("cellindex", i);
			//$("#"+id).append(table);
			$(td).append(div);

			var isdatetime = type == 'datetime';
			var isdate = type == 'date';
			if (column.readonly)
			{
				type = "text";
				isdatetime = false;
			}
			if (!mobile && (Lianja.isChrome()||Lianja.isIE11()) && type == 'datetime')  type = 'text';
			if (!mobile && (Lianja.isChrome()||Lianja.isIE11()) && type == 'date')  type = 'text';
			if (mobile && type === 'datetime') type = "datetime-local";
			
			if (!isdatetime)
			{
				$(div).append(input);
			}
			column.input = input;
			
			if (column.readonly)
			{
				$(input).attr("readonly", true);
			}

			// handle optional input mask
			var mask = column.inputmask;
			if (typeof mask !== 'undefined' && mask !== null && mask.length > 0)
			{
				Lianja.setInputMask(input, mask);
			}

			input.type = type;
			
			if (datatype == 'D' && text.length==0)
			{
				;
			}
			else if (type === 'checkbox')
			{
				;
			}
			else
			{
				$(input).val(text);
			}
			
			if (!mobile && isdate)
			{
				self.datepickers.push(input);
				self.datepickerstext.push(text);
			}
			else if (!mobile && isdatetime)
			{
				;
			}
			else 
			{
				isdatetime = false;
			}
			if (isdatetime && !mobile)
			{
				$(div).addClass("input-append date form_datetime");
				$(div).css("margin-bottom", "0");
				$(div).css("padding-right", "0");
				$(div).css("height", "24px");
				$(div).css("border-right-width", "0");
				$(div).append(input);
				$(div).append('<span class="add-on" style="padding:5px 5px;display:table-cell;height:initial;"><i class="icon-calendar" style="display:table-cell;"></i></span>');
				$(input).data("format", "yyyy-MM-dd");
				$(input).css("border", "1px solid #ccc");
				input.type = "text";
				$(div).datetimepicker(
				{
					format: 'yyyy-MM-dd hh:mm:ss', 
					autoclose: true,
					todayBtn: true,
					pickerPosition: "bottom-left",
					position: 'left',
					language:Lianja.App.locale
				});
			}

			self.cellInputID.push(id + "-editor");
		}
		
		return outerdiv;
	};
	
	//----------------------------------------------------------------------------
	this.pg_addRow = function(grid)
	{
		if (typeof LianjaAppBuilder !== 'undefined')
		{
			Lianja.showMessage("Use 'Preview' to test grid data editing.");
			return;
		}

		var grid = self.grid;
		if (self.editing) 
		{
			Lianja.showWarningMessage("Please Save or Cancel editing first");
			return;
		}
		if (typeof grid === 'undefined') grid = self.grid;
		
		var hasdefaults = false;
		for (var i=0; i<self.colModel.length; ++i)
		{
			var column = self.getColumn(i);
			if (column.defaultvalue.length > 0)
			{
				hasdefaults = true;
				break;
			}
		}
		
		if (!hasdefaults)
		{
			var data = self.blankDataRow();
			$(self.divid).flexAddData($.parseJSON(data), true);
			self.adding = true;
		}
		else
		{
			var defaults = [];
			self.setupColumnDefaults(defaults, 0, self.colModel,
				function(defaults)
				{
					var data = self.blankDataRow(defaults);
					$(self.divid).flexAddData($.parseJSON(data), true);
					self.adding = true;
				}
			);
		}

		var form = self.pg_createGridEditForm();
		if (typeof form === 'undefined') return;
		var width = (Lianja.App.targetui === "phone") ? "100%" : 500;
		Lianja.App.activegrid = self;
		self.attachDatePickers();
		Lianja.showDialogPanel("Add Record", form, width, "", "", 
			function() 
			{
				self.save();
				Lianja.App.activegrid = undefined;
			}, 
			function() 
			{
				self.cancel();
				Lianja.App.activegrid = undefined;
			});		
	};
	
	//----------------------------------------------------------------------------
	this.pg_editRow = function(grid)
	{
		if (typeof LianjaAppBuilder !== 'undefined')
		{
			Lianja.showMessage("Use 'Preview' to test grid data editing.");
			return;
		}
		var form = self.pg_createGridEditForm();
		if (typeof form === 'undefined') return;
		var width = (Lianja.App.targetui === "phone") ? "100%" : 500;
		Lianja.App.activegrid = self;
		self.attachDatePickers();
		Lianja.showDialogPanel("Edit Record", form, width, "", "", 
			function() 
			{
				self.save();
				Lianja.App.activegrid = undefined;
			}, 
			function() 
			{
				self.cancel();
				Lianja.App.activegrid = undefined;
			});		
	};
	
	//----------------------------------------------------------------------------
	this.editRow = function(grid)
	{
		var mobile = Lianja.isMobile();
		var supportsdate = Lianja.supportsDate();
		var supportsdatetime = Lianja.supportsDateTime();
		
		if (self.trselected == null)
		{	
			Lianja.showNotification("Please select a row to edit first");
			return;
		}
		if (typeof grid === 'undefined') grid = self.grid;
		
		if (self.editing) return;
		self.editing = true;
		self.dirty = false;

		$(self.divid).flexEditing(true);
		
		var coldef;
		var rowheight = $("#"+self.trselected.id).height()-4;
		self.cellInputID = [];
		
		for (var i=0; i<self.colModel.length; ++i)
		{
			var coldef = self.colModel[i];
			if (coldef.type == 'M' || coldef.type == 'G')
			{
				self.cellInputID.push("");
				continue;
			}
			var id = self.trselected.id + '-col' + i;
			var table = document.createElement('table');
			var tr = document.createElement('tr');
			var td = document.createElement('td');
			var div = document.createElement('div');
			var input = document.createElement('input');
			var text = $('#'+id).text();
			var type = "text";	
			var datatype = coldef.type;
			var column = self.getColumn(i);
			
			if (datatype == 'C')
			{
				type = 'text';
			}
			else if (datatype == 'N' || datatype == 'Y')
			{
				type = 'number';
			}
			else if (datatype == 'D')
			{
				type = 'date';
				text = alltrim(text);
			}
			else if (datatype == 'T')
			{
				type = 'datetime';
			}
			else if (datatype == 'L')
			{
				type = 'checkbox';
			}

			$(table).css( "width", coldef.width+4);
			$(table).css( "height", rowheight );
			$(table).css( "max-height" , rowheight );
			$(table).css( "min-height" , rowheight );
			$(table).css( "padding", "0");
			$(table).css("border-bottom", "0");
			
			$(tr).css( "height", rowheight );
			$(tr).css( "min-height" , rowheight );
			$(tr).css( "max-height" , rowheight );
			$(tr).css("vertical-align", "middle");

			$(td).css( "height", rowheight );
			$(td).css( "min-height" , rowheight );
			$(td).css( "max-height" , rowheight );
			$(td).css( "width", "100%");
			$(td).css("vertical-align", "middle");
			
			table.cellSpacing = "0";
			table.cellPadding = "0";

			$(div).css( "height", rowheight );
			$(div).css( "min-height" , rowheight );
			$(div).css( "max-height" , rowheight );
			$(div).css( "width", "100%");
			$(div).css( "padding", 0);
			$(div).css("display", "table");
			
			$(table).append(tr);
			$(tr).append(td);
						
			$(input).css( "width", coldef.width+4);
			$(input).css( "max-width", coldef.width+4);
			$(input).css( "min-width", coldef.width+4);
			$(input).css( "height", rowheight);
			$(input).css( "min-height", rowheight);
			$(input).css("vertical-align", "middle");
			$(input).css("display", "table-cell");
			$(input).css("margin-bottom", "0");
			$(input).css("font-size", "11px");
			
			input.id = id + "-editor";
			if (type === 'checkbox') 
			{
				$("#"+id).text("");
				if (Lianja.isPhoneGap()) $(input).checkboxpicker();
				$(input).prop('checked', text == 'Yes' || text == "true");
			}
			else
			{	
				if (datatype == 'D' && text.length==0)
				{
					$("#"+id).text("");
					$(input).val(text);
				}
				else
				{
					$("#"+id).text("");
					$(input).val(text);
				}
			}
			$(input).css( "width", "100%");
			$(input).css( "padding", "0");
			$(input).data("cellindex", i);
			$("#"+id).append(table);
			$(td).append(div);
			if (!isdatetime)
			{
				$(div).append(input);
			}
			column.input = input;
			
			if (column.readonly)
			{
				$(input).attr("readonly", true);
			}

			// handle optional input mask
			var mask = column.inputmask;
			if (typeof mask !== 'undefined' && mask !== null && mask.length > 0)
			{
				Lianja.setInputMask(input, mask);
			}

			var isdatetime = type == 'datetime';
			if (!mobile && (Lianja.isChrome()||Lianja.isIE11()) && type == 'datetime')  type = 'text';
			var isdate = type == 'date';
			if (!mobile && (Lianja.isChrome()||Lianja.isIE11()) && type == 'date')  type = 'text';
			if (mobile && type === 'datetime') type = "datetime-local";
			input.type = type;
			
			if (datatype == 'D' && text.length==0)
			{
				;
			}
			else
			{
				$(input).val(text);
			}
			
			if (!mobile && !supportsdate && isdate)
			{
				if (Lianja.App.locale !== 'en')
				{
					$(input).datepicker(
					{
							format: 'yyyy-mm-dd', 
							autoclose:true,
							language:Lianja.App.locale
					})
						.on('changeDate', function(ev) {
							$(input).datepicker('hide');
					});
				}
				else
				{
					$(input).datepicker({format: 'yyyy-mm-dd', autoclose:true})
						.on('changeDate', function(ev) {
							$(input).datepicker('hide');
					});
				}
				$(input).datepicker("setValue", text);
			}
			else if (!mobile && !supportsdatetime && isdatetime)
			{
				;
			}
			else 
			{
				isdatetime = false;
			}
			if (isdatetime)
			{
				$(div).addClass("input-append date form_datetime");
				$(div).css("margin-bottom", "0");
				$(div).css("padding-right", "0");
				$(div).css("height", "24px");
				$(div).css("border-right-width", "0");
				$(td).append(div);
				$(div).append(input);
				$(div).append('<span class="add-on" style="padding:5px 5px;display:table-cell;"><i class="icon-calendar" style="display:table-cell;"></i></span>');
				$(input).data("format", "yyyy-MM-dd");
				$(input).css("border", "1px solid #ccc");
				input.type = "text";
				$(div).datetimepicker(
				{
					format: 'yyyy-MM-dd hh:mm:ss', 
					autoclose: true,
					todayBtn: true,
					pickerPosition: "bottom-left",
					position: 'left',
					language:Lianja.App.locale
				});
			}

			self.cellInputID.push(id + "-editor");
		}
	};

	//----------------------------------------------------------------------------
	this.save = function()
	{
		if (!self.editing) return;
		
		var coldef;
		var dirty = false;
		var input;
		var controlsource;
		var text;
		var checked;
		
		if (!self.setupPrimaryKey()) return;
		self.section.cursor.clearChangedValues();
		
		for (var i=0; i<self.cellInputID.length; ++i)
		{
			input = self.cellInputID[i];
			if (input.length == 0) continue;
			coldef = self.colModel[i];
			controlsource = coldef.name;
			if (coldef.type == 'L')
			{
				checked = $("#"+input).prop('checked');
				if (checked) text = "Yes";
				else text = "No";
				if (self.adding) 
				{
					self.section.cursor.setChangedValueAlways(controlsource, checked, "L");
				}
				else 
				{
					var cdirty = self.section.cursor.setChangedValue(controlsource, checked, "L");
					dirty = dirty || cdirty;
				}
				continue;
			}
			else
			{
				text = $('#'+input).val();
			}
			text = str_replace("<a>", "", text);
			text = str_replace("</a>", "", text);
			text = text.trim();
			if (self.adding) 
			{
				self.section.cursor.setChangedValueAlways(controlsource, text, coldef.type);
			}
			else 
			{
				var cdirty = self.section.cursor.setChangedValue(controlsource, text, coldef.type);
				dirty = dirty || cdirty;
			}
		}
		
		self.dirty = dirty;
		
		if (self.adding)
		{
			if (self.section.parentid.length > 0)
			{
				var parentsection = Lianja.getSection(self.section.parentid);
				var cursor = Lianja.App.getCursor(self.database, parentsection.table);
				if (typeof parentsection === 'object')
				{
					var parentkeytype = self.section.parentkeytype;
					var parentkey = cursor.getValue(self.section.parentkeyexpr);
					if (typeof parentkey !== 'undefined')
					{
						controlsource = self.section.childkeyexpr.toLowerCase();
						if (parentkeytype == 'N' || parentkeytype == 'Y')
						{
							text = parentkey;
						}
						else 
						{
							text = alltrim(parentkey);
						}
						self.section.cursor.setChangedValueAlways(controlsource, text, parentkeytype);
					}
				}
			}
			
			self.section.cursor.create(
				function (data)
				{
					self.refresh(self.trselectedid);
					Lianja.showSuccessMessage("Record was inserted");
				},
				function (jqXHR, textStatus, errorThrown)
				{
					$(self.divid).flexEditing(false);
					self.editing = false;
					self.adding = false;
					Lianja.showErrorMessage("Record could not be inserted", "Insert failed");
				}
			);
		}
		else if (dirty)
		{
			self.section.cursor.update(
				function (data)
				{
					self.refresh(self.trselectedid);
					Lianja.showSuccessMessage("Record was updated");
				},
				function (jqXHR, textStatus, errorThrown)
				{
					$(self.divid).flexEditing(false);
					self.editing = false;
					self.adding = false;
					Lianja.showErrorMessage("Record could not be updated", "Update failed");
				},
				undefined,
				true
			);
		}
		else
		{
			self.refresh(self.trselectedid);
		}
	};
	
	//----------------------------------------------------------------------------
	this.cancel = function()
	{
		self.refresh(self.trselectedid);
	};

	//----------------------------------------------------------------------------
	this.upload = function()
	{
		if (typeof LianjaAppBuilder === "object") 
		{
			bootbox.alert("File upload is not supported in development mode.");
			return;
		}
		
		if (self.isVirtualTable())
		{
			Lianja.showWarningMessage("File upload is currently not supported with VirtualTables.");
			return;
		}
		
		if (self.adding || self.editing)
		{
			Lianja.alert("You must save your changes before uploading an attachment.");
			return;
		}
		
		var attachments_field = $("#"+self.sectionid).data("lianjaAttachmentsField");
		var attachments_datefield = $("#"+self.sectionid).data("lianjaAttachmentsDatefield");
		var attachments_sizefield = $("#"+self.sectionid).data("lianjaAttachmentsSizefield");
		var childkey = "";
		if (self.section.parentid.length > 0)
		{
			var childkey = self.section.childkeyexpr.toLowerCase()+":";
			var parentsection = Lianja.getSection(self.section.parentid);
			if (typeof parentsection === 'object')
			{
				var cursor = Lianja.App.getCursor(self.database, parentsection.table);
				if (cursor !== null)
				{
					var parentkeytype = self.section.parentkeytype;
					var parentkey = cursor.getValue(self.section.parentkeyexpr);
					if (typeof parentkey !== 'undefined')
					{
						if (parentkeytype == 'C')
						{
							childkey = childkey + "C:" + alltrim(parentkey);
						}
						else if (parentkeytype == 'N')
						{
							childkey = childkey + "N:" + parentkey;
						}
						if (parentkeytype == 'D')
						{
							childkey = childkey + "D:" + alltrim(parentkey);
						}
					}
				}
			}
		}
		var controlsource = self.table + "." + attachments_field;
		var containerid = self.sectionid + "-attachmentsgrid";
		var columnlist = attachments_field + "," + attachments_datefield + "," + attachments_sizefield;
		if (childkey.length > 0) columnlist = columnlist + "," + childkey;
		var uploader = new Lianja.uploadAttachment(controlsource, columnlist, containerid, true, true,
			function() {	// success
				self.refresh();
				delete uploader;
			},	
			function() {	// error
				delete uploader;
			}	
		);
		return false;
	};
};
 
//================================================================================
window.Lianja.Column = function(pageid, sectionid, formitemid)
{
	var self = this;
	
	this.pageid = pageid;
	this.sectionid = sectionid;
	this.formitemid = formitemid;
	this.caption = "";
	this.backcolor = "";
	this.forecolor = "";
	this.controlsource = "";
	this.inputmask = "";
	this.choicelist = "";
	this.validation = "";
	this.validationerrormessage = "";
	this.readonly = false;
	this.defaultvalue = "";
	this.readonlywhen = "";
	this.visiblewhen = "";
	this.datamappingget = "";
	this.datamappingset = "";
	this.state = "";
	this.grid = null;
	this.divid = "";
	this.width = 100;
	this.type = 'C';
	this.hidden = false;

	//----------------------------------------------------------------------------
	this.init = function(divid)
	{
		self.divid = divid;
	};
};
 
//================================================================================
window.Lianja.getUserRuntimeDatabase = function(database)
{
	if (typeof LianjAppBuilder !== 'undefined') return database;
	var runtimedatabase = Lianja.App.database;
	if (typeof runtimedatabase === 'undefined' || runtimedatabase.length == 0) runtimedatabase = database;
	var tenant = Lianja.readCookieVar("LIANJAUSERDOMAIN");
	if (typeof tenant !== 'string' || tenant.length == 0) return database;
	if (tenant == 'public') return database;
	tenant = str_replace(".", "_", tenant);
	tenant = str_replace("@", "_", tenant);
	runtimedatabase = runtimedatabase + "_" + tenant;
	return runtimedatabase;
};
 
//================================================================================
window.Lianja.Database = function(database)
{
	var self = this;
	this.database = database;
	
	this.openRecordSet = function(table)
	{
		return Lianja.createCursor(self.database, table);
	};
	this.openrecordset = this.openRecordSet;
	
	this.close = function()
	{
		// does nothing in the Web client
	};
};
 
//================================================================================
window.Lianja.Cursor = function(database, table)
{
	var self = this;
	
	this.database = database.toLowerCase();
	this.table = table.toLowerCase();
	this._recno = 0;
	this._reccount = 0;
	this.nextaction = 1;
	this.filter = "";
	this.searchfilter = "";
	this.rowid = 0;
	this.refreshing = false;
	this.bof = true;
	this.eof = true;
	this.found = false;
	this.adding = false;
	this.searching = false;
	this.dirty = false;
	this.values = {};
	this.changedvalues = {};
	this.memovalues = {};
	this.imagevalues = {};
	this.url = "/odata/" + database + "/" + table;
	this.async = true;
	this.readonlycolumns = {};
	this.primarykey = "";
	this.primarykeyvalue = undefined;
	this.datatypes = undefined;
	this.refreshcurrent = false;
	this.pages = [];

	//----------------------------------------------------------------------------
	this.addPageListener = function(page)
	{
		var found = false;
		_.each(self.pages, function(p) 
		{
			if (found) return;
			if (p == page) found = true;
		});
		if (!found) self.pages.push(page);
	};
	
	//----------------------------------------------------------------------------
	this.recno = function()
	{
		return self._recno;
	};
	
	//----------------------------------------------------------------------------
	this.setRecno = function(value)
	{
		self._recno = value;
	};
	
	//----------------------------------------------------------------------------
	this.reccount = function()
	{
		return self._reccount;
	};
	
	//----------------------------------------------------------------------------
	this.expandText = function(text, quoted)
	{
		var name;
		var value;
		
		_.each(_.keys(self.values), function(key) 
		{
			name = self.table + "." + key;
			value = self.values[key];
			if (typeof value === 'string' && quoted) value = '"' + value + '"';
			text = str_replace(name, value, text);
		});
		
		return text;
	};
	
	//----------------------------------------------------------------------------
	this.setValue = function(key, value)
	{
		if (typeof value === 'undefined') value = "";
		key = key.toLowerCase();
		if (key.substring(0, self.table.length+1) == (self.table+".")) key = key.substring(self.table.length+1);
		if (typeof value === 'string') value = value.trim();
		self.values[key.replace(/\./g, "_")] = value;
		return true;
	};

	//----------------------------------------------------------------------------
	this.setData = function(key, value)
	{
		if (typeof value === 'undefined') value = "";
		key = key.toLowerCase();
		if (key.substring(0, self.table.length+1) == (self.table+".")) key = key.substring(self.table.length+1);
		if (typeof value === 'string') value = value.trim();
		self.changedvalues[key] = value;
		self.dirty = true;
		return true;
	};
	
	//----------------------------------------------------------------------------
	this.getValue = function(key)
	{
		key = key.toLowerCase();
		if (key.substring(0, self.table.length+1) == (self.table+".")) key = key.substring(self.table.length+1);
		return self.values[key.replace(/\./g, "_")];
	};
	this.getData = this.getValue;

	//----------------------------------------------------------------------------
	this.setChangedValue = function(key, value, type)
	{
		//console.log("setChangedValue() key="+key+",value="+value+",type="+type);
		
		key = key.toLowerCase();
		if (key.substring(0, self.table.length+1) == (self.table+".")) key = key.substring(self.table.length+1);
		var oldvalue = self.getValue(key);
		if (typeof oldvalue !== 'undefined' && oldvalue == value) return false;
		if (typeof type !== 'undefined')
		{
			if (type == "N" || type == "Y")
			{
				self.changedvalues[key] = parseFloat(value);
				self.dirty = true;
				return true;
			}
			else if (type == "L")
			{
				self.changedvalues[key] = value;
				self.dirty = true;
				return true;
			}
		}
		self.changedvalues[key] = value.trim();
		self.dirty = true;
		return true;
	};
	
	//----------------------------------------------------------------------------
	this.setChangedValueAlways = function(key, value, type)
	{
		key = key.toLowerCase();
		if (key.substring(0, self.table.length+1) == (self.table+".")) key = key.substring(self.table.length+1);
		if (typeof type !== 'undefined')
		{
			if (type == "N" || type == "Y")
			{
				self.changedvalues[key] = parseFloat(value);
				self.dirty = true;
				return true;
			}
			else if (type == "L")
			{
				self.changedvalues[key] = value;
				self.dirty = true;
				return true;
			}
			else if (type == "C")
			{
				value = value.trim();
			}
		}
		self.changedvalues[key] = value;
		self.dirty = true;
		return true;
	};
	
	//----------------------------------------------------------------------------
	this.getChangedValue = function(key)
	{
		return self.changedvalues[key.toLowerCase()];
	};

	//----------------------------------------------------------------------------
	this.setReadonlyColumn = function(key)
	{
		if (key.substring(0, self.table.length+1) == (self.table+".")) key = key.substring(self.table.length+1);
		self.readonlycolumns[key.toLowerCase()] = key;
	};
	
	//----------------------------------------------------------------------------
	this.isReadonly = function(key)
	{
		if (key.substring(0, self.table.length+1) == (self.table+".")) key = key.substring(self.table.length+1);
		return typeof self.readonlycolumns[key.toLowerCase()] !== 'undefined';
	};
	
	//----------------------------------------------------------------------------
	this.updateDataBuffer = function(data, uniquerowid, changed)
	{
		if (typeof data === 'undefined') return;
		var me = this;
		this.data = data;
		this.rowid = uniquerowid;
		self.setValue("__rowid", uniquerowid);
		_.each(_.keys(data), function(key) {
			self.setValue(key, me.data[key.toLowerCase()]);
			if (typeof changed === 'boolean' && changed) self.setData(key, me.data[key.toLowerCase()]);
		});
	};

	//----------------------------------------------------------------------------
	this.updateDeferredFields = function(callback)
	{
		var me = this;

		_.each(_.keys(self.memovalues), function(key) {
			var value = self.memovalues[key.toLowerCase()];
			if (value !== null)
			{
				self.memovalues[key] = null;
				Lianja.updateMemo(self.database, self.table, self.table+"."+key, value,
					function()	// success
					{
						Lianja.showSuccessMessage("Record was updated");
					}
					,
					function()	// error
					{
						Lianja.showErrorMessage("Record could not be updated", "Update failed");
					}
				);
			}
		});
		
		if (typeof callback === 'function') 
		{
			self.memovalues = {};
			callback();
		}
	};
	
	//----------------------------------------------------------------------------
	this.setMemoValue = function(key, value)
	{
		key = key.toLowerCase();
		if (key.substring(0, self.table.length+1) == (self.table+".")) key = key.substring(self.table.length+1);
		self.memovalues[key] = value.trim();
	};
	
	//----------------------------------------------------------------------------
	this.setImageValue = function(key, value)
	{
		key = key.toLowerCase();
		if (key.substring(0, self.table.length+1) == (self.table+".")) key = key.substring(self.table.length+1);
		self.imagevalues[key] = value.trim();
	};
	
	//----------------------------------------------------------------------------
	this.clearValue = function(key)
	{
		key = key.toLowerCase();
		if (key.substring(0, self.table.length+1) == (self.table+".")) key = key.substring(self.table.length+1);
		self.changedvalues[key] = "";
		self.setValue(key, "");
		self.dirty = true;
		return true;
	};
	
	//----------------------------------------------------------------------------
	this.getUrl = function()
	{
		return self.url;
	};

	//----------------------------------------------------------------------------
	this.getChangedData = function()
	{
		var data = {};
		var __olddata = {};
		var rowid = self.rowid; 
		var pkvalue;
		
		if (typeof self.primarykey !== 'undefined' && self.primarykey.length > 0) pkvalue = self.getValue(self.primarykey);
		_.each(_.keys(self.changedvalues), function(key) {
			var value = self.changedvalues[key.toLowerCase()];
			var oldvalue = self.getValue(key);
			if (oldvalue !== value) 
			{
				var pos = key.indexOf(".");
				if (pos > 0) key = key.substring(pos+1);
				// skip m.varname as they are not relevant to sql statements
				if (key.substring(0,2) !== "m.") 
				{
					nconvert = (typeof oldvalue === 'number' || typeof value === 'number');
					if (nconvert) value = parseFloat(value);
					data[key] = value;
					oldvalue = self.getValue(key);
					if (nconvert) oldvalue = parseFloat(oldvalue);
					__olddata[key] = oldvalue;
				}
			}	
		});
		
		if (typeof self.primarykey !== 'undefined' && self.primarykey.length > 0 && typeof pkvalue !== 'undefined') __olddata[self.primarykey] = pkvalue;
		
		if (typeof rowid === "undefined" || rowid === 0) 
		{
			if (typeof LianjaAppBuilder === 'object') 
			{
				rowid = Lianja.evaluate("recno('"+self.table+"')");
			}
		}
		if (typeof rowid == 'string') rowid = parseInt(rowid);
		data["__rowid"] = rowid; 		
		data["__olddata"] = __olddata;
		
		return JSON.stringify(data);
	};

	//----------------------------------------------------------------------------
	this.getChangedInsertData = function()
	{
		var data = {};
		
		_.each(_.keys(self.changedvalues), function(key) {
			var value = self.changedvalues[key.toLowerCase()];
			var pos = key.indexOf(".");
			if (pos > 0) key = key.substring(pos+1);
			// skip m.varname as they are not relevant to sql statements
			if (key.substring(0,2) !== "m." && key !== '__rowid') // && !self.isReadonly(key)) 
			{
				data[key] = value;
			}
		});
		
		return JSON.stringify(data);
	};

	//----------------------------------------------------------------------------
	this.getOldData = function()
	{
		var data = {};
		var rowid = self.getValue("__rowid");

		if (typeof rowid == "undefined") rowid = Lianja.evaluate("recno('"+self.table+"')");
		data["__rowid"] = parseInt(rowid);
		if (typeof LianjaAppBuilder == 'object') return JSON.stringify(data);
		
		_.each(_.keys(self.values), function(key) {
			var value = self.values[key.toLowerCase()];
			var pos = key.indexOf(".");
			if (pos > 0) key = key.substring(pos+1);
			// skip m.varname as they are not relevant to sql statements
			if (key.substring(0,2) !== "m.") 
			{
				data[key] = value;
			}
		});
		
		return JSON.stringify(data);
	};

	//----------------------------------------------------------------------------
	this.getRowidData = function()
	{
		var data = {};
		var rowid = self.rowid; 
		
		if (typeof self.primarykey !== 'undefined' && self.primarykey.length > 0)
		{
			data[self.primarykey] = self.getValue(self.primarykey);
			return JSON.stringify(data);
		}
		
		if (typeof rowid == "undefined" || rowid == 0) rowid = Lianja.evaluate("recno('"+self.table+"')");
		if (typeof rowid == 'string') rowid = parseInt(rowid);
		data["__rowid"] = rowid; 
		return JSON.stringify(data);
	};

	//----------------------------------------------------------------------------
	this.getReadUrl = function()
	{
		var skip = self._recno;
		if (typeof self._skipsize !== 'undefined')
		{
			skip = skip + self._skipsize;
			self._skipsize = undefined;
		}
		if (self.refreshcurrent)
		{
			skip = self._recno - 1;
		}
		if (skip <= 0) 
		{
			if (self.filter.length == 0 && self.searchfilter.length == 0) 
			{
				return self.getUrl() + "?$top=1&$rowid";
			}
			else 
			{
				var url = "";
				if (self.filter.length > 0 && self.searching) 
				{
					url = self.getUrl() + "?$top=1&$rowid" + "&$searchfilter=" + Lianja.Odata_Translate(self.filter);
				}
				else if (self.filter.length > 0) 
				{
					url = self.getUrl() + "?$top=1&$rowid" + "&$filter=" + Lianja.Odata_Translate(self.filter);
				}
				if (self.searchfilter.length > 0)
				{
					if (url.length == 0) url = self.getUrl() + "?$top=1&$rowid" + "&$filter=" + Lianja.Odata_Translate(self.searchfilter);
					else url = url + " and " + Lianja.Odata_Translate(self.searchfilter);
				}
				return url;
			}
		}
		var url = self.getUrl() + "?$top=1&$skip="+skip+"&$rowid";
		if (self.filter.length == 0 && self.searchfilter.length == 0) return url;
		
		var furl = "";
		if (self.filter.length > 0 && self.searching) 
		{
			url = url + "&$searchfilter=" + Lianja.Odata_Translate(self.filter);
		}
		else if (self.filter.length > 0) 
		{
			url = url + "&$filter=" + Lianja.Odata_Translate(self.filter);
		}
		if (self.searchfilter.length > 0)
		{
			if (self.filter.length == 0) url = url + "&$filter=" + Lianja.Odata_Translate(self.searchfilter);
			else url = url + " and " + Lianja.Odata_Translate(self.searchfilter);
		}
		
		return url;
	};
	
	//----------------------------------------------------------------------------
	this.updateCursorData = function(data, count)
	{
		var rowid = 0;
		try
		{
			rowid = data["__rowid"];
		} catch (e)
		{
			;
		}
		self._reccount = count;
		self.updateDataBuffer(data, rowid);
	};
	
	//----------------------------------------------------------------------------
	this.resetData = function(section)
	{
		var data = {};
		
		_.each(_.keys(self.values), function(key) {
			data[ key ] = "";
		});
		self.updateDataBuffer(data, 0);
	};
	
	//----------------------------------------------------------------------------
	this.clearData = function(section, callback, error_callback)
	{
		var data = {};
		
		_.each(_.keys(self.values), function(key) {
			data[ key ] = self.getValue(key);
		});
	
		if (typeof section !== 'undefined' && section.parentid.length > 0)
		{
			var parentsection = Lianja.getSection(section.parentid);
			if (typeof parentsection === 'object')
			{
				var cursor = Lianja.App.getCursor(section.page.database, parentsection.table);
				if (cursor !== null)
				{
					var parentkeytype = section.parentkeytype;
					var parentkey = cursor.getValue(section.parentkeyexpr);
					if (typeof parentkey !== 'undefined')
					{
						if (parentkeytype == 'C')
						{
							data[ section.childkeyexpr.toLowerCase() ] = alltrim(parentkey);
						}
						else if (parentkeytype == 'N')
						{
							data[ section.childkeyexpr.toLowerCase() ] = parentkey;
						}
						if (parentkeytype == 'D')
						{
							data[ section.childkeyexpr.toLowerCase() ] = alltrim(parentkey);
						}
					}
				}
			}
		}
		self.updateDataBuffer(data, data["__rowid"]);
		section.setupDefaults(callback, error_callback);
	};
	this.add = this.clearData;
	
	//----------------------------------------------------------------------------
	this.clearChangedValues = function()
	{
		self.changedvalues = {};
	};
	
	//----------------------------------------------------------------------------
	this.refresh = function(success_callback, error_callback)
	{
		self._skipsize = -1;
		var url = self.getReadUrl();
		url = str_replace("\"", "%22", url);
		//console.log(url);
		
		self.refreshing = true;
		self.dirty = false;
		self.changedvalues = {};
		self.imagevalues = {};
		
		if (self._recno == 0) self._recno = 1;

		var me = this;
		var pkt = {};
		pkt.async = typeof success_callback !== 'undefined' && self.async;
		pkt.type = "read";
		pkt.url = url;
		pkt.data = {};
		pkt.params = {};
		pkt.args = {};
		pkt.args.callbacks = success_callback;
		pkt.args.onerror = error_callback;
		pkt.success = function(data, count, args, primarykey, datatypes) 
		{
			//console.log("success count="+count);
			self.refreshing = false;
			if (typeof primarykey !== 'undefined') self.primarykey = primarykey;
			if (typeof datatypes != 'undefined') self.datatypes = datatypes;
			if (count == 0)
			{
				Lianja.showMessage("No records found");
				if (typeof LianjaAppBuilder !== 'undefined') self.updateCursorData(data, count);
				else self.updateCursorData(data[0], count);
				_.each(self.pages, function(p) 
				{
					p.searchfailed = true;
					if (p.queryform)
					{
						p.clearSections();
					}
				});
			}
			else
			{
				_.each(self.pages, function(p) 
				{
					p.searchfailed = false;
				});
				if (typeof LianjaAppBuilder !== 'undefined') self.updateCursorData(data, count);
				else self.updateCursorData(data[0], count);
			}
			data.cursor = self;
			if (typeof args.callbacks === 'array')
			{
				for (var i=0; i<args.callbacks.length; ++i)
				{
					args.callbacks[i](data);
				}
			}
			else if (typeof args.callbacks !== 'undefined')
			{
				args.callbacks(data);
			}
		};
		pkt.error = function(args) 
		{
			self.refreshing = false;
			if (typeof args.onerror !== 'undefined') 
			{
				args.onerror(args);
			}
		};
		return Lianja.OData(pkt);
	};
	this.read = this.refresh;
	this.requery = this.refresh;
	this.Read = this.refresh;

	//----------------------------------------------------------------------------
	this.search = function(section, text, success_callback, error_callback)
	{
		var searchfield = $("#"+section.page.searchkeysectionid).data("lianjaSectionSearchfield");
		var searchfieldtype = $("#"+section.page.searchkeysectionid).data("lianjaSectionSearchfieldtype");
		if (searchfieldtype === null || typeof searchfieldtype === 'undefined') searchfieldtype = 'C';
		var dpos = searchfield.indexOf(".");
		if (dpos > 0) searchfield = searchfield.substr(dpos+1);
		if (typeof self.primarykey === 'undefined') self.primarykey = "";
		
		$.pnotify_remove_all();
		
		if (text.length == 0) 
		{
			self.filter = "";
			self.searching = false;
		}
		else if (self.primarykey.length > 0)
		{
			var field = searchfield;
			var pos = field.indexOf(".");
			if (pos > 0) field = field.substr(pos+1);
			if (searchfieldtype === 'C')
			{
				self.filter = "lower(" + field.toLowerCase() + ") like '" + alltrim(text.toLowerCase()) + "{*}'";
			}
			else
			{
				self.filter = field.toLowerCase() + " eq " + text;
			}
			self.searching = true;
		}
		else 
		{
			if (searchfieldtype === 'C')
			{
				self.filter = "lower(" + searchfield.toLowerCase() + ") eq %22" + alltrim(text.toLowerCase()) + "%22";
			}
			else
			{
				self.filter = searchfield.toLowerCase() + " eq " + text;
			}
			//self.filter = searchfield.toLowerCase() + " eq %22" + alltrim(text) + "%22";
			self.searching = true;
		}
		
		self.first(success_callback, error_callback);
	};

	//----------------------------------------------------------------------------
	this.findAll = function(section, text, success_callback, error_callback)
	{
		var searchfield = $("#"+section.page.searchkeysectionid).data("lianjaSectionSearchfield");
		var searchfieldtype = $("#"+section.page.searchkeysectionid).data("lianjaSectionSearchfieldtype");
		if (searchfieldtype === null || typeof searchfieldtype === 'undefined') searchfieldtype = 'C';
		if (typeof self.primarykey === 'undefined') self.primarykey = "";
		
		$.pnotify_remove_all();
		
		var items = text.split("||");
		var value = "";
		
		if (self.primarykey.length > 0)
		{
			var field = searchfield;
			var pos = field.indexOf(".");
			if (pos > 0) field = field.substr(pos+1);
			for (var i=0; i<items.length; ++i)
			{
				if (items[i].length == 0) break;
				text = items[i];
				if (value.length > 0) value = value + " or ";
				if (searchfieldtype === 'C')
				{
					value = value + "lower(" + field.toLowerCase() + ") like '" + alltrim(text.toLowerCase()) + "{*}'";
				}
				else
				{
					value = value + field.toLowerCase() + " eq " + alltrim(text);
				}
			}
		}
		else
		{
			for (var i=0; i<items.length; ++i)
			{
				if (items[i].length == 0) break;
				text = items[i];
				if (value.length > 0) value = value + " or ";
				if (searchfieldtype === 'C')
				{
					value = value + searchfield.toLowerCase() + " eq %22" + alltrim(text) + "%22";
				}
				else
				{
					value = value + searchfield.toLowerCase() + " eq " + alltrim(text);
				}
				self.searching = true;
			}
		}
		self.filter = value;
		if (value.length > 0)
		{
			self.first(success_callback, error_callback);
		}
	};

	//----------------------------------------------------------------------------
	this.setFilter = function(text)
	{
		$.pnotify_remove_all();
		self.filter = text;
	};

	//----------------------------------------------------------------------------
	this.setSearchFilter = function(text)
	{
		$.pnotify_remove_all();
		self.searchfilter = text;
		self._recno = 0;
	};

	//----------------------------------------------------------------------------
	this.first = function(success_callback, error_callback)
	{
		self._recno = 1;
		return self.refresh(success_callback, error_callback);
	};
	this.moveFirst = this.first;
	this.movefirst = this.first;

	//----------------------------------------------------------------------------
	this.previous = function(success_callback, error_callback)
	{
		self._recno -= 1;
		return self.refresh(success_callback, error_callback);
	};
	this.movePrevious = this.previous;
	this.moveprevious = this.previous;

	//----------------------------------------------------------------------------
	this.next = function(success_callback, error_callback)
	{
		if (self._recno == 0) self._recno = 1;
		self._recno += 1;
		return self.refresh(success_callback, error_callback);
	};
	this.moveNext = this.next;
	this.movenext = this.next;

	//----------------------------------------------------------------------------
	this.last = function(success_callback, error_callback)
	{
		self._recno = self._reccount;
		return self.refresh(success_callback, error_callback);
	};
	this.moveLast = this.last;
	this.movelast = this.last;

	//----------------------------------------------------------------------------
	this.fetch = function(recno, success_callback, error_callback)
	{
		if (recno > self._reccount)
		{
			self._reccount++;
			self.last(success_callback, error_callback);
			return;
		}
		
		self._recno = recno;
		return self.refresh(success_callback, error_callback);
	};
	this.read = this.fetch;
	this.moveBookmark = this.fetch;
	this.movebookmark = this.fetch;

	//----------------------------------------------------------------------------
	this.create = function(onsuccess, onerror, args)
	{
		if (typeof args === 'undefined') args = {};
		args.callbacks = onsuccess;
		
		var pkt = {};
		pkt.async = false;
		pkt.type = "create";
		pkt.url = self.getUrl();
		pkt.data = self.getChangedInsertData();
		pkt.params = {};
		pkt.args = args;
		pkt.success = function(data, count, args) 
		{
			data.cursor = self;
			if (typeof args.callbacks === 'array')
			{
				for (var i=0; i<args.callbacks; ++i)
				{
					args.callbacks[i](data, args);
				}
			}
			else if (typeof args.callbacks !== 'undefined')
			{
				args.callbacks(data, args);
			}
		};
		pkt.error = onerror;
		return Lianja.OData(pkt);
	};
	this.insert = this.create;
	this.Create = this.create;

	//----------------------------------------------------------------------------
	this.update = function(onsuccess, onerror, args, norefresh)
	{
		if (!self.dirty) return true;
		if (typeof args === 'undefined') args = {};
		args.callbacks = onsuccess;
		args.norefresh = norefresh;
		
		var pkt = {};
		pkt.async = false;
		pkt.type = "update";
		pkt.url = self.getUrl();
		pkt.data = self.getChangedData();
		pkt.params = {};
		pkt.args = args;
		pkt.success = function(data, count, args) 
		{
			if (typeof args.callbacks === 'array')
			{
				for (var i=0; i<args.callbacks; ++i)
				{
					args.callbacks[i](data, args);
				}
			}
			else if (typeof args.callbacks !== 'undefined')
			{
				args.callbacks(data, args);
			}
			//if (typeof args.norefresh === 'undefined') self.refresh();
		};
		
		pkt.error = onerror;
		return Lianja.OData(pkt);
	};
	this.Update = this.update;

	//----------------------------------------------------------------------------
	this._delete = function(onsuccess, onerror, args)
	{
		if (typeof args === 'undefined') args = {};
		args.callbacks = onsuccess;

		var pkt = {};
		pkt.async = false;
		pkt.type = "delete";
		pkt.url = self.getUrl();
		pkt.data = self.getRowidData();
		pkt.params = {};
		pkt.args = args;
		pkt.success = function(data, count, args) 
		{
			if (typeof args.callbacks === 'array')
			{
				for (var i=0; i<args.callbacks; ++i)
				{
					args.callbacks[i](data);
				}
			}
			else if (typeof args.callbacks !== 'undefined')
			{
				args.callbacks(data);
			}
		};
		pkt.error = onerror;
		return Lianja.OData(pkt);
	};
	this.Delete = this._delete;

	//----------------------------------------------------------------------------
	this.deleteFilter = function(filter, onsuccess, onerror, args)
	{
		if (typeof args === 'undefined') args = {};
		args.callbacks = onsuccess;

		var pkt = {};
		pkt.async = false;
		pkt.type = "delete";
		pkt.url = self.getUrl() + "?$filter="+filter;
		pkt.data = {};
		pkt.params = {};
		pkt.args = args;
		pkt.success = function(data, count, args) 
		{
			if (typeof args.callbacks === 'array')
			{
				for (var i=0; i<args.callbacks; ++i)
				{
					args.callbacks[i](data);
				}
			}
			else if (typeof args.callbacks !== 'undefined')
			{
				args.callbacks(data);
			}
		};
		pkt.error = onerror;
		return Lianja.OData(pkt);
	};	
};

//================================================================================
window.Lianja.refreshPage = function(pageid, allsections, onsuccess, onerror)
{
	if (typeof LianjaAppBuilder !== 'object')
	{
		Lianja.cloudserver.refreshPage(pageid, allsections, onsuccess, onerror);
		return;
	}
	
	if (pageid[0] != '#') pageid = "#" + pageid;
	var pagediv = $(pageid);
	var sectionlist = pagediv.data("lianjaPageSectionlist");
	var pagetype = pagediv.data("lianjaPageType");
	var sections = sectionlist.split(",");
	var page = Lianja.App.getPage(pageid.substr(1));
	var count;
	var section;
	var sectionid;

	//console.log("sectionlist="+sectionlist);
	
	page.dirty = false;
	page.editing = false;
	page.adding = false;
	page.refreshcnt = 0;

	for (var i=0; i<page.getSectionCount(); ++i)
	{
		section = page.getSection(i);
		section.refreshcnt = 0;
	}
	
	if (typeof page.searchkeysectionid !== 'string' || page.searchkeysectionid.length == 0)
	{
		allsections = true;
	}
	
	if (allsections)
	{
		_.each(sections, function(section) {
			Lianja.refreshSection(section, undefined, undefined, undefined, true);
		});
		page.firstrefresh = false;
	}
	else if (typeof page.searchkeysectionid === "string")
	{
		Lianja.refreshSection(page.searchkeysectionid);
		if (!page.refreshed)
		{
			page.refreshed = true;
			for (var i=0; i<page.getSectionCount(); ++i)
			{
				section = page.getSection(i);
				if (section.id == page.searchkeysectionid) continue;
				if (section.parentid == null) section.parentid = "";
				if (section.parentid.length > 0) continue;
				Lianja.refreshSection(section.pageid+"-"+section.id);
			}
			page.firstrefresh = false;
		}
	}
	
	Lianja.refreshPageHeader(pageid);
	Lianja.refreshPageFooter(pageid);
	Lianja.refreshRightSideBar(pageid);
	
	page.dirty = false;
	page.editing = false;
	page.adding = false;
};

//================================================================================
window.Lianja.refreshPageContents = function(pageid, allsections)
{
	/*
	if (typeof LianjaAppBuilder !== 'object')
	{
		Lianja.cloudserver.refreshPage(pageid, allsections, onsuccess, onerror);
		return;
	}
	*/
	if (pageid[0] != '#') pageid = "#" + pageid;
	var pagediv = $(pageid);
	var sectionlist = pagediv.data("lianjaPageSectionlist");
	var pagetype = pagediv.data("lianjaPageType");
	var sections = sectionlist.split(",");
	var page = Lianja.App.getPage(pageid.substr(1));
	var count;
	var section;
	var sectionid;

	page.dirty = false;
	page.editing = false;
	page.adding = false;
	page.firstrefresh = true;
	page.refreshcnt = 0;

	if (!allsections)
	{
		for (var i=0; i<page.getSectionCount(); ++i)
		{
			section = page.getSection(i);
			if (!section.queryform) section.txcount = page.txcount;
		}
	}

	for (var i=0; i<page.getSectionCount(); ++i)
	{
		section = page.getSection(i);
		section.refreshcnt = 0;
	}
	
	if (typeof page.searchkeysectionid !== 'string' || page.searchkeysectionid.length == 0)
	{
		allsections = true;
	}
	
	if (allsections)
	{
		_.each(sections, function(section) {
			Lianja.refreshSection(section, undefined, undefined, undefined, true);
		});
		page.firstrefresh = false;
	}
	else if (typeof page.searchkeysectionid === "string")
	{
		Lianja.refreshSection(page.searchkeysectionid);
		if (!page.refreshed)
		{
			page.refreshed = true;
			for (var i=0; i<page.getSectionCount(); ++i)
			{
				section = page.getSection(i);
				if (section.id == page.searchkeysectionid) continue;
				if (section.parentid == null) section.parentid = "";
				if (section.parentid.length > 0) continue;
				Lianja.refreshSection(section.pageid+"-"+section.id);
			}
			page.firstrefresh = false;
		}
	}
	
	Lianja.refreshPageHeader(pageid);
	Lianja.refreshPageFooter(pageid);
	Lianja.refreshRightSideBar(pageid);
	
	page.dirty = false;
	page.editing = false;
	page.adding = false;
	page.addRecentlyViewed();
};

//================================================================================
window.Lianja.refreshPageHeader = function(pageid)
{
	var page = Lianja.App.getPage(pageid);
	page.refreshPageHeader();
};

//================================================================================
window.Lianja.refreshPageFooter = function(pageid)
{
};

//================================================================================
window.Lianja.refreshSectionHeader = function(sectionid)
{
	var list = sectionid.split("-");
	var pageid = list[0];
	var sectionid = list[1];
	var page = Lianja.App.getPage(pageid);
	var section = page.getSection(sectionid);
	section.refreshHeader();
};

//================================================================================
window.Lianja.refreshSectionFooter = function(sectionid)
{
	var list = sectionid.split("-");
	var pageid = list[0];
	var sectionid = list[1];
	var page = Lianja.App.getPage(pageid);
	var section = page.getSection(sectionid);
	section.refreshFooter();
};


//================================================================================
window.Lianja.paginateWebViewSection = function(sectionid, pagenumber, pagesize)
{
	if (sectionid.length == 0) return;
	var key = sectionid.replace(/-/g, "_");
	var value = Lianja.datamap[key.toLowerCase()];
	var $section = $("#"+sectionid);
	var section = Lianja.getSection(sectionid);
	var page = section.page;

	var pos = value.indexOf(":");
	var type = value.substr(0,pos);
	var url = value.substr(pos+1);
	var id = key; 
	
	url = url + "&pagenumber="+pagenumber;
	if (typeof pagesize !== 'undefined') url = url + "&pagesize="+pagesize;
	Lianja.refreshComponent(type, url, id, false, false);
	section.dirty = false;	
};

//================================================================================
window.Lianja.refreshSection = function(sectionid, onsuccess, onerror, always, firstrefresh)
{
	if (sectionid.length == 0) return;
	var key = sectionid.replace(/-/g, "_");
	var value = Lianja.datamap[key.toLowerCase()];
	var $section = $("#"+sectionid);
	var section = Lianja.getSection(sectionid);
	var page = section.page;
	
	if (section.type === 'pagecenter' && !section.firstrefresh) 
	{
		console.log("refreshSection() skipped");
		return;
	}
	
	section.firstrefresh = false;
	/*
	if (page.refreshcnt !== section.refreshcnt) 
	{
		console.log("page.refreshcnt !== section.refreshcnt");
		return;
	}
	*/
	
	section.refreshcnt += 1;
	
	if (typeof firstrefresh !== 'undefined' && firstrefresh && !page.firstrefresh)
	{
		if (typeof section != 'undefined' && section.type !== 'calendar')
		{
			if (typeof section.parentid !== 'undefined' && section.parentid != null && section.parentid.length > 0)
			{
				section.dirty = false;
				if (typeof onsuccess === 'function') onsuccess();
				return;
			}
		}
	}
	
	if (typeof value === "undefined") 
	{
		if (typeof $section == "undefined") return;
		section = Lianja.getSection(sectionid);
		section.refresh(onsuccess, onerror);
		section.dirty = false;
		return;
	}
	
	var pos = value.indexOf(":");
	var type = value.substr(0,pos);
	var url = value.substr(pos+1);
	var id = key; 

	Lianja.refreshComponent(type, url, sectionid, page.editing, page.adding, onsuccess, onerror, sectionid);
	Lianja.refreshSectionChildren(sectionid);
	Lianja.refreshSectionHeader(sectionid);
	Lianja.refreshSectionFooter(sectionid);
	section.dirty = false;
};

//================================================================================
window.Lianja.getSection = function(sectionid)
{
	sectionid = sectionid.replace(".", "-");
	var page = Lianja.App.getPage(sectionid.substr(0, sectionid.indexOf("-")));
	var section = page.getSection(sectionid.substr(sectionid.indexOf("-")+1));
	return section;
};

//================================================================================
window.Lianja.searchFailed = function(sectionid)
{
	if (sectionid.length == 0) return false;
	var page = Lianja.App.getPage(sectionid.substr(0, sectionid.indexOf("-")));
	return page.searchfailed;
};
	
//================================================================================
window.Lianja.refreshSectionChildren = function(sectionid, always)
{
	if (sectionid.length == 0) return;
	var page = Lianja.App.getPage(sectionid.substr(0, sectionid.indexOf("-")));
	var section = page.getSection(sectionid.substr(sectionid.indexOf("-")+1));
	var count = section.getChildCount();
	var i;
	var psection;

	//console.log("refreshSectionChildren("+sectionid+") section.refreshing="+section.refreshing);
	
	if (section.refreshing) return;
	
	section.refreshing = true;
	
	if (count == 0)
	{
		var childlist = $("#"+sectionid).data("lianjaSectionChildlist");
		if (typeof childlist !== 'undefined' && childlist !== null && childlist.length > 0) section.setChildSections(childlist);
		count = section.getChildCount();
		if (count == 0)
		{
			// no children but we need to update all sections of the same table
			for (i=0; i<page.getSectionCount(); ++i)
			{
				psection = page.getSection(i);
				if (psection == section 
						|| (typeof psection.refreshing !== 'undefined' && psection.refreshing) 
						|| section.table === null || typeof section.table === 'undefined' || section.table.length == 0
						|| psection.table === null || typeof psection.table === 'undefined' || psection.table.length == 0) continue;
				if (psection.type !== 'form' && psection.type !== 'canvas' && psection.type !== 'custom') continue;
				if (section.table.toLowerCase() == psection.table.toLowerCase())
				{
					psection.refreshing = true;
					psection.cursor.refreshcurrent = true;
					Lianja.refreshSection(psection.sectionid, undefined, undefined, always);
					//psection.cursor.refreshcurrent = false;
					//psection.refreshing = false;
				}
			}
		}
	}
	
	for (var i=0; i<count; ++i)
	{
		sectionid = section.getChildID(i);
		psection = page.getSection(sectionid.substr(sectionid.indexOf("-")+1));
		if (section.table != null 
			&& psection.table != null 
			&& typeof section.table !== 'undefined'
			&& typeof psection.table !== 'undefined'
			&& (section.table.toLowerCase() == psection.table.toLowerCase()))
		{
			psection.refreshing = true;
			psection.cursor.refreshcurrent = true;
			Lianja.refreshSection(psection.sectionid, undefined, undefined, always);
			//psection.cursor.refreshcurrent = false;
			//psection.refreshing = false;
		}
		else
		{
			psection.cursor.refreshcurrent = true;
			Lianja.refreshSection(sectionid, undefined, undefined, always);
			psection.cursor.refreshcurrent = false;
		}
	}

	//section.refreshing = false;
	Lianja.hideLoadingIcon();
};

//================================================================================
window.Lianja.blankSectionChildren = function(sectionid, blank)
{
	if (sectionid.length == 0) return;
	var page = Lianja.App.getPage(sectionid.substr(0, sectionid.indexOf("-")));
	var section = page.getSection(sectionid.substr(sectionid.indexOf("-")+1));
	var count = section.getChildCount();
	var i;
	var psection;
	
	if (count == 0)
	{
		var childlist = $("#"+sectionid).data("lianjaSectionChildlist");
		if (typeof childlist !== 'undefined' && childlist !== null && childlist.length > 0) section.setChildSections(childlist);
		count = section.getChildCount();
		if (count == 0)
		{
			// no children but we need to update all sections of the same table
			for (i=0; i<page.getSectionCount(); ++i)
			{
				psection = page.getSection(i);
				psection.blank = blank;
			}
		}
	}
	
	for (var i=0; i<count; ++i)
	{
		sectionid = section.getChildID(i);
		psection = page.getSection(sectionid.substr(sectionid.indexOf("-")+1));
		psection.blank = blank;
	}
	
	page.searchfailed = false;
};

//================================================================================
window.Lianja.clearGridSection = function(sectionid, canupload)
{
	var self = this;
	this.pageid = sectionid.substr(0, sectionid.indexOf("-"));
	var prop = $("#"+sectionid+"-gridcontainer").data("lianjaGridProperties");
	if (prop === 'undefined')
	{
		prop = $("#"+sectionid+"-gridcontainer").data("lianjagridproperties");
		if (prop === 'undefined') prop = $("#"+sectionid+"-gridcontainer").data("lianja-Grid-Properties");
		if (prop === 'undefined') prop = $("#"+sectionid+"-gridcontainer").attr("data-lianja-Grid-Properties");
	}
	if (prop === null)
	{
		return;
	}
	if (typeof prop === 'undefined')
	{
		return;
	}
	var readonly = $("#"+sectionid+"-gridcontainer").data("lianjaReadonly");
	if (typeof readonly === 'undefined') readonly = false;
	this.readonly = readonly;
	this.gridproperties = prop.split("|");
	this.columns = [];
	this.page = Lianja.App.getPage(sectionid.substr(0, sectionid.indexOf("-")));
	this.section = this.page.getSection(sectionid.substr(sectionid.indexOf("-")+1));
	this.containerid = "#"+sectionid+"-gridcontainer";
	this.container = false;
	this.containerTypes = false;
	this.containerWidths = false;
	this.index = false;
	
	if (self.section.grid == null)
	{
		var widths;
		self.container = $(self.containerid);
		widths = ""+self.container.data("lianjaGridColumnWidths");
		if (widths.indexOf(",") >= 0)
		{
			self.containerTypes = self.container.data("lianjaGridColumnTypes").split(",");
			self.containerWidths = self.container.data("lianjaGridColumnWidths").split(",");
		}
		else
		{
			self.containerTypes = [];
			self.containerTypes.push(self.container.data("lianjaGridColumnTypes"));
			self.containerWidths = [];
			self.containerWidths.push(self.container.data("lianjaGridColumnWidths"));
		}
		self.index = 0;
		
		self.section.grid = new Lianja.Grid(self.pageid, sectionid, "", canupload);
		_.each(self.gridproperties, function(proplist) {
			var columnprop = proplist.split("@=");
			var column = new Lianja.Column(self.pageid, self.sectionid, "");
			column.init(self.containerid);
			column.caption = columnprop[0];
			column.backcolor = columnprop[1];
			column.forecolor = columnprop[2];
			column.controlsource = columnprop[3];
			column.inputmask = columnprop[4];
			column.choicelist = columnprop[5];
			column.validation = columnprop[6];
			column.validationerrormessage = columnprop[7];
			column.readonly = columnprop[8] == "true";
			if (Lianja.isExpression(column.controlsource)) column.readonly = true;
			column.defaultvalue = columnprop[9];
			column.readonlywhen = columnprop[10];
			column.datamappingget = columnprop[11];
			column.datamappingset = columnprop[12];
			column.state = columnprop[13];
			column.type = self.containerTypes[self.index];
			column.width = parseInt(self.containerWidths[self.index]);
			if (columnprop.length > 24) 
			{
				column.hyperlink = columnprop[24] == "true";
				column.hyperlinkdelegate = self.section.grid.hyperlinkdelegate;
			}
			else 
			{
				column.hyperlink = false;
				column.hyperlinkdelegate = "";
			}
			if (columnprop.length > 36) 
			{
				column.hidden = columnprop[36] == "hidden:true";
			}
			else
			{
				column.hidden = false;
			}
			self.columns.push(column);
			self.index += 1;
		});
		self.section.grid.section = self.section;
		self.section.grid.columns = self.columns;
		self.section.grid.init(self.containerid);
	}
	
	self.section.grid.clear();
};

//================================================================================
window.Lianja.refreshGridSection = function(sectionid, hasattachments, parentid, parentkeytype, parentkeyexpr, childkeyexpr, canupload, onsuccess, onerror, args)
{
	var self = this;
	this.pageid = sectionid.substr(0, sectionid.indexOf("-"));
	var prop = $("#"+sectionid+"-gridcontainer").data("lianjaGridProperties");
	if (prop === 'undefined')
	{
		prop = $("#"+sectionid+"-gridcontainer").data("lianjagridproperties");
		if (prop === 'undefined') prop = $("#"+sectionid+"-gridcontainer").data("lianja-Grid-Properties");
		if (prop === 'undefined') prop = $("#"+sectionid+"-gridcontainer").attr("data-lianja-Grid-Properties");
	}
	if (prop === null)
	{
		return;
	}
	if (typeof prop === 'undefined')
	{
		return;
	}
	var readonly = $("#"+sectionid+"-gridcontainer").data("lianjaReadonly");
	if (typeof readonly === 'undefined') readonly = false;
	this.readonly = readonly;
	this.gridproperties = prop.split("|");
	this.columns = [];
	this.page = Lianja.App.getPage(sectionid.substr(0, sectionid.indexOf("-")));
	this.section = this.page.getSection(sectionid.substr(sectionid.indexOf("-")+1));
	this.containerid = "#"+sectionid+"-gridcontainer";
	this.container = false;
	this.containerTypes = false;
	this.containerWidths = false;
	this.index = false;
	self.section.refreshing = false;
	
	if (self.section.grid == null)
	{
		var widths;
		self.container = $(self.containerid);
		widths = ""+self.container.data("lianjaGridColumnWidths");
		if (widths.indexOf(",") >= 0)
		{
			self.containerTypes = self.container.data("lianjaGridColumnTypes").split(",");
			self.containerWidths = self.container.data("lianjaGridColumnWidths").split(",");
		}
		else
		{
			self.containerTypes = [];
			self.containerTypes.push(self.container.data("lianjaGridColumnTypes"));
			self.containerWidths = [];
			self.containerWidths.push(self.container.data("lianjaGridColumnWidths"));
		}
		self.index = 0;
		
		self.section.grid = new Lianja.Grid(self.pageid, sectionid, "", canupload);
		_.each(self.gridproperties, function(proplist) {
			var columnprop = proplist.split("@=");
			var column = new Lianja.Column(self.pageid, self.sectionid, "");
			column.init(self.containerid);
			column.caption = columnprop[0];
			column.backcolor = columnprop[1];
			column.forecolor = columnprop[2];
			column.controlsource = columnprop[3];
			column.inputmask = columnprop[4];
			column.choicelist = columnprop[5];
			column.validation = columnprop[6];
			column.validationerrormessage = columnprop[7];
			column.readonly = columnprop[8] == "true";
			if (Lianja.isExpression(column.controlsource)) column.readonly = true;
			column.defaultvalue = columnprop[9];
			column.readonlywhen = columnprop[10];
			column.datamappingget = columnprop[11];
			column.datamappingset = columnprop[12];
			column.state = columnprop[13];
			column.type = self.containerTypes[self.index];
			column.width = parseInt(self.containerWidths[self.index]);
			if (columnprop.length > 24) 
			{
				column.hyperlink = columnprop[24] == "true";
				column.hyperlinkdelegate = self.section.grid.hyperlinkdelegate;
			}
			else 
			{
				column.hyperlink = false;
				column.hyperlinkdelegate = "";
			}
			if (columnprop.length > 36) 
			{
				column.hidden = columnprop[36] == "hidden:true";
			}
			else
			{
				column.hidden = false;
			}
			self.columns.push(column);
			self.index += 1;
		});
		self.section.grid.section = self.section;
		self.section.grid.columns = self.columns;
		self.section.grid.init(self.containerid);
	}
	
	self.section.grid.refresh(undefined, onsuccess, onerror, args);
};

//================================================================================
window.Lianja.refreshTabViewSection = function(pageid, sectionid, tabviewsectionlist)
{
	sectionid = sectionid.replace(/_/g, "-");
	var page = Lianja.App.getPage(pageid);
	var section = page.getSection(sectionid.substr(sectionid.indexOf("-")+1));
	var sections = tabviewsectionlist.split(",");

	_.each(sections, function(id) {
		var section = page.getTabSection(id);
		if (typeof section !== 'undefined') section.refresh();
	});
};

//================================================================================
window.Lianja.refreshCanvasSection = function(sectionid)
{
	if (sectionid.length == 0) return;
	var page = Lianja.App.getPage(sectionid.substr(0, sectionid.indexOf("-")));
	var section = page.getSection(sectionid.substr(sectionid.indexOf("-")+1));
	_.each(section.canvasobjects, function(obj) {
		obj.refresh();
		obj.relayout();
	});
};

//================================================================================
window.Lianja.relayoutSections = function()
{
	var count = Lianja.App.getPageCount();
	var page;
	var section;
	var i,j;
	var scount;
	
	for (i=0; i<count; ++i)
	{
		page = Lianja.App.getPage(i);
		scount = page.getSectionCount();	
		for (j=0; j<scount; ++j)
		{
			section = page.getSection(j);
			if (section.type === "canvas" || section.type === 'custom') 
			{
				_.each(section.canvasobjects, function(obj) {
					obj.relayout();
				});
			}
		}		
	}
};

//================================================================================
window.Lianja.refreshFormSection = function(sectionid, blank)
{
	var self = this;
	this.formitemlist = $("#"+sectionid).data("lianjaSectionFormitemlist");
	if (typeof this.formitemlist === "undefined" || this.formitemlist === null) 
	{
		return;
	}
	this.formitems = this.formitemlist.split(",");
	this.section = Lianja.getSection(sectionid);
	this.page = this.section.page;
	if (typeof blank === 'undefined') blank = false;
	
	if (typeof this.section.cursor !== 'undefined')
	{
		this.section.cursor.primarykey = this.section.primarykey;
	}
	
	_.each(this.formitems, function(formitemid) {
		var formitemtype;
		var element = $("#"+formitemid);
		formitemtype = element.data("lianjaFormitemType");
		if (typeof formitemtype === "undefined" || formitemtype == null)
		{
			element = $("#"+formitemid+"-content");
			formitemtype = element.data("lianjaFormitemType");
		}
		if (typeof formitemtype === "undefined")
		{
			;
		}
		else
		{
			if (formitemtype === "field")
			{
				Lianja.refreshField(self.section, formitemid, blank);
				return;
			}
			if (formitemtype === "checklistview")
			{
				Lianja.refreshCheckListView(self.section, formitemid);
				return;
			}
			if (formitemtype === "webview")
			{
				Lianja.refreshWebView(formitemid, self.page.adding||blank);
				return;
			}
			if (formitemtype === "image")
			{
				Lianja.refreshImage(self.section, formitemid, self.page.adding||blank);
				return;
			}
			if (formitemtype === "memo")
			{
				Lianja.refreshMemo(self.section, formitemid, false, self.page.adding||blank);
				return;
			}
			if (formitemtype === "gadget")
			{
				Lianja.refreshGadget(sectionid, formitemid);
				return;
			}
			if (formitemtype === "editbox")
			{
				Lianja.refreshGadget(sectionid, formitemid);
				return;
			}
			if (formitemtype === "richtexteditor")
			{
				Lianja.refreshGadget(sectionid, formitemid);
				return;
			}
		}
	});
	
	this.section.dirty = false;
	if (this.section.cursor !== null && typeof LianjaAppBuilder !== 'undefined')
	{
		var rowid = Lianja.evaluate("recno('"+this.section.table+"')");
		this.section.cursor.setValue("__rowid", rowid);
	}
};

//================================================================================
window.Lianja.refreshGadget = function(sectionid, formitemid)
{
	var self = this;
	var element = $("#"+formitemid);
	this.section = Lianja.getSection(sectionid);
	this.page = this.section.page;
	
	//console.log("refreshGadget()");
	formitemtype = element.data("lianjaFormitemType");
	
	if (typeof formitemtype === "undefined" || formitemtype == null)
	{
		element = $("#"+formitemid+"-content");
		formitemtype = element.data("lianjaFormitemType");
	}
	if (typeof formitemtype === "undefined")
	{
		;
	}
	else
	{
		if (formitemtype === "webview")
		{
			Lianja.refreshWebView(formitemid, self.page.adding);
			return;
		}
		if (formitemtype === "image")
		{
			Lianja.refreshImage(self.section, formitemid, self.page.adding);
			return;
		}
		if (formitemtype === "memo")
		{
			Lianja.refreshMemo(self.section, formitemid, false, self.page.adding);
			return;
		}
		if (formitemtype === "richtexteditor")
		{
			Lianja.refreshMemo(self.section, formitemid, false, self.page.adding);
			return;
		}
		if (formitemtype === "editbox")
		{
			Lianja.refreshMemo(self.section, formitemid, false, self.page.adding);
			return;
		}
	}
};

//================================================================================
window.Lianja.isExpression = function(controlsource)
{
	return controlsource.indexOf("(") >= 0 ||
		   controlsource.indexOf("+") >= 0 ||
		   controlsource.indexOf("-") >= 0 ||
		   controlsource.indexOf("*") >= 0 ||
		   controlsource.indexOf("/") >= 0;
};


//================================================================================
window.Lianja.refreshField = function(section, id, blank)
{
	var controlsource = $("#"+id).data("lianjaControlsource");
	if (typeof controlsource === 'undefined') return;
	
	this._refreshField = function(id, text)
	{
		var mask = $("#"+id).data("lianjaInputmask");
		if (typeof mask !== 'undefined' && mask !== null)
		{
			$("#"+id).html( transform(text, mask) );			}
		else
		{
			$("#"+id).html( text );
		}
		//$("#"+id).html(result);
	};
	
	if (typeof LianjaAppBuilder === "object")
	{
		var bool = false;
		var bresult = false;
		var result = LianjaAppBuilder.evaluate(controlsource);
		if (typeof result === 'boolean')
		{
			bool = true;
			if (result) 
			{
				result = "Yes";
				bresult = true;
			}
			else 
			{
				bresult = false;
				result = "No";
			}
		}
		else if (typeof result === 'string')
		{
			if (result == "true") 
			{
				bool = true;
				bresult = true;
				result = "Yes";
			}
			else if (result == "false") 
			{
				bool = true;
				bresult = false;
				result = "No";
			}
		}
		
		result = result.toString().trim();
		if ($("#"+id).hasClass("ui-lianja-hyperlink"))
		{
			$("#"+id).html("<a>" + result + "</a>");
		}
		else
		{
			//$("#"+id).html(result);
			this._refreshField(id, result);
		}
		if (bool) result = bresult;
		if (typeof blank === 'boolean' && blank) result = "";
		section.cursor.setValue(controlsource, result);
		section.cursor.setChangedValue(controlsource, result);
	}
	else
	{
		var result;
		if (Lianja.isExpression(controlsource))
		{
			try
			{
				var result = eval(controlsource);
				if ($("#"+id).hasClass("ui-lianja-hyperlink"))
				{
					result = "<a>" + result + "</a>";
				}
				//$("#"+id).html(result);
				this._refreshField(id, result);
			} 
			catch(e) 
			{
				result = Lianja.evaluate(controlsource); 
				if ($("#"+id).hasClass("ui-lianja-hyperlink"))
				{
					result = "<a>" + result + "</a>";
				}
				//$("#"+id).html(result);
				this._refreshField(id, result);
			}
			return;
		}
		result = section.cursor.getValue(controlsource);
		if (typeof result === 'undefined') result = "";
		if (typeof result === 'boolean') 
		{
			section.cursor.setChangedValue(controlsource, result, "L");
			if (result) result = "Yes";
			else result = "No";
		}
		else
		{
			section.cursor.setChangedValue(controlsource, result);
		}
		if ($("#"+id).hasClass("ui-lianja-hyperlink"))
		{
			result = "<a>" + result + "</a>";
		}
		if (typeof blank === 'boolean' && blank) result = "";
		//$("#"+id).html(result);
		this._refreshField(id, result);
	}
};

//================================================================================
window.Lianja.refreshCheckListView = function(section, id)
{
	formitemid = id.replace(/-/g, ".");
	formitemid = formitemid.replace(/_/g, ".");
	var formitem = Lianja.get(formitemid);
	var controlsource = $("#"+id).data("lianjaControlsource");
	if (typeof controlsource === 'undefined') return;
	
	if (typeof LianjaAppBuilder === "object")
	{
		var result = LianjaAppBuilder.evaluate(controlsource);
		result = result.toString();
		formitem.value = result;
		section.cursor.setValue(controlsource, result);
		section.cursor.setChangedValue(controlsource, result);
	}
	else
	{
		var result;
		if (Lianja.isExpression(controlsource))
		{
			try
			{
				var result = eval(controlsource);
				formitem.value = result;
			} 
			catch(e) 
			{
				result = Lianja.evaluate(controlsource); 
				formitem.value = result;
			}
			return;
		}
		result = section.cursor.getValue(controlsource);
		if (typeof result !== 'string') result = "";
		section.cursor.setChangedValue(controlsource, result);
		formitem.value = result;
	}
};

//================================================================================
window.Lianja.refreshWebViewGadget = function(id)
{
	var key = id.replace(/-/g, "_");
	var value = Lianja.datamap[key.toLowerCase()];
	if (typeof value === "undefined" || value === null) 
	{
		return;
	}
	
	var pos = value.indexOf(":");
	var type = value.substr(0,pos);
	var url = value.substr(pos+1);
	var id = key; 
	Lianja.refreshComponent(type, url, id, false);
};

//================================================================================
window.Lianja.refreshWebViewSection = function(section, id, requrl)
{
	//console.log("refreshWebViewSection()");
	var key = id.replace(/-/g, "_");
	var value = Lianja.datamap[key.toLowerCase()];
	if (typeof value === "undefined") 
	{
		return;
	}
	
	var pos = value.indexOf(":");
	var type = value.substr(0,pos);
	var url = value.substr(pos+1);
	var id = key; 
	if (typeof requrl !== 'undefined' && requrl.length > 0) url = requrl;
	Lianja.refreshComponent(type, url, id, false, false);
};

//================================================================================
window.Lianja.refreshWebView = function(id, adding, requrl)
{
	var key = id.replace(/-/g, "_");
	var value = Lianja.datamap[key.toLowerCase()];
	if (typeof value === "undefined") 
	{
		return;
	}
	
	//console.log("refreshWebView() id="+id);
	var pos = value.indexOf(":");
	var type = value.substr(0,pos);
	var url = value.substr(pos+1);
	var id = key; 
	if (typeof requrl !== 'undefined' && requrl.length > 0) url = requrl;
	//console.log("refreshWebView() url="+url);
	Lianja.refreshComponent(type, url, id, false, adding);
};

//================================================================================
window.Lianja.refreshImage = function(section, id, adding)
{
	//console.log("refreshImage");
	var key = id.replace(/-/g, "_");
	var value = Lianja.datamap[key.toLowerCase()];
	if (typeof value === "undefined") 
	{
		return;
	}
	
	var pos = value.indexOf(":");
	var type = value.substr(0,pos);
	var url = value.substr(pos+1);
	var id = key; 
	Lianja.refreshComponent(type, url, id, false, adding);
};

//================================================================================
window.Lianja.refreshMemo = function(section, id, editing, adding)
{
	var key = id.replace(/-/g, "_");
	var value = Lianja.datamap[key.toLowerCase()];
	if (typeof value === "undefined") 
	{
		return;
	}
	
	var pos = value.indexOf(":");
	var type = value.substr(0,pos);
	var url = value.substr(pos+1);
	var id = key; 
	
	Lianja.refreshComponent(type, url, id, editing, adding);
};

//================================================================================
window.Lianja.saveMemo = function(section, id)
{
	var key = id.replace(/-/g, "_");
	var value = Lianja.datamap[key.toLowerCase()];
	if (typeof value === "undefined") 
	{
		return;
	}
	
	var pos = value.indexOf(":");
	var type = value.substr(0,pos);
	var controlsource = value.substr(pos+1);
	var id = key.replace(/_/g, "-"); 
	var text = Lianja.getMemoEditorText(section, id+"-content");
	
	if (typeof text === 'string')
	{
		var oldtext = Lianja.App.getMemoBuffer(id+"-content");
		if (typeof oldtext === 'string' && oldtext === text) 
		{
			return;
		}
		if (Lianja.App.getControlSourceSaved(controlsource)) return;
		Lianja.App.setMemoBuffer(id+"-content", text);
		Lianja.App.setControlSourceSaved(controlsource);
		section.updateMemo(controlsource, text);
	}
};

//================================================================================
window.Lianja.saveEditBox = function(section, id)
{
	var key = id.replace(/-/g, "_");
	var value = Lianja.datamap[key.toLowerCase()];
	if (typeof value === "undefined") 
	{
		return;
	}
	
	var pos = value.indexOf(":");
	var type = value.substr(0,pos);
	var controlsource = value.substr(pos+1);
	var id = key.replace(/_/g, "-"); 
	var text = $("#"+id+"-content").val();
	if (Lianja.App.getControlSourceSaved(controlsource)) return;
	if (typeof text === 'string')
	{
		var oldtext = Lianja.App.getMemoBuffer(id+"-content");
		if (typeof oldtext === 'string' && oldtext === text) return;
		Lianja.App.setMemoBuffer(id+"-content", text);
		Lianja.App.setControlSourceSaved(controlsource);
		section.updateMemo(controlsource, text);
	}
};

//================================================================================
window.Lianja.setFilter = function(pageid, label, color, filter)
{
	var page = Lianja.App.getPage(pageid);
	page.setInstantSelection(label, color);
	page.searchtext = "";
	$("#"+pageid+"-searchbox").val("");
	Lianja.performPageAction(pageid, "filter", filter);
};

//================================================================================
window.Lianja.setSearchFilter = function(sectionid, filter)
{
	if (sectionid.indexOf("-")<0&&sectionid.indexOf(".")<0) sectionid = Lianja.App.currentpageid + "-" + sectionid;

	Lianja.performSectionAction(sectionid, "searchfilter", filter);
};

//================================================================================
window.Lianja.applySearchFilter = function(divid)
{
	var items = $("#"+divid).find(".ui-lianja-searchpanelitem");
	var names = [];
	var ops = [];
	var types = [];
	var values = [];
	var index = 0;
	var dpos;

	if (typeof LianjaAppBuilder === 'object')
	{
		Lianja.resetSearchFilter(divid);
		Lianja.showMessage("Search panels are only supported in 'Preview' mode");
		return;
	}
	
	_.each(items, function(item) {
		if (item.tagName === 'SELECT') return;
		if (item.tagName === 'INPUT') value = $(item).val();
		else value = $(item).text();
		if (item.tagName === 'TD') 
		{	
			value = $(item).data("lianjaControlsource");
			dpos = value.indexOf(".");
			if (dpos > 0) value = value.substr(dpos+1);
			names.push(value);
		}
		else if (item.tagName === 'SPAN') 
		{
			ops.push(value);
		}
		else if (item.tagName === 'INPUT') 
		{
			values.push(value);
			types.push(item.type);
		}
	});
	
	index = 0;
	_.each(ops, function(op) {
		if (op === 'is equal to') ops[index] = " eq ";
		else if (op === 'is not equal to') ops[index] = " ne ";
		else if (op === 'is less than') ops[index] = " lt ";
		else if (op === 'is less or equal to') ops[index] = " le ";
		else if (op === 'is greater than') ops[index] = " gt ";
		else if (op === 'is greater or equal to') ops[index] = " ge ";
		else if (op === 'contains') ops[index] = " $ ";
		++index;
	});
	
	var filter = "";
	var term;
	for (var i=0; i<names.length; ++i)
	{
		if (values[i].length == 0) continue;
		if (types[i] == 'text') term = "lower("+names[i]+")" + ops[i] + "'" + str_escape(values[i].toLowerCase()) + "'";
		//if (types[i] == 'text') term = names[i] + ops[i] + "'" + str_escape(values[i]) + "'";
		else term = names[i] + ops[i] + values[i];
		if (filter.length > 0) filter = filter + " and ";
		filter = filter + term;
	}
	
	if (filter.length == 0) return;
	var sectionid = divid.substr(0, divid.length-("-searchpanel").length);
	//console.log("filter="+filter);
	Lianja.performSectionAction(sectionid, "searchfilter", filter);
	Lianja.showDocument("page:"+Lianja.App.currentpageid+"?action=refresh");
};

//================================================================================
window.Lianja.resetSearchFilter = function(divid)
{
	var items = $("#"+divid).find(".ui-lianja-searchpanelitem");
	var names = [];
	var ops = [];
	var types = [];
	var values = [];
	var index = 0;

	_.each(items, function(item) {
		if (item.tagName === 'INPUT') 
		{
			$(item).val("");
		}
	});
	
	var sectionid = divid.substr(0, divid.length-("-searchpanel").length);
	Lianja.performSectionAction(sectionid, "searchfilter", "");
	Lianja.showDocument("page:"+Lianja.App.currentpageid+"?action=refresh");
};

//================================================================================
window.Lianja.closeSearchPanel = function(divid)
{
	//console.log("closeSearchPanel() divid="+divid);
};

//================================================================================
window.Lianja.search = function(pageid, text)
{
	if (text == "*")
	{
		var key = Lianja.App.name + "_" + pageid + "_favorites";
		key = key.toLowerCase();
		var keys = window.localStorage.getItem(key);
		if (typeof keys === 'undefined' || keys == null) keys = "";
		var filter = keys;
		if (filter.length == 0) return; 
		Lianja.setFilter(pageid, "Favorites", "orange", "@@"+filter);
	}
	else
	{
		$("#"+pageid+"-searchbox").val(text);
		Lianja.onSearchChanged(pageid);
	}
};

//================================================================================
window.Lianja.onSearchChanged = function(pageid)
{
	var text = $("#"+pageid+"-searchbox").val();
	var page = Lianja.App.getPage(pageid);
	if (page.searchtext == text) return;
	page.setInstantSelection(text, "#08c");
	page.searchtext = text;
	Lianja.performPageAction(pageid, "search", text);
	
	$(".ui-input-clear").on("click", function(event) {
		Lianja.resetSearch();
	});
	
	$('.ui-input-clear').on('tap', function (event) {
		Lianja.resetSearch();
	});
};
 
//================================================================================
window.Lianja.resetSearch = function(pageid)
{
	if (typeof pageid === 'undefined') pageid = Lianja.App.currentpageid;
	var page = Lianja.App.getPage(pageid);
	if (typeof pageid === 'undefined' || page === null) return;
	if (page.searchtext.length == 0) return;
	page.searchtext = "";
	page.instantselection = "";
	$("#"+pageid+"-searchbox").val("");
	Lianja.performPageAction(pageid, "search", "");
};
 
//================================================================================
window.Lianja.clearSearch = function(pageid)
{
	if (typeof pageid === 'undefined') pageid = Lianja.App.currentpageid;
	var page = Lianja.App.getPage(pageid);
	if (typeof pageid === 'undefined' || page === null) return;
	page.searchtext = "";
	page.instantselection = "";
	$("#"+pageid+"-searchbox").val("");
	Lianja.performPageAction(pageid, "search", "");
};
 
//================================================================================
var loading_interval_timer = null;
window.Lianja.showLoadingIcon = function()
{
	if (typeof $.mobile === 'undefined') return;
    clearInterval(loading_interval_timer);
	loading_interval_timer = setInterval(function(){
		$.mobile.showPageLoadingMsg("a", "Loading...");
        clearInterval(loading_interval_timer);
    },500);    	
};
 
//================================================================================
window.Lianja.hideLoadingIcon = function()
{
	if (typeof $.mobile === 'undefined') return;
    if (loading_interval_timer === null) return;
	clearInterval(loading_interval_timer);
	loading_interval_timer = null;
	$.mobile.loading('hide');
};
  
//================================================================================
window.Lianja.showNotification = function(text, title, icon)
{
	var msg = Lianja.App.getMessage();
	if (msg == text) return;
	var myicon;
	var mytitle;
	if (typeof icon === 'undefined') myicon = 'icon-envelope';
	else myicon = icon;
	if (typeof title === 'undefined') mytitle = 'Message';
	else mytitle = title;
	
	function after_close(p)
	{
		Lianja.App.setMessage("");
		return true;
	}
	
	Lianja.App.setMessage(text);
	$.pnotify({ history:false, title: mytitle, text: text, icon: myicon, after_close: after_close } );
};
window.Lianja.shownotification = window.Lianja.showNotification;

//================================================================================
window.Lianja.loadContentIntoIframe = function(frame, targeturl)
{
	Lianja.getUrl(targeturl, {frame: frame}, function(status, text, args) {
		if (status)
		{
			var frame = args.frame;
			var doc = frame[0].contentDocument;
			if (doc === null) return;
			text = str_replace("library:/", "../../../library/", text);
			text = str_replace("lib:/", "../../../library/", text);
			doc.open();
			doc.write("<head><script>window.Lianja = window.parent.Lianja;</script></head>" + text);
			doc.close();
		}
		else
		{
			//console.log("status="+status);
			$(args.frame).attr("src", targeturl);
		}
	});
	
};

//================================================================================
window.Lianja.showPagesMenu = function()
{
	if (typeof Lianja.App.currentpageid !== 'string') return;
	var element = Lianja.App.currentpageid.toLowerCase() + "_navigationburgermenubutton"; 
	$("#"+element).click();
};

//================================================================================
window.Lianja.showDialog = function(title, filename, width, height, buttons, ontop, modal, action, text, resizable, onok, oncancel)
{
	// BM: jqm popup is buggy
	return Lianja.showDialogPanel(title, filename, width, action, text, onok, oncancel, !buttons);
	
	if (typeof Lianja.App.currentpageid !== 'string') return;
	var pageid = Lianja.App.currentpageid; 
	
	//console.log("showDialog() pageid="+pageid);

	try
	{
		$( "#LianjaPopupDialog-"+pageid ).popup( "destroy" );
	}
	catch (e)
	{
	}
	
	if (typeof LianjaAppBuilder !== 'undefined')
	{
		Lianja.showMessage("Dialogs are not active in Web/Mobile/Phone App views. Use 'Preview' to test them.");
		return;
	}
	
	if (Lianja.isPhoneGap() && Lianja.App.targetui === "phone")
	{
		width = 320;
		height = 320;
	}

	if (typeof buttons !== 'boolean') buttons = false;
	if (typeof title !== 'string') title = "";
	if (title.length > 0) 
	{
		$("#LianjaPopupDialogHeader-"+pageid).html(title);
	}
	else
	{
		$("#LianjaPopupDialogHeaderContainer-"+pageid).hide();
	}
	
	if (typeof filename === 'function')
	{
		var obj = filename.call();
		if (typeof obj === 'object')
		{
			$("#LianjaPopupDialogContent-"+pageid).html("");
			$("#LianjaPopupDialogContent-"+pageid).append(obj.element);
		}
	}
	else if (typeof filename === 'string')
	{
		if (filename.indexOf("(")>0)
		{
			var obj = eval(filename);
			if (typeof obj === 'object')
			{
				$("#LianjaPopupDialogContent-"+pageid).html("");
				$("#LianjaPopupDialogContent-"+pageid).append(obj.element);
			}
		}
		else if (filename.indexOf(".rsp") > 0 ||
			filename.indexOf(".jssp") > 0 ||
			filename.indexOf(".html") > 0 ||
			filename.indexOf(".php") > 0 ||
			filename.indexOf(".asp") > 0 ||
			filename.indexOf(".aspx") > 0)
		{
			filename = str_replace("lib:/", "../../../library/", filename);
			var iframe = $("<iframe width='100%' height='100%' frameborder='0'/>");
			if (filename.indexOf("lib:/") == 0) filename = "../../library" + filename.substr(4);
			$("#LianjaPopupDialogContent-"+pageid).html("");
			$("#LianjaPopupDialogContent-"+pageid).append(iframe);
			if (filename.indexOf("{") < 0)
			{
				Lianja.loadContentIntoIframe(iframe, filename);
			}
			else
			{
				Lianja.expandMacros("", "", filename, 
					function(filename, args)
					{
						Lianja.loadContentIntoIframe(args.iframe, filename);
					},
					{ "iframe": iframe},
					""
				);
			}	
		}
	}
	if (buttons)
	{
		$("#LianjaPopupDialogButtonGroup-"+pageid).show();
		$( "#LianjaPopupDialogDoneBtn-"+pageid ).data("onok", undefined);
		$( "#LianjaPopupDialogCancelBtn-"+pageid ).data("oncancel", undefined);
		if (typeof onok === 'function')
		{
			$( "#LianjaPopupDialogDoneBtn-"+pageid ).data("onok", onok);
		}
		if (typeof oncancel === 'function')
		{
			$( "#LianjaPopupDialogCancelBtn-"+pageid ).data("oncancel", oncancel);
		}
	}
	else
	{
		$("#LianjaPopupDialogButtonGroup-"+pageid).hide();
	}
	
	if (typeof width === 'undefined') width = 500;
	//$( "#LianjaPopupDialog-"+pageid ).css("padding", "5px");
	$( "#LianjaPopupDialog-"+pageid ).find(".ui-icon").css("margin", "7px 7px 7px 7px");
	$( "#LianjaPopupDialog-"+pageid ).width(width+"px");
	if (typeof height !== 'undefined') $( "#LianjaPopupDialog-"+pageid ).height(height+"px");
	if (!buttons) $("#LianjaPopupDialogContent-"+pageid).css("bottom", "0");
	if (title.length == 0) $("#LianjaPopupDialogContent-"+pageid).css("top", "0");

	$( "#LianjaPopupDialog-"+pageid ).popup( { history: false } );
	//$( "#LianjaPopupDialog-"+pageid ).trigger( "updatelayout" );
	$( "#LianjaPopupDialog-"+pageid ).popup( "open" );
	//$( "#LianjaPopupDialog-"+pageid ).on( "panelbeforeclose", function( event, ui ) { $("body").focus(); } );
};
 
//================================================================================
window.Lianja.hideDialog = function(btn)
{
	if (typeof LianjaAppBuilder !== 'undefined') 
	{
		LianjaAppBuilder.hideDialog();
		return;
	}
	if (typeof Lianja.App.currentpageid !== 'string') return;
	var pageid = Lianja.App.currentpageid; 
	var callback = $(btn).data("oncancel");
	if (typeof callback === 'function') callback();
	$( "#LianjaPopupDialog-"+pageid ).popup( "close" );
	$( "#LianjaPopupDialog-"+pageid ).popup( "destroy" );
	$("#LianjaPopupDialogContent-"+pageid).html("");
};
 
//================================================================================
window.Lianja.applyDialog = function(btn)
{
	var callback = $(btn).data("onok");
	Lianja.hideDialog();
	if (typeof callback === 'function') callback();
};
 
//================================================================================
window.Lianja.showDialogPanel = function(title, filename, width, action, text, onok, oncancel, hidebuttons)
{
	if (typeof Lianja.App.currentpageid !== 'string') return;
	if (typeof LianjaAppBuilder !== 'undefined')
	{
		Lianja.showMessage("Dialog Panels are not active in Web/Mobile/Phone App views. Use 'Preview' to test them.");
		return;
	}

	if (Lianja.isPhoneGap() && Lianja.App.targetui === "phone") width = "100%";
	
	var pageid = Lianja.App.currentpageid; 
	var position = "";
	
	if (typeof width == 'string' && width == '100%')
	{
		width = 0;
	}
	
	if (typeof width !== 'undefined')
	{
		if (width < 0)
		{
			width = -width;
			position = "Left";
		}
	}
	var id = "#LianjaDialogPanel" + position;
	
	if (typeof title === 'string') $(id + "Header-"+pageid).html(title);
	
	if (typeof filename === 'function')
	{
		var obj = filename.call();
		if (typeof obj === 'object')
		{
			$(id + "Content-"+pageid).html("");
			$(id + "Content-"+pageid).append(obj.element);
		}
	}
	else if (typeof filename === 'string')
	{
		if (filename.indexOf("(")>0)
		{
			var obj = eval(filename);
			if (typeof obj === 'object')
			{
				$(id + "Content-"+pageid).html("");
				$(id + "Content-"+pageid).append(obj.element);
			}
		}
		else if (filename.indexOf(".rsp") > 0 ||
			filename.indexOf(".jssp") > 0 ||
			filename.indexOf(".html") > 0 ||
			filename.indexOf(".php") > 0 ||
			filename.indexOf(".asp") > 0 ||
			filename.indexOf(".aspx") > 0)
		{
			filename = str_replace("lib:/", "../../../library/", filename);
			var iframe = $("<iframe style='width:100%;height:100%;' frameborder='0'/>");
			if (filename.indexOf("lib:/") == 0) filename = "../../library" + filename.substr(4);
			$(id + "Content-"+pageid).html("");
			$(id + "Content-"+pageid).append(iframe);
			if (filename.indexOf("{") < 0)
			{
				Lianja.loadContentIntoIframe(iframe, filename);
			}
			else
			{
				Lianja.expandMacros("", "", filename, 
					function(filename, args)
					{
						Lianja.loadContentIntoIframe(args.iframe, filename);
					},
					{ "iframe": iframe},
					""
				);
			}	
		}
	}
	else if (typeof filename === 'object')
	{
		$(id + "Content-"+pageid).html("");
		$(id + "Content-"+pageid).append(filename);
		hidebuttons = 0;
	}

	if (typeof hidebuttons == 'number' && hidebuttons>0) 
	{
		$(id + "ButtonGroup-"+pageid).hide();
		$(id + "Content-"+pageid).css("bottom", "0px");
	}
	
	if (title.length == 0)
	{
		$(id + "Header-"+pageid).hide();
		$(id + "Content-"+pageid).css("top", "0px");
	}

	$( id + "DoneBtn-"+pageid ).data("onok", undefined);
	$( id + "CancelBtn-"+pageid ).data("oncancel", undefined);
	if (typeof onok === 'function')
	{
		$( id + "DoneBtn-"+pageid ).data("onok", onok);
	}
	if (typeof oncancel === 'function')
	{
		$( id + "CancelBtn-"+pageid ).data("oncancel", oncancel);
	}

	if (typeof width === 'undefined') width = 300; 
	
	$( id + "-" +pageid ).css("padding", "5px");
	if (width == 0) 
	{
		$( id + "-" +pageid ).width("100%");
		$( id + "-" +pageid ).css("padding", "5px 0px 5px 0px");
	}
	else
	{
		$( id + "-" +pageid ).width(width+"px");
		$( id + "-" +pageid ).css("padding", "5px");
	}
	
	//$( id + "-" +pageid).css("display", "block");
	//$( id + "-" +pageid ).panel();
	$( id + "-" +pageid ).trigger( "updatelayout" );
	$( id + "-" +pageid ).panel( "open" );
	
	// we need to adjust size of the dismiss-open div so that we can click inside the panel
	if (width == 0)
	{
		$( ".ui-panel-dismiss-open").hide();
	}
	else if (position == "Left") 
	{
		width += 10;
		$( ".ui-panel-dismiss-open").css("left", width+"px");
		$( ".ui-panel-dismiss-open").css("width", "auto");
	}
	else 
	{
		width += 10;
		$( ".ui-panel-dismiss-open").css("right", width+"px");
		$( ".ui-panel-dismiss-open").css("width", "auto");
	}
		
	$( id + "-" +pageid ).on( "panelbeforeclose", 
		function( event, ui ) 
		{
			if (typeof Lianja.App.activegrid !== 'undefined')
			{
				var grid = Lianja.App.activegrid;
				Lianja.App.activegrid = undefined;
				grid.cancel();
			}
		}
	);

	Lianja.App.dialogpanelid = id;
	Lianja.App.dialogpanelpageid = pageid;

	$( id + "-" +pageid ).on( "panelclose", 
		function( event, ui ) 
		{
			$(Lianja.App.dialogpanelid + "Content-"+Lianja.App.dialogpanelpageid).html("");
			//$(Lianja.App.dialogpanelid + "-" + Lianja.App.dialogpanelpageid).css("display", "none");
		}
	);
};
 
//================================================================================
window.Lianja.hideDialogPanel = function(btn)
{
	if (typeof LianjaAppBuilder !== 'undefined') 
	{
		LianjaAppBuilder.hideDialogPanel();
		return;
	}
	//if (typeof Lianja.App.currentpageid !== 'string') return;
	var pageid = Lianja.App.dialogpanelpageid; 
	var callback = $(btn).data("oncancel");
	if (typeof callback === 'function') callback();
	$( Lianja.App.dialogpanelid + "-"+Lianja.App.dialogpanelpageid ).panel( "close" );
};
 
//================================================================================
window.Lianja.applyDialogPanel = function(btn)
{
	var callback = $(btn).data("onok");
	if (typeof callback === 'function') callback();
	Lianja.hideDialogPanel();
};

//================================================================================
window.Lianja.beep = function()
{
	if (Lianja.App.phonegap)
	{
		navigator.notification.beep(1);
	}
	else
	{
		try 
		{
			var snd = new Audio("data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
			snd.play();
		} 
		catch(e)
		{
		};
	}
};
 
//================================================================================
window.Lianja.vibrate = function(secs)
{
	var msecs;
	
	if (typeof secs === 'undefined') msecs = 500;
	else msecs = secs * 1000;
	if (Lianja.App.phonegap)
	{
		navigator.notification.vibrate(msecs);
	}
	else
	{
		Lianja.beep(secs);
	}
};
 
//================================================================================
window.Lianja.getPicture = function(cameraSuccess, cameraError, cameraOptions )
{
	if (Lianja.App.phonegap)
	{
		if (typeof cameraOptions === 'undefined')
		{
			Lianja.chooseImageSource(function(btn)
			{
				var source;
				//console.log("btn="+btn);
				if (btn === 2)
				{
					source = navigator.camera.PictureSourceType.SAVEDPHOTOALBUM;
					cameraOptions = {quality: 100, allowEdit: false, encodingType: navigator.camera.EncodingType.JPEG, correctOrientation: true, destinationType : navigator.camera.DestinationType.FILE_URI, targetWidth: 640, targetHeight: 480, sourceType: source, targetWidth:360, targetHeight:360};
				}
				else 
				{
					source = navigator.camera.PictureSourceType.CAMERA;
					cameraOptions = {quality: 100, allowEdit: false, encodingType: navigator.camera.EncodingType.JPEG, correctOrientation: true, destinationType : navigator.camera.DestinationType.FILE_URI, targetWidth: 640, targetHeight: 480, sourceType: source, targetWidth:360, targetHeight:360};
				}
				navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
			});
		}
		else
		{
			navigator.camera.getPicture(cameraSuccess, cameraError, cameraOptions);
		}
	}
	else
	{
		Lianja.alert("This operation is only supported on a Mobile device.");
	}
};
 
//================================================================================
window.Lianja.getConnection = function()
{
	if (!Lianja.App.phonegap)
	{
		Lianja.alert("This operation is only supported on a Mobile device.");
		return;
	}
    var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';
	return states[networkState];
};
	
//================================================================================
window.Lianja.isConnected = function()
{
	if (!Lianja.App.phonegap)
	{
		return true;
	}
    var networkState = navigator.connection.type;
	return networkState != Connection.NONE;
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';
	return states[networkState] !== 'No network connection';
};
	
//================================================================================
window.Lianja.getCurrentPosition = function(onsuccess, onerror)
{
	var position = { coords: {'lattitude':0.000, 'longitude':0.000}, 'accuracy':0, 'altitude': 0.000, 'altitudeAccuracy':0, 'heading':0.000};
	
	if (typeof LianjaAppBuilder === 'object')
	{
		if (typeof onsuccess === 'function')
		{
			onsuccess(position);
		}
	}

	if (navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(onsuccess, onerror);
	}
	else
	{
		console.error("Geolocation is not supported by this browser.");
	}
};

//================================================================================
window.Lianja.getCurrentAcceleration = function(onsuccess, onerror)
{
	if (!Lianja.App.phonegap)
	{
		Lianja.alert("This operation is only supported on a Mobile device.");
		return;
	}

	navigator.accelerometer.getCurrentAcceleration(onsuccess, onerror);
};

//================================================================================
window.Lianja.showMessage = function(text, title, icon)
{
	var msg = Lianja.App.getMessage();
	text = "" + text;
	if (msg == text) return;
	var myicon;
	var mytitle;
	if (typeof title === 'undefined') mytitle = 'Information';
	else mytitle = title;
	if (typeof icon === 'undefined') myicon = 'icon-info-sign';
	else myicon = icon;
	
	function after_close(p)
	{
		Lianja.App.setMessage("");
		return true;
	}
	
	Lianja.App.setMessage(text);
	$.pnotify({ history:false, title: mytitle, text: text, icon: myicon, type: 'info', after_close: after_close } );
};
window.Lianja.showmessage = window.Lianja.showMessage;
 
//================================================================================
window.Lianja.showWarningMessage = function(text)
{
	Lianja.showNotification(text, "Warning", "icon-warning-sign");
};

//================================================================================
window.Lianja.showSuccessMessage = function(text, title)
{
	var msg = Lianja.App.getMessage();
	text = "" + text;
	if (msg == text) return;
	var mytitle;
	if (typeof title === 'undefined') mytitle = 'Success';
	else mytitle = title;
	
	function after_close(p)
	{
		Lianja.App.setMessage("");
		return true;
	}
	
	Lianja.App.setMessage(text);
	$.pnotify({ history:false, title: mytitle, text: text, type: 'success', after_close: after_close });
};
 
//================================================================================
window.Lianja.showErrorMessage = function(text, title)
{
	var msg = Lianja.App.getMessage();
	text = "" + text;
	if (msg == text) return;
	var mytitle;
	if (typeof title === 'undefined') mytitle = 'Failed';
	else mytitle = title;
	
	function after_close(p)
	{
		Lianja.App.setMessage("");
		return true;
	}
	
	Lianja.App.setMessage(text);
	$.pnotify({ history:false, title: mytitle, text: text, type: 'error', after_close: after_close });
};
 
//================================================================================
window.Lianja.navigate = function(url)
{
	if (typeof Lianja.App !== 'undefined') url = Lianja.App.getFullPathUrl(url);
	window.location.href = url;
};


//================================================================================
window.Lianja.loadIframes = function()
{
	var map = Lianja.iframemap;
	
	for (var key in map) 
	{
		key = key.toLowerCase();
		var value = Lianja.iframemap[key];
		if (typeof value === "undefined") return;
		var pos = value.indexOf(":");
		var type = value.substr(0,pos);
		var url = value.substr(pos+1);
		Lianja.refreshComponent(type, url, key, false, false);
	}
};


//================================================================================
window.Lianja.initPhoneGapStatusBar = function()
{
	if (typeof StatusBar === 'undefined') 
	{
		return;
	}
	if (Lianja.App.statusbarsetup)
	{
		return;
	}
	Lianja.App.statusbarsetup = true;
	if (Lianja.App.fullscreen && !Lianja.App.liveview)
	{
		StatusBar.hide();
		return;
	}
	
	if ((Lianja.mobiledevice.Android() != null && Lianja.mobiledevice.Android() ) || Lianja.App.liveview)
	{
		StatusBar.backgroundColorByName("black");
		StatusBar.overlaysWebView(true);
		$(".ui-grid-lianja-pageheader").each(function() {
			$(this).css("height", "40px");
		});
		
		$(".ui-lianja-pageheader-item").each(function() {
			$(this).css("position", "relative");
			$(this).css("top", "0px");
		});

		$(".ui-lianja-pageheader-item-right").each(function() {
			$(this).css("top", "0px");
		});

		$(".ui-lianja-pageheader-item-top").each(function() {
			$(this).css("top", "43px");
		});

		$(".ui-panel-content63").each( function() { 
			$(this).css("top", "43px");
		});	

		$(".ui-panel-content20").each( function() { 
			$(this).css("top", "0px");
		});	
		return;
	}
	
	StatusBar.backgroundColorByName("black");
	StatusBar.overlaysWebView(true);
	
	$(".ui-grid-lianja-pageheader").each(function() {
		$(this).css("height", "60px");
	});
	
	$(".ui-lianja-pageheader-item").each(function() {
		$(this).css("position", "relative");
		$(this).css("top", "20px");
	});

	$(".ui-lianja-pageheader-item-right").each(function() {
		$(this).css("top", "20px");
	});

	$(".ui-lianja-pageheader-item-top").each(function() {
		$(this).css("top", "63px");
	});

	$(".ui-panel-content63").each( function() { 
		$(this).css("top", "63px");
	});	

	$(".ui-panel-content20").each( function() { 
		$(this).css("top", "20px");
	});	
	
};


//================================================================================
window.Lianja.updateLoginPanel = function()
{
	var user = Lianja.readCookieVar("LIANJAUSER");
	if (typeof LianjaAppBuilder !== 'undefined') user = "admin";
	else if (typeof user === 'undefined' || user === null || user.length === 0) user = "guest";
	$(".ui-lianja-loginuser").each(function() {
		$(this).html("Logged in as "+user);
	});
};

	
//================================================================================
window.Lianja.setProperty = function(id, property, value)
{
	return false;
};
	
//================================================================================
window.Lianja.getProperty = function(id, property)
{
	return false;
};
	
//================================================================================
window.Lianja.callMethod = function(id, method)
{
	if (method == "hide")
	{
		$(id).hide();
		return true;
	}
	
	if (method == "show")
	{
		$(id).show();
		return true;
	}
	
	if (method == "hideaccordionsection")
	{
		$(id).hide();
		$(id).listview("refresh");
		return true;
	}

	if (method == "showaccordionsection")
	{
		$(id).show();
		$(id).listview("refresh");
		return true;
	}

	if (method == "expand")
	{
		$(id).trigger("expand");
	}
	
	if (method == "collapse")
	{
		$(id).trigger("collapse");
	}
	
	return false;
};
	

//================================================================================
window.Lianja.performPageAction = function(id, action, arg)
{
	var self = this;
	var pageid = id;
	
	//console.log("performPageAction() id="+id+", action="+action);
	
	if (pageid[0] == '#') pageid = pageid.substr(1);
	var page = Lianja.App.getPage(pageid);
	if (typeof page === 'undefined')
	{
		console.log("page "+pageid+" is undefined. action="+action);
		return;
	}
	++page.txcount;
	page.action = true;
	
	var transitiontype = Lianja.pagetransitionmap[pageid.toLowerCase()];
	if (typeof transitiontype === 'undefined' || !Lianja.App.animationsenabled) transitiontype = "none";
	else transitiontype = transitiontype.toLowerCase();
	
	// BM: work around bug in iOS 9
	if (Lianja.isPhoneGap() && device.platform === 'iOS' && parseInt(device.version) === 9) transitiontype = "none";

	if (action[0] != "_") $.pnotify_remove_all();
	
	// need to have a valid HTML ID tag to look up
	id = id.replace(/\./g, "-");
	
	if (action == "show" || action.length == 0)
	{
		if (!Lianja.resetEditors(id)) return false;
		if (typeof Lianja.App.currentpageid === 'string' && Lianja.App.currentpageid !== id && Lianja.App.currentpageid.length > 0) 
		{
			Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "deactivate"); 
		}
		$.mobile.changePage(id, { transition: transitiontype } );
		Lianja.enableNavigationButtons();
		Lianja.showNavigationPanel(id);
		if (typeof Lianja.App.currentpageid === 'string' && Lianja.App.currentpageid !== id) 
		{
			Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "activate"); 
		}
		Lianja.App.setCurrentPageID(id);
		Lianja.refreshPage(id, false);
		page.loaded = true;
		return true;
	}
	
	if (action == "refresh")
	{
		Lianja.hideLoadingIcon();
		if (page.editing || page.adding) return;
		if (!Lianja.resetEditors(id)) return;
		Lianja.refreshPage(id, false);
		Lianja.enableNavigationButtons();
		if (Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "refresh")) return true; 
		return true;
	}
	
	if (id[0] == '#') id = id.substr(1);

	if (action == "add")
	{
		if (!page.checkCreatePermission())
		{
			Lianja.showMessage("You do not have permission to perform this operation");
			return;
		}
		if (page.editing || page.adding) 
		{
			Lianja.showWarningMessage("Please Save or Cancel editing first");
			return;
		}
		if (!Lianja.resetEditors(id)) return false;
		if (Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "add")) return true; 
		if (typeof LianjaAppBuilder === "object")
		{
			LianjaAppBuilder.performPageAction(id.replace(/-/g, "."), action);
			Lianja.editPage(true, id, true);
			LianjaAppBuilder.performPageAction(id.replace(/-/g, "."), "cancel");
			Lianja.setNavigationButtonEnabled("add", false);
			Lianja.setNavigationButtonEnabled("delete", false);
			Lianja.setNavigationButtonEnabled("refresh", false);
			Lianja.setNavigationButtonEnabled("first", false);
			Lianja.setNavigationButtonEnabled("previous", false);
			Lianja.setNavigationButtonEnabled("next", false);
			Lianja.setNavigationButtonEnabled("last", false);
			Lianja.setNavigationButtonEnabled("edit", false);
			Lianja.setNavigationButtonEnabled("save", true);
			Lianja.setNavigationButtonEnabled("cancel", true);
			return true;
		}
		else
		{
			Lianja.cloudserver.performPageAction(id.replace(/-/g, "."), "add", function(status) {
				Lianja.editPage(true, id, true);
				Lianja.setNavigationButtonEnabled("add", false);
				Lianja.setNavigationButtonEnabled("delete", false);
				Lianja.setNavigationButtonEnabled("refresh", false);
				Lianja.setNavigationButtonEnabled("first", false);
				Lianja.setNavigationButtonEnabled("previous", false);
				Lianja.setNavigationButtonEnabled("next", false);
				Lianja.setNavigationButtonEnabled("last", false);
				Lianja.setNavigationButtonEnabled("edit", false);
				Lianja.setNavigationButtonEnabled("save", true);
				Lianja.setNavigationButtonEnabled("cancel", true);
			});
			return true;
		}
	}
	
	if (action == "delete")
	{
		if (!page.checkDeletePermission())
		{
			Lianja.showMessage("You do not have permission to perform this operation");
			return;
		}
		if (page.editing || page.adding) 
		{
			Lianja.showWarningMessage("Please Save or Cancel editing first");
			return;
		}
		if (Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "delete")) return true; 
		if (!Lianja.pageAction(id, "_delete", arg)) return false;
		return true;
	}
	
	if (action == "_delete")
	{
		if (!Lianja.resetEditors(id)) return false;
		if (typeof LianjaAppBuilder === "object")
		{
			LianjaAppBuilder.performPageAction(id.replace(/-/g, "."), "next");
			Lianja.refreshPage(id, false);
			Lianja.enableNavigationButtons();
			return true;
		}
		else
		{
			Lianja.cloudserver.performPageAction(id.replace(/-/g, "."), "next", function(status) {
				Lianja.refreshPageContents(id, false);
				Lianja.enableNavigationButtons();
			});
			return true;
		}
	}

	if (action == "first")
	{
		if (page.editing || page.adding) 
		{
			Lianja.showWarningMessage("Please Save or Cancel editing first");
			return;
		}
		if (!Lianja.resetEditors(id)) return false;
		if (Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "first")) return true; 
		if (typeof LianjaAppBuilder === "object")
		{
			LianjaAppBuilder.performPageAction(id.replace(/-/g, "."), action);
			Lianja.refreshPage(id, false);
			Lianja.enableNavigationButtons();
			return true;
		}
		else
		{
			Lianja.cloudserver.performPageAction(id.replace(/-/g, "."), "first", 
				function() {	// success
					Lianja.refreshPageContents(id, false);
					Lianja.enableNavigationButtons();
				},
				function() {	// error
				}
			);
			return true;
		}
	}
	
	if (action == "previous")
	{
		if (page.editing || page.adding) 
		{
			Lianja.showWarningMessage("Please Save or Cancel editing first");
			return;
		}
		if (!Lianja.resetEditors(id)) return false;
		if (Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "previous")) return true; 
		if (typeof LianjaAppBuilder === "object")
		{
			LianjaAppBuilder.performPageAction(id.replace(/-/g, "."), action);
			Lianja.refreshPage(id, false);
			Lianja.enableNavigationButtons();
			return true;
		}
		else
		{
			Lianja.cloudserver.performPageAction(id.replace(/-/g, "."), "previous", 
				function() {	// success
					Lianja.refreshPageContents(id, false);
					Lianja.enableNavigationButtons();
				},
				function() {	// error
				}
			);
			return true;
		}
	}
	
	if (action == "next")
	{
		if (page.editing || page.adding) 
		{
			Lianja.showWarningMessage("Please Save or Cancel editing first");
			return;
		}
		if (!Lianja.resetEditors(id)) return false;
		if (Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "next")) return true; 
		if (typeof LianjaAppBuilder === "object")
		{
			LianjaAppBuilder.performPageAction(id.replace(/-/g, "."), action);
			Lianja.refreshPage(id, false);
			Lianja.enableNavigationButtons();
			return true;
		}
		else
		{
			Lianja.cloudserver.performPageAction(id.replace(/-/g, "."), "next", 
				function() {	// success
					Lianja.refreshPageContents(id, false);
					Lianja.enableNavigationButtons();
				},
				function() {	// error
				}
			);
			return true;
		}
	}
	
	if (action == "last")
	{
		if (page.editing || page.adding) 
		{
			Lianja.showWarningMessage("Please Save or Cancel editing first");
			return;
		}
		if (!Lianja.resetEditors(id)) return false;
		if (Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "last")) return true; 
		if (typeof LianjaAppBuilder === "object")
		{
			LianjaAppBuilder.performPageAction(id.replace(/-/g, "."), action);
			Lianja.refreshPage(id, false);
			Lianja.enableNavigationButtons();
			return true;
		}
		else
		{
			Lianja.cloudserver.performPageAction(id.replace(/-/g, "."), "last", 
				function() {	// success
					Lianja.refreshPageContents(id, false);
					Lianja.enableNavigationButtons();
				},
				function() {	// error
				}
			);
			return true;
		}
	}

	if (action == "edit" && (page.editing || page.adding))
	{
		//action = "cancel";
		return true;
	}
	
	if (action == "edit")
	{
		if (!page.checkUpdatePermission())
		{
			Lianja.showMessage("You do not have permission to perform this operation");
			return;
		}
		if (page.editing || page.adding) return;
		if (!Lianja.resetEditors(id)) return false;
		if (Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "edit")) return true;
		if (page.firstedit) 
		{
			page.firstedit = false;
			Lianja.App.relayout();
		}
		if (typeof LianjaAppBuilder === "object")
		{
			page.beforeedit = true;
			Lianja.refreshPage(id, false);
			Lianja.editPage(true, id, false);
			Lianja.setNavigationButtonEnabled("add", false);
			Lianja.setNavigationButtonEnabled("delete", false);
			Lianja.setNavigationButtonEnabled("refresh", false);
			Lianja.setNavigationButtonEnabled("first", false);
			Lianja.setNavigationButtonEnabled("previous", false);
			Lianja.setNavigationButtonEnabled("next", false);
			Lianja.setNavigationButtonEnabled("last", false);
			Lianja.setNavigationButtonEnabled("edit", false);
			Lianja.setNavigationButtonEnabled("save", true);
			Lianja.setNavigationButtonEnabled("cancel", true);
			return true;
		}
		else
		{
			page.beforeediting = true;
			page.beforeedit = true;
			Lianja.refreshPage(id, false, 
				function()	// success
				{
					page.editing = true;
					//Lianja.resetEditors(id);
					//page.editing = true;
					Lianja.editPage(true, id, false);
					Lianja.setNavigationButtonEnabled("add", false);
					Lianja.setNavigationButtonEnabled("delete", false);
					Lianja.setNavigationButtonEnabled("refresh", false);
					Lianja.setNavigationButtonEnabled("first", false);
					Lianja.setNavigationButtonEnabled("previous", false);
					Lianja.setNavigationButtonEnabled("next", false);
					Lianja.setNavigationButtonEnabled("last", false);
					Lianja.setNavigationButtonEnabled("edit", false);
					Lianja.setNavigationButtonEnabled("save", true);
					Lianja.setNavigationButtonEnabled("cancel", true);
				},
				function()	// error
				{
				}
			);
			return true;
		}
	}

	if (action == "save")
	{
		if (Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "save")) return true; 
		if (page.adding)
		{
			if (Lianja.App.dispatchDelegate(pageid, "beforecreate")) return true;
		}
		else
		{
			if (Lianja.App.dispatchDelegate(pageid, "beforeupdate")) return true;
		}
		page.beforeediting = false;
		page.beforeedit = false;
		if (!Lianja.pageAction(id, "_save", arg)) return false;
		Lianja.setNavigationButtonEnabled("add", true);
		Lianja.setNavigationButtonEnabled("delete", true);
		Lianja.setNavigationButtonEnabled("refresh", true);
		Lianja.setNavigationButtonEnabled("first", true);
		Lianja.setNavigationButtonEnabled("previous", true);
		Lianja.setNavigationButtonEnabled("next", true);
		Lianja.setNavigationButtonEnabled("last", true);
		Lianja.setNavigationButtonEnabled("edit", true);
		Lianja.setNavigationButtonEnabled("save", false);
		Lianja.setNavigationButtonEnabled("cancel", false);
		return true;
	}
	
	if (action == "_save")
	{
		if (!Lianja.resetEditors(id)) return false;
		++page.txcount;
		Lianja.refreshPage(id, false);
		Lianja.setNavigationButtonEnabled("add", true);
		Lianja.setNavigationButtonEnabled("delete", true);
		Lianja.setNavigationButtonEnabled("refresh", true);
		Lianja.setNavigationButtonEnabled("first", true);
		Lianja.setNavigationButtonEnabled("previous", true);
		Lianja.setNavigationButtonEnabled("next", true);
		Lianja.setNavigationButtonEnabled("last", true);
		Lianja.setNavigationButtonEnabled("edit", true);
		Lianja.setNavigationButtonEnabled("save", false);
		Lianja.setNavigationButtonEnabled("cancel", false);
		return true;
	}
	
	if (action == "cancel")
	{
		Lianja.hideLoadingIcon();
		page.beforeediting = false;
		page.beforeedit = false;
		if (!Lianja.resetEditors(id)) return false;
		++page.txcount;
		if (Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "cancel")) return true; 
		if (typeof LianjaAppBuilder === "object")
		{
			LianjaAppBuilder.performPageAction(id.replace(/-/g, "."), action);
			Lianja.refreshPage(id, false);
			Lianja.setNavigationButtonEnabled("add", true);
			Lianja.setNavigationButtonEnabled("delete", true);
			Lianja.setNavigationButtonEnabled("refresh", true);
			Lianja.setNavigationButtonEnabled("first", true);
			Lianja.setNavigationButtonEnabled("previous", true);
			Lianja.setNavigationButtonEnabled("next", true);
			Lianja.setNavigationButtonEnabled("last", true);
			Lianja.setNavigationButtonEnabled("edit", true);
			Lianja.setNavigationButtonEnabled("save", false);
			Lianja.setNavigationButtonEnabled("cancel", false);
			return true;
		}
		else
		{
			Lianja.refreshPage(id, false);
			Lianja.setNavigationButtonEnabled("add", true);
			Lianja.setNavigationButtonEnabled("delete", true);
			Lianja.setNavigationButtonEnabled("refresh", true);
			Lianja.setNavigationButtonEnabled("first", true);
			Lianja.setNavigationButtonEnabled("previous", true);
			Lianja.setNavigationButtonEnabled("next", true);
			Lianja.setNavigationButtonEnabled("last", true);
			Lianja.setNavigationButtonEnabled("edit", true);
			Lianja.setNavigationButtonEnabled("save", false);
			Lianja.setNavigationButtonEnabled("cancel", false);
			return true;
		}
	}
	
	if (action == "goto")
	{
		//if (page.editing || page.adding) return;
		if (!Lianja.resetEditors(id)) return false;
		if (typeof LianjaAppBuilder === "object")
		{
			LianjaAppBuilder.performPageAction(id.replace(/-/g, "."), "goto:"+arg.__rowid);
			if (typeof arg.cursor === 'object')
			{
				arg.cursor.updateDeferredFields( function()
				{
					Lianja.refreshPage(id, false);
				});
			}
			else
			{
				Lianja.refreshPage(id, false);
			}
			return true;
		}
		else
		{
			Lianja.cloudserver.performPageAction(id.replace(/-/g, "."), "goto:"+arg.__rowid, function(status) {
				if (typeof arg.cursor === 'object')
				{
					arg.cursor.updateDeferredFields( function()
					{
						Lianja.refreshPage(id, false);
					});
				}
				else
				{
					Lianja.refreshPage(id, false);
					Lianja.refreshPageContents(id, false);
				}
			});
			return true;
		}
	}
	
	if (action == "search")
	{
		if (page.editing || page.adding) 
		{
			Lianja.showWarningMessage("Please Save or Cancel editing first");
			return;
		}
		if (!Lianja.resetEditors(id)) return false;
		if (Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "search")) return true; 
		if (typeof LianjaAppBuilder === "object")
		{
			LianjaAppBuilder.performPageAction(id.replace(/-/g, "."), "search:"+arg);
			Lianja.refreshPage(id, false);
			return true;
		}
		else
		{
			Lianja.cloudserver.performPageAction(id.replace(/-/g, "."), "search:"+arg, function(status) {
				Lianja.refreshPage(id, false);
			});
			return true;
		}
	}
	
	if (action == "filter")
	{
		if (page.editing || page.adding) 
		{
			Lianja.showWarningMessage("Please Save or Cancel editing first");
			return;
		}
		if (!Lianja.resetEditors(id)) return false;
		if (typeof LianjaAppBuilder === "object")
		{
			LianjaAppBuilder.performPageAction(id.replace(/-/g, "."), "filter:"+arg);
			Lianja.refreshPage(id, false);
			return true;
		}
		else
		{
			Lianja.cloudserver.performPageAction(id.replace(/-/g, "."), "filter:"+arg, function(status) {
				Lianja.refreshPage(id, false);
			});
			return true;
		}
	}

	if (action == "searchfilter")
	{
		if (page.editing || page.adding) 
		{
			Lianja.showWarningMessage("Please Save or Cancel editing first");
			return;
		}
		if (!Lianja.resetEditors(id)) 
		{
			return false;
		}
		if (typeof LianjaAppBuilder === "object")
		{
			LianjaAppBuilder.performPageAction(id.replace(/-/g, "."), "searchfilter:"+arg);
			Lianja.refreshPage(id, false);
			return true;
		}
		else
		{
			Lianja.cloudserver.performPageAction(id.replace(/-/g, "."), "searchfilter:"+arg, function(status) {
				Lianja.refreshPage(id, false);
			});
			return true;
		}
	}

	if (action == "showleftsidebar")
	{
		var el = $("#"+pageid);
		var mw = $("#"+pageid+"-leftsidebar").css("max-width");
		if (mw === "6px") $(".ui-lianja-splitter-right", el).click();
		return true;
	}

	if (action == "hideleftsidebar")
	{
		var el = $("#"+pageid);
		var mw = $("#"+pageid+"-leftsidebar").css("max-width");
		if (mw !== "6px") $(".ui-lianja-splitter-right", el).click();
		return true;
	}

	if (action == "toggleleftsidebar")
	{
		var el = $("#"+pageid);
		$(".ui-lianja-splitter-right", el).click();
		return true;
	}
	
	if (action == "showrightsidebar")
	{
		var el = $("#"+pageid);
		var mw = $("#"+pageid+"-rightsidebar").css("width");
		if (mw === "6px") $(".ui-lianja-splitter-left", el).click();
		return true;
	}

	if (action == "hiderightsidebar")
	{
		var el = $("#"+pageid);
		var mw = $("#"+pageid+"-rightsidebar").css("width");
		if (mw !== "6px") $(".ui-lianja-splitter-left", el).click();
		return true;
	}

	if (action == "togglerightsidebar")
	{
		var el = $("#"+pageid);
		$(".ui-lianja-splitter-left", el).click();
		return true;
	}
	
	return false;
};
	
//================================================================================
window.Lianja.performSectionAction = function(id, action, arg)
{
	// need to have a valid HTML ID tag to look up
	id = id.replace(/\./g, "-");
	
	var section = Lianja.getSection(id);
	if (typeof section === 'undefined')
	{
		comsole.log("Section '" + id + "' not found.");
		return false;
	}

	var page = section.page;
	var pageid = page.id;

	if (action == "show")
	{
		$(id).show();
		return true;
	}

	if (action == "hide")
	{
		$(id).hide();
		return true;
	}

	if (action == "expand")
	{
		$(id).trigger("expand");
		return true;
	}
	
	if (action == "collapse")
	{
		$(id).trigger("collapse");
		return true;
	}

	if (action == "refresh")
	{
		section.refresh();
		return true;
	}
	
	if (action == "search")
	{
		section.cursor.search(section, arg);
		section.refresh();
		return true;
	}
	
	if (action == "filter")
	{
		section.filter = arg;
		Lianja.refreshPage(Lianja.App.currentpageid, false);
		return true;
	}
	
	if (action == "select")		// select a tab
	{
		if (section.type === "carouselview" || section.type === "panelview")
		{
			Lianja.doSectionMethod(section.sectionid, arg);
		}
		else if (section.type === "tabview")
		{
			var tabid = section.sectionid.toLowerCase() + "-" + arg.toLowerCase() + "-tabid";
			tabid = str_replace(" ", "-", tabid);
			$('#' + tabid).click();
		}
		else
		{
			Lianja.selectStackedSection(section.pageid, section.sectionid, undefined);
		}
		return true;
	}
	
	if (action == "showsearchpanel")
	{
		section.showSearchPanel(section.sectionid);
		return true;
	}
	
	if (action == "hidesearchpanel")
	{
		section.hideSearchPanel(section.sectionid);
		return true;
	}
	
	if (action == "togglesearchpanel")
	{
		section.toggleSearchPanel(section.sectionid);
		return true;
	}
	
	if (action == "searchfilter")
	{
		section.setSearchFilter(arg);
		return true;
	}
	
	if (action == "add")
	{
		Lianja.performPageAction(pageid, action, arg);
		return true;
	}
	
	if (action == "delete")
	{
		Lianja.performPageAction(pageid, action, arg);
		return true;
	}
	
	if (action == "first")
	{
		Lianja.performPageAction(pageid, action, arg);
		return true;
	}
	
	if (action == "prev")
	{
		Lianja.performPageAction(page.pageid, action, arg);
		return true;
	}
	
	if (action == "next")
	{
		Lianja.performPageAction(pageid, action, arg);
		return true;
	}
	
	if (action == "last")
	{
		Lianja.performPageAction(pageid, action, arg);
		return true;
	}
	
	if (action == "edit")
	{
		Lianja.performPageAction(page.pageid, action, arg);
		return true;
	}
	
	if (action == "save")
	{
		Lianja.performPageAction(pageid, action, arg);
		return true;
	}
	
	if (action == "cancel")
	{
		Lianja.performPageAction(pageid, action, arg);
		return true;
	}
	
	return false;
};
	
//================================================================================
window.Lianja.performFormitemAction = function(id, action, arg)
{
	// need to have a valid HTML ID tag to look up
	id = id.replace(/\./g, "-");
	
	// TODO: perform navigation bar action and refresh data and related sections
	
	return false;
};
	
//================================================================================
window.Lianja.showDocument = function(url)
{
	var keypair;
	var id;
	var actionarg = "";
	var args;
	var items;
	var action = "";
	var i;
	var type;
	
	// handle chained actions
	if (url.indexOf("||") > 0)
	{
		args = url.split("||");
		for (var i=0; i<args.length; ++i)
		{
			Lianja.showDocument(args[i]);
		}
		return true;
	}
	
	type = "";
	if (url.indexOf("page:") == 0)
	{
		type = "page";
		url = url.substring(5);
	}
	else if (url.indexOf("section:") == 0)
	{
		type = "section";
		url = url.substring(8);
	}

	// encode ? and & so regexp does not mess up
	url = url.replace("?", "%3F").replace("&", "%26");

	// perform actions on pages, sections and formitems
	if (type.length > 0)
	{
		if (url.indexOf('%3F') > 0)
		{
			keypair = url.split('%3F');
			id = keypair[0].toLowerCase();
			args = keypair[1];
			if (args.indexOf('%26') > 0)
			{
				args = args.split('%26');
			}
			else
			{
				args = [ args ];
			}
			if (id.indexOf(".") > 0) 
			{
				items = id.split(".");
			} 
			else if (id.indexOf("-") > 0)
			{
				items = id.split("-");
			}
			else
			{
				items = [ id ];
			}
			
			// parse the args e.g. page:pagename?action=refresh
			action = "";
			for (var i=0; i<args.length; ++i)
			{
				keypair = args[i].split("=");
				if (keypair[0] == "action")
				{
					action = keypair[1];
				}
				if (keypair[0] == "text")
				{
					actionarg = keypair[1];
				}
			}
			
			if (action.length > 0)
			{
				if (items.length == 1 && type === 'section')
				{
					if (Lianja.App.currentpageid.length == 0) Lianja.App.currentpageid = $.mobile.activePage.attr("id");
					id = Lianja.App.currentpageid + '-' + id;
					Lianja.performSectionAction('#'+id, action, actionarg);
					return true;
				}
				
				// page:pagename
				if (items.length == 1)
				{
					if ($($.mobile.activePage).attr("id").toLowerCase() !== id.toLowerCase()) 
					{
						Lianja.performPageAction("#"+id, "show", "");
					}
					Lianja.performPageAction("#"+id, action, actionarg);
					return true;
				}
				// page:pagename.sectionname
				else if (items.length == 2)
				{
					Lianja.performSectionAction('#'+id, action, actionarg);
					return true;
				}
				// page:pagename.sectionname.formitemname
				else if (items.length == 3)
				{
					Lianja.performFormitemAction('#'+id, action, actionarg);
					return true;
				}
				// bad directive
				else
				{
					return false;
				}
			}
		}
		else
		{
			// Lianja.showDocument("page:id")
			if (type == "page")
			{
				if ($($.mobile.activePage).attr("id").toLowerCase() === url.toLowerCase()) return true;
				Lianja.performPageAction("#"+url.toLowerCase(), "show", "");
				return true;
			}
		}
	}
	
	if (url.indexOf("click:") == 0)
	{
		url = url.substring(6);
		$("#"+url).tab('show');
		return true;
	}
	
	if (url.indexOf("back:") == 0)
	{
		window.history.back();
		return true;
	}
	
	if (url.indexOf("forward:") == 0)
	{
		window.history.forward();
		return true;
	}
	
	if (url.indexOf("showpagesmenu") == 0)
	{
		Lianja.showPagesMenu();
		return true;
	}
	
	// TODO: handle other showDocument() actions in the same way as the desktop client
	console.log("Lianja.showDocument() unknown request " + url);
	return false;
};
	
//================================================================================
window.Lianja.hasHtml5Storage = function() {
  	try 
	{
    	return 'localStorage' in window && window['localStorage'] !== null;
  	} 
	catch (e) {
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
	if (Lianja.isPhoneGap()) return Lianja.readCookie(name);
	
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

	if (Lianja.isPhoneGap()) 
	{
		Lianja.createCookie(name, value, days);
		return;
	}
	
	if (days>0) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toGMTString();
		document.cookie = name + "=" + value + expires + "; path=/";
		//console.log(name + "=" + value + expires + "; path=/");
	}
	else 
	{
		var date = new Date();
		date.setDate(date.getDate() -1);
		document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/";	
		//console.log(name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT; max-age=0; path=/");
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
window.Lianja.resize = function()
{
	var clientheight = document.documentElement.clientHeight;
	var clientwidth = document.documentElement.clientWidth;
	var bodyheight = $(".mainbody").height();	// force recalc by the browser
	var bodywidth = $(".mainbody").width();	// force recalc by the browser
	$(window).trigger("resize");
	clientheight = document.documentElement.clientHeight;
	clientwidth = document.documentElement.clientWidth;
	bodyheight = $(".mainbody").height();	// force recalc by the browser
	bodywidth = $(".mainbody").width();
	$(window).trigger("resize");
	clientheight = document.documentElement.clientHeight;
	clientwidth = document.documentElement.clientWidth;
	Lianja.App.relayout();
};

//================================================================================
window.Lianja.editProfileSettings = function()
{
	Lianja.cloudserver.editProfileSettings(getprofilename(), function(changed) {
		if (changed) 
		{
			Lianja.cloudserver.getProfilePicture(getprofilename(), function(photo) {
			});
		}
	});
	return false;
};

//================================================================================
window.Lianja.resetLogin = function()
{
	$("#username").val("");
	$("#password").val("");
	$("#message").html("");
	$("#username").focus();
};
	
//================================================================================
window.Lianja.login = function()
{
	//console.log("Lianja.login()");
	var username = $("#username").val();
	var pw = $("#password").val();

	if (username.length==0 || pw.length==0)
	{
		if (Lianja.isPhoneGap())
		{
			Lianja.vibrate();
		}
		else
		{
			$("#message").html("Invalid username or password.");
		}
		$("#username").focus();
		return;
	}
	
	//Lianja.showLoadingIcon();
	Lianja.removeCookieVar("LIANJAUSER");
	Lianja.removeCookieVar("LIANJADOMAIN");
	Lianja.cloudserver.login(username, pw, function(rc) {
		if (rc)
		{
			if (Lianja.isPhoneGap() || Lianja.App.electron)
			{
				$(document.activeElement).filter(':input:focus').blur();
				//Lianja.showLoadingIcon();
				//console.log("setTimeout() Lianja.home()");
				setTimeout( function() { Lianja.home() }, 0);
			}
			else
			{
				Lianja.navigate("/appcenter.rsp?v="+Math.random());
				Lianja.hideLoadingIcon();
			}
		}	
		else
		{
			Lianja.hideLoadingIcon();
			if (Lianja.isPhoneGap())
			{
				Lianja.vibrate();
			}
			else
			{
				$("#message").html("Invalid username or password.");
			}
			Lianja.resetLogin();
			return;
		}
	});
};
	
//================================================================================
window.Lianja.verifyLoggedIn = function()
{
	if (typeof LianjaAppBuilder !== 'undefined') return;
	var username = Lianja.readCookieVar("LIANJAUSER");
	
	if (username == null || username.length == 0)
	{
		if (Lianja.isPhoneGap())
		{
			Lianja.removeCookieVar("LIANJAUSER");
			Lianja.removeCookieVar("LIANJAUSERDOMAIN");
			$.mobile.changePage("#" + Lianja.App.loginpage);
			Lianja.resetLogin();
		}
		else
		{
			//Lianja.navigate("../../logout.rsp");
			Lianja.navigate("/login.rsp");
		}
	}
};
	
//================================================================================
window.Lianja.logout = function()
{
	if (Lianja.isPhoneGap() || Lianja.App.electron)
	{
		Lianja.removeCookieVar("LIANJAUSER");
		Lianja.removeCookieVar("LIANJAUSERDOMAIN");
		Lianja.resetLogin();
		$.mobile.changePage("#" + Lianja.App.loginpage);
	}
	else
	{
		Lianja.removeCookieVar("LIANJAUSER");
		Lianja.removeCookieVar("LIANJAUSERDOMAIN");
		Lianja.cloudserver.logout();
	}
	return false;
};


//================================================================================
window.Lianja.home = function()
{
	//console.log("Lianja.home()");
	if (Lianja.isPhoneGap() || Lianja.App.electron)
	{
		if (Lianja.App.homepage.length > 0)
		{
			Lianja.showDocument( "page:" + Lianja.App.homepage );
		}
	}
	else
	{
		Lianja.navigate("/appcenter.rsp");
	}
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
window.Lianja.getProfilePicture = function(username, callback)
{
	Lianja.cloudserver.getProfilePicture(username, function(photo) {
		window.currentUser.photo = photo;
		// read the users avatar. 
		// note the use of ?+Math.random() which causes jquery to bypass the cache :)
		var img = new Image();
		$(img)
			.load(function () {
				$("#photo").html(this);
				$(this).fadeIn();
			})
			.attr('src', photo+"?"+Math.random());	
		callback(photo);
	});
};

//================================================================================
window.Lianja.signup = function()
{
	/* TODO: */
	return false;
};

//================================================================================
window.Lianja.openApp = function(app)
{
	Lianja.cloudserver.openApp(app);
	return false;
};

//================================================================================
window.Lianja.dynamicTileTextReady = function(app)
{
	Lianja.cloudserver.getDynamicTileText(app, function(contents) {	
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
					url: Lianja.App.getFullPathUrl(contents),
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
				url: Lianja.App.getFullPathUrl(contents.substr(5)),
				success: function(data) {
					$("#"+app).html(data);
				}
			});
			return false;
		}

		// raw html is just replaced in the DOM
		$("#"+app).html(contents);
	});

	return false;
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
			url: Lianja.App.getFullPathUrl(targeturl),
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
		url: Lianja.App.getFullPathUrl(targeturl),
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

	// callback handler that will be called regardless if the request failed or succeeded
	request.always(function () {
	});

	// prevent default posting of form
	event.preventDefault();
};


//================================================================================
window.Lianja.applyPermissions = function()
{
	if (Lianja.App.perms) return;
	Lianja.App.perms = true;
	
	var count = Lianja.App.getPageCount();
	var page;
	for (var i=0; i<count; ++i)
	{
		page = Lianja.App.getPage(i);
		page.applyPermissions();
	}
};

//================================================================================
window.Lianja.loadPage = function(pageid, show)
{
	var page = Lianja.App.getPage(pageid);
	var sectionid = "";
	
	if (!Lianja.ready) 
	{
		Lianja.App.pendingloadPage = pageid;
		return;
	}

	var element = $("#"+pageid);
	if (typeof element === "undefined") 
	{
		console.log("loadPage() pageid="+pageid+" not found");
		return;
	}
	
	Lianja.applyPermissions();
	
	//$(window).trigger("resize");
	Lianja.initPhoneGapStatusBar();

	if (pageid.indexOf("-firstsection") > 0)
	{
		$(element).click();
	}
	else
	{
		if (pageid.indexOf(".") > 0)
		{
			sectionid = str_replace(".", "-", pageid);
			pageid = pageid.substring(0, pageid.indexOf("."));
		}
		if (!Lianja.isPrefretchedPage(pageid)) 
		{
			var page = Lianja.App.getPage(pageid);
			if (page.loaded && !page.refreshwhenactivated && page.getSectionCount() > 1) 
			{
				;
			}
			else
			{
				if (!page.loaded) 
				{
					page.loaded = true;
					if (typeof show !== 'undefined' && show)
					{
						if (typeof Lianja.App.currentpageid === 'string' && Lianja.App.currentpageid !== pageid && Lianja.App.currentpageid.length > 0) 
						{
							Lianja.App.dispatchDelegate(Lianja.App.currentpageid, "deactivate"); 
						}
						var transitiontype = Lianja.pagetransitionmap[pageid.toLowerCase()];
						if (typeof transitiontype === 'undefined' || !Lianja.App.animationsenabled) transitiontype = "none";
						else transitiontype = transitiontype.toLowerCase();						
						// BM: work around bug in iOS 9
						if (Lianja.isPhoneGap() && device.platform === 'iOS' && parseInt(device.version) === 9) transitiontype = "none";
						$.mobile.changePage("#"+pageid, { transition: transitiontype } );
					}
					if (!page.adding) 
					{
						Lianja.refreshPage(pageid, false);
					}
					else
					{
						setTimeout(function()
						{
							Lianja.setNavigationButtonEnabled("add", false);
							Lianja.setNavigationButtonEnabled("delete", false);
							Lianja.setNavigationButtonEnabled("refresh", false);
							Lianja.setNavigationButtonEnabled("first", false);
							Lianja.setNavigationButtonEnabled("previous", false);
							Lianja.setNavigationButtonEnabled("next", false);
							Lianja.setNavigationButtonEnabled("last", false);
							Lianja.setNavigationButtonEnabled("edit", false);
							Lianja.setNavigationButtonEnabled("save", true);
							Lianja.setNavigationButtonEnabled("cancel", true);
						}, 500);
					}	
				}
			}
		}
		Lianja.App.setCurrentPageID(pageid);
	}

	if (sectionid.length > 0)
	{
		Lianja.selectStackedSection(pageid, sectionid, undefined);
	}
	
	Lianja.showNavigationPanel(pageid);

	Lianja.updateLoginPanel();

	if (typeof page === 'undefined') page = Lianja.App.getPage(pageid);
	if (typeof page !== 'undefined' && page.firstload)
	{
		page.firstload = false;
		Lianja.App.relayout();
	}
};

//================================================================================
window.Lianja.isPrefretchedPage = function(pageid)
{
	var page = Lianja.App.getPage(pageid);
	var section;
	var count = page.getSectionCount();

	if (count > 1) return false;
	
	for (var i=0; i<count; ++i)
	{
		section = page.getSection(i);
		if (section.type === "pagecenter") return true;
	}
	
	return false;
};

//================================================================================
window.Lianja.refreshComponent = function(type, controlsource, containerid, editing, adding, onsuccess, onerror, sectionid)
{
	var id = containerid;
		
	//console.log("refreshComponent type="+type);
	//Lianja.printStackTrace();

	containerid = containerid.replace(/_/g, "-");

	if (type === "webview")
	{
		Lianja.refreshWebViewUrl(controlsource, id+"-content", onsuccess, onerror);
		return;
	}
	else if (type === "iframe")
	{
		Lianja.refreshWebViewUrl(controlsource, id, onsuccess, onerror);
		return;
	}
	else if (type === "webviewgadget")
	{
		Lianja.refreshWebViewUrl(controlsource, id, onsuccess, onerror);
		return;
	}
	else if (type === "catalogview")
	{
		Lianja.refreshWebViewUrl(controlsource, containerid+"-content", onsuccess, onerror);
		return;
	}
	else if (type === "orgchart")
	{
		Lianja.refreshWebViewUrl(controlsource, containerid+"-content", onsuccess, onerror);
		return;
	}
	else if (type === "documentview")
	{
		Lianja.refreshWebViewUrl(controlsource, containerid+"-content", onsuccess, onerror);
		return;
	}
	else if (type === "carouselview")
	{
		Lianja.refreshWebViewUrl(controlsource, containerid+"-content", onsuccess, onerror);
		return;
	}
	else if (type === "pagecenter")
	{
		Lianja.refreshWebViewUrl(controlsource, containerid+"-content", onsuccess, onerror);
		return;
	}
	else if (type === "panelview")
	{
		Lianja.refreshWebViewUrl(controlsource, containerid+"-content", onsuccess, onerror);
		return;
	}
	else if (type === "calendarview")
	{
		Lianja.refreshWebViewUrl(controlsource, containerid+"-content", onsuccess, onerror);
		return;
	}
	else if (type === "imageurl")
	{
		Lianja.refreshImageUrl(controlsource, containerid, onsuccess, onerror);
		return;
	}
	else if (type === "imagefield")
	{
		Lianja.refreshImageField(controlsource, containerid, adding, onsuccess, onerror);
		return;
	}
	else if (type === "memofield")
	{
		Lianja.refreshMemoField(controlsource, containerid+"-content", adding, editing, onsuccess, onerror);
		return;
	}
	else if (type === "richtexteditor")
	{
		Lianja.refreshMemoField(controlsource, containerid+"-content", adding, editing, onsuccess, onerror);
		return;
	}
	else if (type === "editbox")
	{
		Lianja.refreshEditBox(controlsource, containerid+"-content", adding, editing, onsuccess, onerror);
		return;
	}
	else if (type === "imagestrip")
	{
		Lianja.refreshImageStrip(controlsource, containerid+"-content", onsuccess, onerror, sectionid);
		return;
	}
	else
	{
		console.log("Trace: refreshComponent() unknown type=" + type);
	}
};

//================================================================================
window.Lianja.refreshWebViewUrl = function(targeturl, containerid, onsuccess, onerror)
{
	var seqno = Lianja.App.seqno();
	if (targeturl.indexOf("?") > 0) targeturl = targeturl + "&_v=" + seqno;
	else targeturl = targeturl + "?_v=" + seqno;
	
	if (targeturl.indexOf("?") > 0) targeturl = targeturl + "&targetui=" + Lianja.App.targetui;
	else targeturl = targeturl + "?targetui=" + Lianja.App.targetui;

	if (Lianja.App.targetui == "phone" && targeturl.indexOf("library:/catalogview.rsp") == 0)
	{
		targeturl = str_replace("catalogview.rsp", "phone_catalogview.rsp", targeturl);
	}

	containerid = containerid.replace(/_/g,"-");
	if (typeof LianjaAppBuilder === 'undefined')
	{
		if (targeturl.indexOf("quickreport.rsp") == 0) targeturl = "lib:/"+targeturl;
		targeturl = str_replace("library:/", "../../../library/", targeturl);
		targeturl = str_replace("lib:/", "../../../library/", targeturl);
		targeturl = str_replace("wwwroot:/", "../../../", targeturl);
		containerid = containerid.replace(/_/g,"-");
		Lianja.expandMacros("", "", targeturl, 
			function(targeturl, args)
			{
				Lianja.refreshWebViewData(targeturl, args.containerid, args.onsuccess, args.onerror);
			},
			{ "containerid": containerid, "onsuccess":onsuccess, "onerror":onerror },
			""
		);
		return;
	}

	targeturl = Lianja.expandMacros("", "", targeturl);
	Lianja.refreshWebViewData(targeturl, containerid, onsuccess, onerror);
};

//================================================================================
window.Lianja.refreshWebViewData = function(targeturl, containerid, onsuccess, onerror)
{
	containerid = containerid.toLowerCase().replace(/_/g,"-");
	var success = onsuccess;
	var error = onerror;
	var frame = document.getElementById(containerid);
	var doc; 
	
	if (frame === null)
	{
		return;
	}
	
	$('#'+containerid).data("lianjaUrl", targeturl);

	if (targeturl.indexOf("chart.apis.google.com") > 0 || 
		targeturl.indexOf("chart.googleapis.com") > 0 ||
		targeturl.indexOf("maps.google.com") > 0)
	{
		var style = "style='height:" + $('#'+containerid).height() + "px;width:" + $('#'+containerid).width() + "px;'";
		var text = "<head><script>window.Lianja = window.parent.Lianja;</script></head><body style='margin:0'><img src='" + targeturl + "'" + style + " /></body>";
		var doc = document.getElementById(containerid).contentWindow.document;
		doc.open();
		doc.write(text);
		doc.close();
	    //setTimeout(function() {}, 0);
		if (typeof onsuccess !== 'undefined') onsuccess();
		return;
	}
	
	if (typeof LianjaAppBuilder === "object") 
	{
		doc = frame.contentWindow.document;
		if (targeturl.indexOf('http') == 0)
		{
			Lianja.getUrl(targeturl, function(status, text) {
				if (status)
				{
					text = str_replace("library:/", "../../../library/", text);
					text = str_replace("lib:/", "../../../library/", text);
					doc.open();
					doc.write("<head><script>window.Lianja = window.parent.Lianja;</script></head>" + text);
					doc.close();
				}
			});
		}
		else
		{
			var text = LianjaAppBuilder.fetchBaseUrl(Lianja.getBaseURL(), targeturl);
			doc.open();
			doc.write("<head><script>window.Lianja = window.parent.Lianja;</script></head>" + text);
			doc.close();
		}
	}
	else
	{
		var loadingdata = $(frame).data("loadingData");
		if (typeof loadingdata === 'undefined') loadingdata = false;
		if (loadingdata)
		{
			if (typeof success === 'function') success();
			return;
		}
		
		if (targeturl.indexOf("pagecenter") >= 0)
		{
			var text = Lianja.App.getTextCache(containerid);
			if (text.length > 0)
			{
				var doc = frame.contentDocument || frame.contentWindow.document;
				doc.open();
				doc.write("<head><script>window.Lianja = window.parent.Lianja;</script></head>" + text);
				doc.close();
				$(frame).data("loadedData", true);
				if (typeof success === 'function') success();
				return;
			}
			var framedata = $(frame).data("loadedData");
			if (typeof framedata === 'undefined') framedata = false;
			if (framedata)
			{
				if (typeof success === 'function') success();
				return;
			}
		}
		// throw away first call to the calendar
		if (targeturl.indexOf("calendar_view.rsp") >= 0 && false)
		{
			var framedata = $(frame).data("loadedData");
			if (typeof framedata === 'undefined') framedata = false;
			if (!framedata)
			{
				$(frame).data("loadedData", true);
				//setTimeout(function() {}, 0);
				if (typeof success === 'function') success();
				return;
			}
		}
	
		// TODO: handle prefetch caching here for static content
		
		$(frame).data("loadingData", true);
		Lianja.getUrl(targeturl, {"success": success, "error" : error, "containerid":containerid, "targeturl":targeturl}, function(status, text, args) {
			var frame = document.getElementById(args.containerid);
			$(frame).data("loadingData", false);
			if (status)
			{
				$(frame).data("loadedData", true);
				var oldtext = Lianja.App.getTextCache(args.containerid);
				if (oldtext.length == text.length && oldtext === text && $(frame).contents().length > 1)
				{
					if (typeof args.success === 'function') args.success();
					return;
				}
				Lianja.App.setTextCache(args.containerid, text);
				if (args.targeturl.indexOf("pagecenter") >= 0)
				{
					var doc = frame.contentDocument || frame.contentWindow.document;
					doc.open();
					doc.write("<head><script>window.Lianja = window.parent.Lianja;</script></head>" + text);
					doc.close();
					if (typeof args.success === 'function') args.success();
					return;
				}
				else
				{
					$(frame).contents("");
					var doc = frame.contentDocument || frame.contentWindow.document;
					doc.open();
					doc.write("<head><script>window.Lianja = window.parent.Lianja;</script></head>" + text);
					doc.close();
					if (typeof args.success === 'function') args.success();
					return;
				}
			}
			else
			{
				Lianja.App.setTextCache(args.containerid, "");
				if (typeof args.error === 'function') args.error();
				return;
			}
		});
	}
};

//================================================================================
window.Lianja.refreshImageUrl = function(targeturl, containerid, onsuccess, onerror)
{
	//console.log("refreshImageUrl()");
	if (typeof LianjaAppBuilder === 'undefined')
	{
		Lianja.expandMacros("", "", targeturl, 
			function(targeturl, args)
			{
				Lianja.refreshImageData(targeturl, args.containerid, args.onsuccess, args.onerror);
			},
			{ "containerid": containerid, "onsuccess":onsuccess, "onerror":onerror },
			""
		);
		return;
	}

	targeturl = Lianja.expandMacros("", "", targeturl);
	Lianja.refreshImageData(targeturl, containerid, onsuccess, onerror);
};

//================================================================================
window.Lianja.refreshImageData = function(targeturl, containerid, onsuccess, onerror)
{
	if (targeturl.indexOf("http:") == 0 || targeturl.indexOf("https:") == 0)
	{
		// We handle google chart apis so that can be loaded asynchronously preventing any flicker
		if (targeturl.indexOf("chart.apis.google.com") > 0 || 
			targeturl.indexOf("chart.googleapis.com") > 0 ||
			targeturl.indexOf("maps.google.com") > 0)
		{
			var img = new Image();
			$(img)
				.load(function () {
					$("#"+containerid).html(this);
					$(this).fadeIn();
				})
				.attr('src', targeturl.substr(8));		
			return false;
		}
		else
		{
			$.ajax({
				url: Lianja.App.getFullPathUrl(targeturl),
				success: function(data) {
					$("#"+containerid).html(data);
				}
			});
		}

		return false;
	}
	// We handle image urls so that can be loaded asynchronously preventing any flicker
	else if (targeturl.indexOf("urlimg::") == 0)
	{
		var img = new Image();
		$(img)
			.load(function () {
				$("#"+containerid).html(this);
				$(this).fadeIn();
			})
			.attr('src', targeturl.substr(8));		

		return false;
	}
	// We handle external urls so that can be loaded asynchronously preventing any flicker
	else if (targeturl.indexOf("url::") == 0)
	{
		$.ajax({
			url: Lianja.App.getFullPathUrl(targeturl.substr(5)),
			success: function(data) {
				$("#"+app).html(data);
			}
		});
		return false;
	}
};

//================================================================================
window.Lianja.refreshImageField = function(controlsource, containerid, adding, onsuccess, onerror)
{
	var self = this;
	if (containerid[0] == '#') containerid = containerid.substring(1);
	this.clickdata = { "controlsource": controlsource, "containerid" : containerid, "adding": adding };
	this.controlsource = controlsource;
	this.containerid = containerid;
	this.adding = adding;
	this.onsuccess = onsuccess;
	this.onerror = onerror;
	
	if (typeof LianjaAppBuilder === "object") 
	{
		var element = $("#"+containerid); 
		var maxwidth = element.css("max-width");
		var maxheight = element.css("max-height");
		var align = element.data("LianjaFormitemAlign");
		if (typeof align === 'undefined') align = '';
		var data;
		if (maxwidth === "none") maxwidth = "100%";
		if (maxheight === "none") maxheight = "100%";
		$(element).css("cursor", "pointer");
		$(element).css("padding-top", "0px");
		$(element).css("padding-right", "0px");
		if (!adding)
		{
			data = LianjaAppBuilder.getImageField(controlsource, maxwidth, maxheight);
		}
		else
		{
			data = LianjaAppBuilder.getNoImageField(maxwidth, maxheight);
		}
		$("#"+containerid).data("activeclick", "false");
		var formid = $("#"+containerid).data("uploaderform");
		$('#'+formid).remove();
		element.empty();
		if (align === 'center') data = "<center>" + data + "</center>";
		element.html(data);
		if (typeof Lianja.App.getProperty(containerid.replace(/-/g,"_")+"_click") === 'undefined')
		{
			Lianja.App.setProperty(containerid.replace(/-/g,"_")+"_click", "true");
			$("#"+containerid).click( function (e)
			{
				var uploader;
				var activeclick = $("#"+this.id).data("activeclick");
				if (typeof activeclick == 'string' && activeclick == 'true') return;
				$("#"+this.id).data("activeclick", "true");
				$("#"+self.clickdata.containerid).css("padding-top", "2px");
				$("#"+self.clickdata.containerid).css("padding-right", "5px");
				uploader = new Lianja.uploadImageField(self.clickdata.controlsource, self.clickdata.containerid, self.clickdata.adding, false);
			});
		}
	}
	else
	{
		var element = $("#"+containerid); 
		var align = element.data("LianjaFormitemAlign");
		if (typeof align === 'undefined') align = '';
		var maxwidth = element.css("max-width");
		var maxheight = element.css("max-height");
		var data;
		if (maxwidth === "none") maxwidth = "100%";
		if (maxheight === "none") maxheight = "100%";
		$(element).css("cursor", "pointer");
		$(element).css("padding-top", "0px");
		$(element).css("padding-right", "0px");
		if (!adding)
		{
			Lianja.cloudserver.getImageField(controlsource, maxwidth, maxheight,
				function(data, args) {
					var containerid = args.containerid;
					if (Lianja.App.phonegap)
					{
						$("#"+containerid).data("activeclick", "false");
						element.empty();
						element.html(data);
						if (typeof Lianja.App.getProperty(containerid.replace(/-/g,"_")+"_click") === 'undefined')
						{
							Lianja.App.setProperty(containerid.replace(/-/g,"_")+"_click", "true");
							$("#"+containerid).click( function (e)
							{
								Lianja.getPicture(
									function(file_url)
									{
										//console.log("file_url="+file_url);
										uploader = new Lianja.uploadPhoto(
																file_url, 
																self.clickdata.controlsource, 
																self.clickdata.containerid, 
																self.clickdata.adding, 
																false,
																self.onsuccess,
																self.onerror
																);
									},
									function(resp)
									{
									}
								);
							});
						}
					}
					else
					{
						$("#"+containerid).data("activeclick", "false");
						var formid = $("#"+containerid).data("uploaderform");
						$('#'+formid).remove();
						element.empty();
						element.html(data);
						if (typeof Lianja.App.getProperty(containerid.replace(/-/g,"_")+"_click") === 'undefined')
						{
							Lianja.App.setProperty(containerid.replace(/-/g,"_")+"_click", "true");
							$("#"+containerid).click( function (e)
							{
								var uploader;
								var activeclick = $("#"+this.id).data("activeclick");
								if (typeof activeclick == 'string' && activeclick == 'true') return;
								$("#"+this.id).data("activeclick", "true");
								$("#"+self.clickdata.containerid).css("padding-top", "2px");
								$("#"+self.clickdata.containerid).css("padding-right", "5px");
								uploader = new Lianja.uploadImageField(self.clickdata.controlsource, self.clickdata.containerid, self.clickdata.adding, false);
							});
						}
					}
				},
				function() {
				},
				{ "containerid": containerid, "align": align }
			);
		}
		else
		{
			if (Lianja.App.phonegap)
			{
				data = "<img src='images/noimage.jpg' width='" + maxwidth + "' height='" + maxheight + "' style='min-height:" + maxheight + "'/>";
			}
			else
			{
				data = "<img src='/images/noimage.jpg' width='" + maxwidth + "' height='" + maxheight + "' style='min-height:" + maxheight + "'/>";
			}
			element.empty();
			if (align === 'center') data = "<center>" + data + "</center>";
			element.html(data);
			$("#"+containerid).data("activeclick", "false");
			if (Lianja.App.phonegap)
			{
				element.empty();
				element.html(data);
				if (typeof Lianja.App.getProperty(containerid.replace(/-/g,"_")+"_click") === 'undefined')
				{
					Lianja.App.setProperty(containerid.replace(/-/g,"_")+"_click", "true");
					$("#"+containerid).click( function (e)
					{
						Lianja.getPicture(
							function(file_url)
							{
								//console.log("file_url="+file_url);
								uploader = new Lianja.uploadPhoto(
														file_url, 
														self.clickdata.controlsource, 
														self.clickdata.containerid, 
														self.clickdata.adding, 
														false,
														self.onsuccess,
														self.onerror
														);
							},
							function(resp)
							{
							}
						);
					});
				}
			}
			else
			{
				var formid = $("#"+containerid).data("uploaderform");
				$('#'+formid).remove();
				element.empty();
				element.html(data);
				if (typeof Lianja.App.getProperty(containerid.replace(/-/g,"_")+"_click") === 'undefined')
				{
					Lianja.App.setProperty(containerid.replace(/-/g,"_")+"_click", "true");
					$("#"+containerid).click( function (e)
					{
						var uploader;
						var activeclick = $("#"+this.id).data("activeclick");
						if (typeof activeclick == 'string' && activeclick == 'true') return;
						$("#"+this.id).data("activeclick", "true");
						$("#"+self.clickdata.containerid).css("padding-top", "2px");
						$("#"+self.clickdata.containerid).css("padding-right", "5px");
						uploader = new Lianja.uploadImageField(self.clickdata.controlsource, self.clickdata.containerid, self.clickdata.adding, false);
					});
				}
			}
		}
	}
};


//================================================================================
window.Lianja.addImage = function(data_attributes)
{
	if (typeof LianjaAppBuilder === "object") 
	{
		bootbox.alert("File upload is not supported in development mode.");
		return;
	}
	var pos = data_attributes.indexOf(":");
	var controlsource = data_attributes.substring(0,pos);
	var containerid = data_attributes.substring(pos+1);
	var uploader = new Lianja.uploadImageField(controlsource, containerid, true, true,
		function() {	// success
			Lianja.refreshImageStrip(controlsource, containerid, function() {}, function() {});
		},	
		function() {	// error
		}	
	);
	return false;
};

//================================================================================
window.Lianja.attachmentClicked = function(pageid, sectionid, rowid, gridrow, gridcol)
{
	var page = Lianja.App.getPage(pageid);
	var section = page.getSection(sectionid);
	var attachments_field = $("#"+sectionid).data("lianjaAttachmentsField");
	if (typeof attachments_field === 'undefined' || attachments_field === null) return;
	var url = "/odata/" + section.grid.database + "/" + section.grid.table + "?$select=" + attachments_field + "&$format=attachment&$filter=rowid eq "+rowid;
	window.open(url);
};


//================================================================================
window.Lianja.showPopupDialog = function(id, title, html, context)
{
    var popup = '<div data-role="popup" id="' + id + '" data-overlay-theme="a" data-theme="c" data-dismissible="false" style="max-width:400px;"><div data-role="header" data-theme="a" ><h1 style="margin:0 !important;">' + title + '</h1></div><div data-role="content" data-theme="c" data-corners="false" class="ui-content ui-lianja-nomargin" style="border:0px;border-radius:0;"><div>' + html + '</div><button id="' + id + '-closebutton" value="Close" type="button" data-theme="c" data-corners="false" data-shadow="false"/></div>';
    var selectorPopupDialog = "#" + id;

	$.mobile.activePage.append(popup).trigger("pagecreate");
	
    $("#" + id + "-closebutton").click(function() {
        $(selectorPopupDialog).popup('close');
    });
    
	if (context.width)
        $(selectorPopupDialog).width(context.width);
    
	if (context.title)
        $(selectorPopupDialog + ' h1').html(context.title);
    
	$(selectorPopupDialog).popup("open");
	
	if (context.refresh)
	{
		$(document).on("popupafterclose", ".ui-popup", function() {
			$(this).remove();
			Lianja.refreshImageField(context.controlsource, context.containerid, context.adding);
		});
	}
	else
	{
		$(document).on("popupafterclose", ".ui-popup", function() {
			$(this).remove();
		});
	}
};

//================================================================================
window.Lianja.uploadPhoto = function(imageURI, controlsource, containerid, adding, canadd, onsuccess, onerror) 
{
	var self = this;
	if (containerid[0] != '#') containerid = "#"+containerid;
	this.containerid = containerid;
	this.controlsource = controlsource;
	this.adding = adding;
	this.refresh = !canadd;
	this.onsuccess = onsuccess;
	this.onerror = onerror;
	this.imageURI = imageURI;
	var rowid = Lianja.cloudserver.getCurrentRowID(controlsource);
	var cursor = Lianja.cloudserver.getCursor(controlsource);
	var url = Lianja.App.baseurl + "odata/" + cursor.database + "/" + cursor.table + "?$column=" + controlsource.toLowerCase() + "&$format=img&$rowid="+rowid+"&_v="+Lianja.App.seqno();
	var method;
	if (adding) method = "POST"; 
	else method = "PUT";
	var ext = imageURI.substr(imageURI.lastIndexOf('.')+1);
    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType="image/"+ext;
	options.httpMethod = method;
	options.chunkedMode = false;
	
    var params = new Object();
    options.params = params;

	Lianja.showLoadingIcon();
    var ft = new FileTransfer();
    ft.upload(imageURI, 
		encodeURI(url), 
		function(r)
		{
			//console.log(r);
			Lianja.hideLoadingIcon();
			Lianja.showSuccessMessage("Image was successfully uploaded");
			var element = $(self.containerid); 
			var data = "<img src='" + self.imageURI + "' width='100%'/>";
			element.empty();
			element.html(data);
			if (typeof self.onsuccess !== 'undefined') self.onsuccess();
		}, 
		function(r)
		{
			Lianja.hideLoadingIcon();
			Lianja.showErrorMessage("Image upload failed");
			if (self.onerror !== 'undefined') self.onerror();
		}, 
		options
	);
};

//================================================================================
window.Lianja.uploadImageField = function(controlsource, containerid, adding, canadd, onsuccess, onerror)
{
	var self = this;
	if (containerid[0] != '#') containerid = "#"+containerid;
	this.containerid = containerid;
	this.controlsource = controlsource;
	this.adding = adding;
	this.refresh = !canadd;
	this.onsuccess = onsuccess;
	this.onerror = onerror;
	var rowid = Lianja.cloudserver.getCurrentRowID(controlsource);
	var cursor = Lianja.cloudserver.getCursor(controlsource);
	var url = Lianja.App.baseurl + "/odata/" + cursor.database + "/" + cursor.table + "?$column=" + controlsource.toLowerCase() + "&$format=img&$rowid="+rowid+"&_v="+Lianja.App.seqno();
	var method;
	if (adding) method = "POST"; 
	else method = "PUT";
	this.formid = self.containerid.substr(1)+"-uploaderform" + (new Date().getTime());
	
	//console.log("uploadImageField()");
	
	this.uploader = 
		"<form id='upload' method='" + method + "' action='" + url + "' enctype='multipart/form-data' style='border-radius:0px;margin:0;'>"
		+ "	<div id='drop' class='no-text-shadow'>"
		+ "Drop Here</br>"
		+ "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a>Browse</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
		+ "		<input type='file' name='upl' style='border:0px !important;'/>"
		+ "	</div>"
		+ "	<ul>"
		+ "	</ul>"
		+ "</form>";
			
	if (adding && !canadd) 
	{
		Lianja.alert("You must save your form changes before uploading an image.");
		return;
	}

	if (typeof LianjaAppBuilder === "object") 
	{
		Lianja.alert("File upload is not supported in development mode.");
		return;
	}
	else
	{
		Lianja.showPopupDialog(self.containerid.substr(1)+"-uploader", "Choose an image", this.uploader, { "controlsource":controlsource, "containerid":containerid, "adding":adding, "refresh":!canadd});
		var ul = $('#upload ul');

		$('#drop a').click(function(){
			// Simulate a click on the file input button
			// to show the file browser dialog
			$(this).parent().find('input').click();
		});

		// Initialize the jQuery File Upload plugin
		$('#upload').fileupload({
			type: method,
		
			// This element will accept file drag/drop uploading
			dropZone: $('#drop'),

			// This function is called when a file is added to the queue;
			// either via the browse button, or via drag/drop:
			add: function (e, data) {

				var tpl = $('<li class="working"><input type="text" value="0" data-width="48" data-height="48"'+
					' data-fgColor="#0788a5" data-readOnly="1" data-bgColor="#3e4043" /><p></p><span></span></li>');

				// Append the file name and file size
				tpl.find('p').text(data.files[0].name)
							 .append('<i>' + self.formatFileSize(data.files[0].size) + '</i>');

				// Add the HTML to the UL element
				data.context = tpl.appendTo(ul);

				// Initialize the knob plugin
				tpl.find('input').knob();

				// Listen for clicks on the cancel icon
				tpl.find('span').click(function(){

					if(tpl.hasClass('working')){
						jqXHR.abort();
					}

					tpl.fadeOut(function(){
						tpl.remove();
					});

				});

				// Automatically upload the file once it is added to the queue
				var jqXHR = data.submit();
			},

			progress: function(e, data){

				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);

				// Update the hidden input field and trigger a change
				// so that the jQuery knob plugin knows to update the dial
				data.context.find('input').val(progress).change();

				if(progress == 100){
					data.context.removeClass('working');
				}
			},

			fail:function(e, data){
				Lianja.showErrorMessage("Image upload failed");
				// Something has gone wrong!
				data.context.addClass('error');
			},
			
			done: function (e, data) {
				Lianja.showSuccessMessage("Image was successfully uploaded");
				if (self.refresh) Lianja.refreshImageField(self.controlsource, self.containerid, self.adding);
				else if (typeof self.onsuccess !== 'undefined') self.onsuccess();
			}

		});

		// Prevent the default action when a file is dropped on the window
		$(document).on('drop dragover', function (e) {
			e.preventDefault();
		});
	}

	// Helper function that formats the file sizes
	this.formatFileSize = function(bytes) {
		if (typeof bytes !== 'number') {
			return '';
		}

		if (bytes >= 1000000000) {
			return (bytes / 1000000000).toFixed(2) + ' GB';
		}

		if (bytes >= 1000000) {
			return (bytes / 1000000).toFixed(2) + ' MB';
		}

		return (bytes / 1000).toFixed(2) + ' KB';
	};
};


//================================================================================
window.Lianja.uploadAttachment = function(controlsource, columnlist, containerid, adding, canadd, onsuccess, onerror)
{
	var self = this;
	if (containerid[0] != '#') containerid = "#"+containerid;
	this.containerid = containerid;
	this.controlsource = controlsource;
	this.adding = adding;
	this.onsuccess = onsuccess;
	this.onerror = onerror;
	var rowid = Lianja.cloudserver.getCurrentRowID(controlsource);
	var cursor = Lianja.cloudserver.getCursor(controlsource);
	var url = "/odata/" + cursor.database + "/" + cursor.table + "?$column=" + columnlist + "&$format=attachment&$rowid="+rowid+"&_v="+Lianja.App.seqno();
	var method;
	if (adding) method = "POST"; 
	else method = "PUT";
	this.formid = self.containerid.substr(1)+"-uploaderform" + (new Date().getTime());
	
	this.uploader = 
		"<form id='upload' method='" + method + "' action='" + url + "' enctype='multipart/form-data'>"
		+ "	<div id='drop' class='no-text-shadow'>"
		+ "Drop Here</br>"
		+ "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a>Browse</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
		+ "		<input type='file' name='upl' style='border:0px !important;'/>"
		+ "	</div>"
		+ "	<ul>"
		+ "	</ul>"
		+ "</form>";

	if (adding && !canadd) 
	{
		Lianja.alert("You must save your form changes before uploading an image.");
		return;
	}

	if (typeof LianjaAppBuilder === "object") 
	{
		Lianja.alert("File upload is not supported in development mode.");
		return;
	}
	else
	{
		Lianja.showPopupDialog(self.containerid.substr(1)+"-uploader", "Choose a file", this.uploader, { "controlsource":controlsource, "containerid":containerid, "adding":adding, "refresh":!canadd});
		var ul = $('#upload ul');

		$('#drop a').click(function(){
			// Simulate a click on the file input button
			// to show the file browser dialog
			$(this).parent().find('input').click();
		});

		// Initialize the jQuery File Upload plugin
		$('#upload').fileupload({
			type: method,
		
			// This element will accept file drag/drop uploading
			dropZone: $('#drop'),

			// This function is called when a file is added to the queue;
			// either via the browse button, or via drag/drop:
			add: function (e, data) {

				var tpl = $('<li class="working"><input type="text" value="0" data-width="48" data-height="48"'+
					' data-fgColor="#0788a5" data-readOnly="1" data-bgColor="#3e4043" /><p></p><span></span></li>');

				// Append the file name and file size
				tpl.find('p').text(data.files[0].name)
							 .append('<i>' + self.formatFileSize(data.files[0].size) + '</i>');

				// Add the HTML to the UL element
				data.context = tpl.appendTo(ul);

				// Initialize the knob plugin
				tpl.find('input').knob();

				// Listen for clicks on the cancel icon
				tpl.find('span').click(function(){

					if(tpl.hasClass('working')){
						jqXHR.abort();
					}

					tpl.fadeOut(function(){
						tpl.remove();
					});

				});

				// Automatically upload the file once it is added to the queue
				var jqXHR = data.submit();
			},

			progress: function(e, data){

				// Calculate the completion percentage of the upload
				var progress = parseInt(data.loaded / data.total * 100, 10);

				// Update the hidden input field and trigger a change
				// so that the jQuery knob plugin knows to update the dial
				data.context.find('input').val(progress).change();

				if(progress == 100){
					data.context.removeClass('working');
				}
			},

			fail:function(e, data){
				Lianja.showErrorMessage("File upload failed");
				// Something has gone wrong!
				data.context.addClass('error');
			},
			
			done: function (e, data) {
				Lianja.showSuccessMessage("File was successfully uploaded");
				if (typeof self.onsuccess !== 'undefined') self.onsuccess();
			}

		});

		// Prevent the default action when a file is dropped on the window
		$(document).on('drop dragover', function (e) {
			e.preventDefault();
		});
	}

	// Helper function that formats the file sizes
	this.formatFileSize = function(bytes) {
		if (typeof bytes !== 'number') {
			return '';
		}

		if (bytes >= 1000000000) {
			return (bytes / 1000000000).toFixed(2) + ' GB';
		}

		if (bytes >= 1000000) {
			return (bytes / 1000000).toFixed(2) + ' MB';
		}

		return (bytes / 1000).toFixed(2) + ' KB';
	};

};


//================================================================================
window.Lianja.getMemoEditorText = function(section, containerid, onsuccess, onerror)
{
	try 
	{
		return document.getElementById(containerid).contentWindow.getEditorData();
	}
	catch (e)
	{
		return null;
	}
};

//================================================================================
window.Lianja.refreshMemoField = function(controlsource, containerid, adding, editing, onsuccess, onerror)
{
	var self = this;
	var pos = containerid.indexOf("-");
	var pageid = containerid.substring(0,pos);
	var page = Lianja.App.getPage(pageid);
	var frame = document.getElementById(containerid);
	var doc; 
	
	if (frame === null)
	{
		console.log("can't find frame for "+containerid);
		return;
	}
	
	var state = Lianja.App.getProperty(containerid+"_refreshMemoField");
	if (typeof state !== 'undefined')
	{
		if (state === 'active') return;
	}
	
	doc = frame.contentWindow.document;
	editing = page.editing;
	if (!editing && page.beforeediting) 
	{
		if (typeof onsuccess === 'function') onsuccess();
		return;
	}

	this.text = "";

	if (editing && adding)
	{
		if (typeof LianjaAppBuilder === "object") 
		{
			var editor = LianjaAppBuilder.getMemoEditor();
			var doc = document.getElementById(containerid).contentWindow.document;
			doc.open();
			doc.close();
			doc.open();
			doc.write(editor);
			doc.close();
			Lianja.App.setMemoBuffer(containerid, text);
			
			function loadContent()
			{
				var contentWindow = document.getElementById(containerid).contentWindow;
				try 
				{
					contentWindow.setEditorData("");
					Lianja.App.setMemoBuffer(containerid, contentWindow.getEditorData());
				}
				catch (e)
				{
					setTimeout(loadContent, 0);
				}
			}
			
			loadContent();
	
		}
		else
		{
			//console.log("read the text editor editing="+editing+", containerid="+containerid+", page.txcoount="+page.txcount);
			var doc = document.getElementById(containerid).contentWindow.document;
			var contentWindow = document.getElementById(containerid).contentWindow;
			var args = {"doc" : doc, "contentWindow": contentWindow, "success": onsuccess, "error" : onerror, "containerid": containerid };
			// firstly read the text editor
			Lianja.cloudserver.getMemoEditor( 
				args,
				function(args, editor)
				{
					//var doc = document.getElementById(args.containerid).contentWindow.document;
					var doc = args.doc;
					doc.open();
					doc.write(editor);
					doc.close();
					Lianja.App.setMemoBuffer(containerid, text);
					
					/*
					function loadContent()
					{
						try 
						{
							Lianja.App.setMemoBuffer(containerid, contentWindow.getEditorData());
						}
						catch (e)
						{
							console.log("setTimeout() loadContent");
							setTimeout(loadContent, 0);
						}
					}
					
					function checkReady()
					{
						try 
						{
							if (typeof contentWindow !== "function" || contentWindow.isReady())
							{
								loadContent();
							}
							else
							{
								console.log("setTimeout() checkReady");
								setTimeout(checkReady, 0);
							}
						}
						catch (e)
						{
							console.log("setTimeout() checkReady");
							setTimeout(checkReady, 0);
						}
					}

					checkReady();
					*/
				},
				function(args)
				{
					var onerror = args.error;
					if (typeof onerror === 'function') onerror();
				}
			);
		}
		return;
	}
	else if (editing)
	{
		if (typeof LianjaAppBuilder === "object") 
		{
			var editor = LianjaAppBuilder.getMemoEditor();
			var text = LianjaAppBuilder.getMemoField(controlsource);
			var doc = document.getElementById(containerid).contentWindow.document;
			doc.open();
			doc.write(editor);
			doc.close();

			Lianja.App.setMemoBuffer(containerid, text);
			
			function loadContent()
			{
				var contentWindow = document.getElementById(containerid).contentWindow;
				try 
				{
					contentWindow.setEditorData(text);
					Lianja.App.setMemoBuffer(containerid, contentWindow.getEditorData());
				}
				catch (e)
				{
					setTimeout(loadContent, 0);
				}
			}
			
			loadContent();	
		}
		else
		{
			var doc = document.getElementById(containerid).contentWindow.document;
			var contentWindow = document.getElementById(containerid).contentWindow;
			var args = {"doc" : doc, "contentWindow": contentWindow, "success": onsuccess, "error" : onerror, "containerid": containerid };
			// firstly read the text editor
			Lianja.cloudserver.getMemoEditor( 
				args,
				function(args, editor)
				{
					var contentWindow = document.getElementById(args.containerid).contentWindow;
					var doc = contentWindow.document;
					doc.open();
					doc.write(editor);
					doc.close();
					// now read the memo field from the server
					Lianja.cloudserver.getMemoField(controlsource, containerid, args,  
						function(args, text)	// success
						{
							var containerid = args.containerid;
							var contentWindow = document.getElementById(containerid).contentWindow;
							var doc = contentWindow.document;
							var onsuccess = args.onsuccess;

							Lianja.App.setMemoBuffer(containerid, text);
							
							function loadContent()
							{
								var contentWindow = document.getElementById(containerid).contentWindow;
								try 
								{
									contentWindow.setEditorData(text);
									Lianja.App.setMemoBuffer(containerid, contentWindow.getEditorData());
								}
								catch (e)
								{
									//console.log("setTimeout()");
									setTimeout(loadContent, 10);
								}
							}
							
							loadContent();	
														
						},
						function(args)				// error
						{
							var onerror = args.error;
							if (typeof onerror === 'function') onerror();
						}
					);
				},
				function(args)
				{
					var onerror = args.error;
					if (typeof onerror === 'function') onerror();
				}
			);
		}
	}
	else
	{
		if (typeof LianjaAppBuilder === "object") 
		{
			var text = LianjaAppBuilder.getMemoField(controlsource);
			var doc = document.getElementById(containerid).contentWindow.document;
			doc.open();
			doc.write(text);
			doc.close();
		}
		else
		{
			Lianja.App.setProperty(containerid+"_refreshMemoField", "active");
			var args = {"success": onsuccess, "error" : onerror, "containerid": containerid };
			Lianja.cloudserver.getMemoField(controlsource, containerid, args,  
				function(args, text)	// success
				{
					var doc = document.getElementById(args.containerid).contentWindow.document;
					var containerid = args.containerid;
					var onsuccess = args.onsuccess;
					doc.open();
					doc.write(text);
					doc.close();
					Lianja.App.setProperty(containerid+"_refreshMemoField", "");
					if (typeof args.success === 'function') args.success();
				},
				function(args)				// error
				{
					Lianja.App.setProperty(containerid+"_refreshMemoField", "");
					if (typeof args.error === 'function') args.error();
				}
			);
		}
	}
};

//================================================================================
window.Lianja.refreshEditBox = function(controlsource, containerid, adding, editing, onsuccess, onerror)
{
	var self = this;
	var pos = containerid.indexOf("-");
	var pageid = containerid.substring(0,pos);
	var page = Lianja.App.getPage(pageid);
	var canedit = $("#"+containerid).data("lianjaCanedit");
	if (typeof canedit === 'undefined') canedit = true;
	
	editing = page.editing || page.beforeedit;
	
	if (!editing && page.beforeediting) 
	{
		if (typeof onsuccess === 'function') onsuccess();
		return;
	}

	this.text = "";

	if (editing && canedit)
	{
		Lianja.App.setReadonly(containerid, false);
	}
	else if (!editing && canedit)
	{
		Lianja.App.setReadonly(containerid, true);
	}
	
	if (editing && adding)
	{
		$("#"+containerid).val(text);
		Lianja.App.setMemoBuffer(containerid, text);
		return;
	}
	else if (editing)
	{
		if (typeof LianjaAppBuilder === "object") 
		{
			var text = LianjaAppBuilder.getMemoField(controlsource);
			$("#"+containerid).val(text);
			Lianja.App.setMemoBuffer(containerid, text);
		}
		else
		{
			var args = {"success": onsuccess, "error" : onerror, "containerid": containerid };
			// now read the memo field from the server
			Lianja.cloudserver.getMemoField(controlsource, containerid, args,  
				function(args, text)	// success
				{
					$("#"+args.containerid).val(text);
					Lianja.App.setMemoBuffer(containerid, text);
				},
				function(args)				// error
				{
					//console.error("error reading memo for editing of "+args.containerid);
					var onerror = args.error;
					if (typeof onerror === 'function') onerror();
				}
			);
		}
	}
	else
	{
		if (typeof LianjaAppBuilder === "object") 
		{
			var text = LianjaAppBuilder.getMemoField(controlsource);
			$("#"+containerid).val(text);
		}
		else
		{
			var args = {"success": onsuccess, "error" : onerror, "containerid": containerid };
			Lianja.cloudserver.getMemoField(controlsource, containerid, args,  
				function(args, text)	// success
				{
					$("#"+args.containerid).val(text);
					if (typeof args.success === 'function') args.success();
				},
				function(args)				// error
				{
					if (typeof args.error === 'function') args.error();
				}
			);
		}
	}
};

//================================================================================
window.Lianja.refreshImageStrip = function(controlsource, containerid, onsuccess, onerror, sectionid)
{
	var self = this;
	var containerid = containerid;
	var url;
	var data =
	{
		"owl" : [
		  {"item" : "<span class='item'><h1>1</h1></span>"},
		  {"item" : "<span class='item'><h1>2</h1></span>"},
		  {"item" : "<span class='item'><h1>3</h1></span>"},
		  {"item" : "<span class='item'><h1>4</h1></span>"},
		  {"item" : "<span class='item'><h1>5</h1></span>"},
		  {"item" : "<span class='item'><h1>6</h1></span>"},
		  {"item" : "<span class='item'><h1>7</h1></span>"},
		  {"item" : "<span class='item'><h1>8</h1></span>"},
		  {"item" : "<span class='item'><h1>9</h1></span>"},
		  {"item" : "<span class='item'><h1>10</h1></span>"},
		  {"item" : "<span class='item'><h1>11</h1></span>"},
		  {"item" : "<span class='item'><h1>12</h1></span>"},
		  {"item" : "<span class='item'><h1>13</h1></span>"},
		  {"item" : "<span class='item'><h1>14</h1></span>"}
		]
	};
	
	controlsource = controlsource.toLowerCase();
	
	var cursor = Lianja.cloudserver.getCursor(controlsource);
	var table = controlsource.substring(0, controlsource.indexOf("."));
	url = "/odata/" + cursor.database + "/" + table + "?$select=" + controlsource.toLowerCase() + "&$format=img&$imgadd&$imgclick&$section=" + sectionid + "&$dataattributes=" + controlsource.toLowerCase() + ":" + containerid + "&_v=" + Lianja.App.seqno();
	
	if (typeof LianjaAppBuilder !== 'object' && controlsource.length > 0)
	{
		Lianja.cloudserver.OData("readhtml", url, null, 
			function(data, args) {		// success
				var imgarray = data.split("/>");
				var data = {"owl" : [] };
				for (var i=0; i<imgarray.length; ++i)
				{
					var imgtag = imgarray[i];
					if (imgtag.trim().length == 0) break;
					data.owl.push( { "item" : '<span class="item" >' + imgtag + '/></span>' } );
				}
				$("#"+containerid).owlCarousel(
				{
					jsonData : data,
					items : 6,
					maxSize : $("#"+containerid).height()-35,
					sectionid : sectionid
				});
				if (typeof onsuccess == 'function') onsuccess();
			},
			function ()			// error
			{
				if (typeof onerror == 'function') onerror();
			},
			{ "table": cursor.table, "controlsource": controlsource.toLowerCase() }
		);
		
		return;
	}	
	
	if (controlsource.length > 0)
	{
		var imgarray = LianjaAppBuilder.getImages(url).split("/>");
		data = {"owl" : [] };
		for (var i=0; i<imgarray.length; ++i)
		{
			var imgtag = imgarray[i];
			if (imgtag.trim().length == 0) break;
			data.owl.push( { "item" : '<span class="item" >' + imgtag + '/></span>' } );
		}
	}
	
	var max_height = $("#"+containerid).height()-35;
	
	$("#"+containerid).owlCarousel(
	{
		jsonData : data,
		items : 6,
		maxSize : max_height + "px"
	});
};

//================================================================================
window.Lianja.imageClicked = function(img, sectionid, table, rowid)
{
	var csr = Lianja.getCursor(table);
	csr._recno = rowid;
	csr.refresh();
	Lianja.App.dispatchDelegate(sectionid, "click"); 
};
	
//================================================================================
window.Lianja.imageDoubleClicked = function(img, sectionid, table, rowid)
{
	Lianja.App.dispatchDelegate(sectionid, "dblclick"); 
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
	
	if (url.substring(0, 9) == "library:/")
	{
		url = "../../../library/" + url.substring(9);
	}
	else if (url.substring(0, 9) == "wwwroot:/")
	{
		url = "../../../" + url.substring(9);
	}
	else if (url.substring(0, 5) == "lib:/")
	{
		url = "../../../library/" + url.substring(5);
	}
	else if (url.substring(0, 5) == "app:/")
	{
		url = "../" + url.substring(5);
	}

	if (!(url.indexOf("?") > 0 && (url.indexOf("?_v=") > 0 || url.indexOf("&v=") > 0)))
	{
		seqno = Lianja.App.seqno();
		if (url.indexOf("?") > 0) url = url + "&_v=" + seqno;
		else url = url + "?_v=" + seqno;
	}
	
	url = Lianja.App.getFullPathUrl(url);
	args.seqno = seqno;
	
	$.ajax({
		url: url,
		type: "get",
		crossDomain: true,
		dataType: "html",
		async:true,
		contentType: "application/html; charset=utf-8",
        //jsonpCallback: self.jsonpcallback,
		mycallback: callback,
		myargs: args,
		// callback handler that will be called on success
		success: function (response, textStatus, jqXHR) {
			if (typeof this.mycallback === 'function') this.mycallback(true, response, this.myargs);
		},
		// callback handler that will be called on failure
		error: function (jqXHR, textStatus, errorThrown) {
			if (typeof this.mycallback === 'function') this.mycallback(false, "", this.myargs);
		}
	});
};

//================================================================================
window.Lianja.showPage = function(pageid, sectionid, hidenavbar) {
	var contentdiv = pageid + "-content";

	Lianja.App.setCurrentPageID(pageid);
	Lianja.App.currentsectionid = sectionid;

	$('#'+contentdiv).simplesplitview('showLeft', sectionid, true, true);
	
	$('#'+contentdiv+"_rightcontainer").each(function() {
		$('#'+this.id).css("display", "none");
	});
	
	$('#'+sectionid).css("display", "block");
	$('#'+contentdiv+"_leftcontainer").css("display", "block");
	$('#'+contentdiv+"_rightcontainer").css("display", "block");
	if (hidenavbar)
	{
		$('#'+pageid+"-navbar").css("display", "none");
	}
	else
	{
		$('#'+pageid+"-navbar").css("display", "block");
	}
	
	Lianja.resizeContentPanel(pageid, sectionid, hidenavbar);
	Lianja.showNavigationPanel(pageid);
	
	$('#'+sectionid).focus();
	
	Lianja.App.relayout();	
};

//================================================================================
window.Lianja.resizeContentPanel = function(pageid, sectionid, hidenavbar)
{
	var contentdiv = pageid + "-content";
	
	$('#'+contentdiv).simplesplitview('adjustHeight', contentdiv, hidenavbar?0:43);
};

//================================================================================
window.Lianja.selectStackedSection = function(pageid, sectionid, hidenavbar) 
{
	var page = Lianja.App.getPage(pageid);
	var section;
	var count;

	for (var i=0; i<page.getSectionCount(); ++i)
	{
		section = page.getSection(i);
		section.hide();
	}
	
	Lianja.App.setCurrentPageID(pageid);
	Lianja.App.currentsectionid = sectionid;

	$('#'+sectionid).css("display", "block");

	if (typeof hidenavbar === 'undefined')
	{
		;
	}
	else if (hidenavbar)
	{
		$('#'+pageid+"-navbar").css("display", "none");
		Lianja.resizeContentPanel(pageid, sectionid, hidenavbar);
	}
	else
	{
		$('#'+pageid+"-navbar").css("display", "block");
		Lianja.resizeContentPanel(pageid, sectionid, hidenavbar);
	}
	
	var section = page.getSection(sectionid);
	if (section.parentid.length == 0)
	{	
		var rowid;
		if (section.cursor !== null)
		{
			rowid = section.cursor.getValue("__rowid");
		}
		if (typeof rowid === 'undefined') Lianja.refreshSection(sectionid);
	}
};

//================================================================================
window.Lianja.showNavigationPanel = function(pageid)
{
	if (pageid[0] == '#') pageid = pageid.substring(1);
	var id = pageid.toLowerCase() + "-navigationpanel-webview";
	var $navpanel = $("#" + id + "-content");

	if ($navpanel != null && typeof $navpanel === 'object')
	{
		var loaded = $($navpanel).data("lianjaLoadedPanel");
		if (typeof loaded === 'boolean' && loaded) return;
		Lianja.refreshWebView(id, false);
		$($navpanel).data("lianjaLoadedPanel", "true");
	}
};
	
//================================================================================
window.Lianja.showSection = function(pageid, sectionid, hidenavbar) {	
	var contentdiv = pageid + "-content";

	Lianja.showPage(pageid, sectionid, hidenavbar);

	var page = Lianja.App.getPage(pageid);
	var section = page.getSection(sectionid);
	if (section.parentid.length == 0)
	{	
		var rowid;
		if (section.cursor !== null)
		{
			rowid = section.cursor.getValue("__rowid");
		}
		if (typeof rowid === 'undefined') Lianja.refreshSection(sectionid);
	}
};

//================================================================================
window.Lianja.ignoreWheelEvent = function(e) {
    if (!e) { /* IE7, IE8, Chrome, Safari */ 
        e = window.event; 
    }
    if (e.preventDefault) { /* Chrome, Safari, Firefox */ 
        e.preventDefault(); 
    } 
    //e.returnValue = false; /* IE7, IE8 */
};
			
//================================================================================
window.Lianja.showPageNavBar = function(pageid, visible) {
	var contid = pageid.toLowerCase() + "-content";
	if (!visible)
	{
		$('#'+pageid+"-navbar").css("display", "none");
	}
	else
	{
		$('#'+pageid+"-navbar").css("display", "block");
	}
};
			
//================================================================================
window.Lianja.navHomePanel = function(contentdiv) {
	$('#'+contentdiv).simplesplitview('navHome');
};
			
//================================================================================
window.Lianja.navBackPanel = function(contentdiv) {
	$('#'+contentdiv).simplesplitview('navBack');
};


//================================================================================
function isDigit(text)
{
  var myCharCode = text.charCodeAt(0);

  if ((myCharCode > 47) && (myCharCode <  58)) return true;

  return false;
};


//================================================================================
function transform(text, picture)
{
	var ndecs = 0;
	var digits;
	var decs;
	var decpos;
	
	picture = ""+picture;
	decpos = picture.indexOf(".");
	if (decpos >= 0) 
	{
		ndecs = picture.substring(decpos+1).length;
		if (typeof text === 'string') text = parseFloat(text);
		if (typeof text === "number") text = text.toFixed(ndecs);
		text = ""+text;
		decpos = text.indexOf(".");
		if (decpos >= 0) 
		{
			digits = text.substring(0, decpos);
			decs = text.substring(decpos+1).length;
			if (decs > ndecs)
			{
				text = digits + "." + text.substring(decpos+1, decpos+1+ndecs);
			}
			else if (decs < ndecs)
			{
				decimals = text.substring(decpos+1);
				while (decimals.length < ndecs) decimals = decimals + "0";
				text = digits + "." + decimals;
			}
		}
	}
	else
	{
		text = ""+text;
	}	
	
	this.getTransformMask = function(mask)
	{
		var umask = mask.toUpperCase();
		
		if (umask === "@C2") 
		{
			//mask = "€999.999.999.9999";
			mask = "$999,999,999.99";
			return mask;
		}
		else if (umask === "@C3") 
		{
			//mask = "€999.999.999.9999";
			mask = "$999,999,999.999";
			return mask;
		}
		else if (umask === "@C4") 
		{
			//mask = "€999.999.999.9999";
			mask = "$999,999,999.9999";
			return mask;
		}
		else if (umask === "@C5") 
		{
			//mask = "€999.999.999.9999";
			mask = "$999,999,999.99999";
			return mask;
		}
		else if (umask === "@C6") 
		{
			//mask = "€999.999.999.9999";
			mask = "$999,999,999.99999";
			return mask;
		}
		
		return undefined;
	};
	
	if (picture[0] == '@')
	{
		picture = this.getTransformMask(picture);
		if (typeof picture === 'undefined') return text;
	}
	
	var prefix = picture[0];
	var textdecpos = text.indexOf(".");
	var textndecs = textdecpos < 0 ? -1 : text.substring(textdecpos+1).length;
	var decpos = picture.indexOf(".");
	var ndecs = decpos < 0 ? 0 : picture.substring(decpos+1).length;
	if (ndecs > 0 && textndecs < 0) text = text + "." + replicate("0", ndecs);
	text = Inputmask.format(text,{alias: picture, groupSeparator:",", numericInput:true, radixPoint:".", placeholder:"", digitsOptional:true});
	text = str_replace(",,", "", text);
	if (text.length > 2 && text[1] == ',' && !isDigit(text[0]))
	{		
		text = text.substring(2);
		if (!isDigit(prefix)) text = prefix + text;
	}
	return text;
};
function tran(text, picture)
{
	return transform(""+text, picture);
};

//================================================================================
function currency(value, ndecs)
{
	if (typeof ndecs !== 'number' || ndecs < 2) ndecs = 2;
	var mask = Lianja.App.currency + "999,999,999,999.";
	for (var decpos=0; decpos<ndecs; ++decpos) mask += "9";
	return transform(value, mask);
};


//================================================================================
window.Lianja.stripNumericMask = function(text)
{
	var ch;
	var newtext = "";
	var i;
	text = ""+text;
	var len = text.length;
	
	for (i=0; i<len; ++i)
	{
		ch = text[i];
		if (ch == '.' || isDigit(ch))
		{
			newtext += ch;
		}
	}
	
	return newtext;
};

	
//================================================================================
window.Lianja.setInputMask = function(input, mask, text)
{
	var digits = -1;
	var integerDigits = 20;
	var prefix = "";
	var asize;

	//console.log("setInputMask() mask="+mask);
	mask = ""+mask;
	mask = mask.toUpperCase();
	
	if (mask === "@9") 
	{
		mask = "integer";
	}
	else if (mask === "@C2")
	{	
		digits = 2;
	}
	else if (mask === "@C3")
	{	
		digits = 3;
	}
	else if (mask === "@C4") 
	{
		digits = 4;
	}
	else if (mask === "@C5") 
	{
		digits = 5;
	}
	else if (mask === "@C6") 
	{
		digits = 6;
	}
	
	if (digits > 0)
	{
		input.type = "text";
		$(input).val( Lianja.stripNumericMask(text) );
		$(input).inputmask({alias:'numeric', 
							rightAlign: false, 
							groupSeparator: Lianja.App.separator, 
							radixPoint: Lianja.App.point,
							autoGroup:true, 
							digitsOptional: false, 
							prefix: Lianja.App.currency, 
							placeholder: '0', 
							digits:digits, 
							autoUnmask:true 
						   });
		return;
	}	
	
	integerDigits = -1;
	if (mask === "number") 
	{
		mask = "decimal";
	}	
	else if (mask === "999.99") 
	{
		integerDigits = 3;
		digits = 2;
		mask = "decimal";
	}
	else if (mask === "9999.99") 
	{
		integerDigits = 4;
		digits = 2;
		mask = "decimal";
	}
	else if (mask === "99999.99") 
	{
		integerDigits = 5;
		digits = 2;
		mask = "decimal";
	}
	else if (mask === "999999.99") 
	{
		integerDigits = 6;
		digits = 2;
		mask = "decimal";
	}
	else if (mask === "9999999.99") 
	{
		integerDigits = 7;
		digits = 2;
		mask = "decimal";
	}
	else if (mask === "99999999.99") 
	{
		integerDigits = 8;
		digits = 2;
		mask = "decimal";
	}
	else if (mask === "9,999.99") 
	{
		integerDigits = 4;
		digits = 2;
		mask = "numeric";
	}
	else if (mask === "99,999.99") 
	{
		integerDigits = 5;
		digits = 2;
		mask = "numeric";
	}
	else if (mask === "999,999.99") 
	{
		integerDigits = 6;
		digits = 2;
		mask = "numeric";
	}
	else if (mask === "9,999,999.99") 
	{
		integerDigits = 7;
		digits = 2;
		mask = "numeric";
	}
	else if (mask === "99,999,999.99") 
	{
		integerDigits = 8;
		digits = 2;
		mask = "numeric";
	}
	else if (mask === "999,999,999.99") 
	{
		integerDigits = 9;
		digits = 2;
		mask = "numeric";
	}
	else if (mask === "999,999,999,999.99") 
	{
		integerDigits = 10;
		digits = 2;
		mask = "numeric";
	}
	
	if (integerDigits > 0)
	{
		input.type = "text";
		$(input).val( Lianja.stripNumericMask(text) );
		$(input).inputmask({alias:'numeric', 
							rightAlign: false, 
							groupSeparator: Lianja.App.separator, 
							radixPoint: Lianja.App.point,
							autoGroup:true, 
							digitsOptional: false, 
							prefix: "", 
							placeholder: '0', 
							digits:digits, 
							autoUnmask:true,
							integerDigits:integerDigits
						   });
		return;
	}
	
	if (mask === "@X")
	{		
		mask = "";
	}
	else if (mask === "@A") 
	{
		mask = "";
	}
	else if (mask === "@I") 
	{
		mask = "integer";
	}
	else if (startswith(mask,"@F")) 
	{
		asize = mask.substring(2).split(",");
		integerDigits = parseInt(asize[0]);
		digits = parseInt(asize[1]);
		if (digits > 0) mask = "decimal";
		else mask = "decimal";
		mask = "numeric";
		$(input).inputmask({alias:'numeric', 
							rightAlign: false, 
							radixPoint: Lianja.App.point,
							digitsOptional: false, 
							prefix: "", 
							placeholder: '0', 
							digits:digits, 
							autoUnmask:true,
							integerDigits:integerDigits
						   });
		return;
	}
	
	mask = mask.toLowerCase();
	//console.log("mask="+mask+", integerDigits="+integerDigits+", digits="+digits+", text="+text);
	if (mask[0] == '^' || mask[0] == '!')
	{
		$(input).inputmask(mask, { 
								   autoUnmask:false,
								   rightAlign: false
								 } 
						  );
	}
	else if (digits < 0)
	{
		$(input).inputmask(mask, { 
								   autoUnmask:true, 
								   numericInput: true,
								   rightAlign: false
								 } 
						  );
	}
	else if (integerDigits < 0)
	{
		$(input).inputmask(mask, { 
								   digits: digits, 
								   autoUnmask:true, 
								   numericInput: true,
								   rightAlign: false
								 } 
						  );
	}
	else
	{
		$(input).inputmask(mask, { 
								   integerDigits: integerDigits,
								   digits: digits, 
								   autoUnmask:true, 
								   numericInput: true,
								   rightAlign: false
								 } 
						  );
	}
};

//================================================================================
window.Lianja.expandMacros = function(pageid, sectionid, text, callback, args, val) {
	if (typeof LianjaAppBuilder === "object") 
	{
		if (typeof val !== 'undefined') text = str_replace("{}", ""+val, text);
		return LianjaAppBuilder.expandMacros(pageid, sectionid, text);
	}
	else
	{
		if (typeof callback !== 'function')
		{
			return text;
		}
		args.maincallback = callback;
		Lianja.cloudserver.expandMacros(pageid, sectionid, text, 
			function(text, args) {
				if (typeof args.completed !== 'undefined') return;
				args.completed = true;
				args.maincallback(text, args);
			},
			args,
			val
		);
		return text;
	}
};

//================================================================================
window.Lianja.expandMacrosSync = function(pageid, sectionid, text) {
	if (typeof sectionid === 'undefined' && typeof text === 'undefined')
	{
		text = pageid;
		pageid = "";
		sectionid = "";
	}
	if (text.indexOf("{") < 0) return text;
	if (typeof LianjaAppBuilder === "object") 
	{
		return LianjaAppBuilder.expandMacros(pageid, sectionid, text);
	}
	else
	{
		return Lianja.cloudserver.expandMacrosSync(pageid, sectionid, text); 
	}
};

//================================================================================
window.Lianja.generateUUID = function() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid.toUpperCase();
};

//================================================================================
window.Lianja.updateMemo = function(database, table, controlsource, text, onsuccess, onerror)
{
	var self = this;
	this.onsuccess = onsuccess;
	this.onerror = onerror;
	
	if (typeof LianjaAppBuilder === "object") 
	{
		var result = LianjaAppBuilder.updateMemoField(controlsource, text);
		if (result == "Ok") 
		{
			if (typeof self.onsuccess === 'function') 
			{
				self.onsuccess();
			}
			return true;
		}
		if (typeof self.onerror === 'function') 
		{
			self.onerror();
		}
		return false;
	}
	else
	{
		Lianja.cloudserver.updateMemoField(database, table, controlsource, text, onsuccess, onerror);
		return true;
	}
};

//================================================================================
window.Lianja.OData = function(pkt)
{
	var type = pkt.type;				// create, read, update, delete, evaluate
	var url = pkt.url;					// baseurl
	var data = pkt.data;				// baseurl
	var params = pkt.params;			// [ 
										// { 'name': 'page', 'value': xxx }, 
										// { 'name': 'rp', 'value': xxx }, 
										// { 'name': 'type', 'value': 'section|cursor' },
										// { 'name': 'section', 'value': 'page1-section1' },
										// { 'name': 'user', 'value': user },
										// { 'name': 'app', 'value': app },
										// { 'name': 'database', 'value': 'southwind' },
										// { 'name': 'table', 'value': 'orders' },
	var dataType = pkt.dataType;		// 'json', 'jsongrid'
	var success_callback = pkt.success;	// success function(data)
	var error_callback = pkt.error;		// error function(XMLHttpRequest, textStatus, errorThrown) 
	var async = pkt.async;
	var args = pkt.args;
	var page;
	var pagesize;

	if (typeof data !== 'string') data = "";
	if (typeof params === 'undefined') params = [];
	if (typeof async === 'undefined') async = true;
	
	for (var i=0; i<params.length; ++i)
	{
		if (params[i].name == "page") page = params[i].value;
		if (params[i].name == "rp") pagesize = params[i].value;
	}
	
	if (typeof page !== "undefined") url = url + "&$page=" + page;
	if (typeof pagesize !== "undefined") url = url + "&$pagesize=" + pagesize;
	
	if (url.indexOf("?") > 0) url = url + "&_v=" + Lianja.App.seqno();
	else url = url + "?_v=" + Lianja.App.seqno();

	if (typeof LianjaAppBuilder !== "object")
	{
		var rc = Lianja.cloudserver.OData(type, url, data, 
			function(result, pkt) {
				if (typeof result === 'object')
				{
					//console.log(result);
					if (typeof result.rows !== 'undefined') success_callback(result, pkt.args);
					else
					{
						if (typeof result.d !== 'undefined') success_callback(result.d.results, result.d.__count, pkt.args, result.d.__primarykey, result.d.__datatypes);
						else success_callback(result, 1, pkt.args);
					}
					return;
				}			
				if (result[0] == '{')
				{
					success_callback($.parseJSON(result), args);
				}
				else if (result === "Ok")
				{
					success_callback(null);
				}
				else if (result.length > 2 && result.substring(0, 6) !== "error:")
				{
					success_callback($.parseJSON(result), args);
				}
				else
				{
					if (result.substring(0, 6) === "error:")
					{
						if (typeof error_callback !== 'undefined') error_callback(null, result.substr(6), null);
					}
					else
					{
						if (typeof error_callback !== 'undefined') error_callback(null, null, null);
					}
				}
			},
			function(pkt)
			{
				if (error_callback !== 'undefined') error_callback(pkt.args);
			},
			pkt,
			async);
		return rc;
	}
		
	if (type == 'readsync') type = 'read';
	var result = LianjaAppBuilder.OData(type, url, data);
	
	if (result[0] == '{')
	{
		success_callback($.parseJSON(result), 1, args);
	}
	else if (result === "Ok")
	{
		success_callback(null, 1, args);
	}
	else if (result.length > 2 && result.substring(0, 6) !== "error:")
	{
		success_callback($.parseJSON(result), 1, args);
	}
	else
	{
		if (result.substring(0, 6) === "error:")
		{
			if (typeof error_callback !== 'undefined') error_callback(null, result.substr(6), null);
		}
		else
		{
			if (typeof error_callback !== 'undefined') error_callback(null, null, null);
		}
	}
	return result;
};

//================================================================================
window.Lianja.Odata_Translate = function(text)
{
	text = str_replace("<>", " ne ", text);
	text = str_replace(">=", " ge ", text);
	text = str_replace(">", " gt ", text);
	text = str_replace("<=", " le ", text);
	text = str_replace("<", " lt ", text);
	text = str_replace(">=", " ge ", text);
	text = str_replace(">=", " ge ", text);
	text = str_replace("!=", " ne ", text);
	text = str_replace("=", " eq ", text);
	return text;
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
		url: Lianja.App.getFullPathUrl(url),
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
	
	$.ajax({
		url: Lianja.App.getFullPathUrl(url),
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

	$.ajax({
		url: Lianja.App.getFullPathUrl(url),
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
};

//================================================================================
window.Lianja.OData_ReadJSON = function(url, callback, args, async)
{
	if (typeof async !== 'boolean') async = true;
	if (typeof callback === 'undefined') async = false;

	$.ajax({
		url: Lianja.App.getFullPathUrl(url),
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
		url: Lianja.App.getFullPathUrl(url),
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
			//console.log(response);
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
		url: Lianja.App.getFullPathUrl(url),
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
			//console.log(response);
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

	if (typeof async !== 'boolean') async = false;	// BM-async
	if (typeof callback === 'undefined') async = false;
	if (typeof data === 'object') data = JSON.stringify(data);

	//var pos = url.indexOf("?");
	//if (pos > 0) url = url.substring(0,pos);

	var request = $.ajax({
		url: Lianja.App.getFullPathUrl(url),
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
window.Lianja.pageAction = function(pageid, action, arg)
{
	var self = this;
	if (pageid[0] == '#') pageid = pageid.substr(1);
	var page = Lianja.App.getPage(pageid);
	var valid = true;
	
	this.pageid = pageid;
	this.action = action;
	this.arg = arg;

	if (action === "_delete")
	{
		page.dirty = true;
		page.dirtysections = [];
		page._delete( 
			function(data) {
				Lianja.performPageAction(self.pageid, self.action, self.arg);
				Lianja.showSuccessMessage("Record was deleted");
			},
			function(jqXHR, textStatus, errorThrown) {
				Lianja.showErrorMessage("Could not delete record", "Delete failed");
			}
		);
		return true;
	}	
	else if (action === "_add")
	{
		page.dirty = true;
		page.dirtysections = [];
		page.create( 
			function(data) {
				Lianja.showSuccessMessage("Record was created");
				if (typeof data === 'object')
				{
					Lianja.performPageAction(self.pageid, "goto", data);
				}
				else
				{
					Lianja.performPageAction(self.pageid, self.action, self.arg);
				}
				Lianja.enableNavigationButtons();
			},
			function(jqXHR, textStatus, errorThrown) {
				Lianja.showSuccessMessage("Could not create record", "Create record failed");
			}
		);
		return true;
	}	
	else if (action === "_validationcomplete")
	{
		Lianja.savePage(pageid);
		self.action = "_save";
	}
	else if (page.editing)
	{
		Lianja.validatePage(pageid);
		return false;
	}
	else if (action === "_save" && page.dirty)
	{
		;	// handle updating of canvas sections
	}
	else
	{
		page.dirty = false;
		page.dirtysections = [];
	}
	
	if (page.dirty)
	{
		this.adding = page.adding;
		page.update( 
			function(data) {
				if (!self.adding)
				{
					Lianja.performPageAction(self.pageid, self.action, self.arg);
					Lianja.showSuccessMessage("Record was updated");
				}
				else
				{
					if (typeof data === 'object')
					{
						Lianja.performPageAction(self.pageid, "goto", data);
						self.page.editing = false;
						self.page.adding = false;
					}
					Lianja.showSuccessMessage("Record was created");
				}
				self.page.editing = false;
				self.page.adding = false;
				Lianja.enableNavigationButtons();
			},
			function(jqXHR, textStatus, errorThrown) {
				if (!self.adding)
				{
					Lianja.showErrorMessage("Record could not be updated", "Update failed");
				}
				else
				{
					Lianja.showErrorMessage("Record could not be created", "Create failed");
				}
			}
		);
	}
	else
	{
		Lianja.performPageAction(this.pageid, this.action, this.arg);
	}
	
	return valid;
};

//================================================================================
window.Lianja.savePage = function(pageid)
{
	var page = Lianja.App.getPage(pageid);
	var searchkeysectionid = page.searchkeysectionid;
	var section;
	var count;
	var formitem;
	var valid = true;

	Lianja.App.savingpage = page;
	Lianja.App.clearControlSourceSaved();
	
	page.dirtysections = [];
	
	for (var i=0; i<page.getSectionCount(); ++i)
	{
		section = page.getSection(i);
		valid = Lianja.saveSection(section.pageid, section.id);
		if (!valid) return false;
		if (section.dirty) page.addDirtySection(section);
	}
	
	return valid;
};

//================================================================================
window.Lianja.saveSection = function(pageid, sectionid)
{
	var page = Lianja.App.getPage(pageid);
	var section;
	var count;
	var formitem;
	var valid = true;
	var dirty = false;
	
	section = page.getSection(sectionid);
	if (section.type === 'form')
	{
		count = section.getFormItemCount();
		for (var i=0; i<count; ++i)
		{
			formitem = section.getFormItem(i);
			valid = Lianja.saveField(formitem.pageid, formitem.sectionid, formitem.id);
			if (!valid) return false;
			dirty = dirty || formitem.dirty;
		}
	}
	else if (section.type == 'webview' && section.editable)
	{
		Lianja.saveMemo(section, section.sectionid);
	}
	else if (section.type === 'canvas')
	{
		dirty = page.dirty;
	}
	
	section.dirty = dirty;
	section.txcount = -1;
	return valid;
};

//================================================================================
window.Lianja.saveField = function(pageid, sectionid, formitemid)
{
	var valid = true;
	var page = Lianja.App.getPage(pageid);
	var section = page.getSection(sectionid);
	var formitem = section.getFormItem(formitemid);
	var formitemtype = formitem.formitemtype;
	
	if (typeof formitemtype === "undefined" || formitemtype == null)
	{
		var element = $("#"+formitemid);
		formitemtype = element.data("lianjaFormitemType");
		if (typeof formitemtype === "undefined" || formitemtype == null)
		{
			element = $("#"+formitemid+"-content");
			formitemtype = element.data("lianjaFormitemType");
		}
		if (formitemtype === 'memo')
		{
			Lianja.saveMemo(this.section, formitemid);
		}
		else if (formitemtype === 'editbox')
		{
			Lianja.saveEditBox(this.section, formitemid);
		}
		return true;
	}

	if (formitemtype != "field")
	{
		return true;
	}

	return formitem.save(true);
};

//================================================================================
window.Lianja.validatePage = function(pageid)
{
	var page = Lianja.App.getPage(pageid);
	var searchkeysectionid = page.searchkeysectionid;
	var section;
	var count;
	var formitem;

	Lianja.App.clearValidationFormItems();
	
	for (var i=0; i<page.getSectionCount(); ++i)
	{
		section = page.getSection(i);
		Lianja.validateSection(section.pageid, section.id);
	}
	
	if (Lianja.App.validationFormItemsCount() > 0)
	{
		Lianja.App.validationerror = false;
		Lianja.App.validationcount = validationFormItemsCount();
		
		var cnt = Lianja.App.validationFormItemsCount();
		for (var i=0; i<cnt; ++i)
		{
			if (Lianja.App.validationerror) break;
			var obj = Lianja.App.validationFormItem(i);
			var pageid = obj.pageid;
			var sectionid = obj.sectionid;
			var formitem = obj.formitem;
			Lianja.validate(pageid, sectionid, formitem, formitem.input,
				function(pageid, sectionid, formitem, input)			// onsuccess
				{
					Lianja.App.validationcount -= 1;
					if (Lianja.App.validationerror) return;
					if (Lianja.App.validationcount == 0)
					{
						Lianja.pageAction(pageid, "_validationcomplete");
					}
				},
				function(pageid, sectionid, formitem, input, errmsg)	// onerror
				{
					Lianja.App.validationcount -= 1;
					Lianja.showErrorMessage(errmsg);
					if (Lianja.App.validationerror) return;
					$(input).focus();
					Lianja.App.validationerror = true;
				}					
			);
		}
	}
	else
	{
		Lianja.pageAction(pageid, "_validationcomplete");
	}
};

//================================================================================
window.Lianja.validateSection = function(pageid, sectionid)
{
	var page = Lianja.App.getPage(pageid);
	var section;
	var count;
	var formitem;
	var valid = true;
	var dirty = false;
	
	section = page.getSection(sectionid);
	if (section.type === 'form')
	{
		count = section.getFormItemCount();
		for (var i=0; i<count; ++i)
		{
			formitem = section.getFormItem(i);
			Lianja.validateField(formitem.pageid, formitem.sectionid, formitem.id);
		}
	}
};

//================================================================================
window.Lianja.validateField = function(pageid, sectionid, formitemid)
{
	var page = Lianja.App.getPage(pageid);
	var section = page.getSection(sectionid);
	var formitem = section.getFormItem(formitemid);
	var formitemtype = formitem.formitemtype;
	
	if (typeof formitemtype === "undefined" || formitemtype == null)
	{
		return;
	}

	if (formitemtype != "field")
	{
		return;
	}

	var validationexpression = $("#"+formitem.id).data("lianjaValidation");
	if (validationexpression === null || typeof validationexpression === 'undefined') return;

	lianja.App.addValidationFormItem( { pageid: pageid, sectionid: sectionid, inline:false, formitem: formitem } );

};

//================================================================================
window.Lianja.resetEditors = function(pageid)
{
	if (pageid[0] == '#') pageid = pageid.substr(1);
	var page = Lianja.App.getPage(pageid);
	
	if (page.editing)
	{
		++page.txcount;
		Lianja.editPage(false, pageid, false);
		page.editing = false;
		page.adding = false;
		page.dirty = false;
	}
	
	return true;
};

//================================================================================
window.Lianja.editPage = function(editing, pageid, adding)
{
	var page = Lianja.App.getPage(pageid);
	var searchkeysectionid = page.searchkeysectionid;
	var section;
	var count;
	var formitem;
	var nwebviews = 0;
	var esection;

	//if (page.editing == state) return;
	
	page.editing = editing;
	page.adding = adding;
	
	if (Lianja.isPhoneGap())
	{
		for (var i=0; i<page.getSectionCount(); ++i)
		{
			var section = page.getSection(i);
			if (section.type === 'webview' && section.editable)
			{
				nwebviews++;
				esection = section;
			}
		}
		
		if (nwebviews === 1)
		{
			for (var i=0; i<page.getSectionCount(); ++i)
			{
				var section = page.getSection(i);
				if (adding)
				{
					if (!section.checkCreatePermission())
					{
						Lianja.showMessage("You do not have permission to perform this operation");
						continue;
					}
				}
				else
				{
					if (!section.checkUpdatePermission())
					{
						Lianja.showMessage("You do not have permission to perform this operation");
						continue;
					}
				}
				if (section.type === 'webview' && section.editable)
				{
					Lianja.refreshWebView(section.sectionid, page.adding);
					var outerframe = $("#"+esection.sectionid+"-container-outerframe");
					var innerframe = $("#"+esection.sectionid+"-container-innerframe");
					var sht = $("#"+esection.sectionid).css("height");
					if (typeof sht === 'string')
					{
						var ppos = sht.indexOf("px");
						if (ppos > 0 && ppos == sht.length-2) sht = parseFloat(sht.substring(0, ppos));
					}
					sht = sht + 83;
					$("#"+esection.sectionid).css("height", sht+"px");
					$(outerframe).css("max-height", undefined);
					$(outerframe).css("height", '100%');
					$(innerframe).css("max-height", undefined);
					$(innerframe).css("height", '100%');
				}
				else
				{
					if (editing) section.hide();
					else section.show();
				}
			}
			return;
		}
	}
	
	for (var i=0; i<page.getSectionCount(); ++i)
	{
		var section = page.getSection(i);
		if (adding)
		{
			if (!section.checkCreatePermission())
			{
				Lianja.showMessage("You do not have permission to perform this operation");
				continue;
			}
		}
		else
		{
			if (!section.checkUpdatePermission())
			{
				Lianja.showMessage("You do not have permission to perform this operation");
				continue;
			}
		}
		if (section.parentid.length > 0 && (section.type == "grid" || section.type == "attachments"))
		{
			if (adding) section.grid.clear();
		}
		else
		{
			Lianja.editSection(editing, section.pageid, section.id);
		}
	}
};

//================================================================================
window.Lianja.editSection = function(editing, pageid, sectionid)
{
	var page = Lianja.App.getPage(pageid);
	var section;
	var count;
	var formitem;
	var input;
	
	section = page.getSection(sectionid);
	section.dirty = false;
	
	if (!section.checkUpdatePermission())
	{
		Lianja.showMessage("You do not have permission to perform this operation");
		return;
	}

	if (section.type === 'form')
	{
		if (Lianja.isPhoneGap() && Lianja.mobiledevice.Android() != null && Lianja.mobiledevice.Android() && Lianja.App.targetui === "phone")
		{
			var id = pageid+"-"+sectionid;
			// BM: need to set the height on the section otherwise it can't be touch scrolled when the keyboard is shown
			if (editing) 
			{
				var el = $(document).find('.ui-lianja-phonegap-hidden');
				$(el).css("display", "none");
				if (!section.hideheader) section.realheight = undefined;
				else if (typeof section.realheight === 'undefined') section.realheight = $("#"+id).height();
				$("#"+id).css("height", "235px");
				$("#"+id).scrollTop(0);
			}
			else
			{				
				var el = $(document).find('.ui-lianja-phonegap-hidden');
				$(el).css("display", "block");
				if (typeof section.realheight === 'undefined') $("#"+id).css("height", "auto");
				else $("#"+id).css("height", section.realheight+"px");
				$("#"+id).scrollTop(0);
				section.realheight = undefined;
			}
		}
		
		count = section.getFormItemCount();
		for (var i=0; i<count; ++i)
		{
			formitem = section.getFormItem(i);
			if (page.adding) formitem.clear();
			input = Lianja.editField(editing, false, formitem.pageid, formitem.sectionid, formitem.id);
			if (editing && typeof input !== 'undefined' && i === 0) $(input).focus();
		}
	}
	else if (section.type === 'webview' && section.editable && !Lianja.isPhoneGap())
	{
		Lianja.refreshWebView(section.sectionid, page.adding);
	}
};

//================================================================================
window.Lianja.linkClicked = function(id, controlsource, delegate, text)
{
	var text = $("#"+id).text().trim();
	var code = delegate + "('" + controlsource + "','" + text + "')";
	eval(code);
	return false;
};

//================================================================================
window.Lianja.linkClickedGridColumn = function(controlsource, delegate, text)
{
	if (typeof delegate === 'undefined' || delegate.length === 0) return;
	var code = delegate + "('" + controlsource + "','" + text + "')";
	eval(code);
	return false;
};

//================================================================================
window.Lianja.linkClickedGridColumnDeferred = function(controlsource, delegate, text, pageid, sectionid, row)
{
	if (typeof delegate === 'undefined' || delegate.length === 0) return;
	var page = Lianja.App.getPage(pageid);
	var section = page.getSection(sectionid);
	section.grid.deferredLinkClick = { "controlsource":controlsource, "delegate":delegate, "text": text };
	return false;
};

//================================================================================
window.Lianja.editField = function(state, inline, pageid, sectionid, formitemid)
{
	var self = this;
	var editing = $("#"+formitemid).data("editing");
	if (typeof editing == 'string' && state && editing == 'true') 
	{
		return;
	}
	if (typeof editing == 'string' && editing == "reset") 
	{
		$("#"+formitemid).data("editing", "false");
		$("#"+formitemid + "-inlineediticon").data("editing", "false");
		return;
	}

	var mobile = Lianja.isMobile();
	var supportsdate = Lianja.supportsDate();
	var supportsdatetime = Lianja.supportsDateTime();
	this.pageid = pageid;
	this.page = Lianja.App.getPage(pageid);
	this.section = this.page.getSection(sectionid);
	this.formitem = this.section.getFormItem(formitemid);
	this.ok = null;
	this.cancel = null;
	this.formitem.dirty = false;
	
	if (!this.formitem.checkUpdatePermission()) return;
	
	if (typeof this.formitem.formitemtype === "undefined" || this.formitem.formitemtype == null)
	{
		var element = $("#"+formitemid);
		formitemtype = element.data("lianjaFormitemType");
		if (typeof formitemtype === "undefined" || formitemtype == null)
		{
			element = $("#"+formitemid+"-content");
			formitemtype = element.data("lianjaFormitemType");
		}
		if (formitemtype === 'memo')
		{
			Lianja.refreshMemo(this.section, formitemid, state, this.page.adding);
		}
		else if (formitemtype === "editbox")
		{
			var controlsource = element.data("lianjaControlsource");
			Lianja.refreshEditBox(controlsource, formitemid+"-content", this.page.adding, this.page.editing);
		}
		return;
	}

	if (this.formitem.formitemtype === "image" && this.page.adding)
	{
		Lianja.refreshImage(this.section, formitemid, true);
		return;
	}

	if (this.formitem.formitemtype != "field")
	{
		return;
	}
	
	$("#"+formitemid).data("formitem", this.formitem);
	
	if (inline) this.section.setCurrentEditor(state, formitemid);
	else this.section.setCurrentEditor(state, "");
	
	this.formitemid = formitemid;
	this.type = this.formitem.inputtype;
	this.pageid = pageid;
	this.sectionid = sectionid;
	
	var text = $("#"+formitemid).text().trim();
	text = str_replace("<a>", "", text);
	text = str_replace("</a>", "", text);
	var readonly = $("#"+formitemid).data("lianjaReadonly");
	
	if (typeof readonly !== 'undefined')
	{
		if (readonly && inline) 
		{
			return;
		}
	}
	
	if (state)
	{
		var datetimehtml = "";
		var table = document.createElement('table');
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		var input;
		var combobox = false;
		var dynamiccombobox = false;
		if (this.formitem.choicelist.length > 0) 
		{
			combobox = true;
			input = document.createElement('select');
			if (startswith(this.formitem.choicelist.toLowerCase(), "select ") || startswith(this.formitem.choicelist.toLowerCase(), "+select "))
			{
				dynamiccombobox = true;
				new Lianja.addDynamicComboItems(input, this.section.database, this.formitem.choicelist, text); 
			}
			else if (this.formitem.choicelist[0] == '{')
			{
				dynamiccombobox = true;
				new Lianja.addDynamicComboItemsExpression(input, this.formitem.choicelist, text); 
			}
			else
			{
				var alist = this.formitem.choicelist.split(",");
				_.each(alist, function(item)
				{
					var option = document.createElement("option");
					option.text = item;
					option.value = item;
					$(input).append(option); 
				});
			}
		}
		else
		{		
			input = document.createElement('input');
		}
		this.ok = inline ? document.createElement('div') : null;
		this.cancel = inline ? document.createElement('div') : null;
		this.formitem.editortype = this.type;
		
		$(table).css( "width", "100%");
		$(table).css( "height", $("#"+formitemid).height-4 );
		$(table).css( "max-height" , $("#"+formitemid).height-4 );
		$(table).css( "padding", "0");
		
		table.cellSpacing = "0";
		table.cellPadding = "0";

		tr.vAlign = "top";
		
		$(table).append(tr);
		$(tr).append(td);
		$(td).css( "width", "100%");
		
		var isdate = this.type == 'date';
		var isdatetime = this.type == 'datetime';
		if (!mobile && (Lianja.isChrome()||Lianja.isIE11()) && this.type == 'date')  this.type = 'text';
		else if (!mobile && (Lianja.isChrome()||Lianja.isIE11()) && this.type == 'datetime')  this.type = 'text';
		else if (!combobox) 
		{
			if (this.type === 'datetime') this.type = "datetime-local";
			input.type = this.type;
		}
		
		if (this.type === 'checkbox') 
		{
			if (Lianja.isPhoneGap()) $(input).checkboxpicker();
			$(input).prop('checked', text === 'Yes' || text === "true");
		}
		else 
		{
			$(input).val(text);
		}

		var added = false;
		
		if (!mobile && !supportsdate && isdate)
		{
			input.type = "text";
			$(td).append(input);
			added = true;
			if (Lianja.App.locale !== 'en')
			{
				$(input).datepicker(
				{
						format: 'yyyy-mm-dd', 
						autoclose:true,
						language:Lianja.App.locale
				})
					.on('changeDate', function(ev) {
						$(input).datepicker('hide');
				});
			}
			else
			{
				$(input).datepicker({format: 'yyyy-mm-dd', autoclose:true})
					.on('changeDate', function(ev) {
						$(input).datepicker('hide');
				});
			}
			$(input).datepicker("setValue", text);
		}
		else if (!mobile && !supportsdatetime && isdatetime)
		{
			;
		}
		else 
		{
			isdatetime = false;
		}
		input.id = formitemid + "-editor";
		$("#"+formitemid).text("");
		$(input).css( "height", $("#"+formitemid).height-4 );
		$(input).css( "max-height" , $("#"+formitemid).height-4 );
		$(input).css( "padding", "0");
		$(input).data("formitem", this.formitem);
		$(input).data("oldvalue", text);
		$("#"+formitemid).data("editing", "true");
		$("#"+formitemid+"-inlineediticon").data("editing", "true");
        $("#"+formitemid).append(table);
		if (isdatetime)
		{
			var div = document.createElement("div");
			$(div).addClass("input-append date form_datetime");
			$(div).css("padding-right", "22px");
			$(td).append(div);
			$(div).append(input);
			$(div).append('<span class="add-on" style="padding:2px;width:16px;height:16px;"><i class="icon-calendar" style="position:relative;"></i></span>');
			$(input).data("format", "yyyy-MM-dd");
			$(input).css("border", "1px solid #ccc");
			input.type = "text";
			$(div).datetimepicker(
			{
				format: 'yyyy-MM-dd hh:mm:ss', 
				autoclose: true,
				todayBtn: true,
				pickerPosition: "bottom-left",
				position: 'left',
				language:Lianja.App.locale
			});
			/*
				.on('changeDate', function(ev) {
					$(div).datetimepicker('hide');
			});
			*/
		}
		else
		{
			if (!added) $(td).append(input);
		}
		if (this.type === 'checkbox') 
		{
			$(input).css( "margin-left", "2px");
			$(input).css( "width", "auto");
			$(input).css( "float", "left");
		}
		else
		{
			$(input).css( "width", "100%");
		}
		this.formitem.input = input;
		
		if (this.formitem.maxlength > 0)
		{
			input.maxLength = this.formitem.maxlength;
		}
		
		if (combobox)
		{
			$(input).css( "height", "100%");
			$(input).css( "max-height", "100%");
			$(input).css( "line-height", "100%");
			if (!Lianja.isQtWebkit())
			{
				$(input).css( "margin-top", "0px");
				$(input).css( "margin-bottom", "1px");
			}
		}
		
		if (inline)
		{			
			$(this.ok).data("formitem", this.formitem);
			$(this.cancel).data("formitem", this.formitem);
			$(this.ok).data("formitemid", this.formitemid);
			$(this.cancel).data("formitemid", this.formitemid);
			$(this.ok).css("width", $("#"+formitemid).height);
			$(this.ok).css("height", "100%");
			this.ok.className = 'ui-lianja-inlineeditsaveicon';
			this.ok.title = 'Save';
			$(this.ok).mouseenter( function()
			{
				self.ok.style.backgroundColor = "lightgray";
			});
			$(this.ok).mouseleave( function()
			{
				self.ok.style.backgroundColor = "transparent";
			});
			if (Lianja.App.hasDelegate(this.formitem.id, "focus"))
			{
				$(input).on("focus", function(event)
				{
					var formitem = $(this).data("formitem");
					var value = $(input).val();
					value = str_replace("<a>", "", value);
					value = str_replace("</a>", "", value);
					Lianja.App.dispatchDelegate(formitem.id, "focus", value);
				});
			}
			if (Lianja.App.hasDelegate(this.formitem.id, "blur"))
			{
				$(input).on("blur", function(event)
				{
					var formitem = $(this).data("formitem");
					var value = $(input).val();
					value = str_replace("<a>", "", value);
					value = str_replace("</a>", "", value);
					Lianja.App.dispatchDelegate(formitem.id, "blur", value);
				});
			}
			if (Lianja.App.hasDelegate(this.formitem.id, "keyup"))
			{
				$(input).on("keyup", function(event)
				{
					var formitem = $(this).data("formitem");
					var value = $(input).val();
					value = str_replace("<a>", "", value);
					value = str_replace("</a>", "", value);
					Lianja.App.dispatchDelegate(formitem.id, "keyup", value);
				});
			}
			$(this.ok).on("click", function(event)
			{
				event.preventDefault();
				var formitem = $(this).data("formitem");
				var formitemid = $(this).data("formitemid");
				
				Lianja.validate(pageid, sectionid, formitem, input,
					function(pageid, sectionid, formitem, input)	// onsuccess
					{
						var value = $(input).val();
						value = str_replace("<a>", "", value);
						value = str_replace("</a>", "", value);
						Lianja.App.dispatchDelegate(formitem.id, "change", value);
						formitem.save(true, value);
						$("#"+formitem.id).data("editing", "reset");
						self.page.addDirtySection(self.section);
						self.page.update( 
							function(data) {
								Lianja.performPageAction(self.pageid, "_save", null);
								if (data !== null && typeof data.__error !== 'undefined')
								{
									Lianja.showErrorMessage("Record had already been updated by another user", "Update failed");
								}
								else
								{
									Lianja.showSuccessMessage("Record was updated");
								}
							},
							function(jqXHR, textStatus, errorThrown) {
								Lianja.showErrorMessage("Record could not be updated", "Update failed");
							}
						);
					},
					function(pageid, sectionid, formitem, input, errmsg)	// onerror
					{
						Lianja.showErrorMessage(errmsg);
						$(input).focus();
					}					
				);
			});
			td = document.createElement('td');
			$(tr).append(td);
			$(td).append(this.ok);
			$(this.cancel).css("width", $("#"+formitemid).height);
			$(this.cancel).css("height", "100%");
			this.cancel.title = 'Cancel';
			$(this.cancel).mouseenter( function()
			{
				self.cancel.style.backgroundColor = "lightgray";
			});
			$(this.cancel).mouseleave( function()
			{
				self.cancel.style.backgroundColor = "transparent";
			});
			$(this.cancel).on("click", function(event)
			{
				var formitem = $(this).data("formitem");
				var formitemid = $(this).data("formitemid");
				formitem.cancel();
				$("#"+formitemid).data("editing", "reset");
				event.preventDefault();
			});
			this.cancel.className = 'ui-lianja-inlineeditcancelicon';
			td = document.createElement('td');
			$(tr).append(td);
			$(td).append(this.cancel);
			input.focus();
		}
		else
		{
			if (readonly)
			{
				//Lianja.App.setReadonly(input, true);
				$(input).attr("readonly", true);
			}
			if (Lianja.App.hasDelegate(this.formitem.id, "focus"))
			{
				$(input).on("focus", function(event)
				{
					var formitem = $(this).data("formitem");
					var value = $(input).val();
					Lianja.App.dispatchDelegate(formitem.id, "focus", value);
				});
			}
			if (Lianja.App.hasDelegate(this.formitem.id, "blur"))
			{
				$(input).on("blur", function(event)
				{
					var formitem = $(this).data("formitem");
					var value = $(input).val();
					value = str_replace("<a>", "", value);
					value = str_replace("</a>", "", value);
					Lianja.App.dispatchDelegate(formitem.id, "blur", value);
				});
			}
			if (Lianja.App.hasDelegate(this.formitem.id, "keyup"))
			{
				$(input).on("keyup", function(event)
				{
					var formitem = $(this).data("formitem");
					var value = $(input).val();
					value = str_replace("<a>", "", value);
					value = str_replace("</a>", "", value);
					Lianja.App.dispatchDelegate(formitem.id, "keyup", value);
				});
			}
			$(input).on("change", function(event)
			{
				var formitem = $(this).data("formitem");
				Lianja.validate(pageid, sectionid, formitem, input,
					function(pageid, sectionid, formitem, input)	// onsuccess
					{
						var value = $(input).val();
						value = str_replace("<a>", "", value);
						value = str_replace("</a>", "", value);
						Lianja.App.dispatchDelegate(formitem.id, "change", value);
						formitem.save(inline, value);
					},
					function(pageid, sectionid, formitem, input, errmsg)	// onerror
					{
						Lianja.showErrorMessage(errmsg);
						$(input).focus();
					}					
				);
				event.preventDefault();
			});
		}
		
		// handle optional input mask
		var mask = $("#"+formitemid).data("lianjaInputmask");
		if (typeof mask !== 'undefined' && mask !== null)
		{
			Lianja.setInputMask(input, mask, text);
		}
		
		Lianja.hideControl(formitemid + "-inlineediticon");
		return input;
 	}
	else
	{
		$("#"+formitemid).data("editing", "false");
		$("#"+formitemid + "-inlineediticon").data("editing", "false");
		this.formitem.cancel();
	}
};

//================================================================================
window.Lianja.validate = function(pageid, sectionid, formitem, input, onsuccess, onerror)
{
	var validationexpression = $("#"+formitem.id).data("lianjaValidation");
	if (validationexpression === null || typeof validationexpression === 'undefined')
	{
		onsuccess(pageid, sectionid, formitem, input);
		return false;
	}
	var validationerrormessage = $("#"+formitem.id).data("lianjaValidationerrormessage");
	if (validationerrormessage === null || typeof validationerrormessage === 'undefined') validationerrormessage = "Invalid data entered";
	
	var text = $("#"+formitem.id+"-editor").val();
	text = str_replace("<a>", "", text);
	text = str_replace("</a>", "", text);
	
	Lianja.expandMacros(pageid, sectionid, validationexpression,
		function(text, args)	// onsuccess
		{
			Lianja.evaluateSync(text,
				function(result)	// onsuccess
				{
					if (result === 'True') onsuccess(pageid, sectionid, formitem, input);
					else onerror(pageid, sectionid, formitem, input, validationerrormessage);
				},
				function()			// onerror
				{
					onerror(pageid, sectionid, formitem, input, validationerrormessage);
				}
			);
		},
		text);
		
	return true;
};

//================================================================================
window.Lianja.refreshLeftSideBar = function(pageid)
{
	Lianja.refreshFavorites(pageid);
	Lianja.refreshRecentlyViewed(pageid);
	Lianja.refreshRecentlyModified(pageid);
	Lianja.refreshInstantSelections(pageid);
};

//================================================================================
window.Lianja.refreshInstantSelections = function(pageid)
{
	pageid = pageid.toLowerCase();
	var table = $("#"+pageid+"-instantselections");
	if (typeof table === 'undefined' || table == null) return;
	var itemlist = $(table).data("lianjaItemlist");
	if (typeof itemlist === 'undefined' || itemlist == null) return;
	var tr;
	var td;
	var html; 

	tr = document.createElement('tr');
	td 	= document.createElement('td');
	$(table).append(tr);
	$(tr).append(td);
	html = "<a href='#' {1} >All</a>"; 
	html = str_replace("{1}", "onclick=\"Lianja.clearSearch('" + pageid + "');\"", html);
	$(td).html(html);
	
	$(td).data("pageid", pageid);
	$(td).click( function() {
		var pageid = $(this).data("pageid");
		Lianja.clearSearch(pageid);
	});
	
	tr = document.createElement('tr');
	td 	= document.createElement('td');
	$(table).append(tr);
	$(tr).append(td);
	html = "<a href='#' {1} >Starred</a>"; 
	html = str_replace("{1}", "onclick=\"Lianja.search('" + pageid + "','*');\"", html);
	$(td).html(html);

	$(td).data("pageid", pageid);
	$(td).click( function() {
		var pageid = $(this).data("pageid");
		Lianja.search(pageid, '*');
	});

	var items = itemlist.split("~~");
	for (var i=0; i<items.length; ++i)
	{
		var item = items[i].split("||");
		// item[0] = label
		// item[1] = tag
		// item[2] = color
		// item[3] = filter
		if (item[0].length == 0) break;
		item[0] = str_replace("__", " & ",item[0]);
		tr = document.createElement('tr');
		td 	= document.createElement('td');
		$(table).append(tr);
		$(tr).append(td);
		html = "<div style='float:left;border:1px solid lightgray;background-color:{1};min-width:14px;min-height:14px;'></div><a href='#'>" + "  "+item[0] + "</a>"; 
		html = str_replace("{1}", item[2], html);
		$(td).html(html);

		$(td).data("pageid", pageid);
		$(td).data("label", item[0]);
		$(td).data("color", item[2]);
		$(td).data("filter", item[3]);
		$(td).click( function() {
			var pageid = $(this).data("pageid");
			var filter = $(this).data("filter");
			var label = $(this).data("label");
			var color = $(this).data("color");
			Lianja.setFilter(pageid, label, color, filter);
		});
	};
};

//================================================================================
window.Lianja.refreshFavorites = function(pageid)
{
	if (!Lianja.hasHtml5Storage()) return;

	pageid = pageid.toLowerCase();
	var table = $("#"+pageid+"-favoritesgrid");
	if (typeof table === 'undefined' || table == null) return;
	var maxitems = parseInt($(table).data("lianjaMaxitems"));
	$(table).empty();
	var key = Lianja.App.name + "_" + pageid + "_favorites";
	key = key.toLowerCase();
	var keys = window.localStorage.getItem(key);
	if (typeof keys === 'undefined' || keys == null) keys = "";
	keys = keys.split("||");
	while (keys.length > maxitems)
	{
		keys.splice(0,1);
	}
	window.localStorage.setItem(key, keys.join("||"));
	for (var i=0; i<keys.length; ++i)
	{
		if (keys[i].length == 0) break;
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		$(table).append(tr);
		$(tr).append(td);
		var html = "<div class='ui-lianja-favoritesolid' {1} ></div><a href='#' {2}>" + keys[i] + "</a>"; 
		html = str_replace("{1}", "onclick=\"Lianja.removeFavorite('" + pageid + "','" + addslashes(keys[i]) + "');\"", html);
		html = str_replace("{2}", "onclick=\"Lianja.search('" + pageid + "','" + addslashes(keys[i]) + "');\"", html);
		$(td).html(html);
		$(td).data("pageid", pageid);
		$(td).data("key", keys[i]);
		$(td).click( function() {
			var pageid = $(this).data("pageid");
			var key = $(this).data("key");
			Lianja.search(pageid, key);
		});
	}
};

//================================================================================
window.Lianja.refreshRecentlyViewed = function(pageid)
{
	if (!Lianja.hasHtml5Storage()) return;
	pageid = pageid.toLowerCase();
	var page = Lianja.App.getPage(pageid);
	if (!page.initedsidebars)
	{
		page.initedsidebars = true;
		Lianja.refreshLeftSideBar(pageid);
		return;
	}
	var table = $("#"+pageid+"-recentlyviewedgrid");
	if (typeof table === 'undefined' || table == null) return;
	var maxitems = parseInt($(table).data("lianjaMaxitems"));
	$(table).empty();
	var key = Lianja.App.name + "_" + pageid + "_recentlyviewed";
	key = key.toLowerCase();
	var keys = window.localStorage.getItem(key);
	if (typeof keys === 'undefined' || keys == null) keys = "";
	keys = keys.split("||");
	while (keys.length > maxitems)
	{
		keys.splice(0,1);
	}
	window.localStorage.setItem(key, keys.join("||"));
	for (var i=0; i<keys.length; ++i)
	{
		if (keys[i].length == 0) break;
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		$(table).append(tr);
		$(tr).append(td);
		var html = "<div class='ui-lianja-favoriteempty' {1} ></div><a href='#' {2} >" + keys[i] + "</a>"; 
		html = str_replace("{1}", "onclick=\"Lianja.addFavorite('" + pageid + "','" + addslashes(keys[i]) + "');\"", html);
		html = str_replace("{2}", "onclick=\"Lianja.search('" + pageid + "','" + addslashes(keys[i]) + "');\"", html);
		$(td).html(html);
		$(td).data("pageid", pageid);
		$(td).data("key", keys[i]);
		$(td).click( function() {
			var pageid = $(this).data("pageid");
			var key = $(this).data("key");
			Lianja.search(pageid, key);
		});
	}
};

//================================================================================
window.Lianja.refreshRecentlyModified = function(pageid)
{
	if (!Lianja.hasHtml5Storage()) return;
	pageid = pageid.toLowerCase();
	var table = $("#"+pageid+"-recentlymodifiedgrid");
	if (typeof table === 'undefined' || table == null) return;
	var maxitems = parseInt($(table).data("lianjaMaxitems"));
	$(table).empty();
	var key = Lianja.App.name + "_" + pageid + "_recentlymodified";
	key = key.toLowerCase();
	var keys = window.localStorage.getItem(key);
	if (typeof keys === 'undefined' || keys == null) keys = "";
	keys = keys.split("||");
	while (keys.length > maxitems)
	{
		keys.splice(0,1);
	}
	window.localStorage.setItem(key, keys.join("||"));
	for (var i=0; i<keys.length; ++i)
	{
		if (keys[i].length == 0) break;
		var tr = document.createElement('tr');
		var td = document.createElement('td');
		$(table).append(tr);
		$(tr).append(td);
		var html = "<div class='ui-lianja-favoriteempty' {1} ></div><a href='#' {2} >" + keys[i] + "</a>"; 
		html = str_replace("{1}", "onclick=\"Lianja.addFavorite('" + pageid + "','" + addslashes(keys[i]) + "');\"", html);
		html = str_replace("{2}", "onclick=\"Lianja.search('" + pageid + "','" + addslashes(keys[i]) + "');\"", html);
		$(td).html(html);
		$(td).data("pageid", pageid);
		$(td).data("key", keys[i]);
		$(td).click( function() {
			var pageid = $(this).data("pageid");
			var key = $(this).data("key");
			Lianja.search(pageid, key);
		});
	}
};

//================================================================================
window.Lianja.refreshRightSideBar = function(pageid)
{
	if (pageid[0] == '#') pageid = pageid.substring(1);
	pageid = pageid.toLowerCase();

	var el = $("#"+pageid+"-rightsidebarpanel");
	if (typeof el === 'undefined' || el == null) return;
	
	el = $("#"+pageid+"-rightsidebarpanel-contentgadget0");
	if (!(typeof el === 'undefined' || el == null)) 
	{
		Lianja.refreshWebViewGadget(pageid+"-rightsidebarpanel-contentgadget0");
	}
	
	el = $("#"+pageid+"-rightsidebarpanel-contentgadget1");
	if (!(typeof el === 'undefined' || el == null)) 
	{
		Lianja.refreshWebViewGadget(pageid+"-rightsidebarpanel-contentgadget1");
	}
	
	el = $("#"+pageid+"-rightsidebarpanel-contentgadget2");
	if (!(typeof el === 'undefined' || el == null)) 
	{
		Lianja.refreshWebViewGadget(pageid+"-rightsidebarpanel-contentgadget2");
	}
	
	el = $("#"+pageid+"-rightsidebarpanel-contentgadget3");
	if (!(typeof el === 'undefined' || el == null)) 
	{
		Lianja.refreshWebViewGadget(pageid+"-rightsidebarpanel-contentgadget3");
	}
	
	el = $("#"+pageid+"-rightsidebarpanel-contentgadget4");
	if (!(typeof el === 'undefined' || el == null)) 
	{
		Lianja.refreshWebViewGadget(pageid+"-rightsidebarpanel-contentgadget4");
	}
	
};

//================================================================================
window.Lianja.addRecentlyViewed = function(pageid, value)
{
	if (!Lianja.hasHtml5Storage()) return;
	pageid = pageid.toLowerCase();
	var table = $("#"+pageid+"-recentlyviewedgrid");
	if (typeof table === 'undefined' || table == null) return;
	var rowCount = $("#"+pageid+"-recentlyviewedgrid tr").length;
	var key = Lianja.App.name + "_" + pageid + "_recentlyviewed";
	key = key.toLowerCase();
	var keys = window.localStorage.getItem(key);
	if (typeof keys === 'undefined' || keys == null) keys = "";
	if (keys.indexOf(value)>=0) 
	{
		Lianja.refreshRecentlyViewed(pageid);
		return;
	}
	
	if (keys.length > 0) keys = keys + "||";
	keys = keys + value;
	keys = keys.split("||");
	window.localStorage.setItem(key, keys.join("||"));
	Lianja.refreshRecentlyViewed(pageid);
};

//================================================================================
window.Lianja.addRecentlyModified = function(pageid, value)
{
	if (!Lianja.hasHtml5Storage()) return;
	pageid = pageid.toLowerCase();
	var table = $("#"+pageid+"-recentlymodifiedgrid");
	if (typeof table === 'undefined' || table == null) return;
	var rowCount = $("#"+pageid+"-recentlymodifiedgrid tr").length;
	var key = Lianja.App.name + "_" + pageid + "_recentlymodified";
	key = key.toLowerCase();
	var keys = window.localStorage.getItem(key);
	if (typeof keys === 'undefined' || keys == null) keys = "";
	if (keys.indexOf(value)>=0) 
	{
		Lianja.refreshRecentlyModified(pageid);
		return;
	}
	
	if (keys.length > 0) keys = keys + "||";
	keys = keys + value;
	keys = keys.split("||");
	window.localStorage.setItem(key, keys.join("||"));
	Lianja.refreshRecentlyModified(pageid);
};

//================================================================================
window.Lianja.addFavorite = function(pageid, value)
{
	if (!Lianja.hasHtml5Storage()) return;
	pageid = pageid.toLowerCase();
	var table = $("#"+pageid+"-favoritesgrid");
	if (typeof table === 'undefined' || table == null) return;
	var rowCount = $("#"+pageid+"-favoritesgrid tr").length;
	var key = Lianja.App.name + "_" + pageid + "_favorites";
	key = key.toLowerCase();
	var keys = window.localStorage.getItem(key);
	if (typeof keys === 'undefined' || keys == null) keys = "";
	if (keys.indexOf(value)>=0) 
	{
		Lianja.refreshFavorites(pageid);
		return;
	}
	
	if (keys.length > 0) keys = keys + "||";
	keys = keys + value;
	keys = keys.split("||");
	window.localStorage.setItem(key, keys.join("||"));
	Lianja.refreshFavorites(pageid);
};

//================================================================================
window.Lianja.removeFavorite = function(pageid, value)
{
	if (!Lianja.hasHtml5Storage()) return;
	pageid = pageid.toLowerCase();
	var table = $("#"+pageid+"-favoritesgrid");
	if (typeof table === 'undefined' || table == null) return;
	var rowCount = $("#"+pageid+"-favoritesgrid tr").length;
	var key = Lianja.App.name + "_" + pageid + "_favorites";
	key = key.toLowerCase();
	var keys = window.localStorage.getItem(key);
	if (typeof keys === 'undefined' || keys == null) keys = "";
	var pos = keys.indexOf(value);
	if (pos>=0) 
	{
		keys = keys.split("||");
		pos = keys.indexOf(value);
		keys.splice(pos, 1);
		window.localStorage.setItem(key, keys.join("||"));
		Lianja.refreshFavorites(pageid);
		return;
	}
};

//================================================================================
window.Lianja.showControl = function(id)
{
	var editing = $("#"+id).data("editing");
	if (typeof editing == 'string' && editing == "true") return;
	
	$("#"+id).css("display", "block");
};

//================================================================================
window.Lianja.hideControl = function(id)
{
	$("#"+id).css("display", "none");
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
	if (!startsWith(expr, "javascript:")) expr = "javascript:"+expr;
	if (typeof LianjaAppBuilder === "object")
	{
		var result = LianjaAppBuilder.evaluateFileFunction(expr);
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
window.Lianja.evaluatePHP = function(expr, onsuccess, onerror, args)
{
	if (!startsWith(expr, "php:")) expr = "php:"+expr;
	if (typeof LianjaAppBuilder === "object")
	{
		var result = LianjaAppBuilder.evaluateFileFunction(expr);
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
window.Lianja.evaluatePython = function(expr, onsuccess, onerror, args)
{
	if (!startsWith(expr, "python:")) expr = "python:"+expr;
	if (typeof LianjaAppBuilder === "object")
	{
		var result = LianjaAppBuilder.evaluateFileFunction(expr);
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
window.Lianja.isMobile = function()
{
	return /android|webos|iphone|ipad|ipod|blackberry|iemobile|mobile/i.test(navigator.userAgent.toLowerCase());
};

//================================================================================
window.Lianja.isTablet = function()
{
	var rc = /iPad/i.test(navigator.userAgent.toLowerCase());
	if (rc) return true;
	rc = /(?=.*android)(?=.*mobile)/i.test(navigator.userAgent.toLowerCase());
	if (rc) return false;
	return /Android/i.test(navigator.userAgent.toLowerCase())
};

//================================================================================
window.Lianja.isPhone = function()
{
	var rc = /webos|iphone|ipod|blackberry|iemobile/i.test(navigator.userAgent.toLowerCase());
	if (rc) return true;
	return /(?=.*android)(?=.*mobile)/i.test(navigator.userAgent.toLowerCase());
};

//================================================================================
window.Lianja.phonegapDevice = function()
{
	return Lianja.App.targetui;
};

//================================================================================
window.Lianja.phonegapPlatform = function()
{
	return typeof window.cordova !== 'undefined' ? window.cordova.platformId : 'com.adobe.phonegap.app';
};

//================================================================================
window.Lianja.phonegapPlatformVersion = function()
{
	return typeof window.cordova !== 'undefined' ?  window.cordova.platformVersion : "5.0";
};

//================================================================================
window.Lianja.supportsDate = function()
{
	//var isChrome = window.chrome;
	//if (isChrome === true) return true;

	//return navigator.userAgent.match(/Chrome/i);	
	// TODO: handle other browsers later
	if (typeof window.cordova !== 'undefined') return true;
	return false;
};


//================================================================================
window.Lianja.supportsDateTime = function()
{
	//var isChrome = window.chrome;
	//if (isChrome === true) return true;

	//return navigator.userAgent.match(/Chrome/i);	
	// TODO: handle other browsers later
	if (typeof window.cordova !== 'undefined') return true;
	return false;
};


//================================================================================
window.Lianja.isChrome = function()
{
	return navigator.userAgent.match(/Chrome/i) == "Chrome";
};


//================================================================================
window.Lianja.isQtWebkit = function()
{
	return navigator.userAgent.match(/Qt/i);
};


//================================================================================
window.Lianja.isIE11 = function()
{
	return navigator.userAgent.match(/NET CLR/i) || navigator.userAgent.match(/.NET/i);
};


//================================================================================
window.Lianja.isRuntimeMode = function()
{
	return typeof LianjaAppBuilder === 'undefined';
};


//================================================================================
window.Lianja.get = function(id)
{
	var pageid = id;
	var sectionid = "";
	var formitemid = "";
	var page;
	var section;
	var formitem;
	var pos;
	
	if (id.indexOf(".") > 0)
	{
		pos = id.indexOf(".");
		pageid = id.substring(0,pos);
		sectionid = id.substring(pos+1);
		if (sectionid.indexOf(".") > 0)
		{
			pos = sectionid.indexOf(".");
			formitemid = sectionid.substring(pos+1);
			sectionid = sectionid.substring(0,pos);
		}
	}

	if (formitemid.length > 0)
	{
		page = Lianja.App.getPage(pageid);
		section = page.getSection(pageid+"-"+sectionid);
		formitem = section.getFormItem(pageid+"-"+sectionid+"-"+formitemid);
		return formitem;
	}
	
	if (sectionid.length > 0)
	{
		page = Lianja.App.getPage(pageid);
		return page.getSection(sectionid);
	}

	return Lianja.App.getPage(pageid);
};

//================================================================================
window.Lianja.getElementByID = function(id)
{
	return Lianja.get(id);
};


//================================================================================
window.Lianja.mobiledevice = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};


//================================================================================
window.Lianja.printStackTrace = function()
{
    var err = new Error();
    console.log(err.stack);
};

//================================================================================
window._onerror = function()
{
	var trace = printStackTrace();
	console.log(trace.join('\n\n'));
	return false;
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
	if (typeof text === 'object') return text;
	return JSON.parse(text);
};

//================================================================================
window.Lianja.writeOutput = function(text)
{
	console.log(text);
};

//================================================================================
window.Lianja.writeLog = function(text)
{
	console.log(text);
};

//================================================================================
window.Lianja.writeError = function(text)
{
	console.error(text);
};

//================================================================================
window.Lianja.addSearchPanel = function(sectionid, obj)
{
	var section = page.getSection(sectionid);
	if (typeof section.parentid != 'undefined') 
	{
		//c_console.log("Section "+sectionid+" not found");
		return;
	}
	
	section.addSearchPanel(obj);
};


//================================================================================
// General purpose Lianja/VFP compatible functions for JavaScript
// Others will be added as needed.
//================================================================================
function str_replace(needle, replacement, haystack) {
    return haystack.split(needle).join(replacement);
}

//================================================================================
function str_escape(str) {
    return str.split("'").join("'");
}

//================================================================================
function strtran(haystack, needle, replacement) {
    return haystack.split(needle).join(replacement);
}

//================================================================================
function chrtran(haystack, needle, replacement) {
    return haystack.split(needle).join(replacement);
}

//================================================================================
function str(num, width, decs)
{
	if (typeof num !== 'number') num = parseFloat(num);
	if (typeof decs == 'undefined')
	{
		if (typeof width == 'undefined')
		{
			return str(num, 10, 0);
		}
		return ""+num.toPrecision(width);
	}
	
	var value = ""+num.toFixed(decs);
	while (value.length < width) value = " " + value;
	return value;
}

//================================================================================
function addslashes( str ) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

//================================================================================
function alltrim(param)
{
	return param.trim();
}

//================================================================================
function ltrim(param)
{
	return _.ltrim(param);
}

//================================================================================
function rtrim(param)
{
	return param.trim();
}

//================================================================================
function recno(table)
{
	var cursor = Lianja.App.getCursor("", table);
	if (cursor !== null) return cursor.rowid;
	return 0;
}

//================================================================================
function reccount(table)
{
	var cursor = Lianja.App.getCursor("", table);
	if (cursor !== null) return cursor.reccount;
	return 0;
}

//================================================================================
function rowcount(table)
{
	var cursor = Lianja.App.getCursor("", table);
	if (cursor !== null) return cursor.reccount;
	return 0;
}

//================================================================================
function trim(param)
{
	return param.trim();
}

//================================================================================
function val(param)
{
	if (param.indexOf(".") > 0) return parseFloat(param);
	else return parseInt(param);
}

//================================================================================
function iif(expr, truevalue, falsevalue)
{
	if (expr) return truevalue;
	else return falsevalue;
}

//================================================================================
function between(value, low, high)
{
	if (value >= low && value <= high) return true;
	return false;
}

//================================================================================
function len(param)
{
	return param.length;
}

//================================================================================
function strlen(param)
{
	return param.length;
}

//================================================================================
function at(string, text, start)
{
	if (typeof start === 'undefined') 
	{
		return string.indexOf(text)+1;
	}
	if (start > string.length || start < 1) return 0;
	string = string.substring(start-1, (start-1)+string.length);
	var pos = string.indexOf( text );
	if (pos < 0) return 0;
	return pos + start;
}

//================================================================================
function substr(string, start, length)
{
	if (typeof length === 'undefined') length = string.length;
	return string.substring(start-1, (start-1)+length);
}

//================================================================================
function proper(string)
{
	return string.substring(0, 1).toUpperCase()+string.substring(1).toLowerCase();
}

//================================================================================
function left(string, length)
{
	return string.substring(0, length);
}

//================================================================================
function right(string, length)
{
	return string.substring(string.length-length, string.length);
}

//================================================================================
function startswith(string, text)
{
	if (text.length > string.length) return false;
	return string.substring(string, text.length) === text;
}
window.startsWith = startswith;

//================================================================================
function endswith(string, text)
{
	if (string.length-text.length < 0) return false;
	return string.substring(string.length-text.length) === text;
}
window.endsWith = endswith;

//================================================================================
function indexof(string, text)
{
	return string.indexOf(text)+1;
}
window.indexOf = indexof;

//================================================================================
function rpad(string, len, text)
{
	if (typeof text === 'undefined') text = " ";
	while (string.length < len) string += text;
	return string;
}
window.padr = rpad;

//================================================================================
function lpad(string, len, text)
{
	if (typeof text === 'undefined') text = " ";
	while (string.length < len) string = text + string;
	return string;
}
window.padl = lpad;

//================================================================================
function upper(param)
{
	return param.toUpperCase();
}

//================================================================================
function lower(param)
{
	return param.toLowerCase();
}

//================================================================================
function etos(param, len)
{
	var value = ""+param+"";
	if (typeof len === 'undefined') return value;
	if (value.length > len) return left(value, len);
	else if (value.length < len) return rpad(value, len);
	return value
}

//================================================================================
function tostring(param)
{
	return ""+param+"";
}

//================================================================================
function empty(param)
{
	if (typeof param === 'string') return param.length == 0;
	if (typeof param === 'number') return param === 0;
	if (typeof param === 'boolean') return param;
	
	return true;
}

//================================================================================
function is_array(param)
{
	return (typeof param === 'array');
}

//================================================================================
function is_object(param)
{
	return (typeof param === 'object');
}

//================================================================================
function is_date(param)
{
	return (typeof param === 'date');
}

//================================================================================
function is_logical(param)
{
	return (typeof param === 'boolean');
}

//================================================================================
function is_numeric(param)
{
	return (typeof param === 'number');
}

//================================================================================
function is_int(param)
{
	return (typeof param === 'number');
}

//================================================================================
function is_float(param)
{
	return (typeof param === 'number');
}

//================================================================================
function is_string(param)
{
	return (typeof param === 'string');
}

//================================================================================
function function_exists(param)
{
	return (typeof param === 'function');
}

//================================================================================
function is_function(param)
{
	return (typeof param === 'function');
}

//================================================================================
function in_array(value, array)
{
	return _.contains(array, value);
}

//================================================================================
function implode(sep, array)
{
	return array.join(sep);
}

//================================================================================
function explode(sep, astring)
{
	return astring.split(sep);
}

//================================================================================
function inlist()
{
	var value = arguments[0];
	for (var i = 1; i < arguments.length; i++) {
		if (value == arguments[i]) return true;
	}	
	return false;
}
window.inList = inlist;

//================================================================================
function icase()
{
	for (var i = 0; i < arguments.length; i+=2) {
		if (arguments[i]) return arguments[i+1];
	}	
	return arguments[arguments.length-1];
}
window.iCase = icase;

//================================================================================
function replicate(value, count)
{
	var i;
	var ovalue = value;
	for (i=0; i<count-1; ++i) value = value + ovalue;
	return value;
}

//================================================================================
function require(file){
	var filename = file;

	Lianja.requiremap.push(file);
	if (file.substring(0, 9) == "library:/")
	{
		file = "../../../library/" + file.substring(9);
	}
	else if (file.substring(0, 5) == "lib:/")
	{
		file = "../../../library/" + file.substring(5);
	}
	else if (file.substring(0, 5) == "app:/")
	{
		file = file.substring(5);
	}
	window.module = {};
	window.module.exports = {};
    var head=document.getElementsByTagName("head")[0];
    var script=document.createElement('script');
    script.type='text/javascript';
	var result;
	var text;
	if (typeof LianjaAppBuilder === 'object')
	{
		text = LianjaAppBuilder.readTextFile(filename);
	}
	else
	{
		result = $.ajax({
			url: Lianja.App.getFullPathUrl(file),
			type: "get",
			dataType: 'javascript',
			contentType: "application/javascript",
			cache: false,
			async: false
		});
		text = result.responseText;
	}
	script.innerHTML = text;
    head.appendChild(script);
	eval(text);
	var exports = window.module.exports;
	Lianja.requiremapexports[ Lianja.requiremap.length-1 ] = exports;
	window.module = {};
	window.module.exports = {};
	return exports;
}
window.loadLibrary = require;
window.loadlibrary = require;

//================================================================================
function require_once(file)
{
	var fpos = Lianja.requiremap.indexOf(file);
	if (fpos >= 0)
	{
		return Lianja.requiremapexports[ fpos ];
	}
	return require(file);
}

//================================================================================
function date(y, m, d)
{
	if (typeof y === 'undefined') return new Date();
	var dt = new Date();
	dt.setFullYear(y);
	dt.setMonth(m-1);
	dt.setDate(d);
	return dt;
}

//================================================================================
function dtos(arg)
{
	var year = arg.getFullYear();
	var month = arg.getMonth()+1;
	var day = arg.getDate()+1;
	var syear = "" + year;
	var smonth = "" + month;
	var sday = "" + day;
	while (syear.length < 4) syear = "0" + syear;
	while (smonth.length < 2) smonth = "0" + smonth;
	while (sday.length < 2) sday = "0" + sday;
	return syear + smonth + sday;
}

//================================================================================
function dtoc(arg)
{
	var str = arg.toLocaleString();
	var pos = str.lastIndexOf(" ");
	return str.substring(0,pos);
}

//================================================================================
function ctod(arg)
{
	return new Date( arg );
}

//================================================================================
function day(arg)
{
	return arg.getDate()+1;
}

//================================================================================
function month(arg)
{
	return arg.getMonth()+1;
}

//================================================================================
function year(arg)
{
	return arg.getFullYear();
}

//================================================================================
function cmonth(arg)
{
	return arg.toUTCString().split(' ')[2];
}

//================================================================================
function cdow(arg)
{
	return arg.toString().split(' ')[0];
}

//================================================================================
function dow(arg)
{
	return arg.getDay()+1;
}

//================================================================================
function time()
{
	var arg = new Date();
	var year = arg.getHours();
	var month = arg.getMinutes();
	var day = arg.getSeconds();
	var syear = "" + year;
	var smonth = "" + month;
	var sday = "" + day;
	while (syear.length < 2) syear = "0" + syear;
	while (smonth.length < 2) smonth = "0" + smonth;
	while (sday.length < 2) sday = "0" + sday;
	return syear + ":" + smonth + ":" + sday;
}

//================================================================================
window.messagebox = function(text, okcallback, cancelcallback)
{
	var me = this;
	if (typeof okcallback !== 'string') this.okcallback = okcallback;
	this.cancelcallback = cancelcallback;
	Lianja.confirm(text, function(result) {
		bootbox.hideAll();
		if (!result) 
		{
			if (typeof me.okcallback !== 'undefined') me.okcallback();
			return;
		}
		if (typeof me.cancelcallback !== 'undefined') me.cancelcallback();
	});
};
window.messageBox = messagebox;
window.MessageBox = messagebox;
window.Lianja.messageBox = window.messageBox;
window.Lianja.messagebox = window.messagebox;

//================================================================================
window.Lianja.openDatabase = function(database)
{
	return new Lianja.Database(database);
};
window.Lianja.opendatabase = window.Lianja.openDatabase;

//================================================================================
window.Lianja.createCursor = function(database, table)
{
	return new Lianja.Cursor(database, table);
};

//================================================================================
window.Lianja.getCursor = function(table)
{
	return Lianja.App.getCursor("", table);
};

//================================================================================
// The LianjaWebFramework classes
//================================================================================
window.Lianja.createObject = function(name, type)
{
	if (typeof type === 'undefined')
	{
		type = name;
		var obj = new Lianja.CanvasComponent(type.toLowerCase());
		obj.initComponent();
		return obj;
	}
	var obj = new Lianja.CanvasComponent(type.toLowerCase());
	obj.initComponent();
	obj.name = name;
	return obj;
};

//================================================================================
window.createObject = Lianja.createObject;
window.createobject = Lianja.createObject;


//================================================================================
window.Lianja.addObject = function(container, object)
{
	$("#"+container).append(object.element);
};


//================================================================================
window.Lianja.addCanvasObject = function(id, object)
{
	var list = id.split("-");
	var pageid = list[0];
	var sectionid = list[1];
	var page = Lianja.App.getPage(pageid);
	var section = page.getSection(sectionid);
	section.addCanvasObject(object);
	object._page = page;
	object._section = section;
};


//================================================================================
window.Lianja.checkOrientationLayout = function()
{
	if (typeof LianjaAppBuilder === 'object') return;
	if (!Lianja.isMobile()) return;
	Lianja.handleOrientationChange(Lianja.getOrientation());
};


//================================================================================
window.Lianja.getOrientation = function()
{
	if (window.innerHeight > window.innerWidth) return "portrait";
	else return "landscape";
};


//================================================================================
window.Lianja.handleOrientationChange = function(orientation)
{
	var hideitems;
	var showitems;

	if (orientation === 'landscape')
	{
		hideitems = $(".lianja-ui-orientation-portrait");
		showitems = $(".lianja-ui-orientation-landscape");
	}
	else
	{
		showitems = $(".lianja-ui-orientation-portrait");
		hideitems = $(".lianja-ui-orientation-landscape");
	}
	
	if (typeof hideitems === 'array' || typeof hideitems === 'object')
	{
		_.each(hideitems, function(el) {
			$(el).hide();
		});
	}
	
	if (typeof showitems === 'array' || typeof showitems === 'object')
	{
		_.each(showitems, function(el) {
			$(el).show();
		});
	}
};

//================================================================================
window.Lianja.CanvasComponent = function(type) {
	var self = this;
	this.type = type.toLowerCase();
	this._page = undefined;
	this._section = undefined;
	
	// ** private properties
	this._x = 0;
	this._y = 0;
	this._width = 0;
	this._height = 0;
	this._element = undefined;
	this._dirtyattributes = [];
	this._updatetimer = null;
	this._parent = null;
	this._name = "";
	this._value = "";
	this._backcolor = "";
	this._forecolor = "";
	this._label = false;
	this._button = false;
	this._html = false;
	this._combobox = false;
	this._controlsource = "";
	this._datepicker = false;
	this._inputmask = "";
	this._choicelist = "";
	this._default = undefined;
	this._password = false;
	this._input = null;
	this._choicelist = null;
	this._layout = undefined;
	this._table = undefined;
	this._td = undefined;
	this._tr = undefined;
	this._container = false;
	this._containerel = undefined;
	this._containerchildren = [];
	this._margin = 0;
	this._spacing = 0;
	this._fixedwidth = undefined;
	this._fixedheight = undefined;
	this._textbox = false;
	this._datebox = false;
	this._left = undefined;
	this._right = undefined;
	
	this.initComponent = function()
	{
		// create components position:absolute to be added to canvas sections
		if (type == "textbox")
		{
			self._element = $('<input data-role="none" class="input form-control" style="margin-bottom:0px !important" type="text"/>', {position:'absolute'});
			self._element.css("position", "absolute");
			self._element.type = "text";
			self._input = self._element;
			self._textbox = true;
			$(self._element).on("change", function() { self.save() } );
		}
		else if (type == "spinner")
		{
			var datatype = 'number';
			if (!Lianja.isMobile())  datatype = 'text';
			self._element = $('<input data-role="none" class="input form-control" type="' + datatype + '"/>', {position:'absolute'});
			self._element.css("position", "absolute");
			self._input = self._element;
			Lianja.setInputMask(self._element, "number");
			$(self._element).on("change", function() { self.save() } );
		}
		else if (type == "numerictextbox")
		{
			var datatype = 'number';
			if (!Lianja.isMobile())  datatype = 'text';
			self._element = $('<input data-role="none" class="input form-control" type="' + datatype + '"/>', {position:'absolute'});
			self._element.css("position", "absolute");
			self._input = self._element;
			Lianja.setInputMask(self._element, "number");
			$(self._element).on("change", function() { self.save() } );
		}
		else if (type == "checkbox")
		{
			self._element = $('<input data-role="none" class="input form-control" type="checkbox" data-reverse/>', {position:'absolute'});
			self._element.css("position", "absolute");
			self._input = self._element;
			self._element.type = "checkbox";
			if (Lianja.isPhoneGap()) $(self._element).checkboxpicker();
			$(self._element).on("change", function() { self.save() } );
		}
		else if (type == "combobox")
		{
			self._element = $('<select data-role="none" class="input form-control"/>', {position:'absolute'});
			self._element.css("position", "absolute");
			self._input = self._element;
			self._combobox = true;
			$(self._element).on("change", function() { self.save() } );
		}
		else if (type == "commandbutton")
		{
			self._element = $('<button data-role="none" class="btn" style="margin-top:0px !important;padding:0 0 !important;"/>', {position:'absolute'});
			self._element.css("position", "absolute");
			self._button = true;
		}
		else if (type == "container")
		{
			self._element = $('<div style="position:absolute;top:0;left:0;right:0;bottom:0;"/>', {position:'absolute'});
			self._container = true;
		}
		else if (type == "gadget")
		{
			self._element = $('<div style="position:absolute;top:0;left:0;right:0;bottom:0;"/>', {position:'absolute'});
			self._container = true;
		}
		else if (type == "section")
		{
			self._element = $('<div style="position:relative;top:0;left:0;right:0;bottom:0;height:100%;"/>', {position:'relative'});
			self._container = true;
		}
		else if (type == "control")
		{
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
			self._container = true;
		}
		else if (type == "datetextbox")
		{
			var mobile = Lianja.isMobile();
			var supportsdate = Lianja.supportsDate();
			var datatype = 'date';
			//if ((Lianja.isChrome()||Lianja.isIE11()))  datatype = 'text';
			if ((Lianja.isPhoneGap)) datatype = 'text';
			self._element = $('<input data-role="none" class="input form-control" type="' + datatype + '"/>', {position:'absolute'});
			self._element.css("position", "absolute");
			self._element.type = datatype;
			self._input = self._element;
			self._datebox = true;
			if (!mobile && !supportsdate)
			{
				self._datepicker = true;
				if (Lianja.App.locale !== 'en')
				{
					$(self._element).datepicker(
					{
							format: 'yyyy-mm-dd', 
							autoclose:true,
							language:Lianja.App.locale
					})
						.on('changeDate', function(ev) {
							$(self._element).datepicker('hide');
					});
				}
				else
				{
					$(self._input).datepicker({format: 'yyyy-mm-dd', autoclose:true})
						.on('changeDate', function(ev) {
							$(self._element).datepicker('hide');
					});
				}
				/*
				$(self._element).datepicker({format: 'yyyy-mm-dd', autoclose:true})
					.on('changeDate', function(ev) {
						$(self._element).datepicker('hide');
				});
				*/
			}
			$(self._element).on("change", function() { self.save() } );
		}
		else if (type == "datetimetextbox")
		{
			self._element = $('<input data-role="none" class="input form-control" type="datetime"/>', {position:'absolute'});
			self._element.css("position", "absolute");
			self._input = self._element;
			self._element.type = "datetime";
			$(self._element).on("change", function() { self.save() } );
		}
		else if (type == "editbox")
		{
			self._element = $('<textarea data-role="none" class="input form-control"/>', {position:'absolute'});
			self._element.css("position", "absolute");
			self._input = self._element;
			$(self._element).on("change", function() { self.save() } );
		}
		else if (type == "hyperlink")
		{
			self._element = $('<a data-role="none" />', {position:'absolute'});
			self._element.css("position", "absolute");
		}
		else if (type == "image")
		{
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
		}
		else if (type == "label")
		{
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
			self._element.css("vertical-align", "middle");
			self._label = true;;
		}
		else if (type == "separator")
		{
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
		}
		else if (type == "line")
		{
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
		}
		else if (type == "form")
		{
			console.log("create "+type+" not yet supported");
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
		}
		else if (type == "collection")
		{
			console.log("create "+type+" not yet supported");
		}
		else if (type == "grid")
		{
			console.log("create "+type+" not yet supported");
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
		}
		else if (type == "column")
		{
			console.log("create "+type+" not yet supported");
		}
		else if (type == "commandgroup")
		{
			console.log("create "+type+" not yet supported");
		}
		else if (type == "listbox")
		{
			console.log("create "+type+" not yet supported");
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
		}
		else if (type == "optionbutton")
		{
			console.log("create "+type+" not yet supported");
		}
		else if (type == "optiongroup")
		{
			console.log("create "+type+" not yet supported");
		}
		else if (type == "page")
		{
			console.log("create "+type+" not yet supported");
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
		}
		else if (type == "pageframe")
		{
			console.log("create "+type+" not yet supported");
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
		}
		else if (type == "splitter")
		{
			console.log("create "+type+" not yet supported");
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
		}
		else if (type == "timer")
		{
			console.log("create "+type+" not yet supported");
		}
		else if (type == "tree")
		{
			console.log("create "+type+" not yet supported");
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
		}
		else if (type == "treeitem")
		{
			console.log("create "+type+" not yet supported");
		}
		else if (type == "webview")
		{
			console.log("create "+type+" not yet supported");
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
		}
		else 
		{
			console.log("create "+type+" not yet supported");
			self._element = $('<div />', {position:'absolute'});
			self._element.css("position", "absolute");
		}
	};
	
	this.startUpdateTimer = function()
	{
		if (self._updatetimer !== null) return;
		self._updatetimer = setTimeout( self.update, 1);
	};
	
	this.update = function()
	{
		if (self._dirtyattributes.length == 0) return;
		if (self._element == null) return;
		_.each(self._dirtyattributes, function(obj) {
			$(self._element).css(obj.name, obj.value);
		});
		self._dirtyattributes = [];
		self._updatetimer = setTimeout( self.update, 1);
	};

	this.setAttribute = function(name, value)
	{
		$(self._element).css(name, value);
		/*
		var obj = new Object();
		obj.name = name;
		obj.value = value;
		self._dirtyattributes.push( obj );
		self.startUpdateTimer();
		*/
	};
	
	this.getAttribute = function(name)
	{
		var value = $(self._element).prop(name);
		if (typeof value === 'undefined')
		{
			self.update();
			value = $(self._element).prop(name);
			if (typeof value === 'undefined') value = $(self._element).css(name);
		}
		if (typeof value === 'string')
		{
			var ppos = value.indexOf("px");
			if (ppos > 0 && ppos == value.length-2) value = parseFloat(value.substring(0, ppos));
		}
		return value;
	};
	
	this.setProperty = function(name, value)
	{
		$(self._element).prop(name, value);
	};

	this.getProperty = function(name)
	{
		return $(self._element).prop(name);
	};

	// core properties
	Object.defineProperty(this, "x", 
	{
		get: function() { return self.getAttribute("left"); },
		set: function(value) { self.setAttribute("left", value+"px"); }
	});	

	Object.defineProperty(this, "y", 
	{
		get: function() { return self.getAttribute("top"); },
		set: function(value) { self.setAttribute("top", value+"px"); }
	});	
	
	Object.defineProperty(this, "left", 
	{
		get: function() { return self.getAttribute("left"); },
		set: function(value) { self.setAttribute("left", value+"px"); self._left = value; self.relayout(); }
	});	

	Object.defineProperty(this, "top", 
	{
		get: function() { return self.getAttribute("top"); },
		set: function(value) { 
			self.setAttribute("top", value+"px");
		}
	});	
	
	Object.defineProperty(this, "right", 
	{
		get: function() { return self.getAttribute("right"); },
		set: function(value) { self.setAttribute("right", value+"px"); self._right = value; self.relayout(); }
	});	
	
	Object.defineProperty(this, "bottom", 
	{
		get: function() { return self.getAttribute("bottom"); },
		set: function(value) { self.setAttribute("bottom", value+"px"); }
	});	
	
	Object.defineProperty(this, "width", 
	{
		get: function() { return self.getAttribute("width"); },
		set: function(value) { 
			if (self._combobox) {value = value + 14;} 
			else if (self._datebox) {value = value - 8;} 
			self.setAttribute("max-width", value+"px"); 
			self.setAttribute("width", value+"px"); 
		}
	});	

	Object.defineProperty(this, "fixedwidth", 
	{
		get: function() { return self._fixedwidth; },
		set: function(value) { 
			self.setAttribute("width", value+"px"); 
			self._fixedwidth = value; 
			if (typeof self._td !== 'undefined')
			{
				$(self._td).css("max-width", value+"px !important");
				$(self._td).css("min-width", value+"px !important");
				$(self._td).css("width", value+"px !important");
			}
		}
	});	

	Object.defineProperty(this, "height", 
	{
		get: function() { return self.getAttribute("height"); },
		set: function(value) { if (self._combobox) {value = value + 3; self.setAttribute("height", value+"px !important");return;} self.setAttribute("height", value+"px"); if (self._label) {self.setAttribute("line-height", value+"px");} }
	});	

	Object.defineProperty(this, "fixedheight", 
	{
		get: function() { return self._fixedheight; },
		set: function(value) { 
			self._fixedheight = value; 
			self.setAttribute("height", value+"px"); 
			if (self._label) { self.setAttribute("line-height", value+"px"); } 
			else if (typeof self._tr !== 'undefined')
			{
				$(self._tr).css("max-height", value);
				$(self._tr).css("min-height", value);
				$(self._tr).css("height", value);
			}		
		}
	});	

	Object.defineProperty(this, "minheight", 
	{
		get: function() { return self._minheight; },
		set: function(value) { 
			self._minheight = value; 
			self.setAttribute("min-height", value+"px"); 
			if (self._label) { self.setAttribute("line-height", value+"px"); } 
			else if (typeof self._tr !== 'undefined')
			{
				$(self._tr).css("min-height", value);
			}		
		}
	});	

	Object.defineProperty(this, "maxheight", 
	{
		get: function() { return self._maxheight; },
		set: function(value) { 
			self._maxheight = value; 
			self.setAttribute("max-height", value+"px"); 
			if (self._label) { self.setAttribute("line-height", value+"px"); } 
			else if (typeof self._tr !== 'undefined')
			{
				$(self._tr).css("max-height", value);
			}		
		}
	});	

	Object.defineProperty(this, "checked", 
	{
		get: function() { return self.getAttribute("checked"); },
		set: function(value) { self.setAttribute("checked", value); }
	});	

	Object.defineProperty(this, "text", 
	{
		get: function() { 
			if (self._label||self._button) {
				return alltrim($(self._element).text());
			} 
			else {
				if (self._html) return $(self._element).html();
				return $(self._element).val();
			} 
		},
		set: function(value) { 
			if (self._datepicker)
			{
				$(self._element).datepicker("remove");
				$(self._element).val(value);
				if (Lianja.App.locale !== 'en')
				{
					$(self._element).datepicker(
					{
							format: 'yyyy-mm-dd', 
							autoclose:true,
							language:Lianja.App.locale
					})
						.on('changeDate', function(ev) {
							$(self._element).datepicker('hide');
					});
				}
				else
				{
					$(self._input).datepicker({format: 'yyyy-mm-dd', autoclose:true})
						.on('changeDate', function(ev) {
							$(self._element).datepicker('hide');
					});
				}
				/*
				$(self._element).datepicker({format: 'yyyy-mm-dd', autoclose:true})
					.on('changeDate', function(ev) {
						$(self._element).datepicker('hide');
				});
				*/
			}
			else if (self._label) {
				$(self._element).html(" "+value+" ");
			} 
			else if (self._button) {
				$(self._element).text(value);
			} 
			else {
				if (self._html) $(self._element).html(value);
				return $(self._element).val(value);
			} 
		}
	});	

	Object.defineProperty(this, "caption", 
	{
		get: function() { 
			if (self._label||self._button) {
				return alltrim($(self._element).text());
			} 
			else {
				if (self._html) return $(self._element).html();
				return $(self._element).val();
			} 
		},
		set: function(value) { 
			if (self._datepicker)
			{
				$(self._element).datepicker("remove");
				$(self._element).val(value);
				if (Lianja.App.locale !== 'en')
				{
					$(self._element).datepicker(
					{
							format: 'yyyy-mm-dd', 
							autoclose:true,
							language:Lianja.App.locale
					})
						.on('changeDate', function(ev) {
							$(self._element).datepicker('hide');
					});
				}
				else
				{
					$(self._input).datepicker({format: 'yyyy-mm-dd', autoclose:true})
						.on('changeDate', function(ev) {
							$(self._element).datepicker('hide');
					});
				}
				/*
				$(self._element).datepicker({format: 'yyyy-mm-dd', autoclose:true})
					.on('changeDate', function(ev) {
						$(self._element).datepicker('hide');
				});
				*/
			}
			else if (self._label) {
				$(self._element).html(" "+value+" ");
			} 
			else if (self._button) {
				$(self._element).text(" "+value+" ");
			} 
			else {
				if (self._html) $(self._element).html(value);
				return $(self._element).val(value);
			} 
		}
	});	

	Object.defineProperty(this, "value", 
	{
		get: function() { 
			if (self._label||self._button) {
				return alltrim($(self._element).text());
			} 
			else {
				if (self._html) return $(self._element).html();
				return $(self._element).val();
			} 
		},
		set: function(value) { 
			if (self._datepicker)
			{
				$(self._element).text(value);
				$(self._element).datepicker("setValue", value);
			}
			else if (self._label||self._button) {
				$(self._element).text(" "+value+" ");
			} 
			else {
				if (self._html) $(self._element).html(value);
				return $(self._element).val(value);
			} 
		}
	});	

	Object.defineProperty(this, "name", 
	{
		get: function() { return self._element.name; },
		set: function(value) { self._element.name = value; window[ value ] = self; }
	});	

	Object.defineProperty(this, "element", 
	{
		get: function() { return self._element; },
		set: function(value) { console.log("set element is readonly ignored"); }
	});	

	Object.defineProperty(this, "controlsource", 
	{
		get: function() { return self._controlsource; },
		set: function(value) { self._controlsource = value; }
	});	

	Object.defineProperty(this, "spacing", 
	{
		get: function() { return self._spacing; },
		set: function(value) { 
			if (!self._container) return;
			self._spacing = value;
			if (typeof self._containerel === 'undefined') return;
			if (!$(self._containerel[0]).hasClass("ui-lianja-nobordercollapse"))
			{
				$(self._containerel[0]).addClass("ui-lianja-nobordercollapse");
			}
			$(self._containerel[0]).css("borderSpacing", "0px " + value + "px");
		}
	});	

	Object.defineProperty(this, "backcolor", 
	{
		get: function() { return self.getAttribute("background-color"); },
		set: function(value) { self.setAttribute("background-color", value); }
	});	

	Object.defineProperty(this, "forecolor", 
	{
		get: function() { return self.getAttribute("color"); },
		set: function(value) { self.setAttribute("color", value); }
	});	

	Object.defineProperty(this, "alignment", 
	{
		get: function() { return self.getAttribute("text-align"); },
		set: function(value) { self.setAttribute("text-align", value); }
	});	

	Object.defineProperty(this, "fontsize", 
	{
		get: function() { return self.getAttribute("font-size"); },
		set: function(value) { 
			if (typeof value == 'string') self.setAttribute("font-size", value);
			else self.setAttribute("font-size", value+"px"); 
		}
	});	

	Object.defineProperty(this, "fontbold", 
	{
		get: function() { return self.getAttribute("font-weight")=="bold"; },
		set: function(value) { self.setAttribute("font-weight", value?"bold":"normal"); }
	});	

	Object.defineProperty(this, "fontshadow", 
	{
		set: function(value) { self.setAttribute("text-shadow", value?"0 1px 0 #fff !important":"none"); }
	});	

	Object.defineProperty(this, "bordercolor", 
	{
		get: function() { return self.getAttribute("border-color"); },
		set: function(value) { self.setAttribute("border-color", value); }
	});	

	Object.defineProperty(this, "borderwidth", 
	{
		get: function() { return self.getAttribute("border-width"); },
		set: function(value) { self.setAttribute("border-width", value+"px"); }
	});	

	Object.defineProperty(this, "marginright", 
	{
		get: function() { return self.getAttribute("margin-right"); },
		set: function(value) { self.setAttribute("margin-right", value+"px"); }
	});	

	Object.defineProperty(this, "marginleft", 
	{
		get: function() { return self.getAttribute("margin-left"); },
		set: function(value) { self.setAttribute("margin-left", value+"px"); }
	});	

	Object.defineProperty(this, "margin", 
	{
		get: function() { return self._margin; },
		set: function(value) { 
			self._margin = value; 
			if (typeof self._table !== 'undefined')
			{
				self.setAttribute("padding", value+"px"); 
				$(self._element).css("width", 'auto !important'); 
				$(self._element).css("height", 'auto !important'); 
			}
			else
			{
				self.setAttribute("margin", value+"px"); 
			}
		}
	});	

	Object.defineProperty(this, "picture", 
	{
		set: function(value) { $(self._element).html("<img src=" + value + " style='height:100%; width:100%' />"); }
	});	

	Object.defineProperty(this, "stylesheet", 
	{
		set: function(value) { $(self._element).style = value; }
	});	

	Object.defineProperty(this, "choicelist", 
	{
		get: function() { return self._choicelist; },
		set: function(value) { 
			self._choicelist = value;
			if (value.length > 0) 
			{
				if (startswith(value.toLowerCase(), "select ") || startswith(value.toLowerCase(), "+select "))
				{
					new Lianja.addDynamicComboItems(self._element, this._section.database, self._choicelist, self.text); 
				}
				else if (value[0] == '{')
				{
					dynamiccombobox = true;
					new Lianja.addDynamicComboItemsExpression(self._element, value, self.text); 
				}
				else
				{
					var alist = value.split(",");
					$(self._element).empty();
					_.each(alist, function(item)
					{
						var option = document.createElement("option");
						option.text = item;
						option.value = item;
						$(self._element).append(option); 
					});
				}
			}
		}
	});	

	Object.defineProperty(this, "layout", 
	{
		get: function() { return self._layout; },
		set: function(value) { 
			if (!self._container) return;
			self._layout = value;
			if (value.length > 0) 
			{
				if (startswith(value.toLowerCase(), "h"))
				{
					var table = $("<table cellpadding='0' border='0' style='width:100%;height:100%'>");
					var tr = $("<tr>");
					$(table).append(tr);
					self._containerel = tr;
					self._layout = "H";
					self._table = table;
					$(self._element).append(table);
					self.spacing = self._spacing;
				}
				else if (startswith(value.toLowerCase(), "v"))
				{
					var table = $("<table cellpadding='0' border='0' style='width:100%;height:100%'>");
					self._table = table;
					self._containerel = table;
					self._layout = "V";
					self._table = table;
					$(self._element).append(table);
					self.spacing = self._spacing;
				}
				else if (startswith(value.toLowerCase(), "g"))
				{
					var table = $("<table cellpadding='0' border='0' style='width:100%;height:100%'>");
					self._table = table;
					self._containerel = table;
					self._layout = "G";
					self._table = table;
					$(self._element).append(table);
					self.spacing = self._spacing;
				}
				else if (startswith(value.toLowerCase(), "f"))
				{
					var table = $("<table border='0' style='width:100%;height:100%'>");
					self._table = table;
					self._containerel = table;
					self._layout = "F";
					self._table = table;
					$(self._element).append(table);
					self.spacing = self._spacing;
				}
				else
				{
					Console.log("unknown layout type - "+value);
				}
			}
		}
	});	

	Object.defineProperty(this, "style", 
	{
		set: function(value) { 
			var list = value.trim();
			var vlist = list.split(";");
			_.each(vlist, function(item)
			{
				var ilist = item.split(":");
				if (ilist.length === 2)
				{
					$(self._element).css(ilist[0], ilist[1]); 
				}
			});
		}
	});	

	Object.defineProperty(this, "css", 
	{
		set: function(value) { 
			var list = value.trim();
			var vlist = list.split(";");
			_.each(vlist, function(item)
			{
				var ilist = item.split(":");
				if (ilist.length === 2)
				{
					$(self._element).css(ilist[0], ilist[1]); 
				}
			});
		}
	});	

	Object.defineProperty(this, "readonly", 
	{
		get: function() { return $(self._element).readOnly; },
		set: function(value) { Lianja.App.setReadonly(self._element, value); }
	});	

	Object.defineProperty(this, "password", 
	{
		get: function() { return self._password; },
		set: function(value) { if (value) { $(self._element).attr('type','password'); self._password=true; } else { $(self._element).attr('type','textbox'); self._password = false;} }
	});	

	Object.defineProperty(this, "inputmask", 
	{
		get: function() { return self._inputmask; },
		set: function(value) { self._inputmask = value; Lianja.setInputMask(self._element, value) }
	});	

	// core events
	Object.defineProperty(this, "click", 
	{
		set: function(value) { $(self._element).on("click", value ); }
	});	
	Object.defineProperty(this, "mouseEnter", 
	{
		set: function(value) { $(self._element).on("mouseenter", value ); }
	});	
	Object.defineProperty(this, "mouseLeave", 
	{
		set: function(value) { $(self._element).on("mouseleave", value ); }
	});	
	Object.defineProperty(this, "mouseDown", 
	{
		set: function(value) { $(self._element).on("mousedown", value ); }
	});	
	Object.defineProperty(this, "mouseUp", 
	{
		set: function(value) { $(self._element).on("mouseup", value ); }
	});	
	Object.defineProperty(this, "mouseMove", 
	{
		set: function(value) { $(self._element).on("mousemove", value ); }
	});	
	Object.defineProperty(this, "lostFocus", 
	{
		set: function(value) { $(self._element).on("blur", value ); }
	});	
	Object.defineProperty(this, "gotFocus", 
	{
		set: function(value) { $(self._element).on("focus", value ); }
	});	
	Object.defineProperty(this, "keyUp", 
	{
		set: function(value) { $(self._element).on("keyup", value ); }
	});	
	Object.defineProperty(this, "interactiveChange", 
	{
		set: function(value) { $(self._element).on("keyup", value ); }
	});	
	Object.defineProperty(this, "change", 
	{
		set: function(value) { $(self._element).on("change", value ); }
	});	
	Object.defineProperty(this, "changed", 
	{
		set: function(value) { $(self._element).on("change", value ); }
	});	
	// lowercase aliases
	Object.defineProperty(this, "mouseenter", 
	{
		set: function(value) { $(self._element).on("mouseenter", value ); }
	});	
	Object.defineProperty(this, "mouseleave", 
	{
		set: function(value) { $(self._element).on("mouseleave", value ); }
	});	
	Object.defineProperty(this, "mousedown", 
	{
		set: function(value) { $(self._element).on("mousedown", value ); }
	});	
	Object.defineProperty(this, "mouseup", 
	{
		set: function(value) { $(self._element).on("mouseup", value ); }
	});	
	Object.defineProperty(this, "mousemove", 
	{
		set: function(value) { $(self._element).on("mousemove", value ); }
	});	
	Object.defineProperty(this, "lostfocus", 
	{
		set: function(value) { $(self._element).on("blur", value ); }
	});	
	Object.defineProperty(this, "gotfocus", 
	{
		set: function(value) { $(self._element).on("focus", value ); }
	});	
	Object.defineProperty(this, "keyup", 
	{
		set: function(value) { $(self._element).on("keyup", value ); }
	});	
	Object.defineProperty(this, "interactivechange", 
	{
		set: function(value) { $(self._element).on("keyup", value ); }
	});	

	// core methods
	this.show = function()
	{
		$(self._element).css("display", "block");
	};
	
	this.hide = function()
	{
		$(self._element).css("display", "none");
	};
	
	this.resize = function(width, height)
	{
		self.width = width;
		self.height = height;
	};
	
	this.move = function(left, top, width, height)
	{
		self.top = top;
		self.left = left;
		if (typeof width !== 'undefined') self.width = width;
		if (typeof height !== 'undefined') self.height = height;
	};
	
	this.relayout = function()
	{
		if (typeof self._right === undefined || typeof self._left === 'undefined') return;
		var left = self._left;
		var right = self._right;
		var el = $(self._element).parent();
		var pwidth = $(el).css("width");
		var wid;
		var cnt = 0;
		while (pwidth == 0 || pwidth == "100%" || pwidth == "0px")
		{
			++cnt;
			if (cnt > 10) return;
			el = el.parent();
			if (el == null) break;
			pwidth = $(el).css("width");
		}
		if (typeof pwidth === 'undefined') return;
		if (pwidth == null) return;
		if (pwidth == 0 || pwidth == "0px") return;
		ppos = pwidth.indexOf("px");
		if (ppos < 0) return;
		pwidth = parseFloat(pwidth.substring(0, ppos));
		wid = pwidth - (self._right + self._left);
		self.width = wid;
	};
	
	this.refresh = function()
	{
		if (self._controlsource.length == 0) return;
		var pos = self._controlsource.indexOf(".");
		var table = undefined;
		var cursor = undefined;
		if (pos > 0)
		{
			table = self._controlsource.substring(0,pos);
			cursor = Lianja.App.getCursor("", table);
		}
		
		if (typeof cursor !== 'undefined')
		{
			try
			{
				var result = cursor.getValue(self._controlsource);
				if (typeof result !== 'undefined') 
				{
					self.text = result;
					return;
				}
			}
			catch(e)
			{
			;
			}
		}
		
		try
		{
			var result = eval(self._controlsource);
			self.text = result;
		} 
		catch(e) 
		{
			Lianja.evaluate(self._controlsource,
				function(result, args)
				{
					self.text = result;
				},
				function(args)
				{
					self.text = result;
				},
				{ }
			);
		}
	};
	
	this.save = function()
	{
		//console.log("save() self._controlsource="+self._controlsource);
		if (self._controlsource.length == 0) return;
		var pos = self._controlsource.indexOf(".");
		var table = undefined;
		var cursor = undefined;
		var page = undefined;
		var section = undefined;
		if (pos > 0)
		{
			table = self._controlsource.substring(0,pos);
			cursor = Lianja.App.getCursor("", table);
			if (typeof cursor !== 'undefined')
			{
				//console.log("save() self._controlsource="+self._controlsource+", value="+self.value);
				var dirty = cursor.setChangedValue(self._controlsource, self.value);
				if (typeof self._page !== 'undefined' && typeof self._section !== 'undefined' && dirty) 
				{
					//console.log("save() self._page="+self._page.id+", self._section="+self._section.id+", self._controlsource="+self._controlsource+", value="+self.value);
					self._page.addDirtySection(self._section);
					self._page.dirty = true;
				}
			}
		}
	};
	
	this.setFocus = function()
	{
		$(self._element).focus();
	};
	this.setfocus = this.setFocus;
	
	this._adjustHLayout = function()
	{
		var count = self._containerchildren.length;
		var i;
		var td;
		var percent = 100 / count;
		for (i=0; i<count; ++i)
		{
			td = self._containerchildren[i];
			$(td).width(""+percent+"%");
		}
	};
	
	this._adjustVLayout = function()
	{
		var count = self._containerchildren.length;
		var i;
		var tr;
		var percent = 100 / count;
		for (i=0; i<count; ++i)
		{
			tr = self._containerchildren[i];
			$(tr).height(""+percent+"%");
		}
	};
	
	this.addStretch = function()
	{
		if (typeof self._layout !== 'string') return;
		if (self._layout == "H")
		{
			var td = $("<td>");
			$(td).width("100%");
			$(self._containerel).append(td);
		}
		else if (self._layout == "V")
		{
			var tr = $("<tr>");
			var td = $("<td>");
			$(tr).height("100%");
			$(self._table).append(tr);
			$(tr).append(td);
		}
	};
	this.addstretch = this.addStretch;
	
	this._addObjectToLayout = function(object, row, col, nRow, nCol)
	{
		var parent = self._containerel;
		if (self._layout == "H")
		{
			$(object.element).css("position", 'inherit');
			//if (object._button) $(object.element).css("margin-top", '-8px !important');	// need to align the elements
			var td = $("<td>");
			$(parent).append(td);
			$(td).append(object.element);
			self._containerchildren.push(td);
			object._td = td;
			self._adjustHLayout();
		}
		else if (self._layout == "V")
		{
			$(object.element).css("position", 'inherit');
			var tr;
			if (self._containerchildren.length == 0) tr = $("<tr valign='top'>");
			else tr = $("<tr>");
			var td = $("<td>");
			$(td).width("100%");
			$(parent).append(tr);
			$(tr).append(td);
			$(td).append(object.element);
			$(object.element).css("width", "100%");
			if (object._textbox) $(object.element).css("padding", "6px 0px");
			object._tr = tr;
			self._containerchildren.push(tr);
			//self._adjustVLayout();
		}
		else if (self._layout == "F")
		{
			// TODO: "Form" layout with addRow() method.
		}
		else if (self._layout == "G")
		{
			if (typeof row !== 'number') return;
			if (typeof col !== 'number') return;
			if (typeof nRow === "undefined") nRow = 1;
			if (typeof nCol === "undefined") nCol = 1;
			$(object.element).css("position", 'inherit');
			var tr = $(parent).find('tr').eq(row);
			var td = null;
			if (tr === null || tr === undefined || tr.length === 0)
			{					
				tr = $("<tr rowspan='" + nRow + "' valign='top'>");
				$(parent).append(tr);
			}
			else
			{
				td = $(tr).find('td').eq(col);
			}
			if (td === null || td === undefined || td.length === 0)
			{
				td = $("<td colspan='" + nCol + "'>");
				$(tr).append(td);
			}
			else
			{
				$(td).html("");
			}
			$(td).append(object.element);
			$(object.element).css("width", "100%");
			$(object.element).css("height", "100%");
			if (object._textbox) $(object.element).css("padding", "6px 0px");
			object._tr = tr;
			object._td = td;
			if (self._containerchildren.indexOf(tr)<0)
			{
				self._containerchildren.push(tr);
			}
		}
	};
	
	this.addObject = function(name, type, row, col, nRow, nCol)
	{
		if (typeof type === 'undefined')
		{
			var object = Lianja.createObject(name);
			$(self._element).append(object.element);
			return object;
		}
			
		var object = Lianja.createObject(type);
		object.name = name;
		
		if (typeof self._layout === 'string')
		{
			self._addObjectToLayout(object, row, col, nRow, nCol);
		}
		else
		{
			$(self._element).append(object.element);
		}
		window[ name ] = object; 
		
		return object;
	};
	this.addobject = this.addObject;

	this.addProperty = function(name, value)
	{
		self.name = value;
	};
	this.addproperty = this.addProperty;

	this.addItems = function(list)
	{
		if (startswith(list.toLowerCase(), "select ") || startswith(list.toLowerCase(), "+select "))
		{
			if (!self._combobox || typeof self._section === 'undefined')
			{
				throw "Method addItem() not supported on this object";
			}
			new Lianja.addDynamicComboItems(self._element, self._section.database, list, undefined); 
		}
		else if (list.choicelist[0] == '{')
		{
			dynamiccombobox = true;
			new Lianja.addDynamicComboItemsExpression(self._element, list.choicelist, undefined); 
		}
		else
		{
			var alist = list.split(",");
			_.each(alist, function(item)
			{
				self.addItem(item);
			});
		}
	};
	this.additems = this.addItems;
	
	this.addItem = function(value)
	{
		if (!self._combobox)
		{
			throw "Method addItem() not supported on this object";
		}
		
		var option = document.createElement("option");
		option.text = value;
		option.value = value;
		$(self._element).append(option); 
	};
	this.additem = this.addItem;
	
	this.bindEvent = function(event, callback)
	{
		$(self._element).on(event, callback);
	};
	this.bindevent = this.bindEvent;
	this.on = this.bindEvent;
	
	// core events which can be overridden
	this.init = function() {};
	this.load = function() {};
	this.ready = function() {};
	this.click = function() {};
	this.mouseEnter = function() {};
	this.mouseLeave = function() {};
	this.mouseDown = function() {};
	this.mouseUp = function() {};
	this.mouseMove = function() {};
	this.lostFocus = function() {};
	this.gotFocus = function() {};
	this.interactiveChange = function() {};
	this.changed = function() {};
	this.dataChanged = function() {};
	this.linkClicked = function () {};
	
};


//================================================================================
window.Lianja.addDynamicComboItems = function(element, database, sql, text)
{
	var self = this;
	this.element = element;
	this.text = text;

	$(element).empty();

	if (startswith(sql.toLowerCase(), "+select "))
	{
		self.addItem("");
		sql = sql.substring(1);
	}
	
	this.addItem = function(value)
	{
		var option = document.createElement("option");
		option.text = value;
		option.value = value;
		$(self.element).append(option); 
	};

	this.addItems = function(alist)
	{
		$(self.element).empty();
		_.each(alist, function(item)
		{
			for (key in item)
			{
				self.addItem(item[key]);
				break;
			}
		});
	};
	
	var url = "/odata/" + database + "?$sql="+sql;
	if (typeof LianjaAppBuilder === 'object')
	{
		Lianja.OData_Read(url, 
						  function(status, result, args)
						  {
							if (!status) return;
							result = JSON.parse(result);
							self.addItems(result.d.results);
							if (typeof args.text !== 'undefined') $(self.element).val(args.text)
						  },
						  { text: text },
						  true);
		return;
	}
	
	Lianja.OData_ReadJSON(url, 
						  function(status, result, args)
						  {
							if (!status) return;
							self.addItems(result.d.results);
							if (typeof args.text !== 'undefined') $(self.element).val(args.text)
						  },
						  { text: text },
						  true);
};


//================================================================================
window.Lianja.addDynamicComboItemsExpression = function(element, expr, text)
{
	var self = this;
	this.element = element;
	this.expr = expr;
	this.text = text;

	$(element).empty();

	this.addItem = function(value)
	{
		var option = document.createElement("option");
		option.text = value;
		option.value = value;
		$(self.element).append(option); 
	};

	this.addItems = function(alist)
	{
		$(self.element).empty();
		_.each(alist, function(item)
		{
			self.addItem(item);
		});
	};
	
	if (self.expr[0] == '{') 
	{
		self.expr = self.expr.substr(1);
	}
	if (self.expr.length > 1 && self.expr[self.expr.length-1] == '}') 
	{
		self.expr = self.expr.substr(0, self.expr.length-1);
	}
	
	try
	{
		var result = eval(self.expr);
		result = result.split(",");
		self.addItems(result);
		if (typeof self.text !== 'undefined') $(self.element).val(self.text)
	} 
	catch(e) 
	{
		Lianja.evaluate(
			self.expr, 
			function(result)
			{
				result = result.split(",");
				self.addItems(result);
				if (typeof self.text !== 'undefined') $(self.element).val(self.text)
			},
			function()
			{
			},
			{}
		);
	}
};


//================================================================================
window.Lianja.bindDelegates = function()
{
	_.each(Lianja.App.delegates, function(obj)
	{
		var id = obj.id.replace(/_/g, "-");
		if (obj.type === 'page')
		{
			var el = $("#"+id);
			if (typeof el == 'undefined') return;
			Lianja.App.addDelegate(obj.id, obj.event, obj.action);
		}
		else if (obj.type === 'section')
		{
			var el = $("#"+id);
			if (typeof el == 'undefined') return;
			Lianja.App.addDelegate(obj.id, obj.event, obj.action);
		}
		else if (obj.type === 'formitem')
		{
			var el = $("#"+id);
			if (typeof el == 'undefined') return;
			Lianja.App.addDelegate(obj.id, obj.event, obj.action);
		}
		else if (obj.type === 'app')
		{
			Lianja.App.addDelegate("__app", obj.event, obj.action);
		}
	});
};

//================================================================================
window.Lianja.bindGestures = function()
{
	if (typeof Hammer === 'undefined') return;
	
	_.each(Lianja.gesturesmap, function(obj)
	{
		var id = obj.id.replace(/_/g, "-");
		var action = obj.action.toLowerCase();
		var element = document.getElementById(id);
		//console.log("bindGestures() action="+action+", id="+id);
		Hammer(element).on(action, function(event) {
			if (typeof Lianja.page.editing == "boolean" && Lianja.page.editing) return;
			try 
			{
				if (event.target.parentElement.tagName === "A") return;
				if (event.target.parentElement.parentElement.tagName === "A") return;
			} 
			catch (e)
			{
			}
			Lianja.App.dispatchDelegate(id, action);
		});
	});
};


//================================================================================
window.Lianja.callDelegates = function(event)
{
	var pagecount = Lianja.App.getPageCount();
	var i;
	var j;
	var k;
	var page;
	var section;
	var formitem;
	var sectioncount;
	var formitemcount;

	Lianja.App.dispatchDelegate("__app", event);
	
	for (i=0; i<pagecount; ++i)
	{
		page = Lianja.App.getPage(i);
		Lianja.App.dispatchDelegate(page.id, event);
		sectioncount = page.getSectionCount();
		for (j=0; j<sectioncount; ++j)
		{
			section = page.getSection(j);
			Lianja.App.dispatchDelegate(section.id, event);
			formitemcount = section.getFormItemCount();
			for (k=0; k<formitemcount; ++k)
			{
				formitem = section.getFormItem(k);
				Lianja.App.dispatchDelegate(formitem.id, event);
			}
		}
	}
};

//================================================================================
window.Lianja.doSectionMethod = function(id, method)
{
	var fn = Lianja.App.getMethodHandler(id);
	try 
	{
		fn(method);
	} 
	catch (e)
	{
		console.log(e);
	}
};

//================================================================================
window.Lianja.adjustPhoneGapUI = function()
{
	Lianja.initPhoneGapStatusBar();
};

//================================================================================
window.Lianja.isElectron = function()
{
	return Lianja.App.electron;
};

//================================================================================
window.Lianja.isPhoneGap = function()
{
	return Lianja.App.phonegap;
};

//================================================================================
window.Lianja.phonegapDevice = function()
{
	return Lianja.App.targetui;
};

//================================================================================
window.Lianja.phonegapPlatform = function()
{
	return typeof window.cordova !== 'undefined' ? window.cordova.platformId : 'com.adobe.phonegap.app';
};

//================================================================================
window.Lianja.phonegapPlatformVersion = function()
{
	return typeof window.cordova !== 'undefined' ?  window.cordova.platformVersion : "5.0";
};

//================================================================================
window.Lianja.enableNavigationButtons = function()
{
	var el = $(document).find('.ui-pageheader-navbutton-disabled');
	$(el).removeClass("ui-pageheader-navbutton-disabled");
	Lianja.setNavigationButtonEnabled("add", true);
	Lianja.setNavigationButtonEnabled("delete", true);
	Lianja.setNavigationButtonEnabled("refresh", true);
	Lianja.setNavigationButtonEnabled("first", true);
	Lianja.setNavigationButtonEnabled("previous", true);
	Lianja.setNavigationButtonEnabled("next", true);
	Lianja.setNavigationButtonEnabled("last", true);
	Lianja.setNavigationButtonEnabled("edit", true);
	Lianja.setNavigationButtonEnabled("save", false);
	Lianja.setNavigationButtonEnabled("cancel", false);
};

//================================================================================
window.Lianja.setNavigationButtonEnabled = function(name, state)
{
	var btnid = "#" + Lianja.App.currentpageid.toLowerCase() + "_navbutton_" + name.toLowerCase();
	btnid = str_replace("##", "#", btnid);
	
	var el = $(document).find(btnid);
	if (state)
	{
		$(el).removeClass("ui-pageheader-navbutton-disabled");
		$(el).addClass("ui-pageheader-navbutton-enabled");
	}
	else
	{
		$(el).removeClass("ui-pageheader-navbutton-enabled");
		$(el).addClass("ui-pageheader-navbutton-disabled");
	}	
};

//================================================================================
window.Lianja.convertArguments = function(argv)
{
	if (typeof argv === 'undefined') return "";
	var argc = argv.length;
	var i;
	var str = "";
	var arg;
	
	for (i=0; i<argc; ++i)
	{
		arg = argv[i];
		if (typeof arg === 'string')
		{
			if (str.length > 0) str += ",";
			str = str + "'" + arg + "'";
		}
		else if (typeof arg === 'number')
		{
			if (str.length > 0) str += ",";
			str = str + arg;
		}
		else if (typeof arg === 'boolean')
		{
			if (str.length > 0) str += ",";
			str = str + arg;
		}
		else if (typeof arg === 'object')
		{
			if (str.length > 0) str += ",";
			arg = base64_encode( JSON.stringify(arg) );
			str = str + arg;
		}
		else if (typeof arg === 'date')
		{
			if (str.length > 0) str += ",";
			arg = dtos(arg);
			str = str + arg;
		}
	}
	
	return str;
};

//================================================================================
window.Lianja.registerImports = function(imports)
{
	var i;
	var len = imports.length;
	for (i=0; i<len; ++i)
	{
		Lianja.registerRPC(imports[i].lib, imports[i].func, imports[i].type); 
	}
};

//================================================================================
window.Lianja.registerRPC = function(lib, func, type)
{
	try 
	{
		var libfunc;
		if (lib.length > 0) libfunc = lib + "::" + func;
		else libfunc = func;
		if (typeof type === 'undefined') type = "";
		var cmd = "window." + func + " = function() { var args = Lianja.convertArguments(arguments); return Lianja.callRPC('" + libfunc + "',type,args) } ";
		eval(cmd);
	} 
	catch (e)
	{
		console.log(e);
	}
};

//================================================================================
window.Lianja.callRPC = function(func, type, args)
{
	if (type === "javascript")
	{
		return Lianja.evaluateJavaScript("javascript:" + func + "(" + args + ")");
	}
	else if (type === "php")
	{
		return Lianja.evaluateJavaScript("php:" + func + "(" + args + ")");
	}
	else if (type === "python")
	{
		return Lianja.evaluateJavaScript("python:" + func + "(" + args + ")");
	}
	else
	{
		return Lianja.evaluate(func + "(" + args + ")");
	}
};

//================================================================================
window.Lianja.setRefreshInterval = function(id, type, interval)
{
	var self = this;
	this.id = id;
	this.type = type;
	this.interval = interval;
	setInterval( function() { Lianja.App.dispatchDelegate(self.id, "timer"); }, self.interval*1000);
};

//================================================================================
window.Lianja.setRefreshRightSideBarInterval = function(pageid, interval)
{
	var self = this;
	this.pageid = pageid;
	setInterval( function() { Lianja.refreshRightSideBar(self.pageid); }, self.interval*1000);
};

//================================================================================
window.Lianja.registerMethodHandler = function(id, handler)
{
	Lianja.App.setMethodHandler(id, handler);
};

//================================================================================
window.Lianja.confirm = function(message, callback)
{
	if (Lianja.App.phonegap)
	{
		navigator.notification.confirm(message, 
			function(result)
			{
				callback(result===1);
			}
		);
	}
	else
	{
		bootbox.confirm(message, callback);
	}
};

//================================================================================
window.Lianja.chooseImageSource = function(callback)
{
	navigator.notification.confirm( 'Select the source for the picture below', callback, 'Choose Picture', ['Camera', 'Album']);	
};

//================================================================================
window.Lianja.showTouch = function(el, start)
{
	if (start)
	{
		$(el).css("background-color", "#eee");
	}
	else
	{
		$(el).css("background-color", "white");
	}
};

//================================================================================
window.Lianja.alert = function(message)
{
	if (Lianja.App.phonegap)
	{
		navigator.notification.alert(message);
	}
	else
	{
		bootbox.alert(message);
	}
};

var idleTimer = null;
var idleState = false;
var idleWait = 5000;

//================================================================================
window.Lianja.startInactiveTimer = function(interval)
{
	if (typeof interval !== 'undefined') idleWait = interval * 1000;
	if (typeof interval !== null) clearTimeout(idleTimer);

	$('*').bind('mousemove keydown scroll', function () 
	{	
		if (idleTimer != null) clearTimeout(idleTimer);
				
		//console.log("startInactiveTimer setTimeout()");
		idleTimer = setTimeout(
			function () { 
				Lianja.App.dispatchDelegate("__app", "inactive");
			}, idleWait);
	});
	
	$("body").trigger("mousemove");
};

//================================================================================
try {
window.Lianja.localStorage = window.localStorage;
window.Lianja.sessionStorage = window.sessionStorage;
} catch(e)
{
}

//================================================================================
window.guid = function() {
	if (typeof Math.uuid === 'undefined') return Lianja.generateUUID();
	return Math.uuid();
};

//================================================================================
window.debug = function() {};

//================================================================================
// The global Lianja.App object
window.Lianja.App = new Lianja.Application();
window.Lianja.cloudserver = new Lianja.rpc();
window.Lianja.requiremap = [];
window.Lianja.requiremapexports = [];




