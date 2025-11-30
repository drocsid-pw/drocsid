import React from "react";
import { DrocsidMainView } from "../features/drocsid/components/DrocsidMainView";

/**
 * Główna strona drocsida. Wypełnia całe dostępne miejsce w widoku /app.
 */
export default function DrocsidApp() {
	return (
		<div className="h-full">
			<DrocsidMainView />
		</div>
	);
}
