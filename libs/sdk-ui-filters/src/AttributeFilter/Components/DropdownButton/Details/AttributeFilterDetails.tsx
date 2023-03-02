// (C) 2023 GoodData Corporation

import React from "react";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { IMetadataObject } from "@gooddata/sdk-model";

interface IAttributeFilterDetailsProps {
    title?: string;
    defaultAttributeFilterTitle?: string;
    dataSet?: IMetadataObject;
}

const bubbleAlignPoints: IAlignPoint[] = [{ align: "cr cl", offset: { x: 0, y: 50 } }];

export const AttributeFilterDetails: React.FC<IAttributeFilterDetailsProps> = ({
    title,
    defaultAttributeFilterTitle,
    dataSet,
}) => {
    return (
        <span className="gd-list-item-tooltip">
            <BubbleHoverTrigger>
                <span className="gd-icon-circle-question gd-list-item-tooltip-icon s-attribute-filter-tooltip-icon" />
                <Bubble
                    className="bubble-light gd-attribute-filter-details s-attribute-filter-details-bubble"
                    alignPoints={bubbleAlignPoints}
                    arrowStyle={{ display: "none" }}
                >
                    <div className="gd-attribute-filter-tooltip-content s-attribute-filter-tooltip-content">
                        <h3 className="s-attribute-filter-tooltip-header">
                            {title ?? defaultAttributeFilterTitle}
                        </h3>
                        <h4>
                            <FormattedMessage id="attributesDropdown.details.type" />
                        </h4>
                        <p className="s-attribute-filter-tooltip-item-name">{defaultAttributeFilterTitle}</p>
                        <h4>
                            <FormattedMessage id="attributesDropdown.details.dataset" />
                        </h4>
                        <p className="s-attribute-filter-tooltip-item-dataset">{dataSet.title}</p>
                    </div>
                </Bubble>
            </BubbleHoverTrigger>
        </span>
    );
};
