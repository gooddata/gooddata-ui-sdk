// (C) 2007-2021 GoodData Corporation
import React from "react";
import { FormattedHTMLMessage } from "react-intl";
import { Typography, BubbleHoverTrigger, Bubble } from "@gooddata/sdk-ui-kit";

interface INoDataErrorProps {
    fullContent: boolean;
}

export const NoDataError: React.FC<INoDataErrorProps> = ({ fullContent }) => {
    return (
        <div className="gd-visualization-content visualization-empty">
            <div className="info-label info-label-empty">
                {fullContent ? (
                    <>
                        <div className="info-label-icon-empty" />
                        <Typography tagName="p">
                            <FormattedHTMLMessage id="visualization.empty.headline" />
                        </Typography>
                    </>
                ) : (
                    <BubbleHoverTrigger>
                        <div className="info-label-icon-empty" />
                        <Bubble alignPoints={[{ align: "bc tc", offset: { x: 0, y: 0 } }]}>
                            <FormattedHTMLMessage id="visualization.empty.headline" />
                        </Bubble>
                    </BubbleHoverTrigger>
                )}
            </div>
        </div>
    );
};
