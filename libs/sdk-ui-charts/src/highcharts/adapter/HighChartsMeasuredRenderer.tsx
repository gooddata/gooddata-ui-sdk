// (C) 2007-2018 GoodData Corporation
import React from "react";
import Measure, { MeasuredComponentProps, ContentRect } from "react-measure";

const MEASURED_ELEMENT_STYLE = { width: "100%", height: "100%" };
export interface IHighChartsMeasuredRendererProps {
    childrenRenderer: (contentRect: ContentRect) => JSX.Element;
}

export function HighChartsMeasuredRenderer(props: IHighChartsMeasuredRendererProps): JSX.Element {
    return (
        <Measure client={true}>
            {({ measureRef, contentRect }: MeasuredComponentProps) => {
                return (
                    <div
                        className="visualization-container-measure-wrap"
                        style={MEASURED_ELEMENT_STYLE}
                        ref={measureRef}
                    >
                        {props.childrenRenderer(contentRect)}
                    </div>
                );
            }}
        </Measure>
    );
}
