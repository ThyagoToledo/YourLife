// ============================================
// ATUALIZAÇÃO DO BANCO DE DADOS
// Adiciona suporte para pedidos de amizade e mensagens
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
    // Adiciona coluna status na tabela followers (se não existir)
    db.run(`
        ALTER TABLE followers ADD COLUMN status TEXT DEFAULT 'accepted'
    `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Erro ao adicionar coluna status:', err.message);
        } else if (!err) {
            console.log('✅ Coluna status adicionada à tabela followers');
        }
    });

    // Cria tabela de mensagens
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_user_id INTEGER NOT NULL,
            to_user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela messages:', err.message);
        } else {
            console.log('✅ Tabela messages criada');
        }
    });

    // Adiciona coluna related_user_id na tabela notifications (se não existir)
    db.run(`
        ALTER TABLE notifications ADD COLUMN related_user_id INTEGER
    `, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Erro ao adicionar coluna related_user_id:', err.message);
        } else if (!err) {
            console.log('✅ Coluna related_user_id adicionada à tabela notifications');
        }
    });

    // Renomeia coluna read para is_read na tabela notifications (se necessário)
    db.all(`PRAGMA table_info(notifications)`, [], (err, columns) => {
        if (err) {
            console.error('❌ Erro ao verificar colunas:', err.message);
            return;
        }

        const hasReadColumn = columns.some(col => col.name === 'read');
        const hasIsReadColumn = columns.some(col => col.name === 'is_read');

        if (hasReadColumn && !hasIsReadColumn) {
            // SQLite não suporta RENAME COLUMN diretamente em versões antigas
            // Vamos criar uma nova tabela e copiar os dados
            db.run(`
                CREATE TABLE notifications_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    type TEXT NOT NULL,
                    content TEXT NOT NULL,
                    related_user_id INTEGER,
                    is_read BOOLEAN DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `, (err) => {
                if (err) {
                    console.error('❌ Erro ao criar tabela notifications_new:', err.message);
                    return;
                }

                // Copia os dados
                db.run(`
                    INSERT INTO notifications_new (id, user_id, type, content, is_read, created_at)
                    SELECT id, user_id, type, content, read, created_at FROM notifications
                `, (err) => {
                    if (err) {
                        console.error('❌ Erro ao copiar dados:', err.message);
                        return;
                    }

                    // Remove tabela antiga
                    db.run(`DROP TABLE notifications`, (err) => {
                        if (err) {
                            console.error('❌ Erro ao remover tabela antiga:', err.message);
                            return;
                        }

                        // Renomeia nova tabela
                        db.run(`ALTER TABLE notifications_new RENAME TO notifications`, (err) => {
                            if (err) {
                                console.error('❌ Erro ao renomear tabela:', err.message);
                            } else {
                                console.log('✅ Tabela notifications atualizada');
                            }
                        });
                    });
                });
            });
        } else {
            console.log('✅ Tabela notifications já está atualizada');
        }
    });

    console.log('\n🎉 Banco de dados atualizado com sucesso!\n');
});

setTimeout(() => {
    db.close((err) => {
        if (err) {
            console.error('❌ Erro ao fechar banco de dados:', err.message);
        } else {
            console.log('✅ Conexão com banco de dados fechada');
        }
    });
}, 2000);
