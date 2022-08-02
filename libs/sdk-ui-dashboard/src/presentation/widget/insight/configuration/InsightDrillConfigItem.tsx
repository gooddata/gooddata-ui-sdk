// (C) 2019-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { stringUtils } from "@gooddata/util";
import { IDrillConfigItem } from "../../../drill/types";
import { DrillMeasureItem } from "./DrillMeasureItem";
import { IDrillTargetType } from "./useDrillTargetTypeItems";
import { DrillTargetType } from "./DrillTargetType";
import { DrillTargets } from "./DrillTargets/DrillTargets";
import { InsightDrillDefinition } from "@gooddata/sdk-model";

export interface IDrillConfigItemProps {
    item: IDrillConfigItem;
    // onDelete: (item: IDrillConfigItem) => void;
    onSetup: (drill: InsightDrillDefinition) => void;
    // onIncompleteChange: (changedItem: IDrillConfigItem) => void;
    enabledDrillTargetTypeItems: IDrillTargetType[];
    // warning?: string;
}

const DrillConfigItem: React.FunctionComponent<IDrillConfigItemProps> = ({
    // onDelete,
    item,
    // onIncompleteChange,
    onSetup,
    enabledDrillTargetTypeItems,
}) => {
    const onDeleteClick = () => {
        // onDelete(item);
    };
    const onDrillTargetTypeSelect = () => {
        // onIncompleteChange({
        //     ...item,
        //     drillTargetType: target,
        // });
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
            <DrillMeasureItem
                title={item.title}
                localIdentifier={item.localIdentifier}
                onDelete={onDeleteClick}
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
