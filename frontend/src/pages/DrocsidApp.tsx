import React from "react";
import { DrocsidMainView } from "../features/drocsid/components/DrocsidMainView";
import { DrocsidThemeProvider } from "../features/drocsid/theme-provider";

/**
 * Główna strona drocsida. Wypełnia całe dostępne miejsce w widoku /app.
 */
export default function DrocsidApp() {
	return (
		<DrocsidThemeProvider>
			<div className="h-full">
				<DrocsidMainView />
			</div>
		</DrocsidThemeProvider>
	);
}
