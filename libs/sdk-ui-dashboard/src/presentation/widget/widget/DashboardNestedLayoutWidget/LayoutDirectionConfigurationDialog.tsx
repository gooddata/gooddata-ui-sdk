// (C) 2024-2025 GoodData Corporation

import React, { useMemo, useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
    Typography,
    UiReturnFocusOnUnmount,
    UiListbox,
    IUiListboxInteractiveItem,
    IUiListboxItem,
    IAlignPoint,
    UiIconButton,
    IDropdownBodyRenderProps,
} from "@gooddata/sdk-ui-kit";
import { IDashboardLayoutContainerDirection } from "@gooddata/sdk-model";

import { ConfigurationBubble } from "../../common/configuration/ConfigurationBubble.js";
import { useDashboardUserInteraction } from "../../../../model/index.js";

interface ILayoutDirectionConfigurationDialogProps {
    onDirectionChanged: (direction: IDashboardLayoutContainerDirection) => void;
    onClose: () => void;
    alignTo: HTMLElement | null;
    returnFocusToId?: string;
    currentDirection: IDashboardLayoutContainerDirection;
    isColumnDirectionEnabled?: boolean;
    ariaAttributes: IDropdownBodyRenderProps["ariaAttributes"];
}

const listAriaAttributes = {
    id: "container-directions",
    "aria-labelledby": "container-directions-title",
};

const DROPDOWN_ALIGN_POINTS: IAlignPoint[] = [
    { align: "tr tl", offset: { x: -65, y: 18 } },
    { align: "tl tr", offset: { x: 65, y: 18 } },
];

const NestedLayoutConfigurationDialogHeader: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <div className="configuration-panel-header">
            <Typography
                tagName="h3"
                className="configuration-panel-header-title"
                id="container-directions-title"
            >
                <FormattedMessage id="nestedLayoutToolbar.direction.title" />
            </Typography>
            <UiIconButton
                icon="close"
                variant="tertiary"
                size="small"
                onClick={onClose}
                dataId="s-configuration-panel-header-close-button"
                dataTestId="s-configuration-panel-header-close-button"
            />
        </div>
    );
};

export const LayoutDirectionConfigurationDialog: React.FC<ILayoutDirectionConfigurationDialogProps> = ({
    onDirectionChanged,
    onClose,
    alignTo,
    returnFocusToId,
    currentDirection,
    isColumnDirectionEnabled = true,
    ariaAttributes,
}) => {
    const intl = useIntl();
    const userInteraction = useDashboardUserInteraction();

    const onSelect = useCallback(
        (item: IUiListboxInteractiveItem<IDashboardLayoutContainerDirection>) => {
            const direction = item.data;
            if (direction !== currentDirection) {
                onDirectionChanged(direction);
                userInteraction.nestedLayoutInteraction(
                    direction === "row" ? "nestedLayoutDirectionRow" : "nestedLayoutDirectionColumn",
                );
            }
            onClose();
        },
        [onDirectionChanged, onClose, currentDirection, userInteraction],
    );

    const items = useMemo<IUiListboxItem<IDashboardLayoutContainerDirection, never>[]>(
        () => [
            {
                id: "column",
                type: "interactive",
                icon: "directionColumn",
                stringTitle: intl.formatMessage({ id: "nestedLayoutToolbar.direction.column" }),
                data: "column",
                isDisabled: !isColumnDirectionEnabled,
                tooltip: isColumnDirectionEnabled
                    ? undefined
                    : intl.formatMessage({
                          id: "nestedLayoutToolbar.direction.column.disabledTooltip",
                      }),
            },
            {
                id: "row",
                type: "interactive",
                icon: "directionRow",
                stringTitle: intl.formatMessage({ id: "nestedLayoutToolbar.direction.row" }),
                data: "row",
            },
        ],
        [intl, isColumnDirectionEnabled],
    );

    return (
        <UiReturnFocusOnUnmount returnFocusTo={returnFocusToId}>
            <ConfigurationBubble
                id={ariaAttributes.id}
                classNames="gd-nested-layout-configuration__panel"
                onClose={onClose}
                closeOnEscape
                alignTo={alignTo}
                alignPoints={DROPDOWN_ALIGN_POINTS}
            >
                <NestedLayoutConfigurationDialogHeader onClose={onClose} />
                <div className="gd-nested-layout-configuration__content">
                    <UiListbox<IDashboardLayoutContainerDirection, never>
                        selectedItemId={currentDirection}
                        onSelect={onSelect}
                        items={items}
                        ariaAttributes={listAriaAttributes}
                        isCompact={true}
                    />
                </div>
            </ConfigurationBubble>
        </UiReturnFocusOnUnmount>
    );
};
