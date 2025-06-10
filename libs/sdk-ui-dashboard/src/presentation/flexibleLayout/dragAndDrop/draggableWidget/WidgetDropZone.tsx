// (C) 2022-2025 GoodData Corporation
import React from "react";

import { ILayoutItemPath } from "../../../../types.js";

import { WidgetDropZoneBox } from "./WidgetDropZoneBox.js";
import { hasParent } from "../../../../_staging/layout/coordinates.js";

export type WidgetDropZoneProps = {
    isLastInSection: boolean;
    layoutPath: ILayoutItemPath;
    dropRef: any;
};

export const WidgetDropZone: React.FC<WidgetDropZoneProps> = ({ isLastInSection, dropRef, layoutPath }) => (
    <div className="widget-dropzone" ref={dropRef}>
        <WidgetDropZoneBox isLast={isLastInSection} isInContainer={hasParent(layoutPath)} />
    </div>
);
