document.getElementById("download-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Empêche la soumission classique

    let formData = new FormData(this);
    let form = this; // Garde une référence au formulaire
    
    // Récupérer les éléments pour le feedback
    let submitButton = document.getElementById("submit-button");
    let messageElement = document.getElementById("form-message");

    // 1. Désactiver le bouton et montrer un état de chargement
    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours...";
    submitButton.style.animation = "none"; // 🚀 Désactive l'animation pulse
    messageElement.textContent = ""; // Nettoyer les anciens messages
    messageElement.className = ""; // Retirer les classes success/error

    // Envoyer les données à Formspree en AJAX
    fetch("https://formspree.io/f/xnnpjyav", {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
    })
    .then(response => {
        if (response.ok) {
            // 2a. Succès : Afficher le message et télécharger
            messageElement.textContent = "Merci ! Le CV va être téléchargé.";
            messageElement.className = "success";
            form.reset(); // Vider le champ email

            // Télécharger le CV PDF après l'envoi réussi
            let link = document.createElement("a");
            link.href = "cv_sonny_brun.pdf";
            link.download = "cv_sonny_brun.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } else {
            // 2b. Erreur serveur (Formspree)
            throw new Error("Réponse du serveur non OK");
        }
    })
    .catch(error => {
        // 2c. Erreur réseau ou autre
        console.error("Erreur Fetch:", error);
        messageElement.textContent = "Une erreur s'est produite. Veuillez réessayer.";
        messageElement.className = "error";
    })
    .finally(() => {
        // 3. Quoi qu'il arrive, réactiver le bouton après un court délai
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = "Télécharger";
            submitButton.style.animation = ""; // 🚀 Réactive l'animation pulse
        }, 3000); // Laisse le message visible 3 secondes
    });
});