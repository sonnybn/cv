document.getElementById("download-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Empêche la redirection vers Formspree

    let formData = new FormData(this);

    // Envoyer les données à Formspree en AJAX
    fetch("https://formspree.io/f/xnnpjyav", {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
    })
    .then(response => {
        if (response.ok) {
            // Télécharger le CV après l'envoi réussi
            let link = document.createElement("a");
            link.href = "CV_Sonny_BRUN.png"; // Chemin de ton fichier CV
            link.download = "CV_Sonny_BRUN.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert("Merci ! Votre CV a été téléchargé.");
        } else {
            alert("Une erreur s'est produite. Veuillez réessayer.");
        }
    })
    .catch(error => alert("Erreur lors de l'envoi du formulaire."));
});
