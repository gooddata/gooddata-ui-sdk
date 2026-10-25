// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";
import { useSelector } from "react-redux";

import { type IParameterMetadataObject } from "@gooddata/sdk-model";
import { ParameterPicker, UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

import { getCatalogParameters, isLoadingItems } from "../../../store/catalog/catalog_selector.js";
import { getActiveParameterRefKeys } from "../../../store/filter_bar/filter_bar_selector.js";

export interface IFilterBarParameterPickerProps {
    maxListHeight: number;
    onBack: () => void;
    onClose: () => void;
    onAdd: (parameters: ReadonlyArray<IParameterMetadataObject>) => void;
}

export function FilterBarParameterPicker({
    maxListHeight,
    onBack,
    onClose,
    onAdd,
}: IFilterBarParameterPickerProps) {
    const intl = useIntl();
    const parameters = useSelector(getCatalogParameters);
    const isLoading = useSelector(isLoadingItems);
    const activeKeys = useSelector(getActiveParameterRefKeys);

    const handleAdd = (selected: ReadonlyArray<IParameterMetadataObject>) => {
        onAdd(selected);
        onClose();
    };

    return (
        <div data-testid="s-parameter-picker">
            <UiSubmenuHeader
                title={intl.formatMessage({ id: "filter_bar_add_filter.parameters.title" })}
                closeAriaLabel={intl.formatMessage({ id: "cancel" })}
                onClose={onClose}
                onBack={onBack}
                height="medium"
            />
            <ParameterPicker
                parameters={parameters}
                excludedKeys={activeKeys}
                isLoading={isLoading}
                maxListHeight={maxListHeight}
                onAdd={handleAdd}
                onCancel={onClose}
            />
        </div>
    );
}
