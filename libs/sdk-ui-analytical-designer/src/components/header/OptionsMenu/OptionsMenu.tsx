// (C) 2007-2026 GoodData Corporation

import { Header, ItemsWrapper, Overlay, Separator } from "@gooddata/sdk-ui-kit";

import {
    type AnalyticalDesignerOptionsItem,
    type IAnalyticalDesignerOptionsAction,
} from "../../../embedding/editorHeaderSlotTypes.js";

import { OptionsMenuItem } from "./OptionsMenuItem.js";
import { OPTIONS_ITEM_IDS, normalizeOptionsItems } from "./useOptionsProps.js";

const MENU_ALIGN_POINTS = [{ align: "br tr" }];

// The class names and bubble ids of the built-in actions, which tests and styles select them by.
const BUILT_IN_ACTIONS: Record<string, { className: string; bubbleId: string }> = {
    [OPTIONS_ITEM_IDS.openInAnalyticalDesigner]: {
        className: "gd-open-in-analytical-designer s-open-in-analytical-designer",
        bubbleId: "options.menu.open.in.analytical.designer",
    },
    [OPTIONS_ITEM_IDS.exportXlsx]: {
        className: "gd-export-menu-export-xlsx s-gd-export-menu-export-xlsx gd-export-options-xlsx",
        bubbleId: "ExportXLSXBubble",
    },
    [OPTIONS_ITEM_IDS.exportPdf]: {
        className: "gd-export-menu-export-pdf s-gd-export-menu-export-pdf gd-export-options-pdf",
        bubbleId: "ExportPDFBubble",
    },
    [OPTIONS_ITEM_IDS.exportCsv]: {
        className: "gd-export-menu-export-csv s-gd-export-menu-export-csv gd-export-options-csv-formatted",
        bubbleId: "ExportCSVBubble",
    },
    [OPTIONS_ITEM_IDS.exportCsvRaw]: {
        className: "gd-export-menu-export-csv s-gd-export-menu-export-csv gd-export-options-csv-raw",
        bubbleId: "ExportCSVRawBubble",
    },
    [OPTIONS_ITEM_IDS.changeTimezone]: {
        className: "gd-options-menu-timezone s-options-menu-timezone",
        bubbleId: "options.menu.changeTimezone",
    },
};

function getActionClasses(action: IAnalyticalDesignerOptionsAction) {
    const simplifiedId = action.id.replace(/[^a-zA-Z0-9-]/g, "-");
    return (
        BUILT_IN_ACTIONS[action.id] ?? {
            className: `s-options-menu-item-${simplifiedId}`,
            bubbleId: `options-menu-item-${simplifiedId}`,
        }
    );
}

interface IOptionsMenuProps {
    items: readonly AnalyticalDesignerOptionsItem[];
    onClose: () => void;
}

/**
 * The options menu overlay. Selecting an action closes the menu and starts the action.
 */
export function OptionsMenu({ items, onClose }: IOptionsMenuProps) {
    return (
        <Overlay
            key="OptionsMenu"
            alignTo=".s-options-button"
            alignPoints={MENU_ALIGN_POINTS}
            className="gd-export-menu-overlay s-gd-export-menu-overlay"
            closeOnMouseDrag
            closeOnOutsideClick
            onClose={onClose}
        >
            <ItemsWrapper smallItemsSpacing>
                {normalizeOptionsItems(items).map((item) => {
                    switch (item.type) {
                        case "section":
                            return <Header key={item.id}>{item.label}</Header>;
                        case "separator":
                            return <Separator key={item.id} />;
                        default: {
                            const { className, bubbleId } = getActionClasses(item);
                            return (
                                <OptionsMenuItem
                                    key={item.id}
                                    bubbleId={bubbleId}
                                    className={className}
                                    label={item.label}
                                    isDisabled={item.isDisabled}
                                    disabledTooltip={item.disabledTooltip}
                                    onClick={() => {
                                        onClose();
                                        item.onSelect();
                                    }}
                                />
                            );
                        }
                    }
                })}
            </ItemsWrapper>
        </Overlay>
    );
}
