// (C) 2025 GoodData Corporation

import { RefObject } from "react";

import { FormattedMessage } from "react-intl";

import { ICatalogAttribute, areObjRefsEqual } from "@gooddata/sdk-model";
import { DropdownInvertableSelect, UiButton, UiSkeleton } from "@gooddata/sdk-ui-kit";

import { selectCatalogAttributes, selectCatalogIsLoaded, useDashboardSelector } from "../../model/index.js";
import { useKdaState } from "../providers/KdaState.js";

export function KeyDriversFooter() {
    const { state, setState } = useKdaState();
    const isCatalogLoaded = useDashboardSelector(selectCatalogIsLoaded);
    const isLoading =
        !isCatalogLoaded ||
        state.itemsStatus === "pending" ||
        state.itemsStatus === "loading" ||
        state.relevantStatus === "pending" ||
        state.relevantStatus === "loading";

    const allAttributes = useDashboardSelector(selectCatalogAttributes);

    const validAttributes = allAttributes.filter((a) => {
        return state.relevantAttributes.some((attr) => areObjRefsEqual(attr, a.attribute.ref));
    });
    const initialAttributes = state.selectedAttributes
        .map((attr) => {
            return validAttributes.find((a) => a.displayForms.some((df) => areObjRefsEqual(df.ref, attr)));
        })
        .filter(Boolean) as ICatalogAttribute[];

    return (
        <div>
            {isLoading ? (
                <UiSkeleton itemHeight={23} itemWidth={300} />
            ) : (
                <FormattedMessage
                    id="kdaDialog.dialog.keyDrives.overview.summary.drivers.description"
                    values={{
                        combinations: state.items.length,
                        attributes: state.selectedAttributes.length,
                        button: (chunks) => {
                            return (
                                <DropdownInvertableSelect
                                    className="gd-kda-attributes-dropdown"
                                    initialValue={initialAttributes}
                                    initialIsInverted={false}
                                    options={validAttributes}
                                    alignPoints={[{ align: "tl bl" }]}
                                    getItemTitle={(item) => item.attribute.title}
                                    getItemKey={(item) => item.attribute.id}
                                    onChange={(selectedItems, isInverted) => {
                                        const selected = isInverted
                                            ? validAttributes.filter((a) => !selectedItems.includes(a))
                                            : selectedItems;

                                        setState({
                                            selectedAttributes: selected.map(
                                                (item) => item.defaultDisplayForm.ref,
                                            ),
                                            selectedUpdated: Date.now(),
                                        });
                                    }}
                                    header={
                                        <div className="gd-kda-attributes-dropdown__header">
                                            <FormattedMessage id="kdaDialog.dialog.keyDrives.overview.summary.drivers.attributes" />
                                        </div>
                                    }
                                    renderSearchBar={() => (
                                        <div className="gd-kda-attributes-dropdown__no-search" />
                                    )}
                                    renderButton={({ buttonRef, isOpen, toggleDropdown }) => (
                                        <UiButton
                                            ref={buttonRef as RefObject<HTMLButtonElement>}
                                            variant="tertiary"
                                            iconAfter="settings"
                                            isSelected={isOpen}
                                            label={chunks.join("")}
                                            onClick={toggleDropdown}
                                        />
                                    )}
                                />
                            );
                        },
                    }}
                />
            )}
        </div>
    );
}
