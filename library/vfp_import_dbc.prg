//
// Imports Visual FoxPro .dbc databases into Lianja
//
lparameter cFilename

// initialization
private cDir = justpath(cFilename)
private cDatabase = juststem(cFilename)
private cTimeline = set("TIMELINE")
set timeline off

? "Importing Visual FoxPro database '&cDatabase'"

// create the database
create database "&cDatabase"
open database "&cDatabase"

// Open the VFP .dbc database container
select 0
use "&cFilename" alias dbc noupdate
copy to array _tables fields objectid, objectname for upper(objecttype) = "TABLE"
set order tag objecttype

// foreach table in the database container
for i = 1 to alen(_tables,1)
	
	// foreach field in the table add to the "fieldmap"
	release map
	declare map[]
	cTablename = trim(_tables(i,2))
	seek str(_tables(i,1))+"Field"
	do while not eof() and upper(objecttype) = "FIELD"
		map[] = trim(objectname)
		skip
	enddo
	
	// now all long field names are in the map[] dynamic array
	// they will automatically be mapped when he VFP table is opened
	set fieldmap to "map"
	
	
	// dbcgetprop() operates in a similar way to VFP dbgetprop() except that
	// it operates on the current cursor as Lianja supports opening the .dbc
	// files as tables and navigating through the records in them
	path = dbcgetprop(cTablename, "Table", "path")
	if len(path) = 0
		path = cTablename
	endif
	dbf = cDir + justfname(path)
	?? "Importing table '&cTablename' from '&dbf'"
	select 0
	try
		use "&dbf"
		? " " + etos(reccount()) + " records."
		wait "Importing table "+cTablename+" with "+etos(reccount())+" records" nowait
		copy to "&cTablename" with production
	catch
		? " - failed to import table"
	endtry
	use
	set fieldmap to ""
	select dbc
	flush
next

// close the VFP .dbc database container
wait clear
use
close database
set timeline &cTimeline
? "Import of Visual FoxPRO database '&cDatabase' completed successfully"

return .t.








