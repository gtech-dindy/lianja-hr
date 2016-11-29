//
// Beautifies Visual FoxPro source code
//
lparameter cFilename

// Declare local variables
private cDir = justpath(cFilename)
private cName = juststem(cFilename)
private cTempfile = tmpnam()
private cBackupname = cDir + cName + ".bak"
private blockKeywords[]
private infp
private outfp

// Initializes the keyword symbol table
proc initKeywords()
	blockKeyWordsBuild("proc", "4endproc,4return")
	blockKeyWordsBuild("func", "4endfunc,4return")
	blockKeyWordsBuild("procedure", "4endproc,4return,4procedure,4function")
	blockKeyWordsBuild("function", "4endfunc,4return,4procedure,4function")
	blockKeyWordsBuild("4procedure", "4endproc,4return,4procedure,4function")
	blockKeyWordsBuild("4function", "4endfunc,4return,4procedure,4function")
	blockKeyWordsBuild("define", "?")
	blockKeyWordsBuild("define class", "4enddefine")
	blockKeyWordsBuild("if", "else,4elseif,4endif")
	blockKeyWordsBuild("else", "elseif,4endif")
	blockKeyWordsBuild("elseif", "else,elseif,4endif")
	blockKeyWordsBuild("for", "4endfor,next")
	blockKeyWordsBuild("do", "?")
	blockKeyWordsBuild("do while", "4enddo")
	blockKeyWordsBuild("case", "case,4otherwise,4endcase")
	blockKeyWordsBuild("4otherwise", "case,4endcase")
	blockKeyWordsBuild("scan", "4endscan")
	blockKeyWordsBuild("try", "catch,5endtry")
	blockKeyWordsBuild("with", "4endwith")
endproc

func blockKeyWordsBuild()
	lParameters cKey, cWordlist
	LOCAL aKeys[1],lnRun, lcKey,lcKeyList, lcWordList
	lcKeyList = blockKeyWordsListBuild(cKey)
	lcWordList = blockKeyWordsListBuild(cWordlist)
	FOR lnRun = 1 TO ALINES(aKeys,m.lcKeyList)
		lcKey = aKeys[m.lnRun]
		blockKeyWords[m.lcKey] = m.lcWordList
	next
return

func blockKeyWordsListBuild()
	lParameters cWordlist
	LOCAL aWordList[1], lcRet, lcWord, lnWords, lnSpellings
	lcRet = ""
	FOR lnWords = 1 TO ALINES(aWordList,cWordList,5,",")
		lcWord = aWordList[m.lnWords]
		IF isdigit(LEFT(m.lcWord,1))
			FOR lnSpellings = val(m.lcWord) TO LEN(m.lcWord)-1
				lcRet = lcRet + "," + SUBSTR(m.lcWord,2, m.lnSpellings)
			next
		ELSE
			lcRet = lcRet + "," + m.lcWord
		endif
	NEXT
	lcRet = SUBSTR(m.lcRet,2)
	if .f. && developer visualize
		? cWordList
		? m.lcRet
	endif
return m.lcRet

// Procedure that recursively handles beautifying code
proc beautify(cLine, cStartBlock, cEndBlock, depth)
	private cWord
	private cExpr
	private cEnd
	private nEmpty
	
	do while .t.
		cWord = lower(getWordNum(cLine, 1))
		cExpr = "blockKeywords['" + cWord + "']"
		if len(cEndBlock) > 0
			aStore(cEndBlockArray, cEndBlock)
			if in_array(cWord, cEndBlockArray)
				fputs(outfp, replicate(chr(9), depth-1)+cLine)
				if (cWord = "case" or AT(cWord,"otherwise")=1) and ;
					(cStartBlock = "case" or AT(cStartBlock,"otherwise")=1)
					if not feof(infp)
						cLine = alltrim(fgets(infp))
						loop
					else
						return
					endif
				elseif (cWord = "else" or AT(cWord,"elseif")=1) and ;
					(cStartBlock = "if")
					if not feof(infp)
						cLine = alltrim(fgets(infp))
						loop
					else
						return
					endif
				elseif (cWord = "catch") and ;
					(cStartBlock = "try")
					if not feof(infp)
						cLine = alltrim(fgets(infp))
						loop
					else
						return
					endif
				else
					return
				endif
			endif
		endif
		
		fputs(outfp, replicate(chr(9), depth)+cLine)
		
		if type(cExpr) != 'U' and not feof(infp)
			cEnd = &cExpr
			if cEnd = "?"
				cWord = cWord + " " + lower(getWordNum(cLine, 2))
				cExpr = "blockKeywords['" + cWord + "']"
				if type(cExpr) = 'U'
					if not feof(infp)
						cLine = alltrim(fgets(infp))
						loop
					else
						return
					endif
				else
					cEnd = &cExpr
				endif
			endif
			beautify(alltrim(fgets(infp)), cWord, cEnd, depth+1)
		endif
		
		if not feof(infp)
			cLine = alltrim(fgets(infp))
		else
			return
		endif
	enddo
endproc

// Initialization
initKeyWords()

// backup the file
copy file "&cFilename" to "&cBackupname"

// Open the files
infp = fopen(cFilename)
outfp = fcreate(cTempfile)

// parse the file
do while not feof(infp)
	beautify(alltrim(fgets(infp)), "", "", 0)
enddo

// close the files
fclose(infp)
fclose(outfp)

// copy the formatted file to the old
erase "&cFilename"
copy file "&cTempfile" to "&cFilename"
erase "&cTempfile"




































