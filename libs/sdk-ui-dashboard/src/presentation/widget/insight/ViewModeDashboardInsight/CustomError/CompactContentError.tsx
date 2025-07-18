// (C) 2021-2025 GoodData Corporation
import { FormattedMessage } from "react-intl";
import { BubbleHoverTrigger, Bubble, IAlignPoint } from "@gooddata/sdk-ui-kit";

interface ICompactContentErrorProps {
    className: string;
    headline: string;
    text: string;
}

const bubbleAlignPoints: IAlignPoint[] = [{ align: "bc tc", offset: { x: 0, y: 0 } }];

export function CompactContentError({ className, headline, text }: ICompactContentErrorProps) {
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
}
