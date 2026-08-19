import { API_BASE_URL } from './config';

function LoginPage({ darkMode, onToggleDarkMode }) {
  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/login`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 dark:bg-black relative">
      <button
        onClick={onToggleDarkMode}
        className="absolute top-4 right-4 text-slate-300 hover:text-white text-sm border border-slate-600 rounded-lg px-3 py-1.5 cursor-pointer"
      >
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-10 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Salesforce CRUD</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Manage Accounts, Opportunities, Leads, Contacts &amp; Cases.
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer"
        >
          Login with Salesforce
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
