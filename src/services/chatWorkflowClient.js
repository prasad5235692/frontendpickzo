import axios from '../api/axios';

function getSessionHeaders(sessionToken) {
  return sessionToken
    ? { 'X-Chat-Session-Token': sessionToken }
    : {};
}

function getStreamHeaders(sessionToken) {
  const headers = {
    Accept: 'text/event-stream',
    ...getSessionHeaders(sessionToken),
  };
  const token = localStorage.getItem('token');

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getStreamBaseUrl() {
  return (axios.defaults.baseURL || '').replace(/\/$/, '');
}

function buildStreamUrl(sessionId, sessionToken) {
  const baseUrl = getStreamBaseUrl();
  const url = new URL(`${baseUrl}/chat/sessions/${sessionId}/stream`);

  if (sessionToken) {
    url.searchParams.set('sessionToken', sessionToken);
  }

  return url.toString();
}

function parseEventChunk(chunk) {
  const lines = chunk.split(/\r?\n/);
  let event = 'message';
  let id = '';
  const dataLines = [];

  for (const line of lines) {
    if (!line || line.startsWith(':')) {
      continue;
    }

    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
      continue;
    }

    if (line.startsWith('id:')) {
      id = line.slice(3).trim();
      continue;
    }

    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  const rawData = dataLines.join('\n');
  let data = rawData;

  try {
    data = JSON.parse(rawData);
  } catch {
    data = rawData;
  }

  return { id, event, data };
}

async function readEventStream(stream, onEvent) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split(/\r?\n\r?\n/);
    buffer = chunks.pop() || '';

    for (const chunk of chunks) {
      const parsed = parseEventChunk(chunk);
      if (parsed) {
        onEvent(parsed);
      }
    }
  }

  if (buffer.trim()) {
    const parsed = parseEventChunk(buffer);
    if (parsed) {
      onEvent(parsed);
    }
  }
}

export async function createWorkflowSession({ snapshot, conversation = [] }) {
  const response = await axios.post('/chat/sessions', {
    snapshot,
    conversation,
  });

  return response.data;
}

export async function getWorkflowSession(sessionId, sessionToken) {
  const response = await axios.get(`/chat/sessions/${sessionId}`, {
    headers: getSessionHeaders(sessionToken),
  });

  return response.data;
}

export async function postWorkflowMessage(sessionId, sessionToken, { message, snapshot }) {
  const response = await axios.post(
    `/chat/sessions/${sessionId}/messages`,
    { message, snapshot, sessionToken },
    { headers: getSessionHeaders(sessionToken) }
  );

  return response.data;
}

export async function postWorkflowActionResult(sessionId, sessionToken, { result, snapshot }) {
  const response = await axios.post(
    `/chat/sessions/${sessionId}/action-results`,
    { result, snapshot, sessionToken },
    { headers: getSessionHeaders(sessionToken) }
  );

  return response.data;
}

const MAX_RECONNECT_RETRIES = 5;
const BASE_RECONNECT_DELAY = 1000;

export function openWorkflowSessionStream(sessionId, sessionToken, { onEvent, onError }) {
  const controller = new AbortController();
  let resolveReady;
  let rejectReady;
  let retryCount = 0;
  let readyResolved = false;

  const ready = new Promise((resolve, reject) => {
    resolveReady = resolve;
    rejectReady = reject;
  });

  async function connect() {
    const streamUrl = buildStreamUrl(sessionId, sessionToken);

    try {
      const response = await fetch(streamUrl, {
        method: 'GET',
        headers: getStreamHeaders(sessionToken),
        signal: controller.signal,
        cache: 'no-store',
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to connect to workflow stream (${response.status})`);
      }

      retryCount = 0;

      if (!readyResolved) {
        readyResolved = true;
        resolveReady();
      }

      await readEventStream(response.body, onEvent);
    } catch (error) {
      if (controller.signal.aborted) {
        if (!readyResolved) {
          readyResolved = true;
          resolveReady();
        }
        return;
      }

      retryCount++;

      if (retryCount <= MAX_RECONNECT_RETRIES) {
        const delay = BASE_RECONNECT_DELAY * Math.pow(2, retryCount - 1);

        onError?.({
          retryCount,
          maxRetries: MAX_RECONNECT_RETRIES,
          delay,
          message: `Reconnecting in ${delay}ms (attempt ${retryCount}/${MAX_RECONNECT_RETRIES})`,
        });

        setTimeout(connect, delay);
      } else {
        if (!readyResolved) {
          readyResolved = true;
          rejectReady(error);
        }

        onError?.(error);
      }
    }
  }

  connect();

  return {
    ready,
    close: () => controller.abort(),
  };
}