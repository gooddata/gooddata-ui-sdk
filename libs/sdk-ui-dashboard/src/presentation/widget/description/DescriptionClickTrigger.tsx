// (C) 2022 GoodData Corporation
import React, { useState, useCallback } from "react";
import cx from "classnames";

import {
    DescriptionIcon,
    DescriptionPanelContent,
    Bubble,
    DESCRIPTION_PANEL_ALIGN_POINTS,
    DESCRIPTION_PANEL_ARROW_OFFSETS,
} from "@gooddata/sdk-ui-kit";
import { IDescriptionClickTriggerProps } from "./types";

export const DescriptionClickTrigger: React.FC<IDescriptionClickTriggerProps> = (props) => {
    const [isOpen, setIsOpen] = useState(false);

    const switchIsOpen = useCallback(() => {
        setIsOpen((isOpen) => !isOpen);
    }, [setIsOpen]);

    const iconClassName = cx(
        "dash-item-action-description",
        {
            "dash-item-action-description-active": isOpen,
        },
        props.className,
    );

    return (
        <>
            <div className={iconClassName} onClick={switchIsOpen}>
                <DescriptionIcon className="dash-item-action-description-trigger" />
            </div>
            {isOpen ? (
                <Bubble
                    className="bubble-light gd-description-panel-bubble"
                    alignPoints={DESCRIPTION_PANEL_ALIGN_POINTS}
                    arrowOffsets={DESCRIPTION_PANEL_ARROW_OFFSETS}
                    arrowStyle={{ display: "none" }}
                    onClose={switchIsOpen}
                    closeOnOutsideClick={true}
                    closeOnParentScroll={true}
                    alignTo={`.${props.className}`}
                >
                    <DescriptionPanelContent {...props} />
                </Bubble>
            ) : null}
        </>
    );
};
