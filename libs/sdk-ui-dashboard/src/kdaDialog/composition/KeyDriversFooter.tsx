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
    const isLoading = state.itemsStatus === "pending" || state.itemsStatus === "loading" || !isCatalogLoaded;

    const allAttributes = useDashboardSelector(selectCatalogAttributes);
    const initialAttributes = state.attributes
        .map((attr) => {
            return allAttributes.find((a) => a.displayForms.some((df) => areObjRefsEqual(df.ref, attr)));
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
                        combinations: state.combinations,
                        attributes: state.attributes.length,
                        button: (chunks) => {
                            return (
                                <DropdownInvertableSelect
                                    className="gd-kda-attributes-dropdown"
                                    initialValue={initialAttributes}
                                    initialIsInverted={false}
                                    options={allAttributes}
                                    alignPoints={[{ align: "tl bl" }]}
                                    getItemTitle={(item) => item.attribute.title}
                                    getItemKey={(item) => item.attribute.id}
                                    onChange={(selectedItems, isInverted) => {
                                        const selected = isInverted
                                            ? allAttributes.filter((a) => !selectedItems.includes(a))
                                            : selectedItems;

                                        setState({
                                            attributes: selected.map((item) => item.defaultDisplayForm.ref),
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
