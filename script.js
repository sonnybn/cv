/* ============================================================
   LIGHTBOX — Clic sur le CV
   ============================================================ */

(function initLightbox() {
    const cvImg = document.querySelector('.cv-float img');
    if (!cvImg) return;

    cvImg.addEventListener('click', openLightbox);

    function openLightbox() {
        const overlay = document.createElement('div');
        overlay.className = 'lightbox-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'CV en plein écran');

        overlay.innerHTML = `
            <div class="lightbox-inner">
                <button class="lightbox-close" aria-label="Fermer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2.5"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>
                <img src="${cvImg.src}" alt="${cvImg.alt}" draggable="false">
            </div>
        `;

        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            requestAnimationFrame(() => overlay.classList.add('is-open'));
        });

        // ── Zoom + Pan ───────────────────────────────────
        const img   = overlay.querySelector('.lightbox-inner img');
        const inner = overlay.querySelector('.lightbox-inner');
        let scale = 1, tx = 0, ty = 0;
        let dragging = false, lastX, lastY;

        function applyTransform() {
            img.style.transform = `scale(${scale}) translate(${tx / scale}px, ${ty / scale}px)`;
            img.style.cursor    = scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in';
        }

        // Zoom molette (centré sur le curseur)
        inner.addEventListener('wheel', e => {
            e.preventDefault();
            const rect   = img.getBoundingClientRect();
            const ox     = e.clientX - rect.left - rect.width  / 2;
            const oy     = e.clientY - rect.top  - rect.height / 2;
            const factor = e.deltaY < 0 ? 1.15 : 0.87;
            const next   = Math.min(Math.max(1, scale * factor), 6);
            const ratio  = next / scale;
            tx = ratio * tx + (ratio - 1) * ox;
            ty = ratio * ty + (ratio - 1) * oy;
            scale = next;
            if (scale === 1) { tx = 0; ty = 0; }
            applyTransform();
        }, { passive: false });

        // Drag pour se déplacer quand zoomé
        img.addEventListener('mousedown', e => {
            if (scale <= 1) return;
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            applyTransform();
        });
        window.addEventListener('mousemove', e => {
            if (!dragging) return;
            tx += e.clientX - lastX;
            ty += e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            applyTransform();
        });
        window.addEventListener('mouseup', () => {
            dragging = false;
            applyTransform();
        });

        // Double-clic → reset zoom
        img.addEventListener('dblclick', () => {
            scale = 1; tx = 0; ty = 0;
            img.style.transition = 'transform 0.3s ease';
            applyTransform();
            setTimeout(() => img.style.transition = '', 300);
        });

        // Pinch zoom mobile
        let lastPinchDist = null;
        inner.addEventListener('touchstart', e => {
            if (e.touches.length === 2) {
                lastPinchDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            }
        });
        inner.addEventListener('touchmove', e => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const dist  = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                scale = Math.min(Math.max(1, scale * (dist / lastPinchDist)), 6);
                lastPinchDist = dist;
                if (scale === 1) { tx = 0; ty = 0; }
                applyTransform();
            }
        }, { passive: false });

        // ── Fermeture ────────────────────────────────────
        function close() {
            // Nettoyer les listeners globaux
            window.removeEventListener('mousemove', arguments.callee);
            window.removeEventListener('mouseup',   arguments.callee);
            overlay.classList.remove('is-open');
            overlay.addEventListener('transitionend', () => {
                if (overlay.parentNode) overlay.remove();
            }, { once: true });
        }

        overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
        overlay.querySelector('.lightbox-close').addEventListener('click', close);

        function onKeyDown(e) {
            if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKeyDown); }
        }
        document.addEventListener('keydown', onKeyDown);
    }
})();


/* ============================================================
   FORMULAIRE — Téléchargement CV
   ============================================================ */

document.getElementById('download-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData     = new FormData(this);
    const form         = this;
    const submitButton = document.getElementById('submit-button');
    const messageEl    = document.getElementById('form-message');

    submitButton.disabled     = true;
    submitButton.textContent  = 'Envoi en cours…';
    messageEl.textContent     = '';
    messageEl.className       = '';

    fetch('https://formspree.io/f/xnnpjyav', {
        method:  'POST',
        body:    formData,
        headers: { Accept: 'application/json' },
    })
        .then(response => {
            if (response.ok) {
                messageEl.textContent = 'Merci ! Le CV va être téléchargé.';
                messageEl.className   = 'success';
                form.reset();

                const link      = document.createElement('a');
                link.href       = 'cv_sonny_brun.pdf';
                link.download   = 'cv_sonny_brun.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                throw new Error('Réponse serveur non OK');
            }
        })
        .catch(() => {
            messageEl.textContent = 'Une erreur s\'est produite. Veuillez réessayer.';
            messageEl.className   = 'error';
        })
        .finally(() => {
            setTimeout(() => {
                submitButton.disabled    = false;
                submitButton.innerHTML   = `
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2.2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                    Télécharger`;
            }, 3000);
        });
});
