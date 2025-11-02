// ============================================
// STATE MANAGEMENT - GERENCIAMENTO DE ESTADO
// ============================================

class StateManager {
    constructor() {
        this.state = {
            currentUser: null,
            isAuthenticated: false,
            currentView: 'feed',
            feed: [],
            notifications: [],
            searchResults: null,
            unreadNotifications: 0,
        };
        
        this.listeners = [];
    }

    // Obtém o estado atual
    getState() {
        return { ...this.state };
    }

    // Atualiza o estado
    setState(updates) {
        this.state = {
            ...this.state,
            ...updates,
        };
        this.notify();
    }

    // Atualiza parcialmente o estado
    updateState(path, value) {
        const keys = path.split('.');
        let current = this.state;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        this.notify();
    }

    // Inscreve um listener para mudanças de estado
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // Notifica todos os listeners
    notify() {
        this.listeners.forEach(listener => {
            try {
                listener(this.state);
            } catch (error) {
                console.error('Erro no listener:', error);
            }
        });
    }

    // Métodos específicos
    
    setCurrentUser(user) {
        this.setState({
            currentUser: user,
            isAuthenticated: !!user,
        });
    }

    setCurrentView(view) {
        this.setState({ currentView: view });
    }

    setFeed(feed) {
        this.setState({ feed });
    }

    addPost(post) {
        this.setState({
            feed: [post, ...this.state.feed],
        });
    }

    updatePost(postId, updates) {
        this.setState({
            feed: this.state.feed.map(post =>
                post.id === postId ? { ...post, ...updates } : post
            ),
        });
    }

    removePost(postId) {
        this.setState({
            feed: this.state.feed.filter(post => post.id !== postId),
        });
    }

    addComment(postId, comment) {
        this.setState({
            feed: this.state.feed.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: [...post.comments, comment],
                        commentsCount: (post.commentsCount || 0) + 1,
                    };
                }
                return post;
            }),
        });
    }

    toggleLike(postId) {
        this.setState({
            feed: this.state.feed.map(post => {
                if (post.id === postId) {
                    const isLiked = !post.isLiked;
                    return {
                        ...post,
                        isLiked,
                        likes: post.likes + (isLiked ? 1 : -1),
                    };
                }
                return post;
            }),
        });
    }

    setNotifications(notifications) {
        const unread = notifications.filter(n => !n.read).length;
        this.setState({
            notifications,
            unreadNotifications: unread,
        });
    }

    addNotification(notification) {
        this.setState({
            notifications: [notification, ...this.state.notifications],
            unreadNotifications: this.state.unreadNotifications + 1,
        });
    }

    markNotificationAsRead(notificationId) {
        this.setState({
            notifications: this.state.notifications.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            ),
            unreadNotifications: Math.max(0, this.state.unreadNotifications - 1),
        });
    }

    setSearchResults(results) {
        this.setState({ searchResults: results });
    }

    clearSearchResults() {
        this.setState({ searchResults: null });
    }

    reset() {
        this.state = {
            currentUser: null,
            isAuthenticated: false,
            currentView: 'feed',
            feed: [],
            notifications: [],
            searchResults: null,
            unreadNotifications: 0,
        };
        this.notify();
    }
}

// Exporta uma instância única do gerenciador de estado
const stateManager = new StateManager();

// Para uso em módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = stateManager;
}
