//
// This is the controller for the Calendar WebViewWidget
//
// The data is sent as a json string from the WebViewWidget.
//
// It has the following format when decoded:
// 
//    [database] => southwind
//    [table] => employees_calendar
//    [columns] => eventtitle,eventstart,eventend,eventrepeat,eventallday,eventtypevalue
//    [keyvalue] => 
//    [keyexpr] => LASTNAME
//    [title] => Lunch
//    [start_date] => 2012-09-28
//    [end_date] => 
//    [start_time] => 24:00
//    [end_time] => 14:00
//	  [allday] => false
//	  [repeat] => false
//    [rowid] => 0
//    [id] => 0
//    [action] => update
//    [sectionid] => section5
//    [eventtype] => eventtype
//    [eventtypevalue] => meeting	(for example)
//

parameter jsondata
private oAction
private m_database
private m_table
private m_columns
private m_keyvalue
private m_keyexpr
private m_title
private m_start_date
private m_end_date
private m_start_time
private m_end_time
private m_allday
private m_repeat
private m_rowid 
private m_id
private m_action
private m_sectionid
private m_values
private m_eventtype
private m_eventtypevalue

// decode the JSON string into a native Lianja object
oAction = json_decode(jsondata)
m_action = iif(empty(oAction.action),"add",oAction.action)
m_sectionid = alltrim(oAction.sectionid)
m_database = oAction.database
m_table = oAction.table
m_columns = oAction.columns
m_keyvalue = oAction.keyvalue
m_keyexpr = oAction.keyexpr
m_title = alltrim(oAction.title)
m_start_date = str_replace("-","",oAction.start_date)
m_end_date = iif(empty(oAction.end_date),m_start_date,str_replace("-","",oAction.end_date))
m_start_time = str_replace(":","",oAction.start_time)
m_end_time = iif(empty(oAction.end_time) and oAction.allday = 'false',strzero(val(m_start_time)+ 100,4),str_replace(":","",oAction.end_time))
m_allday = (oAction.allday = 'true')
m_repeat = (oAction.repeat = 'true')
m_rowid = oAction.rowid
m_id = oAction.id
m_eventtype = oAction.eventtype
m_eventtypevalue = oAction.eventtypevalue

// repeating events have the same id
if m_repeat
	if m_id = 0
		m_id = "reccount()+1"
	endif
else
	m_id = 0		
endif

// open the database if not open (always will be on desktop but never on cloud/mobile)
if len(database())=0
	open database &m_database
endif

// handle action requested
do case
case m_action = "add"
	// eventtitle,eventstart,eventend,eventrepeat,eventallday,eventtypevalue
	m_values  = '"&m_keyvalue",'
	m_values += '"&m_title",'
	m_values += '"&m_start_date&m_start_time",'
	m_values += '"&m_end_date&m_end_time",'
	m_values += '&m_id,'
	m_values += '&m_allDay,'
	m_values += '"&m_eventtypevalue"'
	insert into &m_table (&m_keyexpr,&m_columns) values(&m_values)

case m_action = "update"
	// eventtitle,eventstart,eventend,eventrepeat,eventallday,eventtypevalue
	astore(m_names, [&m_columns])
	m_values =  'set &(m_names[1])="&m_title",'
	m_values += '&(m_names[2])="&m_start_date&m_start_time",'
	m_values += '&(m_names[3])="&m_end_date&m_end_time",'
	m_values += '&(m_names[4])=&m_id,'
	m_values += '&(m_names[5])=&m_allDay,'
	m_values += '&(m_names[6])="&m_eventtypevalue"'
	update &m_table &m_values where recno=&m_rowid
	
case m_action = "delete"
	delete from &m_table where recno=&m_rowid
	
otherwise
	return .f.
endcase

// refresh the calendar section
Lianja.getElementByID("&m_sectionid").refresh()

return .t.