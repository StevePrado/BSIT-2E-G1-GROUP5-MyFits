<?php
error_reporting(0);
ini_set('display_errors', 0);

$file = "users.json";

if(!file_exists($file)){
file_put_contents($file, json_encode([]));
}

$users = json_decode(file_get_contents($file), true);

$first = $_POST['first_name'];
$last = $_POST['last_name'];
$email = $_POST['email'];
$password = $_POST['password'];

$newUser = [
"first_name"=>$first,
"last_name"=>$last,
"email"=>$email,
"password"=>$password
];

$users[]=$newUser;

file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT));

echo "Signup Successful";

?>