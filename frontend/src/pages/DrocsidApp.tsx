import React from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { DrocsidMainView } from "../features/drocsid/components/DrocsidMainView";
import { DrocsidThemeProvider } from "../features/drocsid/theme-provider";
import { useAuth } from "../auth/auth";

export default function DrocsidApp() {
	const { isAuthenticated, setToken } = useAuth();

	if (!isAuthenticated) {
		const handleSuccess = (resp: CredentialResponse) => {
			if (!resp.credential) {
				return;
			}
			setToken(resp.credential);
		};

		return (
			<div className="w-full flex items-center justify-center p-6">
				<div className="max-w-md w-full rounded-3xl border bg-white shadow-sm p-6">
					<h1 className="text-xl font-semibold">Zaloguj się</h1>
					<p className="text-sm text-slate-600 mt-2">Backend wymaga Google ID tokena w Authorization.</p>

					<div className="mt-6">
						<GoogleLogin onSuccess={handleSuccess} onError={() => null} useOneTap />
					</div>
				</div>
			</div>
		);
	}

	return (
		<DrocsidThemeProvider>
			<div className="h-full w-full">
				<DrocsidMainView />
			</div>
		</DrocsidThemeProvider>
	);
}
