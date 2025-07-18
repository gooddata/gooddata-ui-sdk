// (C) 2022-2025 GoodData Corporation

import { WidgetDropZoneBox } from "./WidgetDropZoneBox.js";

export type WidgetDropZoneProps = {
    isLastInSection: boolean;
    sectionIndex: number;
    itemIndex: number;
    dropRef: any;
};

export function WidgetDropZone(props: WidgetDropZoneProps) {
    const { isLastInSection, dropRef } = props;

    return (
        <div className="widget-dropzone" ref={dropRef}>
            <WidgetDropZoneBox isLast={isLastInSection} />
        </div>
    );
}
