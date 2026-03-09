import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import 'xterm/css/xterm.css';

const osStyles = {
  linux: {
    bg: '#300A24',
    header: '#1A0612',
    activeTab: '#E95420',
    border: '#5E2750',
    cursor: '#ffffff',
    font: '"Ubuntu Mono", monospace',
  },
  windows: {
    bg: '#0C0C0C',
    header: '#2D2D2D',
    activeTab: '#4D4D4D',
    border: '#333333',
    cursor: '#C7C7C7',
    font: '"Cascadia Code", "Consolas", monospace',
  },
};

const SOCKET_BASE_URL = 'http://localhost:8000';

const TerminalComponent = () => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const socketRef = useRef(null);
  const fitAddonRef = useRef(null);
  const resizeHandlerRef = useRef(null);
  const fitTimerRef = useRef(null);
  const currentLineRef = useRef('');

  const [osType, setOsType] = useState('linux');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const existingSocket = socketRef.current;
    const existingTerminal = xtermRef.current;

    if (resizeHandlerRef.current) {
      window.removeEventListener('resize', resizeHandlerRef.current);
      resizeHandlerRef.current = null;
    }

    if (fitTimerRef.current) {
      clearTimeout(fitTimerRef.current);
      fitTimerRef.current = null;
    }

    if (existingSocket) {
      existingSocket.removeAllListeners();
      existingSocket.disconnect();
      socketRef.current = null;
    }

    if (existingTerminal) {
      existingTerminal.dispose();
      xtermRef.current = null;
    }

    fitAddonRef.current = null;
    currentLineRef.current = '';

    if (!terminalRef.current) return undefined;

    terminalRef.current.innerHTML = '';

    const socket = io(`${SOCKET_BASE_URL}/${osType}`, {
      autoConnect: false,
      reconnection: false,
      transports: ['websocket'],
    });
    socketRef.current = socket;

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'block',
      fontSize: 14,
      fontFamily: osStyles[osType].font,
      scrollback: 1000,
      theme: {
        background: osStyles[osType].bg,
        foreground: '#cccccc',
        cursor: osStyles[osType].cursor,
        selectionBackground: 'rgba(255,255,255,0.2)',
      },
    });

    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    xtermRef.current = term;

    const sendResize = () => {
      if (!socket.connected) return;
      socket.emit('terminal-resize', {
        cols: term.cols,
        rows: term.rows,
      });
    };

    const handleResize = () => {
      fitAddon.fit();
      sendResize();
    };

    resizeHandlerRef.current = handleResize;
    window.addEventListener('resize', handleResize);

    fitTimerRef.current = setTimeout(() => {
      fitAddon.fit();
    }, 100);

    const terminalInputDisposable = term.onData((data) => {
      if (!socket.connected) return;

      socket.emit('terminal-input', data);

      if (data === '\r') {
        const command = currentLineRef.current.trim();
        if (command) {
          setHistory((prev) => [
            ...prev,
            {
              command,
              response: '',
              time: new Date(),
            },
          ]);
        }
        currentLineRef.current = '';
        return;
      }

      if (data === '\u007F') {
        currentLineRef.current = currentLineRef.current.slice(0, -1);
        return;
      }

      currentLineRef.current += data.replace(/[\x00-\x1F\x7F]/g, '');
    });

    const outputHandler = (data) => {
      if (typeof data !== 'string') return;

      if (data.includes('\x1bc')) {
        term.reset();
        return;
      }

      term.write(data);

      setHistory((prev) => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        const last = updated[updated.length - 1];
        updated[updated.length - 1] = {
          ...last,
          response: last.response + data,
        };
        return updated;
      });
    };

    const connectHandler = () => {
      fitAddon.fit();
      sendResize();
    };

    const errorHandler = (message) => {
      term.writeln(`\r\n[Terminal error] ${message || 'Unknown error'}`);
    };

    const exitHandler = ({ exitCode }) => {
      term.writeln(`\r\n[Session ended] Exit code: ${exitCode ?? 'unknown'}`);
    };

    socket.on('connect', connectHandler);
    socket.on('terminal-output', outputHandler);
    socket.on('terminal-error', errorHandler);
    socket.on('terminal-exit', exitHandler);
    socket.connect();

    return () => {
      terminalInputDisposable.dispose();

      if (fitTimerRef.current) {
        clearTimeout(fitTimerRef.current);
        fitTimerRef.current = null;
      }

      if (resizeHandlerRef.current) {
        window.removeEventListener('resize', resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }

      socket.off('connect', connectHandler);
      socket.off('terminal-output', outputHandler);
      socket.off('terminal-error', errorHandler);
      socket.off('terminal-exit', exitHandler);
      socket.disconnect();

      term.dispose();
    };
  }, [osType]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] p-4">
      <style>{`
        .xterm-viewport::-webkit-scrollbar { display:none; }
        .xterm-screen { padding:12px; }
      `}</style>

      <div
        className="w-full max-w-5xl overflow-hidden rounded-md shadow-2xl"
        style={{ border: `1px solid ${osStyles[osType].border}` }}
      >
        <div
          className="flex h-10 items-center justify-between px-3"
          style={{ backgroundColor: osStyles[osType].header }}
        >
          <div className="flex items-center gap-2">
            <div className="flex space-x-1.5">
              <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>

            <span className="ml-4 font-mono text-[10px] uppercase text-gray-400">
              {osType === 'linux' ? 'ubuntu@bash' : 'admin@pwsh'}
            </span>
          </div>

          <div className="flex gap-1 rounded bg-black/20 p-1">
            <button
              onClick={() => setOsType('linux')}
              className={`rounded px-4 py-1 text-[10px] font-bold ${
                osType === 'linux' ? 'bg-[#E95420] text-white' : 'text-gray-500'
              }`}
              type="button"
            >
              LINUX
            </button>

            <button
              onClick={() => setOsType('windows')}
              className={`rounded px-4 py-1 text-[10px] font-bold ${
                osType === 'windows' ? 'bg-[#4D4D4D] text-white' : 'text-gray-500'
              }`}
              type="button"
            >
              WINDOWS
            </button>
          </div>
        </div>

        <div className="h-[520px]" style={{ backgroundColor: osStyles[osType].bg }}>
          <div ref={terminalRef} className="h-full w-full" />
        </div>
      </div>

      <div className="mt-4 text-[10px] text-gray-600">Total Commands Logged: {history.length}</div>
    </div>
  );
};

export default TerminalComponent;
