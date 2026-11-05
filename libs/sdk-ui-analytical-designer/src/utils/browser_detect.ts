// (C) 2007-2026 GoodData Corporation

// The platform tokens jquery.browser 0.1.0 looked for, in its priority order: the first token the user
// agent contains wins, whatever its position. Tokens after "cros" are never desktop, so they are left out.
const PLATFORM_TOKENS = [
    "ipad",
    "ipod",
    "windows phone",
    "iphone",
    "kindle",
    "silk",
    "android",
    "win",
    "mac",
    "linux",
    "cros",
];
const DESKTOP_PLATFORMS = new Set(["win", "mac", "linux", "cros"]);

/** True unless the user agent names a desktop platform, as jquery.browser classified it. */
export function isMobile(userAgent = window.navigator.userAgent): boolean {
    const ua = userAgent.toLowerCase();
    const platform = PLATFORM_TOKENS.find((token) => ua.includes(token));

    return !DESKTOP_PLATFORMS.has(platform);
}
