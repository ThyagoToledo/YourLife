// ============================================
// APP.JS - APLICAÇÃO PRINCIPAL
// ============================================

class App {
    constructor() {
        this.api = apiService;
        this.state = stateManager;
        this.currentUserId = null;

        // Elementos DOM
        this.elements = {
            loginPage: document.getElementById('login-page'),
            mainApp: document.getElementById('main-app'),
            loginForm: document.getElementById('login-form'),

            // Navegação
            navFeed: document.getElementById('nav-feed'),
            navProfile: document.getElementById('nav-profile'),
            navFriends: document.getElementById('nav-friends'),
            navAdvice: document.getElementById('nav-advice'),

            // Views
            feedView: document.getElementById('feed-view'),
            profileView: document.getElementById('profile-view'),

            // Feed
            feedContainer: document.getElementById('feed-container'),
            newPostContent: document.getElementById('new-post-content'),
            submitPostButton: document.getElementById('submit-post-button'),

            // Perfil
            profileAvatar: document.getElementById('profile-avatar'),
            profileName: document.getElementById('profile-name'),
            profileBio: document.getElementById('profile-bio'),
            profileInterests: document.getElementById('profile-interests'),
            profilePostsContainer: document.getElementById('profile-posts-container'),

            // Header
            userMenuAvatar: document.getElementById('user-menu-avatar'),
            userMenuName: document.getElementById('user-menu-name'),
            searchInput: document.getElementById('search'),
        };
    }

    // Inicializa a aplicação
    async init() {
        this.setupEventListeners();
        this.setupFriendsTabs();
        this.initDarkMode();
        this.setupConversationsSearch();
        this.checkAuthentication();
        Toast.init();
    }

    // Configura os dropdowns de notificações e menu do usuário
    setupDropdowns() {
        // Previne configuração múltipla
        if (this.dropdownsConfigured) {
            return;
        }
        this.dropdownsConfigured = true;

        const notificationsButton = document.getElementById('notifications-button');
        const notificationsDropdown = document.getElementById('notifications-dropdown');
        const userMenuButton = document.getElementById('user-menu-button');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        const logoutButton = document.getElementById('logout-button');
        const toggleDarkMode = document.getElementById('toggle-dark-mode');

        // Dropdown do Usuário
        if (userMenuButton && userMenuDropdown) {
            userMenuButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                userMenuDropdown.classList.toggle('hidden');

                // Fecha notificações se abertas
                if (notificationsDropdown) {
                    notificationsDropdown.classList.add('hidden');
                }
            });
        }

        // Dropdown de Notificações
        if (notificationsButton && notificationsDropdown) {
            notificationsButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                notificationsDropdown.classList.toggle('hidden');

                // Fecha menu do usuário se aberto
                if (userMenuDropdown) {
                    userMenuDropdown.classList.add('hidden');
                }

                // Carrega notificações se abriu
                if (!notificationsDropdown.classList.contains('hidden')) {
                    this.loadNotificationsDropdown();
                }
            });
        }

        // Fechar dropdowns ao clicar fora (configurado apenas uma vez)
        document.addEventListener('click', (e) => {
            const clickedInsideNotifButton = notificationsButton?.contains(e.target);
            const clickedInsideNotifDropdown = notificationsDropdown?.contains(e.target);
            const clickedInsideUserButton = userMenuButton?.contains(e.target);
            const clickedInsideUserDropdown = userMenuDropdown?.contains(e.target);

            // Fecha notificações se clicou fora
            if (!clickedInsideNotifButton && !clickedInsideNotifDropdown && notificationsDropdown) {
                notificationsDropdown.classList.add('hidden');
            }

            // Fecha menu do usuário se clicou fora
            if (!clickedInsideUserButton && !clickedInsideUserDropdown && userMenuDropdown) {
                userMenuDropdown.classList.add('hidden');
            }
        });

        // Toggle dark mode
        if (toggleDarkMode) {
            toggleDarkMode.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const html = document.documentElement;
                html.classList.toggle('dark');
                const isDark = html.classList.contains('dark');
                localStorage.setItem('darkMode', isDark);
                const text = document.getElementById('dark-mode-text');
                if (text) text.textContent = isDark ? 'Tema Claro' : 'Tema Escuro';
                Toast.success(isDark ? 'Tema escuro ativado' : 'Tema claro ativado');
            });
        }

        // Logout
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleLogout();
            });
        }
    }

    // Inicializa o modo escuro
    initDarkMode() {
        const html = document.documentElement;

        // Carrega preferência salva
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            html.classList.add('dark');
        }
    }

    // Faz logout
    handleLogout() {
        this.api.removeToken();
        this.currentUserId = null;
        this.state.clear();
        this.showLoginPage();
        Toast.success('Logout realizado com sucesso!');
    }

    // Configura as tabs de Amigos/Pedidos
    setupFriendsTabs() {
        const friendsTab = document.getElementById('friends-tab');
        const requestsTab = document.getElementById('requests-tab');
        const friendsContent = document.getElementById('friends-content');
        const requestsContent = document.getElementById('requests-content');

        if (friendsTab && requestsTab) {
            friendsTab.addEventListener('click', () => {
                friendsTab.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
                requestsTab.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
                requestsTab.classList.add('text-gray-600');

                friendsContent.classList.remove('hidden');
                requestsContent.classList.add('hidden');

                this.loadFriends();
            });

            requestsTab.addEventListener('click', () => {
                requestsTab.classList.add('text-blue-600', 'border-b-2', 'border-blue-600');
                friendsTab.classList.remove('text-blue-600', 'border-b-2', 'border-blue-600');
                friendsTab.classList.add('text-gray-600');

                requestsContent.classList.remove('hidden');
                friendsContent.classList.add('hidden');

                this.loadFriendRequests();
            });
        }
    }

    // Configura event listeners
    setupEventListeners() {
        // Inicializa dark mode do localStorage
        this.initDarkMode();

        // Login
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Dropdowns
        this.setupDropdowns();

        // Registro - Modal
        const showRegisterBtn = document.getElementById('show-register-modal');
        const showRegisterBtn2 = document.getElementById('show-register');
        const closeRegisterBtn = document.getElementById('close-register-modal');
        const backToLoginBtn = document.getElementById('back-to-login');
        const registerModal = document.getElementById('register-modal');
        const registerForm = document.getElementById('register-form');

        if (showRegisterBtn && registerModal) {
            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                registerModal.classList.remove('hidden');
            });
        }

        if (showRegisterBtn2 && registerModal) {
            showRegisterBtn2.addEventListener('click', (e) => {
                e.preventDefault();
                registerModal.classList.remove('hidden');
            });
        }

        if (closeRegisterBtn && registerModal) {
            closeRegisterBtn.addEventListener('click', () => {
                registerModal.classList.add('hidden');
            });
        }

        if (backToLoginBtn && registerModal) {
            backToLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                registerModal.classList.add('hidden');
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Fechar modal ao clicar fora
        if (registerModal) {
            registerModal.addEventListener('click', (e) => {
                if (e.target === registerModal) {
                    registerModal.classList.add('hidden');
                }
            });
        }

        // Modal de Termos e Privacidade
        const navTermsBtn = document.getElementById('nav-terms');
        const termsModal = document.getElementById('terms-modal');
        const closeTermsModalBtn = document.getElementById('close-terms-modal');
        const closeTermsBtn = document.getElementById('close-terms-btn');

        if (navTermsBtn && termsModal) {
            navTermsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                termsModal.classList.remove('hidden');
            });
        }

        if (closeTermsModalBtn && termsModal) {
            closeTermsModalBtn.addEventListener('click', () => {
                termsModal.classList.add('hidden');
            });
        }

        if (closeTermsBtn && termsModal) {
            closeTermsBtn.addEventListener('click', () => {
                termsModal.classList.add('hidden');
            });
        }

        // Fechar modal de termos ao clicar fora
        if (termsModal) {
            termsModal.addEventListener('click', (e) => {
                if (e.target === termsModal) {
                    termsModal.classList.add('hidden');
                }
            });
        }

        // Navegação
        if (this.elements.navFeed) {
            this.elements.navFeed.addEventListener('click', (e) => {
                e.preventDefault();
                this.showView('feed-view');
            });
        }

        if (this.elements.navProfile) {
            this.elements.navProfile.addEventListener('click', (e) => {
                e.preventDefault();
                this.showView('profile-view');
                this.loadProfile(this.currentUserId);
            });
        }

        if (this.elements.navFriends) {
            this.elements.navFriends.addEventListener('click', (e) => {
                e.preventDefault();
                this.showView('friends-view');
                this.loadFriends();
                this.loadFriendRequests(); // Atualiza o badge de pedidos
            });
        }

        if (this.elements.navAdvice) {
            this.elements.navAdvice.addEventListener('click', (e) => {
                e.preventDefault();
                this.showView('advice-view');
                this.loadAdvices();
            });
        }

        // Mensagens
        const navMessages = document.getElementById('nav-messages');
        if (navMessages) {
            navMessages.addEventListener('click', (e) => {
                e.preventDefault();
                this.showView('messages-view');
                this.loadConversations();
            });
        }

        // Botão de nova conversa
        const newConversationBtn = document.getElementById('new-conversation-btn');
        if (newConversationBtn) {
            newConversationBtn.addEventListener('click', () => {
                this.showNewConversationModal();
            });
        }

        // Nova postagem
        if (this.elements.submitPostButton) {
            this.elements.submitPostButton.addEventListener('click', () => {
                this.handleCreatePost();
            });
        }

        // Busca com debounce
        if (this.elements.searchInput) {
            const debouncedSearch = debounce((query) => this.handleSearch(query), 500);
            this.elements.searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K para focar na busca
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.elements.searchInput?.focus();
            }
        });
    }

    // Inicializa Dark Mode
    initDarkMode() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }

    // Toggle Dark Mode
    toggleDarkMode() {
        const html = document.documentElement;
        const isDark = html.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);

        const text = document.getElementById('dark-mode-text');
        if (text) {
            text.textContent = isDark ? 'Tema Claro' : 'Tema Escuro';
        }

        Toast.success(isDark ? 'Tema escuro ativado' : 'Tema claro ativado');
    }

    // REMOVIDO: Método setupDropdowns() duplicado
    // A definição principal está no início da classe

    // Carrega notificações no dropdown
    async loadNotificationsDropdown() {
        try {
            const notifications = await this.api.getNotifications();
            const container = document.getElementById('notifications-list');

            if (!container) return;

            if (!notifications || notifications.length === 0) {
                container.innerHTML = `
                    <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                        <svg class="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                        </svg>
                        <p>Nenhuma notificação</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = notifications.map(notif => {
                const iconMap = {
                    'friend_request': '',
                    'friend_accepted': '',
                    'new_message': '',
                    'like': '<3',
                    'comment': '[...]'
                };
                const icon = iconMap[notif.type] || '(!)';

                return `
                    <div class="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${notif.is_read ? 'opacity-60' : ''}">
                        <div class="flex items-start gap-3">
                            <span class="text-2xl">${icon}</span>
                            <div class="flex-1">
                                <p class="text-sm text-gray-800 dark:text-white">${notif.content}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${DateUtils.formatTimestamp(notif.created_at)}</p>
                            </div>
                            ${!notif.is_read ? '<span class="w-2 h-2 bg-blue-500 rounded-full"></span>' : ''}
                        </div>
                    </div>
                `;
            }).join('');

            // Atualiza badge
            const unreadCount = notifications.filter(n => !n.is_read).length;
            const badge = document.getElementById('notification-badge-header');
            if (badge) {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        }
    }

    // Logout
    async handleLogout() {
        try {
            await this.api.logout();
            Toast.success('Até logo!');
            this.stopPolling();
            this.showLoginPage();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            // Mesmo com erro, deslogar localmente
            this.api.removeToken();
            this.showLoginPage();
        }
    }

    // Verifica se o usuário está autenticado
    async checkAuthentication() {
        const token = this.api.getToken();

        if (!token) {
            this.showLoginPage();
            return;
        }

        try {
            Loading.show('Verificando autenticação...');
            const user = await this.api.getCurrentUser();
            this.currentUserId = user.id;
            this.state.setCurrentUser(user);
            this.showMainApp();
            await this.loadInitialData();
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            Toast.error('Sessão expirada. Faça login novamente.');
            this.showLoginPage();
        } finally {
            Loading.hide();
        }
    }

    // Mostra a página de login
    showLoginPage() {
        DOMUtils.show(this.elements.loginPage);
        DOMUtils.hide(this.elements.mainApp);
    }

    // Mostra a aplicação principal
    showMainApp() {
        DOMUtils.hide(this.elements.loginPage);
        DOMUtils.show(this.elements.mainApp);

        // Atualiza informações do usuário no dropdown
        const user = this.state.getState().currentUser;
        if (user) {
            const dropdownName = document.getElementById('dropdown-user-name');
            const dropdownEmail = document.getElementById('dropdown-user-email');

            if (dropdownName) dropdownName.textContent = user.name;
            if (dropdownEmail) dropdownEmail.textContent = user.email;
        }

        // Configura dropdowns após o DOM estar visível
        setTimeout(() => {
            this.setupDropdowns();
        }, 100);
    }

    // Handle registro
    async handleRegister(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        const validation = Validation.validateRegisterForm(name, email, password, confirmPassword);

        if (!validation.isValid) {
            Object.values(validation.errors).forEach(error => {
                Toast.error(error);
            });
            return;
        }

        try {
            Loading.show('Criando conta...');

            const response = await this.api.register({ name, email, password });

            if (response && response.user) {
                this.currentUserId = response.user.id;
                this.state.setCurrentUser(response.user);

                // Fecha o modal
                const registerModal = document.getElementById('register-modal');
                if (registerModal) {
                    registerModal.classList.add('hidden');
                }

                // Limpa o formulário
                e.target.reset();

                this.showMainApp();
                await this.loadInitialData();
                Toast.success('Conta criada com sucesso! Bem-vindo!');
            } else {
                throw new Error('Resposta inválida do servidor');
            }

        } catch (error) {
            console.error('Erro ao registrar:', error);
            Toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
        } finally {
            Loading.hide();
        }
    }

    // Handle login
    async handleLogin(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        const validation = Validation.validateLoginForm(email, password);

        if (!validation.isValid) {
            Object.values(validation.errors).forEach(error => {
                Toast.error(error);
            });
            return;
        }

        try {
            Loading.show('Entrando...');

            const response = await this.api.login({ email, password });

            if (!response) {
                console.error('❌ Resposta vazia');
                throw new Error('Nenhuma resposta do servidor');
            }

            if (!response.success) {
                console.error('❌ Login não bem-sucedido:', response.message);
                throw new Error(response.message || 'Credenciais inválidas');
            }

            if (!response.user) {
                console.error('❌ Usuário não retornado na resposta');
                throw new Error('Dados do usuário não encontrados');
            }

            if (!response.token) {
                console.error('❌ Token não retornado na resposta');
                throw new Error('Token de autenticação não encontrado');
            }

            this.currentUserId = response.user.id;
            this.state.setCurrentUser(response.user);
            this.showMainApp();
            await this.loadInitialData();
            Toast.success('Login realizado com sucesso!');
            
            // Mostrar aviso sobre Termos e Privacidade temporariamente
            setTimeout(() => {
                Toast.info('Ao usar o YourLife, você concorda com nossos Termos de Uso e Política de Privacidade', 5000);
            }, 1000);

        } catch (error) {
            console.error('❌ Erro ao fazer login:', error);

            let errorMessage = 'Erro ao fazer login';

            if (error.message.includes('conectar')) {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
            } else if (error.message.includes('Credenciais inválidas')) {
                errorMessage = 'Email ou senha incorretos. Crie uma conta se ainda não tiver!';
            } else {
                errorMessage = error.message || 'Erro desconhecido. Tente novamente.';
            }

            Toast.error(errorMessage);

            // Garante que não entre na aplicação
            this.showLoginPage();
            this.api.removeToken();
        } finally {
            Loading.hide();
        }
    }

    // Carrega dados iniciais
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadFeed(),
                this.loadNotifications(),
            ]);

            // Inicia polling de atualizações
            this.startPolling();

            // Atualiza UI com dados do usuário
            const user = this.state.getState().currentUser;
            if (user) {
                if (this.elements.userMenuAvatar) {
                    // Usa avatar do usuário ou gera um padrão
                    const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff&size=128`;
                    this.elements.userMenuAvatar.src = avatarUrl;
                }
                if (this.elements.userMenuName) {
                    this.elements.userMenuName.textContent = user.name;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            Toast.error('Erro ao carregar dados');
        }
    }

    // Carrega o feed
    async loadFeed() {
        try {
            // Carrega lista de amigos primeiro
            let friends = [];
            try {
                friends = await this.api.getFriends();
                this.state.setState({ friends });
            } catch (err) {
                console.error('[ERRO] Erro ao carregar amigos:', err);
            }

            const feed = await this.api.getFeed();

            if (!Array.isArray(feed)) {
                console.error('[ERRO] Feed não é um array:', feed);
                throw new Error('Formato de dados inválido recebido do servidor');
            }

            // Normaliza formato dos posts e carrega comentários
            const normalizedFeed = [];
            for (const post of feed) {
                // Normalizar estrutura do post
                const normalizedPost = {
                    id: post.id,
                    content: post.content,
                    created_at: post.created_at,
                    author: {
                        id: post.user_id,
                        name: post.user_name,
                        avatar: post.user_avatar
                    },
                    likes: parseInt(post.likes_count) || 0,
                    isLiked: parseInt(post.user_liked) > 0,
                    commentsCount: parseInt(post.comments_count) || 0,
                    comments: []
                };

                // Carregar comentários
                try {
                    const comments = await this.api.getComments(post.id);
                    // Normalizar comentários
                    normalizedPost.comments = (comments || []).map(comment => ({
                        id: comment.id,
                        content: comment.content,
                        created_at: comment.created_at,
                        author: {
                            id: comment.user_id,
                            name: comment.user_name,
                            avatar: comment.user_avatar
                        }
                    }));
                } catch (err) {
                    console.error(`[ERRO] Erro ao carregar comentários do post ${post.id}:`, err);
                }

                normalizedFeed.push(normalizedPost);
            }

            this.state.setFeed(normalizedFeed);
            this.renderFeed();
        } catch (error) {
            console.error('Erro ao carregar feed:', error.message);

            if (error.message.includes('conectar')) {
                Toast.error('Não foi possível conectar ao servidor');
            } else if (error.message.includes('401') || error.message.includes('não autenticado')) {
                Toast.error('Sessão expirada. Faça login novamente.');
                this.logout();
            } else {
                Toast.warning('Nenhuma postagem ainda. Seja o primeiro a postar!');
            }

            this.state.setFeed([]);
            this.renderFeed();
        }
    }

    // Renderiza o feed
    renderFeed() {
        const state = this.state.getState();
        const feed = state.feed;
        const friends = state.friends || [];

        if (!this.elements.feedContainer) return;

        this.elements.feedContainer.innerHTML = '';

        if (feed.length === 0) {
            this.elements.feedContainer.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <p class="text-lg">Nenhuma postagem ainda.</p>
                    <p class="text-sm mt-2">Seja o primeiro a postar!</p>
                </div>
            `;
            return;
        }

        feed.forEach(post => {
            const postElement = this.createPostElement(post, friends);
            this.elements.feedContainer.appendChild(postElement);
        });
    }

    // Renderiza o botão de ação no post (adicionar amigo, amigos, deletar, etc)
    renderPostActionButton(author, friendsList = null) {
        // Se for o próprio usuário, mostra botão de deletar
        if (author.id === this.currentUserId) {
            return `
                <button class="delete-post-button text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors text-sm font-medium" 
                        data-post-id="${this.currentPostId || ''}"
                        title="Deletar post">
                    Deletar
                </button>
            `;
        }

        // Verifica se já são amigos
        const friends = friendsList || this.state.getState().friends || [];
        const isFriend = friends.some(f => f.id === author.id);

        if (isFriend) {
            return `
                <button class="friend-button bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm" 
                        data-user-id="${author.id}"
                        title="Clique para desfazer amizade">
                    Amigos
                </button>
            `;
        } else {
            return `
                <button class="add-friend-button bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 text-sm" 
                        data-user-id="${author.id}">
                    + Adicionar
                </button>
            `;
        }
    }

    // Cria elemento de post
    createPostElement(post, friendsList = null) {
        const div = document.createElement('div');
        div.className = 'p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md';
        div.dataset.postId = post.id;

        const timestamp = DateUtils.formatRelativeTime(post.created_at);
        const currentUserId = this.state.getState().currentUser?.id;
        
        const commentsHTML = (post.comments || []).map(comment => {
            const isOwnComment = comment.author.id === currentUserId;
            return `
                <div class="mt-2 flex items-start gap-2 group" data-comment-id="${comment.id}">
                    <img src="${comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=4F46E5&color=fff`}" 
                         alt="${comment.author.name}" 
                         class="w-8 h-8 rounded-full flex-shrink-0">
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex-1">
                                <span class="font-semibold text-gray-800 dark:text-gray-200 text-sm">${Validation.sanitizeHTML(comment.author.name)}</span>
                                <p class="text-gray-700 dark:text-gray-300 text-sm comment-content-text">${Validation.sanitizeHTML(comment.content)}</p>
                                <span class="text-xs text-gray-400 dark:text-gray-500">${DateUtils.formatRelativeTime(comment.created_at)}</span>
                            </div>
                            ${isOwnComment ? `
                                <div class="flex items-center gap-1 opacity-50 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button onclick="app.editComment(${post.id}, ${comment.id})" 
                                            class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" 
                                            title="Editar comentário">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button onclick="app.deleteComment(${post.id}, ${comment.id})" 
                                            class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" 
                                            title="Excluir comentário">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const authorAvatar = post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=4F46E5&color=fff&size=128`;

        div.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img class="w-10 h-10 rounded-full" src="${authorAvatar}" alt="${post.author.name}">
                    <div>
                        <p class="font-semibold text-gray-800 dark:text-white">${Validation.sanitizeHTML(post.author.name)}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${timestamp}</p>
                    </div>
                </div>
                ${this.renderPostActionButton(post.author, friendsList)}
            </div>
            
            <p class="mt-4 text-gray-700 dark:text-gray-300">${Validation.sanitizeHTML(post.content)}</p>
            
            <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex space-x-6">
                    <button class="like-button flex items-center space-x-1 ${post.isLiked ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'} hover:text-blue-600 transition-colors" data-post-id="${post.id}">
                        <svg class="w-5 h-5" fill="${post.isLiked ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20v-8m0 0V7c0-1.1.9-2 2-2h2a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3.382a1 1 0 01.894 1.447l-2.276 4.553A2 2 0 0116.236 18H9a2 2 0 01-2-2z"/>
                        </svg>
                        <span>Curtir</span>
                        <span class="text-sm like-count">(${post.likes})</span>
                    </button>
                    <button class="comment-toggle flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        <span>Comentar</span>
                    </button>
                    <button class="advice-button flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-green-600 transition-colors" data-post-id="${post.id}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        <span>Dar Conselho</span>
                    </button>
                </div>
            </div>
            
            <div class="comments-section mt-4 space-y-2">
                ${commentsHTML}
            </div>
            
            <div class="comment-input-container mt-4 space-x-2" style="display: none;">
                <div class="flex space-x-2">
                    <img class="w-8 h-8 rounded-full" src="${this.state.getState().currentUser?.avatar}" alt="Seu Avatar">
                    <input type="text" class="comment-input w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Escreva um comentário..." data-post-id="${post.id}">
                    <button class="submit-comment px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 text-sm font-medium" data-post-id="${post.id}">
                        Enviar
                    </button>
                </div>
            </div>
        `;

        // Event listeners para o post
        this.attachPostEventListeners(div, post);

        return div;
    }

    // Anexa event listeners ao post
    attachPostEventListeners(element, post) {
        // Deletar post
        const deleteButton = element.querySelector('.delete-post-button');
        if (deleteButton) {
            deleteButton.addEventListener('click', async () => {
                if (confirm('Tem certeza que deseja deletar este post? Esta ação não pode ser desfeita.')) {
                    try {
                        await this.api.deletePost(post.id);
                        element.remove();
                        Toast.success('Post deletado com sucesso');
                    } catch (error) {
                        console.error('Erro ao deletar post:', error);
                        Toast.error('Erro ao deletar post');
                    }
                }
            });
        }

        // Desfazer amizade
        const friendButton = element.querySelector('.friend-button');
        if (friendButton) {
            friendButton.addEventListener('click', async () => {
                const userId = parseInt(friendButton.dataset.userId);
                if (confirm('Deseja realmente desfazer a amizade?')) {
                    try {
                        await this.api.removeFriend(userId);
                        Toast.success('Amizade desfeita');
                        // Recarrega o feed para atualizar os botões
                        await this.loadFeed();
                    } catch (error) {
                        console.error('[ERRO] Erro ao desfazer amizade:', error);
                        Toast.error('Erro ao desfazer amizade');
                    }
                }
            });
        }

        // Adicionar amigo
        const addFriendButton = element.querySelector('.add-friend-button');
        if (addFriendButton) {
            addFriendButton.addEventListener('click', async () => {
                const userId = parseInt(addFriendButton.dataset.userId);
                try {
                    await this.sendFriendRequest(userId);

                    // Atualiza o botão
                    addFriendButton.textContent = 'Pedido enviado';
                    addFriendButton.disabled = true;
                    addFriendButton.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                    addFriendButton.classList.add('bg-gray-400', 'cursor-not-allowed');
                } catch (error) {
                    console.error('[ERRO] Erro ao enviar pedido:', error);
                    Toast.error('Erro ao enviar pedido de amizade');
                }
            });
        }

        // Curtir
        const likeButton = element.querySelector('.like-button');
        if (likeButton) {
            likeButton.addEventListener('click', () => this.handleLikePost(post.id));
        }

        // Toggle comentários
        const commentToggle = element.querySelector('.comment-toggle');
        const commentInputContainer = element.querySelector('.comment-input-container');
        if (commentToggle && commentInputContainer) {
            commentToggle.addEventListener('click', () => {
                DOMUtils.toggle(commentInputContainer);
                const input = commentInputContainer.querySelector('.comment-input');
                if (input) input.focus();
            });
        }

        // Enviar comentário
        const submitComment = element.querySelector('.submit-comment');
        const commentInput = element.querySelector('.comment-input');
        if (submitComment && commentInput) {
            submitComment.addEventListener('click', () => {
                this.handleCreateComment(post.id, commentInput.value);
                commentInput.value = '';
            });

            commentInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleCreateComment(post.id, commentInput.value);
                    commentInput.value = '';
                }
            });
        }

        // Conselho
        const adviceButton = element.querySelector('.advice-button');
        if (adviceButton) {
            adviceButton.addEventListener('click', () => this.handleAdvice(post.id));
        }
    }

    // Handle criar post
    async handleCreatePost() {
        const content = this.elements.newPostContent?.value?.trim();

        if (!content) {
            Toast.warning('Digite algo antes de postar');
            return;
        }

        try {
            Loading.show('Criando postagem...');

            // MODO REAL - Backend ativo
            const response = await this.api.createPost({ content });

            if (response && response.post) {
                // Normalizar formato do post para compatibilidade com o feed
                const normalizedPost = {
                    id: response.post.id,
                    content: response.post.content,
                    created_at: response.post.created_at,
                    author: {
                        id: response.post.user_id,
                        name: response.post.user_name,
                        avatar: response.post.user_avatar
                    },
                    likes: response.post.likes_count || 0,
                    isLiked: response.post.user_liked > 0,
                    commentsCount: response.post.comments_count || 0,
                    comments: []
                };

                this.state.addPost(normalizedPost);
                this.elements.newPostContent.value = '';
                this.renderFeed();
                Toast.success('Postagem criada com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao criar post:', error);
            Toast.error('Erro ao criar postagem');
        } finally {
            Loading.hide();
        }
    }

    // Handle curtir post
    async handleLikePost(postId) {
        try {
            const post = this.state.getState().feed.find(p => p.id === postId);
            if (!post) return;

            const wasLiked = post.isLiked;

            // Atualiza UI imediatamente (optimistic update)
            this.state.toggleLike(postId);

            const postElement = document.querySelector(`[data-post-id="${postId}"]`);
            if (postElement) {
                const likeButton = postElement.querySelector('.like-button');
                const likeCount = postElement.querySelector('.like-count');
                const svg = likeButton?.querySelector('svg');

                if (wasLiked) {
                    likeButton?.classList.remove('text-blue-600');
                    likeButton?.classList.add('text-gray-600');
                    if (svg) svg.setAttribute('fill', 'none');
                } else {
                    likeButton?.classList.remove('text-gray-600');
                    likeButton?.classList.add('text-blue-600');
                    if (svg) svg.setAttribute('fill', 'currentColor');
                }

                if (likeCount) {
                    const newCount = wasLiked ? post.likes - 1 : post.likes + 1;
                    likeCount.textContent = `(${newCount})`;
                }
            }

            // MODO REAL - Chama API
            if (wasLiked) {
                await this.api.unlikePost(postId);
            } else {
                await this.api.likePost(postId);
            }

        } catch (error) {
            console.error('Erro ao curtir post:', error);
            // Reverte em caso de erro
            this.state.toggleLike(postId);
            Toast.error('Erro ao curtir postagem');
        }
    }

    // Handle criar comentário
    async handleCreateComment(postId, content) {
        if (!content || !content.trim()) {
            Toast.warning('Digite algo antes de comentar');
            return;
        }

        try {
            // MODO REAL - Backend ativo
            const response = await this.api.createComment(postId, { content });

            if (response && response.comment) {
                // Normalizar comentário
                const normalizedComment = {
                    id: response.comment.id,
                    content: response.comment.content,
                    created_at: response.comment.created_at,
                    author: {
                        id: response.comment.user_id,
                        name: response.comment.user_name,
                        avatar: response.comment.user_avatar
                    }
                };

                this.state.addComment(postId, normalizedComment);

                const postElement = document.querySelector(`[data-post-id="${postId}"]`);
                if (postElement) {
                    const commentsSection = postElement.querySelector('.comments-section');
                    if (commentsSection) {
                        const currentUserId = this.state.getState().currentUser?.id;
                        const isOwnComment = normalizedComment.author.id === currentUserId;
                        
                        const commentHTML = `
                            <div class="mt-2 flex items-start gap-2 group" data-comment-id="${normalizedComment.id}">
                                <img src="${normalizedComment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(normalizedComment.author.name)}&background=4F46E5&color=fff`}" 
                                     alt="${normalizedComment.author.name}" 
                                     class="w-8 h-8 rounded-full flex-shrink-0">
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-start justify-between gap-2">
                                        <div class="flex-1">
                                            <span class="font-semibold text-gray-800 dark:text-gray-200 text-sm">${Validation.sanitizeHTML(normalizedComment.author.name)}</span>
                                            <p class="text-gray-700 dark:text-gray-300 text-sm comment-content-text">${Validation.sanitizeHTML(normalizedComment.content)}</p>
                                            <span class="text-xs text-gray-400 dark:text-gray-500">Agora</span>
                                        </div>
                                        ${isOwnComment ? `
                                            <div class="flex items-center gap-1 opacity-50 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button onclick="app.editComment(${postId}, ${normalizedComment.id})" 
                                                        class="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" 
                                                        title="Editar comentário">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                    </svg>
                                                </button>
                                                <button onclick="app.deleteComment(${postId}, ${normalizedComment.id})" 
                                                        class="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" 
                                                        title="Excluir comentário">
                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                    </svg>
                                                </button>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                        commentsSection.insertAdjacentHTML('beforeend', commentHTML);
                    }
                }

                Toast.success('Comentário adicionado!');
            }
        } catch (error) {
            console.error('Erro ao criar comentário:', error);
            Toast.error('Erro ao comentar');
        }
    }

    // Editar comentário
    async editComment(postId, commentId) {
        try {
            console.log('editComment chamado:', { postId, commentId });
            
            const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
            if (!commentElement) {
                console.error('Elemento do comentário não encontrado');
                return;
            }

            const contentText = commentElement.querySelector('.comment-content-text');
            const currentContent = contentText.textContent;

            console.log('Conteúdo atual:', currentContent);

            // Criar input de edição
            const editHTML = `
                <div class="edit-comment-form mt-2">
                    <textarea class="w-full px-3 py-2 text-sm border border-blue-500 dark:border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none" 
                              rows="2">${currentContent}</textarea>
                    <div class="flex gap-2 mt-2">
                        <button onclick="app.saveEditComment(${postId}, ${commentId})" 
                                class="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Salvar
                        </button>
                        <button onclick="app.cancelEditComment(${commentId})" 
                                class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white">
                            Cancelar
                        </button>
                    </div>
                </div>
            `;

            // Esconde o conteúdo original e mostra o formulário de edição
            contentText.style.display = 'none';
            const container = contentText.parentElement;
            container.insertAdjacentHTML('beforeend', editHTML);
            
            console.log('Formulário de edição criado');
            
            // Focus no textarea
            const textarea = container.querySelector('textarea');
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);

        } catch (error) {
            console.error('Erro ao editar comentário:', error);
            Toast.error('Erro ao editar comentário');
        }
    }

    // Salvar edição de comentário
    async saveEditComment(postId, commentId) {
        try {
            console.log('saveEditComment chamado:', { postId, commentId });
            
            const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
            if (!commentElement) {
                console.error('Elemento do comentário não encontrado');
                Toast.error('Elemento do comentário não encontrado');
                return;
            }

            const textarea = commentElement.querySelector('textarea');
            if (!textarea) {
                console.error('Textarea não encontrado');
                Toast.error('Textarea não encontrado');
                return;
            }

            const newContent = textarea.value.trim();
            console.log('Novo conteúdo:', newContent);

            if (!newContent) {
                Toast.warning('O comentário não pode estar vazio');
                return;
            }

            Loading.show('Salvando alterações...');

            // Chama a API para atualizar o comentário
            console.log('Chamando API updateComment...');
            const response = await this.api.updateComment(commentId, { content: newContent });
            console.log('Resposta da API:', response);

            // Atualiza o conteúdo no DOM
            const contentText = commentElement.querySelector('.comment-content-text');
            contentText.textContent = newContent;
            contentText.style.display = '';

            // Remove o formulário de edição
            const editForm = commentElement.querySelector('.edit-comment-form');
            if (editForm) editForm.remove();

            Toast.success('Comentário atualizado!');

        } catch (error) {
            console.error('Erro completo ao salvar comentário:', error);
            Toast.error(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
        } finally {
            Loading.hide();
        }
    }

    // Cancelar edição de comentário
    cancelEditComment(commentId) {
        const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (!commentElement) return;

        const contentText = commentElement.querySelector('.comment-content-text');
        contentText.style.display = '';

        const editForm = commentElement.querySelector('.edit-comment-form');
        if (editForm) editForm.remove();
    }

    // Excluir comentário
    async deleteComment(postId, commentId) {
        console.log('Tentando excluir comentário:', { postId, commentId });
        
        if (!confirm('Tem certeza que deseja excluir este comentário?')) {
            return;
        }

        try {
            Loading.show('Excluindo comentário...');

            // Chama a API para excluir o comentário (passa postId para compatibilidade)
            const result = await this.api.deleteComment(commentId, postId);
            console.log('Resultado da exclusão:', result);

            // Remove o comentário do DOM
            const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
            if (commentElement) {
                commentElement.style.opacity = '0';
                commentElement.style.transition = 'opacity 0.3s';
                setTimeout(() => commentElement.remove(), 300);
            }

            // Atualiza o contador de comentários
            const postElement = document.querySelector(`[data-post-id="${postId}"]`);
            if (postElement) {
                const commentCount = postElement.querySelector('.comment-toggle span');
                if (commentCount) {
                    const currentCount = parseInt(commentCount.textContent) || 0;
                    if (currentCount > 0) {
                        commentCount.textContent = currentCount - 1;
                    }
                }
            }

            Toast.success('Comentário excluído!');

        } catch (error) {
            console.error('Erro completo ao excluir comentário:', error);
            const errorMsg = error.message || error.error || 'Tente novamente';
            Toast.error('Erro ao excluir: ' + errorMsg);
        } finally {
            Loading.hide();
        }
    }

    // Handle dar conselho
    async handleAdvice(postId) {
        // Criar modal para dar conselho
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold dark:text-white">💡 Dar Conselho</h3>
                    <button id="close-advice-modal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-all" title="Voltar">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <form id="advice-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título do Conselho</label>
                        <input type="text" id="advice-title" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" placeholder="Ex: Como lidar com..." required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoria</label>
                        <select id="advice-category" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                            <option value="geral">Geral</option>
                            <option value="saude">Saúde Mental</option>
                            <option value="relacionamento">Relacionamento</option>
                            <option value="carreira">Carreira</option>
                            <option value="estudos">Estudos</option>
                            <option value="familia">Família</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seu Conselho</label>
                        <textarea id="advice-content" rows="5" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white" placeholder="Compartilhe sua sabedoria..." required></textarea>
                    </div>
                    <div class="flex gap-3">
                        <button type="button" id="cancel-advice" class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium inline-flex items-center justify-center gap-2 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                            </svg>
                            Cancelar
                        </button>
                        <button type="submit" class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
                            Publicar Conselho
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        const closeBtn = modal.querySelector('#close-advice-modal');
        const cancelBtn = modal.querySelector('#cancel-advice');
        const form = modal.querySelector('#advice-form');

        const closeModal = () => modal.remove();

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = modal.querySelector('#advice-title').value.trim();
            const content = modal.querySelector('#advice-content').value.trim();
            const category = modal.querySelector('#advice-category').value;

            if (!title || !content) {
                Toast.warning('Preencha todos os campos');
                return;
            }

            try {
                Loading.show('Publicando conselho...');
                await this.api.createAdvice({ title, content, category });
                Toast.success('Conselho publicado com sucesso!');
                closeModal();

                // Se estiver na view de conselhos, recarrega
                if (this.state.getState().currentView === 'advices-view') {
                    await this.loadAdvices();
                }
            } catch (error) {
                console.error('Erro ao publicar conselho:', error);
                Toast.error('Erro ao publicar conselho');
            } finally {
                Loading.hide();
            }
        });
    }

    // Handle busca
    async handleSearch(query) {
        if (!query || query.length < 2) {
            this.state.clearSearchResults();
            return;
        }

        try {
            // Busca funcionalidade em desenvolvimento
        } catch (error) {
            console.error('Erro na busca:', error);
        }
    }

    // Carrega notificações
    async loadNotifications() {
        try {
            const notifications = await this.api.getNotifications();

            if (!Array.isArray(notifications)) {
                console.error('Notificações não são um array:', notifications);
                throw new Error('Formato de dados inválido');
            }

            this.state.setNotifications(notifications || []);
            this.renderNotifications();

        } catch (error) {
            console.error('Erro ao carregar notificações:', error.message);
            this.state.setNotifications([]);
            this.renderNotifications();
        }
    }

    // Renderiza notificações
    renderNotifications() {
        const notifications = this.state.getState().notifications || [];
        const container = document.getElementById('notifications-list');
        const badge = document.getElementById('notifications-badge');

        if (!container) return;

        // Atualiza badge
        const unreadCount = notifications.filter(n => !n.is_read).length;
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }

        // Se não houver notificações
        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                    <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <p>Nenhuma notificação</p>
                </div>
            `;
            return;
        }

        // Mapeamento de ícones
        const iconMap = {
            'friend_request': '',
            'friend_accepted': '',
            'new_message': '',
            'like': '<3',
            'comment': '[...]'
        };

        // Renderiza notificações
        container.innerHTML = notifications.map(notif => {
            const icon = iconMap[notif.type] || '(!)';
            const unreadClass = notif.is_read ? 'opacity-60' : '';

            return `
                <div class="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${unreadClass}">
                    <div class="flex items-start gap-3">
                        <span class="text-lg font-mono text-blue-600 dark:text-blue-400 mt-1">${icon}</span>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm text-gray-800 dark:text-gray-200">${Validation.sanitizeHTML(notif.content)}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${DateUtils.formatTimestamp(notif.created_at)}</p>
                        </div>
                        ${!notif.is_read ? '<span class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Renderiza notificações
    renderNotifications() {
        const notifications = this.state.getState().notifications || [];
        const container = document.getElementById('notifications-list');

        if (!container) return;

        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                    <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                    </svg>
                    <p>Nenhuma notificação</p>
                </div>
            `;
            return;
        }

        container.innerHTML = notifications.map(notif => {
            const iconMap = {
                'friend_request': '',
                'friend_accepted': '',
                'new_message': '',
                'like': '<3',
                'comment': '[...]'
            };
            const icon = iconMap[notif.type] || '(!)';

            return `
                <div class="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${notif.is_read ? 'opacity-60' : ''}">
                    <div class="flex items-start gap-3">
                        <span class="text-lg flex-shrink-0">${icon}</span>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm text-gray-800 dark:text-white break-words">${Validation.sanitizeHTML(notif.content)}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${DateUtils.formatTimestamp(notif.created_at)}</p>
                        </div>
                        ${!notif.is_read ? '<span class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>' : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Atualiza badge
        const notifBadge = document.getElementById('notifications-badge');
        const unreadCount = notifications.filter(n => !n.is_read).length;

        if (notifBadge) {
            if (unreadCount > 0) {
                notifBadge.textContent = unreadCount;
                notifBadge.classList.remove('hidden');
            } else {
                notifBadge.classList.add('hidden');
            }
        }
    }

    // Carrega perfil
    async loadProfile(userId) {
        try {
            Loading.show('Carregando perfil...');

            let user = this.state.getState().currentUser;

            // Se não tem usuário ou não tem perfil, busca da API
            if (!user || !user.profile) {
                try {
                    user = await this.api.getCurrentUser();
                    this.state.setCurrentUser(user);
                } catch (err) {
                    console.error('Erro ao buscar dados do usuário:', err);
                    throw new Error('Não foi possível carregar os dados do perfil');
                }
            }

            if (!user) {
                console.error('Usuário não encontrado no estado');
                throw new Error('Usuário não autenticado');
            }

            // Se ainda não tem perfil, cria um padrão
            if (!user.profile) {
                user.profile = {
                    name: user.name,
                    avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`,
                    bio: user.bio || 'Olá! Sou novo por aqui.',
                    interests: ['Tecnologia', 'Redes Sociais', 'Inovação']
                };
            }

            // Atualizar avatar
            if (this.elements.profileAvatar) {
                this.elements.profileAvatar.src = user.avatar || user.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`;
            }

            // Atualizar nome
            if (this.elements.profileName) {
                this.elements.profileName.textContent = user.name || user.profile?.name || 'Sem nome';
            }

            // Atualizar bio
            if (this.elements.profileBio) {
                this.elements.profileBio.textContent = user.bio || user.profile?.bio || 'Sem biografia';
            }

            // Atualizar capa
            const profileCoverImg = document.getElementById('profile-cover-img');
            if (profileCoverImg) {
                profileCoverImg.src = user.cover_image || 'https://placehold.co/1000x300/E0E7FF/4F46E5?text=Capa';
            }

            // Atualizar interesses
            if (this.elements.profileInterests) {
                const interests = user.interests || user.profile?.interests || [];
                if (interests.length === 0) {
                    this.elements.profileInterests.innerHTML = '<p class="text-gray-500 dark:text-gray-400 text-sm">Nenhum interesse adicionado</p>';
                } else {
                    this.elements.profileInterests.innerHTML = interests
                        .map(interest => `
                            <span class="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
                                ${Validation.sanitizeHTML(interest)}
                            </span>
                        `)
                        .join('');
                }
            }

            // Calcular e atualizar estatísticas
            const feed = this.state.getState().feed;
            const userPosts = feed.filter(post => post.author.id === user.id);

            // Buscar amigos
            let friendsCount = 0;
            try {
                const friends = await this.api.getFriends();
                friendsCount = friends.length;
            } catch (err) {
                console.error('Erro ao buscar amigos:', err);
            }

            // Calcular total de curtidas recebidas
            const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);

            // Atualizar contadores
            const postsCountEl = document.getElementById('profile-posts-count');
            const friendsCountEl = document.getElementById('profile-friends-count');
            const likesCountEl = document.getElementById('profile-likes-count');

            if (postsCountEl) postsCountEl.textContent = userPosts.length;
            if (friendsCountEl) friendsCountEl.textContent = friendsCount;
            if (likesCountEl) likesCountEl.textContent = totalLikes;

            if (this.elements.profilePostsContainer) {
                this.elements.profilePostsContainer.innerHTML = '';

                if (userPosts.length === 0) {
                    this.elements.profilePostsContainer.innerHTML = `
                        <div class="text-center py-12">
                            <p class="text-gray-500 dark:text-gray-400">Você ainda não fez nenhuma postagem</p>
                        </div>
                    `;
                } else {
                    userPosts.forEach(post => {
                        const postElement = this.createPostElement(post);
                        this.elements.profilePostsContainer.appendChild(postElement);
                    });
                }
            }

            // Configura as abas do perfil
            this.setupProfileTabs(user);

        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            Toast.error(`Erro ao carregar perfil: ${error.message}`);
        } finally {
            Loading.hide();
        }
    }

    setupProfileTabs(user) {
        const tabs = document.querySelectorAll('.profile-tab');
        const contents = document.querySelectorAll('.profile-tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', async (e) => {
                e.preventDefault();
                const tabName = tab.dataset.tab;

                // Atualiza visual das abas
                tabs.forEach(t => {
                    t.classList.remove('text-blue-600', 'border-blue-600');
                    t.classList.add('text-gray-500', 'border-transparent');
                });
                tab.classList.remove('text-gray-500', 'border-transparent');
                tab.classList.add('text-blue-600', 'border-blue-600');

                // Esconde todos os conteúdos
                contents.forEach(c => c.classList.add('hidden'));

                // Mostra o conteúdo correto
                const content = document.getElementById(`profile-${tabName}-content`);
                if (content) {
                    content.classList.remove('hidden');

                    // Carrega o conteúdo específico
                    if (tabName === 'posts') {
                        await this.loadProfilePosts(user);
                    } else if (tabName === 'friends') {
                        await this.loadProfileFriends(user);
                    } else if (tabName === 'advices') {
                        await this.loadProfileAdvices(user);
                    }
                }
            });
        });
    }

    async loadProfilePosts(user) {
        const container = document.getElementById('profile-posts-container');
        if (!container) return;

        try {
            const feed = this.state.getState().feed;
            const userPosts = feed.filter(post => post.author.id === user.id);

            if (userPosts.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                        </svg>
                        <p class="text-gray-500 dark:text-gray-400">Você ainda não fez nenhuma postagem</p>
                    </div>
                `;
            } else {
                container.innerHTML = '';
                userPosts.forEach(post => {
                    const postElement = this.createPostElement(post);
                    container.appendChild(postElement);
                });
            }
        } catch (error) {
            console.error('Erro ao carregar posts do perfil:', error);
            container.innerHTML = '<p class="text-red-500 text-center py-8">Erro ao carregar postagens</p>';
        }
    }

    async loadProfileFriends(user) {
        const container = document.getElementById('profile-friends-list');
        if (!container) return;

        try {
            Loading.show('Carregando amigos...');
            const friends = await this.api.getFriends();

            if (friends.length === 0) {
                container.innerHTML = `
                    <div class="col-span-2 text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                        <p class="text-gray-500 dark:text-gray-400">Você ainda não tem amigos</p>
                        <button onclick="app.showView('friends-view'); app.loadFriends();" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Encontrar Amigos
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = friends.map(friend => `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-4">
                        <img class="w-12 h-12 rounded-full" src="${friend.avatar}" alt="${friend.name}">
                        <div class="flex-1">
                            <p class="font-semibold text-gray-800 dark:text-white">${Validation.sanitizeHTML(friend.name)}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${friend.mutualFriends || 0} amigos em comum</p>
                        </div>
                        <button onclick="app.showView('messages-view'); app.openChat(${friend.id});" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            Mensagem
                        </button>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Erro ao carregar amigos:', error);
            container.innerHTML = '<p class="text-red-500 text-center py-8">Erro ao carregar amigos</p>';
        } finally {
            Loading.hide();
        }
    }

    async loadProfileAdvices(user) {
        const container = document.getElementById('profile-advices-list');
        if (!container) return;

        try {
            Loading.show('Carregando conselhos...');
            const advices = await this.api.getAdvices();
            const userAdvices = advices.filter(advice => advice.author_id === user.id);

            if (userAdvices.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        <p class="text-gray-500 dark:text-gray-400">Você ainda não deu nenhum conselho</p>
                        <button onclick="app.showView('advice-view'); app.loadAdvices();" class="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            Dar Conselho
                        </button>
                    </div>
                `;
            } else {
                container.innerHTML = userAdvices.map(advice => `
                    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">${Validation.sanitizeHTML(advice.title)}</h3>
                                <p class="text-gray-700 dark:text-gray-300 mb-4">${Validation.sanitizeHTML(advice.content)}</p>
                                <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                    <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                                        ${Validation.sanitizeHTML(advice.category)}
                                    </span>
                                    <span>${DateUtils.formatTimestamp(advice.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Erro ao carregar conselhos:', error);
            container.innerHTML = '<p class="text-red-500 text-center py-8">Erro ao carregar conselhos</p>';
        } finally {
            Loading.hide();
        }
    }

    // Mostra visualização
    showView(viewId) {
        const views = document.querySelectorAll('.view');
        views.forEach(view => {
            if (view.id === viewId) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        const navLinks = [
            this.elements.navFeed,
            this.elements.navProfile,
            this.elements.navFriends,
            this.elements.navAdvice,
        ];

        navLinks.forEach(link => {
            if (link) {
                link.classList.remove('bg-blue-600', 'text-white');
                link.classList.add('text-gray-700', 'hover:bg-gray-100');
            }
        });

        if (viewId === 'feed-view' && this.elements.navFeed) {
            this.elements.navFeed.classList.add('bg-blue-600', 'text-white');
            this.elements.navFeed.classList.remove('text-gray-700', 'hover:bg-gray-100');
        } else if (viewId === 'profile-view' && this.elements.navProfile) {
            this.elements.navProfile.classList.add('bg-blue-600', 'text-white');
            this.elements.navProfile.classList.remove('text-gray-700', 'hover:bg-gray-100');
        }

        this.state.setCurrentView(viewId.replace('-view', ''));
    }

    // Logout
    async logout() {
        try {
            await this.api.logout();
            this.state.reset();
            this.stopPolling();
            this.showLoginPage();
            Toast.success('Logout realizado com sucesso!');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            Toast.error('Erro ao fazer logout');
        }
    }

    // ========== EDITAR PERFIL ==========

    async showEditProfile() {
        try {
            const user = await this.api.getCurrentUser();

            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Editar Perfil</h2>
                        <button id="close-edit-modal" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-all" title="Voltar">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <form id="edit-profile-form" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome</label>
                            <input type="text" name="name" value="${user.name || ''}" 
                                   class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500" required>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                            <textarea name="bio" rows="3" 
                                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                      placeholder="Conte um pouco sobre você...">${user.bio || ''}</textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL do Avatar</label>
                            <input type="url" name="avatar" value="${user.avatar || ''}" 
                                   class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="https://...">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL da Imagem de Capa</label>
                            <input type="url" name="cover_image" value="${user.cover_image || ''}" 
                                   class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="https://...">
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Interesses (separados por vírgula)</label>
                            <input type="text" name="interests" value="${user.interests?.join(', ') || user.profile?.interests?.join(', ') || ''}" 
                                   class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                                   placeholder="Tecnologia, Música, Esportes">
                        </div>

                        <div class="flex gap-3 pt-4">
                            <button type="submit" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                                Salvar Alterações
                            </button>
                            <button type="button" id="cancel-edit" class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors inline-flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                </svg>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.body.appendChild(modal);

            const form = modal.querySelector('#edit-profile-form');
            const closeBtn = modal.querySelector('#close-edit-modal');
            const cancelBtn = modal.querySelector('#cancel-edit');

            const closeModal = () => modal.remove();

            closeBtn.addEventListener('click', closeModal);
            cancelBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                Loading.show('Salvando alterações...');

                try {
                    const formData = new FormData(form);
                    const interests = formData.get('interests')
                        .split(',')
                        .map(i => i.trim())
                        .filter(i => i);

                    await this.api.updateProfile({
                        name: formData.get('name'),
                        bio: formData.get('bio'),
                        avatar: formData.get('avatar') || null,
                        cover_image: formData.get('cover_image') || null,
                        interests: interests
                    });

                    Toast.success('Perfil atualizado com sucesso!');
                    closeModal();

                    // Recarrega o usuário atual da API
                    const updatedUser = await this.api.getCurrentUser();
                    this.state.setCurrentUser(updatedUser);

                    // Recarrega o perfil
                    this.loadProfile(this.currentUserId);
                } catch (error) {
                    console.error('Erro ao atualizar perfil:', error);
                    Toast.error('Erro ao atualizar perfil');
                } finally {
                    Loading.hide();
                }
            });
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            Toast.error('Erro ao carregar dados do perfil');
        }
    }

    // ========== AMIGOS ==========

    async showAddFriendModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Adicionar Amigo</h2>
                    <button id="close-friend-modal" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-all" title="Voltar">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <div class="mb-4">
                    <input type="text" id="friend-search" placeholder="Buscar usuários..." 
                           class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500">
                </div>

                <div id="friend-search-results" class="space-y-2 max-h-96 overflow-y-auto">
                    <p class="text-gray-500 dark:text-gray-400 text-center py-8">Digite para buscar usuários</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const searchInput = modal.querySelector('#friend-search');
        const results = modal.querySelector('#friend-search-results');
        const closeBtn = modal.querySelector('#close-friend-modal');

        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        const debouncedSearch = debounce(async (query) => {
            if (!query.trim()) {
                results.innerHTML = '<p class="text-gray-500 text-center py-8">Digite para buscar usuários</p>';
                return;
            }

            try {
                const users = await this.api.searchUsers(query);
                const friends = this.state.getState().friends || [];

                if (users.length === 0) {
                    results.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum usuário encontrado</p>';
                    return;
                }

                results.innerHTML = users.map(user => {
                    const isFriend = friends.some(f => f.id === user.id);
                    const isCurrentUser = user.id === this.currentUserId;

                    let button = '';
                    if (isCurrentUser) {
                        button = '<span class="text-sm text-gray-500 dark:text-gray-400">Você</span>';
                    } else if (isFriend) {
                        button = `
                            <button class="friend-btn bg-green-600 text-white px-4 py-1 rounded-lg hover:bg-green-700 text-sm"
                                    data-user-id="${user.id}">
                                Amigos
                            </button>
                        `;
                    } else {
                        button = `
                            <button class="add-friend-btn bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 text-sm"
                                    data-user-id="${user.id}">
                                + Adicionar
                            </button>
                        `;
                    }

                    return `
                        <div class="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                            <div class="flex items-center gap-3">
                                <img src="${user.avatar}" alt="${user.name}" class="w-10 h-10 rounded-full">
                                <div>
                                    <div class="font-semibold dark:text-white">${user.name}</div>
                                </div>
                            </div>
                            ${button}
                        </div>
                    `;
                }).join('');

                // Event listeners para botões de desfazer amizade
                results.querySelectorAll('.friend-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const userId = parseInt(btn.dataset.userId);
                        if (confirm('Deseja realmente desfazer a amizade?')) {
                            try {
                                await this.api.removeFriend(userId);
                                Toast.success('Amizade desfeita');
                                // Atualiza o estado e recarrega a busca
                                const updatedFriends = friends.filter(f => f.id !== userId);
                                this.state.setState({ friends: updatedFriends });
                                // Re-executa a busca
                                debouncedSearch(searchInput.value);
                            } catch (error) {
                                console.error('[ERRO] Erro ao desfazer amizade:', error);
                                Toast.error('Erro ao desfazer amizade');
                            }
                        }
                    });
                });

                // Event listeners para botões de adicionar
                results.querySelectorAll('.add-friend-btn').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const userId = parseInt(btn.dataset.userId);
                        try {
                            await this.api.addFriend(userId);
                            Toast.success('Pedido de amizade enviado!');
                            btn.textContent = '[OK] Pedido enviado';
                            btn.disabled = true;
                            btn.classList.add('bg-gray-400');
                        } catch (error) {
                            console.error('[ERRO] Erro ao adicionar amigo:', error);

                            // Mensagens de erro mais amigáveis
                            const errorText = error.message || '';

                            if (errorText.includes('Pedido já enviado')) {
                                btn.textContent = 'Pedido enviado';
                                btn.disabled = true;
                                btn.classList.add('bg-gray-400');
                                Toast.info('Pedido já foi enviado anteriormente');
                            } else if (errorText.includes('não pode adicionar a si mesmo')) {
                                btn.textContent = 'Você';
                                btn.disabled = true;
                                btn.classList.add('bg-gray-400');
                                Toast.warning('Você não pode adicionar a si mesmo como amigo');
                            } else if (errorText.includes('já são amigos')) {
                                btn.textContent = 'Amigos';
                                btn.disabled = true;
                                btn.classList.add('bg-gray-400');
                                Toast.info('Vocês já são amigos');
                            } else {
                                Toast.error('Erro ao enviar pedido de amizade');
                            }
                        }
                    });
                });
            } catch (error) {
                results.innerHTML = '<p class="text-red-500 text-center py-8">Erro ao buscar usuários</p>';
            }
        }, 500);

        searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
    }

    async loadFriends() {
        try {
            const friends = await this.api.getFriends();
            const container = document.getElementById('friends-container');

            if (!container) {
                console.error('Container de amigos não encontrado');
                return;
            }

            if (!Array.isArray(friends)) {
                console.error('Lista de amigos não é um array:', friends);
                throw new Error('Formato de dados inválido');
            }

            if (friends.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <p class="text-gray-500 dark:text-gray-400">Você ainda não tem amigos</p>
                        <button onclick="app.showAddFriendModal()" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            Adicionar Amigos
                        </button>
                    </div>
                `;
                return;
            }

            container.innerHTML = friends.map(friend => `
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <img src="${friend.avatar}" alt="${friend.name}" class="w-12 h-12 rounded-full">
                        <div>
                            <div class="font-semibold dark:text-white">${friend.name}</div>
                            ${friend.isMutual ? '<span class="text-xs text-green-600 dark:text-green-400">Amizade mútua</span>' : ''}
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="app.viewUserProfile(${friend.id})" 
                                class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                            Ver Perfil
                        </button>
                        <button onclick="app.removeFriend(${friend.id})" 
                                class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                            Remover
                        </button>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Erro ao carregar amigos:', error.message);

            const container = document.getElementById('friends-container');
            if (container) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <p class="text-red-500 dark:text-red-400">❌ Erro ao carregar amigos</p>
                        <p class="text-gray-500 dark:text-gray-400 text-sm mt-2">${error.message}</p>
                        <button onclick="app.loadFriends()" class="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                            Tentar Novamente
                        </button>
                    </div>
                `;
            }

            Toast.error(`Erro ao carregar amigos: ${error.message}`);
        }
    }

    async removeFriend(friendId) {
        if (!confirm('Tem certeza que deseja remover este amigo?')) return;

        try {
            await this.api.removeFriend(friendId);
            Toast.success('Amigo removido');
            this.loadFriends();
        } catch (error) {
            Toast.error('Erro ao remover amigo');
        }
    }

    async viewUserProfile(userId) {
        try {
            Loading.show('Carregando perfil...');
            const user = await this.api.getUser(userId);

            // Buscar estatísticas do usuário (posts e amigos)
            let postsCount = 0;
            let friendsCount = 0;
            
            try {
                // Busca posts do usuário
                const userPosts = await this.api.getUserPosts(userId);
                postsCount = Array.isArray(userPosts) ? userPosts.length : 0;
            } catch (err) {
                console.error('Erro ao buscar posts do usuário:', err);
            }

            try {
                // Busca amigos do usuário
                const userFriends = await this.api.getUserFriends(userId);
                friendsCount = Array.isArray(userFriends) ? userFriends.length : 0;
            } catch (err) {
                console.error('Erro ao buscar amigos do usuário:', err);
            }

            // Verificar status de amizade
            let friendshipStatus = 'none';
            try {
                const status = await this.api.getFriendshipStatus(userId);
                friendshipStatus = status.status || 'none';
            } catch (err) {
                console.error('Erro ao verificar status de amizade:', err);
            }

            // Check if viewing own profile
            const currentUser = this.state.getState().currentUser;
            const isOwnProfile = parseInt(userId) === currentUser.id;

            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Perfil de ${user.name}</h2>
                        <button id="close-profile-modal" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-all" title="Voltar">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <div class="flex items-center gap-6 mb-6">
                        <img src="${user.avatar}" alt="${user.name}" class="w-24 h-24 rounded-full">
                        <div class="flex-1">
                            <h3 class="text-xl font-bold dark:text-white">${user.name}</h3>
                            <p class="text-gray-600 dark:text-gray-400">${user.profile?.bio || 'Sem bio'}</p>
                            <div class="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <span><strong>${postsCount}</strong> posts</span>
                                <span><strong>${friendsCount}</strong> amigos</span>
                            </div>
                        </div>
                    </div>

                    ${user.profile?.interests?.length ? `
                        <div class="mb-4">
                            <h4 class="font-semibold dark:text-white mb-2">Interesses</h4>
                            <div class="flex flex-wrap gap-2">
                                ${user.profile.interests.map(i => `
                                    <span class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm">${i}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${!isOwnProfile ? `
                        <div class="flex gap-3 mt-6">
                            ${friendshipStatus === 'accepted' ? `
                                <button id="message-btn" class="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                    Mensagem
                                </button>
                                <button id="friends-btn" class="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold" title="Clique para desfazer amizade">
                                    ✓ Amigos
                                </button>
                            ` : friendshipStatus === 'pending' ? `
                                <button id="pending-friend-btn" class="flex-1 bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed" disabled>
                                    ⏳ Solicitação Pendente
                                </button>
                            ` : `
                                <button id="add-friend-btn" class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">
                                    + Adicionar Amigo
                                </button>
                            `}
                        </div>
                    ` : ''}
                </div>
            `;

            document.body.appendChild(modal);

            const closeBtn = modal.querySelector('#close-profile-modal');
            closeBtn.addEventListener('click', () => modal.remove());
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });

            const addBtn = modal.querySelector('#add-friend-btn');
            const friendsBtn = modal.querySelector('#friends-btn');
            const messageBtn = modal.querySelector('#message-btn');

            if (messageBtn) {
                messageBtn.addEventListener('click', async () => {
                    modal.remove();
                    // Navega para a view de mensagens
                    this.showView('messages-view');
                    // Abre o chat com o usuário
                    await this.openChat(parseInt(userId));
                    Toast.success('Conversa aberta!');
                });
            }

            if (addBtn) {
                addBtn.addEventListener('click', async () => {
                    try {
                        await this.api.addFriend(userId);
                        Toast.success('Amigo adicionado!');
                        modal.remove();
                        // Reload friends list if viewing from profile
                        if (this.state.getState().currentView === 'profile') {
                            await this.loadFriends();
                        }
                    } catch (error) {
                        console.error('Erro ao adicionar amigo:', error);
                        Toast.error('Erro ao adicionar amigo');
                    }
                });
            }

            if (friendsBtn) {
                friendsBtn.addEventListener('click', async () => {
                    // Confirmação antes de desfazer amizade
                    const confirmRemove = confirm('Deseja realmente desfazer a amizade?');
                    if (!confirmRemove) return;

                    try {
                        await this.api.removeFriend(userId);
                        Toast.success('Amizade desfeita');
                        modal.remove();
                        // Reload friends list if viewing from profile
                        if (this.state.getState().currentView === 'profile') {
                            await this.loadFriends();
                        }
                    } catch (error) {
                        console.error('Erro ao remover amigo:', error);
                        Toast.error('Erro ao desfazer amizade');
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            Toast.error('Erro ao carregar perfil do usuário');
        } finally {
            Loading.hide();
        }
    }

    // ========== ATUALIZAÇÕES EM TEMPO REAL ==========

    startPolling() {
        this.lastUpdateCheck = new Date().toISOString();

        this.pollingInterval = setInterval(async () => {
            try {
                const updates = await this.api.getUpdates(this.lastUpdateCheck);

                if (updates.updates.hasUpdates) {
                    // Atualiza likes
                    if (updates.updates.likes.length > 0) {
                        updates.updates.likes.forEach(like => {
                            Toast.info(`${like.user} curtiu seu post!`, 5000);
                        });
                        this.loadFeed(); // Recarrega feed
                    }

                    // Atualiza comentários
                    if (updates.updates.comments.length > 0) {
                        updates.updates.comments.forEach(comment => {
                            Toast.info(`${comment.user} comentou seu post!`, 5000);
                        });
                        this.loadFeed(); // Recarrega feed
                    }

                    // Notificações
                    if (updates.updates.notifications.length > 0) {
                        const notifBadge = document.getElementById('notification-badge');
                        if (notifBadge) {
                            notifBadge.textContent = updates.updates.notifications.length;
                            notifBadge.classList.remove('hidden');
                        }
                    }

                    this.lastUpdateCheck = new Date().toISOString();
                }
            } catch (error) {
                console.error('Erro ao verificar atualizações:', error);
            }
        }, 10000); // Verifica a cada 10 segundos
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    // ========== CONSELHOS ==========

    async loadAdvices() {
        try {
            const advices = await this.api.getAdvices();
            const container = document.getElementById('advices-container');

            if (!container) return;

            if (advices.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum conselho disponível</p>';
                return;
            }

            container.innerHTML = advices.map(advice => `
                <div class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                    <h3 class="font-bold text-lg mb-2 dark:text-white">${advice.title}</h3>
                    <p class="text-gray-700 dark:text-gray-300 mb-3">${advice.content}</p>
                    <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">${advice.category}</span>
                        <span>${DateUtils.formatTimestamp(advice.created_at)}</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Erro ao carregar conselhos:', error);
            Toast.error('Erro ao carregar conselhos');
        }
    }

    async showCreateAdviceModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Criar Conselho</h2>
                    <button id="close-advice-modal" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-all" title="Voltar">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <form id="create-advice-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Título</label>
                        <input type="text" name="title" required
                               class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conselho</label>
                        <textarea name="content" rows="4" required
                                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categoria</label>
                        <select name="category" class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="geral">Geral</option>
                            <option value="saude">Saúde</option>
                            <option value="carreira">Carreira</option>
                            <option value="relacionamentos">Relacionamentos</option>
                            <option value="estudos">Estudos</option>
                        </select>
                    </div>

                    <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        Publicar Conselho
                    </button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const form = modal.querySelector('#create-advice-form');
        const closeBtn = modal.querySelector('#close-advice-modal');

        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);

            try {
                await this.api.createAdvice({
                    title: formData.get('title'),
                    content: formData.get('content'),
                    category: formData.get('category')
                });

                Toast.success('Conselho publicado!');
                modal.remove();
                this.loadAdvices();
            } catch (error) {
                Toast.error('Erro ao publicar conselho');
            }
        });
    }

    // ========== MENSAGENS (CORRESPONDÊNCIAS) ==========

    async loadMessages() {
        const navMessages = document.getElementById('nav-messages');
        if (navMessages) {
            navMessages.addEventListener('click', async (e) => {
                e.preventDefault();
                this.showView('messages-view');
                await this.loadConversations();
            });
        }
    }

    async loadConversations() {
        try {
            const conversations = await this.api.getConversations();
            const container = document.getElementById('conversations-list');

            if (!conversations || conversations.length === 0) {
                container.innerHTML = `
                    <div class="p-8 text-center text-gray-500 dark:text-gray-400">
                        <div class="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <svg class="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                        </div>
                        <p class="font-medium mb-2">Nenhuma conversa ainda</p>
                        <p class="text-sm">Adicione amigos e comece a conversar!</p>
                    </div>
                `;
                return;
            }

            let totalUnread = 0;
            // Normalizar dados do backend
            const normalizedConversations = conversations.map(conv => ({
                userId: conv.friend_id,
                name: conv.friend_name,
                avatar: conv.friend_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.friend_name)}&background=4F46E5&color=fff`,
                lastMessage: conv.last_message,
                lastMessageAt: conv.last_message_time,
                unreadCount: parseInt(conv.unread_count) || 0,
                isFromMe: false // Pode ser ajustado se necessário
            }));

            container.innerHTML = normalizedConversations.map(conv => {
                totalUnread += conv.unreadCount;
                const isUnread = conv.unreadCount > 0;
                return `
                    <div class="conversation-item p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${isUnread ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20' : ''}" 
                         data-user-id="${conv.userId}">
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <img src="${conv.avatar}" alt="${conv.name}" class="w-14 h-14 rounded-full object-cover">
                                <span class="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-start mb-1">
                                    <h3 class="font-semibold text-gray-900 dark:text-white truncate ${isUnread ? 'font-bold' : ''}">${conv.name}</h3>
                                    <span class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">${DateUtils.formatTimestamp(conv.lastMessageAt)}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <p class="text-sm text-gray-600 dark:text-gray-400 truncate ${isUnread ? 'font-medium' : ''}">
                                        ${conv.isFromMe ? '<span class="text-blue-600 dark:text-blue-400">Você:</span> ' : ''}${conv.lastMessage || 'Sem mensagens'}
                                    </p>
                                    ${isUnread ?
                        `<span class="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full ml-2">${conv.unreadCount}</span>`
                        : ''}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Atualiza badge de mensagens não lidas
            const messagesBadge = document.getElementById('messages-badge');
            if (messagesBadge) {
                if (totalUnread > 0) {
                    messagesBadge.textContent = totalUnread;
                    messagesBadge.classList.remove('hidden');
                } else {
                    messagesBadge.classList.add('hidden');
                }
            }

            // Event listeners para as conversas
            container.querySelectorAll('.conversation-item').forEach(item => {
                item.addEventListener('click', () => {
                    // Remove active de todos os itens
                    container.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
                    // Adiciona active ao item clicado
                    item.classList.add('active');
                    
                    const userId = parseInt(item.dataset.userId);
                    this.openChat(userId);
                });
            });
        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
            Toast.error('Erro ao carregar conversas');
        }
    }

    setupConversationsSearch() {
        const searchInput = document.getElementById('search-conversations');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const conversations = document.querySelectorAll('.conversation-item');

            conversations.forEach(conv => {
                const name = conv.querySelector('h3').textContent.toLowerCase();
                const message = conv.querySelector('p').textContent.toLowerCase();
                
                if (name.includes(query) || message.includes(query)) {
                    conv.style.display = '';
                } else {
                    conv.style.display = 'none';
                }
            });
        });
    }

    async showNewConversationModal() {
        try {
            // Busca a lista de amigos
            const friends = await this.api.getFriends();
            
            if (!friends || friends.length === 0) {
                Toast.info('Você ainda não tem amigos. Adicione amigos primeiro!');
                return;
            }

            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Nova Conversa</h2>
                        <button id="close-new-conversation-modal" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-2 transition-all" title="Fechar">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <div class="mb-4">
                        <input type="text" id="search-friends-modal" placeholder="Buscar amigo..." 
                               class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>

                    <div id="friends-list-modal" class="space-y-2 max-h-96 overflow-y-auto">
                        ${friends.map(friend => `
                            <div class="friend-item-modal p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors" data-user-id="${friend.id}">
                                <div class="flex items-center gap-3">
                                    <img src="${friend.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name)}&background=4F46E5&color=fff`}" 
                                         alt="${friend.name}" 
                                         class="w-12 h-12 rounded-full">
                                    <div class="flex-1">
                                        <h3 class="font-semibold text-gray-800 dark:text-white">${friend.name}</h3>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">Clique para iniciar conversa</p>
                                    </div>
                                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const closeBtn = modal.querySelector('#close-new-conversation-modal');
            const searchInput = modal.querySelector('#search-friends-modal');
            const friendItems = modal.querySelectorAll('.friend-item-modal');

            // Fechar modal
            const closeModal = () => modal.remove();
            closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            // Busca de amigos
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                friendItems.forEach(item => {
                    const name = item.querySelector('h3').textContent.toLowerCase();
                    item.style.display = name.includes(query) ? '' : 'none';
                });
            });

            // Click em um amigo para iniciar conversa
            friendItems.forEach(item => {
                item.addEventListener('click', async () => {
                    const userId = parseInt(item.dataset.userId);
                    closeModal();
                    
                    // Muda para a view de mensagens
                    this.showView('messages-view');
                    
                    // Abre o chat com o amigo
                    await this.openChat(userId);
                    
                    Toast.success('Conversa iniciada!');
                });
            });

        } catch (error) {
            console.error('Erro ao abrir modal de nova conversa:', error);
            Toast.error('Erro ao carregar amigos');
        }
    }

    async openChat(userId) {
        try {
            this.currentChatUserId = userId;

            // Busca informações do usuário
            const user = await this.api.getUser(userId);

            // Mostra o header do chat
            const chatHeader = document.getElementById('chat-header');
            const chatUserAvatar = document.getElementById('chat-user-avatar');
            const chatUserName = document.getElementById('chat-user-name');

            chatUserAvatar.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4F46E5&color=fff`;
            chatUserName.textContent = user.name;
            chatHeader.classList.remove('hidden');

            // Mostra a área de mensagens
            document.getElementById('no-chat-selected').classList.add('hidden');
            document.getElementById('messages-list').classList.remove('hidden');
            document.getElementById('message-input-area').classList.remove('hidden');

            // Carrega as mensagens
            await this.loadChatMessages(userId);
        } catch (error) {
            console.error('Erro ao abrir chat:', error);
            Toast.error('Erro ao abrir conversa');
        }
    }

    async loadChatMessages(userId) {
        try {
            const messages = await this.api.getMessages(userId);
            const container = document.getElementById('messages-list');

            if (!messages || messages.length === 0) {
                container.innerHTML = `
                    <div class="text-center text-gray-400 dark:text-gray-500 py-12">
                        <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                            </svg>
                        </div>
                        <p class="font-medium mb-1">Nenhuma mensagem ainda</p>
                        <p class="text-sm">Envie a primeira mensagem para começar a conversa!</p>
                    </div>
                `;
                return;
            }

            // Normalizar dados do backend
            const currentUserId = this.state.getState().currentUser?.id;
            const normalizedMessages = messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                createdAt: msg.created_at,
                isFromMe: msg.from_user_id === currentUserId,
                sender: {
                    id: msg.from_user_id,
                    name: msg.sender_name,
                    avatar: msg.sender_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender_name)}&background=4F46E5&color=fff`
                }
            }));

            container.innerHTML = normalizedMessages.map(msg => `
                <div class="flex ${msg.isFromMe ? 'justify-end' : 'justify-start'} items-end gap-2">
                    ${!msg.isFromMe ? `
                        <img src="${msg.sender.avatar}" alt="${msg.sender.name}" 
                             class="w-8 h-8 rounded-full flex-shrink-0" />
                    ` : ''}
                    <div class="flex flex-col ${msg.isFromMe ? 'items-end' : 'items-start'}">
                        <div class="${msg.isFromMe 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600'} 
                                    rounded-2xl px-4 py-2 max-w-xs lg:max-w-md shadow-sm">
                            <p class="break-words">${msg.content}</p>
                        </div>
                        <span class="text-xs text-gray-400 dark:text-gray-500 mt-1 px-2">
                            ${DateUtils.formatTimestamp(msg.createdAt)}
                        </span>
                    </div>
                    ${msg.isFromMe ? `
                        <img src="${msg.sender.avatar}" alt="${msg.sender.name}" 
                             class="w-8 h-8 rounded-full flex-shrink-0" />
                    ` : ''}
                </div>
            `).join('');

            // Scroll para o final com animação suave
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);

            // Marca mensagens como lidas
            await this.api.markMessagesAsRead(userId);

            // Atualiza a lista de conversas
            this.loadConversations();
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        }
    }

    async sendMessage() {
        const input = document.getElementById('chat-message-input');
        const content = input.value.trim();

        if (!content || !this.currentChatUserId) {
            return;
        }

        try {
            await this.api.sendMessage(this.currentChatUserId, content);
            input.value = '';

            // Recarrega as mensagens
            await this.loadChatMessages(this.currentChatUserId);

            Toast.success('Mensagem enviada!');
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            Toast.error('Erro ao enviar mensagem');
        }
    }

    // ========== PEDIDOS DE AMIZADE ==========

    async sendFriendRequest(userId) {
        try {
            await this.api.sendFriendRequest(userId);
            Toast.success('Pedido de amizade enviado!');

            // Recarrega o feed para atualizar os botões
            await this.loadFeed();
        } catch (error) {
            console.error('Erro ao enviar pedido:', error);
            Toast.error(error.message || 'Erro ao enviar pedido de amizade');
        }
    }

    async loadFriendRequests() {
        try {
            const requests = await this.api.getFriendRequests();
            const container = document.getElementById('friend-requests-container');

            // Atualiza badge de pedidos
            const requestsBadge = document.getElementById('requests-badge');
            if (requestsBadge) {
                if (requests && requests.length > 0) {
                    requestsBadge.textContent = requests.length;
                    requestsBadge.classList.remove('hidden');
                } else {
                    requestsBadge.classList.add('hidden');
                }
            }

            if (!container) return;

            if (!requests || requests.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <p>Nenhum pedido de amizade</p>
                    </div>
                `;
                return;
            }

            // Normalizar dados do backend
            const normalizedRequests = requests.map(req => ({
                requesterId: req.id,
                name: req.name,
                avatar: req.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.name)}&background=4F46E5&color=fff`,
                requestedAt: req.created_at
            }));

            container.innerHTML = normalizedRequests.map(request => `
                <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div class="flex items-center gap-3">
                        <img src="${request.avatar}" alt="${request.name}" class="w-12 h-12 rounded-full">
                        <div>
                            <h3 class="font-semibold text-gray-800 dark:text-white">${request.name}</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${DateUtils.formatTimestamp(request.requestedAt)}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="app.acceptFriendRequest(${request.requesterId})" 
                                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                            Aceitar
                        </button>
                        <button onclick="app.rejectFriendRequest(${request.requesterId})" 
                                class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                            Recusar
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Erro ao carregar pedidos:', error);
        }
    }

    async acceptFriendRequest(requesterId) {
        try {
            await this.api.acceptFriendRequest(requesterId);
            Toast.success('Pedido de amizade aceito!');

            // Recarrega a lista de amigos e pedidos
            await this.loadFriendRequests();
            await this.loadFriends();
        } catch (error) {
            console.error('Erro ao aceitar pedido:', error);
            Toast.error('Erro ao aceitar pedido');
        }
    }

    async rejectFriendRequest(requesterId) {
        try {
            await this.api.rejectFriendRequest(requesterId);
            Toast.success('Pedido de amizade recusado');

            // Recarrega a lista de pedidos
            await this.loadFriendRequests();
        } catch (error) {
            console.error('Erro ao recusar pedido:', error);
            Toast.error('Erro ao recusar pedido');
        }
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
    window.app = app;
});
