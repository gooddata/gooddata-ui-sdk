// (C) 2019-2026 GoodData Corporation

import { useMemo } from "react";

import { FormattedMessage } from "react-intl";

import { type ObjRef, attributeLocalId, insightAttributes, isComputedAttribute } from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";

import { DrillFiltersConfig } from "../DrillFilters/DrillFiltersConfig.js";
import { DrillOriginSelector } from "../DrillOriginSelector/DrillOriginSelector.js";
import { InsightDrillConfigList } from "../InsightDrillConfigList.js";
import { ZoomInsightConfiguration } from "../ZoomInsightConfiguration.js";

import { useInsightDrillConfigPanel } from "./useInsightDrillConfigPanel.js";

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
        drillConfigItems,
        selectedDrillItem,
        originSelectorItems,
        isOriginSelectorVisible,
        isLoaded,
        onChangeItem,
        onOriginSelect,
        onSetupItem,
        onUpdateDrillItem,
        onDeleteItem,
    } = useInsightDrillConfigPanel({ widgetRef });

    // drill down is never available for computed attributes: they cannot be part of an attribute hierarchy
    const computedAttributeOriginLocalIds = useMemo(
        () => (insight ? insightAttributes(insight).filter(isComputedAttribute).map(attributeLocalId) : []),
        [insight],
    );

    if (selectedDrillItem) {
        return <DrillFiltersConfig item={selectedDrillItem} onUpdateDrillItem={onUpdateDrillItem} />;
    }

    return (
        <>
            <ZoomInsightConfiguration widget={widget} />
            <div className="configuration-category s-drill-config-panel">
                <Typography tagName="h3">
                    <span>
                        <FormattedMessage id="configurationPanel.drillConfig.interactions" />
                    </span>
                </Typography>
                <InsightDrillConfigList
                    disableDrillDown={insight?.insight?.properties?.["controls"]?.disableDrillDown}
                    computedAttributeOriginLocalIds={computedAttributeOriginLocalIds}
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
