// (C) 2025-2026 GoodData Corporation

import { type Ref, useId, useMemo, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import {
    DEFAULT_CSV_DELIMITER,
    type IExportDefinitionVisualizationObjectSettings,
    getCsvDelimiterState,
    getCsvDelimiterValidationError,
    getCsvDelimiterValue,
} from "@gooddata/sdk-model";
import {
    Button,
    ContentDivider,
    CsvDelimiterPicker,
    Dropdown,
    DropdownButton,
    type IAlignPoint,
    type IUiMenuInteractiveItem,
    UiIcon,
    UiMenu,
    isEscapeKey,
} from "@gooddata/sdk-ui-kit";

const DROPDOWN_ALIGN_POINTS: IAlignPoint[] = [
    {
        align: "bc tc",
        offset: { x: 0, y: 0 },
    },
    {
        align: "tc bc",
        offset: { x: 0, y: 0 },
    },
];

const OVERLAY_POSITION_TYPE = "sameAsTarget";
const CLOSE_ON_PARENT_SCROLL = true;

const DEFAULT_PDF_PAGE_SIZE: PdfPageSize = "A4";
const DEFAULT_PDF_PAGE_ORIENTATION: PdfPageOrientation = "PORTRAIT";
const DEFAULT_PDF_ORIENTATION: PdfOrientation = "portrait";

type PdfPageSize = NonNullable<IExportDefinitionVisualizationObjectSettings["pageSize"]>;
type PdfPageOrientation = "PORTRAIT" | "LANDSCAPE";
type PdfOrientation = NonNullable<IExportDefinitionVisualizationObjectSettings["orientation"]>;

type IAttachmentSettingsType = "XLSX" | "PDF_TABULAR" | "CSV" | "CSV_RAW";

export interface IAttachmentSettingsProps {
    type: IAttachmentSettingsType;
    settings: IExportDefinitionVisualizationObjectSettings;
    onSettingsChange: (settings: IExportDefinitionVisualizationObjectSettings) => void;
    defaultPdfPageSize?: PdfPageSize;
}

type PageSizeMenuData = { interactive: PdfPageSize };
type OrientationMenuData = { interactive: PdfPageOrientation };

const mapLegacyOrientationToPageOrientation = (
    orientation?: PdfOrientation,
): PdfPageOrientation | undefined => {
    if (orientation === "portrait") {
        return "PORTRAIT";
    }
    if (orientation === "landscape") {
        return "LANDSCAPE";
    }
    return undefined;
};

const mapPageOrientationToLegacyOrientation = (
    orientation?: PdfPageOrientation,
): PdfOrientation | undefined => {
    if (orientation === "LANDSCAPE") {
        return "landscape";
    }
    if (orientation === "PORTRAIT") {
        return "portrait";
    }
    return undefined;
};

export function AttachmentSettings({
    type,
    settings,
    onSettingsChange,
    defaultPdfPageSize,
}: IAttachmentSettingsProps) {
    const intl = useIntl();
    const isPdfTabular = type === "PDF_TABULAR";
    const isCsv = type === "CSV" || type === "CSV_RAW";
    const legacyOrientation = settings.orientation;
    const legacyPageOrientation = mapLegacyOrientationToPageOrientation(legacyOrientation);
    const resolvedDefaultPageSize = settings.pageSize ?? defaultPdfPageSize ?? DEFAULT_PDF_PAGE_SIZE;
    const resolvedCsvDelimiter = settings.delimiter ?? DEFAULT_CSV_DELIMITER;
    const resolvedCsvState = getCsvDelimiterState(settings.delimiter);
    const [mergeHeaders, setMergeHeaders] = useState(settings.mergeHeaders ?? true);
    const [exportInfo, setExportInfo] = useState(settings.exportInfo ?? true);
    const [pageSize, setPageSize] = useState(resolvedDefaultPageSize);
    const [pageOrientation, setPageOrientation] = useState(
        legacyPageOrientation ?? DEFAULT_PDF_PAGE_ORIENTATION,
    );
    const [csvDelimiterValue, setCsvDelimiterValue] = useState(resolvedCsvState);
    const pageSizeMenuId = useId();
    const orientationMenuId = useId();

    const settingsLabel = isPdfTabular
        ? intl.formatMessage({ id: "dialogs.export.pdf.headline" })
        : isCsv
          ? intl.formatMessage({
                id: "dialogs.schedule.management.attachments.csv.settings",
                defaultMessage: "CSV options",
            })
          : intl.formatMessage({ id: "dialogs.schedule.management.attachments.xlsx.settings" });

    const pageSizeMenuItems = useMemo<IUiMenuInteractiveItem<PageSizeMenuData>[]>(
        () => [
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
        ],
        [intl],
    );

    const orientationMenuItems = useMemo<IUiMenuInteractiveItem<OrientationMenuData>[]>(
        () => [
            {
                type: "interactive",
                id: "Portrait",
                stringTitle: intl.formatMessage({ id: "dialogs.export.pdf.pageOrientation.option.portrait" }),
                data: "PORTRAIT",
            },
            {
                type: "interactive",
                id: "Landscape",
                stringTitle: intl.formatMessage({
                    id: "dialogs.export.pdf.pageOrientation.option.landscape",
                }),
                data: "LANDSCAPE",
            },
        ],
        [intl],
    );

    const resetSettings = () => {
        const nextCsvState = getCsvDelimiterState(settings.delimiter);
        setMergeHeaders(settings.mergeHeaders ?? true);
        setExportInfo(settings.exportInfo ?? true);
        setPageSize(resolvedDefaultPageSize);
        setPageOrientation(legacyPageOrientation ?? DEFAULT_PDF_PAGE_ORIENTATION);
        setCsvDelimiterValue(nextCsvState);
    };

    const isPdfSettingsDirty =
        pageSize !== resolvedDefaultPageSize ||
        (mapPageOrientationToLegacyOrientation(pageOrientation) ?? DEFAULT_PDF_ORIENTATION) !==
            (legacyOrientation ?? DEFAULT_PDF_ORIENTATION) ||
        exportInfo !== (settings.exportInfo ?? true);
    const isXlsxSettingsDirty =
        mergeHeaders !== (settings.mergeHeaders ?? true) || exportInfo !== (settings.exportInfo ?? true);
    const selectedDelimiter = getCsvDelimiterValue(
        csvDelimiterValue.selectedPreset,
        csvDelimiterValue.customDelimiter,
    );
    const csvValidationError =
        csvDelimiterValue.selectedPreset === "custom"
            ? getCsvDelimiterValidationError(csvDelimiterValue.customDelimiter)
            : undefined;
    const isCsvSettingsDirty = selectedDelimiter !== resolvedCsvDelimiter;
    const isSettingsDirty = isPdfTabular
        ? isPdfSettingsDirty
        : isCsv
          ? isCsvSettingsDirty
          : isXlsxSettingsDirty;
    const isSaveDisabled =
        !isSettingsDirty ||
        (isCsv &&
            (csvDelimiterValue.selectedPreset === "custom"
                ? !csvDelimiterValue.customDelimiter || Boolean(csvValidationError)
                : false));

    return (
        <Dropdown
            closeOnParentScroll={CLOSE_ON_PARENT_SCROLL}
            overlayPositionType={OVERLAY_POSITION_TYPE}
            alignPoints={DROPDOWN_ALIGN_POINTS}
            autofocusOnOpen
            onOpenStateChanged={(isOpen) => {
                if (!isOpen) {
                    resetSettings();
                }
            }}
            renderButton={({ toggleDropdown, buttonRef }) => (
                <button
                    className="gd-attachment-chip-button"
                    onClick={toggleDropdown}
                    ref={buttonRef as Ref<HTMLButtonElement>}
                    aria-label={settingsLabel}
                >
                    <UiIcon type="settings" size={14} color="complementary-8" />
                </button>
            )}
            renderBody={({ closeDropdown }) => (
                <div
                    className={`gd-attachment-settings-dropdown${isCsv ? " gd-attachment-settings-dropdown--csv" : ""}`}
                    onKeyDown={(e) => {
                        if (isEscapeKey(e)) {
                            e.stopPropagation();
                            closeDropdown();
                        }
                    }}
                >
                    <div className="gd-list-title">
                        {settingsLabel}
                        <div className="gd-close-button">
                            <Button
                                className="gd-button-link gd-button-icon-only gd-icon-cross s-dialog-close-button"
                                value=""
                                onClick={closeDropdown}
                                accessibilityConfig={{
                                    ariaLabel: intl.formatMessage({ id: "close" }),
                                }}
                            />
                        </div>
                    </div>
                    <div className="gd-attachment-settings-dropdown-content">
                        {isPdfTabular ? (
                            <>
                                <div className="gd-pdf-export-dialog-item">
                                    <h4>
                                        <FormattedMessage id="dialogs.export.pdf.pageSize" />
                                    </h4>
                                    <Dropdown
                                        fullscreenOnMobile={false}
                                        renderButton={({ isOpen, toggleDropdown }) => (
                                            <DropdownButton
                                                value={
                                                    pageSizeMenuItems.find((item) => item.data === pageSize)
                                                        ?.stringTitle
                                                }
                                                isOpen={isOpen}
                                                onClick={toggleDropdown}
                                                accessibilityConfig={{
                                                    ariaLabel: intl.formatMessage({
                                                        id: "dialogs.export.pdf.pageSize",
                                                    }),
                                                    ariaHaspopup: "true",
                                                    ariaExpanded: isOpen,
                                                    ...(isOpen
                                                        ? {
                                                              ariaControls: `pdf-page-size-menu-${pageSizeMenuId}`,
                                                          }
                                                        : {}),
                                                }}
                                                isFullWidth
                                            />
                                        )}
                                        renderBody={({ closeDropdown: closePageSizeDropdown }) => (
                                            <UiMenu<PageSizeMenuData>
                                                items={pageSizeMenuItems.map((item) => ({
                                                    ...item,
                                                    isSelected: pageSize === item.data,
                                                }))}
                                                onSelect={(item) => {
                                                    setPageSize(item.data);
                                                }}
                                                onClose={closePageSizeDropdown}
                                                shouldCloseOnSelect
                                                ariaAttributes={{
                                                    "aria-label": intl.formatMessage({
                                                        id: "dialogs.export.pdf.pageSize",
                                                    }),
                                                    id: `pdf-page-size-menu-${pageSizeMenuId}`,
                                                }}
                                                maxWidth={150}
                                            />
                                        )}
                                        autofocusOnOpen
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
                                                    orientationMenuItems.find(
                                                        (item) => item.data === pageOrientation,
                                                    )?.stringTitle
                                                }
                                                isOpen={isOpen}
                                                onClick={toggleDropdown}
                                                accessibilityConfig={{
                                                    ariaLabel: intl.formatMessage({
                                                        id: "dialogs.export.pdf.pageOrientation",
                                                    }),
                                                    ariaHaspopup: "true",
                                                    ariaExpanded: isOpen,
                                                    ...(isOpen
                                                        ? {
                                                              ariaControls: `pdf-orientation-menu-${orientationMenuId}`,
                                                          }
                                                        : {}),
                                                }}
                                                isFullWidth
                                            />
                                        )}
                                        renderBody={({ closeDropdown: closeOrientationDropdown }) => (
                                            <UiMenu<OrientationMenuData>
                                                items={orientationMenuItems.map((item) => ({
                                                    ...item,
                                                    isSelected: pageOrientation === item.data,
                                                }))}
                                                onSelect={(item) => {
                                                    setPageOrientation(item.data);
                                                }}
                                                onClose={closeOrientationDropdown}
                                                shouldCloseOnSelect
                                                ariaAttributes={{
                                                    "aria-label": intl.formatMessage({
                                                        id: "dialogs.export.pdf.pageOrientation",
                                                    }),
                                                    id: `pdf-orientation-menu-${orientationMenuId}`,
                                                }}
                                                maxWidth={150}
                                            />
                                        )}
                                        autofocusOnOpen
                                    />
                                </div>
                                <label className="input-checkbox-label">
                                    <input
                                        type="checkbox"
                                        className="input-checkbox"
                                        onChange={() => setExportInfo(!exportInfo)}
                                        checked={exportInfo}
                                    />
                                    <span className="input-label-text">
                                        <FormattedMessage id="dialogs.export.pdf.includePageExportInfo" />
                                    </span>
                                </label>
                            </>
                        ) : isCsv ? (
                            <div className="gd-attachment-settings-dropdown-item">
                                <CsvDelimiterPicker
                                    value={csvDelimiterValue}
                                    onChange={setCsvDelimiterValue}
                                    validationError={csvValidationError}
                                    label={intl.formatMessage({
                                        id: "dialogs.export.csv.delimiter",
                                        defaultMessage: "CSV delimiter",
                                    })}
                                    onEnterKeyPress={
                                        isSaveDisabled
                                            ? undefined
                                            : () => {
                                                  onSettingsChange({
                                                      ...settings,
                                                      delimiter: selectedDelimiter,
                                                  });
                                                  closeDropdown();
                                              }
                                    }
                                />
                            </div>
                        ) : (
                            <>
                                <label className="input-checkbox-label">
                                    <input
                                        type="checkbox"
                                        className="input-checkbox"
                                        onChange={() => setMergeHeaders(!mergeHeaders)}
                                        checked={mergeHeaders}
                                    />
                                    <span className="input-label-text">
                                        <FormattedMessage id="dialogs.schedule.management.attachments.cells.merged" />
                                    </span>
                                </label>
                                <label className="input-checkbox-label">
                                    <input
                                        type="checkbox"
                                        className="input-checkbox"
                                        onChange={() => setExportInfo(!exportInfo)}
                                        checked={exportInfo}
                                    />
                                    <span className="input-label-text">
                                        <FormattedMessage id="dialogs.schedule.management.attachments.exportInfo" />
                                    </span>
                                </label>
                            </>
                        )}
                    </div>
                    <ContentDivider className="gd-divider-without-margin" />
                    <div className="gd-attachment-settings-dropdown-footer">
                        <Button
                            value={intl.formatMessage({ id: "cancel" })}
                            className="gd-button-secondary"
                            onClick={closeDropdown}
                        />
                        <Button
                            value={intl.formatMessage({ id: "save" })}
                            className="gd-button-action"
                            onClick={() => {
                                if (isPdfTabular) {
                                    onSettingsChange({
                                        pageSize,
                                        exportInfo,
                                        orientation:
                                            mapPageOrientationToLegacyOrientation(pageOrientation) ??
                                            DEFAULT_PDF_ORIENTATION,
                                    });
                                } else if (isCsv) {
                                    onSettingsChange({
                                        ...settings,
                                        delimiter: selectedDelimiter,
                                    });
                                } else {
                                    onSettingsChange({
                                        mergeHeaders,
                                        exportInfo,
                                    });
                                }
                                closeDropdown();
                            }}
                            disabled={isSaveDisabled}
                        />
                    </div>
                </div>
            )}
        />
    );
}
