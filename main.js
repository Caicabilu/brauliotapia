// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

document.querySelectorAll('.project-card').forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(50px)";
    card.style.transition = "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    observer.observe(card);
});

// Subtle parallax for clouds
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    document.querySelectorAll('.cloud').forEach((cloud, index) => {
        const speed = (index + 1) * 0.2;
        cloud.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Contact Form Handler
const contactForm = document.getElementById('contact-form');
const formMessage = document.getElementById('form-message');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        submitBtn.disabled = true;
        formMessage.className = 'form-message';
        formMessage.style.display = 'none';

        // Get reCAPTCHA response
        const recaptchaResponse = grecaptcha.getResponse();
        if (!recaptchaResponse) {
            formMessage.textContent = 'Por favor, completa el captcha.';
            formMessage.className = 'form-message error';
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
            return;
        }

        const formData = {
            name: contactForm.name.value,
            email: contactForm.email.value,
            subject: contactForm.subject.value,
            message: contactForm.message.value,
            recaptchaToken: recaptchaResponse
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                formMessage.textContent = '¡Mensaje enviado correctamente! Te responderé pronto.';
                formMessage.className = 'form-message success';
                contactForm.reset();
                grecaptcha.reset();
            } else {
                throw new Error(result.error || 'Error al enviar el mensaje');
            }
        } catch (error) {
            formMessage.textContent = 'Error al enviar el mensaje. Por favor, intenta de nuevo.';
            formMessage.className = 'form-message error';
        } finally {
            // Reset button state
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
}

// Lightbox Gallery
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox?.querySelector('.lightbox-img');
const galleryItems = document.querySelectorAll('.gallery-item');
let currentIndex = 0;

const images = Array.from(galleryItems).map(item => item.dataset.src);

function openLightbox(index) {
    currentIndex = index;
    lightboxImg.src = images[currentIndex];
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    lightboxImg.src = images[currentIndex];
}

function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    lightboxImg.src = images[currentIndex];
}

galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
});

if (lightbox) {
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-next').addEventListener('click', nextImage);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', prevImage);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });
}

console.log("Wind & Clouds Portfolio Loaded - Braulio Tapia");
