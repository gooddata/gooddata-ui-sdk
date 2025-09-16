// (C) 2007-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { Bubble, BubbleHoverTrigger, IAlignPoint, Typography } from "@gooddata/sdk-ui-kit";

interface INoDataErrorProps {
    fullContent: boolean;
}

const bubbleAlignPoints: IAlignPoint[] = [{ align: "bc tc", offset: { x: 0, y: 0 } }];

export function NoDataError({ fullContent }: INoDataErrorProps) {
    return (
        <div className="gd-visualization-content visualization-empty">
            <div className="info-label info-label-empty">
                {fullContent ? (
                    <>
                        <div className="info-label-icon-empty" />
                        <Typography tagName="p">
                            <FormattedMessage id="visualization.empty.headline" tagName="span" />
                        </Typography>
                    </>
                ) : (
                    <BubbleHoverTrigger>
                        <div className="info-label-icon-empty" />
                        <Bubble alignPoints={bubbleAlignPoints}>
                            <FormattedMessage id="visualization.empty.headline" tagName="span" />
                        </Bubble>
                    </BubbleHoverTrigger>
                )}
            </div>
        </div>
    );
}
