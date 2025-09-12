import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Mapa: Departamento -> [ciudades[]]
 */
const HN: Record<string, string[]> = {
    "Atlántida": ["La Ceiba", "Tela", "Jutiapa", "Arizona"],
    "Colón": ["Trujillo", "Tocoa", "Sabá", "Bonito Oriental"],
    "Comayagua": ["Comayagua", "Siguatepeque", "La Libertad"],
    "Copán": ["Santa Rosa de Copán", "Copán Ruinas", "La Entrada"],
    "Cortés": ["San Pedro Sula", "Puerto Cortés", "Choloma", "La Lima", "Villanueva"],
    "Choluteca": ["Choluteca", "San Marcos de Colón", "Pespire"],
    "El Paraíso": ["Yuscarán", "Danlí", "El Paraíso"],
    "Francisco Morazán": ["Tegucigalpa", "Comayagüela", "Valle de Ángeles", "Santa Lucía"],
    "Gracias a Dios": ["Puerto Lempira", "Ahuas"],
    "Intibucá": ["La Esperanza", "Intibucá"],
    "Islas de la Bahía": ["Roatán", "Coxen Hole", "Utila", "Guanaja"],
    "La Paz": ["La Paz", "Marcala"],
    "Lempira": ["Gracias", "Erandique"],
    "Ocotepeque": ["Nueva Ocotepeque", "San Marcos"],
    "Olancho": ["Juticalpa", "Catacamas", "Campamento"],
    "Santa Bárbara": ["Santa Bárbara", "Quimistán", "Azacualpa"],
    "Valle": ["Nacaome", "San Lorenzo"],
    "Yoro": ["Yoro", "El Progreso", "Olanchito", "Morazán"],
};

async function main() {
    console.log("Seedeando departamentos y ciudades de Honduras...");

    for (const [deptoNombre, ciudades] of Object.entries(HN)) {
        // Upsert departamento por nombre (unique)
        const departamento = await prisma.ubicacionDepartamento.upsert({
            where: {
                nombre: deptoNombre,
            },
            update: {},
            create: { nombre: deptoNombre },
        });

        // Ciudades dentro de ese departamento (unique por (departamentoId, nombre))
        for (const ciudad of ciudades) {
            await prisma.ubicacionCiudad.upsert({
                where: {
                    departamentoId_nombre: {
                        departamentoId: departamento.id,
                        nombre: ciudad,
                    },
                },
                update: {},
                create: {
                    nombre: ciudad,
                    departamentoId: departamento.id,
                },
            });
        }
    }

    console.log("Seed de ubicaciones completado ✅");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
