// (C) 2022 GoodData Corporation
import React from "react";
import isEmpty from "lodash/isEmpty";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { EllipsisText } from "./EllipsisText";
import { Bubble, BubbleHoverTrigger } from "../Bubble";
import { useMediaQuery } from "../responsive";
import cx from "classnames";

const MOBILE_ALIGN_POINTS = [{ align: "br tr" }, { align: "tr br" }];
const MOBILE_ARROW_OFFSETS = { "br tr": [45, 5], "tr br": [45, -5] };
const ALIGN_POINTS = [
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
const ARROW_OFFSETS = {
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
export interface IDescriptionPanelProps {
    title?: string;
    description?: string;
    locale?: string;
    className?: string;
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

const DescriptionPanelCore: React.FC<IDescriptionPanelProps> = (props) => {
    const isMobileDevice = useMediaQuery("mobileDevice");
    return (
        <BubbleHoverTrigger showDelay={0} eventsOnBubble={true}>
            <div
                className={cx("gd-icon-circle-question-wrapper", "gd-description-icon", {
                    "is-mobile": isMobileDevice,
                })}
            >
                <div className="gd-icon-circle-question" />
            </div>
            <Bubble
                className="bubble-light gd-description-panel-bubble"
                alignPoints={isMobileDevice ? MOBILE_ALIGN_POINTS : ALIGN_POINTS}
                arrowOffsets={isMobileDevice ? MOBILE_ARROW_OFFSETS : ARROW_OFFSETS}
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
        <div className="gd-description-panel">
            {!isEmpty(title) && <div className="gd-description-panel-title">{title}</div>}
            <div className="gd-description-panel-content">
                {!isEmpty(description) && <EllipsisText text={description} />}
            </div>
        </div>
    );
};
