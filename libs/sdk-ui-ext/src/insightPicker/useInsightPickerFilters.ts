// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IUser } from "@gooddata/sdk-model";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { type IUiAsyncTableFilterOption } from "@gooddata/sdk-ui-kit";

import { messages } from "./messages.js";

/**
 * Loads author and tag filter options from the analytics catalog API.
 * Uses the same endpoints as the analytical catalog component:
 *   - getCreatedBy() → list of users who created objects
 *   - getTags() → list of available tags
 *
 * @internal
 */
export function useInsightPickerFilters(
    backend: IAnalyticalBackend,
    workspace: string,
    currentAuthor?: string,
) {
    const intl = useIntl();

    // --- Load authors ---
    const { result: createdByResult, status: authorsStatus } = useCancelablePromise(
        {
            promise: () => backend.workspace(workspace).genAI().getAnalyticsCatalog().getCreatedBy(),
            onError: (error) => console.error("Failed to load authors:", error),
        },
        [backend, workspace],
    );

    const meLabel = intl.formatMessage(messages.filterCreatedByMe);

    const authorOptions = useMemo<IUiAsyncTableFilterOption[]>(() => {
        const users = createdByResult?.users ?? [];
        const sorted = sortUsers(users);
        return sorted.map((user) => ({
            value: user.login,
            label: user.login === currentAuthor ? meLabel : (user.fullName ?? user.login),
        }));
    }, [createdByResult?.users, currentAuthor, meLabel]);

    // --- Load tags ---
    const { result: tagsResult, status: tagsStatus } = useCancelablePromise(
        {
            promise: () => backend.workspace(workspace).genAI().getAnalyticsCatalog().getTags(),
            onError: (error) => console.error("Failed to load tags:", error),
        },
        [backend, workspace],
    );

    const tagOptions = useMemo<IUiAsyncTableFilterOption[]>(() => {
        const tags = tagsResult?.tags ?? [];
        return [...tags]
            .sort((a, b) => a.localeCompare(b))
            .map((tag) => ({
                value: tag,
                label: tag,
            }));
    }, [tagsResult?.tags]);

    const authorsLoaded = authorsStatus === "success";
    const tagsLoaded = tagsStatus === "success";

    return { authorOptions, tagOptions, authorsLoaded, tagsLoaded };
}

function sortUsers(users: IUser[]): IUser[] {
    return [...users].sort((a, b) => {
        const nameA = (a.fullName ?? a.login).toLowerCase();
        const nameB = (b.fullName ?? b.login).toLowerCase();
        return nameA.localeCompare(nameB);
    });
}
