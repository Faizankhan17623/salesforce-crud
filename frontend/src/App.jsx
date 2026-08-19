import { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import Dashboard from './Dashboard';

function App() {
  const params = new URLSearchParams(window.location.search);

  const [token, setToken] = useState(params.get('token') || '');
  const [instance, setInstance] = useState(params.get('instance') || '');
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  const handleLogout = () => {
    setToken('');
    setInstance('');
    window.history.replaceState({}, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {token && instance ? (
        <Dashboard
          token={token}
          instance={instance}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
        />
      ) : (
        <LoginPage darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      )}
    </div>
  );
}

export default App;
