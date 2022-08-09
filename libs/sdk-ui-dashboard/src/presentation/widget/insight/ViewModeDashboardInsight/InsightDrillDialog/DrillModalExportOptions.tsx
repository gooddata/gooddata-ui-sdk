// (C) 2021 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Overlay, ItemsWrapper, Item, IAlignPoint } from "@gooddata/sdk-ui-kit";

export interface IDrillModalExportOptionsProps {
    showDropdown: boolean;
    toggleShowDropdown(): void;
    exportXLSXEnabled: boolean;
    onExportXLSX: () => void;
    exportCSVEnabled: boolean;
    onExportCSV: () => void;
}

const overlayAlignPoints: IAlignPoint[] = [
    {
        align: "tc bc",
        offset: {
            x: -10,
            y: -5,
        },
    },
];

const DrillModalExportOptions: React.FC<IDrillModalExportOptionsProps> = ({
    showDropdown,
    toggleShowDropdown,
    exportXLSXEnabled,
    onExportXLSX,
    exportCSVEnabled,
    onExportCSV,
}) =>
    showDropdown ? (
        <Overlay
            key="DrillModalOptionsMenu"
            alignTo=".export-drilled-insight"
            alignPoints={overlayAlignPoints}
            className="gd-header-menu-overlay s-drill-modal-export-options"
            closeOnOutsideClick={true}
            onClose={toggleShowDropdown}
        >
            <ItemsWrapper smallItemsSpacing={true}>
                {exportXLSXEnabled && (
                    <Item
                        onClick={onExportXLSX}
                        className="options-menu-export-xlsx s-export-drilled-insight-xlsx"
                    >
                        <FormattedMessage id="widget.options.menu.exportToXLSX" />
                    </Item>
                )}
                {exportCSVEnabled && (
                    <Item
                        onClick={onExportCSV}
                        className="options-menu-export-csv s-export-drilled-insight-csv"
                    >
                        <FormattedMessage id="widget.options.menu.exportToCSV" />
                    </Item>
                )}
            </ItemsWrapper>
        </Overlay>
    ) : null;

export default DrillModalExportOptions;
