// (C) 2023-2025 GoodData Corporation

import { type ComponentType, type KeyboardEvent, type MouseEvent, useCallback } from "react";

import { FormattedMessage } from "react-intl";

import { wrapDisplayName } from "@gooddata/sdk-ui";
import { isActionKey, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { type IWithDrillableItemProps } from "../../../interfaces/BaseHeadlines.js";
import { type IHeadlineDataItem } from "../../../interfaces/Headlines.js";
import { useBaseHeadline } from "../BaseHeadlineContext.js";

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
                    fireDrillEvent(dataItem, elementType, event.target);
                }
            },
            [dataItem, elementType, fireDrillEvent],
        );

        const handleKeyDown = useCallback(
            (event: KeyboardEvent<HTMLDivElement>) => {
                if (dataItem?.isDrillable && isActionKey(event)) {
                    fireDrillEvent(dataItem, elementType, event.target);
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
