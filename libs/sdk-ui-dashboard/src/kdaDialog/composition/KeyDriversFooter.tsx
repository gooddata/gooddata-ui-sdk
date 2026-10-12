// (C) 2025-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { FormattedMessage } from "react-intl";

import { type ICatalogAttribute, areObjRefsEqual } from "@gooddata/sdk-model";
import { UiSkeleton, useIdPrefixed, useUiAutofocusConnectors } from "@gooddata/sdk-ui-kit";

import { useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { selectCatalogIsLoaded } from "../../model/store/catalog/catalogSelectors.js";
import { useKdaState } from "../providers/KdaState.js";

import { useKdaValidAttributes } from "./hooks/useKdaValidAttributes.js";
import { KdaAttributesDropdown } from "./KdaAttributesDropdown.js";

export function KeyDriversFooter() {
    const { state, setState } = useKdaState();
    const [applyCount, setApplyCount] = useState(0);
    const attributesButtonId = useIdPrefixed("kda-attributes-dropdown-button");

    const isCatalogLoaded = useDashboardSelector(selectCatalogIsLoaded);
    const isLoading =
        !isCatalogLoaded ||
        state.itemsStatus === "pending" ||
        state.itemsStatus === "loading" ||
        state.relevantStatus === "pending" ||
        state.relevantStatus === "loading";
    const isError = state.itemsStatus === "error";

    const { validAttributes, mapAttributes, initialAttributes, isSearchBarVisible } = useKdaValidAttributes();

    const onApply = useCallback(
        (selected: ICatalogAttribute[]) => {
            setApplyCount((count) => count + 1);
            setState({
                selectedAttributes: selected.map((item) => {
                    const existingRef = state.selectedAttributes.find((ref) =>
                        item.displayForms.some((df) => areObjRefsEqual(df.ref, ref)),
                    );
                    return existingRef ?? item.defaultDisplayForm.ref;
                }),
                selectedUpdated: Date.now(),
            });
        },
        [setState, state.selectedAttributes],
    );

    const onOpen = useCallback(() => {
        setState({ attributesDropdownOpen: true });
    }, [setState]);

    const onClose = useCallback(() => {
        setState({ attributesDropdownOpen: false });
    }, [setState]);

    const autofocus = useUiAutofocusConnectors<HTMLDivElement>({
        active: applyCount > 0 && !isLoading,
        refocusKey: `${applyCount}-${isLoading}`,
        initialFocus: attributesButtonId,
    });

    //Do not show footer when kda is not loaded at all
    if (isError) {
        return null;
    }

    return (
        <div ref={autofocus.ref}>
            {isLoading ? (
                <UiSkeleton itemHeight={23} itemWidth={300} />
            ) : (
                <FormattedMessage
                    id="kdaDialog.dialog.keyDrives.overview.summary.drivers.description"
                    values={{
                        combinations: state.items.length,
                        attributes: state.selectedAttributes.length,
                        button: (chunks) => {
                            const buttonLabel = chunks
                                .filter((chunk): chunk is string => typeof chunk === "string")
                                .join("");
                            return (
                                <KdaAttributesDropdown
                                    buttonId={attributesButtonId}
                                    buttonLabel={buttonLabel}
                                    attributesCount={state.selectedAttributes.length}
                                    validAttributes={validAttributes}
                                    initialAttributes={initialAttributes}
                                    mapAttributes={mapAttributes}
                                    isSearchBarVisible={isSearchBarVisible}
                                    onApply={onApply}
                                    onOpen={onOpen}
                                    onClose={onClose}
                                />
                            );
                        },
                    }}
                />
            )}
        </div>
    );
}
