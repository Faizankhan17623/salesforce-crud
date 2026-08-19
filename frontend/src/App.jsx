import { useState } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';

function App() {
  const params = new URLSearchParams(window.location.search);

  const [token, setToken] = useState(params.get('token') || '');
  const [instance, setInstance] = useState(params.get('instance') || '');

  return (
    <div className="min-h-screen bg-slate-100">
      {token && instance ? (
        <Dashboard token={token} instance={instance} />
      ) : (
        <LoginPage />
      )}
    </div>
  );
}

export default App;
