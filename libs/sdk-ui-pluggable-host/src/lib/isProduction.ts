// (C) 2026 GoodData Corporation

/**
 * Reads the compile-time PRODUCTION flag if the consumer's bundler defines it
 * (e.g. via vite's `define: { PRODUCTION: ... }`); defaults to false (dev-mode
 * semantics) when undefined.
 *
 * Reading `PRODUCTION` directly as a bare identifier throws ReferenceError in
 * any consumer whose bundler doesn't substitute it — `typeof` is the only safe
 * way to probe for an unbound global without crashing.
 *
 * @internal
 */
export const isProduction: boolean = typeof PRODUCTION !== "undefined" && PRODUCTION;
