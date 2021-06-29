// (C) 2019-2021 GoodData Corporation
import React, { SyntheticEvent } from "react";
import cx from "classnames";
import { Icon } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import { ITheme } from "@gooddata/sdk-backend-spi";
import { DashboardDrillDefinition } from "../interfaces";
import { DrillType, DrillSelectItem } from "./interfaces";

const DRILL_ICON_NAME: Record<DrillType, string> = {
    [DrillType.DRILL_TO_DASHBOARD]: "DrillToDashboard",
    [DrillType.DRILL_TO_INSIGHT]: "DrillToInsight",
    [DrillType.DRILL_TO_URL]: "Hyperlink",
    [DrillType.DRILL_DOWN]: "DrillDown",
};

export interface DrillSelectListItemProps {
    item: DrillSelectItem;
    onClick: (item: DashboardDrillDefinition) => void;
    theme?: ITheme;
}

export const DrillSelectListItem = (props: DrillSelectListItemProps): JSX.Element => {
    const theme = useTheme(props.theme);
    const {
        item: { name, type, drillDefinition },
    } = props;

    const onClick = (e: SyntheticEvent) => {
        e.preventDefault();
        props.onClick(drillDefinition);
    };

    const renderLoading = () => {
        return (
            <div className="gd-drill-to-url-modal-picker s-drill-to-url-modal-picker">
                <div className="gd-spinner small" />
            </div>
        );
    };

    const itemClassName = cx("gd-drill-modal-picker-list-item", "s-gd-drill-modal-picker-item", `s-${type}`);
    const IconComponent = Icon[DRILL_ICON_NAME[type]];
    return (
        <a onClick={onClick} className={itemClassName} title={name}>
            <div className="gd-drill-modal-picker-icon-wrapper">
                <IconComponent color={theme?.palette?.complementary?.c5} />
            </div>
            {!name ? renderLoading() : <span>{name}</span>}
        </a>
    );
};
