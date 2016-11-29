// Store Procedure: sp_demo.prg
lparameters lcState
select account_no, state from example;
where state = lcState;
into cursor curExample
return setresultset("curExample")
