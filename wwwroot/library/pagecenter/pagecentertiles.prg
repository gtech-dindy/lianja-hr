//
// Lianja Page Center tile definitions
//
private m_app = getParameter("app", "")
private m_appdescription = getParameter("appdescription", "")
private m_categories = getParameter("categories", "")
private m_pages = getParameter("pages", "")

text raw

/*--------------------------------------------------------------------------------*/
window.DefaultTiles = [
endtext

public m_page_count
m_page_count = 0

private m_categories
if len(m_categories) = 0
	? "];"
	return
endif

private aCategories 
aCategories = json_decode( "[" + base64_decode(m_categories) + "]" )

private aPages
aPages = json_decode( "[" + base64_decode(m_pages) + "]" )

private oPage
private oCategory
private m_category
private m_page
private m_pageinfo
private m_lastcategory
private m_first 
private m_comma
private i
private m_pageid
private m_icon

m_comma = ""
	
m_first = .t.
m_lastcategory = ""

foreach oCategory in aCategories
	m_category = oCategory.category
	m_page = oCategory.page
	for i=1 to len(aPages)
		oPage = aPages[i]
		m_pageid = oPage.name
		if m_pageid = m_page
			exit
		endif
	endfor
	if lower(m_lastcategory) = lower(oPage.category)
		text raw
			&m_comma{ id: "&(oPage.name)", name: "&(oPage.name)" }
		endtext
		m_comma = ","
		m_page_count = m_page_count + 1
		loop
	endif
	m_lastcategory = oPage.category
	if not m_first
		text raw
			]}
		endtext
	endif
	m_first = .f.
	text raw
			&m_comma{
		name : "&(oPage.category)",
			tiles: [
			{ id: "&(oPage.name)", name: "&(oPage.name)" }
	endtext
	m_comma = ","
	m_page_count = m_page_count + 1
endfor

if .not. m_first
	? "]}"
endif

if m_page_count = 0
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

if (typeof window.parent !== 'undefined' && window.parent !== null && typeof window.Lianja === 'undefined')
{
	window.Lianja = window.parent.Lianja;
};

/*--------------------------------------------------------------------------------*/
window.TileBuilders  = {
endtext

private cnt = 0
foreach oCategory2 in aCategories
	m_category = oCategory2.category
	m_page = oCategory2.page
	for i=1 to len(aPages)
		oPage = aPages[i]
		m_pageid = oPage.name
		if m_pageid = m_page
			oPage = aPages[i]
			exit
		endif
	endfor
	m_backcolor = oPage.backcolor
	if len(m_backcolor)=0
		m_backcolor = 'color: "bg-color-darken",backcolor: "black",'
	else
		 if len(m_backcolor) > 7
			m_backcolor = left(m_backcolor, 7)
		endif
		m_backcolor = 'tileStyle: "background-color:&m_backcolor !important;",'
	endif
	m_size = oPage.size
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
	m_init = ""
	if cnt > 0
		? ","
	endif
	cnt = cnt + 1
	
	m_icon = oPage.icon
	if len(m_icon)=0
		m_icon = "lianja_logo96x96.png"	
	elseif StartsWith(m_icon, ":/images/") 
		m_icon = "lianja_logo96x96.png"
	else
		//Lianja.deployAppIcon(oApp.name, m_icon, .t.) 
		m_icon = basename(m_icon)
	endif
	if isPhoneGap() 
		text raw
			&(oPage.name): function (uniqueId) {
				return {
					uniqueId: uniqueId,
					name: "&(oPage.name)",
		endtext
		base64_encode_filedata("iconSrc", "lib:/pagecenter/img/&m_icon")
		base64_encode_filedata("appIcon", "lib:/pagecenter/img/lianja512.png")
		text raw
					label: "&(oPage.caption)",
					subContent: "&(oPage.caption)",
					&m_backcolor
					&m_size
					&m_init
					appUrl: "javascript:Lianja.showDocument('page:&(oPage.name)')"
			   };
			}
		endtext
	else
		text raw
			&(oPage.name): function (uniqueId) {
				return {
					uniqueId: uniqueId,
					name: "&(oPage.name)",
					iconSrc: "../../library/pagecenter/img/&m_icon",
					appIcon: "../../library/pagecenter/img/lianja512.png",
					label: "&(oPage.caption)",
					subContent: "&(oPage.caption)",
					&m_backcolor
					&m_size
					&m_init
					appUrl: "javascript:Lianja.showDocument('page:&(oPage.name)')"
			   };
			}
		endtext
	endif
endfor

text raw
};
endtext
