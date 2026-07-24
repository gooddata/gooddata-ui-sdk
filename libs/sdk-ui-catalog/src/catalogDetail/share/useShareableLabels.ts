// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { objRefToString } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import type { IObjectShareLabel } from "@gooddata/sdk-ui-ext";

import type { ShareableCatalogItem } from "./types.js";

/**
 * @internal
 */
export interface IShareableLabels {
    /** Display forms of the shareable attribute; empty for facts and measures. */
    labels: IObjectShareLabel[];
    /**
     * True while an attribute's labels are still being fetched. Facts and measures
     * skip the fetch and report `false`. Gates the dialog's Add action so a grantee
     * can't be added before its labels are known.
     */
    loading: boolean;
    /**
     * True when the attribute's label fetch failed. Add stays disabled in this
     * case too: a new grantee defaults to all labels, which can't be honored if
     * the labels couldn't be loaded — otherwise the object would be granted with
     * no label grants.
     */
    error: boolean;
}

/**
 * Loads the labels (display forms) of a shareable attribute so the share dialog
 * can scope a grantee's access per label. Facts and measures have no labels —
 * returns an empty list and skips the fetch. The result feeds
 * {@link ObjectShareDialog}'s `labels`.
 *
 * @internal
 */
export function useShareableLabels(item: ShareableCatalogItem | undefined): IShareableLabels {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    // Only attributes carry labels; facts and measures do not.
    const attributeRef = item?.type === "attribute" ? item.identifier : undefined;

    const { result, status } = useCancelablePromise(
        {
            promise: attributeRef
                ? () =>
                      backend
                          .workspace(workspace)
                          .attributes()
                          .getAttribute({ identifier: attributeRef, type: "attribute" })
                : undefined,
        },
        [backend, workspace, attributeRef],
    );

    const labels = useMemo<IObjectShareLabel[]>(
        () =>
            (result?.displayForms ?? []).map((df) => ({
                ref: df.ref,
                id: objRefToString(df.ref),
                title: df.title,
                isPrimary: df.isPrimary === true,
                isDefault: df.isDefault === true,
            })),
        [result],
    );

    // Facts and measures have no fetch, so they never "load". An attribute loads
    // until its fetch settles (success or error).
    const loading = attributeRef !== undefined && status !== "success" && status !== "error";
    const error = attributeRef !== undefined && status === "error";

    return { labels, loading, error };
}
