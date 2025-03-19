// (C) 2022-2025 GoodData Corporation
import React from "react";

import { ILayoutItemPath } from "../../../../types.js";

import { WidgetDropZoneBox } from "./WidgetDropZoneBox.js";

export type WidgetDropZoneProps = {
    isLastInSection: boolean;
    layoutPath: ILayoutItemPath;
    dropRef: any;
};

export const WidgetDropZone = (props: WidgetDropZoneProps) => {
    const { isLastInSection, dropRef, layoutPath } = props;

    const isInContainer = layoutPath.length > 1;

    return (
        <div className="widget-dropzone" ref={dropRef}>
            <WidgetDropZoneBox isLast={isLastInSection} isInContainer={isInContainer} />
        </div>
    );
};
