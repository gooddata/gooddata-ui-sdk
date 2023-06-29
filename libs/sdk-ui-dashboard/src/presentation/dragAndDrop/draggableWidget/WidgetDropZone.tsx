// (C) 2022 GoodData Corporation
import React from "react";

import { WidgetDropZoneBox } from "./WidgetDropZoneBox.js";

export type WidgetDropZoneProps = {
    isLastInSection: boolean;
    sectionIndex: number;
    itemIndex: number;
    dropRef: any;
};

export const WidgetDropZone = (props: WidgetDropZoneProps) => {
    const { isLastInSection, dropRef } = props;

    return (
        <div className="widget-dropzone" ref={dropRef}>
            <WidgetDropZoneBox isLast={isLastInSection} />
        </div>
    );
};
