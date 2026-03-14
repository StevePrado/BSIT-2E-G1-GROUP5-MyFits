<?php
// PHP Script to handle the outfit save
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $outfitName = htmlspecialchars($_POST['outfit_name']);
    $topId      = $_POST['top_id'];
    $bottomId   = $_POST['bottom_id'];
    $occasion   = $_POST['occasion'];

    // Validation
    if(empty($topId) || empty($bottomId)) {
        die("Error: Outfit incomplete. Please drag items to both slots.");
    }

    // Success Output using Poppins
    echo "
    <div style='font-family: Poppins, sans-serif; text-align: center; margin-top: 50px;'>
        <h2 style='color: #27ae60;'>Outfit Saved Successfully!</h2>
        <p><strong>Name:</strong> $outfitName</p>
        <p><strong>Occasion:</strong> $occasion</p>
        <a href='create-outfit.html' style='text-decoration:none; color:black; font-weight:bold; border-bottom: 2px solid #000;'>Build another one</a>
    </div>";
}
?>