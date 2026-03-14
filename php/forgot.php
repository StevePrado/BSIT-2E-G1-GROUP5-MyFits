<?php
error_reporting(0);
ini_set('display_errors', 0);

$file="users.json";

if(!file_exists($file)){
echo "No users found";
exit;
}

$users=json_decode(file_get_contents($file),true);

$email=$_POST["email"];

foreach($users as $user){

if($user["email"]==$email){

echo "Your password is: ".$user["password"];
exit;

}

}

echo "Email not found";

?>