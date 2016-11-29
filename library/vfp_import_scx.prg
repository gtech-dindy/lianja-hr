//
// Imports Visual FoxPro .scx files into Lianja
//
lparameter cFile, cOutputFile
do (justpath(sys(16))+"vfp_import_xcx.prg") with cFile, cOutputFile, "scx"
