// (C) 2021-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { IAvailableDrillTargetAttribute } from "@gooddata/sdk-ui";

export interface IDrillAttributeSelectorItemStateProps {
    isDateAttribute: boolean;
}

export interface IFilterDrillAttributeSelectorItemProps {
    item: IAvailableDrillTargetAttribute;
    onClick: (item: IAvailableDrillTargetAttribute) => void;
    onCloseDropdown: () => void;
}

export const DrillAttributeSelectorItem: React.FunctionComponent<IFilterDrillAttributeSelectorItemProps> = (
    props,
) => {
    const onClick = () => {
        props.onClick(props.item);
        props.onCloseDropdown();
    };
    const name = props.item.attribute.attributeHeader.formOf.name;

    return (
        <a
            onClick={onClick}
            className={cx("s-drill-attribute-selector-item", {
                // "gd-drill-attribute-selector-list-item": !props.isDateAttribute,
                "gd-drill-attribute-selector-list-item": true,
                // "gd-drill-attribute-date-selector-list-item": props.isDateAttribute,
            })}
            title={name}
        >
            {name}
        </a>
    );
};

// const mapStateToProps = (
//     appState: AppState,
//     ownProps: IDrillAttributeSelectorItemOwnProps,
// ): IDrillAttributeSelectorItemStateProps => {
//     const attributeRef = ownProps?.item?.attribute?.attributeHeader?.formOf?.ref;
//     return {
//         isDateAttribute: isDrillAttributeDate(appState, attributeRef),
//     };
// };
//
// export default connect(mapStateToProps)(DrillAttributeSelectorItem);
