// (C) 2025 GoodData Corporation

import { memo, useCallback } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { usePropState } from "@gooddata/sdk-ui";

import { ConfirmDialogBase } from "./ConfirmDialogBase.js";
import { IExportTabularPdfDialogProps, PageOrientation, PageSize } from "./typings.js";
import { IUiMenuInteractiveItem } from "../@ui/UiMenu/types.js";
import { UiMenu } from "../@ui/UiMenu/UiMenu.js";
import { Dropdown, DropdownButton } from "../Dropdown/index.js";
import { Checkbox } from "../Form/index.js";
import { Overlay } from "../Overlay/Overlay.js";
import { useIdPrefixed } from "../utils/useId.js";

const pageSizeMenuItems: IUiMenuInteractiveItem<{ interactive: PageSize }>[] = [
    { type: "interactive", id: "A3", stringTitle: "A3", data: "A3" },
    { type: "interactive", id: "A4", stringTitle: "A4", data: "A4" },
    { type: "interactive", id: "Letter", stringTitle: "Letter", data: "LETTER" },
];

const orientationMenuItems: IUiMenuInteractiveItem<{ interactive: PageOrientation }>[] = [
    { type: "interactive", id: "Portrait", stringTitle: "Portrait", data: "PORTRAIT" },
    { type: "interactive", id: "Landscape", stringTitle: "Landscape", data: "LANDSCAPE" },
];

const alignPoints = [{ align: "cc cc" as const }];

/**
 * @internal
 */
export const ExportTabularPdfDialog = memo<IExportTabularPdfDialogProps>(function ExportTabularPdfDialog({
    displayCloseButton = true,
    isPositive = true,
    isSubmitDisabled = false,
    cancelButtonText = "Cancel",
    submitButtonText = "Export",
    onCancel = () => {},
    onSubmit = () => {},
    pageSize = "A4",
    pageOrientation = "PORTRAIT",
    showInfoPage = true,
    isShowInfoPageVisible = true,
}) {
    const intl = useIntl();
    const [selectedSize, setSelectedSize] = usePropState(pageSize);
    const [selectedOrientation, setSelectedOrientation] = usePropState(pageOrientation);
    const [shouldShowInfoPage, setShouldShowInfoPage] = usePropState(showInfoPage);

    const dialogId = useIdPrefixed("pdfExportDialog");
    const showInfoPageId = useIdPrefixed("showInfoPage");

    const handleSubmit = useCallback(() => {
        onSubmit?.({
            pageSize: selectedSize,
            pageOrientation: selectedOrientation,
            showInfoPage: shouldShowInfoPage,
        });
    }, [selectedSize, selectedOrientation, shouldShowInfoPage, onSubmit]);

    const handlePageSizeChange = useCallback(
        (value: PageSize) => {
            setSelectedSize(value);
        },
        [setSelectedSize],
    );

    const handleOrientationChange = useCallback(
        (value: PageOrientation) => {
            setSelectedOrientation(value);
        },
        [setSelectedOrientation],
    );

    return (
        <Overlay alignPoints={alignPoints} isModal positionType="fixed">
            <ConfirmDialogBase
                className="gd-pdf-export-dialog"
                displayCloseButton={displayCloseButton}
                isPositive={isPositive}
                isSubmitDisabled={isSubmitDisabled}
                headline={intl.formatMessage({ id: "dialogs.export.pdf.headline" })}
                cancelButtonText={cancelButtonText || intl.formatMessage({ id: "cancel" })}
                submitButtonText={submitButtonText || intl.formatMessage({ id: "dialogs.export.submit" })}
                onCancel={onCancel}
                onSubmit={handleSubmit}
                autofocusOnOpen={true}
                accessibilityConfig={{
                    dialogId,
                }}
            >
                <div className="gd-pdf-export-dialog-item">
                    <h4>
                        <FormattedMessage id="dialogs.export.pdf.pageSize" />
                    </h4>
                    <Dropdown
                        fullscreenOnMobile={false}
                        renderButton={({ isOpen, toggleDropdown }) => (
                            <DropdownButton
                                value={
                                    pageSizeMenuItems.find((item) => item.data === selectedSize)?.stringTitle
                                }
                                isOpen={isOpen}
                                onClick={toggleDropdown}
                                isFullWidth
                            />
                        )}
                        renderBody={({ closeDropdown }) => (
                            <UiMenu
                                items={pageSizeMenuItems.map((item) => ({
                                    ...item,
                                    isSelected: selectedSize === item.data,
                                }))}
                                onSelect={(item) => {
                                    handlePageSizeChange(item.data);
                                    closeDropdown();
                                }}
                                ariaAttributes={{
                                    "aria-label": "Page size options",
                                    id: "page-size-menu",
                                }}
                                maxWidth={150}
                            />
                        )}
                    />
                </div>

                <div className="gd-pdf-export-dialog-item">
                    <h4>
                        <FormattedMessage id="dialogs.export.pdf.pageOrientation" />
                    </h4>
                    <Dropdown
                        fullscreenOnMobile={false}
                        renderButton={({ isOpen, toggleDropdown }) => (
                            <DropdownButton
                                value={
                                    orientationMenuItems.find((item) => item.data === selectedOrientation)
                                        ?.stringTitle
                                }
                                isOpen={isOpen}
                                onClick={toggleDropdown}
                                isFullWidth
                            />
                        )}
                        renderBody={({ closeDropdown }) => (
                            <UiMenu
                                items={orientationMenuItems.map((item) => ({
                                    ...item,
                                    isSelected: selectedOrientation === item.data,
                                }))}
                                onSelect={(item) => {
                                    handleOrientationChange(item.data);
                                    closeDropdown();
                                }}
                                ariaAttributes={{
                                    "aria-label": "Orientation options",
                                    id: "orientation-menu",
                                }}
                                maxWidth={150}
                            />
                        )}
                    />
                </div>

                {isShowInfoPageVisible === true && (
                    <div className="gd-pdf-export-dialog-item">
                        <Checkbox
                            id={showInfoPageId}
                            name="gs.dialog.pdfExport.checkbox.includePageExportInfo"
                            text={intl.formatMessage({ id: "dialogs.export.pdf.includePageExportInfo" })}
                            value={shouldShowInfoPage}
                            onChange={setShouldShowInfoPage}
                            labelSize="normal"
                        />
                    </div>
                )}
            </ConfirmDialogBase>
        </Overlay>
    );
});
