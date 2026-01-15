// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { type IDrillEvent } from "@gooddata/sdk-ui";
import {
    type DashboardKeyDriverCombinationItem,
    getKeyDriverCombinationItemTitle,
} from "@gooddata/sdk-ui-dashboard";
import { type IUiMenuInteractiveItem, UiIcon, UiMenu } from "@gooddata/sdk-ui-kit";

export type DrillSelectDropdownMenuProps = {
    drillState: {
        keyDriverData: DashboardKeyDriverCombinationItem[];
        event: IDrillEvent;
    } | null;
    onClose: () => void;
    onSelect: (item: IUiMenuInteractiveItem<IDrillSelectDropdownMenuItemData>) => void;
};

export interface IDrillSelectDropdownMenuItemData {
    interactive: {
        name: string;
        context?: unknown;
        attributeValue?: string | null;
    };
}

export function DrillSelectDropdownMenu({ drillState, onClose, onSelect }: DrillSelectDropdownMenuProps) {
    const intl = useIntl();

    const menuItems = useMemo(() => {
        const items = drillState?.keyDriverData.map((key, i) => {
            const stringTitle = getKeyDriverCombinationItemTitle(intl, key);
            return {
                stringTitle,
                type: "interactive" as const,
                id: `key-${i}`,
                iconLeft: <UiIcon type="explainai" size={16} color="complementary-5" />,
                data: {
                    name: stringTitle,
                    context: key,
                },
            };
        });

        if (items) {
            return [
                {
                    type: "static" as const,
                    data: (
                        <span className="gd-gen-ai-chat__visualization__drill-header">
                            <FormattedMessage id="gd.gen-ai.drill_modal_picker.header.explain" />
                        </span>
                    ),
                },
                ...items,
            ];
        }
        return [];
    }, [drillState?.keyDriverData, intl]);

    return (
        <UiMenu
            items={menuItems}
            onSelect={onSelect}
            shouldCloseOnSelect
            onClose={onClose}
            size="small"
            ariaAttributes={{
                id: "drill-select-menu",
                "aria-label": intl.formatMessage({ id: "gd.gen-ai.drill_modal_picker.label" }),
            }}
        />
    );
}
