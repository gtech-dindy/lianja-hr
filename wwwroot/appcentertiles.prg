//
// Lianja App Center tile definitions
//
text raw

/*--------------------------------------------------------------------------------*/
window.DefaultTiles = [
endtext

public m_app_count
m_app_count = 0

private m_categories
m_categories = getAppCategories()
if m_categories = "[]"
	? "];"
	return
endif

private aCategories 
aCategories = json_decode( m_categories )

private oApp
private oCategory
private m_category
private m_app
private m_appinfo
private m_lastcategory
private m_first 
private m_comma
private m_icon

if m_app_count > 0
	m_comma = ","
else
	m_comma = ""
endif
	
m_first = .t.
m_lastcategory = ""

foreach oCategory in aCategories
	m_category = oCategory.category
	if "demo" = lower(m_category) 
		loop
	endif
	m_app = oCategory.app
	m_appinfo = getAppInfo( m_app, m_category, _SERVER["REMOTE_USER"] )
	if len(m_appinfo) != 0
		oApp = json_decode( m_appinfo )
		if lower(m_lastcategory) = lower(oApp.category)
			text raw
           		&m_comma{ id: "&(oApp.name)", name: "&(oApp.name)" }
			endtext
			m_comma = ","
			m_app_count = m_app_count + 1
			loop
		endif
		m_lastcategory = oApp.category
		if not m_first
			text raw
      			]}
			endtext
		endif
		m_first = .f.
		text raw
     			&m_comma{
			name : "&(oApp.category)",
        		tiles: [
           		{ id: "&(oApp.name)", name: "&(oApp.name)" }
 		endtext
		m_comma = ","
		m_app_count = m_app_count + 1
	endif
endfor

if .not. m_first
	? "]}"
endif

if m_app_count = 0
	? "];"
	return
endif

text raw
];

/*--------------------------------------------------------------------------------*/
window.DefaultTiles = _.map(window.DefaultTiles, function (section) {
    return "" + section.name + "~" + (_.map(section.tiles, function (tile) {
        return "" + tile.id + "," + tile.name;
    })).join(".");
}).join("|");

/*--------------------------------------------------------------------------------*/
window.TileBuilders  = {
    lianjausers: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "lianjausers",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Manage Users",
            color: "bg-color-darken",
			backcolor : "black",
            appUrl: "javascript:Lianja.openApp('@@users@@')"
        };
    },

    lianjadata: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "lianjadata",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Manage Data",
            color: "bg-color-darken",
			backcolor : "black",
            appUrl: "javascript:Lianja.openApp('@@data@@')"
        };
    },

    lianjadeploy: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "lianjadeploy",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Deploy Apps",
            color: "bg-color-darken",
			backcolor : "black",
            appUrl: "javascript:Lianja.openApp('@@deploy@@')"
        };
    },

    lianjanewapp: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "lianjanewapp",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Create an App",
            color: "bg-color-darken",
			backcolor : "black",
            appUrl: "javascript:Lianja.openApp('@@newapp@@')"
        };
    },

    lianjanewdatabase: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "lianjanewdatabase",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Create a Database",
            color: "bg-color-darken",
			backcolor : "black",
            appUrl: "javascript:Lianja.openApp('@@newdatabase@@')"
        };
    },

    lianjanewtable: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "lianjanewtable",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Create a Table",
            color: "bg-color-darken",
			backcolor : "black",
            appUrl: "javascript:Lianja.openApp('@@newtable@@')"
        };
    },

    lianjademo: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "lianjawebsite",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Demo",
            color: "bg-color-green",
			backcolor : "green",
            appUrl: "javascript:Lianja.openApp('lianjademo')"
        };
    },

    lianjawebdemo: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "lianjawebdemo",
            color: "bg-color-purple",
			backcolor : "purple",
            label: "Web Demo",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            appTitle: "Cloud",
            appUrl: "javascript:Lianja.openApp('lianjawebdemo')"
        };
    },

    lianjachartsdemo: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "lianjachartsdemo",
            color: "bg-color-purple",
			backcolor : "purple",
            label: "Charts",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            appTitle: "Getting Started",
            appUrl: "javascript:Lianja.openApp('lianjachartsdemo')"
        };
    },

    lianjacustomcanvas: function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "tutorials",
            iconSrc: "img/lianja_logo96x96.png",
            appIcon: "img/lianja512.png",
            label: "Custom Canvas",
            color: "bg-color-blueDark",
			backcolor : "blue",
            appUrl: "javascript:Lianja.openApp('lianjacustomcanvas')"
	   };
	}
endtext

foreach oCategory2 in aCategories
	m_category = oCategory2.category
	m_app = oCategory2.app
	m_appinfo = getAppInfo( m_app, m_category ) 
	if len(m_appinfo) != 0
		oApp = json_decode( m_appinfo )
		m_backcolor = oApp.backcolor
		if len(m_backcolor)=0
			m_backcolor = 'color: "bg-color-darken",backcolor: "black",'
		else
		     if len(m_backcolor) > 7
			    m_backcolor = left(m_backcolor, 7)
			endif
			m_backcolor = 'tileStyle: "background-color:&m_backcolor !important;",'
		endif
		m_size = oApp.size
		if len(m_size)=0
		    m_size = ''
		elseif m_size = "1x1"
		    m_size = ''
		elseif m_size = "1x2"
		    m_size = 'size: "tile-double-vertical",'
		elseif m_size = "1x3"
		    m_size = 'size: "tile-triple-vertical",'
		elseif m_size = "1x4"
		    m_size = 'size: "tile-quadro-vertical",'
		elseif m_size = "2x1"
		    m_size = 'size: "tile-double",'
		elseif m_size = "2x2"
		    m_size = 'size: "tile-double tile-double-vertical",'
		elseif m_size = "2x3"
		    m_size = 'size: "tile-double tile-triple-vertical",'
		elseif m_size = "2x4"
		    m_size = 'size: "tile-double tile-quadro-vertical",'
		elseif m_size = "3x1"
		    m_size = 'size: "tile-triple",'
		elseif m_size = "3x2"
		    m_size = 'size: "tile-triple tile-double-vertical",'
		elseif m_size = "3x3"
		    m_size = 'size: "tile-triple tile-triple-vertical",'
		elseif m_size = "3x4"
		    m_size = 'size: "tile-triple tile-quartro-vertical",'
		elseif m_size = "4x1"
		    m_size = 'size: "tile-quadro",'
		elseif m_size = "4x2"
		    m_size = 'size: "tile-quadro tile-double-vertical",'
		elseif m_size = "4x3"
		    m_size = 'size: "tile-quadro tile-triple-vertical",'
		elseif m_size = "4x4"
		    m_size = 'size: "tile-quadro tile-quadro-vertical",'
		endif
		m_timeraction = oApp.timeraction
		if len(m_timeraction) != 0
		    m_init = "initFunc: 'load_dynamictile', initParams: { app: '&(oApp.name)', timeraction: '&m_timeraction' },"
		else
		    m_init = ""
		endif
		m_icon = oApp.icon
		if StartsWith(m_icon, ":/images/")
			m_icon = "img/lianja_logo96x96.png"
		else
			m_icon = "img/" + basename(m_icon)
		endif
		text raw
		    ,
    &(oApp.name): function (uniqueId) {
        return {
            uniqueId: uniqueId,
            name: "&(oApp.name)",
            iconSrc: "&m_icon",
            appIcon: "img/lianja512.png",
            label: "&(oApp.caption)",
            subContent: "&(oApp.description)",
            &m_backcolor
			&m_size
			&m_init
            appUrl: "javascript:Lianja.openApp('&(oApp.name)')"
	   };
	}
 		endtext
	endif
endfor

text raw
};
endtext

text raw
function load_dynamictile(tile, div, params) {
    Lianja.startDynamicTimer(params.app);
};
endtext
