// (C) 2025-2026 GoodData Corporation

import { memo } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { type IconType, UiButtonSegmentedControl, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { objectType } from "../automation/testIds.js";

import { FILTER_GROUPS, type FilterableObjectType, ObjectTypes } from "./constants.js";
import type { ObjectType } from "./types.js";

const icons: Record<FilterableObjectType, IconType> = {
    [ObjectTypes.DASHBOARD]: "dashboard",
    [ObjectTypes.VISUALIZATION]: "visualization",
    [ObjectTypes.METRIC]: "metric",
    [ObjectTypes.ATTRIBUTE]: "ldmAttribute",
    [ObjectTypes.FACT]: "fact",
    [ObjectTypes.DATASET]: "date",
    [ObjectTypes.PARAMETER]: "parameter",
};

const messages: Record<FilterableObjectType, MessageDescriptor> = defineMessages({
    [ObjectTypes.DASHBOARD]: { id: "analyticsCatalog.objectType.dashboard.button.ariaLabel" },
    [ObjectTypes.VISUALIZATION]: { id: "analyticsCatalog.objectType.visualization.button.ariaLabel" },
    [ObjectTypes.METRIC]: { id: "analyticsCatalog.objectType.metric.button.ariaLabel" },
    [ObjectTypes.PARAMETER]: { id: "analyticsCatalog.objectType.parameter.button.ariaLabel" },
    [ObjectTypes.FACT]: { id: "analyticsCatalog.objectType.fact.button.ariaLabel" },
    [ObjectTypes.ATTRIBUTE]: { id: "analyticsCatalog.objectType.attribute.button.ariaLabel" },
    [ObjectTypes.DATASET]: { id: "analyticsCatalog.objectType.dateDataset.button.ariaLabel" },
});

type Props = {
    counter: Record<ObjectType, number>;
    selectedTypes: ObjectType[];
    enabledObjectTypes: readonly ObjectType[];
    onSelect: (selectedTypes: ObjectType[]) => void;
    ariaLabelledBy?: string;
};

export function ObjectTypeSelect({
    selectedTypes,
    enabledObjectTypes,
    onSelect,
    counter,
    ariaLabelledBy,
}: Props) {
    const intl = useIntl();
    const visibleGroups = FILTER_GROUPS.filter(({ types }) =>
        types.some((type) => enabledObjectTypes.includes(type)),
    );

    const handleSelect = (types: readonly ObjectType[]) => {
        if (types.every((type) => selectedTypes.includes(type))) {
            onSelect(selectedTypes.filter((selectedType) => !types.includes(selectedType)));
        } else {
            onSelect([...new Set([...selectedTypes, ...types])]);
        }
    };

    return (
        <UiButtonSegmentedControl role="group" aria-labelledby={ariaLabelledBy}>
            {visibleGroups.map(({ id, types }) => {
                const isSelected = types.every((type) => selectedTypes.includes(type));
                const count = types.reduce((sum, type) => sum + counter[type], 0);
                const ariaLabel = intl.formatMessage(messages[id], { count });
                return (
                    <div
                        key={id}
                        className="gd-analytics-catalog__object-type"
                        data-testid={objectType}
                        data-object-type={id}
                    >
                        <UiTooltip
                            triggerBy={["hover", "focus"]}
                            anchor={
                                <UiIconButton
                                    size="small"
                                    variant="secondary"
                                    icon={icons[id]}
                                    isActive={isSelected}
                                    accessibilityConfig={{ ariaLabel, ariaPressed: isSelected }}
                                    onClick={() => handleSelect(types)}
                                    // Since object types are stable, dynamic testing ID is acceptable.
                                    dataTestId={`${objectType}/${id}`}
                                />
                            }
                            content={ariaLabel}
                        />
                    </div>
                );
            })}
        </UiButtonSegmentedControl>
    );
}

export const ObjectTypeSelectMemo = memo(ObjectTypeSelect);
