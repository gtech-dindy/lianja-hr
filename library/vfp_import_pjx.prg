//
// Imports Visual FoxPro .pjx files into a Lianja App
//
lparameter cFile
private cDir = justpath(cFile)
private cAppdir = Lianja.appdir
private nSelect = select()

clear
close pjxfile
? "Converting Visual FoxPro .pjx file '&cFile'"
?? "opening '&cFile'"
use "&cFile" alias pjxfile in 0 current noupdate
? " - ok"

goto top
do while not eof()
	cName = mtos(pjxfile->name)
	wait window "Importing " + cName nowait
	if pjxfile->type = "K"
		cToName = cAppDir + juststem(cName) + ".scp"
		vfp_import_scx(cDir+cName, cToName)
	elseif pjxfile->type = "V"
		cToName = cAppDir + juststem(cName) + ".vcp"
		vfp_import_vcx(cDir+cName, cToName)
	elseif pjxfile->type = "x" or pjxfile->type = "P"
		cFromName = cDir + cName
		cToName = cAppDir + justfname(cName)
		copy file "&cFromName" to "&cToName"
	endif
	skip	
enddo
use
select &nSelect
wait window 'Project Import complete' timeout 2

