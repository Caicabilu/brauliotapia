// Sanitize HTML to prevent XSS
function sanitizeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function onRequestPost(context) {
    const { request, env } = context;

    // CORS headers - restricted to your domain
    const allowedOrigins = ['https://brauliotapia.cl', 'https://www.brauliotapia.cl'];
    const origin = request.headers.get('Origin');
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    const corsHeaders = {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    try {
        const { name, email, subject, message, recaptchaToken } = await request.json();

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return new Response(
                JSON.stringify({ error: 'Todos los campos son requeridos' }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return new Response(
                JSON.stringify({ error: 'El formato del email no es válido' }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
        }

        // Verify reCAPTCHA
        if (!recaptchaToken) {
            return new Response(
                JSON.stringify({ error: 'Por favor, completa el captcha' }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
        }

        const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
        });

        const recaptchaResult = await recaptchaResponse.json();
        if (!recaptchaResult.success) {
            return new Response(
                JSON.stringify({ error: 'Verificación de captcha fallida' }),
                { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
        }

        // Send email using Resend API
        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Portfolio Contact <onboarding@resend.dev>',
                to: ['gameplaysgenshinimpact1@gmail.com'],
                subject: `[Portfolio] ${sanitizeHtml(subject)}`,
                html: `
                    <h2>Nuevo mensaje desde tu portfolio</h2>
                    <p><strong>Nombre:</strong> ${sanitizeHtml(name)}</p>
                    <p><strong>Email:</strong> ${sanitizeHtml(email)}</p>
                    <p><strong>Asunto:</strong> ${sanitizeHtml(subject)}</p>
                    <hr>
                    <p><strong>Mensaje:</strong></p>
                    <p>${sanitizeHtml(message).replace(/\n/g, '<br>')}</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        Este mensaje fue enviado desde el formulario de contacto de tu portfolio.
                    </p>
                `,
                reply_to: sanitizeHtml(email)
            }),
        });

        if (!resendResponse.ok) {
            const errorData = await resendResponse.json();
            console.error('Resend error:', errorData);
            throw new Error('Error al enviar el email');
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Mensaje enviado correctamente' }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: 'Error al procesar la solicitud' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
    }
}

// Handle OPTIONS for CORS
export async function onRequestOptions(context) {
    const { request } = context;
    const allowedOrigins = ['https://brauliotapia.cl', 'https://www.brauliotapia.cl'];
    const origin = request.headers.get('Origin');
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': corsOrigin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
