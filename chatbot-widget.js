/**
 * chatbot-widget.js
 * -----------------------------------------------------------------
 * Drop-in floating AI chat assistant.
 *
 * HOW TO USE:
 * 1. Copy this file and chat-api.php into your site folder.
 * 2. Add one line before </body> on any page you want the chat on:
 *      <script src="chatbot-widget.js"></script>
 * 3. Set API_URL below to the path of chat-api.php on your server.
 * 4. Set GROQ_API_KEY in chat-api.php (see that file for setup).
 *
 * No other dependencies. Pure vanilla JS + injected CSS.
 * -----------------------------------------------------------------
 */
(function () {
  'use strict';

  // ---- CONFIG -------------------------------------------------------
  const API_URL = 'http://localhost/coro/curo/chat-api.php';       // path to the PHP backend
  const BOT_NAME = 'Assistant';
  const WELCOME_MESSAGE = "Hi! I'm here to help. Ask me anything.";
  const ACCENT_COLOR = '#2f6f4f';        // change to match your site
  // ---------------------------------------------------------------

  let history = [];
  let isOpen = false;
  let isSending = false;

  // ---- Styles ---------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .cbw-launcher {
      position: fixed;
      bottom: 22px;
      right: 22px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: ${ACCENT_COLOR};
      color: #fff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999998;
      transition: transform 0.15s ease;
    }
    .cbw-launcher:hover { transform: scale(1.06); }
    .cbw-launcher svg { width: 26px; height: 26px; }

    .cbw-window {
      position: fixed;
      bottom: 92px;
      right: 22px;
      width: 340px;
      max-width: calc(100vw - 32px);
      height: 460px;
      max-height: calc(100vh - 140px);
      background: #fff;
      border-radius: 14px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.25);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }
    .cbw-window.cbw-open { display: flex; }

    .cbw-header {
      background: ${ACCENT_COLOR};
      color: #fff;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .cbw-header-title { font-size: 15px; font-weight: 600; }
    .cbw-header-sub { font-size: 12px; opacity: 0.85; margin-top: 2px; }
    .cbw-close {
      background: transparent;
      border: none;
      color: #fff;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      padding: 4px;
    }

    .cbw-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f7f7f8;
    }

    .cbw-msg {
      max-width: 82%;
      padding: 9px 12px;
      border-radius: 12px;
      font-size: 13.5px;
      line-height: 1.45;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .cbw-msg-user {
      align-self: flex-end;
      background: ${ACCENT_COLOR};
      color: #fff;
      border-bottom-right-radius: 4px;
    }
    .cbw-msg-bot {
      align-self: flex-start;
      background: #fff;
      color: #222;
      border: 1px solid #e3e3e6;
      border-bottom-left-radius: 4px;
    }
    .cbw-msg-error {
      align-self: flex-start;
      background: #fdecea;
      color: #7a1f14;
      border: 1px solid #f5c6c0;
    }

    .cbw-typing {
      align-self: flex-start;
      display: flex;
      gap: 4px;
      padding: 10px 12px;
    }
    .cbw-typing span {
      width: 6px;
      height: 6px;
      background: #999;
      border-radius: 50%;
      animation: cbw-bounce 1.2s infinite ease-in-out;
    }
    .cbw-typing span:nth-child(2) { animation-delay: 0.15s; }
    .cbw-typing span:nth-child(3) { animation-delay: 0.3s; }
    @keyframes cbw-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    .cbw-inputbar {
      display: flex;
      gap: 8px;
      padding: 10px;
      border-top: 1px solid #e6e6e6;
      flex-shrink: 0;
      background: #fff;
    }
    .cbw-input {
      flex: 1;
      border: 1px solid #d8d8db;
      border-radius: 20px;
      padding: 9px 14px;
      font-size: 13.5px;
      outline: none;
      resize: none;
      max-height: 80px;
      font-family: inherit;
    }
    .cbw-input:focus { border-color: ${ACCENT_COLOR}; }
    .cbw-send {
      background: ${ACCENT_COLOR};
      border: none;
      color: #fff;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .cbw-send:disabled { opacity: 0.5; cursor: default; }
    .cbw-send svg { width: 16px; height: 16px; }

    @media (max-width: 420px) {
      .cbw-window { right: 12px; bottom: 82px; width: calc(100vw - 24px); }
      .cbw-launcher { right: 14px; bottom: 14px; }
    }
  `;
  document.head.appendChild(style);

  // ---- DOM structure ----------------------------------------------
  const launcher = document.createElement('button');
  launcher.className = 'cbw-launcher';
  launcher.setAttribute('aria-label', 'Open chat assistant');
  launcher.innerHTML = chatIconSvg();

  const win = document.createElement('div');
  win.className = 'cbw-window';
  win.innerHTML = `
    <div class="cbw-header">
      <div>
        <div class="cbw-header-title">${escapeHtml(BOT_NAME)}</div>
        <div class="cbw-header-sub">Usually replies instantly</div>
      </div>
      <button class="cbw-close" aria-label="Close chat">&times;</button>
    </div>
    <div class="cbw-messages"></div>
    <div class="cbw-inputbar">
      <textarea class="cbw-input" rows="1" placeholder="Type a message..."></textarea>
      <button class="cbw-send" aria-label="Send message">${sendIconSvg()}</button>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(win);

  const messagesEl = win.querySelector('.cbw-messages');
  const inputEl = win.querySelector('.cbw-input');
  const sendBtn = win.querySelector('.cbw-send');
  const closeBtn = win.querySelector('.cbw-close');

  // ---- Behaviour ----------------------------------------------------
  launcher.addEventListener('click', toggleWindow);
  closeBtn.addEventListener('click', toggleWindow);
  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
  inputEl.addEventListener('input', function () {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 80) + 'px';
  });

  function toggleWindow() {
    isOpen = !isOpen;
    win.classList.toggle('cbw-open', isOpen);
    if (isOpen && messagesEl.children.length === 0) {
      addMessage('bot', WELCOME_MESSAGE);
    }
    if (isOpen) inputEl.focus();
  }

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isSending) return;

    addMessage('user', text);
    history.push({ role: 'user', content: text });
    inputEl.value = '';
    inputEl.style.height = 'auto';
    setSending(true);
    const typingEl = addTypingIndicator();

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: history.slice(-10) }),
      });

      const data = await res.json();
      typingEl.remove();

      if (!res.ok || data.error) {
        addMessage('error', data.error || 'Something went wrong. Please try again.');
      } else {
        addMessage('bot', data.reply);
        history.push({ role: 'assistant', content: data.reply });
      }
    } catch (err) {
      typingEl.remove();
      addMessage('error', 'Could not reach the server. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  }

  function setSending(state) {
    isSending = state;
    sendBtn.disabled = state;
  }

  function addMessage(role, text) {
    const div = document.createElement('div');
    div.className = 'cbw-msg ' + (role === 'user' ? 'cbw-msg-user' : role === 'error' ? 'cbw-msg-error' : 'cbw-msg-bot');
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'cbw-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function chatIconSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>';
  }

  function sendIconSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
  }
})();
