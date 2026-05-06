/* ============================================================
   LIGHTBOX
   ============================================================ */

(function () {
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
            </div>`;

        document.body.appendChild(overlay);

        requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('is-open')));

        const img   = overlay.querySelector('img');
        const inner = overlay.querySelector('.lightbox-inner');
        let scale = 1, tx = 0, ty = 0;
        let dragging = false, lastX = 0, lastY = 0;

        function applyTransform(animated) {
            if (animated) img.style.transition = 'transform 0.3s ease';
            img.style.transform = `scale(${scale}) translate(${tx / scale}px, ${ty / scale}px)`;
            img.style.cursor    = scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in';
            if (animated) setTimeout(() => { img.style.transition = ''; }, 300);
        }

        /* ── Molette (zoom centré sur curseur) ── */
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

        /* ── Drag souris ── */
        const onMouseMove = e => {
            if (!dragging) return;
            tx += e.clientX - lastX;
            ty += e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            applyTransform();
        };
        const onMouseUp = () => { dragging = false; applyTransform(); };

        img.addEventListener('mousedown', e => {
            if (scale <= 1) return;
            e.preventDefault();
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            applyTransform();
        });
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);

        /* ── Double clic → reset ── */
        img.addEventListener('dblclick', () => {
            scale = 1; tx = 0; ty = 0;
            applyTransform(true);
        });

        /* ── Touch : pinch zoom + drag 1 doigt ── */
        let lastPinchDist = 0;
        let touchStartTx = 0, touchStartTy = 0, touchStartX = 0, touchStartY = 0;

        inner.addEventListener('touchstart', e => {
            if (e.touches.length === 2) {
                lastPinchDist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
            } else if (e.touches.length === 1 && scale > 1) {
                touchStartX  = e.touches[0].clientX;
                touchStartY  = e.touches[0].clientY;
                touchStartTx = tx;
                touchStartTy = ty;
            }
        }, { passive: true });

        inner.addEventListener('touchmove', e => {
            e.preventDefault();
            if (e.touches.length === 2) {
                const dist = Math.hypot(
                    e.touches[0].clientX - e.touches[1].clientX,
                    e.touches[0].clientY - e.touches[1].clientY
                );
                scale = Math.min(Math.max(1, scale * (dist / lastPinchDist)), 6);
                lastPinchDist = dist;
                if (scale === 1) { tx = 0; ty = 0; }
                applyTransform();
            } else if (e.touches.length === 1 && scale > 1) {
                tx = touchStartTx + (e.touches[0].clientX - touchStartX);
                ty = touchStartTy + (e.touches[0].clientY - touchStartY);
                applyTransform();
            }
        }, { passive: false });

        /* ── Fermeture ── */
        function close() {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            document.removeEventListener('keydown', onKeyDown);
            overlay.classList.remove('is-open');
            overlay.addEventListener('transitionend', () => {
                overlay.remove();
            }, { once: true });
        }

        function onKeyDown(e) {
            if (e.key === 'Escape') close();
        }

        overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
        overlay.querySelector('.lightbox-close').addEventListener('click', close);
        document.addEventListener('keydown', onKeyDown);
    }
})();


/* ============================================================
   FORMULAIRE
   ============================================================ */

(function () {
    const form        = document.getElementById('download-form');
    const emailInput  = document.getElementById('email');
    const submitBtn   = document.getElementById('submit-button');
    const messageEl   = document.getElementById('form-message');

    const DOWNLOAD_ICON = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.2"
        stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
    </svg> Télécharger`;

    /* Bouton désactivé par défaut — actif uniquement si email valide */
    submitBtn.disabled = true;

    emailInput.addEventListener('input', () => {
        submitBtn.disabled = !emailInput.validity.valid;
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        submitBtn.disabled    = true;
        submitBtn.textContent = 'Envoi en cours…';
        messageEl.textContent = '';
        messageEl.className   = '';

        fetch('https://formspree.io/f/xnnpjyav', {
            method:  'POST',
            body:    new FormData(form),
            headers: { Accept: 'application/json' },
        })
        .then(res => {
            if (!res.ok) throw new Error();
            messageEl.textContent = 'Merci ! Téléchargement en cours…';
            messageEl.className   = 'success';
            form.reset();
            submitBtn.disabled = true; // reste désactivé après reset

            /*
             * Téléchargement via blob pour forcer le fichier local
             * plutôt qu'une ouverture dans un nouvel onglet.
             * GitHub Pages ne renvoie pas Content-Disposition: attachment,
             * donc le simple attribut `download` ne suffit pas.
             */
            fetch('cv_sonny_brun.pdf')
                .then(r => r.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const a   = document.createElement('a');
                    a.href     = url;
                    a.download = 'CV_Sonny_Brun.pdf';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    setTimeout(() => URL.revokeObjectURL(url), 5000);
                });
        })
        .catch(() => {
            messageEl.textContent = "Une erreur s'est produite. Veuillez réessayer.";
            messageEl.className   = 'error';
            submitBtn.disabled = !emailInput.validity.valid;
        })
        .finally(() => {
            setTimeout(() => {
                submitBtn.innerHTML = DOWNLOAD_ICON;
                // Réactiver seulement si l'email est encore valide
                submitBtn.disabled = !emailInput.validity.valid;
            }, 3000);
        });
    });
})();
