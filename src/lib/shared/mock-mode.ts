export function isMockMode(): boolean {
	if (typeof localStorage === 'undefined') return false;
	return localStorage.getItem('ms-mock-mode') === 'true';
}

export function persistMockMode(enabled: boolean): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem('ms-mock-mode', String(enabled));
}
