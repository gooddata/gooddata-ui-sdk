// (C) 2007-2025 GoodData Corporation

import { useEffect, useRef } from "react";

import { FlexDimensions } from "@gooddata/sdk-ui-kit";

import { DraggableInsightListCore } from "./DraggableInsightListCore.js";
import { IWrapInsightListItemWithDragComponent } from "../../../dragAndDrop/types.js";

interface IDraggableInsightListProps {
    WrapInsightListItemWithDragComponent?: IWrapInsightListItemWithDragComponent;
    recalculateSizeReference?: string;
    searchAutofocus?: boolean;
    enableDescriptions?: boolean;
}

export function DraggableInsightList({
    recalculateSizeReference,
    searchAutofocus,
    enableDescriptions,
    WrapInsightListItemWithDragComponent,
}: IDraggableInsightListProps) {
    const flexRef = useRef<FlexDimensions>(null);

    useEffect(() => {
        flexRef.current?.updateSize();
    }, [recalculateSizeReference]);

    return (
        <div className="gd-visualizations-list gd-flex-item-stretch gd-flex-row-container">
            <FlexDimensions
                ref={flexRef}
                measureHeight
                measureWidth={false}
                className="visualizations-flex-dimensions"
            >
                <DraggableInsightListCore
                    WrapInsightListItemWithDragComponent={WrapInsightListItemWithDragComponent}
                    searchAutofocus={searchAutofocus}
                    enableDescriptions={enableDescriptions}
                />
            </FlexDimensions>
        </div>
    );
}
