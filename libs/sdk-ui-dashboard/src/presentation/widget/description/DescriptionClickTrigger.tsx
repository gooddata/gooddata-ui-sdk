// (C) 2022-2025 GoodData Corporation
import React, { useState, useCallback } from "react";
import cx from "classnames";
import { useIntl } from "react-intl";

import {
    DescriptionIcon,
    DescriptionPanelContent,
    Bubble,
    DESCRIPTION_PANEL_ARROW_OFFSETS,
    isActionKey,
    UiTooltip,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";
import { IDescriptionClickTriggerProps } from "./types.js";

const DESCRIPTION_PANEL_ALIGN_POINTS = [
    { align: "tr tl" },
    { align: "cr cl" },
    { align: "br bl" },

    { align: "tl tr" },
    { align: "cl cr" },
    { align: "bl br" },

    { align: "bl tl" },
    { align: "bc tc" },
    { align: "br tr" },

    { align: "tl bl" },
    { align: "tc bc" },
    { align: "tr br" },
];

export const DescriptionClickTrigger: React.FC<IDescriptionClickTriggerProps> = (props) => {
    const { onOpen } = props;
    const [isOpen, setIsOpen] = useState(false);
    const intl = useIntl();

    const switchIsOpen = useCallback(() => {
        setIsOpen((isOpen) => {
            if (!isOpen && onOpen) {
                onOpen();
            }
            return !isOpen;
        });
    }, [setIsOpen, onOpen]);

    const onKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            // This enables keyboard interaction events after focus
            if (isActionKey(event)) {
                event.preventDefault();
                switchIsOpen();
            }
        },
        [switchIsOpen],
    );

    const iconClassName = cx(
        "dash-item-action-description",
        "dash-item-action-placeholder",
        {
            "dash-item-action-description-active": isOpen,
        },
        props.className,
    );
    const descriptionTooltipId = useIdPrefixed("description-tooltip-id");

    return (
        <>
            <UiTooltip
                id={descriptionTooltipId}
                triggerBy={["hover", "focus"]}
                arrowPlacement="top-start"
                content={intl.formatMessage({ id: "widget.options.description" })}
                anchor={
                    <div
                        className={iconClassName}
                        onClick={switchIsOpen}
                        onKeyDown={onKeyDown}
                        aria-describedby={descriptionTooltipId}
                        role="button"
                        tabIndex={0}
                    >
                        <DescriptionIcon className="dash-item-action-description-trigger" />
                    </div>
                }
            />

            {isOpen ? (
                <Bubble
                    className="bubble-light gd-description-panel-bubble"
                    overlayClassName="gd-description-panel-bubble-overlay"
                    alignPoints={DESCRIPTION_PANEL_ALIGN_POINTS}
                    arrowOffsets={DESCRIPTION_PANEL_ARROW_OFFSETS}
                    arrowStyle={{ display: "none" }}
                    onClose={switchIsOpen}
                    closeOnOutsideClick={true}
                    closeOnParentScroll={false}
                    alignTo={`.${props.className}`}
                    ensureVisibility={true}
                >
                    <DescriptionPanelContent {...props} />
                </Bubble>
            ) : null}
        </>
    );
};
