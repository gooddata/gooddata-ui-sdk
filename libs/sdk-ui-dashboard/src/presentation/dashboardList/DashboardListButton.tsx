// (C) 2021-2025 GoodData Corporation

import { useIntl } from "react-intl";

import { Bubble, BubbleHoverTrigger, DropdownButton } from "@gooddata/sdk-ui-kit";

import { getTooltip } from "./DashboardListItem.js";
import { type DashboardAccessibilityLimitation } from "./types.js";

const tooltipAlignPoints = [
    { align: "cl cr", offset: { x: 0, y: -2 } },
    { align: "cr cl", offset: { x: 0, y: 10 } },
];

export interface IDashboardDropdownButtonProps {
    isOpen: boolean;
    label: string;
    toggleDropdown: () => void;
    accessibilityLimitation?: DashboardAccessibilityLimitation;
}

function Button({ accessibilityLimitation, toggleDropdown, isOpen, label }: IDashboardDropdownButtonProps) {
    const icon = accessibilityLimitation === undefined ? undefined : "gd-icon-circle-exclamation";
    return (
        <DropdownButton
            className="dashboard-dropdown-button s-dashboards-dropdown-button"
            value={label}
            isOpen={isOpen}
            onClick={toggleDropdown}
            iconLeft={icon}
        />
    );
}

export function DashboardListButton(props: IDashboardDropdownButtonProps) {
    const { accessibilityLimitation } = props;
    const intl = useIntl();
    const tooltip = getTooltip(intl, accessibilityLimitation);

    if (!tooltip) {
        return <Button {...props} />;
    }

    return (
        <BubbleHoverTrigger tagName="div" showDelay={200} hideDelay={0}>
            <Button {...props} />
            <Bubble
                className="bubble-primary"
                alignPoints={tooltipAlignPoints}
                arrowOffsets={{ "cr cl": [15, 0] }}
            >
                {tooltip}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
