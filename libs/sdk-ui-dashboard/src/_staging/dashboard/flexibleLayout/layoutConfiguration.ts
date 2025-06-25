// (C) 2024-2025 GoodData Corporation

import { IDashboardLayout } from "@gooddata/sdk-model";

import { ExtendedDashboardWidget } from "../../../model/types/layoutTypes.js";

/**
 * Returns configuration of the provided layout. The function returns the default configuration when
 * the layout does not have it specified.
 *
 * @param layout - layout for which we want to get the configuration.
 */
export function getLayoutConfiguration(layout: IDashboardLayout<ExtendedDashboardWidget | unknown>) {
    // backward compatibility, assume the container direction is set to "row" when not set
    const direction = layout.configuration?.direction ?? "row";
    const sectionsConfiguration = layout.configuration?.sections;
    // backward compatibility, assume header is enabled when configuration is not set on the layout
    const enableHeader = sectionsConfiguration?.enableHeader ?? true;
    return {
        direction,
        sections: {
            areHeadersEnabled: enableHeader,
        },
    };
}
