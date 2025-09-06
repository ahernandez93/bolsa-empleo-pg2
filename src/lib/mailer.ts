import { Resend } from "resend"
import { render } from "@react-email/render"
import { EstadoPostulacionEmail } from "@/emails/EstadoPostulacionEmail"

type Estado = "SOLICITUD" | "ENTREVISTA" | "EVALUACIONES" | "CONTRATACION" | "RECHAZADA"

const API_KEY = process.env.RESEND_API_KEY
if (!API_KEY) {
    console.warn("[mailer] RESEND_API_KEY no está definida")
}
const resend = new Resend(API_KEY)

export async function sendEstadoPostulacionEmail(opts: {
    to: string
    nombre: string
    puesto: string
    estadoNuevo: Estado
}) {
    if (!opts?.to) {
        console.error("[mailer] Falta destinatario")
        return
    }

    const subject = asuntoPorEstado(opts.puesto, opts.estadoNuevo)

    try {
        const html = await render(EstadoPostulacionEmail(opts))

        console.log("[mailer] Enviando →", { to: opts.to, subject })
        const resp = await resend.emails.send({
            from: "onboarding@resend.dev", // usar dominio verificado cuando lo tengas
            to: "allan.hernandez777@gmail.com",//opts.to,
            subject,
            html,
        })

        console.log("[mailer] Resend response:", resp)
        // resp = { id: '...', error: null } si fue ok
        if ((resp)?.error) {
            console.error("[mailer] Resend error:", resp.error)
        }
    } catch (err) {
        console.error("[mailer] Throw:", err)
        throw err
    }

    console.log("Correo enviado a", opts.to)
}

function asuntoPorEstado(puesto: string, estado: Estado) {
    switch (estado) {
        case "SOLICITUD": return `Recibimos tu postulación a ${puesto}`
        case "ENTREVISTA": return `Entrevista para ${puesto}: siguiente paso`
        case "EVALUACIONES": return `Evaluaciones para ${puesto}: instrucciones`
        case "CONTRATACION": return `¡Adelante con ${puesto}! Proceso de contratación`
        case "RECHAZADA": return `Actualización sobre tu postulación a ${puesto}`
    }
}
