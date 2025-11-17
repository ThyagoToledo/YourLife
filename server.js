// ============================================
// SERVIDOR EXPRESS - REDE SOCIAL COM VERCEL POSTGRES
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { sql } = require('@vercel/postgres');

const app = express();
const PORT = process.env.PORT || 3000;

// Validação obrigatória do JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('❌ ERRO CRÍTICO: JWT_SECRET não está configurado nas variáveis de ambiente!');
    console.error('💡 Configure JWT_SECRET no Vercel Dashboard ou no arquivo .env');
    process.exit(1);
}

// Configurações do Express com CORS mais restritivo
const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['*'];

app.use(cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('.'));

console.log('✅ Servidor configurado para Vercel Postgres');

// ============================================
// INICIALIZAÇÃO DO BANCO DE DADOS
// ============================================

async function initializeDatabase() {
    try {
        console.log('🔧 Inicializando tabelas no Vercel Postgres...');

        // Criar tabela users
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                avatar TEXT,
                bio TEXT,
                cover_image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Criar tabela posts
        await sql`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;

        // Criar tabela likes
        await sql`
            CREATE TABLE IF NOT EXISTS likes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                post_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                UNIQUE(user_id, post_id)
            )
        `;

        // Criar tabela comments
        await sql`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                post_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
            )
        `;

        // Criar tabela followers (amigos)
        await sql`
            CREATE TABLE IF NOT EXISTS followers (
                id SERIAL PRIMARY KEY,
                follower_id INTEGER NOT NULL,
                following_id INTEGER NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(follower_id, following_id)
            )
        `;

        // Criar tabela user_interests
        await sql`
            CREATE TABLE IF NOT EXISTS user_interests (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                interest TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;

        // Criar tabela advices
        await sql`
            CREATE TABLE IF NOT EXISTS advices (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'geral',
                author_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;

        // Criar tabela notifications
        await sql`
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                content TEXT NOT NULL,
                related_user_id INTEGER,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;

        // Criar tabela messages
        await sql`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                from_user_id INTEGER NOT NULL,
                to_user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;

        console.log('✅ Tabelas criadas com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error);
        throw error;
    }
}

// Middleware de autenticação
function authenticateToken(req, res, next) {
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
}

// ============================================
// ROTAS DE AUTENTICAÇÃO
// ============================================

// Registro de novo usuário
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'Dados incompletos' });
        }

        // Verificar se email já existe
        const existingUser = await sql`SELECT * FROM users WHERE email = ${email}`;
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Email já cadastrado' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Gerar avatar padrão usando UI Avatars
        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=128`;

        // Inserir usuário
        const result = await sql`
            INSERT INTO users (name, email, password, avatar)
            VALUES (${name}, ${email}, ${hashedPassword}, ${defaultAvatar})
            RETURNING id, name, email, avatar, bio, created_at
        `;

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, token, user });
    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ success: false, error: 'Erro ao registrar usuário' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email e senha são obrigatórios' });
        }

        const result = await sql`SELECT * FROM users WHERE email = ${email}`;
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, error: 'Credenciais inválidas' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        const { password: _, ...userWithoutPassword } = user;

        // Gerar avatar padrão se não existir
        if (!userWithoutPassword.avatar) {
            userWithoutPassword.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff&size=128`;
        }

        res.json({ success: true, token, user: userWithoutPassword });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ success: false, error: 'Erro ao fazer login' });
    }
});

// ============================================
// ROTAS DE USUÁRIOS
// ============================================

// Buscar perfil do usuário autenticado
app.get('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const result = await sql`
            SELECT id, name, email, avatar, bio, cover_image, created_at
            FROM users
            WHERE id = ${req.user.id}
        `;

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }

        const user = result.rows[0];

        // Gerar avatar padrão se não existir
        if (!user.avatar) {
            user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff&size=128`;
        }

        // Buscar interesses do usuário
        const interestsResult = await sql`
            SELECT interest
            FROM user_interests
            WHERE user_id = ${req.user.id}
        `;

        user.interests = interestsResult.rows.map(row => row.interest);

        res.json(user);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar perfil' });
    }
});

// Buscar perfil de outro usuário
app.get('/api/users/:id', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        const result = await sql`
            SELECT id, name, email, avatar, bio, cover_image, created_at
            FROM users
            WHERE id = ${userId}
        `;

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }

        const user = result.rows[0];

        // Buscar interesses do usuário
        const interestsResult = await sql`
            SELECT interest
            FROM user_interests
            WHERE user_id = ${userId}
        `;

        user.interests = interestsResult.rows.map(row => row.interest);

        res.json(user);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar usuário' });
    }
});

// Atualizar perfil
app.put('/api/users/me', authenticateToken, async (req, res) => {
    try {
        const { name, bio, avatar, cover_image, interests } = req.body;

        await sql`
            UPDATE users
            SET name = ${name || ''},
                bio = ${bio || ''},
                avatar = ${avatar || ''},
                cover_image = ${cover_image || ''}
            WHERE id = ${req.user.id}
        `;

        // Atualizar interesses
        if (interests && Array.isArray(interests)) {
            await sql`DELETE FROM user_interests WHERE user_id = ${req.user.id}`;

            for (const interest of interests) {
                await sql`
                    INSERT INTO user_interests (user_id, interest)
                    VALUES (${req.user.id}, ${interest})
                `;
            }
        }

        const result = await sql`
            SELECT id, name, email, avatar, bio, cover_image, created_at
            FROM users
            WHERE id = ${req.user.id}
        `;

        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ success: false, error: 'Erro ao atualizar perfil' });
    }
});

// Buscar usuários
app.get('/api/users/search/:query', authenticateToken, async (req, res) => {
    try {
        const query = `%${req.params.query}%`;

        const result = await sql`
            SELECT id, name, email, avatar, bio
            FROM users
            WHERE (name ILIKE ${query} OR email ILIKE ${query})
            AND id != ${req.user.id}
            LIMIT 20
        `;

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar usuários' });
    }
});

// ============================================
// ROTAS DE FEED E POSTS
// ============================================

// Buscar feed
app.get('/api/feed', authenticateToken, async (req, res) => {
    try {
        const result = await sql`
            SELECT 
                p.*,
                u.name as user_name,
                u.avatar as user_avatar,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
                (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ${req.user.id}) as user_liked,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT 50
        `;

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar feed:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar feed' });
    }
});

// Criar post
app.post('/api/posts', authenticateToken, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ success: false, error: 'Conteúdo não pode ser vazio' });
        }

        const result = await sql`
            INSERT INTO posts (user_id, content)
            VALUES (${req.user.id}, ${content})
            RETURNING *
        `;

        const post = result.rows[0];

        const userResult = await sql`
            SELECT name, avatar FROM users WHERE id = ${req.user.id}
        `;
        const user = userResult.rows[0];

        const postWithUser = {
            ...post,
            user_name: user.name,
            user_avatar: user.avatar,
            likes_count: 0,
            user_liked: 0,
            comments_count: 0
        };

        res.json({ success: true, post: postWithUser });
    } catch (error) {
        console.error('Erro ao criar post:', error);
        res.status(500).json({ success: false, error: 'Erro ao criar post' });
    }
});

// Curtir post
app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);

        await sql`
            INSERT INTO likes (user_id, post_id)
            VALUES (${req.user.id}, ${postId})
            ON CONFLICT (user_id, post_id) DO NOTHING
        `;

        // Buscar informações do post para notificação
        const postResult = await sql`
            SELECT user_id, content FROM posts WHERE id = ${postId}
        `;
        const post = postResult.rows[0];

        // Criar notificação se não for o próprio usuário
        if (post.user_id !== req.user.id) {
            const userResult = await sql`SELECT name FROM users WHERE id = ${req.user.id}`;
            const user = userResult.rows[0];

            await sql`
                INSERT INTO notifications (user_id, type, content, related_user_id)
                VALUES (
                    ${post.user_id},
                    'like',
                    ${`${user.name} curtiu seu post`},
                    ${req.user.id}
                )
            `;
        }

        res.json({ success: true, message: 'Post curtido' });
    } catch (error) {
        console.error('Erro ao curtir post:', error);
        res.status(500).json({ success: false, error: 'Erro ao curtir post' });
    }
});

// Descurtir post
app.delete('/api/posts/:id/like', authenticateToken, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);

        await sql`
            DELETE FROM likes
            WHERE user_id = ${req.user.id} AND post_id = ${postId}
        `;

        res.json({ success: true, message: 'Like removido' });
    } catch (error) {
        console.error('Erro ao descurtir post:', error);
        res.status(500).json({ success: false, error: 'Erro ao descurtir post' });
    }
});

// Buscar comentários
app.get('/api/posts/:id/comments', authenticateToken, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);

        const result = await sql`
            SELECT 
                c.*,
                u.name as user_name,
                u.avatar as user_avatar
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ${postId}
            ORDER BY c.created_at ASC
        `;

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar comentários' });
    }
});

// Criar comentário
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const { content } = req.body;

        if (!content || content.trim() === '') {
            return res.status(400).json({ success: false, error: 'Comentário não pode ser vazio' });
        }

        const result = await sql`
            INSERT INTO comments (user_id, post_id, content)
            VALUES (${req.user.id}, ${postId}, ${content})
            RETURNING *
        `;

        const comment = result.rows[0];

        const userResult = await sql`
            SELECT name, avatar FROM users WHERE id = ${req.user.id}
        `;
        const user = userResult.rows[0];

        const commentWithUser = {
            ...comment,
            user_name: user.name,
            user_avatar: user.avatar
        };

        // Criar notificação
        const postResult = await sql`
            SELECT user_id FROM posts WHERE id = ${postId}
        `;
        const post = postResult.rows[0];

        if (post.user_id !== req.user.id) {
            await sql`
                INSERT INTO notifications (user_id, type, content, related_user_id)
                VALUES (
                    ${post.user_id},
                    'comment',
                    ${`${user.name} comentou no seu post`},
                    ${req.user.id}
                )
            `;
        }

        res.json({ success: true, comment: commentWithUser });
    } catch (error) {
        console.error('Erro ao criar comentário:', error);
        res.status(500).json({ success: false, error: 'Erro ao criar comentário' });
    }
});

// Editar comentário
app.put('/api/comments/:id', authenticateToken, async (req, res) => {
    console.log('PUT /api/comments/:id chamado');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    console.log('User:', req.user);
    
    try {
        const commentId = parseInt(req.params.id);
        const { content } = req.body;

        console.log('CommentId parseado:', commentId);
        console.log('Content:', content);

        if (!content || content.trim() === '') {
            console.log('Conteúdo vazio');
            return res.status(400).json({ success: false, error: 'Comentário não pode ser vazio' });
        }

        // Verifica se o comentário existe e pertence ao usuário
        console.log('Verificando comentário...');
        const checkResult = await sql`
            SELECT user_id FROM comments WHERE id = ${commentId}
        `;

        console.log('CheckResult:', checkResult.rows);

        if (checkResult.rows.length === 0) {
            console.log('Comentário não encontrado');
            return res.status(404).json({ success: false, error: 'Comentário não encontrado' });
        }

        if (checkResult.rows[0].user_id !== req.user.id) {
            console.log('Usuário não autorizado');
            return res.status(403).json({ success: false, error: 'Você não pode editar este comentário' });
        }

        // Atualiza o comentário
        console.log('Atualizando comentário...');
        const result = await sql`
            UPDATE comments 
            SET content = ${content}, updated_at = NOW()
            WHERE id = ${commentId}
            RETURNING *
        `;

        console.log('Resultado da atualização:', result.rows);
        res.json({ success: true, comment: result.rows[0] });
    } catch (error) {
        console.error('Erro ao editar comentário:', error);
        res.status(500).json({ success: false, error: 'Erro ao editar comentário' });
    }
});

// Excluir comentário
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);

        // Verifica se o comentário existe e pertence ao usuário
        const checkResult = await sql`
            SELECT user_id FROM comments WHERE id = ${commentId}
        `;

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Comentário não encontrado' });
        }

        if (checkResult.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Você não pode excluir este comentário' });
        }

        // Exclui o comentário
        await sql`
            DELETE FROM comments WHERE id = ${commentId}
        `;

        res.json({ success: true, message: 'Comentário excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir comentário:', error);
        res.status(500).json({ success: false, error: 'Erro ao excluir comentário' });
    }
});

// Rota alternativa para deletar comentário (compatibilidade)
app.delete('/api/posts/:postId/comments/:commentId', authenticateToken, async (req, res) => {
    try {
        const commentId = parseInt(req.params.commentId);

        // Verifica se o comentário existe e pertence ao usuário
        const checkResult = await sql`
            SELECT user_id FROM comments WHERE id = ${commentId}
        `;

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Comentário não encontrado' });
        }

        if (checkResult.rows[0].user_id !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Você não pode excluir este comentário' });
        }

        // Exclui o comentário
        await sql`
            DELETE FROM comments WHERE id = ${commentId}
        `;

        res.json({ success: true, message: 'Comentário excluído com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir comentário:', error);
        res.status(500).json({ success: false, error: 'Erro ao excluir comentário' });
    }
});

// ============================================
// ROTAS DE AMIGOS
// ============================================

// Listar amigos aceitos
app.get('/api/friends', authenticateToken, async (req, res) => {
    try {
        const result = await sql`
            SELECT 
                u.id, u.name, u.email, u.avatar, u.bio
            FROM users u
            WHERE u.id IN (
                SELECT following_id FROM followers 
                WHERE follower_id = ${req.user.id} AND status = 'accepted'
                UNION
                SELECT follower_id FROM followers 
                WHERE following_id = ${req.user.id} AND status = 'accepted'
            )
        `;

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar amigos:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar amigos' });
    }
});

// Buscar amigos de um usuário específico (para ver perfil)
app.get('/api/users/:id/friends', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        const result = await sql`
            SELECT 
                u.id, u.name, u.email, u.avatar, u.bio
            FROM users u
            WHERE u.id IN (
                SELECT following_id FROM followers 
                WHERE follower_id = ${userId} AND status = 'accepted'
                UNION
                SELECT follower_id FROM followers 
                WHERE following_id = ${userId} AND status = 'accepted'
            )
        `;

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar amigos do usuário:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar amigos' });
    }
});

// Listar pedidos de amizade recebidos
app.get('/api/friends/requests', authenticateToken, async (req, res) => {
    try {
        const result = await sql`
            SELECT 
                f.id as request_id,
                f.created_at,
                u.id, u.name, u.email, u.avatar, u.bio
            FROM followers f
            JOIN users u ON f.follower_id = u.id
            WHERE f.following_id = ${req.user.id} AND f.status = 'pending'
            ORDER BY f.created_at DESC
        `;

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar pedidos' });
    }
});

// Verificar status de amizade
app.get('/api/friends/status/:userId', authenticateToken, async (req, res) => {
    try {
        const friendId = parseInt(req.params.userId);

        const result = await sql`
            SELECT status, follower_id, following_id
            FROM followers
            WHERE (follower_id = ${req.user.id} AND following_id = ${friendId})
               OR (follower_id = ${friendId} AND following_id = ${req.user.id})
        `;

        if (result.rows.length === 0) {
            return res.json({ success: true, status: 'none' });
        }

        const relation = result.rows[0];
        res.json({
            success: true,
            status: relation.status,
            isSender: relation.follower_id === req.user.id
        });
    } catch (error) {
        console.error('Erro ao verificar status:', error);
        res.status(500).json({ success: false, error: 'Erro ao verificar status' });
    }
});

// Enviar pedido de amizade
app.post('/api/friends/request', authenticateToken, async (req, res) => {
    try {
        const { friend_id } = req.body;

        if (!friend_id) {
            return res.status(400).json({ success: false, error: 'ID do amigo não fornecido' });
        }

        // Verificar se já existe pedido
        const existing = await sql`
            SELECT * FROM followers
            WHERE (follower_id = ${req.user.id} AND following_id = ${friend_id})
               OR (follower_id = ${friend_id} AND following_id = ${req.user.id})
        `;

        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, error: 'Pedido já existe' });
        }

        await sql`
            INSERT INTO followers (follower_id, following_id, status)
            VALUES (${req.user.id}, ${friend_id}, 'pending')
        `;

        // Criar notificação
        const userResult = await sql`SELECT name FROM users WHERE id = ${req.user.id}`;
        const user = userResult.rows[0];

        await sql`
            INSERT INTO notifications (user_id, type, content, related_user_id)
            VALUES (
                ${friend_id},
                'friend_request',
                ${`${user.name} enviou um pedido de amizade`},
                ${req.user.id}
            )
        `;

        res.json({ success: true, message: 'Pedido enviado' });
    } catch (error) {
        console.error('Erro ao enviar pedido:', error);
        res.status(500).json({ success: false, error: 'Erro ao enviar pedido' });
    }
});

// Aceitar pedido de amizade
app.put('/api/friends/accept/:requesterId', authenticateToken, async (req, res) => {
    try {
        const requesterId = parseInt(req.params.requesterId);

        await sql`
            UPDATE followers
            SET status = 'accepted'
            WHERE follower_id = ${requesterId} AND following_id = ${req.user.id}
        `;

        // Criar notificação
        const userResult = await sql`SELECT name FROM users WHERE id = ${req.user.id}`;
        const user = userResult.rows[0];

        await sql`
            INSERT INTO notifications (user_id, type, content, related_user_id)
            VALUES (
                ${requesterId},
                'friend_accepted',
                ${`${user.name} aceitou seu pedido de amizade`},
                ${req.user.id}
            )
        `;

        res.json({ success: true, message: 'Pedido aceito' });
    } catch (error) {
        console.error('Erro ao aceitar pedido:', error);
        res.status(500).json({ success: false, error: 'Erro ao aceitar pedido' });
    }
});

// Recusar pedido de amizade
app.delete('/api/friends/reject/:requesterId', authenticateToken, async (req, res) => {
    try {
        const requesterId = parseInt(req.params.requesterId);

        await sql`
            DELETE FROM followers
            WHERE follower_id = ${requesterId} AND following_id = ${req.user.id}
        `;

        res.json({ success: true, message: 'Pedido recusado' });
    } catch (error) {
        console.error('Erro ao recusar pedido:', error);
        res.status(500).json({ success: false, error: 'Erro ao recusar pedido' });
    }
});

// Remover amigo
app.delete('/api/friends/:id', authenticateToken, async (req, res) => {
    try {
        const friendId = parseInt(req.params.id);

        await sql`
            DELETE FROM followers
            WHERE (follower_id = ${req.user.id} AND following_id = ${friendId})
               OR (follower_id = ${friendId} AND following_id = ${req.user.id})
        `;

        res.json({ success: true, message: 'Amigo removido' });
    } catch (error) {
        console.error('Erro ao remover amigo:', error);
        res.status(500).json({ success: false, error: 'Erro ao remover amigo' });
    }
});

// ============================================
// ROTAS DE MENSAGENS
// ============================================

// Listar conversas
app.get('/api/messages/conversations', authenticateToken, async (req, res) => {
    try {
        // Buscar todas as mensagens do usuário e agrupar por conversas
        const result = await sql`
            WITH conversation_partners AS (
                SELECT DISTINCT
                    CASE 
                        WHEN from_user_id = ${req.user.id} THEN to_user_id
                        ELSE from_user_id
                    END as partner_id
                FROM messages
                WHERE from_user_id = ${req.user.id} OR to_user_id = ${req.user.id}
            )
            SELECT 
                cp.partner_id as friend_id,
                u.name as friend_name,
                u.avatar as friend_avatar,
                (
                    SELECT content FROM messages
                    WHERE (from_user_id = cp.partner_id AND to_user_id = ${req.user.id})
                       OR (from_user_id = ${req.user.id} AND to_user_id = cp.partner_id)
                    ORDER BY created_at DESC LIMIT 1
                ) as last_message,
                (
                    SELECT COUNT(*) FROM messages
                    WHERE from_user_id = cp.partner_id 
                      AND to_user_id = ${req.user.id} 
                      AND is_read = FALSE
                ) as unread_count,
                (
                    SELECT MAX(created_at) FROM messages
                    WHERE (from_user_id = cp.partner_id AND to_user_id = ${req.user.id})
                       OR (from_user_id = ${req.user.id} AND to_user_id = cp.partner_id)
                ) as last_message_time
            FROM conversation_partners cp
            JOIN users u ON u.id = cp.partner_id
            ORDER BY last_message_time DESC
        `;

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar conversas:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar conversas' });
    }
});

// Buscar mensagens com um usuário
app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
    try {
        const otherUserId = parseInt(req.params.userId);

        const result = await sql`
            SELECT 
                m.*,
                u.name as sender_name,
                u.avatar as sender_avatar
            FROM messages m
            JOIN users u ON m.from_user_id = u.id
            WHERE (m.from_user_id = ${req.user.id} AND m.to_user_id = ${otherUserId})
               OR (m.from_user_id = ${otherUserId} AND m.to_user_id = ${req.user.id})
            ORDER BY m.created_at ASC
        `;

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar mensagens' });
    }
});

// Enviar mensagem
app.post('/api/messages', authenticateToken, async (req, res) => {
    try {
        const { to_user_id, content } = req.body;

        if (!to_user_id || !content) {
            return res.status(400).json({ success: false, error: 'Dados incompletos' });
        }

        // Verificar se são amigos
        const friendship = await sql`
            SELECT * FROM followers
            WHERE status = 'accepted'
              AND ((follower_id = ${req.user.id} AND following_id = ${to_user_id})
                OR (follower_id = ${to_user_id} AND following_id = ${req.user.id}))
        `;

        if (friendship.rows.length === 0) {
            return res.status(403).json({ success: false, error: 'Vocês não são amigos' });
        }

        const result = await sql`
            INSERT INTO messages (from_user_id, to_user_id, content)
            VALUES (${req.user.id}, ${to_user_id}, ${content})
            RETURNING *
        `;

        const message = result.rows[0];

        // Criar notificação
        const userResult = await sql`SELECT name FROM users WHERE id = ${req.user.id}`;
        const user = userResult.rows[0];

        await sql`
            INSERT INTO notifications (user_id, type, content, related_user_id)
            VALUES (
                ${to_user_id},
                'message',
                ${`${user.name} enviou uma mensagem`},
                ${req.user.id}
            )
        `;

        res.json({ success: true, message });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ success: false, error: 'Erro ao enviar mensagem' });
    }
});

// Marcar mensagens como lidas
app.put('/api/messages/:userId/read', authenticateToken, async (req, res) => {
    try {
        const otherUserId = parseInt(req.params.userId);

        await sql`
            UPDATE messages
            SET is_read = TRUE
            WHERE from_user_id = ${otherUserId} AND to_user_id = ${req.user.id}
        `;

        res.json({ success: true, message: 'Mensagens marcadas como lidas' });
    } catch (error) {
        console.error('Erro ao marcar mensagens:', error);
        res.status(500).json({ success: false, error: 'Erro ao marcar mensagens' });
    }
});

// ============================================
// ROTAS DE CONSELHOS
// ============================================

// Listar conselhos
app.get('/api/advices', authenticateToken, async (req, res) => {
    try {
        const { category } = req.query;

        let result;
        if (category && category !== 'todos') {
            result = await sql`
                SELECT a.*, u.name as author_name
                FROM advices a
                JOIN users u ON a.author_id = u.id
                WHERE a.category = ${category}
                ORDER BY a.created_at DESC
                LIMIT 20
            `;
        } else {
            result = await sql`
                SELECT a.*, u.name as author_name
                FROM advices a
                JOIN users u ON a.author_id = u.id
                ORDER BY a.created_at DESC
                LIMIT 20
            `;
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar conselhos:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar conselhos' });
    }
});

// Criar conselho
app.post('/api/advices', authenticateToken, async (req, res) => {
    try {
        const { title, content, category } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, error: 'Título e conteúdo são obrigatórios' });
        }

        const result = await sql`
            INSERT INTO advices (title, content, category, author_id)
            VALUES (${title}, ${content}, ${category || 'geral'}, ${req.user.id})
            RETURNING *
        `;

        res.json({ success: true, advice: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar conselho:', error);
        res.status(500).json({ success: false, error: 'Erro ao criar conselho' });
    }
});

// ============================================
// ROTAS DE NOTIFICAÇÕES
// ============================================

// Listar notificações
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const result = await sql`
            SELECT 
                n.*,
                u.name as related_user_name,
                u.avatar as related_user_avatar
            FROM notifications n
            LEFT JOIN users u ON n.related_user_id = u.id
            WHERE n.user_id = ${req.user.id}
            ORDER BY n.created_at DESC
            LIMIT 50
        `;

        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar notificações' });
    }
});

// Marcar notificação como lida
app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id);

        await sql`
            UPDATE notifications
            SET is_read = TRUE
            WHERE id = ${notificationId} AND user_id = ${req.user.id}
        `;

        res.json({ success: true, message: 'Notificação marcada como lida' });
    } catch (error) {
        console.error('Erro ao marcar notificação:', error);
        res.status(500).json({ success: false, error: 'Erro ao marcar notificação' });
    }
});

// ============================================
// ROTA DE ATUALIZAÇÕES (POLLING)
// ============================================

app.get('/api/updates', authenticateToken, async (req, res) => {
    try {
        const since = req.query.since || new Date(0).toISOString();

        const notifications = await sql`
            SELECT * FROM notifications
            WHERE user_id = ${req.user.id}
              AND created_at > ${since}
            ORDER BY created_at DESC
        `;

        res.json({
            success: true,
            updates: {
                notifications: notifications.rows,
                hasUpdates: notifications.rows.length > 0
            }
        });
    } catch (error) {
        console.error('Erro ao buscar atualizações:', error);
        res.status(500).json({ success: false, error: 'Erro ao buscar atualizações' });
    }
});

// ============================================
// ROTA DE HEALTH CHECK
// ============================================

app.get('/api/health', async (req, res) => {
    res.json({ status: 'ok', database: 'postgres', timestamp: new Date().toISOString() });
});

// Exporta o app para o Vercel
module.exports = app;

// Inicializa servidor e banco apenas em desenvolvimento local
if (require.main === module) {
    initializeDatabase()
        .then(() => {
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`🚀 Servidor rodando em http://0.0.0.0:${PORT}`);
                console.log(`📊 Banco de dados: Vercel Postgres`);
                console.log(`🌐 CORS habilitado para: TODAS as origens`);
                console.log(`🔗 Acesso local: http://localhost:${PORT}`);
                console.log(`🔗 Modo: ${process.env.NODE_ENV || 'development'}`);
            });
        })
        .catch((error) => {
            console.error('❌ Erro ao inicializar:', error);
            process.exit(1);
        });
}
