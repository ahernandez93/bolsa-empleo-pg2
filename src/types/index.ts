export type EmpleadoCompleto = {
    id: string
    usuarioId: string
    departamentoId: number
    cargoId: number
    createdAt: string
    updatedAt: string
    usuario: {
        id: string
        personaId: string
        email: string
        passwordHash: string
        rol: "RECLUTADOR" | "ADMIN"
        emailVerificado: boolean
        activo: boolean
        createdAt: string
        updatedAt: string
        persona: {
            id: string
            nombre: string
            apellido: string
            telefono: string
            direccion: string
            fechaNacimiento: string
            createdAt: string
            updatedAt: string
        }
    }
}

export type DepartamentoCompleto = {
    id: number
    descripcion: string
    habilitado: boolean
    createdAt: string
    updatedAt: string
}

export type CargoCompleto = {
    id: number
    descripcion: string
    habilitado: boolean
    createdAt: string
    updatedAt: string
}
