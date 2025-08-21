// (C) 2019-2025 GoodData Corporation
import React from "react";

import { FormattedMessage } from "react-intl";

import { ObjRef } from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";

import { useInsightDrillConfigPanel } from "./useInsightDrillConfigPanel.js";
import { DrillOriginSelector } from "../DrillOriginSelector/DrillOriginSelector.js";
import { InsightDrillConfigList } from "../InsightDrillConfigList.js";
import { ZoomInsightConfiguration } from "../ZoomInsightConfiguration.js";

/**
 * @internal
 */
export interface IDrillConfigPanelProps {
    widgetRef: ObjRef;
}

/**
 * @internal
 */
export function InsightDrillConfigPanel({ widgetRef }: IDrillConfigPanelProps) {
    const {
        widget,
        insight,
        enableKDZooming,
        drillConfigItems,
        originSelectorItems,
        isOriginSelectorVisible,
        isLoaded,
        onChangeItem,
        onOriginSelect,
        onSetupItem,
        onDeleteItem,
    } = useInsightDrillConfigPanel({ widgetRef });

    return (
        <>
            {!!enableKDZooming && <ZoomInsightConfiguration widget={widget} />}
            <div className="configuration-category s-drill-config-panel">
                <Typography tagName="h3">
                    <span>
                        <FormattedMessage id="configurationPanel.drillConfig.interactions" />
                    </span>
                </Typography>
                <InsightDrillConfigList
                    disableDrillDown={insight?.insight?.properties?.controls?.disableDrillDown}
                    drillConfigItems={drillConfigItems}
                    onDelete={onDeleteItem}
                    onSetup={onSetupItem}
                    onIncompleteChange={onChangeItem}
                />
                {isOriginSelectorVisible ? (
                    <DrillOriginSelector
                        widgetRef={widgetRef}
                        items={originSelectorItems}
                        onSelect={onOriginSelect}
                    />
                ) : isLoaded ? null : (
                    <div className="gd-spinner small" />
                )}
            </div>
        </>
    );
}
