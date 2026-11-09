// (C) 2026 GoodData Corporation

import { useRef, useState } from "react";

import { useCancelablePromise } from "@gooddata/sdk-ui";

import { getBackend } from "../../platformContext/backend.js";

type WorkspaceTitles = ReadonlyMap<string, string | undefined>;

export function useWorkspaceTitle(workspaceId: string | undefined): string | undefined {
    const titles = useWorkspaceTitles(workspaceId ? [workspaceId] : []);
    return workspaceId ? titles.get(workspaceId) : undefined;
}

/**
 * Looks up each ID once. A failed lookup maps to undefined and is not retried.
 */
export function useWorkspaceTitles(workspaceIds: readonly string[]): WorkspaceTitles {
    const [titles, setTitles] = useState<WorkspaceTitles>(new Map());
    const requests = useRef(new Map<string, Promise<string | undefined>>());
    const missingIds = [...new Set(workspaceIds)].filter((id) => !titles.has(id)).sort();
    useCancelablePromise(
        {
            promise:
                missingIds.length > 0
                    ? () => fetchWorkspaceTitles({ workspaceIds: missingIds, requests: requests.current })
                    : null,
            onSuccess: (loaded) => setTitles((current) => new Map([...current, ...loaded])),
        },
        [JSON.stringify(missingIds)],
    );
    return titles;
}

interface IWorkspaceTitlesFetch {
    workspaceIds: string[];
    requests: Map<string, Promise<string | undefined>>;
}

function fetchWorkspaceTitles({
    workspaceIds,
    requests,
}: IWorkspaceTitlesFetch): Promise<Array<[string, string | undefined]>> {
    return Promise.all(
        workspaceIds.map(async (id): Promise<[string, string | undefined]> => {
            const request = requests.get(id) ?? fetchTitle(id);
            requests.set(id, request);
            return [id, await request];
        }),
    );
}

async function fetchTitle(workspaceId: string): Promise<string | undefined> {
    try {
        return (await getBackend().workspace(workspaceId).getDescriptor()).title || undefined;
    } catch {
        return undefined;
    }
}
