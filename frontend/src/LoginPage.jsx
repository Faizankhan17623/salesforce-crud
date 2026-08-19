import { API_BASE_URL } from './config';

function LoginPage() {
  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/login`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-white rounded-xl shadow-xl p-10 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Salesforce CRUD</h1>
        <p className="text-slate-500 mb-8">
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
