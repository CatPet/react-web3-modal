import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Count from './views/Count';
import { Web3ContextProvider } from './hooks/useWeb3context';

const App = () => {
  return (
    <Web3ContextProvider>
      <div className="App">
        <header className="App-header">
          <Count />
        </header>
      </div>
    </Web3ContextProvider>
  );
}

export default App;
