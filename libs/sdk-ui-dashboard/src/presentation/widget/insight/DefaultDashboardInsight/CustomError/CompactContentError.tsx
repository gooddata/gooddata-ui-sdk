// (C) 2021 GoodData Corporation
import React from "react";
import { FormattedHTMLMessage } from "react-intl";
import { BubbleHoverTrigger, Bubble, IAlignPoint } from "@gooddata/sdk-ui-kit";

interface ICompactContentErrorProps {
    className: string;
    headline: string;
    text: string;
}

const bubbleAlignPoints: IAlignPoint[] = [{ align: "bc tc", offset: { x: 0, y: 0 } }];

export const CompactContentError: React.FC<ICompactContentErrorProps> = ({ className, headline, text }) => {
    return (
        <BubbleHoverTrigger>
            <div className={`info-label-icon ${className}`} />
            <Bubble alignPoints={bubbleAlignPoints}>
                <FormattedHTMLMessage id={headline} />
                <br />
                <FormattedHTMLMessage id={text} />
            </Bubble>
        </BubbleHoverTrigger>
    );
};
