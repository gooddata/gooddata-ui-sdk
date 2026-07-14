// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectColorPalette, selectSettings } from "../../../model/store/config/configSelectors.js";
import { type IKdaItem, type IKdaItemGroup } from "../../internalTypes.js";
import { useKdaState } from "../../providers/KdaState.js";
import { createConfig, createDataView } from "../data/dataview.js";

export function useDataViewWithConfig(group: IKdaItemGroup | null, item: IKdaItem | null) {
    const intl = useIntl();
    const workspace = useWorkspaceStrict();
    const colorPalette = useDashboardSelector(selectColorPalette);
    const settings = useDashboardSelector(selectSettings);

    const { state } = useKdaState();

    const definition = state.definition;

    const title = intl.formatMessage({ id: "kdaDialog.dialog.keyDriver.chart.std" });

    return useMemo(() => {
        if (!group || !item) {
            return {
                config: null,
                dataView: null,
            };
        }

        const config = createConfig(settings, colorPalette, group, item);

        const metric = state.definition?.metric;
        const metricTitle = metric?.measure.title ?? metric?.measure.alias ?? "";

        config.enableHighchartsAccessibility = true;
        config.a11yTitle = intl.formatMessage(
            { id: "kdaDialog.dialog.keyDrives.overview.detail.title" },
            {
                title: metricTitle,
                category: item.category,
            },
        );
        config.a11yDescription = intl.formatMessage(
            { id: "kdaDialog.dialog.keyDrives.overview.detail.tip" },
            {
                category: item.category,
            },
        );

        const dataView = createDataView(workspace, definition, group, item, title);

        return {
            config,
            dataView,
            displayForm: group.displayForm,
        };
    }, [colorPalette, definition, group, intl, item, settings, state.definition?.metric, title, workspace]);
}
