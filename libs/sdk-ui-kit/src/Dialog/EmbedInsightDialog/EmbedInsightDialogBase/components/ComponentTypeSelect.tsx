// (C) 2022-2023 GoodData Corporation
import React, { ChangeEvent, useCallback } from "react";
import { FormattedMessage } from "react-intl";

import { InsightCodeType } from "../types.js";
import { dialogChangeMessageLabels } from "../../../../locales.js";

import { ComponentTypeItem } from "./ComponentTypeItem.js";

/**
 * @internal
 */
export interface IComponentTypeSelectProps {
    selectedComponentType: InsightCodeType;
    onComponentTypeChanged: (insightType: InsightCodeType) => void;
}

/**
 * @internal
 */
export const ComponentTypeSelect: React.VFC<IComponentTypeSelectProps> = (props) => {
    const { selectedComponentType, onComponentTypeChanged } = props;

    const onCheck = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value as InsightCodeType;
            onComponentTypeChanged(value);
        },
        [onComponentTypeChanged],
    );

    return (
        <div className="embed-insight-dialog-lang-selector">
            <strong className="bottom-space">
                <FormattedMessage id="embedInsightDialog.component.type" />
            </strong>
            <ComponentTypeItem
                className="s-component-type-reference"
                itemText="Referential"
                itemValue={"reference"}
                onChange={onCheck}
                checked={selectedComponentType === "reference"}
                questionMarkMessage={getChangesLabelId("reference")}
            />
            <ComponentTypeItem
                className="s-component-type-definition"
                itemText="Programmatic"
                itemValue={"definition"}
                onChange={onCheck}
                checked={selectedComponentType === "definition"}
                questionMarkMessage={getChangesLabelId("definition")}
            />
        </div>
    );
};

const getChangesLabelId = (codeType: InsightCodeType): string => {
    return dialogChangeMessageLabels[codeType].id;
};
