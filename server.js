// ============================================
// SERVIDOR EXPRESS - REDE SOCIAL INTEGRADA
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
// Em produção (Vercel), usar banco em memória ou variável de ambiente
const DB_PATH = process.env.DB_PATH || (process.env.NODE_ENV === 'production' ? ':memory:' : './database.sqlite');
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_jwt_altere_em_producao';

// Conecta ao banco de dados
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err.message);
        process.exit(1);
    }
    console.log('✅ Conectado ao banco de dados SQLite');

    // Se estiver em produção com :memory:, inicializa o banco
    if (DB_PATH === ':memory:') {
        console.log('🔧 Inicializando banco de dados em memória...');
        initializeDatabase();
    }
});

// Função para inicializar banco de dados em memória
function initializeDatabase() {
    const schema = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            avatar TEXT,
            bio TEXT,
            cover_image TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (post_id) REFERENCES posts(id),
            UNIQUE(user_id, post_id)
        );

        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            post_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (post_id) REFERENCES posts(id)
        );

        CREATE TABLE IF NOT EXISTS followers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            follower_id INTEGER NOT NULL,
            following_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (follower_id) REFERENCES users(id),
            FOREIGN KEY (following_id) REFERENCES users(id),
            UNIQUE(follower_id, following_id)
        );

        CREATE TABLE IF NOT EXISTS user_interests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            interest TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS advices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT DEFAULT 'geral',
            author_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (author_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            content TEXT NOT NULL,
            related_user_id INTEGER,
            is_read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (related_user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_user_id INTEGER NOT NULL,
            to_user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (from_user_id) REFERENCES users(id),
            FOREIGN KEY (to_user_id) REFERENCES users(id)
        );
    `;

    db.exec(schema, (err) => {
        if (err) {
            console.error('❌ Erro ao inicializar banco:', err);
        } else {
            console.log('✅ Banco de dados em memória inicializado');
        }
    });
}

// Middlewares
app.use(cors({
    origin: '*', // Permite qualquer origem
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));

// Rota raiz - Serve o site.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'site.html'));
});

// Rota de status da API
app.get('/api', (req, res) => {
    res.json({
        status: 'online',
        message: 'API da Rede Social Integrada',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                logout: 'POST /api/auth/logout',
                me: 'GET /api/users/me'
            },
            posts: {
                feed: 'GET /api/feed',
                create: 'POST /api/posts',
                like: 'POST /api/posts/:id/like',
                unlike: 'DELETE /api/posts/:id/like'
            },
            comments: {
                list: 'GET /api/posts/:id/comments',
                create: 'POST /api/posts/:id/comments'
            }
        },
        frontend: 'http://localhost:8000/site.html'
    });
});

app.get('/api', (req, res) => {
    res.json({
        status: 'online',
        message: 'API está funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Token não fornecido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Helper para formatar usuário
const formatUser = (user) => {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`,
        bio: user.bio,
        coverImage: user.cover_image,
        createdAt: user.created_at
    };
};

// ========== ROTAS DE AUTENTICAÇÃO ==========

// Registro
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Nome, email e senha são obrigatórios'
        });
    }

    try {
        // Verifica se email já existe
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, error: 'Erro ao verificar email' });
            }

            if (user) {
                return res.status(400).json({ success: false, error: 'Email já cadastrado' });
            }

            // Hash da senha
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insere usuário
            db.run(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                [name, email, hashedPassword],
                function (err) {
                    if (err) {
                        return res.status(500).json({ success: false, error: 'Erro ao criar usuário' });
                    }

                    const userId = this.lastID;

                    // Gera token
                    const token = jwt.sign(
                        { id: userId, email: email },
                        JWT_SECRET,
                        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
                    );

                    // Busca usuário criado
                    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, newUser) => {
                        if (err) {
                            return res.status(500).json({ success: false, error: 'Erro ao buscar usuário' });
                        }

                        res.status(201).json({
                            success: true,
                            token: token,
                            user: formatUser(newUser)
                        });
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro no servidor' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('🔐 Tentativa de login:', req.body.email);

        const { email, password } = req.body;

        if (!email || !password) {
            console.log('❌ Email ou senha não fornecidos');
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }

        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('❌ Erro ao buscar usuário:', err);
                return res.status(500).json({ success: false, message: 'Erro ao buscar usuário' });
            }

            if (!user) {
                console.log('❌ Usuário não encontrado:', email);
                return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
            }

            // Verifica senha
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                console.log('❌ Senha inválida para:', email);
                return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
            }

            // Gera token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            console.log('✅ Login bem-sucedido:', email);

            res.json({
                success: true,
                token: token,
                user: formatUser(user)
            });
        });
    } catch (error) {
        console.error('❌ Erro inesperado no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno no servidor'
        });
    }
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    res.json({ success: true, message: 'Logout realizado' });
});

// Usuário atual
app.get('/api/users/me', authenticateToken, (req, res) => {
    console.log('📋 Buscando usuário:', req.user.id);

    db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) {
            console.error('❌ Erro ao buscar usuário:', err);
            return res.status(500).json({ success: false, message: 'Erro ao buscar usuário' });
        }

        if (!user) {
            console.error('❌ Usuário não encontrado:', req.user.id);
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }

        console.log('👤 Usuário encontrado:', user.name);

        // Busca interesses
        db.all('SELECT interest FROM user_interests WHERE user_id = ?', [user.id], (err, interests) => {
            if (err) {
                console.error('⚠️ Erro ao buscar interesses:', err);
            }

            const userWithProfile = {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`,
                bio: user.bio || 'Olá! Sou novo por aqui.',
                coverImage: user.cover_image,
                createdAt: user.created_at,
                profile: {
                    name: user.name,
                    avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`,
                    bio: user.bio || 'Olá! Sou novo por aqui.',
                    interests: interests && interests.length > 0
                        ? interests.map(i => i.interest)
                        : ['Tecnologia', 'Redes Sociais', 'Inovação']
                }
            };

            console.log('✅ Perfil montado:', userWithProfile.profile);
            res.json(userWithProfile);
        });
    });
});

// ========== ROTAS DE POSTS ==========

// Feed
app.get('/api/feed', authenticateToken, (req, res) => {
    const query = `
        SELECT 
            p.*,
            u.name as author_name,
            u.email as author_email,
            u.avatar as author_avatar,
            COUNT(DISTINCT l.id) as likes_count,
            COUNT(DISTINCT c.id) as comments_count,
            CASE WHEN ul.id IS NOT NULL THEN 1 ELSE 0 END as is_liked
        FROM posts p
        INNER JOIN users u ON p.user_id = u.id
        LEFT JOIN likes l ON p.id = l.post_id
        LEFT JOIN comments c ON p.id = c.post_id
        LEFT JOIN likes ul ON p.id = ul.post_id AND ul.user_id = ?
        GROUP BY p.id
        ORDER BY p.created_at DESC
        LIMIT 50
    `;

    db.all(query, [req.user.id], (err, posts) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Erro ao buscar feed' });
        }

        const formattedPosts = posts.map(post => ({
            id: post.id,
            author: {
                id: post.user_id,
                name: post.author_name,
                avatar: post.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name)}&background=4F46E5&color=fff`
            },
            content: post.content,
            timestamp: post.created_at,
            likes: parseInt(post.likes_count),
            isLiked: post.is_liked === 1,
            commentsCount: parseInt(post.comments_count),
            comments: []
        }));

        res.json(formattedPosts);
    });
});

// Criar post
app.post('/api/posts', authenticateToken, (req, res) => {
    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({ success: false, error: 'Conteúdo não pode estar vazio' });
    }

    db.run(
        'INSERT INTO posts (user_id, content) VALUES (?, ?)',
        [req.user.id, content],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: 'Erro ao criar post' });
            }

            const postId = this.lastID;

            // Busca o post criado com dados do autor
            const query = `
                SELECT p.*, u.name as author_name, u.avatar as author_avatar
                FROM posts p
                INNER JOIN users u ON p.user_id = u.id
                WHERE p.id = ?
            `;

            db.get(query, [postId], (err, post) => {
                if (err) {
                    return res.status(500).json({ success: false, error: 'Erro ao buscar post' });
                }

                res.status(201).json({
                    success: true,
                    post: {
                        id: post.id,
                        author: {
                            id: post.user_id,
                            name: post.author_name,
                            avatar: post.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name)}&background=4F46E5&color=fff`
                        },
                        content: post.content,
                        timestamp: post.created_at,
                        likes: 0,
                        isLiked: false,
                        comments: []
                    }
                });
            });
        }
    );
});

// Deletar post
app.delete('/api/posts/:id', authenticateToken, (req, res) => {
    const postId = req.params.id;

    // Verifica se o post existe e pertence ao usuário
    db.get('SELECT user_id FROM posts WHERE id = ?', [postId], (err, post) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Erro ao buscar post' });
        }

        if (!post) {
            return res.status(404).json({ success: false, error: 'Post não encontrado' });
        }

        if (post.user_id !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Você não tem permissão para deletar este post' });
        }

        // Deleta comentários e likes primeiro, depois o post
        db.run('DELETE FROM comments WHERE post_id = ?', [postId], (err) => {
            if (err) return res.status(500).json({ success: false, error: 'Erro ao deletar comentários' });

            db.run('DELETE FROM likes WHERE post_id = ?', [postId], (err) => {
                if (err) return res.status(500).json({ success: false, error: 'Erro ao deletar likes' });

                db.run('DELETE FROM posts WHERE id = ?', [postId], (err) => {
                    if (err) return res.status(500).json({ success: false, error: 'Erro ao deletar post' });

                    res.json({ success: true, message: 'Post deletado com sucesso' });
                });
            });
        });
    });
});

// Curtir post
app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
    const postId = req.params.id;

    db.run(
        'INSERT INTO likes (user_id, post_id) VALUES (?, ?)',
        [req.user.id, postId],
        (err) => {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ success: false, error: 'Post já curtido' });
                }
                return res.status(500).json({ success: false, error: 'Erro ao curtir post' });
            }

            res.json({ success: true, message: 'Post curtido' });
        }
    );
});

// Descurtir post
app.delete('/api/posts/:id/like', authenticateToken, (req, res) => {
    const postId = req.params.id;

    db.run(
        'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
        [req.user.id, postId],
        (err) => {
            if (err) {
                return res.status(500).json({ success: false, error: 'Erro ao descurtir post' });
            }

            res.json({ success: true, message: 'Post descurtido' });
        }
    );
});

// Comentários do post
app.get('/api/posts/:id/comments', authenticateToken, (req, res) => {
    const postId = req.params.id;

    const query = `
        SELECT c.*, u.name as author_name, u.avatar as author_avatar
        FROM comments c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
    `;

    db.all(query, [postId], (err, comments) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Erro ao buscar comentários' });
        }

        const formattedComments = comments.map(c => ({
            id: c.id,
            postId: c.post_id,
            author: {
                id: c.user_id,
                name: c.author_name,
                avatar: c.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.author_name)}&background=4F46E5&color=fff`
            },
            content: c.content,
            timestamp: c.created_at
        }));

        res.json(formattedComments);
    });
});

// Criar comentário
app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({ success: false, error: 'Conteúdo não pode estar vazio' });
    }

    db.run(
        'INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)',
        [req.user.id, postId, content],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: 'Erro ao criar comentário' });
            }

            const commentId = this.lastID;

            // Busca o comentário criado
            const query = `
                SELECT c.*, u.name as author_name, u.avatar as author_avatar
                FROM comments c
                INNER JOIN users u ON c.user_id = u.id
                WHERE c.id = ?
            `;

            db.get(query, [commentId], (err, comment) => {
                if (err) {
                    return res.status(500).json({ success: false, error: 'Erro ao buscar comentário' });
                }

                res.status(201).json({
                    success: true,
                    comment: {
                        id: comment.id,
                        postId: comment.post_id,
                        author: {
                            id: comment.user_id,
                            name: comment.author_name
                        },
                        content: comment.content,
                        timestamp: comment.created_at
                    }
                });
            });
        }
    );
});

// ========== ROTAS DE USUÁRIOS ==========

// Buscar perfil de usuário
app.get('/api/users/:id', authenticateToken, (req, res) => {
    const userId = req.params.id;

    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Erro ao buscar usuário' });
        }

        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }

        // Busca interesses
        db.all('SELECT interest FROM user_interests WHERE user_id = ?', [userId], (err, interests) => {
            // Busca posts do usuário
            db.all(
                `SELECT COUNT(*) as count FROM posts WHERE user_id = ?`,
                [userId],
                (err, postsCount) => {
                    // Verifica se são amigos (amizade bidirecional)
                    console.log('🔍 Verificando amizade entre usuário', req.user.id, 'e', userId);
                    db.get(
                        `SELECT * FROM followers 
                         WHERE ((follower_id = ? AND following_id = ?) 
                            OR (follower_id = ? AND following_id = ?))
                            AND status = 'accepted'`,
                        [req.user.id, userId, userId, req.user.id],
                        (err, friendship) => {
                            console.log('🔍 Resultado da query de amizade:', friendship);
                            console.log('🔍 isFriend será:', !!friendship);

                            const userProfile = {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`,
                                profile: {
                                    name: user.name,
                                    avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`,
                                    bio: user.bio || 'Sem bio',
                                    interests: interests ? interests.map(i => i.interest) : []
                                },
                                stats: {
                                    posts: postsCount[0].count,
                                    friends: 0,
                                    likes: 0
                                },
                                isFriend: !!friendship
                            };

                            res.json(userProfile);
                        }
                    );
                }
            );
        });
    });
});

// Atualizar perfil
app.put('/api/users/me', authenticateToken, (req, res) => {
    const { name, bio, avatar, interests } = req.body;

    // Atualiza dados básicos
    db.run(
        'UPDATE users SET name = ?, bio = ?, avatar = ? WHERE id = ?',
        [name, bio, avatar, req.user.id],
        (err) => {
            if (err) {
                return res.status(500).json({ success: false, error: 'Erro ao atualizar perfil' });
            }

            // Remove interesses antigos
            db.run('DELETE FROM user_interests WHERE user_id = ?', [req.user.id], (err) => {
                if (err) {
                    return res.status(500).json({ success: false, error: 'Erro ao atualizar interesses' });
                }

                // Adiciona novos interesses
                if (interests && interests.length > 0) {
                    const stmt = db.prepare('INSERT INTO user_interests (user_id, interest) VALUES (?, ?)');
                    interests.forEach(interest => {
                        stmt.run(req.user.id, interest);
                    });
                    stmt.finalize();
                }

                res.json({
                    success: true,
                    message: 'Perfil atualizado com sucesso',
                    user: {
                        id: req.user.id,
                        name: name,
                        bio: bio,
                        avatar: avatar,
                        interests: interests
                    }
                });
            });
        }
    );
});

// ========== ROTAS DE AMIGOS ==========

// Listar amigos aceitos
app.get('/api/friends', authenticateToken, (req, res) => {
    const query = `
        SELECT u.*, 
               f.created_at as friend_since
        FROM followers f
        INNER JOIN users u ON f.following_id = u.id
        WHERE f.follower_id = ? AND f.status = 'accepted'
        ORDER BY u.name
    `;

    db.all(query, [req.user.id], (err, friends) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Erro ao buscar amigos' });
        }

        const formattedFriends = friends.map(friend => ({
            id: friend.id,
            name: friend.name,
            avatar: friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=4F46E5&color=fff`,
            friendSince: friend.friend_since
        }));

        res.json(formattedFriends);
    });
});

// Remover amizade
app.delete('/api/friends/:friendId', authenticateToken, (req, res) => {
    const friendId = parseInt(req.params.friendId);

    if (!friendId) {
        return res.status(400).json({ success: false, error: 'ID do amigo é obrigatório' });
    }

    // Remove a amizade nas duas direções
    db.run(
        'DELETE FROM followers WHERE (follower_id = ? AND following_id = ?) OR (follower_id = ? AND following_id = ?)',
        [req.user.id, friendId, friendId, req.user.id],
        function (err) {
            if (err) {
                console.error('Erro ao remover amizade:', err);
                return res.status(500).json({ success: false, error: 'Erro ao remover amizade' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ success: false, error: 'Amizade não encontrada' });
            }

            res.json({ success: true, message: 'Amizade desfeita com sucesso' });
        }
    );
});

// Listar pedidos de amizade recebidos
app.get('/api/friends/requests', authenticateToken, (req, res) => {
    const query = `
        SELECT u.*, 
               f.created_at as requested_at,
               f.follower_id as requester_id
        FROM followers f
        INNER JOIN users u ON f.follower_id = u.id
        WHERE f.following_id = ? AND f.status = 'pending'
        ORDER BY f.created_at DESC
    `;

    db.all(query, [req.user.id], (err, requests) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Erro ao buscar pedidos' });
        }

        const formattedRequests = requests.map(request => ({
            id: request.id,
            name: request.name,
            email: request.email,
            avatar: request.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.name)}&background=4F46E5&color=fff`,
            requestedAt: request.requested_at,
            requesterId: request.requester_id
        }));

        res.json(formattedRequests);
    });
});

// Enviar pedido de amizade
app.post('/api/friends/request', authenticateToken, (req, res) => {
    const { friend_id } = req.body;

    if (!friend_id) {
        return res.status(400).json({ success: false, error: 'ID do amigo é obrigatório' });
    }

    if (friend_id === req.user.id) {
        return res.status(400).json({ success: false, error: 'Você não pode adicionar a si mesmo' });
    }

    // Verifica se o usuário existe
    db.get('SELECT * FROM users WHERE id = ?', [friend_id], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }

        // Verifica se já existe algum pedido ou amizade
        db.get(
            'SELECT * FROM followers WHERE follower_id = ? AND following_id = ?',
            [req.user.id, friend_id],
            (err, existing) => {
                if (existing) {
                    if (existing.status === 'accepted') {
                        return res.status(400).json({ success: false, error: 'Vocês já são amigos' });
                    } else if (existing.status === 'pending') {
                        return res.status(400).json({ success: false, error: 'Pedido já enviado' });
                    }
                }

                // Busca o nome do usuário que está enviando
                db.get('SELECT name FROM users WHERE id = ?', [req.user.id], (err, sender) => {
                    if (err || !sender) {
                        return res.status(500).json({ success: false, error: 'Erro ao buscar usuário' });
                    }

                    // Cria o pedido de amizade
                    db.run(
                        'INSERT INTO followers (follower_id, following_id, status) VALUES (?, ?, ?)',
                        [req.user.id, friend_id, 'pending'],
                        function (err) {
                            if (err) {
                                return res.status(500).json({ success: false, error: 'Erro ao enviar pedido' });
                            }

                            // Cria notificação para o destinatário
                            db.run(
                                'INSERT INTO notifications (user_id, type, content, related_user_id, is_read) VALUES (?, ?, ?, ?, ?)',
                                [friend_id, 'friend_request', `${sender.name} enviou um pedido de amizade`, req.user.id, 0],
                                (err) => {
                                    if (err) {
                                        console.error('Erro ao criar notificação:', err);
                                    }

                                    res.status(201).json({ success: true, message: 'Pedido de amizade enviado' });
                                }
                            );
                        }
                    );
                });
            }
        );
    });
});

// Aceitar pedido de amizade
app.put('/api/friends/accept/:requesterId', authenticateToken, (req, res) => {
    const requesterId = parseInt(req.params.requesterId);

    // Atualiza o status para accepted
    db.run(
        'UPDATE followers SET status = ? WHERE follower_id = ? AND following_id = ? AND status = ?',
        ['accepted', requesterId, req.user.id, 'pending'],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: 'Erro ao aceitar pedido' });
            }

            if (this.changes === 0) {
                return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
            }

            // Cria amizade recíproca
            db.run(
                'INSERT OR IGNORE INTO followers (follower_id, following_id, status) VALUES (?, ?, ?)',
                [req.user.id, requesterId, 'accepted'],
                (err) => {
                    if (err) {
                        console.error('Erro ao criar amizade recíproca:', err);
                    }

                    // Busca o nome do usuário que aceitou
                    db.get('SELECT name FROM users WHERE id = ?', [req.user.id], (err, accepter) => {
                        if (!err && accepter) {
                            // Cria notificação para quem enviou o pedido
                            db.run(
                                'INSERT INTO notifications (user_id, type, content, related_user_id, is_read) VALUES (?, ?, ?, ?, ?)',
                                [requesterId, 'friend_accepted', `${accepter.name} aceitou seu pedido de amizade`, req.user.id, 0],
                                (err) => {
                                    if (err) console.error('Erro ao criar notificação:', err);
                                }
                            );
                        }

                        res.json({ success: true, message: 'Pedido de amizade aceito' });
                    });
                }
            );
        }
    );
});

// Recusar pedido de amizade
app.delete('/api/friends/reject/:requesterId', authenticateToken, (req, res) => {
    const requesterId = parseInt(req.params.requesterId);

    db.run(
        'DELETE FROM followers WHERE follower_id = ? AND following_id = ? AND status = ?',
        [requesterId, req.user.id, 'pending'],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: 'Erro ao recusar pedido' });
            }

            res.json({ success: true, message: 'Pedido de amizade recusado' });
        }
    );
});

// Remover amigo
app.delete('/api/friends/:id', authenticateToken, (req, res) => {
    const friendId = parseInt(req.params.id);

    // Remove ambas as direções da amizade
    db.run(
        'DELETE FROM followers WHERE (follower_id = ? AND following_id = ?) OR (follower_id = ? AND following_id = ?)',
        [req.user.id, friendId, friendId, req.user.id],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: 'Erro ao remover amigo' });
            }

            res.json({ success: true, message: 'Amigo removido com sucesso' });
        }
    );
});

// Verificar status de amizade com um usuário
app.get('/api/friends/status/:userId', authenticateToken, (req, res) => {
    const userId = parseInt(req.params.userId);

    if (userId === req.user.id) {
        return res.json({ status: 'self' });
    }

    db.get(
        'SELECT status FROM followers WHERE follower_id = ? AND following_id = ?',
        [req.user.id, userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, error: 'Erro ao verificar status' });
            }

            if (!result) {
                // Verifica se o outro usuário enviou pedido
                db.get(
                    'SELECT status FROM followers WHERE follower_id = ? AND following_id = ?',
                    [userId, req.user.id],
                    (err, reverseResult) => {
                        if (err) {
                            return res.status(500).json({ success: false, error: 'Erro ao verificar status' });
                        }

                        if (reverseResult && reverseResult.status === 'pending') {
                            return res.json({ status: 'received_request' });
                        }

                        res.json({ status: 'none' });
                    }
                );
            } else {
                res.json({ status: result.status });
            }
        }
    );
});

// Buscar usuários
app.get('/api/users/search/:query', authenticateToken, (req, res) => {
    const searchQuery = `%${req.params.query}%`;

    db.all(
        'SELECT id, name, email, avatar FROM users WHERE name LIKE ? OR email LIKE ? LIMIT 10',
        [searchQuery, searchQuery],
        (err, users) => {
            if (err) {
                return res.status(500).json({ success: false, error: 'Erro ao buscar usuários' });
            }

            const formattedUsers = users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`
            }));

            res.json(formattedUsers);
        }
    );
});

// ========== ROTAS DE MENSAGENS (CORRESPONDÊNCIAS) ==========

// Listar conversas (últimas mensagens com cada amigo)
app.get('/api/messages/conversations', authenticateToken, (req, res) => {
    const query = `
        SELECT 
            u.id,
            u.name,
            u.avatar,
            m.content as last_message,
            m.created_at as last_message_at,
            m.is_read,
            m.from_user_id,
            (SELECT COUNT(*) FROM messages 
             WHERE to_user_id = ? AND from_user_id = u.id AND is_read = 0) as unread_count
        FROM (
            SELECT DISTINCT 
                CASE 
                    WHEN from_user_id = ? THEN to_user_id 
                    ELSE from_user_id 
                END as user_id
            FROM messages
            WHERE from_user_id = ? OR to_user_id = ?
        ) conv
        INNER JOIN users u ON u.id = conv.user_id
        LEFT JOIN messages m ON m.id = (
            SELECT id FROM messages
            WHERE (from_user_id = ? AND to_user_id = u.id) 
               OR (from_user_id = u.id AND to_user_id = ?)
            ORDER BY created_at DESC
            LIMIT 1
        )
        ORDER BY m.created_at DESC
    `;

    db.all(query, [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id], (err, conversations) => {
        if (err) {
            console.error('Erro ao buscar conversas:', err);
            return res.status(500).json({ success: false, error: 'Erro ao buscar conversas' });
        }

        const formattedConversations = conversations.map(conv => ({
            userId: conv.id,
            name: conv.name,
            avatar: conv.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.name)}&background=4F46E5&color=fff`,
            lastMessage: conv.last_message,
            lastMessageAt: conv.last_message_at,
            unreadCount: conv.unread_count || 0,
            isFromMe: conv.from_user_id === req.user.id
        }));

        res.json(formattedConversations);
    });
});

// Listar mensagens com um usuário específico
app.get('/api/messages/:userId', authenticateToken, (req, res) => {
    const userId = parseInt(req.params.userId);

    const query = `
        SELECT 
            m.*,
            u.name as sender_name,
            u.avatar as sender_avatar
        FROM messages m
        INNER JOIN users u ON u.id = m.from_user_id
        WHERE (m.from_user_id = ? AND m.to_user_id = ?) 
           OR (m.from_user_id = ? AND m.to_user_id = ?)
        ORDER BY m.created_at ASC
    `;

    db.all(query, [req.user.id, userId, userId, req.user.id], (err, messages) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Erro ao buscar mensagens' });
        }

        const formattedMessages = messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            fromUserId: msg.from_user_id,
            toUserId: msg.to_user_id,
            isRead: msg.is_read === 1,
            createdAt: msg.created_at,
            sender: {
                name: msg.sender_name,
                avatar: msg.sender_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender_name)}&background=4F46E5&color=fff`
            },
            isFromMe: msg.from_user_id === req.user.id
        }));

        // Marca mensagens como lidas
        db.run(
            'UPDATE messages SET is_read = 1 WHERE to_user_id = ? AND from_user_id = ? AND is_read = 0',
            [req.user.id, userId],
            (err) => {
                if (err) {
                    console.error('Erro ao marcar mensagens como lidas:', err);
                }
            }
        );

        res.json(formattedMessages);
    });
});

// Enviar mensagem
app.post('/api/messages', authenticateToken, (req, res) => {
    const { to_user_id, content } = req.body;

    if (!to_user_id || !content || !content.trim()) {
        return res.status(400).json({ success: false, error: 'Destinatário e conteúdo são obrigatórios' });
    }

    if (to_user_id === req.user.id) {
        return res.status(400).json({ success: false, error: 'Você não pode enviar mensagem para si mesmo' });
    }

    // Verifica se são amigos
    db.get(
        'SELECT * FROM followers WHERE follower_id = ? AND following_id = ? AND status = ?',
        [req.user.id, to_user_id, 'accepted'],
        (err, friendship) => {
            if (err) {
                return res.status(500).json({ success: false, error: 'Erro ao verificar amizade' });
            }

            if (!friendship) {
                return res.status(403).json({ success: false, error: 'Você só pode enviar mensagens para amigos' });
            }

            // Envia a mensagem
            db.run(
                'INSERT INTO messages (from_user_id, to_user_id, content) VALUES (?, ?, ?)',
                [req.user.id, to_user_id, content],
                function (err) {
                    if (err) {
                        return res.status(500).json({ success: false, error: 'Erro ao enviar mensagem' });
                    }

                    // Busca informações do remetente
                    db.get('SELECT name FROM users WHERE id = ?', [req.user.id], (err, sender) => {
                        if (!err && sender) {
                            // Cria notificação para o destinatário
                            db.run(
                                'INSERT INTO notifications (user_id, type, content, related_user_id, is_read) VALUES (?, ?, ?, ?, ?)',
                                [to_user_id, 'new_message', `${sender.name} enviou uma mensagem`, req.user.id, 0],
                                (err) => {
                                    if (err) console.error('Erro ao criar notificação:', err);
                                }
                            );
                        }

                        res.status(201).json({
                            success: true,
                            message: {
                                id: this.lastID,
                                fromUserId: req.user.id,
                                toUserId: to_user_id,
                                content: content,
                                isRead: false
                            }
                        });
                    });
                }
            );
        }
    );
});

// Marcar mensagens como lidas
app.put('/api/messages/:userId/read', authenticateToken, (req, res) => {
    const userId = parseInt(req.params.userId);

    db.run(
        'UPDATE messages SET is_read = 1 WHERE to_user_id = ? AND from_user_id = ? AND is_read = 0',
        [req.user.id, userId],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: 'Erro ao marcar mensagens como lidas' });
            }

            res.json({ success: true, message: 'Mensagens marcadas como lidas', count: this.changes });
        }
    );
});

// ========== ROTAS DE CONSELHOS ==========

// Listar conselhos do dia
app.get('/api/advices', authenticateToken, (req, res) => {
    const query = `
        SELECT * FROM advices 
        ORDER BY created_at DESC 
        LIMIT 10
    `;

    db.all(query, [], (err, advices) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Erro ao buscar conselhos' });
        }

        res.json(advices);
    });
});

// Criar conselho
app.post('/api/advices', authenticateToken, (req, res) => {
    console.log('💡 Criando conselho:', req.body);

    const { title, content, category } = req.body;

    if (!title || !content) {
        console.log('❌ Título ou conteúdo faltando');
        return res.status(400).json({ success: false, message: 'Título e conteúdo são obrigatórios' });
    }

    db.run(
        'INSERT INTO advices (title, content, category, author_id) VALUES (?, ?, ?, ?)',
        [title, content, category || 'geral', req.user.id],
        function (err) {
            if (err) {
                console.error('❌ Erro ao criar conselho:', err);
                return res.status(500).json({ success: false, message: 'Erro ao criar conselho' });
            }

            console.log('✅ Conselho criado com ID:', this.lastID);

            res.status(201).json({
                success: true,
                advice: {
                    id: this.lastID,
                    title,
                    content,
                    category: category || 'geral',
                    author_id: req.user.id,
                    created_at: new Date().toISOString()
                }
            });
        }
    );
});

// ========== ROTAS DE NOTIFICAÇÕES ==========

// Listar notificações
app.get('/api/notifications', authenticateToken, (req, res) => {
    const query = `
        SELECT * FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 20
    `;

    db.all(query, [req.user.id], (err, notifications) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Erro ao buscar notificações' });
        }

        res.json(notifications);
    });
});

// Marcar notificação como lida
app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
    const notificationId = req.params.id;

    db.run(
        'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        [notificationId, req.user.id],
        (err) => {
            if (err) {
                return res.status(500).json({ success: false, error: 'Erro ao marcar notificação' });
            }

            res.json({ success: true, message: 'Notificação marcada como lida' });
        }
    );
});

// ========== POLLING / ATUALIZAÇÕES ==========

// Endpoint para verificar atualizações
app.get('/api/updates', authenticateToken, (req, res) => {
    const lastCheck = req.query.since || new Date(0).toISOString();

    // Verifica novos likes nos posts do usuário
    const likesQuery = `
        SELECT l.*, u.name as liker_name, p.content as post_content
        FROM likes l
        INNER JOIN posts p ON l.post_id = p.id
        INNER JOIN users u ON l.user_id = u.id
        WHERE p.user_id = ? AND l.created_at > ?
        ORDER BY l.created_at DESC
    `;

    // Verifica novos comentários nos posts do usuário
    const commentsQuery = `
        SELECT c.*, u.name as commenter_name, p.content as post_content
        FROM comments c
        INNER JOIN posts p ON c.post_id = p.id
        INNER JOIN users u ON c.user_id = u.id
        WHERE p.user_id = ? AND c.user_id != ? AND c.created_at > ?
        ORDER BY c.created_at DESC
    `;

    // Verifica novas notificações
    const notificationsQuery = `
        SELECT * FROM notifications
        WHERE user_id = ? AND created_at > ? AND is_read = 0
        ORDER BY created_at DESC
    `;

    Promise.all([
        new Promise((resolve, reject) => {
            db.all(likesQuery, [req.user.id, lastCheck], (err, likes) => {
                if (err) reject(err);
                else resolve(likes);
            });
        }),
        new Promise((resolve, reject) => {
            db.all(commentsQuery, [req.user.id, req.user.id, lastCheck], (err, comments) => {
                if (err) reject(err);
                else resolve(comments);
            });
        }),
        new Promise((resolve, reject) => {
            db.all(notificationsQuery, [req.user.id, lastCheck], (err, notifications) => {
                if (err) reject(err);
                else resolve(notifications);
            });
        })
    ])
        .then(([likes, comments, notifications]) => {
            res.json({
                success: true,
                updates: {
                    likes: likes.map(l => ({
                        type: 'like',
                        postId: l.post_id,
                        user: l.liker_name,
                        timestamp: l.created_at
                    })),
                    comments: comments.map(c => ({
                        type: 'comment',
                        postId: c.post_id,
                        user: c.commenter_name,
                        content: c.content,
                        timestamp: c.created_at
                    })),
                    notifications: notifications,
                    hasUpdates: likes.length > 0 || comments.length > 0 || notifications.length > 0
                }
            });
        })
        .catch(err => {
            res.status(500).json({ success: false, error: 'Erro ao buscar atualizações' });
        });
});

// Exporta o app para o Vercel
module.exports = app;

// Inicializa servidor apenas em desenvolvimento local
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
        console.log(`📊 Banco de dados: ${DB_PATH}`);
        console.log(`🌐 CORS habilitado para: TODAS as origens`);
        console.log(`🔗 Acesso local: http://localhost:${PORT}`);
        console.log(`🔗 Modo: ${process.env.NODE_ENV || 'development'}`);
    });
}
