<?php
// Code mostly taken from Doug Reside's sendData.php
// Commits JSON data to a file to be stored on client's HDD


if($_POST['uploadData']){
	$domain=$_SERVER['HTTP_HOST'];
	$path=$_SERVER['PHP_SELF'];
	$path = substr($path,0,strrpos($path,"/"));
	$path=preg_replace('/lib\/SaveProgress/',"",$path);
	$cwd = "http://".$domain.$path."index.php";
	$JSON=stripslashes($_POST['uploadData']);
	$doc="<HTML><HEAD><SCRIPT language=\"JavaScript\">function send(){document.aData.submit();}</SCRIPT></HEAD><BODY onload=\"send()\">
	<form name=\"aData\" method=\"POST\" action=\"".$cwd."\">
	<input type=\"hidden\" name=\"jsonData\" value=\"".$JSON."\"/></form></BODY></HTML>";
	//force-download the doc-string to the user to save
	header('Content-Type: text/plain');
	header('Content-Disposition: attachment; filename=tile-progress.html');
	header('Content-Transfer-Encoding: binary');
	echo $doc;
}


//header("Location: ".$_SESSION['HTTP_REFERER']);

?>