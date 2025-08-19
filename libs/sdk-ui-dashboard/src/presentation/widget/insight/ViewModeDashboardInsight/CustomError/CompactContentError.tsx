// (C) 2021-2025 GoodData Corporation
import React from "react";

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";

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
                <FormattedMessage id={headline} />
                <br />
                <FormattedMessage id={text} />
            </Bubble>
        </BubbleHoverTrigger>
    );
};
