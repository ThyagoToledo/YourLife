// ============================================
// UTILITIES - FUNÇÕES AUXILIARES
// ============================================

// Formatação de datas
const DateUtils = {
    // Formata uma data em formato relativo (ex: "2h atrás")
    formatRelativeTime(date) {
        const now = new Date();
        const then = new Date(date);
        const diff = Math.floor((now - then) / 1000); // diferença em segundos

        if (diff < 60) return 'Agora mesmo';
        if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d atrás`;
        if (diff < 2592000) return `${Math.floor(diff / 604800)}sem atrás`;
        if (diff < 31536000) return `${Math.floor(diff / 2592000)}m atrás`;
        return `${Math.floor(diff / 31536000)}a atrás`;
    },

    // Formata data completa
    formatFullDate(date) {
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    },

    // Formata timestamp para exibição
    formatTimestamp(timestamp) {
        if (!timestamp) return 'Data desconhecida';
        return this.formatRelativeTime(timestamp);
    },
};

// Validação de dados
const Validation = {
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    isValidPassword(password) {
        // Mínimo 6 caracteres
        return password && password.length >= 6;
    },

    isValidName(name) {
        return name && name.trim().length >= 2;
    },

    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    validateLoginForm(email, password) {
        const errors = {};

        if (!this.isValidEmail(email)) {
            errors.email = 'Email inválido';
        }

        if (!this.isValidPassword(password)) {
            errors.password = 'Senha deve ter no mínimo 6 caracteres';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    },

    validateRegisterForm(name, email, password, confirmPassword) {
        const errors = {};

        if (!this.isValidName(name)) {
            errors.name = 'Nome deve ter no mínimo 2 caracteres';
        }

        if (!this.isValidEmail(email)) {
            errors.email = 'Email inválido';
        }

        if (!this.isValidPassword(password)) {
            errors.password = 'Senha deve ter no mínimo 6 caracteres';
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = 'As senhas não coincidem';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    },
};

// Manipulação de DOM
const DOMUtils = {
    // Mostra um elemento
    show(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.style.display = 'block';
            element.classList.remove('hidden');
        }
    },

    // Esconde um elemento
    hide(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.style.display = 'none';
            element.classList.add('hidden');
        }
    },

    // Toggle de visibilidade
    toggle(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            if (element.style.display === 'none' || element.classList.contains('hidden')) {
                this.show(element);
            } else {
                this.hide(element);
            }
        }
    },

    // Adiciona classe
    addClass(element, className) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.add(className);
        }
    },

    // Remove classe
    removeClass(element, className) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.remove(className);
        }
    },

    // Toggle classe
    toggleClass(element, className) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.toggle(className);
        }
    },
};

// Notificações Toast
const Toast = {
    container: null,

    init() {
        if (this.container) return;
        
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(this.container);
    },

    show(message, type = 'info', duration = 3000) {
        this.init();

        const toast = document.createElement('div');
        toast.className = 'toast';
        
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500',
        };

        toast.className = `${colors[type] || colors.info} text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in`;
        toast.textContent = message;

        this.container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    warning(message, duration) {
        this.show(message, 'warning', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    },
};

// Debounce para otimizar eventos de busca
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle para limitar taxa de execução
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Storage helper
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return false;
        }
    },

    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Erro ao ler do localStorage:', error);
            return null;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover do localStorage:', error);
            return false;
        }
    },

    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error);
            return false;
        }
    },
};

// Utilitários para URLs
const URLUtils = {
    getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },

    removeQueryParam(param) {
        const url = new URL(window.location);
        url.searchParams.delete(param);
        window.history.pushState({}, '', url);
    },
};

// Loading indicator
const Loading = {
    show(message = 'Carregando...') {
        let loader = document.getElementById('global-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            loader.innerHTML = `
                <div class="bg-white rounded-lg p-6 flex flex-col items-center space-y-4">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p class="text-gray-700 font-medium">${message}</p>
                </div>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    },

    hide() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    },
};

// Exporta para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DateUtils,
        Validation,
        DOMUtils,
        Toast,
        debounce,
        throttle,
        Storage,
        URLUtils,
        Loading,
    };
}
