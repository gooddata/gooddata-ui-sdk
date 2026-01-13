// (C) 2026 GoodData Corporation
import { useKdaState } from "../../providers/KdaState.js";

export function useTags() {
    const { state } = useKdaState();
    const { includeTags, excludeTags } = state;

    return {
        includeTags,
        excludeTags,
    };
}
