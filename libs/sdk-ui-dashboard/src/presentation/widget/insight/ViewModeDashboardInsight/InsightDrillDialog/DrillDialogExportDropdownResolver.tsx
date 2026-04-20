// (C) 2026 GoodData Corporation

import { type ReactElement, useMemo } from "react";

import { type IInsight, type IInsightWidget } from "@gooddata/sdk-model";

import { useDashboardComponentsContext } from "../../../../dashboardContexts/DashboardComponentsContext.js";
import { type IDrillDialogExportDropdownProps } from "./drillDialogExportDropdownTypes.js";

/**
 * @internal
 */
export interface IDrillDialogExportDropdownResolverProps extends IDrillDialogExportDropdownProps {
    insight: IInsight;
    widget: IInsightWidget;
}

/**
 * @internal
 */
export function DrillDialogExportDropdownResolver(
    props: IDrillDialogExportDropdownResolverProps,
): ReactElement {
    const { insight, widget, ...drillDialogExportDropdownProps } = props;
    const { DrillDialogExportDropdownComponentProvider } = useDashboardComponentsContext();
    const DrillDialogExportDropdownComponent = useMemo(
        () => DrillDialogExportDropdownComponentProvider(insight, widget),
        [DrillDialogExportDropdownComponentProvider, insight, widget],
    );

    return <DrillDialogExportDropdownComponent {...drillDialogExportDropdownProps} />;
}
