// ============================================
// ATUALIZAÇÃO DA TABELA ADVICES
// ============================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err.message);
        process.exit(1);
    }
    console.log('✅ Conectado ao banco de dados SQLite');
});

db.serialize(() => {
    console.log('🔄 Atualizando tabela advices...');
    
    // Remove a tabela antiga
    db.run('DROP TABLE IF EXISTS advices', (err) => {
        if (err) {
            console.error('❌ Erro ao remover tabela antiga:', err.message);
            return;
        }
        console.log('✅ Tabela antiga removida');
        
        // Cria a nova tabela com a estrutura correta
        db.run(`
            CREATE TABLE IF NOT EXISTS advices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'geral',
                author_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) {
                console.error('❌ Erro ao criar nova tabela advices:', err.message);
            } else {
                console.log('✅ Nova tabela advices criada com sucesso!');
                console.log('📋 Estrutura:');
                console.log('   - id (INTEGER PRIMARY KEY)');
                console.log('   - title (TEXT NOT NULL)');
                console.log('   - content (TEXT NOT NULL)');
                console.log('   - category (TEXT DEFAULT geral)');
                console.log('   - author_id (INTEGER NOT NULL)');
                console.log('   - created_at (DATETIME)');
            }
            
            db.close((err) => {
                if (err) {
                    console.error('❌ Erro ao fechar banco de dados:', err.message);
                } else {
                    console.log('✅ Conexão com banco de dados fechada');
                    console.log('\n🎉 Atualização concluída com sucesso!\n');
                }
            });
        });
    });
});
