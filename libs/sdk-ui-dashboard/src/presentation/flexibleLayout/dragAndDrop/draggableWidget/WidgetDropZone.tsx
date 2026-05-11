// (C) 2022-2026 GoodData Corporation

import { hasParent } from "../../../../_staging/layout/coordinates.js";
import { type ILayoutItemPath } from "../../../../types.js";

import { WidgetDropZoneBox } from "./WidgetDropZoneBox.js";

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
