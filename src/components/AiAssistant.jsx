import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaShoppingBag } from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  registerNavigate,
  buildFrontendSnapshot,
  executeVerifiedFrontendAction,
  getSession,
} from '../services/frontendActionExecutor';
import {
  createWorkflowSession,
  getWorkflowSession,
  openWorkflowSessionStream,
  postWorkflowActionResult,
  postWorkflowMessage,
} from '../services/chatWorkflowClient';

const SESSION_STORAGE_KEY = 'pickzo.aiChatSession';
const INITIAL_MESSAGES = [
  {
    role: 'ai',
    content:
      'Hi! I\'m your Pickzo shopping assistant. I can help you find products, manage your cart, place orders, and more. What can I help you with?',
  },
];

function readStoredSession() {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function mapHistoryToMessages(history = []) {
  const mapped = history
    .filter((entry) => entry?.role === 'assistant' || entry?.role === 'user')
    .map((entry) => ({
      id: entry.id,
      role: entry.role === 'assistant' ? 'ai' : 'user',
      content: entry.content,
    }));

  return mapped.length > 0 ? mapped : INITIAL_MESSAGES;
}

const Avatar = ({ role }) => (
  <div
    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
      role === 'ai'
        ? 'bg-blue-600 text-white'
        : 'bg-gray-200 text-gray-600'
    }`}
  >
    {role === 'ai' ? <FaShoppingBag size={12} /> : 'U'}
  </div>
);

const OptionButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 text-sm font-semibold rounded-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-colors"
  >
    {label}
  </button>
);

const OptionGroup = ({ options, onSelect }) => (
  <div className="flex flex-wrap gap-2 mt-2">
    {options.map((opt) => (
      <OptionButton key={opt} label={opt} onClick={() => onSelect(opt)} />
    ))}
  </div>
);

const SessionBadge = ({ session }) => {
  if (!session.loginStatus) return null;
  return (
    <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-xs text-green-700 font-medium flex items-center gap-1.5 shrink-0">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      {session.userName || 'Logged in'}
    </div>
  );
};

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingOptions, setPendingOptions] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(getSession());
  const [chatSession, setChatSession] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamRef = useRef(null);
  const handleWorkflowEventRef = useRef(null);
  const processedActionIdsRef = useRef(new Set());
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const refreshLocalSession = useCallback(() => {
    setSessionInfo(getSession());
  }, []);

  const addMessage = useCallback((role, content, id = null) => {
    setMessages((prev) => {
      if (id && prev.some((entry) => entry.id === id)) {
        return prev;
      }

      return [...prev, { id, role, content }];
    });
  }, []);

  const replaceMessagesFromHistory = useCallback((history) => {
    setMessages(mapHistoryToMessages(history));
  }, []);

  const attachStream = useCallback((sessionState) => {
    const stream = openWorkflowSessionStream(sessionState.sessionId, sessionState.sessionToken, {
      onEvent: (event) => handleWorkflowEventRef.current?.(event, sessionState),
      onError: (error) => {
        if (error?.retryCount && error?.maxRetries) {
          if (error.retryCount === 1) {
            addMessage('ai', 'Connection lost. Reconnecting...');
          }
          return;
        }
        addMessage('ai', 'Connection lost. Please refresh the page or try again.');
        setLoading(false);
      },
    });

    streamRef.current?.close?.();
    streamRef.current = stream;
    return stream;
  }, []);

  useEffect(() => {
    registerNavigate(navigate);
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    refreshLocalSession();
  }, [location.pathname, refreshLocalSession]);

  useEffect(() => {
    const restore = async () => {
      const stored = readStoredSession();
      if (!stored?.sessionId || !stored?.sessionToken) {
        return;
      }

      try {
        const { session } = await getWorkflowSession(stored.sessionId, stored.sessionToken);
        setChatSession({ sessionId: stored.sessionId, sessionToken: stored.sessionToken });
        replaceMessagesFromHistory(session.history || []);
        setPendingOptions(session.pendingQuestion || null);
        setLoading(session.status === 'running' || session.status === 'waiting_for_action');
        refreshLocalSession();

        attachStream({ sessionId: stored.sessionId, sessionToken: stored.sessionToken });
      } catch {
        clearStoredSession();
      }
    };

    restore();

    return () => {
      streamRef.current?.close?.();
    };
  }, [attachStream, refreshLocalSession, replaceMessagesFromHistory]);

  const ensureSession = useCallback(async () => {
    if (chatSession?.sessionId && chatSession?.sessionToken) {
      return chatSession;
    }

    const created = await createWorkflowSession({
      snapshot: buildFrontendSnapshot(),
      conversation: messages.map((message) => ({
        role: message.role === 'ai' ? 'assistant' : 'user',
        content: message.content,
      })),
    });
    const sessionState = {
      sessionId: created.session.id,
      sessionToken: created.sessionToken,
    };

    setChatSession(sessionState);
    writeStoredSession(sessionState);

    const stream = attachStream(sessionState);
    await stream.ready;

    return sessionState;
  }, [attachStream, chatSession, messages]);

  const handleActionRequest = useCallback(async (sessionState, action) => {
    if (!action?.id || processedActionIdsRef.current.has(action.id)) {
      return;
    }

    processedActionIdsRef.current.add(action.id);
    setLoading(true);

    try {
      const result = await executeVerifiedFrontendAction(action);
      const snapshot = buildFrontendSnapshot();

      await postWorkflowActionResult(sessionState.sessionId, sessionState.sessionToken, {
        result,
        snapshot,
      });
      refreshLocalSession();
    } catch (error) {
      const snapshot = buildFrontendSnapshot();

      await postWorkflowActionResult(sessionState.sessionId, sessionState.sessionToken, {
        result: {
          tool: action.tool,
          args: action.args || {},
          status: 'error',
          message: error.message || 'Frontend action failed.',
          verified: false,
          currentPage: snapshot.currentPage,
          url: snapshot.url,
          data: snapshot.pageData,
          context: {
            loginStatus: snapshot.loginStatus,
            selectedProduct: snapshot.selectedProduct,
            checkoutStep: snapshot.checkoutStep,
          },
        },
        snapshot,
      });
    }
  }, [refreshLocalSession]);

  const handleWorkflowEvent = useCallback((event, sessionState) => {
    switch (event.event) {
      case 'session.state': {
        const session = event.data?.session;
        if (session?.history) {
          replaceMessagesFromHistory(session.history);
        }
        setPendingOptions(session?.pendingQuestion || null);
        setLoading(session?.status === 'running' || session?.status === 'waiting_for_action');
        if (session?.status === 'waiting_for_action' && session.lastActionRequest) {
          handleActionRequest(sessionState, session.lastActionRequest);
        }
        break;
      }
      case 'assistant.message':
        if (event.data?.message) {
          addMessage('ai', event.data.message, event.id);
        }
        break;
      case 'workflow.question':
        setPendingOptions(event.data?.question || null);
        setLoading(false);
        break;
      case 'workflow.action':
        setPendingOptions(null);
        handleActionRequest(sessionState, event.data?.action);
        break;
      case 'workflow.completed':
        setPendingOptions(null);
        setLoading(false);
        refreshLocalSession();
        break;
      case 'workflow.error':
        if (event.data?.message) {
          addMessage('ai', event.data.message, event.id);
        }
        setPendingOptions(null);
        setLoading(false);
        break;
      case 'workflow.state':
        setPendingOptions(event.data?.pendingQuestion || null);
        setLoading(event.data?.status === 'running' || event.data?.status === 'waiting_for_action');
        break;
      default:
        break;
    }
  }, [addMessage, handleActionRequest, refreshLocalSession, replaceMessagesFromHistory]);
  handleWorkflowEventRef.current = handleWorkflowEvent;

  const handleOptionSelect = async (option) => {
    setPendingOptions(null);
    addMessage('user', option);
    setLoading(true);

    try {
      const sessionState = await ensureSession();
      await postWorkflowMessage(sessionState.sessionId, sessionState.sessionToken, {
        message: option,
        snapshot: buildFrontendSnapshot(),
      });
    } catch {
      addMessage('ai', 'Sorry, I encountered an error. Please try again.');
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;

    setInput('');

    if (loading) return;

    addMessage('user', text);
    setLoading(true);
    refreshLocalSession();

    try {
      const sessionState = await ensureSession();
      await postWorkflowMessage(sessionState.sessionId, sessionState.sessionToken, {
        message: text,
        snapshot: buildFrontendSnapshot(),
      });
    } catch {
      addMessage(
        'ai',
        'Sorry, I encountered an error. Please try again.'
      );
      setLoading(false);
    } finally {
      scrollToBottom();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderContent = (content) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-label="Open AI Assistant"
      >
        <FaRobot size={22} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 right-5 z-50 w-[380px] h-[560px] max-w-[calc(100vw-40px)] max-h-[calc(100vh-80px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 text-white shrink-0">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <FaShoppingBag size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">Pickzo Assistant</div>
                <div className="text-[11px] text-blue-100">
                  {loading ? 'Thinking...' : 'Online'}
                </div>
              </div>
              <SessionBadge session={sessionInfo} />
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && <Avatar role="ai" />}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-white text-gray-700 border border-gray-100 shadow-sm rounded-bl-md'
                    }`}
                  >
                    {renderContent(msg.content)}
                  </div>
                  {msg.role === 'user' && <Avatar role="user" />}
                </div>
              ))}

              {pendingOptions && pendingOptions.text && (
                <div className="flex gap-2 justify-start">
                  <Avatar role="ai" />
                  <div className="bg-white text-gray-700 border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed">
                    {pendingOptions.text}
                  </div>
                </div>
              )}

              {pendingOptions && Array.isArray(pendingOptions.options) && pendingOptions.options.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-3.5 py-2.5">
                    <OptionGroup
                      options={pendingOptions.options}
                      onSelect={handleOptionSelect}
                    />
                  </div>
                </div>
              )}

              {loading && !pendingOptions && (
                <div className="flex gap-2 justify-start">
                  <Avatar role="ai" />
                  <div className="bg-white text-gray-500 border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm flex items-center gap-2">
                    <FaSpinner className="animate-spin" size={12} />
                    Working...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-3 bg-white shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    pendingOptions
                      ? 'Type your answer...'
                      : 'Type your message...'
                  }
                  disabled={loading}
                  className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-gray-50 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0 transition-colors"
                >
                  <FaPaperPlane size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiAssistant;
