// (C) 2026 GoodData Corporation

import { PluggableApplicationRegistryItem } from "@gooddata/sdk-model";
import { DefaultApplicationId } from "@gooddata/sdk-pluggable-application-model";
import { useMediaQuery } from "@gooddata/sdk-ui-kit";

const BIGGER_APPS = [DefaultApplicationId.ANALYTICAL_DESIGNER];

export function useGenAiRightPanel(
    enableGenAiRightPanel?: boolean,
    embedded?: boolean,
    app?: PluggableApplicationRegistryItem,
) {
    const isBiggerApp = app?.id ? BIGGER_APPS.includes(app.id) : false;
    const isSmall = useMediaQuery(isBiggerApp ? "<=xl" : "<=lg");

    return Boolean(enableGenAiRightPanel && !embedded && !isSmall);
}
