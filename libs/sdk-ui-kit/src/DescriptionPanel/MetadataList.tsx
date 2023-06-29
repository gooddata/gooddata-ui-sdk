// (C) 2022-2023 GoodData Corporation
import React from "react";
import isEmpty from "lodash/isEmpty.js";
import { Bubble, BubbleHoverTrigger } from "../Bubble/index.js";
import { IMetadataObjectBase } from "@gooddata/sdk-model";

const ARROW_OFFSETS = {
    "cr cl": [13, 0],
    "cl cr": [-13, 0],
    "tc bc": [0, -13],
    "bc tc": [0, 13],
};
const ALIGN_POINTS = [{ align: "cr cl" }, { align: "tc bc" }, { align: "bc tc" }, { align: "cl cr" }];

/**
 * @internal
 */
export interface IMetadataListProps {
    title?: string;
    list?: IMetadataObjectBase[];
}

/**
 * @internal
 */
export const MetadataList: React.FC<IMetadataListProps> = ({ title, list }) => (
    <div className="gd-metadata-list">
        {title ? <div className="gd-metadata-list-title">{title}</div> : null}
        {list?.map((element, index) => (
            <div className="gd-metadata-list-element" key={index}>
                <span title={element.title}>{element.title}</span>
                {!isEmpty(element.description) && (
                    <BubbleHoverTrigger className="gd-metadata-list-icon" showDelay={0} hideDelay={0}>
                        <div className="gd-icon-circle-question" />
                        <Bubble
                            className="bubble-primary"
                            arrowOffsets={ARROW_OFFSETS}
                            alignPoints={ALIGN_POINTS}
                        >
                            {element.description}
                        </Bubble>
                    </BubbleHoverTrigger>
                )}
            </div>
        ))}
    </div>
);
