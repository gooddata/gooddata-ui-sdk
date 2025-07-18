// (C) 2022-2025 GoodData Corporation
import { ReactElement } from "react";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger, Button, IAlignPoint } from "@gooddata/sdk-ui-kit";

const ALIGN_POINTS: IAlignPoint[] = [{ align: "tc bc", offset: { x: 0, y: -5 } }];

interface IDashboardToolbarButtonBubbleWrapperProps {
    tooltip: string | undefined;
    children: ReactElement;
}

function DashboardToolbarButtonBubbleWrapper({
    tooltip,
    children,
}: IDashboardToolbarButtonBubbleWrapperProps) {
    if (!tooltip) {
        return <div className="gd-toolbar-button-wrapper">{children}</div>;
    }

    return (
        <BubbleHoverTrigger className="gd-toolbar-button-wrapper">
            {children}
            <Bubble alignPoints={ALIGN_POINTS}>{tooltip}</Bubble>
        </BubbleHoverTrigger>
    );
}

/**
 * @internal
 */
export interface IDefaultDashboardToolbarButtonProps {
    icon: string;
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    tooltip?: string;
}

/**
 * @internal
 */
export function DefaultDashboardToolbarButton({
    tooltip,
    disabled,
    icon,
    onClick,
    isActive,
}: IDefaultDashboardToolbarButtonProps) {
    return (
        <DashboardToolbarButtonBubbleWrapper tooltip={tooltip}>
            <Button
                className={cx("gd-button-secondary", { [`gd-icon-${icon}`]: icon, "is-active": isActive })}
                disabled={disabled}
                onClick={onClick}
            />
        </DashboardToolbarButtonBubbleWrapper>
    );
}
