// (C) 2022-2024 GoodData Corporation
import React from "react";

import { ILayoutItemPath } from "../../../../types.js";

import { WidgetDropZoneBox } from "./WidgetDropZoneBox.js";

export type WidgetDropZoneProps = {
    isLastInSection: boolean;
    layoutPath: ILayoutItemPath;
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
