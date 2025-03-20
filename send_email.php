<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST["email"];

    // Adresse email de réception (ton adresse)
    $to = "sonnybrun9@gmail.com";  

    // Sujet du mail
    $subject = "Nouveau Téléchargement de CV";

    // Message du mail
    $message = "Quelqu'un a téléchargé votre CV avec l'email : " . $email;

    // En-têtes du mail
    $headers = "From: noreply@tonsite.com\r\n";
    $headers .= "Reply-To: noreply@tonsite.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Envoi de l'email
    if(mail($to, $subject, $message, $headers)) {
        echo "success";
    } else {
        echo "error";
    }
}
?>
