// (C) 2022-2025 GoodData Corporation

import { ShortenedText } from "@gooddata/sdk-ui-kit";

import { IKpiDraggingComponentProps } from "../../componentDefinition/types.js";

/*
 * @internal
 */
export function KpiDraggingComponent({ item }: IKpiDraggingComponentProps) {
    return (
        <div className="move-kpi-placeholder">
            <ShortenedText>{item.title}</ShortenedText>
        </div>
    );
}
