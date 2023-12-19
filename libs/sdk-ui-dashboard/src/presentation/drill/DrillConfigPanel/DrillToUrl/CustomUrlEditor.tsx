// (C) 2020-2022 GoodData Corporation
import React, { useState, useMemo, useCallback } from "react";
import { IntlShape, FormattedMessage, useIntl } from "react-intl";
import {
    SyntaxHighlightingInput,
    ConfirmDialogBase,
    useMediaQuery,
    FullScreenOverlay,
    Overlay,
    OverlayControllerProvider,
    OverlayController,
} from "@gooddata/sdk-ui-kit";
import { ParametersPanel } from "./CustomUrlEditorParameters.js";
import { isDrillToCustomUrlConfig, UrlDrillTarget } from "../../types.js";
import { IAttributeWithDisplayForm } from "./types.js";
import {
    selectAllCatalogDisplayFormsMap,
    selectIsWhiteLabeled,
    selectWidgetByRef,
    useDashboardSelector,
    selectFilterContextAttributeFilters,
} from "../../../../model/index.js";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../constants/index.js";
import {
    IAttributeFilter,
    ObjRef,
    filterObjRef,
    idRef,
    isAttributeFilter,
    isNegativeAttributeFilter,
    isUriRef,
    serializeObjRef,
} from "@gooddata/sdk-model";
import { useWidgetFilters } from "../../../widget/common/useWidgetFilters.js";
import compact from "lodash/compact.js";
import uniqBy from "lodash/uniqBy.js";
import { dashboardAttributeFilterToAttributeFilter } from "../../../../converters/index.js";

export interface IUrlInputProps {
    currentUrlValue: string;
    onChange: (value: string) => void;
    onCursor: (from: number, to: number) => void;
    syntaxHighlightingRules?: IFormattingRules;
    intl: IntlShape;
}

export const UrlInput: React.FC<IUrlInputProps> = (props) => {
    const { onChange, onCursor, currentUrlValue, intl, syntaxHighlightingRules } = props;
    const placeholder = intl.formatMessage({
        id: "configurationPanel.drillIntoUrl.editor.textAreaPlaceholder",
    });

    return syntaxHighlightingRules ? (
        <SyntaxHighlightingInput
            onChange={onChange}
            onCursor={onCursor}
            value={currentUrlValue}
            customOptions={{ placeholder }}
            className={"gd-input-syntax-highlighting-input"}
            formatting={syntaxHighlightingRules}
        />
    ) : null;
};
const HelpLink: React.FC<{ link: string }> = ({ link }) => {
    return (
        <a
            className="gd-button-link gd-drill-to-custom-url-help"
            target="_blank"
            href={link}
            rel="noopener noreferrer"
        >
            <span className="gd-icon-circle-question" />
            <span className="gd-button-link-text">
                <FormattedMessage id="configurationPanel.drillIntoUrl.editor.helpButtonLabel" />
            </span>
        </a>
    );
};

interface IUrlInputPanelProps {
    currentUrlValue: string;
    onChange: (value: string) => void;
    onCursor: (from: number, to: number) => void;
    attributeDisplayForms?: IAttributeWithDisplayForm[];
    insightFilters?: IAttributeFilter[];
    dashboardFilters?: IAttributeFilter[];
    documentationLink?: string;
    intl: IntlShape;
}

const buildValidDisplayFormsFormattingRule = (attributeDisplayForms: IAttributeWithDisplayForm[]) => {
    if (attributeDisplayForms.length === 0) {
        return undefined;
    }
    const validAttributePlaceholders = attributeDisplayForms
        .map(({ displayForm }) => `{attribute_title\\(${displayForm.id}\\)}`)
        .join("|");
    return { regex: new RegExp(validAttributePlaceholders), token: "attribute" };
};

const buildValidInsightFiltersFormattingRule = (attributeFilters: IAttributeFilter[]) => {
    if (attributeFilters.length === 0) {
        return undefined;
    }

    const validInsightAttributeFilterPlaceholders = attributeFilters
        .map((filter) => {
            const ref = filterObjRef(filter);
            const id = isUriRef(ref) ? ref.uri : ref.identifier;
            return `{attribute_filter_selection\\(${id}\\)}`;
        })
        .join("|");
    return { regex: new RegExp(validInsightAttributeFilterPlaceholders), token: "filter" };
};

const buildValidDashboardFiltersFormattingRule = (attributeFilters: IAttributeFilter[]) => {
    if (attributeFilters.length === 0) {
        return undefined;
    }

    const validDashboardAttributeFilterPlaceholders = attributeFilters
        .map((filter) => {
            const ref = filterObjRef(filter);
            const id = isUriRef(ref) ? ref.uri : ref.identifier;
            return `{dash_attribute_filter_selection\\(${id}\\)}`;
        })
        .join("|");
    return { regex: new RegExp(validDashboardAttributeFilterPlaceholders), token: "filter" };
};

interface IFormattingRule {
    regex: RegExp;
    token: string;
}

interface IFormattingRules {
    start: IFormattingRule[];
}

const IDENTIFIER_RULE: IFormattingRule = {
    regex: /\{workspace_id\}|\{project_id\}|\{insight_id\}|\{widget_id\}|\{dashboard_id\}|\{client_id\}|\{data_product_id\}/,
    token: "identifier",
};
const INVALID_IDENTIFIER_RULE: IFormattingRule = { regex: /\{[^}{]*\}/, token: "invalid-identifier" };
const INVALID_DISPLAY_FORMS_RULE: IFormattingRule = {
    regex: /\{attribute_title\(.*?\)\}/,
    token: "invalid-attribute",
};
const INVALID_DASHBOARD_ATTRIBUTE_FILTER_RULE: IFormattingRule = {
    regex: /\{dash_attribute_filter_selection\(.*?\)\}/,
    token: "invalid-filter",
};
const INVALID_INSIGHT_ATTRIBUTE_FILTER_RULE: IFormattingRule = {
    regex: /\{attribute_filter_selection\(.*?\)\}/,
    token: "invalid-filter",
};
const DEFAULT_RULES: IFormattingRule[] = [
    INVALID_DISPLAY_FORMS_RULE,
    INVALID_DASHBOARD_ATTRIBUTE_FILTER_RULE,
    INVALID_INSIGHT_ATTRIBUTE_FILTER_RULE,
    IDENTIFIER_RULE,
    INVALID_IDENTIFIER_RULE,
];

const buildFormattingRules = (
    attributeDisplayForms: IAttributeWithDisplayForm[],
    dashboardFilters: IAttributeFilter[],
    insightFilters: IAttributeFilter[],
): IFormattingRules => {
    const validDisplayFormsRule = buildValidDisplayFormsFormattingRule(attributeDisplayForms);
    const validInsightFiltersRule = buildValidInsightFiltersFormattingRule(insightFilters);
    const validDashboardFiltersRule = buildValidDashboardFiltersFormattingRule(dashboardFilters);
    return {
        start: compact([
            validDisplayFormsRule,
            validDashboardFiltersRule,
            validInsightFiltersRule,
            ...DEFAULT_RULES,
        ]),
    };
};

const UrlInputPanel: React.FC<IUrlInputPanelProps> = (props) => {
    const {
        currentUrlValue,
        onChange,
        onCursor,
        documentationLink,
        attributeDisplayForms,
        intl,
        insightFilters,
        dashboardFilters,
    } = props;
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);

    const syntaxHighlightingRules = useMemo(
        () =>
            attributeDisplayForms &&
            insightFilters &&
            dashboardFilters &&
            buildFormattingRules(attributeDisplayForms, dashboardFilters, insightFilters),
        [attributeDisplayForms, insightFilters, dashboardFilters],
    );
    return (
        <div>
            <label className="gd-label">
                <FormattedMessage id="configurationPanel.drillIntoUrl.editor.textAreaLabel" />
            </label>
            <UrlInput
                onChange={onChange}
                onCursor={onCursor}
                currentUrlValue={currentUrlValue}
                syntaxHighlightingRules={syntaxHighlightingRules}
                intl={intl}
            />
            {!isWhiteLabeled && documentationLink ? <HelpLink link={documentationLink} /> : null}
        </div>
    );
};

interface ICursorPosition {
    from: number;
    to: number;
}

const initialCursorPosition: ICursorPosition = {
    from: 0,
    to: 0,
};

const insertPlaceholderAtCursor = (text: string, placeholder: string, cursor: ICursorPosition): string =>
    `${text.substring(0, cursor.from)}${placeholder}${text.substring(cursor.to)}`;

const assertValidUrl = (url: string) =>
    /^[A-Za-z0-9.\-+]+:|^\{attribute_title\(|^\{attribute_filter_selection\(|^\{dash_attribute_filter_selection\(/.test(
        url,
    )
        ? url
        : `https://${url}`;

const getWarningTextForInvalidParameters = (parameters: string[]): React.ReactElement => {
    const invalidParameters = parameters.map((parameter) => `"${parameter}"`).join(", ");
    return (
        <FormattedMessage
            id="configurationPanel.drillIntoUrl.editor.invalidAttributeDisplayForms"
            values={{ invalidParameters }}
        />
    );
};

export interface CustomUrlEditorProps {
    urlDrillTarget?: UrlDrillTarget;
    attributeDisplayForms?: IAttributeWithDisplayForm[];
    loadingAttributeDisplayForms?: boolean;
    invalidAttributeDisplayFormIdentifiers: string[];
    documentationLink?: string;
    enableClientIdParameter: boolean;
    enableDataProductIdParameter: boolean;
    enableWidgetIdParameter: boolean;
    onClose: () => void;
    onSelect: (customUrl: string) => void;
    widgetRef: ObjRef;
}

const CustomUrlEditorDialog: React.FunctionComponent<CustomUrlEditorProps> = (props) => {
    const {
        urlDrillTarget,
        documentationLink,
        onSelect,
        onClose,
        attributeDisplayForms,
        loadingAttributeDisplayForms = false,
        invalidAttributeDisplayFormIdentifiers,
        enableClientIdParameter,
        enableDataProductIdParameter,
        enableWidgetIdParameter,
        widgetRef,
    } = props;

    const intl = useIntl();

    const insightFilters = useSanitizedInsightFilters(widgetRef);
    const dashboardFilters = useSanitizedDashboardFilters();

    const previousValue = urlDrillTarget
        ? (isDrillToCustomUrlConfig(urlDrillTarget) && urlDrillTarget.customUrl) || ""
        : "";

    const [currentValue, setCurrentValue] = useState(previousValue);
    const apply = () => onSelect(assertValidUrl(currentValue));
    const handleOnChange = (value: string) => setCurrentValue(value.trim());

    const isApplyEnabled = currentValue && currentValue.localeCompare(previousValue) !== 0;

    const [cursorPosition, setCursorPosition] = useState<ICursorPosition>(initialCursorPosition);
    const handleCursorPosition = (from: number, to: number) => setCursorPosition({ from, to });

    const handleOnAdd = (parameterPlaceholder: string) =>
        setCurrentValue(insertPlaceholderAtCursor(currentValue, parameterPlaceholder, cursorPosition));

    const editorWarningText =
        invalidAttributeDisplayFormIdentifiers.length > 0
            ? getWarningTextForInvalidParameters(invalidAttributeDisplayFormIdentifiers)
            : undefined;

    return (
        <ConfirmDialogBase
            className="gd-drill-custom-url-editor s-gd-drill-custom-url-editor"
            isPositive={true}
            headline={
                previousValue
                    ? intl.formatMessage({ id: "configurationPanel.drillIntoUrl.editor.editUrlTitle" })
                    : intl.formatMessage({ id: "configurationPanel.drillIntoUrl.editor.addUrlTitle" })
            }
            cancelButtonText={intl.formatMessage({
                id: "configurationPanel.drillIntoUrl.editor.cancelButtonLabel",
            })}
            submitButtonText={intl.formatMessage({
                id: "configurationPanel.drillIntoUrl.editor.applyButtonLabel",
            })}
            isSubmitDisabled={!isApplyEnabled}
            submitOnEnterKey={false}
            onCancel={onClose}
            onSubmit={apply}
            warning={editorWarningText}
        >
            <UrlInputPanel
                onChange={handleOnChange}
                onCursor={handleCursorPosition}
                documentationLink={documentationLink}
                currentUrlValue={currentValue}
                attributeDisplayForms={attributeDisplayForms}
                insightFilters={insightFilters}
                dashboardFilters={dashboardFilters}
                intl={intl}
            />
            <ParametersPanel
                insightFilters={insightFilters}
                dashboardFilters={dashboardFilters}
                attributeDisplayForms={attributeDisplayForms}
                loadingAttributeDisplayForms={loadingAttributeDisplayForms}
                enableClientIdParameter={enableClientIdParameter}
                enableDataProductIdParameter={enableDataProductIdParameter}
                enableWidgetIdParameter={enableWidgetIdParameter}
                onAdd={handleOnAdd}
                intl={intl}
            />
        </ConfirmDialogBase>
    );
};

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

export const CustomUrlEditor: React.FC<CustomUrlEditorProps> = (props) => {
    const isMobileDevice = useMediaQuery("mobileDevice");
    const SelectedOverlay = isMobileDevice ? FullScreenOverlay : Overlay;

    return (
        <OverlayControllerProvider overlayController={overlayController}>
            <SelectedOverlay
                onClose={props.onClose}
                isModal={true}
                closeOnOutsideClick={false}
                closeOnEscape={true}
                positionType="fixed"
                className="gd-modal-overlay"
            >
                <CustomUrlEditorDialog {...props} />
            </SelectedOverlay>
        </OverlayControllerProvider>
    );
};

function useSanitizedInsightFilters(widgetRef: ObjRef) {
    const widget = useDashboardSelector(selectWidgetByRef(widgetRef));
    const widgetFiltersResult = useWidgetFilters(widget);
    const sanitizeAttributeFilter = useSanitizeAttributeFilter();

    return useMemo(() => {
        return widgetFiltersResult.status === "success"
            ? // Date filters are currently not supported, so filter them out
              uniqBy(
                  widgetFiltersResult.result?.filter(isAttributeFilter).map(sanitizeAttributeFilter),
                  (f) => serializeObjRef(filterObjRef(f)),
              )
            : undefined;
    }, [widgetFiltersResult.status, widgetFiltersResult.result, sanitizeAttributeFilter]);
}

function useSanitizedDashboardFilters() {
    // Date filters are currently not supported, so select only attribute filters
    const dashboardFilters = useDashboardSelector(selectFilterContextAttributeFilters);
    const sanitizeAttributeFilter = useSanitizeAttributeFilter();

    return useMemo(() => {
        return dashboardFilters?.map(dashboardAttributeFilterToAttributeFilter).map(sanitizeAttributeFilter);
    }, [dashboardFilters, sanitizeAttributeFilter]);
}

function useSanitizeAttributeFilter() {
    const catalogDisplayFormsMap = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    return useCallback(
        (filter: IAttributeFilter) => {
            const displayForm = catalogDisplayFormsMap.get(filterObjRef(filter));
            if (displayForm) {
                if (isNegativeAttributeFilter(filter)) {
                    return {
                        ...filter,
                        negativeAttributeFilter: {
                            ...filter.negativeAttributeFilter,
                            displayForm: idRef(displayForm.id, "displayForm"),
                        },
                    };
                } else {
                    return {
                        ...filter,
                        positiveAttributeFilter: {
                            ...filter.positiveAttributeFilter,
                            displayForm: idRef(displayForm.id, "displayForm"),
                        },
                    };
                }
            }
            return filter;
        },
        [catalogDisplayFormsMap],
    );
}
