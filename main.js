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

        const formData = {
            name: contactForm.name.value,
            email: contactForm.email.value,
            subject: contactForm.subject.value,
            message: contactForm.message.value
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

console.log("Wind & Clouds Portfolio Loaded - Braulio Tapia");
