// (C) 2024-2026 GoodData Corporation

import { type ReactElement } from "react";

import { useIntl } from "react-intl";

import { IntlWrapper } from "@gooddata/sdk-ui";

import { Bubble } from "../Bubble/Bubble.js";
import { BubbleHoverTrigger } from "../Bubble/BubbleHoverTrigger.js";
import { type IAlignPoint } from "../typings/positioning.js";

import { type IRichTextProps, RichText } from "./RichText.js";

const alignPoints: IAlignPoint[] = [{ align: "bc tc" }, { align: "tc bc" }];
const descriptionMarkdown = (
    <>
        <br /># Heading 1
        <br />
        **Bold**
        <br />* List
        <br />
        [link](http://thisisalink.com)
        <br />
        ![image](http://url/img.png)
        <br />
        {"{metric/metric_id}"}
        <br />
        {"{label/label_id}"}
        <br />
        {"{parameter/parameter_id}"}
    </>
);

/**
 * @internal
 */
export interface IRichTextWithTooltipProps extends IRichTextProps {
    showTooltip?: boolean;
    tooltipAlignPoints?: IAlignPoint[];
    tooltipDescription?: string;
    tooltipMarkdown?: ReactElement;
}

function RichTextWithTooltipCore({
    showTooltip = true,
    tooltipAlignPoints = alignPoints,
    tooltipDescription,
    tooltipMarkdown = descriptionMarkdown,
    ...richTextProps
}: IRichTextWithTooltipProps) {
    const intl = useIntl();
    const description = tooltipDescription ?? intl.formatMessage({ id: "richText.tooltip" });

    if (!showTooltip) {
        return <RichText {...richTextProps} />;
    }

    return (
        <BubbleHoverTrigger showDelay={0} hideDelay={0} openOnInit>
            <RichText {...richTextProps} />
            {showTooltip ? (
                <Bubble
                    alignPoints={tooltipAlignPoints}
                    className="bubble-primary bubble-small"
                    overlayClassName="rich-text-tooltip"
                >
                    {description}
                    {tooltipMarkdown}
                </Bubble>
            ) : null}
        </BubbleHoverTrigger>
    );
}

/**
 * @internal
 */
export function RichTextWithTooltip(props: IRichTextWithTooltipProps) {
    return (
        <IntlWrapper>
            <RichTextWithTooltipCore {...props} />
        </IntlWrapper>
    );
}
