// (C) 2024 GoodData Corporation

import { IDashboardLayout } from "@gooddata/sdk-model";

export const useLayoutSectionsConfiguration = (layout: IDashboardLayout<unknown>) => {
    const sectionsConfiguration = layout.configuration?.sections;
    // backward compatibility, assume header is enabled when configuration is not set on the layout
    const enableHeader = sectionsConfiguration?.enableHeader ?? true;

    return {
        areSectionHeadersEnabled: enableHeader,
    };
};
