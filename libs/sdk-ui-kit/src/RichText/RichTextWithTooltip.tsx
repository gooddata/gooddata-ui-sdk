// (C) 2024 GoodData Corporation

import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { IntlWrapper } from "@gooddata/sdk-ui";
import { IRichTextProps, RichText } from "./RichText.js";
import { IAlignPoint } from "../typings/positioning.js";
import { BubbleHoverTrigger } from "../Bubble/BubbleHoverTrigger.js";
import { Bubble } from "../Bubble/Bubble.js";

const alignPoints: IAlignPoint[] = [{ align: "bc tc" }, { align: "tc bc" }];
const descriptionMarkdown = (
    <>
        <br />
        **Bold**
        <br />
        * List
        <br />
        [link](http://thisisalink.com)
    </>
);

/**
 * @internal
 */
export interface IRichTextWithTooltipProps extends IRichTextProps {
    showTooltip?: boolean;
    tooltipAlignPoints?: IAlignPoint[];
    tooltipDescription?: string;
    tooltipMarkdown?: JSX.Element;
}

const RichTextWithTooltipCore: React.FC<IRichTextWithTooltipProps> = ({
    value,
    onChange,
    renderMode,
    editPlaceholder,
    editRows,
    emptyElement,
    className,
    showTooltip = true,
    tooltipAlignPoints = alignPoints,
    tooltipDescription,
    tooltipMarkdown = descriptionMarkdown,
    autoResize,
}) => {
    const intl = useIntl();
    const description = tooltipDescription ?? intl.formatMessage({ id: "richText.tooltip" });

    const Component = useMemo(() => {
        return (
            <RichText
                value={value}
                onChange={onChange}
                renderMode={renderMode}
                editPlaceholder={editPlaceholder}
                editRows={editRows}
                emptyElement={emptyElement}
                className={className}
                autoResize={autoResize}
            />
        );
    }, [value, onChange, renderMode, editPlaceholder, editRows, emptyElement, className, autoResize]);

    if (!showTooltip) {
        return Component;
    }

    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0} openOnInit={true}>
            {Component}
            {showTooltip ? (
                <Bubble alignPoints={tooltipAlignPoints} className="bubble-primary bubble-small">
                    {description}
                    {tooltipMarkdown}
                </Bubble>
            ) : null}
        </BubbleHoverTrigger>
    );
};

/**
 * @internal
 */
export const RichTextWithTooltip: React.FC<IRichTextWithTooltipProps> = (props) => (
    <IntlWrapper>
        <RichTextWithTooltipCore {...props} />
    </IntlWrapper>
);
