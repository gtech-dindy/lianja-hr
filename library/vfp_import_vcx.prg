//
// Imports Visual FoxPro .vcx files into Lianja
//
lparameter cFile, cOutputFile
do (justpath(sys(16))+"vfp_import_xcx.prg") with cFile, cOutputFile, "vcx"
