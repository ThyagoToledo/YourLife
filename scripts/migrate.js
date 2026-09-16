require('dotenv').config();

const fs = require('node:fs/promises');
const path = require('node:path');
const { sql } = require('@vercel/postgres');

async function migrate() {
    const migrationsDirectory = path.join(__dirname, '..', 'migrations');
    const files = (await fs.readdir(migrationsDirectory))
        .filter((file) => file.endsWith('.sql'))
        .sort();
    for (const file of files) {
        const source = await fs.readFile(path.join(migrationsDirectory, file), 'utf8');
        await sql.query(source);
        console.log(`Migração ${file} aplicada com sucesso.`);
    }
}

migrate().catch((error) => {
    console.error('Falha ao aplicar migração social 001:', error.message);
    process.exitCode = 1;
});
