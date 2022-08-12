// (C) 2019-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { stringUtils } from "@gooddata/util";
import { DRILL_TARGET_TYPE, IDrillConfigItem } from "../../../drill/types";
import { DrillOriginItem } from "./DrillOriginItem";
import { IDrillTargetType } from "./useDrillTargetTypeItems";
import { DrillTargetType } from "./DrillTargetType";
import { DrillTargets } from "./DrillTargets/DrillTargets";
import { areObjRefsEqual, InsightDrillDefinition, isAttributeDescriptor } from "@gooddata/sdk-model";
import {
    selectDrillTargetsByWidgetRef,
    selectSelectedWidgetRef,
    useDashboardSelector,
    selectCatalogDateDatasets,
} from "../../../../model";
import invariant from "ts-invariant";

export interface IDrillConfigItemProps {
    item: IDrillConfigItem;
    // onDelete: (item: IDrillConfigItem) => void;
    onSetup: (drill: InsightDrillDefinition, changedItem: IDrillConfigItem) => void;
    onIncompleteChange: (changedItem: IDrillConfigItem) => void;
    enabledDrillTargetTypeItems: IDrillTargetType[];
    // warning?: string;
}

const DrillConfigItem: React.FunctionComponent<IDrillConfigItemProps> = ({
    // onDelete,
    item,
    onIncompleteChange,
    onSetup,
    enabledDrillTargetTypeItems,
}) => {
    const onDeleteClick = () => {
        // onDelete(item);
    };
    const onDrillTargetTypeSelect = (target: DRILL_TARGET_TYPE) => {
        onIncompleteChange({
            ...item,
            drillTargetType: target,
        });
    };

    const classNames = cx(
        "s-drill-config-item",
        `s-drill-config-item-${stringUtils.simplifyText(item.title)}`,
        {
            // "s-drill-config-item-incomplete": !item.complete,
        },
    );

    const targetClassNames = cx("s-drill-config-target", "drill-config-target", {
        // "drill-config-target-with-warning": !!item.warning,
    });

    const widgetRef = useDashboardSelector(selectSelectedWidgetRef);
    invariant(widgetRef, "mush have widget selected");
    const drillTargets = useDashboardSelector(selectDrillTargetsByWidgetRef(widgetRef));
    const dateAttributes = useDashboardSelector(selectCatalogDateDatasets);
    const attributeTarget = drillTargets?.availableDrillTargets?.attributes?.find(
        (attribute) => attribute.attribute.attributeHeader.localIdentifier === item.localIdentifier,
    );

    const isFromDateAttribute = !!(
        attributeTarget &&
        isAttributeDescriptor(attributeTarget.attribute) &&
        dateAttributes.some((attribute) =>
            attribute.dateAttributes.some((dateAttribute) =>
                areObjRefsEqual(
                    dateAttribute.attribute.ref,
                    attributeTarget.attribute.attributeHeader.formOf.ref,
                ),
            ),
        )
    );

    return (
        <div className={classNames}>
            <div className="drill-config-item-intro">
                <FormattedMessage
                    id="configurationPanel.drillConfig.clickHintItem"
                    values={{
                        addon: (chunks: string) => <span className="addon">{chunks}</span>,
                    }}
                />
            </div>
            <DrillOriginItem
                type={item.type}
                title={item.title}
                localIdentifier={item.localIdentifier}
                onDelete={onDeleteClick}
                isDateAttribute={isFromDateAttribute}
            />
            <div className={targetClassNames}>
                <div className="drill-config-target-box">
                    <div className="drill-config-item-target">
                        <FormattedMessage id="configurationPanel.drillConfig.selectTarget" />
                    </div>

                    <DrillTargetType
                        onSelect={onDrillTargetTypeSelect}
                        selection={item.drillTargetType}
                        enabledDrillTargetTypeItems={enabledDrillTargetTypeItems}
                    />

                    <DrillTargets item={item} onSetup={onSetup} />
                    {/*{!!item.warning && (*/}
                    {/*    <div className="drill-config-target-warning s-drill-config-target-warning">*/}
                    {/*        <span className="icon-warning" />*/}
                    {/*        <span>*/}
                    {/*            <FormattedMessage id={item.warning} />*/}
                    {/*        </span>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
            </div>
        </div>
    );
};

export default DrillConfigItem;
