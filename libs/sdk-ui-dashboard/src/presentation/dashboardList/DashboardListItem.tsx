// (C) 2021-2026 GoodData Corporation

import cx from "classnames";
import { type IntlShape, useIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger } from "@gooddata/sdk-ui-kit";
import { simplifyText } from "@gooddata/util";

import { type DashboardAccessibilityLimitation } from "./types.js";

const tooltipAlignPoints = [
    { align: "cl cr", offset: { x: 0, y: -2 } },
    { align: "cr cl", offset: { x: 0, y: 10 } },
];

export interface IDashboardsListItemProps {
    title: string;
    accessibilityLimitation?: DashboardAccessibilityLimitation;
    onClick: () => void;
    isSelected?: boolean;
}

export const getTooltip = (intl: IntlShape, accessibilityLimitation?: DashboardAccessibilityLimitation) => {
    switch (accessibilityLimitation) {
        case "forbidden":
            return intl.formatMessage({ id: "configurationPanel.drillConfig.forbiddenDashboard.tooltip" });
        case "notShared":
            return intl.formatMessage({ id: "configurationPanel.drillConfig.notSharedDashboard.tooltip" });
        default:
            return undefined;
    }
};

function DropdownItem({
    onClick,
    accessibilityLimitation,
    title,
    isSelected = false,
}: IDashboardsListItemProps) {
    const icon = accessibilityLimitation === undefined ? undefined : "gd-icon-circle-exclamation";
    const generatedTestClass = `s-dashboard-item s-${simplifyText(title)}`;
    const classNames = cx("gd-list-item gd-drill-dashboard-item", generatedTestClass, {
        "is-selected": isSelected,
    });

    return (
        <div className={classNames} onClick={onClick} title={title}>
            {icon ? <span className={cx("gd-list-icon", icon)} /> : null}
            <span>{title}</span>
        </div>
    );
}

export function DashboardListItem(props: IDashboardsListItemProps) {
    const { accessibilityLimitation } = props;
    const intl = useIntl();

    const tooltip = getTooltip(intl, accessibilityLimitation);

    if (!tooltip) {
        return <DropdownItem {...props} />;
    }

    return (
        <BubbleHoverTrigger tagName="div" showDelay={200} hideDelay={0}>
            <DropdownItem {...props} />
            <Bubble className="bubble-primary" alignPoints={tooltipAlignPoints}>
                {tooltip}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
