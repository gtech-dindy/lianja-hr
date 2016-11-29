parameter jsonobj

//
// operation: "add | reply | delete | edit | like"
// database : "text"
// table : "text"
// parentid: "text"
// childkey: "text"
// username: "username"
// datetime: "yyyymmddhhmmss"
// comment: "text"
// topic: "text"
// parentnodeid: int,
// depth: int 
//

private obj
private m_database
private m_table
private m_topic
private m_childkey
private m_username
private m_datetime
private m_comment
private m_parentnodeid
private m_category
private m_id
private m_lastinsert
private m_recno
private m_likedby

m_id = 0
obj = json_decode(jsonobj) 

//Lianja.writeOutput(jsonobj)

m_database = obj.database
m_table = obj.table

save datasession
open database &m_database

if obj.operation = "add" or obj.operation = "reply"
	m_topic = obj.topic
	m_childkey = obj.childkey
	m_username = obj.username
	m_datetime = obj.datetime
	m_comment = obj.comment
	m_parentnodeid = obj.parentnodeid
	m_depth = obj.depth
	m_category = obj.category	
	if lower(m_topic)="all"
		m_topic = ""
	endif
	use &m_table
	insert into &m_table (category,parentnodeid,childkey,datetime,username,topic,comment,depth) ;
		values (m_category,m_parentnodeid,m_childkey,m_datetime,m_username,m_topic,m_comment,m_depth)
	goto lastInsert()
	m_id = nodeid
	use
elseif obj.operation = "delete"
	m_username = lower(alltrim(obj.username))
	use &m_table
	m_recno = obj.recno
	set order to tag nodeid
	seek &m_recno
	if m_username == lower(alltrim(username)) or m_username="admin"
		delete 
		set order to tag parentnodeid
		seek strzero(m_recno,10)
		delete rest while parentnodeid=m_recno
		m_id = m_recno
	endif
	use
elseif obj.operation = "edit"
	use &m_table
	m_recno = obj.recno
	m_comment = obj.comment
	goto &m_recno
	replace comment with m_comment
	use
elseif obj.operation = "like"
	m_username = lower(alltrim(obj.username))
	use &m_table
	m_recno = obj.recno
	set order to tag nodeid
	seek &m_recno
	m_likedby = lower(likedby)
	if not ((m_username+",") $ m_likedby or endsWith(m_likedby, ","+m_username) or m_likedby = m_username)
		if len(likedby)!=0 and (len(m_likedby) + len(m_username) + 1) < (64*1024)
			m_likedby = m_likedby+","+m_username
		else
			m_likedby = m_username
		endif
		replace likedby with m_likedby, numlikes with numlikes + 1
	endif
	m_id = numlikes
	use
endif

restore datasession

return m_id


