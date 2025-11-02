// ============================================
// INICIALIZAÇÃO DO BANCO DE DADOS SQLite
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

// Cria as tabelas
db.serialize(() => {
    // Tabela de Usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            avatar TEXT,
            bio TEXT DEFAULT 'Novo usuário da rede social',
            cover_image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela users:', err.message);
        } else {
            console.log('✅ Tabela users criada');
        }
    });

    // Tabela de Interesses dos Usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS user_interests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            interest TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela user_interests:', err.message);
        } else {
            console.log('✅ Tabela user_interests criada');
        }
    });

    // Tabela de Posts
    db.run(`
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela posts:', err.message);
        } else {
            console.log('✅ Tabela posts criada');
        }
    });

    // Tabela de Curtidas
    db.run(`
        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
            UNIQUE(user_id, post_id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela likes:', err.message);
        } else {
            console.log('✅ Tabela likes criada');
        }
    });

    // Tabela de Comentários
    db.run(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela comments:', err.message);
        } else {
            console.log('✅ Tabela comments criada');
        }
    });

    // Tabela de Conselhos
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
            console.error('❌ Erro ao criar tabela advices:', err.message);
        } else {
            console.log('✅ Tabela advices criada');
        }
    });

    // Tabela de Seguidores/Amigos
    db.run(`
        CREATE TABLE IF NOT EXISTS followers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            follower_id INTEGER NOT NULL,
            following_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(follower_id, following_id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela followers:', err.message);
        } else {
            console.log('✅ Tabela followers criada');
        }
    });

    // Tabela de Notificações
    db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            from_user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            content TEXT NOT NULL,
            link TEXT,
            read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela notifications:', err.message);
        } else {
            console.log('✅ Tabela notifications criada');
        }
    });

    console.log('\n🎉 Banco de dados inicializado com sucesso!\n');
});

db.close((err) => {
    if (err) {
        console.error('❌ Erro ao fechar banco de dados:', err.message);
    } else {
        console.log('✅ Conexão com banco de dados fechada');
    }
});
