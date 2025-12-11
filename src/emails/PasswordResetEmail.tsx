// emails/PasswordResetEmail.tsx
import {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Text,
    Link,
    Heading,
    Section,
} from "@react-email/components";

interface PasswordResetEmailProps {
    nombre?: string | null;
    resetUrl: string;
}

export function PasswordResetEmail({ nombre, resetUrl }: PasswordResetEmailProps) {
    const saludo = nombre ? `Hola, ${nombre}` : "Hola";

    return (
        <Html>
            <Head />
            <Preview>Restablecé tu contraseña de EmpleaHub</Preview>
            <Body style={bodyStyle}>
                <Container style={containerStyle}>
                    <Heading style={headingStyle}>Restablecer contraseña</Heading>
                    <Text style={textStyle}>{saludo},</Text>
                    <Text style={textStyle}>
                        Recibimos una solicitud para restablecer la contraseña de tu cuenta en
                        <strong> EmpleaHub</strong>.
                    </Text>
                    <Text style={textStyle}>
                        Para crear una nueva contraseña, hacé clic en el siguiente enlace:
                    </Text>

                    <Section style={{ textAlign: "center", margin: "24px 0" }}>
                        <Link href={resetUrl} style={buttonStyle}>
                            Restablecer contraseña
                        </Link>
                    </Section>

                    <Text style={textStyle}>
                        Si el botón no funciona, también podés copiar y pegar este enlace en tu navegador:
                    </Text>
                    <Text style={{ ...textStyle, fontSize: "12px", wordBreak: "break-all" }}>
                        {resetUrl}
                    </Text>

                    <Text style={textStyle}>
                        Este enlace es válido por un tiempo limitado. Si vos no solicitaste este cambio,
                        podés ignorar este mensaje y tu contraseña seguirá siendo la misma.
                    </Text>

                    <Text style={textStyle}>
                        Saludos,<br />
                        Equipo de EmpleaHub
                    </Text>

                    <Text style={footerStyle}>
                        Este es un correo automático, por favor no respondas a este mensaje.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const bodyStyle: React.CSSProperties = {
    backgroundColor: "#f3f4f6",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const containerStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    margin: "24px auto",
    padding: "24px",
    borderRadius: "8px",
    maxWidth: "480px",
};

const headingStyle: React.CSSProperties = {
    fontSize: "22px",
    marginBottom: "12px",
};

const textStyle: React.CSSProperties = {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#111827",
};

const footerStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "16px",
};

const buttonStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "10px 18px",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 600,
};
