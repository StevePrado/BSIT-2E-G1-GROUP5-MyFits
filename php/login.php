<?php
error_reporting(0);
ini_set('display_errors', 0);

$file="users.json";

if(!isset($_POST["email"]) || !isset($_POST["password"])){
echo "Invalid request";
exit;
}

$email=$_POST["email"];
$password=$_POST["password"];

if(!file_exists($file)){
echo "No users found";
exit;
}

$users=json_decode(file_get_contents($file),true);

foreach($users as $user){

if($user["email"]==$email && $user["password"]==$password){
echo "Login Successful";
exit;
}

}

echo "Invalid Email or Password";

?>