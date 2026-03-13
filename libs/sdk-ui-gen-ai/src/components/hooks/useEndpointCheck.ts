// (C) 2025-2026 GoodData Corporation

import { useCallback, useReducer } from "react";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { useBackendStrict, useCancelablePromise } from "@gooddata/sdk-ui";

export function useEndpointCheck(settings: IUserWorkspaceSettings | undefined, canFullControl: boolean) {
    const backend = useBackendStrict();
    const [tries, retry] = useReducer((x) => x + 1, 0);

    const promise = async () => {
        if (!canFullControl) {
            return {
                count: 0,
                evaluated: false,
            };
        }
        try {
            const org = await backend.organizations().getCurrentOrganization();

            if (settings?.enableLlmEndpointReplacement) {
                const count = await org.llmProviders().getCount();
                return {
                    count,
                    evaluated: true,
                };
            } else {
                const count = await org.llmEndpoints().getCount();
                return {
                    count,
                    evaluated: true,
                };
            }
        } catch {
            return {
                count: 0,
                evaluated: false,
            };
        }
    };

    const { result, status } = useCancelablePromise({ promise }, [
        backend,
        canFullControl,
        tries,
        settings?.enableLlmEndpointReplacement,
    ]);

    const restart = useCallback(() => {
        retry();
    }, []);

    return {
        checking: status === "loading" || status === "pending",
        count: result?.count ?? 0,
        evaluated: result?.evaluated ?? false,
        restart,
    };
}
