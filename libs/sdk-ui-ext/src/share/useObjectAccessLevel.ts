// (C) 2026 GoodData Corporation

import { useCallback, useState } from "react";

import { type IObjectPermissionsObject } from "@gooddata/sdk-backend-spi";
import { objRefToString } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import type { GeneralAccessValue } from "@gooddata/sdk-ui-kit";

import {
    type ObjectShareLevel,
    accessListToSummary,
    draftToSummary,
    summaryToShareLevel,
} from "./accessSummary.js";
import type { IObjectShareDraft } from "./objectShareController.types.js";
import type { IObjectAccessSummary } from "./types.js";

const EMPTY_DRAFT: IObjectShareDraft = { granteeEdits: {}, ruleEdit: undefined };

/**
 * @internal
 */
export interface IUseObjectAccessLevelOptions {
    /** The object to read. Undefined describes one that does not exist yet. */
    target: IObjectPermissionsObject | undefined;
    /** Whether to read at all. False keeps the level unresolved without a request. */
    enabled?: boolean;
    /** Share edits staged for an object that does not exist yet. */
    draft?: IObjectShareDraft;
    /** General access such an object starts from. Defaults to `RESTRICTED`. */
    initialDraftGeneralAccess?: GeneralAccessValue;
}

/**
 * @internal
 */
export interface IObjectAccessLevel {
    summary: IObjectAccessSummary | undefined;
    /** Undefined while loading, or when the read failed. */
    level: ObjectShareLevel | undefined;
    isLoading: boolean;
    /** Hand the dialog's reported summary back, so an edit shows without a refetch. */
    onSummaryChange: (summary: IObjectAccessSummary) => void;
}

/**
 * An object's access level, for showing it outside the share dialog.
 *
 * @remarks
 * A saved object is read once and then kept in sync by the dialog through `onSummaryChange`.
 * An object that does not exist yet is described by its draft, with no request made.
 *
 * @internal
 */
export function useObjectAccessLevel({
    target,
    enabled = true,
    draft,
    initialDraftGeneralAccess = "RESTRICTED",
}: IUseObjectAccessLevelOptions): IObjectAccessLevel {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    // Keyed by the object it describes, so a caller that swaps the object without
    // remounting reads the next one rather than showing this level.
    const [reported, setReported] = useState<{ key: string; summary: IObjectAccessSummary }>();
    const key = target && `${workspace}:${target.kind}:${objRefToString(target.ref)}`;
    const known = reported?.key === key ? reported?.summary : undefined;

    // Stops for good once the dialog reports one, so closing it never refetches.
    const read = enabled && target !== undefined && known === undefined;
    const { result, status } = useCancelablePromise(
        {
            promise:
                read && target
                    ? async () => {
                          // The profile tells the caller's own grant from everyone else's.
                          const [list, self] = await Promise.all([
                              backend.workspace(workspace).objectPermissions().getAccessList(target),
                              backend.currentUser().getUser(),
                          ]);
                          return accessListToSummary(list, self.ref);
                      }
                    : undefined,
            onError: () => {},
        },
        [backend, read, key],
    );

    const summary = target
        ? (known ?? result)
        : draftToSummary(draft ?? EMPTY_DRAFT, initialDraftGeneralAccess);

    return {
        summary,
        level: summary ? summaryToShareLevel(summary) : undefined,
        isLoading: summary === undefined && status !== "error",
        onSummaryChange: useCallback(
            (next: IObjectAccessSummary) => setReported(key ? { key, summary: next } : undefined),
            [key],
        ),
    };
}
