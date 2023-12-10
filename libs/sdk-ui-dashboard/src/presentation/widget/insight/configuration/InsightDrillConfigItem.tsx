// (C) 2019-2022 GoodData Corporation
import React, { ReactNode, useMemo } from "react";
import cx from "classnames";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";
import cloneDeep from "lodash/cloneDeep.js";
import { invariant } from "ts-invariant";

import { stringUtils } from "@gooddata/util";
import { messages } from "@gooddata/sdk-ui";
import {
    DRILL_TARGET_TYPE,
    IDrillConfigItem,
    IDrillDownAttributeHierarchyDefinition,
} from "../../../drill/types.js";
import { DrillOriginItem } from "./DrillOriginItem.js";
import { IDrillTargetType } from "./useDrillTargetTypeItems.js";
import { DrillTargetType } from "./DrillTargetType/DrillTargetType.js";
import { DrillTargets } from "./DrillTargets/DrillTargets.js";
import {
    areObjRefsEqual,
    IdentifierRef,
    InsightDrillDefinition,
    isAttributeDescriptor,
    UriRef,
} from "@gooddata/sdk-model";
import {
    selectCatalogDateDatasets,
    selectDrillTargetsByWidgetRef,
    selectSelectedWidgetRef,
    useDashboardSelector,
} from "../../../../model/index.js";

export interface IDrillConfigItemProps {
    item: IDrillConfigItem;
    enabledDrillTargetTypeItems: IDrillTargetType[];
    onDelete: (item: IDrillConfigItem) => void;
    onSetup: (
        drill: InsightDrillDefinition | IDrillDownAttributeHierarchyDefinition,
        changedItem: IDrillConfigItem,
    ) => void;
    onIncompleteChange: (changedItem: IDrillConfigItem) => void;
}
function disableDrillDownIfMeasure(
    enabledDrillTargetTypeItems: IDrillTargetType[],
    isMeasure: boolean,
    intl: IntlShape,
) {
    const drillTargetTypes = cloneDeep(enabledDrillTargetTypeItems);
    if (isMeasure) {
        const drillDownIndex = drillTargetTypes.findIndex((item) => item.id === DRILL_TARGET_TYPE.DRILL_DOWN);
        if (drillDownIndex >= 0) {
            const drillDownTarget = drillTargetTypes[drillDownIndex];
            drillDownTarget.disabled = true;
            drillDownTarget.disableTooltipMessage = intl.formatMessage(
                messages.drilldownTooltipDisabledMetric,
            );
            drillTargetTypes.splice(drillDownIndex, 1, drillDownTarget);
        }
    }
    return drillTargetTypes;
}

const DrillConfigItem: React.FunctionComponent<IDrillConfigItemProps> = ({
    item,
    enabledDrillTargetTypeItems,
    onIncompleteChange,
    onSetup,
    onDelete,
}) => {
    const intl = useIntl();
    const onDeleteClick = () => {
        onDelete(item);
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
            "s-drill-config-item-incomplete": !item.complete,
        },
    );

    const targetClassNames = cx("s-drill-config-target", "drill-config-target", {
        "drill-config-target-with-warning": !!item.warning,
    });

    const widgetRef = useDashboardSelector(selectSelectedWidgetRef);
    invariant(widgetRef, "mush have widget selected");

    const { isFromDateAttribute, showDateFilterTransferWarning } = useDateAttributeOptions(item, widgetRef);
    const drillTargetTypeItems = disableDrillDownIfMeasure(
        enabledDrillTargetTypeItems,
        item.type === "measure",
        intl,
    );
    return (
        <div className={classNames}>
            <div className="drill-config-item-intro">
                <FormattedMessage
                    id="configurationPanel.drillConfig.clickHintItem"
                    values={{
                        addon: (chunks: ReactNode) => <span className="addon">{chunks}</span>,
                    }}
                />
            </div>
            <DrillOriginItem
                type={item.type}
                title={item.title}
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
                        enabledDrillTargetTypeItems={drillTargetTypeItems}
                        isButtonDisabled={false}
                    />

                    <DrillTargets item={item} onSetup={onSetup} onDeleteInteraction={onDeleteClick} />
                    {!!item.warning && (
                        <div className="drill-config-target-warning s-drill-config-target-warning">
                            <span className="gd-icon-warning" />
                            <span>
                                <FormattedMessage id={item.warning} />
                            </span>
                        </div>
                    )}
                    {showDateFilterTransferWarning ? (
                        <div className="drill-config-date-filter-warning s-drill-config-date-filter-warning">
                            <span>
                                <FormattedMessage id="configurationPanel.drillConfig.drillIntoDashboard.dateFilterWarning" />
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

function useDateAttributeOptions(item: IDrillConfigItem, widgetRef: UriRef | IdentifierRef) {
    const dateAttributes = useDashboardSelector(selectCatalogDateDatasets);
    const drillTargets = useDashboardSelector(selectDrillTargetsByWidgetRef(widgetRef));

    return useMemo(() => {
        const attributeTarget = drillTargets?.availableDrillTargets?.attributes?.find(
            (attribute) => attribute.attribute.attributeHeader.localIdentifier === item.originLocalIdentifier,
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

        const isDateAttributeInIntersection =
            item.type === "measure" &&
            item.attributes.some((attr) =>
                dateAttributes.some((x) =>
                    x.dateAttributes.some((d) => areObjRefsEqual(d.attribute.ref, attr.attributeHeader.ref)),
                ),
            );
        const showDateFilterTransferWarning =
            item.drillTargetType === DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD &&
            (isFromDateAttribute || isDateAttributeInIntersection);

        return {
            isFromDateAttribute,
            isDateAttributeInIntersection,
            showDateFilterTransferWarning,
        };
    }, [
        drillTargets?.availableDrillTargets?.attributes,
        dateAttributes,
        item.type,
        item.attributes,
        item.drillTargetType,
        item.originLocalIdentifier,
    ]);
}

export default DrillConfigItem;
