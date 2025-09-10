// (C) 2025 GoodData Corporation

import React, { memo } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { type IconType, UiButtonSegmentedControl, UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { OBJECT_TYPE_ORDER, ObjectTypes } from "./constants.js";
import type { ObjectType } from "./types.js";
import { testIds } from "../automation/index.js";

const icons: Record<ObjectType, IconType> = {
    [ObjectTypes.DASHBOARD]: "dashboard",
    [ObjectTypes.VISUALIZATION]: "visualization",
    [ObjectTypes.METRIC]: "metric",
    [ObjectTypes.ATTRIBUTE]: "ldmAttribute",
    [ObjectTypes.FACT]: "fact",
};

const messages: Record<ObjectType, MessageDescriptor> = defineMessages({
    [ObjectTypes.DASHBOARD]: { id: "analyticsCatalog.objectType.dashboard.button.ariaLabel" },
    [ObjectTypes.VISUALIZATION]: { id: "analyticsCatalog.objectType.visualization.button.ariaLabel" },
    [ObjectTypes.METRIC]: { id: "analyticsCatalog.objectType.metric.button.ariaLabel" },
    [ObjectTypes.FACT]: { id: "analyticsCatalog.objectType.fact.button.ariaLabel" },
    [ObjectTypes.ATTRIBUTE]: { id: "analyticsCatalog.objectType.attribute.button.ariaLabel" },
});

type Props = {
    counter: Record<ObjectType, number>;
    selectedTypes: ObjectType[];
    onSelect: (selectedTypes: ObjectType[]) => void;
};

export function ObjectTypeSelect(props: Props) {
    const { selectedTypes, onSelect, counter } = props;
    const intl = useIntl();

    const handleSelect = (type: ObjectType) => {
        if (selectedTypes.includes(type)) {
            onSelect(selectedTypes.filter((selectedType) => selectedType !== type));
        } else {
            onSelect([...selectedTypes, type]);
        }
    };

    return (
        <UiButtonSegmentedControl>
            {OBJECT_TYPE_ORDER.map((type) => {
                const isSelected = selectedTypes.includes(type);
                const ariaLabel = intl.formatMessage(messages[type], { count: counter[type] });
                return (
                    <div key={type} data-testid={testIds.objectType} data-object-type={type}>
                        <UiTooltip
                            triggerBy={["hover", "focus"]}
                            anchor={
                                <UiIconButton
                                    size="small"
                                    variant="secondary"
                                    icon={icons[type]}
                                    isActive={isSelected}
                                    accessibilityConfig={{ ariaLabel }}
                                    onClick={() => handleSelect(type)}
                                    // Since object types are stable, dynamic testing ID is acceptable.
                                    dataTestId={`${testIds.objectType}/${type}`}
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
