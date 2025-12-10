import { prisma } from "@/lib/prisma";
import { requireEmpresaSession } from "@/lib/auth/guard";
import { RolUsuario } from "@prisma/client";

export const getEmpleados = async () => {
    try {
        const { empresaId, rol } = await requireEmpresaSession();
        const isSuperAdmin = rol === "SUPERADMIN";

        const where = !isSuperAdmin && empresaId
            ? { empresaId }
            : {};

        const empleados = await prisma.empleado.findMany({
            where,
            include: {
                usuario: {
                    include: {
                        persona: true,
                    },
                },
                departamento: true,
                cargo: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        const data = empleados.map(emp => ({
            id: emp.id,
            nombre: emp.usuario.persona.nombre,
            apellido: emp.usuario.persona.apellido,
            email: emp.usuario.email,
            rol: emp.usuario.rol,
            departamentoId: emp.departamentoId,
            departamentodescripcion: emp.departamento?.descripcion ?? "Sin asignar",
            cargoId: emp.cargoId,
            cargodescripcion: emp.cargo?.descripcion ?? "Sin asignar",
            activo: emp.usuario.activo,
            createdAt: emp.createdAt.toISOString(),
        }));

        return data;

    } catch (error) {
        console.error("Error fetching empleados from database:", error);
        return [];
    }
}

export const getReclutadoresEmpresa = async () => {
    try {
        const { empresaId, rol } = await requireEmpresaSession();
        const isSuperAdmin = rol === "SUPERADMIN";

        // Si usás la tabla Usuario como origen de reclutadores:
        const whereUsuario = {
            rol: "RECLUTADOR" as RolUsuario,
            ...(isSuperAdmin
                ? {}
                : { empresaId: empresaId ?? undefined }),
        };

        const usuarios = await prisma.usuario.findMany({
            where: whereUsuario,
            include: {
                persona: true,
            },
            orderBy: {
                persona: {
                    nombre: "asc",
                },
            },
        });

        const data = usuarios.map((u) => ({
            id: u.id,
            nombre: `${u.persona.nombre} ${u.persona.apellido}`,
            email: u.email,
        }));

        return data;
    } catch (error) {
        console.error("Error fetching reclutadores:", error);
        return [];
    }
}