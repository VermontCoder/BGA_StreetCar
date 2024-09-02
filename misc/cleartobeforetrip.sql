UPDATE `player` SET `trainposition`=NULL,`traindirection`=NULL,`endnodeids`=NULL,`dice`=NULL,diceused=0 WHERE 1;
UPDATE global SET global_value='10' WHERE global_id='1'