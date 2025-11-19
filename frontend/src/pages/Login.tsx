import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const Login: React.FC = () => {
    const [user, setUser] = React.useState<CredentialResponse | null>(null);

    const handleSuccess = (credentialResponse: CredentialResponse) => {
        console.log('Login Success:', credentialResponse);
        setUser(credentialResponse);
    };

    const handleError = () => {
        console.log('Login Failed');
    };

    if (user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
                <h1 className="text-3xl font-bold text-slate-800">Zalogowano</h1>
                <button
                    onClick={() => setUser(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                >
                    Wyloguj się
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
            <h1 className="text-3xl font-bold text-slate-800">Zaloguj się</h1>

            <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    useOneTap
                />
            </div>
        </div>
    );
};

export default Login;
