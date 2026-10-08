// (C) 2026 GoodData Corporation

import { type ObjRef, isIdentifierRef } from "@gooddata/sdk-model";

import { type TigerAuthenticatedCallGuard } from "../../types/index.js";
import { objRefToIdentifier } from "../../utils/api.js";

/**
 * Build the active-styling setting content from a reference. A bare id string (or an untyped/org-typed
 * reference) is treated as organization-scoped; only a reference explicitly typed as the workspace scope
 * activates the workspace collection. The scope must be explicit so the id resolves against the right
 * scope with no cross-scope fallback. Without a `workspaceType`, the setting lives in a scope that has no
 * workspace (a user setting) and a workspace-typed reference is rejected.
 *
 * @internal
 */
export function activeStylingContent(
    ref: string | ObjRef,
    organizationType: "theme" | "colorPalette",
    workspaceType: "workspaceTheme" | "workspaceColorPalette" | undefined,
    authCall: TigerAuthenticatedCallGuard,
): { id: string; type: string } {
    if (typeof ref === "string") {
        return { id: ref, type: organizationType };
    }
    const id = objRefToIdentifier(ref, authCall);
    const refType = isIdentifierRef(ref) ? ref.type : undefined;
    // A bare / uri / untyped reference defaults to the organization scope. A reference whose type is set
    // but is neither the organization nor the workspace scope for this kind is a caller error - reject it
    // rather than silently reinterpreting it as organization-scoped.
    if (refType && refType !== organizationType && refType !== workspaceType) {
        throw new Error(
            workspaceType
                ? `Cannot set active ${organizationType}: reference type "${refType}" is neither ` +
                      `"${organizationType}" nor "${workspaceType}".`
                : `Cannot set active ${organizationType}: reference type "${refType}" is not ` +
                      `"${organizationType}"; a user setting holds an organization ${organizationType} only.`,
        );
    }
    return { id, type: workspaceType && refType === workspaceType ? workspaceType : organizationType };
}
