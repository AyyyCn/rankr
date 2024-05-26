import { io, Socket } from 'socket.io-client';
import { AppActions, AppState } from './State';

export const socketIOUrl = `http://${import.meta.env.VITE_API_HOST}:${import.meta.env.VITE_API_PORT}/${import.meta.env.VITE_POLLS_NAMESPACE}`;

type CreateSocketOptions = {
  socketIOUrl: string;
  state: AppState;
  actions: AppActions;
};

export const createSocketWithHandlers = ({ socketIOUrl, state, actions }: CreateSocketOptions): Socket => {
  const socket = io(socketIOUrl, {
    auth: {
      token: state.accessToken,
    },
  });

  socket.on('connect', () => {
    console.log('Socket connected');
    
    // Emit user information when connected
    if (state.me && state.poll) {
      socket.emit('join_poll', {
        userID: state.me.id,
        name: state.me.name,
        pollID: state.poll.id,
      });
    }
    actions.stopLoading();
  });

  socket.on('connect_error', () => {
    console.log(`Failed to connect socket`);
    actions.addWsError({
      type: 'Connection Error',
      message: 'Failed to connect to the poll',
    });
    actions.stopLoading();
  });

  socket.on('disconnect', (reason) => {
    console.error('Socket disconnected:', reason);
    // Optionally, attempt to reconnect after a delay
    setTimeout(() => {
      socket.connect();
    }, 3000);
  });

  socket.on('exception', (error) => {
    console.log('WS exception: ', error);
    actions.addWsError(error);
  });
  
  socket.on('poll_updated', (poll) => {
    actions.updatePoll(poll);
  });

  socket.on('poll_cancelled', () => {
    actions.startOver();
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};
