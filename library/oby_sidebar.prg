parameter p_custid

private m_count2009 = 0
private m_count2010 = 0
private m_count2011 = 0

// open the database
if len(database())=0
	open database southwind  
endif

if select("customers") = 0 
	use customers in 0
endif

if select("orders") = 0
	use orders in 0
endif

if type("p_custid") != 'C'
	p_custid = customers->customerid
endif
	
// save data context
save recordview

// lookup customer
select orders
set order to customerid
seek p_custid

// count all orders for the current customer
m_count2009 = cntvalues(year(orderdate)=2009, p_custid)
m_count2010 = cntvalues(year(orderdate)=2010, p_custid)
m_count2011 = cntvalues(year(orderdate)=2011, p_custid)

// restore data context
restore recordview

// format the result and return it to be substituted into the google charts uri
return alltrim(str(m_count2009)) + "," + alltrim(str(m_count2010)) + "," + alltrim(str(m_count2011))
