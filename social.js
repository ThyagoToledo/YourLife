// Recursos sociais v4: conversas, Markdown, mídia, comunidades e ligações.
(function () {
    'use strict';

    const socialState = {
        conversationId: null,
        conversationTitle: '',
        topicId: null,
        attachmentIds: [],
        pollTimer: null,
        room: null,
        callId: null,
        previewStream: null,
        realtime: null,
        realtimeChannel: null,
        settings: { enterToSend: true, compactMode: false, fontScale: 1 }
    };

    function escapeHTML(value) {
        const node = document.createElement('div');
        node.textContent = value == null ? '' : String(value);
        return node.innerHTML;
    }

    function socialIcon(name, className = 'h-5 w-5') {
        return `<svg class="${className}" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><use href="Icons/social-sprite.svg#${name}"></use></svg>`;
    }

    function renderMessage(content, format) {
        if (format !== 'markdown' || !window.marked || !window.DOMPurify) {
            return escapeHTML(content).replace(/\n/g, '<br>');
        }
        const raw = window.marked.parse(content, {
            gfm: true,
            breaks: true,
            headerIds: false,
            mangle: false
        });
        return window.DOMPurify.sanitize(raw, {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'del', 'blockquote', 'ul', 'ol', 'li', 'code', 'pre', 'h1', 'h2', 'h3', 'a'],
            ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
            ALLOW_UNKNOWN_PROTOCOLS: false
        }).replace(/<a /g, '<a target="_blank" rel="noopener noreferrer nofollow" ');
    }

    async function socialRequest(path, options = {}) {
        const token = window.apiService?.getToken();
        const response = await fetch(`${window.BACKEND_URL}/v2${path}`, {
            ...options,
            headers: {
                ...(options.body && !(options.body instanceof Blob) ? { 'Content-Type': 'application/json' } : {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers
            },
            body: options.body && !(options.body instanceof Blob) && typeof options.body !== 'string'
                ? JSON.stringify(options.body)
                : options.body
        });
        if (response.status === 204) return null;
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || `Erro HTTP ${response.status}`);
        return payload;
    }

    function showSocialView(viewId) {
        if (!window.app) return;
        window.app.showView(viewId);
        document.querySelectorAll('#nav-social-chat, #nav-calls, #nav-communities').forEach((item) => {
            item.classList.remove('bg-blue-600', 'text-white');
            item.classList.add('text-gray-700');
        });
        const nav = document.getElementById(`nav-${viewId.replace('-view', '')}`);
        nav?.classList.add('bg-blue-600', 'text-white');
        nav?.classList.remove('text-gray-700');
    }

    async function loadSettings() {
        try {
            socialState.settings = await socialRequest('/settings');
            document.documentElement.style.setProperty('--chat-font-scale', String(socialState.settings.fontScale));
        } catch (error) {
            console.warn('Configurações sociais indisponíveis:', error.message);
        }
    }

    async function openSettings() {
        const compactMode = confirm(`Modo compacto está ${socialState.settings.compactMode ? 'ligado' : 'desligado'}. Deseja alternar?`);
        const enterToSend = confirm('Usar Enter para enviar? Cancelar mantém Enter como quebra de linha.');
        const scaleInput = prompt('Escala da fonte do chat (0.8 a 1.5):', socialState.settings.fontScale);
        const fontScale = Math.min(1.5, Math.max(0.8, Number(scaleInput) || 1));
        socialState.settings = await socialRequest('/settings', {
            method: 'PATCH',
            body: { compactMode: compactMode ? !socialState.settings.compactMode : socialState.settings.compactMode, enterToSend, fontScale }
        });
        document.documentElement.style.setProperty('--chat-font-scale', String(fontScale));
        await loadMessages();
    }

    async function loadConversations() {
        const list = document.getElementById('social-conversation-list');
        if (!list) return;
        try {
            const conversations = await socialRequest('/conversations');
            if (!conversations.length) {
                list.innerHTML = '<p class="p-6 text-center text-sm text-gray-500">Crie um grupo ou entre em uma comunidade.</p>';
                return;
            }
            list.innerHTML = conversations.map((conversation) => `
                <button data-conversation-id="${escapeHTML(conversation.id)}" data-title="${escapeHTML(conversation.title || (conversation.kind === 'direct' ? 'Conversa direta' : 'Conversa'))}"
                    class="social-conversation w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 flex gap-3">
                    <span class="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400">${socialIcon(conversation.kind === 'direct' ? 'chat' : conversation.kind === 'channel' ? 'chat' : 'group')}</span>
                    <span class="min-w-0"><span class="block font-medium text-gray-900 dark:text-white">${escapeHTML(conversation.title || (conversation.kind === 'direct' ? 'Conversa direta' : 'Conversa'))}</span>
                    <span class="block text-xs text-gray-500 truncate">${escapeHTML(conversation.lastMessage || 'Sem mensagens')}</span>
                    </span>
                </button>
            `).join('');
            list.querySelectorAll('.social-conversation').forEach((button) => {
                button.addEventListener('click', () => selectConversation(button.dataset.conversationId, button.dataset.title));
            });
        } catch (error) {
            list.innerHTML = `<p class="p-6 text-red-600">${escapeHTML(error.message)}</p>`;
        }
    }

    async function selectConversation(id, title) {
        socialState.conversationId = id;
        socialState.conversationTitle = title;
        socialState.topicId = null;
        document.getElementById('social-chat-title').textContent = title;
        document.getElementById('social-chat-status').textContent = 'Tópico protegido · Markdown e anexos moderados';
        document.getElementById('social-send-btn').disabled = false;
        document.getElementById('social-audio-call-btn').disabled = false;
        document.getElementById('social-video-call-btn').disabled = false;
        document.getElementById('social-chat-panel').classList.remove('hidden');
        document.getElementById('social-chat-panel').classList.add('flex');
        await loadTopics();
        await loadMessages();
        subscribeConversation(id);
        clearInterval(socialState.pollTimer);
        socialState.pollTimer = setInterval(loadMessages, 3000);
    }

    async function setupRealtime() {
        if (socialState.realtime || !window.Ably || !window.apiService?.getToken()) return;
        let initialTokenRequest;
        try {
            initialTokenRequest = await socialRequest('/realtime/token', { method: 'POST' });
        } catch (error) {
            return;
        }
        socialState.realtime = new window.Ably.Realtime({
            authCallback: async (tokenParams, callback) => {
                try {
                    const tokenRequest = initialTokenRequest || await socialRequest('/realtime/token', { method: 'POST' });
                    initialTokenRequest = null;
                    callback(null, tokenRequest);
                } catch (error) {
                    callback(error, null);
                }
            }
        });
        const currentUserId = window.app?.state?.getState()?.currentUser?.id;
        if (currentUserId) {
            socialState.realtime.channels.get(`user:${currentUserId}`).subscribe('call.invited', loadCalls);
        }
    }

    function subscribeConversation(id) {
        if (!socialState.realtime) return;
        if (socialState.realtimeChannel) socialState.realtimeChannel.unsubscribe();
        socialState.realtimeChannel = socialState.realtime.channels.get(`conversation:${id}`);
        socialState.realtimeChannel.subscribe('message.created', loadMessages);
    }

    async function loadMessages() {
        if (!socialState.conversationId) return;
        const container = document.getElementById('social-messages');
        try {
            const result = await socialRequest(`/conversations/${socialState.conversationId}/messages?limit=100`);
            const currentUserId = Number(window.app?.state?.getState()?.currentUser?.id);
            container.classList.toggle('space-y-1', Boolean(socialState.settings.compactMode));
            container.classList.toggle('space-y-3', !socialState.settings.compactMode);
            container.style.fontSize = `calc(1rem * ${socialState.settings.fontScale})`;
            container.innerHTML = result.messages.length ? result.messages.map((message) => {
                const mine = Number(message.senderId) === currentUserId;
                if (message.deletedAt) return '<p class="text-center text-xs text-gray-400">Mensagem removida</p>';
                return `<article class="flex ${mine ? 'justify-end' : 'justify-start'}">
                    <div class="max-w-[80%] rounded-xl px-4 py-2 ${mine ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 dark:text-white shadow'}">
                        ${mine ? '' : `<p class="text-xs font-semibold opacity-70">${escapeHTML(message.senderName)}</p>`}
                        <div class="chat-markdown break-words">${renderMessage(message.content, message.format)}</div>
                        ${(message.attachments || []).map((attachment) => `<img data-private-media="${escapeHTML(attachment.id)}" alt="${escapeHTML(attachment.fileName)}" class="mt-2 max-h-80 max-w-full rounded bg-gray-200">`).join('')}
                        <p class="text-[11px] opacity-60 mt-1">${new Date(message.createdAt).toLocaleString('pt-BR')}${message.editedAt ? ' · editada' : ''}</p>
                    </div>
                </article>`;
            }).join('') : '<p class="text-center text-gray-500">Envie a primeira mensagem.</p>';
            container.scrollTop = container.scrollHeight;
            await hydratePrivateImages(container);
            const last = result.messages.at(-1);
            if (last) await socialRequest(`/conversations/${socialState.conversationId}/read`, { method: 'PUT', body: { messageId: last.id } });
        } catch (error) {
            container.innerHTML = `<p class="text-center text-red-600">${escapeHTML(error.message)}</p>`;
        }
    }

    async function hydratePrivateImages(container) {
        const token = window.apiService?.getToken();
        await Promise.all([...container.querySelectorAll('[data-private-media]')].map(async (image) => {
            try {
                const response = await fetch(`${window.BACKEND_URL}/v2/media/${image.dataset.privateMedia}/content`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                if (!response.ok) throw new Error('Imagem indisponível');
                const objectUrl = URL.createObjectURL(await response.blob());
                image.src = objectUrl;
                image.addEventListener('load', () => URL.revokeObjectURL(objectUrl), { once: true });
            } catch (error) {
                image.replaceWith(Object.assign(document.createElement('span'), { textContent: '[imagem indisponível]' }));
            }
        }));
    }

    async function sendMessage() {
        const input = document.getElementById('social-message-input');
        const content = input.value.trim();
        if (!socialState.conversationId || (!content && !socialState.attachmentIds.length)) return;
        const button = document.getElementById('social-send-btn');
        button.disabled = true;
        try {
            await socialRequest(`/conversations/${socialState.conversationId}/messages`, {
                method: 'POST',
                body: {
                    content,
                    format: 'markdown',
                    attachmentIds: socialState.attachmentIds,
                    clientMessageId: crypto.randomUUID()
                }
            });
            input.value = '';
            socialState.attachmentIds = [];
            document.getElementById('social-upload-status').textContent = '';
            document.getElementById('markdown-preview').classList.add('hidden');
            await Promise.all([loadMessages(), loadConversations()]);
        } catch (error) {
            window.Toast?.error(error.message);
        } finally {
            button.disabled = false;
        }
    }

    async function uploadImage(file, purpose, contextId = null) {
        if (!file) return null;
        const intent = await socialRequest('/media/uploads', {
            method: 'POST',
            body: { purpose, fileName: file.name, contentType: file.type, contextId }
        });
        const token = window.apiService.getToken();
        const response = await fetch(intent.uploadUrl, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': file.type },
            body: file
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Falha no upload');
        return result;
    }

    async function handleAttachment(file) {
        const status = document.getElementById('social-upload-status');
        status.textContent = 'Analisando...';
        try {
            const result = await uploadImage(file, 'message', socialState.conversationId);
            if (result.status !== 'approved') {
                status.textContent = result.status === 'rejected' ? 'Imagem recusada' : 'Aguardando revisão';
                return;
            }
            socialState.attachmentIds.push(result.id);
            status.textContent = 'Imagem pronta';
        } catch (error) {
            status.textContent = error.message;
        }
    }

    async function createGroup() {
        const title = prompt('Nome do grupo:');
        if (!title) return;
        const ids = prompt('IDs dos amigos separados por vírgula:');
        const memberIds = String(ids || '').split(',').map((id) => Number(id.trim())).filter(Number.isInteger);
        if (!memberIds.length) return;
        try {
            const conversation = await socialRequest('/conversations', { method: 'POST', body: { kind: 'group', title, memberIds } });
            await loadConversations();
            await selectConversation(conversation.id, title);
        } catch (error) { window.Toast?.error(error.message); }
    }

    async function loadTopics() {
        const select = document.getElementById('social-topic-select');
        if (!select || !socialState.conversationId) return;
        try {
            const topics = await socialRequest(`/conversations/${socialState.conversationId}/topics`);
            select.innerHTML = '<option value="">Geral</option>' + topics.map((topic) => `<option value="${escapeHTML(topic.id)}">${escapeHTML(topic.title)} (${topic.commentCount})</option>`).join('');
            select.value = socialState.topicId || '';
        } catch (error) { console.warn('Tópicos indisponíveis:', error.message); }
    }

    async function createTopic() {
        if (!socialState.conversationId) return;
        const title = prompt('Título do tópico:');
        if (!title) return;
        const body = prompt('Mensagem inicial (opcional):') || '';
        try {
            const topic = await socialRequest(`/conversations/${socialState.conversationId}/topics`, { method: 'POST', body: { title, body } });
            socialState.topicId = topic.id;
            await loadTopics();
            document.getElementById('social-topic-select').value = topic.id;
        } catch (error) { window.Toast?.error(error.message); }
    }

    async function openDirectConversation(userId) {
        try {
            const conversation = await socialRequest('/conversations', {
                method: 'POST',
                body: { kind: 'direct', memberIds: [Number(userId)] }
            });
            showSocialView('social-chat-view');
            await loadConversations();
            await selectConversation(conversation.id, conversation.title || 'Conversa direta');
        } catch (error) { window.Toast?.error(error.message); }
    }

    async function loadCommunities() {
        const container = document.getElementById('communities-list');
        try {
            const communities = await socialRequest('/communities');
            container.innerHTML = communities.length ? communities.map((community) => `
                <article class="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
                    <div class="flex justify-between gap-3"><h2 class="font-semibold text-lg dark:text-white">${escapeHTML(community.name)}</h2><span class="text-xs text-gray-500">${escapeHTML(community.role)}</span></div>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-2">${escapeHTML(community.description)}</p>
                    <p class="text-xs text-gray-500 mt-4">${community.memberCount} membros · ${escapeHTML(community.visibility)}</p>
                    ${['owner', 'admin'].includes(community.role) ? `<button data-community-id="${community.id}" class="create-channel mt-3 text-sm text-blue-600">+ Criar canal</button>` : ''}
                </article>`).join('') : '<p class="text-gray-500">Você ainda não participa de comunidades.</p>';
            container.querySelectorAll('.create-channel').forEach((button) => button.addEventListener('click', () => createChannel(button.dataset.communityId)));
        } catch (error) { container.innerHTML = `<p class="text-red-600">${escapeHTML(error.message)}</p>`; }
    }

    async function createCommunity() {
        const name = prompt('Nome da comunidade:');
        if (!name) return;
        const description = prompt('Descrição curta:') || '';
        const visibility = confirm('A comunidade será pública?') ? 'public' : 'private';
        try {
            await socialRequest('/communities', { method: 'POST', body: { name, description, visibility } });
            await Promise.all([loadCommunities(), loadConversations()]);
        } catch (error) { window.Toast?.error(error.message); }
    }

    async function createChannel(communityId) {
        const name = prompt('Nome do canal (letras, números e hífen):');
        if (!name) return;
        const kind = confirm('Este será um canal de voz?') ? 'voice' : 'text';
        try {
            await socialRequest(`/communities/${communityId}/channels`, { method: 'POST', body: { name, kind } });
            await Promise.all([loadCommunities(), loadConversations()]);
        } catch (error) { window.Toast?.error(error.message); }
    }

    async function loadCalls() {
        const container = document.getElementById('calls-list');
        try {
            const calls = await socialRequest('/calls');
            container.innerHTML = calls.length ? calls.map((call) => `
                <article class="flex items-center gap-3 p-3 border rounded-lg dark:border-gray-700">
                    <span class="text-blue-600 dark:text-blue-400">${socialIcon(call.kind === 'direct' ? 'phone' : 'group')}</span>
                    <div class="flex-1"><p class="font-medium dark:text-white">${escapeHTML(call.topicTitle || call.title || (call.kind === 'direct' ? 'Conversa direta' : 'Tópico em grupo'))}</p><p class="text-xs text-gray-500">${escapeHTML(call.state)} · ${new Date(call.createdAt).toLocaleString('pt-BR')}</p></div>
                    ${call.participantState === 'invited' && call.state === 'ringing' ? `<button data-call="${call.id}" class="accept-call px-3 py-2 bg-green-600 text-white rounded">Atender</button><button data-call="${call.id}" class="decline-call px-3 py-2 bg-red-600 text-white rounded">Recusar</button>` : ''}
                </article>`).join('') : '<p class="text-gray-500">Nenhuma ligação registrada.</p>';
            container.querySelectorAll('.accept-call').forEach((button) => button.addEventListener('click', async () => { await socialRequest(`/calls/${button.dataset.call}/accept`, { method: 'POST' }); await joinCall(button.dataset.call); }));
            container.querySelectorAll('.decline-call').forEach((button) => button.addEventListener('click', async () => { await socialRequest(`/calls/${button.dataset.call}/decline`, { method: 'POST' }); await loadCalls(); }));
        } catch (error) { container.innerHTML = `<p class="text-red-600">${escapeHTML(error.message)}</p>`; }
    }

    async function startCall(withVideo) {
        if (!socialState.conversationId) return;
        try {
            const call = await socialRequest('/calls', { method: 'POST', body: { conversationId: socialState.conversationId, topicId: socialState.topicId } });
            await socialRequest(`/calls/${call.id}/accept`, { method: 'POST' });
            await joinCall(call.id, withVideo);
        } catch (error) { window.Toast?.error(error.message); }
    }

    async function joinCall(callId, withVideo = false) {
        if (!window.LivekitClient) {
            window.Toast?.error('Biblioteca de chamada indisponível');
            return;
        }
        const credentials = await socialRequest(`/calls/${callId}/token`, { method: 'POST' });
        const room = new window.LivekitClient.Room({ adaptiveStream: true, dynacast: true });
        room.on(window.LivekitClient.RoomEvent.TrackSubscribed, (track, publication, participant) => attachTrack(track, participant.identity));
        room.on(window.LivekitClient.RoomEvent.TrackUnsubscribed, (track) => track.detach().forEach((element) => element.remove()));
        await room.connect(credentials.url, credentials.token);
        await room.localParticipant.setMicrophoneEnabled(true);
        if (withVideo) await room.localParticipant.setCameraEnabled(true);
        socialState.room = room;
        socialState.callId = callId;
        document.getElementById('active-call-bar').classList.remove('hidden');
        document.getElementById('active-call-bar').classList.add('flex');
        showSocialView('calls-view');
        attachLocalTracks();
        await loadCalls();
    }

    function attachTrack(track, identity) {
        const element = track.attach();
        element.autoplay = true;
        element.playsInline = true;
        element.dataset.participant = identity;
        element.className = track.kind === 'video' ? 'w-full rounded bg-black aspect-video object-cover' : 'hidden';
        document.getElementById('call-videos').appendChild(element);
        applySpeakerSelection(element);
    }

    function attachLocalTracks() {
        const publications = socialState.room?.localParticipant?.trackPublications;
        publications?.forEach((publication) => {
            if (publication.track?.kind === 'video') attachTrack(publication.track, 'Você');
        });
    }

    async function leaveCall() {
        if (socialState.callId) await socialRequest(`/calls/${socialState.callId}/leave`, { method: 'POST' }).catch(() => {});
        socialState.room?.disconnect();
        socialState.room = null;
        socialState.callId = null;
        document.getElementById('call-videos').replaceChildren();
        document.getElementById('active-call-bar').classList.add('hidden');
        await loadCalls();
    }

    async function enumerateDevices(requestPermission = false) {
        if (!navigator.mediaDevices?.enumerateDevices) return;
        if (requestPermission) {
            socialState.previewStream?.getTracks().forEach((track) => track.stop());
            socialState.previewStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            const preview = document.getElementById('device-preview');
            preview.srcObject = socialState.previewStream;
            preview.classList.remove('hidden');
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        fillDeviceSelect('microphone-select', devices.filter((device) => device.kind === 'audioinput'), 'Microfone padrão');
        fillDeviceSelect('camera-select', devices.filter((device) => device.kind === 'videoinput'), 'Câmera padrão');
        fillDeviceSelect('speaker-select', devices.filter((device) => device.kind === 'audiooutput'), 'Saída padrão');
        document.getElementById('device-help').textContent = 'A escolha do fone depende do suporte e da permissão do navegador.';
    }

    function fillDeviceSelect(id, devices, fallback) {
        const select = document.getElementById(id);
        const previous = select.value;
        select.innerHTML = `<option value="">${fallback}</option>${devices.map((device, index) => `<option value="${escapeHTML(device.deviceId)}">${escapeHTML(device.label || `${fallback} ${index + 1}`)}</option>`).join('')}`;
        if ([...select.options].some((option) => option.value === previous)) select.value = previous;
    }

    async function applyDeviceSelections() {
        if (!socialState.room) return;
        const microphone = document.getElementById('microphone-select').value;
        const camera = document.getElementById('camera-select').value;
        if (microphone) await socialState.room.switchActiveDevice('audioinput', microphone);
        if (camera) await socialState.room.switchActiveDevice('videoinput', camera);
        document.querySelectorAll('#call-videos audio, #call-videos video').forEach(applySpeakerSelection);
    }

    async function applySpeakerSelection(element) {
        const speaker = document.getElementById('speaker-select')?.value;
        if (speaker && typeof element.setSinkId === 'function') await element.setSinkId(speaker).catch(() => {});
    }

    function wrapSelection(marker) {
        const input = document.getElementById('social-message-input');
        const start = input.selectionStart;
        const end = input.selectionEnd;
        input.setRangeText(`${marker}${input.value.slice(start, end)}${marker}`, start, end, 'select');
        input.focus();
    }

    function prefixSelection(prefix) {
        const input = document.getElementById('social-message-input');
        const start = input.selectionStart;
        input.setRangeText(prefix, start, start, 'end');
        input.focus();
    }

    function bindNavigation() {
        document.getElementById('nav-social-chat')?.addEventListener('click', async (event) => {
            event.preventDefault(); showSocialView('social-chat-view'); await loadConversations();
        });
        document.getElementById('nav-calls')?.addEventListener('click', async (event) => {
            event.preventDefault(); showSocialView('calls-view'); await Promise.all([loadCalls(), enumerateDevices(false)]);
        });
        document.getElementById('nav-communities')?.addEventListener('click', async (event) => {
            event.preventDefault(); showSocialView('communities-view'); await loadCommunities();
        });
    }

    function bindActions() {
        document.getElementById('social-send-btn')?.addEventListener('click', sendMessage);
        document.getElementById('social-message-input')?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey && socialState.settings.enterToSend) { event.preventDefault(); sendMessage(); }
        });
        document.getElementById('toggle-preview-btn')?.addEventListener('click', () => {
            const preview = document.getElementById('markdown-preview');
            preview.innerHTML = renderMessage(document.getElementById('social-message-input').value, 'markdown');
            preview.classList.toggle('hidden');
        });
        document.querySelectorAll('.markdown-tool').forEach((button) => button.addEventListener('click', () => wrapSelection(button.dataset.md)));
        document.querySelectorAll('.markdown-prefix').forEach((button) => button.addEventListener('click', () => prefixSelection(button.dataset.prefix)));
        document.getElementById('social-attachment')?.addEventListener('change', (event) => handleAttachment(event.target.files[0]));
        document.getElementById('create-group-btn')?.addEventListener('click', createGroup);
        document.getElementById('create-community-btn')?.addEventListener('click', createCommunity);
        document.getElementById('chat-settings-btn')?.addEventListener('click', openSettings);
        document.getElementById('create-topic-btn')?.addEventListener('click', createTopic);
        document.getElementById('social-topic-select')?.addEventListener('change', (event) => {
            socialState.topicId = event.target.value || null;
            document.getElementById('social-chat-status').textContent = socialState.topicId ? 'Tópico protegido · chamada vinculada a este tópico' : 'Tópico geral · Markdown e anexos moderados';
        });
        document.getElementById('social-audio-call-btn')?.addEventListener('click', () => startCall(false));
        document.getElementById('social-video-call-btn')?.addEventListener('click', () => startCall(true));
        document.getElementById('test-devices-btn')?.addEventListener('click', () => enumerateDevices(true).catch((error) => window.Toast?.error(error.message)));
        document.getElementById('microphone-select')?.addEventListener('change', applyDeviceSelections);
        document.getElementById('camera-select')?.addEventListener('change', applyDeviceSelections);
        document.getElementById('speaker-select')?.addEventListener('change', applyDeviceSelections);
        document.getElementById('toggle-mic-btn')?.addEventListener('click', async () => {
            const participant = socialState.room?.localParticipant;
            if (participant) await participant.setMicrophoneEnabled(!participant.isMicrophoneEnabled);
        });
        document.getElementById('toggle-camera-btn')?.addEventListener('click', async () => {
            const participant = socialState.room?.localParticipant;
            if (participant) await participant.setCameraEnabled(!participant.isCameraEnabled);
        });
        document.getElementById('share-screen-btn')?.addEventListener('click', async () => {
            const participant = socialState.room?.localParticipant;
            if (participant) await participant.setScreenShareEnabled(!participant.isScreenShareEnabled);
        });
        document.getElementById('leave-call-btn')?.addEventListener('click', leaveCall);
        navigator.mediaDevices?.addEventListener?.('devicechange', () => enumerateDevices(false));
        window.addEventListener('beforeunload', () => {
            socialState.previewStream?.getTracks().forEach((track) => track.stop());
            socialState.room?.disconnect();
        });
    }

    function patchLegacyMessageSafety() {
        const original = window.app?.loadChatMessages?.bind(window.app);
        if (!original) return;
        // O renderer legado foi corrigido no código-fonte; esta marca ajuda a diagnosticar cache antigo.
        window.app.legacyChatSanitized = true;
    }

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(async () => {
            bindNavigation();
            bindActions();
            patchLegacyMessageSafety();
            if (window.apiService?.getToken()) await loadSettings();
            setupRealtime();
        }, 0);
    });

    window.YourLifeSocial = { uploadImage, loadConversations, loadCommunities, loadCalls, openDirectConversation, connectRealtime: setupRealtime };
})();
