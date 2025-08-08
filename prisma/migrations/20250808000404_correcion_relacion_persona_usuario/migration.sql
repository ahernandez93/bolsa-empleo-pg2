-- DropForeignKey
ALTER TABLE `persona` DROP FOREIGN KEY `Persona_id_fkey`;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_personaId_fkey` FOREIGN KEY (`personaId`) REFERENCES `Persona`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
