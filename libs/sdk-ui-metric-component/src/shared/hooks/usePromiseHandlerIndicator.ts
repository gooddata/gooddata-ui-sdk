// (C) 2021-2026 GoodData Corporation

import { useState } from "react";

import { useCancelablePromise } from "@gooddata/sdk-ui";

export function usePromiseHandlerIndicator<V, TResult>(
    promiseHandler: (value: V) => Promise<TResult> = () => Promise.resolve() as unknown as Promise<TResult>,
): [boolean, (value: V) => void] {
    const [promise, setPromise] = useState(() => () => Promise.resolve() as unknown as Promise<TResult>);
    const { status } = useCancelablePromise({ promise }, [promise]);

    return [
        status === "pending" || status === "loading",
        (value: V) => setPromise(() => () => promiseHandler(value)),
    ];
}
