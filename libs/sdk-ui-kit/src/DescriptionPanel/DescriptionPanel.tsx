// (C) 2022 GoodData Corporation
import React from "react";
import isEmpty from "lodash/isEmpty.js";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { EllipsisText } from "./EllipsisText.js";
import { ArrowOffsets, Bubble, BubbleHoverTrigger } from "../Bubble/index.js";
import { useMediaQuery } from "../responsive/index.js";
import cx from "classnames";

/**
 * @internal
 */
export const DESCRIPTION_PANEL_ALIGN_POINTS = [
    { align: "cr cl" },
    { align: "tr tl" },
    { align: "br bl" },

    { align: "bc tc" },
    { align: "bl tl" },
    { align: "br tr" },

    { align: "tc bc" },
    { align: "tr br" },
    { align: "tl bl" },

    { align: "cl cr" },
    { align: "tl tr" },
    { align: "bl br" },
];
/**
 * @internal
 */
export const DESCRIPTION_PANEL_ARROW_OFFSETS = {
    "br tr": [0, 5],
    "bc tc": [0, 5],
    "bl tl": [0, 5],

    "tr br": [0, -5],
    "tc bc": [0, -5],
    "tl bl": [0, -5],

    "tr tl": [5, 0],
    "cr cl": [5, 0],
    "br bl": [5, 0],

    "tl tr": [-5, 0],
    "cl cr": [-5, 0],
    "bl br": [-5, 0],
};

/**
 * @internal
 */
export interface IDescriptionTriggerProps {
    className?: string;
}

/**
 * @internal
 */

export interface IDescriptionPanelProps {
    title?: string;
    description?: string;
    locale?: string;
    className?: string;
    onBubbleOpen?: () => void;
    arrowOffsets?: ArrowOffsets;
}

/**
 * @internal
 */
export const DescriptionPanel: React.FC<IDescriptionPanelProps> = (props) => (
    <IntlWrapper locale={props.locale}>
        <DescriptionPanelCore {...props} />
    </IntlWrapper>
);

/**
 * @internal
 */
export const DescriptionPanelContent: React.FC<IDescriptionPanelProps> = (props) => (
    <IntlWrapper locale={props.locale}>
        <DescriptionPanelContentCore {...props} />
    </IntlWrapper>
);
/**
 * @internal
 */
export const DescriptionIcon: React.FC<IDescriptionTriggerProps> = ({ className }) => {
    const isMobileDevice = useMediaQuery("mobileDevice");
    return (
        <div
            className={cx(
                "s-description-trigger",
                {
                    "is-mobile": isMobileDevice,
                    "gd-icon-circle-question-wrapper": !className,
                },
                className,
            )}
        >
            <div className="gd-icon-circle-question" />
        </div>
    );
};

const DescriptionPanelCore: React.FC<IDescriptionPanelProps> = (props) => {
    const { arrowOffsets = DESCRIPTION_PANEL_ARROW_OFFSETS } = props;
    return (
        <BubbleHoverTrigger onBubbleOpen={props.onBubbleOpen} showDelay={0} eventsOnBubble={true}>
            <DescriptionIcon className={props.className} />
            <Bubble
                className="bubble-light gd-description-panel-bubble"
                alignPoints={DESCRIPTION_PANEL_ALIGN_POINTS}
                arrowOffsets={arrowOffsets}
                arrowStyle={{ display: "none" }}
            >
                <DescriptionPanelContentCore {...props} />
            </Bubble>
        </BubbleHoverTrigger>
    );
};

const DescriptionPanelContentCore: React.FC<IDescriptionPanelProps> = (props) => {
    const { title, description } = props;

    return (
        <div className="gd-description-panel s-gd-description-panel">
            {!isEmpty(title) && <div className="gd-description-panel-title">{title}</div>}
            {!isEmpty(description) && (
                <div className="gd-description-panel-content">
                    <EllipsisText text={description} />
                </div>
            )}
        </div>
    );
};
