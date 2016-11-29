/*
 * jQuery plugin SimpleSplitView v1.0.1
 * http://newbound.com/simplesplitview
 * March 21, 2012
 * 
 * Copyright 2012, Peter Yared & Marc Raiser
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * -------------------------------
 *
 * Barry Mavin (Lianja) changes
 *
 * 	The max-width on the leftpanel can be used to set it's width rather than always using 400px
 *
 */

(function( $ ){
	function internalInit(container) {
		var myid = container.id;
		var maxwidth = "200";
		var margin = $("#"+myid).data("lianjaContentMargin");
		if (typeof margin == 'number') margin = ""+margin;
		if (typeof margin !== 'string') margin = "0";
		var mpos = margin.indexOf("px");
		if (mpos > 0) margin = margin.substring(0, mpos);
		margin = parseInt(margin);
		var bottom = $("#"+myid).data("lianjaContentBottom");
		if (typeof bottom == 'number') bottom = ""+bottom;
		if (typeof bottom !== 'string') bottom = margin;
		var newhtml =
			"<div id='"+myid+"-basediv' style='position:absolute;{top};{left};{bottom};{right};'>" +
			"<table border='0' cellpadding='0' cellspacing='0' width='100%' height='100%' style='width:100%;height:100%;'>" +
			"<tr>" +
			"<td valign='top' id='"+myid+"-leftpagepanel' style='width:{1}px;position:absolute; top:0px; bottom:0px; overflow: hidden;'>" +
			"<div id='"+myid+"-leftcontainer' style='position:absolute;top:0px;bottom:0px;height:100%; width:100%;padding-top:0px;'><div>" +
			"</td>" +
			"<td id='"+myid+"-rightpagepanel' valign='top' style='position:absolute; top:0px; bottom:0px; left:{2}px !important; right:0px; overflow-x: hidden; overflow-y:hidden; border-left-style: none; border-left-width: thin; border-left-color: lightgray;padding-bottom:0px;'><div id='"+myid+"-rightcontainer' class='splitview' height='100%' style='width:100%;height: 100%;padding-top:0px;'></div>" +
			"</td></tr></table></div>";
		
		var kids = container.childNodes;
		var leftkids = [];
		var rightkids = [];
		var re1 = new RegExp('\\bleftside\\b');
		var re2 = new RegExp('\\brightside\\b');
		for (var node in kids) {
			if (re1.test(kids[node].className)) 
			{
				// Lianja -BM- if max-width is specified use that value for the leftpanel width
				if (kids[node].style.maxWidth != 0) 
				{
					maxwidth = kids[node].style.maxWidth;
					if (parseInt(maxwidth) > 400) maxwidth = "200";
				}
				leftkids.push(kids[node]);
			}
			else if (re2.test(kids[node].className)) 
			{
				rightkids.push(kids[node]);
			}
		}

		var ppos = maxwidth.indexOf("px");
		if (ppos > 0) maxwidth = maxwidth.substring(0, ppos);
		maxwidth = parseInt(maxwidth);
		newhtml = newhtml.replace('{1}', maxwidth+1);
		newhtml = newhtml.replace('{2}', maxwidth+1);

		// need to work around WebKit layout bug
		var sbottom = "bottom:" + bottom + "px";
		var sright = "right:" + margin + "px";
		var sleft = "left:" + margin + "px";
		var stop = "top:" + margin + "px";
		//if (window.navigator.userAgent.indexOf("Chrome") > 0) sbottom = "height:100%";
		newhtml = newhtml.replace('{bottom}', sbottom);
		newhtml = newhtml.replace('{top}', stop);
		newhtml = newhtml.replace('{left}', sleft);
		newhtml = newhtml.replace('{right}', sright);

		container.style.position='fixed';
		container.style.overflow='hidden';
		container.style.width='100%';
		container.style.height='100%';
		container.style.padding='0px';
		
		// BM -- In IE11 assigning new innerHTML frees up the children even though we have a reference to them!
		if (Lianja.isIE11())
		{
			var div = document.createElement("div");
			div.innerHTML = newhtml;
			$(container).append(div);
		}
		else
		{
			container.innerHTML = newhtml;
		}
		
		container.leftcontainer = $('#'+myid+'-leftcontainer');
		container.rightcontainer = $('#'+myid+'-rightcontainer');
		container.rightcontainer.width = "100%";
		container.usesplitview = true;
		container.leftpagestack = null;
		container.rightpagestack = null;
		container.showRight = methods.showRight;
		
		$(window).bind('resize.simplesplitview', checkResolution);
		checkResolution(true);

		var pad = 0;
		if (container.padding) pad = container.padding;

		for (var node in leftkids) {
			var k = leftkids[node];
			k.style.position = 'relative';
			k.style.overflow = 'none';
			if (node == 0) {
				k.style.display = 'block';
				//k.style.height = "100%"; // Lianja -BM- ($('#'+container.id+'-leftpagepanel').height()-pad)+"px";
				var o = new Object();
				o.name = k.id;
				container.leftpagestack = o;
			}
			else k.style.display = 'none';
			//$('#'+myid+'-leftcontainer').append(k);
			container.leftcontainer.append(k);
		}				

		for (var node in rightkids) {
			var k = rightkids[node];
			k.style.position = 'relative';
			k.style.overflow = 'none';
			if (node == 0){
				//k.style.display = 'block';
				//k.style.height = "100%"; // Lianja -BM- ($('#'+container.id+'-rightpagepanel').height()-pad)+"px";
				var o = new Object();
				o.name = k.id;
				container.rightpagestack = o;
				if (container.usesplitview && container.leftpagestack != null) container.leftpagestack.right = o.name;
			}
			else k.style.display = 'none';
			//$('#'+myid+'-rightcontainer').append(k);
			container.rightcontainer.append(k);
		}			
	};
	
	function checkResolution(sync){
		$('.splitviewcontainer').each(function(){
			var me = this;
			function doResize(){
				var w = me.parentNode.offsetWidth;
				w = w - 10;	// right margin
				var leftwidth = $('#'+me.id+'-leftcontainer').width();
				me.usesplitview = true; //w > 700;
				if (me.usesplitview) {
					$('#'+me.id+'-leftcontainer').css('display', 'block');
					$('#'+me.id+'-rightcontainer').css('display', 'block');
					if (w == 0 || true) 
					{
						$('#'+me.id+'-rightcontainer').css('width', "100%");
					}
					else
					{
						$('#'+me.id+'-rightcontainer').css('width', (w-leftwidth)+"px");
					}
				}
				else {
					$('#'+me.id+'-rightcontainer').css('display', 'none');
					$('#'+me.id+'-rightpagepanel').width(0);
					$('#'+me.id+'-leftpagepanel').width(w);
				}
				var h = $(window).height();
				var pad;
				pad -= 84;
				pad -= 35;
				//pad -= 7;
				//if (me.padding) pad = me.padding;
				$('#'+me.id+'-rightpagepanel').css('left', $('#'+me.id+'-leftpagepanel').width());
				$('#'+me.id+'-rightpagepanel').height(h-pad);
				$('#'+me.id+'-rightcontainer').height(h-pad);
				$('.leftside').height(h-pad);
				//$('.rightside').height(h-pad);
				$('.rightside').height("100%");
				$('.rightside').css("overflow-x", "hidden");
				$('.rightside').css("overflow-y", "hidden");
			}
			doResize();
			//setTimeout(doResize, 1000);
		});
	};
	
	function slide(divid, pixels, millis){
		var el = document.getElementById(divid);
		el.startTime = new Date().getTime();
		el.pixels = pixels;
		el.millis = millis;
		el.slide = function(){
			var percent = (new Date().getTime() - el.startTime) / millis;
			var left = el.pixels - (percent * el.pixels);
			if (left <= 0) left = 0;
			el.style.left = left+'px';
			if (left > 0) setTimeout(el.slide, 10);
		};
		
		el.slide();
	};
	
	function showLeftInternal(container, leftpage, rightpage, dontslideright, dontslideleft){
		if (!container.usesplitview){
			var w = container.parentNode.offsetWidth;
			$('#'+container.id+'-leftcontainer').css('display', 'block');
			$('#'+container.id+'-rightcontainer').css('display', 'none');
			$('#'+container.id+'-leftpagepanel').width(w);
			$('#'+container.id+'-rightpagepanel').width(0);
		}

		if (container.leftpagestack != null) {
			$('#'+container.leftpagestack.name).css('display', 'none');
			$('#'+container.id+'-homebutton').css('display', 'block');
			$('#'+container.id+'-backbutton').css('display', 'block');
		}
		
		var o = new Object();
		o.name = leftpage;
		o.prev = container.leftpagestack;
		o.right = rightpage;
		
		if (container.leftpagestack == null || container.leftpagestack.name != o.name) container.leftpagestack = o;

		if (dontslideleft||true) {}
		else slide(leftpage, $('#'+container.id+'-leftpagepanel').width(), 500);

		//var pad = 0;
		//if (container.padding) pad = container.padding;
		$('#'+leftpage).height("100%"); //$('#'+container.id+'-leftpagepanel').height()-pad);
		$('#'+leftpage).css('display', 'block');
		
		if (container.usesplitview && rightpage) showRightInternal(container, rightpage, dontslideright);
	};
	
	function showRightInternal(container, rightdiv, dontslide){
		if (!container.usesplitview){
			var w = container.parentNode.offsetWidth;
			$('#'+container.id+'-leftcontainer').css('display', 'none');
			$('#'+container.id+'-rightcontainer').css('display', 'block');
			$('#'+container.id+'-leftpagepanel').width(0);
			$('#'+container.id+'-rightpagepanel').width(w);
			$('#'+container.id+'-homebutton').css('display', 'block');
			$('#'+container.id+'-backbutton').css('display', 'block');
		}

		if (container.rightpagestack != null) {
			$('#'+container.rightpagestack.name).css('display', 'none');
		}
		
		var o = new Object();
		o.name = rightdiv;
		o.prev = container.rightpagestack;
		container.rightpagestack = o;
		if (dontslide||true) 
		{
			//console.log("Trace: showRightInterval(3)");
		}
		else 
		{
			//console.log("Trace: showRightInterval(4)");
			slide(rightdiv, $('#'+container.id+'-rightpagepanel').width(), 500);
		}
		
		var pad = 0;
		if (container.padding) pad = container.padding;
		//console.log("Trace: showRightInterval() container.data-lianja-hidenavbar="+container.dataLianjaHidenavbar);
		$('#'+rightdiv).height("100%"); //$('#'+container.id+'-rightpagepanel').height()-pad);
		$('#'+rightdiv).css('display', 'block');
	};
	
	function navHomeInternal(container){
		if (container.leftpagestack != null) $('#'+container.leftpagestack.name).css('display', 'none');
		if (container.rightpagestack != null) $('#'+container.rightpagestack.name).css('display', 'none');
		
		$('#'+container.id+'-homebutton').css('display', 'none');
		$('#'+container.id+'-backbutton').css('display', 'none');

		var gl;
		var gr;
		while (container.leftpagestack != null) {
			gl = container.leftpagestack.name;
			gr = container.leftpagestack.right;
			container.leftpagestack = container.leftpagestack.prev;
		}
		
		container.rightpagestack = null;
			
		showLeftInternal(container, gl, gr);
	};
	
	function navBackInternal(container){
		var isleft = $('#'+container.id+'-leftpagepanel').width() == 0;
		
		if (!container.usesplitview) {
			var w = container.parentNode.offsetWidth;
			
			if (!isleft) {
				container.leftpagestack = container.leftpagestack.prev;
				if (container.leftpagestack.right) {
					var o = new Object();
					o.name = container.leftpagestack.right;
					o.prev = container.rightpagestack;
					container.rightpagestack = o;
				}
				else isleft = true;
			}
			
			if (isleft) {
				$('.leftside').css('display', 'none');
				$('#'+container.leftpagestack.name).css('display', 'block');
				
				$('#'+container.id+'-leftcontainer').css('display', 'block');
				$('#'+container.id+'-rightcontainer').css('display', 'none');
				$('#'+container.id+'-rightpagepanel').width(0);
				$('#'+container.id+'-leftpagepanel').width(w);
				
				var display = container.leftpagestack.prev == null ? 'none' : 'block';
				$('#'+container.id+'-homebutton').css('display', display);
				$('#'+container.id+'-backbutton').css('display', display);
				
				slide(container.leftpagestack.name, $('#'+container.id+'-leftpagepanel').width(), 500);
			}
			else {
				$('.rightside').css('display', 'none');
				$('#'+container.rightpagestack.name).css('display', 'block');

				$('#'+container.id+'-leftcontainer').css('display', 'none');
				$('#'+container.id+'-rightcontainer').css('display', 'block');
				$('#'+container.id+'-leftpagepanel').width(0);
				$('#'+container.id+'-rightpagepanel').width(w);

				$('#'+container.id+'-homebutton').css('display', 'block');
				$('#'+container.id+'-backbutton').css('display', 'block');

				slide(container.rightpagestack.name, $('#'+container.id+'-rightpagepanel').width(), 500);
			}
		}
		else {
			$('#'+container.leftpagestack.name).css('display', 'none');
			$('#'+container.rightpagestack.name).css('display', 'none');
			
			$('#'+container.id+'-homebutton').css('display', 'none');
			$('#'+container.id+'-backbutton').css('display', 'none');
			
			var o = container.leftpagestack.prev;
			container.leftpagestack = o.prev;
			var dontslideright = container.rightpagestack.name == o.right;
			showLeftInternal(container, o.name, o.right, dontslideright);
		}
	};
	
	function adjustHeightInternal(contid, bottom)
	{
		var margin = $("#"+contid).data("lianjaContentMargin");
		if (typeof margin == 'number') margin = ""+margin;
		if (typeof margin !== 'string') margin = "0";
		var mpos = margin.indexOf("px");
		if (mpos > 0) margin = margin.substring(0, mpos);
		bottom = parseInt(bottom) + parseInt(margin);
		var sbottom = bottom + "px";
		$('#'+contid+'-basediv').css("bottom", sbottom);
	};
	
	var methods = {
		init : function( options ) {
			return this.each(function(){
				if (document.getElementById(this.id+'-leftpagepanel') == null) internalInit(this);
			});
		},
		destroy : function( ) {
			return this.each(function(){
				$(window).unbind('.simplesplitview', this.id);
			})
		},
		showLeft : function(leftpage, rightpage, dontslideright, dontslideleft) { 
			return this.each(function(){
				showLeftInternal(this, leftpage, rightpage, dontslideright, dontslideleft);
			});
		},
		showRight : function( rightdiv, dontslide ) {
			return this.each(function(){
				showRightInternal(this, rightdiv, dontslide);
			});
		},
		navHome : function() {
			return this.each(function(){
				navHomeInternal(this);
			});
		},
		navBack : function() {
			return this.each(function(){
				navBackInternal(this);
			});
		},
		adjustHeight : function(contid, bottom) {
			return this.each(function() {
				adjustHeightInternal(contid, bottom);
			});
		}
	};

	$.fn.simplesplitview = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.simplesplitview' );
		}    
	};
})( jQuery );

