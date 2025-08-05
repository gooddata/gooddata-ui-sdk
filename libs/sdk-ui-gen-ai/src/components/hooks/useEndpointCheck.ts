// (C) 2025 GoodData Corporation
import { useBackendStrict, useCancelablePromise } from "@gooddata/sdk-ui";
import { useCallback, useReducer } from "react";

export function useEndpointCheck(canFullControl: boolean) {
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
            const count = await org.llmEndpoints().getCount();
            return {
                count,
                evaluated: true,
            };
        } catch {
            return {
                count: 0,
                evaluated: false,
            };
        }
    };

    const { result, status } = useCancelablePromise({ promise }, [backend, canFullControl, tries]);

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
