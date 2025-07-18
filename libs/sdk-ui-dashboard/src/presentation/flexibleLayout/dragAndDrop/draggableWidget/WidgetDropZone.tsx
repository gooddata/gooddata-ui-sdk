// (C) 2022-2025 GoodData Corporation

import { ILayoutItemPath } from "../../../../types.js";

import { WidgetDropZoneBox } from "./WidgetDropZoneBox.js";
import { hasParent } from "../../../../_staging/layout/coordinates.js";

export type WidgetDropZoneProps = {
    isLastInSection: boolean;
    layoutPath: ILayoutItemPath;
    dropRef: any;
};

export function WidgetDropZone({ isLastInSection, dropRef, layoutPath }: WidgetDropZoneProps) {
    return (
        <div className="widget-dropzone" ref={dropRef}>
            <WidgetDropZoneBox isLast={isLastInSection} isInContainer={hasParent(layoutPath)} />
        </div>
    );
}
