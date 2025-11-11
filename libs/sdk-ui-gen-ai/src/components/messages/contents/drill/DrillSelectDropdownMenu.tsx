// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { IDrillEvent } from "@gooddata/sdk-ui";
import {
    DashboardKeyDriverCombinationItem,
    getKeyDriverCombinationItemTitle,
} from "@gooddata/sdk-ui-dashboard";
import { IUiMenuInteractiveItem, UiIcon, UiMenu } from "@gooddata/sdk-ui-kit";

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
                type: "interactive",
                id: `key-${i}`,
                iconLeft: <UiIcon type="explainai" size={16} color="complementary-5" ariaHidden />,
                data: {
                    name: stringTitle,
                    context: key,
                },
            } as IUiMenuInteractiveItem<IDrillSelectDropdownMenuItemData>;
        });

        return items ?? [];
    }, [drillState?.keyDriverData, intl]);

    return (
        <UiMenu
            items={menuItems}
            onSelect={onSelect}
            shouldCloseOnSelect
            onClose={onClose}
            ariaAttributes={{
                id: "drill-select-menu",
                "aria-label": intl.formatMessage({ id: "gd.gen-ai.drill_modal_picker.label" }),
            }}
        />
    );
}
