// (C) 2026 GoodData Corporation

import {
    type IPluggableApplicationMountOptions,
    aiAssistantContextChanged,
} from "@gooddata/sdk-pluggable-application-model";

/**
 * @alpha
 *
 * Default implementation of the AI assistant subscription.
 */
export function subscribeAiAssistantDefault(options: IPluggableApplicationMountOptions): () => void {
    let initialized = false;

    const report = () => {
        if (!initialized) {
            options.onEvent?.(aiAssistantContextChanged({ disabled: false }));
        }
        initialized = true;
    };
    report();

    return () => void 0;
}
