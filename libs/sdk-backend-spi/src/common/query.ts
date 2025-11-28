// (C) 2025 GoodData Corporation

/**
 * Indicates which backend endpoint flavor the query should use.
 *
 * Some catalog-style APIs expose both a straightforward `GET` endpoint and an enriched search-specific
 * `POST` endpoint (typically `/search`) that adds advanced filtering or sorting semantics.
 *
 * @beta
 */
export type QueryMethod = "GET" | "POST";
