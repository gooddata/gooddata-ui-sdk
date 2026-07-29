// (C) 2026 GoodData Corporation

/**
 * A saved object's server-managed fields (those beyond its definition). The Pick keeps required
 * saved-only fields required, so a new one fails the build at the pick rather than being dropped.
 * @internal
 */
export type ServerIdentity<TSaved, TDef> = Pick<TSaved, Exclude<keyof TSaved, keyof TDef>>;
