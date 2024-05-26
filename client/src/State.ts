import { proxy, ref } from 'valtio';
import { Socket } from 'socket.io-client';
import { createSocketWithHandlers, socketIOUrl } from './socket-io';
import { Poll } from 'shared/poll-types';
import { derive, subscribeKey } from 'valtio/utils';
import { getTokenPayload } from './util';
import { nanoid } from 'nanoid';
export enum AppPage {
  Welcome = 'welcome',
  Create = 'create',
  WaitingRoom = 'waiting-room',
  Voting = 'voting',
  Join = 'join',
}
type Me = {
    id: string;
    name: string;
  };

type WsError = {
  type: string;
  message: string;
};

type WsErrorUnique = WsError & {
  id: string;
};

export type AppState = {
    isLoading: boolean;
    currentPage: AppPage;
    poll?: Poll;
    me?: Me;
    accessToken?: string;
    socket?: Socket;
    wsErrors: WsErrorUnique[];
};

  const state: AppState = proxy({
  isLoading: false,
  currentPage: AppPage.Welcome,
  wsErrors: [],
});

const stateWithComputed: AppState = derive(
    {
      me: (get) => {
        const accessToken = get(state).accessToken;
  
        if (!accessToken) {
          return;
        }
  
        const token = getTokenPayload(accessToken);
  
        return {
          id: token.sub,
          name: token.name,
        };
      },
      isAdmin: (get) => {
        if (!get(state).me) {
          return false;
        }
        return get(state).me?.id === get(state).poll?.adminID;
      },
    },
    {
      proxy: state,
    }
  );

const actions = {
  setPage: (page: AppPage): void => {
    state.currentPage = page;
  },
  startOver: (): void => {
    actions.setPage(AppPage.Welcome);
  },
  startLoading: (): void => {
    state.isLoading = true;
  },
  stopLoading: (): void => {
    state.isLoading = false;
  },
  initializePoll: (poll?: Poll): void => {
    state.poll = poll;
  },
  setPollAccessToken: (token?: string): void => {
    state.accessToken = token;
  },
  initializeSocket: (): void => {
    if (!state.socket) {
      state.socket = ref(
        createSocketWithHandlers({
          socketIOUrl,
          state,
          actions,
        })
      );
      return;
    }

    if (!state.socket.connected) {
      state.socket.connect();
      return;
    }

    actions.stopLoading();
    
  },
  
  updatePoll: (poll: Poll): void => {
    state.poll = poll;
  },
  submitRankings: (rankings: string[]): void => {
    state.socket?.emit('submit_rankings', { rankings });
  },
  cancelPoll: (): void => {
    state.socket?.emit('cancel_poll');
  },

  addWsError: (error: WsError): void => {
    state.wsErrors = [
      ...state.wsErrors,
      {
        ...error,
        id: nanoid(6),
      },
    ];
  },
  removeWsError: (id: string): void => {
    state.wsErrors = state.wsErrors.filter((error) => error.id !== id);
  },
};

subscribeKey(state, 'accessToken', () => {
    if (state.accessToken) {
      localStorage.setItem('accessToken', state.accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }
  }
);

  export type AppActions = typeof actions;
  export { stateWithComputed as state, actions };

  

 