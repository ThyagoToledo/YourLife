// ============================================
// API SERVICE - GERENCIAMENTO DE CHAMADAS
// ============================================

console.log('📦 api.js carregado - início do arquivo');

class ApiService {
    constructor() {
        console.log('🏗️ Construtor ApiService executado');
        // Configuração para Vercel - usa a mesma origem
        // Em produção (Vercel): usa /api automaticamente
        // Em desenvolvimento: usa localhost:3000

        const isProduction = window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1';

        if (isProduction) {
            // Em produção (Vercel), o backend está na mesma origem
            this.baseUrl = `${window.location.origin}/api`;
        } else {
            // Em desenvolvimento local
            this.baseUrl = 'http://localhost:3000/api';
        }

        console.log('🔗 API Base URL:', this.baseUrl);
        console.log('🌍 Modo:', isProduction ? 'Produção (Vercel)' : 'Desenvolvimento');
        this.timeout = 10000; // 10 segundos
    }

    // Obtém o token JWT do localStorage
    getToken() {
        return localStorage.getItem('authToken');
    }

    // Define o token JWT no localStorage
    setToken(token) {
        localStorage.setItem('authToken', token);
    }

    // Remove o token JWT do localStorage
    removeToken() {
        localStorage.removeItem('authToken');
    }

    // Método genérico para fazer requisições
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = this.getToken();

        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            console.log(`📡 Requisição: ${options.method || 'GET'} ${url}`);

            const response = await fetch(url, {
                ...config,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            console.log(`📥 Resposta: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    message: 'Erro desconhecido no servidor'
                }));

                // Usa o erro do backend se disponível, senão usa mensagem genérica
                const errorMessage = error.error || error.message || `Erro HTTP ${response.status}: ${response.statusText}`;
                console.error(`❌ Erro na API:`, errorMessage, error);

                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log(`✅ Dados recebidos:`, data);
            return data;

        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('⏱️ Timeout na requisição:', url);
                throw new Error('A requisição demorou muito. Verifique sua conexão.');
            }

            if (error.message === 'Failed to fetch') {
                console.error('🔌 Erro de conexão:', url);
                throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
            }

            console.error('❌ Erro na requisição:', error);
            throw error;
        }
    }

    // ========== AUTENTICAÇÃO ==========

    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: credentials,
        });

        if (response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: userData,
        });

        if (response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    async logout() {
        try {
            await this.request('/auth/logout', {
                method: 'POST',
            });
        } finally {
            this.removeToken();
        }
    }

    async getCurrentUser() {
        return await this.request('/users/me');
    }

    // ========== USUÁRIOS ==========

    async getUser(userId) {
        return await this.request(`/users/${userId}`);
    }

    async updateProfile(profileData) {
        return await this.request(`/users/me`, {
            method: 'PUT',
            body: profileData,
        });
    }

    async searchUsers(query) {
        return await this.request(`/users/search/${encodeURIComponent(query)}`);
    }

    // ========== AMIGOS ==========

    async getFriends() {
        return await this.request(`/friends`);
    }

    async getFriendRequests() {
        return await this.request(`/friends/requests`);
    }

    async sendFriendRequest(userId) {
        return await this.request(`/friends/request`, {
            method: 'POST',
            body: { friend_id: userId },
        });
    }

    async addFriend(userId) {
        // Alias para sendFriendRequest para compatibilidade
        return await this.sendFriendRequest(userId);
    }

    async acceptFriendRequest(requesterId) {
        return await this.request(`/friends/accept/${requesterId}`, {
            method: 'PUT',
        });
    }

    async rejectFriendRequest(requesterId) {
        return await this.request(`/friends/reject/${requesterId}`, {
            method: 'DELETE',
        });
    }

    async removeFriend(userId) {
        return await this.request(`/friends/${userId}`, {
            method: 'DELETE',
        });
    }

    async getFriendshipStatus(userId) {
        return await this.request(`/friends/status/${userId}`);
    }

    // ========== MENSAGENS (CORRESPONDÊNCIAS) ==========

    async getConversations() {
        return await this.request(`/messages/conversations`);
    }

    async getMessages(userId) {
        return await this.request(`/messages/${userId}`);
    }

    async sendMessage(toUserId, content) {
        return await this.request(`/messages`, {
            method: 'POST',
            body: { to_user_id: toUserId, content },
        });
    }

    async markMessagesAsRead(userId) {
        return await this.request(`/messages/${userId}/read`, {
            method: 'PUT',
        });
    }

    // ========== FEED E POSTAGENS ==========

    async getFeed(options = {}) {
        const params = new URLSearchParams(options);
        return await this.request(`/feed?${params.toString()}`);
    }

    async getPost(postId) {
        return await this.request(`/posts/${postId}`);
    }

    async createPost(postData) {
        return await this.request('/posts', {
            method: 'POST',
            body: postData,
        });
    }

    async updatePost(postId, postData) {
        return await this.request(`/posts/${postId}`, {
            method: 'PUT',
            body: postData,
        });
    }

    async deletePost(postId) {
        return await this.request(`/posts/${postId}`, {
            method: 'DELETE',
        });
    }

    async getUserPosts(userId) {
        return await this.request(`/users/${userId}/posts`);
    }

    async getUserFriends(userId) {
        return await this.request(`/users/${userId}/friends`);
    }

    // ========== CURTIDAS ==========

    async likePost(postId) {
        return await this.request(`/posts/${postId}/like`, {
            method: 'POST',
        });
    }

    async unlikePost(postId) {
        return await this.request(`/posts/${postId}/like`, {
            method: 'DELETE',
        });
    }

    async deletePost(postId) {
        return await this.request(`/posts/${postId}`, {
            method: 'DELETE',
        });
    }

    // ========== COMENTÁRIOS ==========

    async getComments(postId) {
        return await this.request(`/posts/${postId}/comments`);
    }

    async createComment(postId, commentData) {
        return await this.request(`/posts/${postId}/comments`, {
            method: 'POST',
            body: commentData,
        });
    }

    async updateComment(commentId, commentData) {
        return await this.request(`/comments/${commentId}`, {
            method: 'PUT',
            body: commentData,
        });
    }

    async deleteComment(commentId, postId = null) {
        // Tenta ambas as rotas para compatibilidade
        try {
            if (postId) {
                return await this.request(`/posts/${postId}/comments/${commentId}`, {
                    method: 'DELETE',
                });
            } else {
                return await this.request(`/comments/${commentId}`, {
                    method: 'DELETE',
                });
            }
        } catch (error) {
            // Se falhar com uma rota, tenta a outra
            console.warn('Tentando rota alternativa para deletar comentário');
            if (postId) {
                return await this.request(`/comments/${commentId}`, {
                    method: 'DELETE',
                });
            } else {
                throw error;
            }
        }
    }

    async likeComment(postId, commentId) {
        return await this.request(`/posts/${postId}/comments/${commentId}/like`, {
            method: 'POST',
        });
    }

    // ========== CONSELHOS ==========

    async getAdvices() {
        return await this.request(`/advices`);
    }

    async createAdvice(adviceData) {
        return await this.request(`/advices`, {
            method: 'POST',
            body: adviceData,
        });
    }

    async postAdvice(adviceData) {
        // Alias para createAdvice para compatibilidade
        return await this.createAdvice(adviceData);
    }

    // ========== NOTIFICAÇÕES ==========

    async getNotifications() {
        return await this.request('/notifications');
    }

    async markNotificationAsRead(notificationId) {
        return await this.request(`/notifications/${notificationId}/read`, {
            method: 'PUT',
        });
    }

    // ========== ATUALIZAÇÕES EM TEMPO REAL ==========

    async getUpdates(since) {
        const params = since ? `?since=${encodeURIComponent(since)}` : '';
        return await this.request(`/updates${params}`);
    }
}

// Exporta uma instância única do serviço - GLOBAL para uso no navegador
var apiService = new ApiService();

// Debug: Verificar se o método existe
console.log('🔍 API Service criado');
console.log('🔍 addFriend existe?', typeof apiService.addFriend);
console.log('🔍 Métodos disponíveis:', Object.getOwnPropertyNames(Object.getPrototypeOf(apiService)).filter(m => m !== 'constructor'));

// Para uso no navegador (global) - dupla garantia
if (typeof window !== 'undefined') {
    window.apiService = apiService;
    console.log('✅ apiService exportado para window.apiService');
}

// Para uso em módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiService;
}
