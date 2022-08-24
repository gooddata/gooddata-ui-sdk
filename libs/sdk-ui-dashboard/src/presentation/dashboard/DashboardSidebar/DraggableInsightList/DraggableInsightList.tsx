// (C) 2007-2022 GoodData Corporation
import React, { useEffect, useRef } from "react";
import { FlexDimensions } from "@gooddata/sdk-ui-kit";

import { DraggableInsightListCore } from "./DraggableInsightListCore";

interface IDraggableInsightListProps {
    recalculateSizeReference?: string;
    searchAutofocus?: boolean;
}

export const DraggableInsightList: React.FC<IDraggableInsightListProps> = (props) => {
    const { recalculateSizeReference, searchAutofocus } = props;

    const flexRef = useRef<FlexDimensions>(null);

    useEffect(() => {
        flexRef.current?.updateSize();
    }, [recalculateSizeReference]);

    return (
        <div className="gd-visualizations-list gd-flex-item-stretch gd-flex-row-container">
            <FlexDimensions
                ref={flexRef}
                measureHeight={true}
                measureWidth={false}
                className="visualizations-flex-dimensions"
            >
                <DraggableInsightListCore searchAutofocus={searchAutofocus} />
            </FlexDimensions>
        </div>
    );
};
