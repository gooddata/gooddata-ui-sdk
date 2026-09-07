// (C) 2026 GoodData Corporation

import { useMediaQuery } from "@gooddata/sdk-ui-kit";

export function useGenAiRightPanel(enableGenAiRightPanel?: boolean, embedded?: boolean) {
    const isSmall = useMediaQuery("<=lg");

    return Boolean(enableGenAiRightPanel && !embedded && !isSmall);
}
