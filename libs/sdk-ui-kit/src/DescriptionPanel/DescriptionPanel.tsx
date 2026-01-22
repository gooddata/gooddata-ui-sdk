// (C) 2022-2025 GoodData Corporation

import { type ComponentType } from "react";

import cx from "classnames";
import { isEmpty } from "lodash-es";

import { type IExecutionConfig, type IFilter, type ISeparators } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { EllipsisText } from "./EllipsisText.js";
import { Bubble } from "../Bubble/Bubble.js";
import { BubbleHoverTrigger } from "../Bubble/BubbleHoverTrigger.js";
import { type ArrowOffsets } from "../Bubble/typings.js";
import { useMediaQuery } from "../responsive/useMediaQuery.js";
import { RichText } from "../RichText/RichText.js";
import { ZOOM_THRESHOLD, useIsZoomed } from "../ZoomContext/ZoomContext.js";

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
    useRichText?: boolean;
    useReferences?: boolean;
    LoadingComponent?: ComponentType;
    filters?: IFilter[];
    separators?: ISeparators;
    execConfig?: IExecutionConfig;
    id?: string;
}

/**
 * @internal
 */
export function DescriptionPanel(props: IDescriptionPanelProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <DescriptionPanelCore {...props} />
        </IntlWrapper>
    );
}

/**
 * @internal
 */
export function DescriptionPanelContent(props: IDescriptionPanelProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <DescriptionPanelContentCore {...props} />
        </IntlWrapper>
    );
}
/**
 * @internal
 */
export function DescriptionIcon({ className }: IDescriptionTriggerProps) {
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
}

function DescriptionPanelCore(props: IDescriptionPanelProps) {
    const { arrowOffsets = DESCRIPTION_PANEL_ARROW_OFFSETS } = props;
    return (
        <BubbleHoverTrigger onBubbleOpen={props.onBubbleOpen} showDelay={0} eventsOnBubble>
            <DescriptionIcon className={props.className} />
            <Bubble
                className="bubble-light gd-description-panel-bubble"
                alignPoints={DESCRIPTION_PANEL_ALIGN_POINTS}
                arrowOffsets={arrowOffsets}
                arrowStyle={{ display: "none" }}
                ensureVisibility
            >
                <DescriptionPanelContentCore {...props} />
            </Bubble>
        </BubbleHoverTrigger>
    );
}

function DescriptionPanelContentCore({
    title,
    description,
    useRichText = false,
    useReferences = false,
    LoadingComponent,
    filters,
    separators,
    execConfig,
    id,
}: IDescriptionPanelProps) {
    const isZoomed = useIsZoomed(ZOOM_THRESHOLD); // ignore slight zoom in

    const className = cx("gd-description-panel s-gd-description-panel", {
        zoomed: isZoomed,
    });

    return (
        <div className={className} id={id}>
            {!isEmpty(title) && <div className="gd-description-panel-title">{title}</div>}
            {!isEmpty(description) && (
                <div className="gd-description-panel-content">
                    {useRichText ? (
                        <RichText
                            value={description ?? ""}
                            renderMode="view"
                            referencesEnabled={useReferences}
                            filters={filters}
                            separators={separators}
                            LoadingComponent={LoadingComponent}
                            execConfig={execConfig}
                        />
                    ) : (
                        <EllipsisText text={description ?? ""} />
                    )}
                </div>
            )}
        </div>
    );
}
