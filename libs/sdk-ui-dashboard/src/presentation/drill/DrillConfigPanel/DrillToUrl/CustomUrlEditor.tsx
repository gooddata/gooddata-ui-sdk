// (C) 2020-2026 GoodData Corporation

import { type ReactElement, useCallback, useMemo, useState } from "react";

import { HighlightStyle, StreamLanguage, type StringStream, syntaxHighlighting } from "@codemirror/language";
import { Tag } from "@lezer/highlight";
import { compact, uniqBy } from "lodash-es";
import { FormattedMessage, type IntlShape, useIntl } from "react-intl";

import {
    type IAttributeFilter,
    type IDashboardAttributeFilterConfig,
    type ObjRef,
    filterObjRef,
    idRef,
    isAttributeFilter,
    isNegativeAttributeFilter,
    isUriRef,
    objRefToString,
    serializeObjRef,
} from "@gooddata/sdk-model";
import {
    ConfirmDialogBase,
    FullScreenOverlay,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    SyntaxHighlightingInput,
    useMediaQuery,
} from "@gooddata/sdk-ui-kit";

import { ParametersPanel } from "./CustomUrlEditorParameters.js";
import { type IAttributeWithDisplayForm } from "./types.js";
import { dashboardAttributeFilterToAttributeFilter } from "../../../../converters/filterConverters.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { useWidgetFilters } from "../../../../model/react/useWidgetFilters.js";
import { selectAllCatalogDisplayFormsMap } from "../../../../model/store/catalog/catalogSelectors.js";
import { selectIsWhiteLabeled } from "../../../../model/store/config/configSelectors.js";
import { selectAttributeFilterConfigsOverrides } from "../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import { selectFilterContextAttributeFilters } from "../../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { selectFilterableWidgetByRef } from "../../../../model/store/tabs/layout/layoutSelectors.js";
import { DASHBOARD_HEADER_OVERLAYS_Z_INDEX } from "../../../constants/zIndex.js";
import { useInvalidFilteringParametersIdentifiers } from "../../../widget/insight/configuration/DrillTargets/useInvalidFilteringParametersIdentifiers.js";
import { type UrlDrillTarget, isDrillToCustomUrlConfig } from "../../types.js";

export interface IUrlInputProps {
    currentUrlValue: string;
    onChange: (value: string) => void;
    onCursor: (from: number, to: number) => void;
    syntaxHighlightingRules?: IFormattingRule[];
    intl: IntlShape;
}

// Define custom tags for tokenization
const customTags = {
    attribute: Tag.define("attribute"),
    invalidAttribute: Tag.define("invalidAttribute"),
    identifier: Tag.define("identifier"),
    invalidIdentifier: Tag.define("invalidIdentifier"),
    filter: Tag.define("filter"),
    invalidFilter: Tag.define("invalidFilter"),
};

// Map tags to class names for styling
const customHighlightStyle = HighlightStyle.define([
    { tag: customTags.identifier, class: "cm-identifier" },
    { tag: [customTags.attribute, customTags.filter], class: "cm-attribute" },
    {
        tag: [customTags.invalidAttribute, customTags.invalidFilter, customTags.invalidIdentifier],
        class: "cm-invalid",
    },
]);

const createUrlLanguage = (rules: IFormattingRule[]) => {
    return StreamLanguage.define({
        name: "customUrl",
        token: (stream: StringStream) => {
            for (const rule of rules) {
                if (stream.match(rule.regex)) {
                    return rule.token;
                }
            }
            stream.next();
            return null;
        },
        tokenTable: customTags,
    });
};

export function UrlInput({
    onChange,
    onCursor,
    currentUrlValue,
    intl,
    syntaxHighlightingRules,
}: IUrlInputProps) {
    const placeholder = intl.formatMessage({
        id: "configurationPanel.drillIntoUrl.editor.textAreaPlaceholder",
    });

    const extensions = useMemo(() => {
        if (!syntaxHighlightingRules) return [];
        return [createUrlLanguage(syntaxHighlightingRules), syntaxHighlighting(customHighlightStyle)];
    }, [syntaxHighlightingRules]);

    return syntaxHighlightingRules ? (
        <SyntaxHighlightingInput
            onChange={onChange}
            onCursor={onCursor}
            value={currentUrlValue}
            placeholder={placeholder}
            className={"gd-input-syntax-highlighting-input"}
            extensions={extensions}
        />
    ) : null;
}

function HelpLink({ link }: { link: string }) {
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
}

interface IUrlInputPanelProps {
    currentUrlValue: string;
    onChange: (value: string) => void;
    onCursor: (from: number, to: number) => void;
    attributeDisplayForms?: IAttributeWithDisplayForm[];
    insightFilters?: IAttributeFilter[];
    dashboardFilters?: IAttributeFilter[];
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[];
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
    return { regex: new RegExp(`^${validAttributePlaceholders}`), token: customTags.attribute.toString() };
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
    return {
        regex: new RegExp(`^${validInsightAttributeFilterPlaceholders}`),
        token: customTags.filter.toString(),
    };
};

const buildValidDashboardFiltersFormattingRule = (
    attributeFilters: IAttributeFilter[],
    attributeFilterConfigs: IDashboardAttributeFilterConfig[] = [],
) => {
    if (attributeFilters.length === 0) {
        return undefined;
    }

    const filterPlaceholders = attributeFilters.map((filter) => {
        const ref = filterObjRef(filter);
        const id = objRefToString(ref);
        return `{dash_attribute_filter_selection\\(${id}\\)}`;
    });
    const configPlaceholders = attributeFilterConfigs
        .filter((config) => !!config.displayAsLabel)
        .map((config) => {
            const id = !!config.displayAsLabel && objRefToString(config.displayAsLabel);
            return `{dash_attribute_filter_selection\\(${id}\\)}`;
        });

    const validDashboardAttributeFilterPlaceholders = [...filterPlaceholders, ...configPlaceholders].join(
        "|",
    );
    return {
        regex: new RegExp(`^${validDashboardAttributeFilterPlaceholders}`),
        token: customTags.filter.toString(),
    };
};

interface IFormattingRule {
    regex: RegExp;
    token: string;
}

const IDENTIFIER_RULE: IFormattingRule = {
    regex: /^\{workspace_id\}|\{project_id\}|\{visualization_id\}|\{widget_id\}|\{dashboard_id\}|\{client_id\}|\{data_product_id\}/,
    token: customTags.identifier.toString(),
};
const INVALID_IDENTIFIER_RULE: IFormattingRule = { regex: /^\{[^}{]*\}/, token: "invalid" };
const INVALID_DISPLAY_FORMS_RULE: IFormattingRule = {
    regex: /^\{attribute_title\(.*?\)\}/,
    token: customTags.invalidAttribute.toString(),
};
const INVALID_DASHBOARD_ATTRIBUTE_FILTER_RULE: IFormattingRule = {
    regex: /^\{dash_attribute_filter_selection\(.*?\)\}/,
    token: customTags.invalidFilter.toString(),
};
const INVALID_INSIGHT_ATTRIBUTE_FILTER_RULE: IFormattingRule = {
    regex: /^\{attribute_filter_selection\(.*?\)\}/,
    token: customTags.invalidFilter.toString(),
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
    attributeFilterConfigs?: IDashboardAttributeFilterConfig[],
): IFormattingRule[] => {
    const validDisplayFormsRule = buildValidDisplayFormsFormattingRule(attributeDisplayForms);
    const validInsightFiltersRule = buildValidInsightFiltersFormattingRule(insightFilters);
    const validDashboardFiltersRule = buildValidDashboardFiltersFormattingRule(
        dashboardFilters,
        attributeFilterConfigs,
    );
    return compact([
        validDisplayFormsRule,
        validDashboardFiltersRule,
        validInsightFiltersRule,
        ...DEFAULT_RULES,
    ]);
};

function UrlInputPanel({
    currentUrlValue,
    onChange,
    onCursor,
    documentationLink,
    attributeDisplayForms,
    intl,
    insightFilters,
    dashboardFilters,
    attributeFilterConfigs,
}: IUrlInputPanelProps) {
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);

    const syntaxHighlightingRules = useMemo(
        () =>
            attributeDisplayForms &&
            insightFilters &&
            dashboardFilters &&
            buildFormattingRules(
                attributeDisplayForms,
                dashboardFilters,
                insightFilters,
                attributeFilterConfigs,
            ),
        [attributeDisplayForms, insightFilters, dashboardFilters, attributeFilterConfigs],
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
}

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

const getWarningTextForInvalidParameters = (parameters: string[]): ReactElement => {
    const invalidParameters = parameters.map((parameter) => `"${parameter}"`).join(", ");
    return (
        <FormattedMessage
            id="configurationPanel.drillIntoUrl.editor.invalidAttributeDisplayForms"
            values={{ invalidParameters }}
        />
    );
};

export interface ICustomUrlEditorProps {
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

function CustomUrlEditorDialog({
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
}: ICustomUrlEditorProps) {
    const intl = useIntl();

    const insightFilters = useSanitizedInsightFilters(widgetRef);
    const dashboardFilters = useSanitizedDashboardFilters();
    const attributeFilterConfigs = useDashboardSelector(selectAttributeFilterConfigsOverrides);
    const invalidFilteringParametersIdentifiers = useInvalidFilteringParametersIdentifiers(
        urlDrillTarget,
        insightFilters,
        dashboardFilters,
        attributeFilterConfigs,
    );

    const invalidParameters = useMemo(() => {
        return [...invalidAttributeDisplayFormIdentifiers, ...invalidFilteringParametersIdentifiers];
    }, [invalidAttributeDisplayFormIdentifiers, invalidFilteringParametersIdentifiers]);

    const previousValue = urlDrillTarget
        ? (isDrillToCustomUrlConfig(urlDrillTarget) && urlDrillTarget.customUrl) || ""
        : "";

    const [currentValue, setCurrentValue] = useState(previousValue);
    const apply = () => onSelect(assertValidUrl(currentValue));
    const handleOnChange = (value: string) => setCurrentValue(value);

    const isApplyEnabled = currentValue && currentValue.localeCompare(previousValue) !== 0;

    const [cursorPosition, setCursorPosition] = useState<ICursorPosition>(initialCursorPosition);
    const handleCursorPosition = (from: number, to: number) => setCursorPosition({ from, to });

    const handleOnAdd = (parameterPlaceholder: string) =>
        setCurrentValue(insertPlaceholderAtCursor(currentValue, parameterPlaceholder, cursorPosition));

    const editorWarningText =
        invalidParameters.length > 0 ? getWarningTextForInvalidParameters(invalidParameters) : undefined;

    return (
        <ConfirmDialogBase
            className="gd-drill-custom-url-editor s-gd-drill-custom-url-editor"
            isPositive
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
                attributeFilterConfigs={attributeFilterConfigs}
                intl={intl}
            />
            <ParametersPanel
                insightFilters={insightFilters}
                dashboardFilters={dashboardFilters}
                attributeFilterConfigs={attributeFilterConfigs}
                attributeDisplayForms={attributeDisplayForms}
                loadingAttributeDisplayForms={loadingAttributeDisplayForms}
                enableClientIdParameter={enableClientIdParameter}
                enableDataProductIdParameter={enableDataProductIdParameter}
                enableWidgetIdParameter={enableWidgetIdParameter}
                onAdd={handleOnAdd}
                intl={intl}
                widgetRef={widgetRef}
            />
        </ConfirmDialogBase>
    );
}

const overlayController = OverlayController.getInstance(DASHBOARD_HEADER_OVERLAYS_Z_INDEX);

export function CustomUrlEditor(props: ICustomUrlEditorProps) {
    const isMobileDevice = useMediaQuery("mobileDevice");
    const SelectedOverlay = isMobileDevice ? FullScreenOverlay : Overlay;

    return (
        <OverlayControllerProvider overlayController={overlayController}>
            <SelectedOverlay
                onClose={props.onClose}
                isModal
                closeOnOutsideClick={false}
                closeOnEscape
                positionType="fixed"
                className="gd-modal-overlay"
            >
                <CustomUrlEditorDialog {...props} />
            </SelectedOverlay>
        </OverlayControllerProvider>
    );
}

function useSanitizedInsightFilters(widgetRef: ObjRef) {
    const widget = useDashboardSelector(selectFilterableWidgetByRef(widgetRef));
    const widgetFiltersResult = useWidgetFilters(widget);
    const sanitizeAttributeFilter = useSanitizeAttributeFilter();

    return useMemo(() => {
        return widgetFiltersResult.status === "success"
            ? // Date filters are currently not supported, so filter them out
              uniqBy(
                  widgetFiltersResult.result
                      ?.filter(isAttributeFilter)
                      .map(sanitizeAttributeFilter)
                      .filter(isAttributeFilter), // filter out undefined values (eg. filters with removed display forms)
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
        return dashboardFilters
            ?.map(dashboardAttributeFilterToAttributeFilter)
            .map(sanitizeAttributeFilter)
            .filter(isAttributeFilter); // filter out undefined values (eg. filters with removed display forms)
    }, [dashboardFilters, sanitizeAttributeFilter]);
}

function useSanitizeAttributeFilter() {
    const catalogDisplayFormsMap = useDashboardSelector(selectAllCatalogDisplayFormsMap);

    return useCallback(
        (filter: IAttributeFilter): IAttributeFilter | undefined => {
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

            // display form no longer exists -> filter is invalid
            return undefined;
        },
        [catalogDisplayFormsMap],
    );
}
