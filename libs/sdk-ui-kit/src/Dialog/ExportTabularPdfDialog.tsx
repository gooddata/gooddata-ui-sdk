// (C) 2025 GoodData Corporation

import { memo, useCallback, useMemo } from "react";

import { FormattedMessage, type IntlShape, useIntl } from "react-intl";

import { usePropState } from "@gooddata/sdk-ui";

import { ConfirmDialogBase } from "./ConfirmDialogBase.js";
import { type IExportTabularPdfDialogProps, type PageOrientation, type PageSize } from "./typings.js";
import { type IUiMenuInteractiveItem } from "../@ui/UiMenu/types.js";
import { UiMenu } from "../@ui/UiMenu/UiMenu.js";
import { Dropdown } from "../Dropdown/Dropdown.js";
import { DropdownButton } from "../Dropdown/DropdownButton.js";
import { Checkbox } from "../Form/Checkbox.js";
import { Overlay } from "../Overlay/Overlay.js";
import { useIdPrefixed } from "../utils/useId.js";

const alignPoints = [{ align: "cc cc" as const }];

const getPageSizeMenuItems = (intl: IntlShape): IUiMenuInteractiveItem<{ interactive: PageSize }>[] => [
    {
        type: "interactive",
        id: "A3",
        stringTitle: intl.formatMessage({ id: "dialogs.export.pdf.pageSize.option.a3" }),
        data: "A3",
    },
    {
        type: "interactive",
        id: "A4",
        stringTitle: intl.formatMessage({ id: "dialogs.export.pdf.pageSize.option.a4" }),
        data: "A4",
    },
    {
        type: "interactive",
        id: "Letter",
        stringTitle: intl.formatMessage({ id: "dialogs.export.pdf.pageSize.option.letter" }),
        data: "LETTER",
    },
];

const getOrientationMenuItems = (
    intl: IntlShape,
): IUiMenuInteractiveItem<{ interactive: PageOrientation }>[] => [
    {
        type: "interactive",
        id: "Portrait",
        stringTitle: intl.formatMessage({ id: "dialogs.export.pdf.pageOrientation.option.portrait" }),
        data: "PORTRAIT",
    },
    {
        type: "interactive",
        id: "Landscape",
        stringTitle: intl.formatMessage({ id: "dialogs.export.pdf.pageOrientation.option.landscape" }),
        data: "LANDSCAPE",
    },
];

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

    const pageSizeMenuItems = useMemo(() => getPageSizeMenuItems(intl), [intl]);

    const orientationMenuItems = useMemo(() => getOrientationMenuItems(intl), [intl]);

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
                autofocusOnOpen
                accessibilityConfig={{
                    dialogId,
                }}
            >
                <div className="gd-pdf-export-dialog-item">
                    <h4 id="page-size-label">
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
                                accessibilityConfig={{
                                    ariaLabelledBy: "page-size-label",
                                    ariaHaspopup: "true",
                                    ariaExpanded: isOpen,
                                    ...(isOpen ? { ariaControls: "page-size-menu" } : {}),
                                }}
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
                                }}
                                onClose={closeDropdown}
                                shouldCloseOnSelect
                                ariaAttributes={{
                                    "aria-label": "Page size options",
                                    id: "page-size-menu",
                                }}
                                maxWidth={150}
                            />
                        )}
                        autofocusOnOpen
                    />
                </div>

                <div className="gd-pdf-export-dialog-item">
                    <h4 id="orientation-label">
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
                                accessibilityConfig={{
                                    ariaLabelledBy: "orientation-label",
                                    ariaHaspopup: "true",
                                    ariaExpanded: isOpen,
                                    ...(isOpen ? { ariaControls: "orientation-menu" } : {}),
                                }}
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
                                }}
                                onClose={closeDropdown}
                                shouldCloseOnSelect
                                ariaAttributes={{
                                    "aria-label": "Orientation options",
                                    id: "orientation-menu",
                                }}
                                maxWidth={150}
                            />
                        )}
                        autofocusOnOpen
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
