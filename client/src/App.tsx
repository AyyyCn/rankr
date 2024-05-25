import React from 'react';
import { devtools } from 'valtio/utils';
import './index.css';
import Pages from './pages';
import { state } from './State';
import Loader from './components/ui/Loader';
import { useSnapshot } from 'valtio';

devtools(state, 'app state');
const App: React.FC = () => {
    const currentState = useSnapshot(state);
  
    return (
      <>
        <Loader isLoading={currentState.isLoading} color="orange" width={120} />
        <Pages />
      </>
    );
  };

export default App;
