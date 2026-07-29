// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, useCallback, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import {
    Dropdown,
    type IUiMenuInteractiveItem,
    type IUiMenuItem,
    type IconType,
    UiButton,
    UiIcon,
    UiMenu,
} from "@gooddata/sdk-ui-kit";

import { AsCodeCreateDialog } from "../asCode/AsCodeCreateDialog.js";
import { getAsCodeDescriptor, useCreatableObjectTypes } from "../asCodeRegistry.js";
import { useCatalogFeedActions } from "../catalogItem/CatalogFeedContext.js";
import { ObjectTypes } from "../objectType/constants.js";
import { getObjectTypeLabel } from "../objectType/labels.js";
import type { CatalogCreateObjectType } from "../objectType/types.js";

type CreateItemData = {
    interactive: CatalogCreateObjectType;
};

const icons: Record<CatalogCreateObjectType, IconType> = {
    [ObjectTypes.DASHBOARD]: "dashboard",
    [ObjectTypes.VISUALIZATION]: "visualization",
    [ObjectTypes.METRIC]: "metric",
    [ObjectTypes.PARAMETER]: "parameter",
};

type Props = {
    onCreateObject: (objectType: CatalogCreateObjectType) => void;
};

export function CreateObjectButton({ onCreateObject }: Props) {
    const intl = useIntl();
    const { refetchObjectType } = useCatalogFeedActions();
    const [openType, setOpenType] = useState<CatalogCreateObjectType | undefined>(undefined);

    // Widened to the full create-menu vocabulary so redirect-only types can be membership-tested.
    const inCatalogTypes: ReadonlySet<CatalogCreateObjectType> = useCreatableObjectTypes();

    const items = useMemo<IUiMenuItem<CreateItemData>[]>(() => {
        const externalLinkIcon = <MenuItemIcon type="externalLink" />;
        const interactiveItem = (
            type: CatalogCreateObjectType,
            redirects: boolean,
        ): IUiMenuInteractiveItem<CreateItemData> => ({
            type: "interactive",
            id: type,
            stringTitle: getObjectTypeLabel(intl, type),
            iconLeft: <MenuItemIcon type={icons[type]} />,
            iconRight: redirects ? externalLinkIcon : undefined,
            data: type,
        });

        // Metric and visualization redirect to a standalone editor unless their in-catalog editor is on.
        return [
            interactiveItem(ObjectTypes.DASHBOARD, true),
            ...(inCatalogTypes.has(ObjectTypes.VISUALIZATION)
                ? []
                : [interactiveItem(ObjectTypes.VISUALIZATION, true)]),
            ...(inCatalogTypes.has(ObjectTypes.METRIC) ? [] : [interactiveItem(ObjectTypes.METRIC, true)]),
            { type: "separator" },
            ...[...inCatalogTypes].map((type) => interactiveItem(type, false)),
        ];
    }, [intl, inCatalogTypes]);

    const handleSelect = useCallback(
        (item: IUiMenuInteractiveItem<CreateItemData>, _event: MouseEvent | KeyboardEvent) => {
            if (inCatalogTypes.has(item.data)) {
                setOpenType(item.data);
            } else {
                onCreateObject(item.data);
            }
        },
        [inCatalogTypes, onCreateObject],
    );

    const closeDialog = useCallback(() => setOpenType(undefined), []);

    const handleCreated = useCallback(() => {
        if (openType) {
            void refetchObjectType(openType);
        }
    }, [openType, refetchObjectType]);

    const openDescriptor = openType ? getAsCodeDescriptor(openType) : undefined;

    return (
        <>
            <Dropdown
                alignPoints={[{ align: "br tr" }]}
                renderButton={({ toggleDropdown, buttonRef, ariaAttributes, accessibilityConfig }) => (
                    <UiButton
                        ref={(element) => {
                            buttonRef.current = element;
                        }}
                        label={intl.formatMessage({ id: "analyticsCatalog.create" })}
                        onClick={toggleDropdown}
                        variant="primary"
                        iconAfter="navigateDown"
                        accessibilityConfig={{
                            ...accessibilityConfig,
                            ariaExpanded: ariaAttributes["aria-expanded"],
                            ariaHaspopup: ariaAttributes["aria-haspopup"],
                            ariaControls: ariaAttributes["aria-controls"],
                            iconAriaHidden: true,
                        }}
                    />
                )}
                renderBody={({ closeDropdown, ariaAttributes }) => (
                    <UiMenu
                        items={items}
                        minWidth={180}
                        onClose={closeDropdown}
                        onSelect={handleSelect}
                        shouldCloseOnSelect
                        ariaAttributes={ariaAttributes}
                        containerTopPadding="small"
                        containerBottomPadding="small"
                    />
                )}
                closeOnEscape
                autofocusOnOpen
            />
            {openDescriptor ? (
                <AsCodeCreateDialog
                    key={openDescriptor.objectType}
                    descriptor={openDescriptor}
                    onClose={closeDialog}
                    onCreated={handleCreated}
                />
            ) : null}
        </>
    );
}

function MenuItemIcon({ type }: { type: IconType }) {
    return <UiIcon type={type} size={14} color="complementary-5" />;
}
