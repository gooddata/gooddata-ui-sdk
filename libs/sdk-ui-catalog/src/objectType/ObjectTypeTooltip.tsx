// (C) 2025-2026 GoodData Corporation

import type { ReactNode } from "react";

import { type IntlShape } from "react-intl";

import { UiTooltip } from "@gooddata/sdk-ui-kit";

import { getObjectTypeLabel } from "./labels.js";
import type { ObjectType } from "./types.js";
import type { VisualizationType } from "../catalogItem/types.js";

type Props = {
    intl: IntlShape;
    type: ObjectType;
    visualizationType?: VisualizationType;
    anchor: ReactNode;
};

export function ObjectTypeTooltip({ intl, type, visualizationType, anchor }: Props) {
    const tooltipContent = getObjectTypeLabel(intl, type, visualizationType);
    return (
        <UiTooltip
            arrowPlacement="top"
            optimalPlacement
            triggerBy={["hover"]}
            anchor={anchor}
            content={tooltipContent}
        />
    );
}
