// (C) 2019-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { ObjRef } from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";
import { useInsightDrillConfigPanel } from "./useInsightDrillConfigPanel";
import { InsightDrillConfigList } from "../InsightDrillConfigList";
import { DrillOriginSelector } from "../DrillOriginSelector/DrillOriginSelector";
import { ZoomInsightConfiguration } from "../ZoomInsightConfiguration";

/**
 * @internal
 */
export interface IDrillConfigPanelProps {
    widgetRef: ObjRef;
}

/**
 * @internal
 */
export const InsightDrillConfigPanel: React.FunctionComponent<IDrillConfigPanelProps> = ({ widgetRef }) => {
    const {
        widget,
        enableKDZooming,
        drillConfigItems,
        originSelectorItems,
        isOriginSelectorVisible,
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
                    drillConfigItems={drillConfigItems}
                    onDelete={onDeleteItem}
                    onSetup={onSetupItem}
                    onIncompleteChange={onChangeItem}
                />
                {!!isOriginSelectorVisible && (
                    <DrillOriginSelector items={originSelectorItems} onSelect={onOriginSelect} />
                )}
            </div>
        </>
    );
};
