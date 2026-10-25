// (C) 2007-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import {
    type IAttributeFilter,
    filterAttributeElements,
    filterLocalIdentifier,
    filterObjRef,
    isAttributeElementsByValue,
    isAttributeFilterWithSelection,
    isPositiveAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { type ILocale } from "@gooddata/sdk-ui";
import { AttributeFilterButton, type IAttributeFilterLoadingProps } from "@gooddata/sdk-ui-filters";

import { isElementUrisSupported } from "../../selectors/backend_capabilities_selector.js";
import { getSeparators } from "../../selectors/bootstrap_selector.js";
import { getFeatureFlags } from "../../selectors/feature_flag_selector.js";

import { useAttributeFilterCustomizations } from "./customization/useAttributeFilterCustomizations.js";
import { withElementIdClassName } from "./customization/withElementIdClassName.js";
import { type IAttributeFilterProps } from "./types.js";

// In analytical designer, filter is always "uri" based.
// In the past, we were relying on the fact, that tiger/panther does not support multiple labels and uri was always equal to the title.
// This is not correct anymore, and all filters in panther and tiger are saved as values, so we need to send them as values also to AttributeFilter.
function convertAttributeFilterElementsUrisToValues(filter: IAttributeFilter): IAttributeFilter {
    // Text-mode filters (arbitrary, match, …) have no element list — skip the conversion
    if (!isAttributeFilterWithSelection(filter)) {
        return filter;
    }

    const elements = filterAttributeElements(filter);
    if (isAttributeElementsByValue(elements)) {
        return filter;
    }

    const convertedElements = { values: elements.uris };

    return isPositiveAttributeFilter(filter)
        ? newPositiveAttributeFilter(filterObjRef(filter), convertedElements, filterLocalIdentifier(filter))
        : newNegativeAttributeFilter(filterObjRef(filter), convertedElements, filterLocalIdentifier(filter));
}

export function AttributeFilter(props: IAttributeFilterProps) {
    const settings = useSelector(getFeatureFlags);
    const separators = useSelector(getSeparators);

    const intl = useIntl();
    const { availableSelectionTypes } = props;

    const menuConfig = useMemo(
        () => (availableSelectionTypes ? { availableSelectionTypes } : undefined),
        [availableSelectionTypes],
    );

    const {
        backend,
        workspace,
        filter,
        displayAsDisplayForm,
        onApplyCallback,
        onChangeCallback,
        CustomStatusBarComponent,
        CustomDropdownButton,
        CustomDropdownBody,
        CustomElementsSearchBarComponent,
        CustomElementsDropdownActionsComponent,
    } = useAttributeFilterCustomizations({ ...props, settings });

    const filterToUse = useMemo(() => {
        if (isElementUrisSupported()) {
            return filter;
        }
        return convertAttributeFilterElementsUrisToValues(filter);
    }, [filter]);

    const LoadingComponent = useCallback(
        ({ onClick, isOpen }: IAttributeFilterLoadingProps) => {
            return <CustomDropdownButton onClick={onClick} isOpen={isOpen} isLoading />;
        },
        [CustomDropdownButton],
    );

    return (
        <AttributeFilterButton
            backend={backend}
            workspace={workspace}
            separators={separators}
            filter={filterToUse}
            displayAsLabel={displayAsDisplayForm}
            onApply={onApplyCallback}
            onChange={onChangeCallback}
            StatusBarComponent={CustomStatusBarComponent}
            DropdownButtonComponent={CustomDropdownButton}
            DropdownBodyComponent={CustomDropdownBody}
            ElementsSearchBarComponent={CustomElementsSearchBarComponent}
            ElementsSelectItemComponent={withElementIdClassName}
            DropdownActionsComponent={CustomElementsDropdownActionsComponent}
            LoadingComponent={LoadingComponent}
            locale={intl.locale as ILocale}
            menuConfig={menuConfig}
        />
    );
}
