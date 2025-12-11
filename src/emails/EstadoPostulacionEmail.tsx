import * as React from "react"
import { Html, Head, Preview, Body, Container, Heading, Text, Hr, Section, Link } from "@react-email/components"

type Estado = "SOLICITUD" | "ENTREVISTA" | "EVALUACIONES" | "CONTRATACION" | "RECHAZADA"

const COPIA_POR_ESTADO: Record<Estado, {
    titulo: string
    subtitulo: string
    bullets?: string[]
    cta?: { label: string; href: string }
}> = {
    SOLICITUD: {
        titulo: "¡Hemos recibido tu postulación!",
        subtitulo: "Tu solicitud está en revisión. Te avisaremos ante cualquier novedad.",
        bullets: [
            "Revisa que tu CV esté actualizado.",
            "Si tienes portafolio, inclúyelo en tu perfil.",
        ],
    },
    ENTREVISTA: {
        titulo: "¡Has pasado a entrevista!",
        subtitulo: "Pronto te contactaremos para coordinar fecha y hora.",
        bullets: [
            "Prepara ejemplos concretos de tu experiencia.",
            "Repasa los requisitos del puesto.",
        ],
        cta: { label: "Ver detalles", href: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/mi-perfil/postulaciones` },
    },
    EVALUACIONES: {
        titulo: "Estás en etapa de evaluaciones",
        subtitulo: "Te compartiremos instrucciones y tiempos estimados.",
        bullets: [
            "Asegúrate de tener una conexión estable.",
            "Lee con atención cada ejercicio.",
        ],
        cta: { label: "Ir a mis evaluaciones", href: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/evaluaciones` },
    },
    CONTRATACION: {
        titulo: "¡Buenas noticias! Estás en contratación",
        subtitulo: "El equipo iniciará el proceso para formalizar la oferta.",
        bullets: [
            "Revisa tu correo con frecuencia.",
            "Prepárate para compartir documentos necesarios.",
        ],
    },
    RECHAZADA: {
        titulo: "Actualización sobre tu postulación",
        subtitulo: "En esta ocasión no avanzaremos, pero agradecemos tu interés.",
        bullets: [
            "Sigue postulando a puestos afines.",
            "Actualiza tu perfil para destacar tus fortalezas.",
        ],
        cta: { label: "Explorar nuevas vacantes", href: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/ofertas` },
    },
}

export function EstadoPostulacionEmail(props: {
    nombre: string
    puesto: string
    estadoNuevo: Estado
}) {
    const { nombre, puesto, estadoNuevo } = props
    const copy = COPIA_POR_ESTADO[estadoNuevo]

    return (
        <Html>
            <Head />
            <Preview>{`Tu postulación a ${puesto} cambió a ${estadoNuevo}`}</Preview>
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Heading style={styles.h1}>{copy.titulo}</Heading>
                    <Text style={styles.text}>Hola {nombre},</Text>
                    <Text style={styles.text}>
                        Tu postulación para <b>{puesto}</b> ahora está en estado: <b>{estadoNuevo}</b>.
                    </Text>
                    <Text style={{ ...styles.text, color: "#475467" }}>{copy.subtitulo}</Text>

                    {copy.bullets && copy.bullets.length > 0 && (
                        <Section>
                            {copy.bullets.map((b, i) => (
                                <Text key={i} style={{ ...styles.text, marginLeft: 12 }}>• {b}</Text>
                            ))}
                        </Section>
                    )}

                    {copy.cta?.href && (
                        <Section style={{ marginTop: 16 }}>
                            <Link
                                href={copy.cta.href}
                                style={{
                                    background: "#1f2937",
                                    color: "#ffffff",
                                    padding: "10px 16px",
                                    borderRadius: 8,
                                    textDecoration: "none",
                                    display: "inline-block",
                                }}
                            >
                                {copy.cta.label}
                            </Link>
                        </Section>
                    )}

                    <Hr style={styles.hr} />
                    <Text style={{ ...styles.text, fontSize: 12, color: "#667085" }}>
                        Este es un mensaje automático; no respondas a este correo.
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}

const styles: Record<string, React.CSSProperties> = {
    body: { backgroundColor: "#ffffff", margin: 0, fontFamily: "Arial, sans-serif" },
    container: { padding: "24px", maxWidth: 600, margin: "0 auto" },
    h1: { fontSize: 24, marginBottom: 8 },
    text: { fontSize: 14, lineHeight: "22px", color: "#101828" },
    hr: { borderColor: "#EAECF0", marginTop: 24, marginBottom: 0 },
}
