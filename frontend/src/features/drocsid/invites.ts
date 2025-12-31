export type InviteLinkArgs = {
	guildId: string;
	channelId?: string | null;
	code?: string | null;
};

export function buildInviteLink(args: InviteLinkArgs): string {
	const url = new URL(window.location.origin);
	url.pathname = "/app";

	const invite = (args.code ?? args.guildId).trim();
	url.searchParams.set("invite", invite);

	if (args.channelId) {
		url.searchParams.set("channel", args.channelId);
	}

	return url.toString();
}

export function readInviteFromLocation(): { invite: string | null; channelId: string | null } {
	const url = new URL(window.location.href);
	const invite = url.searchParams.get("invite");
	const channelId = url.searchParams.get("channel");
	return { invite, channelId };
}

export function clearInviteFromUrl(): void {
	const url = new URL(window.location.href);
	url.searchParams.delete("invite");
	url.searchParams.delete("channel");
	window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

export async function copyToClipboard(text: string): Promise<void> {
	if (navigator.clipboard?.writeText) {
		await navigator.clipboard.writeText(text);
		return;
	}

	const el = document.createElement("textarea");
	el.value = text;
	el.style.position = "fixed";
	el.style.left = "-9999px";
	document.body.appendChild(el);
	el.focus();
	el.select();
	document.execCommand("copy");
	document.body.removeChild(el);
}
