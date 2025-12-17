// (C) 2022-2025 GoodData Corporation

import { type KeyboardEvent, useCallback, useRef, useState } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import {
    Bubble,
    DESCRIPTION_PANEL_ARROW_OFFSETS,
    DescriptionIcon,
    DescriptionPanelContent,
    UiTooltip,
    isActionKey,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import { type IDescriptionClickTriggerProps } from "./types.js";

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

export function DescriptionClickTrigger(props: IDescriptionClickTriggerProps) {
    const { onOpen } = props;
    const [isOpen, setIsOpen] = useState(false);
    const intl = useIntl();
    const tooltipContentId = useIdPrefixed("description-tooltip");
    const iconRef = useRef<HTMLDivElement>(null);

    const switchIsOpen = useCallback(() => {
        setIsOpen((isOpen) => {
            if (!isOpen && onOpen) {
                onOpen();
            }
            return !isOpen;
        });
    }, [setIsOpen, onOpen]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, [setIsOpen]);

    const onKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>) => {
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

    const title = intl.formatMessage({ id: "widget.options.description" });

    const bubbleClassName = cx("bubble-light", "gd-description-panel-bubble", {
        hidden: !isOpen,
    });

    const overlayClassName = cx("gd-description-panel-bubble-overlay", {
        hidden: !isOpen,
    });

    return (
        <>
            <UiTooltip
                triggerBy={["hover", "focus"]}
                arrowPlacement="top-start"
                content={title}
                anchor={
                    <div
                        ref={iconRef}
                        className={iconClassName}
                        onClick={switchIsOpen}
                        onKeyDown={onKeyDown}
                        aria-label={title}
                        aria-expanded={isOpen}
                        aria-controls={tooltipContentId}
                        aria-describedby={isOpen ? tooltipContentId : undefined}
                        role="button"
                        tabIndex={0}
                    >
                        <DescriptionIcon className="dash-item-action-description-trigger" />
                    </div>
                }
            />

            {
                <Bubble
                    key={isOpen ? "open" : "closed"}
                    id={tooltipContentId}
                    className={bubbleClassName}
                    overlayClassName={overlayClassName}
                    alignPoints={DESCRIPTION_PANEL_ALIGN_POINTS}
                    arrowOffsets={DESCRIPTION_PANEL_ARROW_OFFSETS}
                    arrowStyle={{ display: "none" }}
                    onClose={handleClose}
                    closeOnOutsideClick={isOpen}
                    ignoreClicksOn={[iconRef.current ?? undefined]}
                    closeOnParentScroll={false}
                    alignTo={`.${props.className}`}
                    ensureVisibility
                >
                    {isOpen ? <DescriptionPanelContent {...props} /> : null}
                </Bubble>
            }
        </>
    );
}
