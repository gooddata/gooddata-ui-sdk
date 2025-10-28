// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";

import { selectColorPalette, selectSettings, useDashboardSelector } from "../../../model/index.js";
import { KdaItem, KdaItemGroup } from "../../internalTypes.js";
import { useKdaState } from "../../providers/KdaState.js";
import { createConfig, createDataView } from "../data/dataview.js";

export function useDataViewWithConfig(group: KdaItemGroup | null, item: KdaItem | null) {
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
        const dataView = createDataView(workspace, definition, group, item, title);

        return {
            config,
            dataView,
            attribute: group.attribute,
        };
    }, [colorPalette, definition, group, item, settings, title, workspace]);
}
