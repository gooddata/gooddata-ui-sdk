// (C) 2022-2025 GoodData Corporation

import { IKpiDraggingComponentProps } from "../../componentDefinition/types.js";
import { ShortenedText } from "@gooddata/sdk-ui-kit";

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
