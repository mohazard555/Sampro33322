import React, { useState } from 'react';
import { UserIcon } from './Icons';

interface LoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  companyName: string;
  companyLogo: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, companyName, companyLogo }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const success = await onLogin(username, password);
    if (!success) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-200 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            {companyLogo ? (
                 <img src={companyLogo} alt="Company Logo" className="h-16 w-auto max-w-[200px] object-contain mx-auto mb-4"/>
            ) : (
                <div className="mx-auto h-16 w-16 bg-zinc-700 rounded-full flex items-center justify-center mb-4">
                    <UserIcon className="h-8 w-8 text-zinc-400" />
                </div>
            )}
          <h1 className="text-3xl md:text-4xl font-bold font-serif text-white">{companyName}</h1>
          <p className="text-lg text-zinc-400 mt-2">تسجيل الدخول إلى لوحة التحكم</p>
        </div>
        
        <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zinc-300">
                اسم المستخدم
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border-zinc-600 bg-zinc-700 text-white shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-base transition-colors duration-200 placeholder:text-zinc-400 px-4 py-2.5"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                كلمة المرور
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border-zinc-600 bg-zinc-700 text-white shadow-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-base transition-colors duration-200 placeholder:text-zinc-400 px-4 py-2.5"
              />
            </div>
            
            {error && <p className="text-red-400 text-center text-sm">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-800 focus:ring-amber-500 disabled:bg-amber-800 disabled:cursor-not-allowed"
              >
                {isLoading ? 'جارِ التحقق...' : 'تسجيل الدخول'}
              </button>
            </div>
          </form>
        </div>
        <div className="text-center mt-8 text-sm text-zinc-500">
            <p>للدخول الافتراضي: admin / admin</p>
            <p>طور بواسطة مهند أحمد | 963998171954+</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
