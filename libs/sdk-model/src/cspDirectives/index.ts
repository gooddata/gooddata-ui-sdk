// (C) 2026 GoodData Corporation

/**
 * Content Security Policy directive of the organization.
 *
 * @alpha
 */
export interface ICspDirective {
    /**
     * Name of the directive, for example `script-src` or `img-src`.
     */
    id: string;

    /**
     * Sources allowed by the directive, for example `'self'`, `https://example.com` or `*.example.com`.
     */
    sources: string[];
}
