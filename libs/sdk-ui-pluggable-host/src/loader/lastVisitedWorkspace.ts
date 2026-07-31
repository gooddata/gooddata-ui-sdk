// (C) 2026 GoodData Corporation

const STORAGE_KEY = "gdc-host-lastVisitedWorkspace";

/**
 * Who a remembered workspace belongs to.
 *
 * Both parts are needed because localStorage belongs to the *origin*, not to the session or
 * the backend:
 * - every account signing in from the same browser profile shares the key, so one user must
 *   not be sent to another user's workspace just because both can access it;
 * - one origin can be pointed at different backends — a local dev server switched between
 *   environments — where the same login exists but its workspaces do not.
 */
export interface ILastVisitedWorkspaceOwner {
    organizationId: string | undefined;
    userId: string;
}

/**
 * Remembered workspace per owner, keyed by `organizationId|userId`.
 *
 * The delimiter is safe for GoodData identifiers, which are restricted to alphanumerics, `.`,
 * `_` and `-`; a login containing `|` could at worst read another entry of the same origin.
 */
interface ILastVisitedWorkspaceRecord {
    [ownerKey: string]: string;
}

function ownerKey({ organizationId, userId }: ILastVisitedWorkspaceOwner): string {
    return `${organizationId ?? "-"}|${userId}`;
}

/**
 * Parses the stored JSON into a record that is safe to read and to write through, discarding
 * missing, corrupt or unexpectedly shaped values.
 *
 * Two properties are established here so every caller can rely on them:
 * - the record has a **null prototype**, so an owner key ending in `__proto__` becomes an
 *   ordinary own key (on a plain object that assignment hits the legacy prototype setter and
 *   the entry is silently dropped by `JSON.stringify`) and keys like `constructor` or
 *   `toString` cannot pick up a function from `Object.prototype`;
 * - every retained value is a **non-empty string**, so a hand-edited `{"user": 42}` can never
 *   reach `backend.workspace()` as a bogus id.
 */
function safeParse(raw: string | null): ILastVisitedWorkspaceRecord {
    const record: ILastVisitedWorkspaceRecord = Object.create(null);
    if (!raw) {
        return record;
    }
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
            return record;
        }
        for (const [key, value] of Object.entries(parsed)) {
            if (typeof value === "string" && value) {
                record[key] = value;
            }
        }
    } catch {
        // Intentionally ignored — a corrupt value is treated as "nothing remembered"
    }
    return record;
}

/**
 * Returns the workspace the given owner visited last, or `undefined` when nothing usable is
 * stored for them or the stored value cannot be read.
 */
export function getLastVisitedWorkspace(owner: ILastVisitedWorkspaceOwner): string | undefined {
    try {
        return safeParse(localStorage.getItem(STORAGE_KEY))[ownerKey(owner)];
    } catch {
        return undefined;
    }
}

/**
 * Persists the workspace the given owner is currently in, so that a later landing on a URL
 * that carries no workspace ("/", "/workspace/", a bare legacy app path) can return to it
 * instead of falling back to their first workspace.
 * Silently swallows errors (e.g. storage full, private browsing).
 */
export function setLastVisitedWorkspace(owner: ILastVisitedWorkspaceOwner, workspaceId: string): void {
    try {
        const record = safeParse(localStorage.getItem(STORAGE_KEY));
        record[ownerKey(owner)] = workspaceId;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
        // Intentionally ignored — localStorage may be unavailable or full
    }
}

/**
 * Forgets the owner's stored workspace, but only while it is still `expectedWorkspaceId`,
 * so the next landing does not keep retrying a workspace that turned out to be unusable
 * (deleted, or access revoked).
 *
 * The compare matters because the decision to forget is made across an `await`: a newer
 * navigation may have stored a different workspace in the meantime, and that one should
 * survive. It narrows the window rather than closing it — another tab can still write between
 * the read and the delete, and the cost of that rare interleaving is one lost preference,
 * re-established on the next visit.
 */
export function clearLastVisitedWorkspace(
    owner: ILastVisitedWorkspaceOwner,
    expectedWorkspaceId: string,
): void {
    try {
        const record = safeParse(localStorage.getItem(STORAGE_KEY));
        const key = ownerKey(owner);
        if (record[key] !== expectedWorkspaceId) {
            return;
        }
        delete record[key];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
        // Intentionally ignored — localStorage may be unavailable
    }
}
