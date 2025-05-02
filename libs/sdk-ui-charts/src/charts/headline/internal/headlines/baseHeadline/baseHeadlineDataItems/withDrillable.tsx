// (C) 2023-2025 GoodData Corporation
import React, { useCallback } from "react";
import { wrapDisplayName } from "@gooddata/sdk-ui";

import { IWithDrillableItemProps } from "../../../interfaces/BaseHeadlines.js";
import { useBaseHeadline } from "../BaseHeadlineContext.js";
import { IHeadlineDataItem } from "../../../interfaces/Headlines.js";

export const withDrillable = <T extends IWithDrillableItemProps<IHeadlineDataItem>>(
    BaseHeadlineValueItem: React.ComponentType<T>,
): React.ComponentType<T> => {
    const WithDrillable: React.FC<T> = (props) => {
        const { dataItem, elementType } = props;
        const { fireDrillEvent } = useBaseHeadline();

        const handleDrillable = useCallback(
            (event: React.MouseEvent<EventTarget> | React.KeyboardEvent<EventTarget>) => {
                if (dataItem?.isDrillable) {
                    fireDrillEvent(dataItem, elementType, event.target);
                }
            },
            [dataItem, elementType, fireDrillEvent],
        );

        return dataItem?.isDrillable ? (
            <button
                className="gd-headline-drillable-button is-drillable s-is-drillable headline-item-link s-headline-item-link"
                onClick={handleDrillable}
            >
                <BaseHeadlineValueItem {...props} />
            </button>
        ) : (
            <BaseHeadlineValueItem {...props} />
        );
    };

    return wrapDisplayName("withDrillable", BaseHeadlineValueItem)(WithDrillable);
};
