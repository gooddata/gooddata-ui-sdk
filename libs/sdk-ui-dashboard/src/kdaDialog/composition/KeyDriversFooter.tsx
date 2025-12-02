// (C) 2025 GoodData Corporation

import { RefObject, useMemo } from "react";

import { FormattedMessage } from "react-intl";

import { ICatalogAttribute, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { DropdownInvertableSelect, InvertableSelectItem, UiButton, UiSkeleton } from "@gooddata/sdk-ui-kit";

import { selectCatalogAttributes, selectCatalogIsLoaded, useDashboardSelector } from "../../model/index.js";
import { useSummaryDrivers } from "../hooks/useSummaryDrivers.js";
import { KdaItemGroup } from "../internalTypes.js";
import { useKdaState } from "../providers/KdaState.js";

export function KeyDriversFooter() {
    const { state, setState } = useKdaState();
    const list = useSummaryDrivers();

    const isCatalogLoaded = useDashboardSelector(selectCatalogIsLoaded);
    const isLoading =
        !isCatalogLoaded ||
        state.itemsStatus === "pending" ||
        state.itemsStatus === "loading" ||
        state.relevantStatus === "pending" ||
        state.relevantStatus === "loading";

    const allAttributes = useDashboardSelector(selectCatalogAttributes);
    const { validAttributes, mapAttributes } = useMemo(() => {
        const mapAttributes = new Map<ObjRef, KdaItemGroup | undefined>();
        const validAttributes = allAttributes
            .filter((a) => {
                return state.relevantAttributes.some((attr) => areObjRefsEqual(attr, a.attribute.ref));
            })
            .map((a) => {
                const group = list.find((item) =>
                    a.displayForms.some((df) => areObjRefsEqual(df.ref, item.displayForm)),
                );
                mapAttributes.set(a.attribute.ref, group);
                return [a, group] as const;
            })
            .sort(([, a], [, b]) => {
                const aIndex = a ? list.indexOf(a) : -1;
                const bIndex = b ? list.indexOf(b) : -1;
                return aIndex - bIndex;
            })
            .map(([a]) => a);

        return { validAttributes, mapAttributes };
    }, [allAttributes, list, state.relevantAttributes]);

    const initialAttributes = useMemo(() => {
        return state.selectedAttributes
            .map((attr) => {
                return validAttributes.find((a) =>
                    a.displayForms.some((df) => areObjRefsEqual(df.ref, attr)),
                );
            })
            .filter(Boolean) as ICatalogAttribute[];
    }, [state.selectedAttributes, validAttributes]);

    const isSearchBarVisible = validAttributes.length > 7;

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
                                    closeOnEscape
                                    className="gd-kda-attributes-dropdown"
                                    initialValue={initialAttributes}
                                    overlayPositionType="sameAsTarget"
                                    initialIsInverted={false}
                                    options={validAttributes}
                                    onOpen={() => {
                                        setState({
                                            attributesDropdownOpen: true,
                                        });
                                    }}
                                    onClose={() => {
                                        setState({
                                            attributesDropdownOpen: false,
                                        });
                                    }}
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
                                    renderSearchBar={
                                        isSearchBarVisible
                                            ? undefined
                                            : () => <div className="gd-kda-attributes-dropdown__no-search" />
                                    }
                                    renderItem={(props) => (
                                        <InvertableSelectItem
                                            title={props.title}
                                            isSelected={props.isSelected}
                                            onClick={props.isSelected ? props.onDeselect : props.onSelect}
                                            onOnly={props.onSelectOnly}
                                            renderRight={() => {
                                                const group = mapAttributes.get(props.item.attribute.ref);
                                                if (!group || group.significantDrivers.length === 0) {
                                                    return null;
                                                }
                                                return (
                                                    <span className="gd-kda-attributes-dropdown__key_drivers">
                                                        ({group.significantDrivers.length})
                                                    </span>
                                                );
                                            }}
                                        />
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
