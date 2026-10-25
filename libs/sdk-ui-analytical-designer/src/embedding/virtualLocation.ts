// (C) 2026 GoodData Corporation

/**
 * Virtual navigation for hosted-component mode: while a navigate function is registered (by
 * HostedLocation, rendered by the hosted branch of Root), setLocation delegates to it instead of
 * mutating window.location — AD rendered inside a host app must never touch the real browser URL.
 */
let virtualNavigate: ((to: string) => void) | null = null;

export function registerVirtualNavigate(navigate: (to: string) => void): () => void {
    virtualNavigate = navigate;
    return () => {
        if (virtualNavigate === navigate) {
            virtualNavigate = null;
        }
    };
}

export function getVirtualNavigate(): ((to: string) => void) | null {
    return virtualNavigate;
}
