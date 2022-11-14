// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger, Button, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { IDashboardToolbarButton } from "./types";

const ALIGN_POINTS: IAlignPoint[] = [{ align: "tc bc", offset: { x: 0, y: -5 } }];

interface IDashboardToolbarButtonBubbleWrapperProps {
    tooltip: string | undefined;
    children: React.ReactElement;
}

const DashboardToolbarButtonBubbleWrapper: React.FC<IDashboardToolbarButtonBubbleWrapperProps> = (props) => {
    const { tooltip, children } = props;
    if (!tooltip) {
        return <div className="gd-toolbar-button-wrapper">{children}</div>;
    }

    return (
        <BubbleHoverTrigger className="gd-toolbar-button-wrapper">
            {children}
            <Bubble alignPoints={ALIGN_POINTS}>{tooltip}</Bubble>
        </BubbleHoverTrigger>
    );
};

export const DashboardToolbarButton: React.FC<IDashboardToolbarButton> = (props) => {
    const { tooltip, disabled, icon, onClick, isActive } = props;
    return (
        <DashboardToolbarButtonBubbleWrapper tooltip={tooltip}>
            <Button
                className={cx("gd-button-secondary", { [`gd-icon-${icon}`]: icon, "is-active": isActive })}
                disabled={disabled}
                onClick={onClick}
            />
        </DashboardToolbarButtonBubbleWrapper>
    );
};
