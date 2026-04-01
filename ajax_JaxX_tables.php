<?php
require ('../../_Cfg/cfg.php');
require ('JaxX_tables.php');
$retour['$_POST']= $_POST;
/* action_name ==================================================== */
if( $_POST['action'] == 'action_name' )
{
}
/* action_name ==================================================== */
echo json_encode( $retour);