// (C) 2023-2026 GoodData Corporation

import { type ComponentType, type KeyboardEvent, type MouseEvent, useCallback } from "react";

import { FormattedMessage } from "react-intl";

import { type IChartCoordinates, wrapDisplayName } from "@gooddata/sdk-ui";
import { isActionKey, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { type IWithDrillableItemProps } from "../../../interfaces/BaseHeadlines.js";
import { type IHeadlineDataItem } from "../../../interfaces/Headlines.js";
import { useBaseHeadline } from "../BaseHeadlineContext.js";

function getCursorCoordinatesFromMouseEvent(event: MouseEvent<EventTarget>): IChartCoordinates {
    const element = event.target as HTMLElement | null;
    if (!element) {
        return { chartX: undefined, chartY: undefined };
    }
    const rect = element.getBoundingClientRect();
    return {
        chartX: event.clientX - rect.left,
        chartY: event.clientY - rect.top,
    };
}

function getCenterCoordinatesFromTarget(target: EventTarget): IChartCoordinates {
    const element = target as HTMLElement | null;
    if (!element) {
        return { chartX: undefined, chartY: undefined };
    }
    const rect = element.getBoundingClientRect();
    return {
        chartX: rect.width / 2,
        chartY: rect.height / 2,
    };
}

export const withDrillable = <T extends IWithDrillableItemProps<IHeadlineDataItem>>(
    BaseHeadlineValueItem: ComponentType<T>,
): ComponentType<T> => {
    function WithDrillable(props: T) {
        const { dataItem, elementType } = props;
        const { fireDrillEvent } = useBaseHeadline();
        const drillId = useIdPrefixed("drill-hint");

        const handleDrillable = useCallback(
            (event: MouseEvent<EventTarget>) => {
                if (dataItem?.isDrillable) {
                    const chartCoordinates = getCursorCoordinatesFromMouseEvent(event);
                    fireDrillEvent(dataItem, elementType!, event.target, chartCoordinates);
                }
            },
            [dataItem, elementType, fireDrillEvent],
        );

        const handleKeyDown = useCallback(
            (event: KeyboardEvent<HTMLDivElement>) => {
                if (dataItem?.isDrillable && isActionKey(event)) {
                    const chartCoordinates = getCenterCoordinatesFromTarget(event.target);
                    fireDrillEvent(dataItem, elementType!, event.target, chartCoordinates);
                }
            },
            [dataItem, elementType, fireDrillEvent],
        );

        return dataItem?.isDrillable ? (
            <div
                className="is-drillable s-is-drillable headline-item-link s-headline-item-link"
                onClick={handleDrillable}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="button"
                aria-haspopup="dialog"
                aria-describedby={drillId}
            >
                <BaseHeadlineValueItem {...props} />
                <span id={drillId} hidden>
                    <FormattedMessage id="visualizations.headline.pagination.drill.hint" />
                </span>
            </div>
        ) : (
            <BaseHeadlineValueItem {...props} />
        );
    }

    return wrapDisplayName("withDrillable", BaseHeadlineValueItem)(WithDrillable);
};
