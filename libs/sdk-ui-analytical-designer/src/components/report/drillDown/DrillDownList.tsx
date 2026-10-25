// (C) 2023-2026 GoodData Corporation

import { memo, useMemo } from "react";

import { Provider, useSelector } from "react-redux";

import { store } from "../../../reduxStore.js";
import { getDrillDowns } from "../../../selectors/drill_down_selectors.js";
import { VisualizationPropertiesSelectors as VisualizationPropertiesSelector } from "../../../selectors/visualization_properties_selector.js";
import { type IAppState } from "../../../store/types.js";
import { TranslationsWrapper as ConnectedIntlProvider } from "../../../utils/with_connected_intl.js";

import { DrillDownItem } from "./DrillDownItem.js";

function DrillDowns() {
    const drillDowns = useSelector((state: IAppState) => getDrillDowns(state));
    const insightProperties = useSelector((state: IAppState) =>
        VisualizationPropertiesSelector.getProperties(state),
    );

    const isDrillDownEnabled = useMemo(() => {
        return !insightProperties.controls?.["disableDrillDown"];
    }, [insightProperties]);

    if (!isDrillDownEnabled) {
        return null;
    }

    return (
        <>
            {drillDowns.map((drillDown) => (
                <DrillDownItem key={drillDown.bucketItem.localIdentifier} item={drillDown} />
            ))}
        </>
    );
}

// Wrap component to redux provider and intl provider because it will be rendered in disconnected react tree
// by pluggable visualization in its configuration panel and connection to the redux store would not work.

export const DrillDownList = memo(function DrillDownList() {
    return (
        <Provider store={store}>
            <ConnectedIntlProvider>
                <DrillDowns />
            </ConnectedIntlProvider>
        </Provider>
    );
});

DrillDownList.displayName = "DrillDowns";
