const pty = require('node-pty');
const os = require('os');
const { Server } = require('socket.io');

const getShellConfig = (namespaceName) => {
  const isWin = os.platform() === 'win32';

  if (namespaceName === '/windows') {
    return {
      shell: isWin ? 'powershell.exe' : 'pwsh',
      args: isWin ? ['-NoLogo'] : [],
    };
  }

  return {
    shell: isWin ? 'powershell.exe' : 'bash',
    args: isWin ? ['-NoLogo'] : ['-i'],
  };
};

const initTerminal = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const setupNamespace = (namespaceName) => {
    const nsp = io.of(namespaceName);

    nsp.on('connection', (socket) => {
      console.log('User connected:', namespaceName, socket.id);

      const isWin = os.platform() === 'win32';
      const cwd = isWin
        ? process.env.USERPROFILE || process.cwd()
        : process.env.HOME || process.cwd();
      const { shell, args } = getShellConfig(namespaceName);

      let ptyProcess = null;
      let isClosed = false;

      const cleanup = () => {
        if (isClosed) return;
        isClosed = true;

        if (ptyProcess) {
          try {
            ptyProcess.kill();
          } catch (error) {
            // Ignore "already closed" cases.
          }
          ptyProcess = null;
        }
      };

      try {
        ptyProcess = pty.spawn(shell, args, {
          name: 'xterm-256color',
          cols: 80,
          rows: 30,
          cwd,
          env: {
            ...process.env,
            TERM: 'xterm-256color',
            COLORTERM: 'truecolor',
          },
        });
      } catch (error) {
        console.error('PTY spawn error:', error);
        socket.emit('terminal-error', 'Failed to start terminal session.');
        return;
      }

      ptyProcess.onData((chunk) => {
        if (!socket.connected || isClosed) return;
        socket.emit('terminal-output', chunk);
      });

      ptyProcess.onExit(({ exitCode, signal }) => {
        if (!socket.connected) {
          cleanup();
          return;
        }

        socket.emit('terminal-exit', { exitCode, signal });
        cleanup();
      });

      socket.on('terminal-input', (data) => {
        if (isClosed || !ptyProcess || typeof data !== 'string' || data.length === 0) {
          return;
        }

        try {
          ptyProcess.write(data);
        } catch (error) {
          console.log('PTY write error:', error);
        }
      });

      socket.on('terminal-resize', (size) => {
        if (isClosed || !ptyProcess) return;

        const cols = Number(size?.cols);
        const rows = Number(size?.rows);

        if (!Number.isInteger(cols) || !Number.isInteger(rows) || cols < 1 || rows < 1) {
          return;
        }

        try {
          ptyProcess.resize(cols, rows);
        } catch (error) {
          console.log('Resize error:', error);
        }
      });

      socket.once('disconnect', () => {
        console.log('Session closed:', namespaceName, socket.id);
        cleanup();
      });
    });
  };

  setupNamespace('/linux');
  setupNamespace('/windows');
};

module.exports = initTerminal;
