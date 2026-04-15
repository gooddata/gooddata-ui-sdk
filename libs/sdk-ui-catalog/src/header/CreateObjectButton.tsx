// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type MouseEvent, useCallback, useMemo, useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import type { IParameterMetadataObjectDefinition } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import {
    Dropdown,
    type IUiMenuInteractiveItem,
    type IUiMenuItem,
    type IconType,
    SeparatorLine,
    UiButton,
    UiIcon,
    UiMenu,
    useToastMessage,
} from "@gooddata/sdk-ui-kit";

import { useCatalogFeedActions } from "../catalogItem/CatalogFeedContext.js";
import { createParameterCatalogItem } from "../catalogItem/query.js";
import { ObjectTypes } from "../objectType/constants.js";
import { getObjectTypeLabel } from "../objectType/labels.js";
import type { CatalogCreateObjectType } from "../objectType/types.js";
import { ParameterCreateDialog } from "../parameter/ParameterCreateDialog.js";

type CreateItemData = {
    interactive: CatalogCreateObjectType;
    static: unknown;
};

const icons: Record<CatalogCreateObjectType, IconType> = {
    [ObjectTypes.DASHBOARD]: "dashboard",
    [ObjectTypes.VISUALIZATION]: "visualization",
    [ObjectTypes.METRIC]: "metric",
    [ObjectTypes.PARAMETER]: "parameter",
};

type Props = {
    onCreateObject: (objectType: CatalogCreateObjectType) => void;
    showParameter?: boolean;
};

const messages = defineMessages({
    parameterCreateSuccess: { id: "analyticsCatalog.parameter.create.success" },
});

export function CreateObjectButton({ onCreateObject, showParameter }: Props) {
    const intl = useIntl();
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const { refetchObjectType } = useCatalogFeedActions();
    const { addSuccess } = useToastMessage();
    const [isParameterDialogOpen, setIsParameterDialogOpen] = useState(false);

    const items = useMemo(() => {
        const externalLinkIcon = <MenuItemIcon type="externalLink" />;
        const items: IUiMenuItem<CreateItemData>[] = [
            {
                type: "interactive",
                id: ObjectTypes.DASHBOARD,
                stringTitle: getObjectTypeLabel(intl, ObjectTypes.DASHBOARD),
                iconLeft: <MenuItemIcon type={icons[ObjectTypes.DASHBOARD]} />,
                iconRight: externalLinkIcon,
                data: ObjectTypes.DASHBOARD,
            },
            {
                type: "interactive",
                id: ObjectTypes.VISUALIZATION,
                stringTitle: getObjectTypeLabel(intl, ObjectTypes.VISUALIZATION),
                iconLeft: <MenuItemIcon type={icons[ObjectTypes.VISUALIZATION]} />,
                iconRight: externalLinkIcon,
                data: ObjectTypes.VISUALIZATION,
            },
            {
                type: "interactive",
                id: ObjectTypes.METRIC,
                stringTitle: getObjectTypeLabel(intl, ObjectTypes.METRIC),
                iconLeft: <MenuItemIcon type={icons[ObjectTypes.METRIC]} />,
                iconRight: externalLinkIcon,
                data: ObjectTypes.METRIC,
            },
        ];
        if (showParameter) {
            items.push(
                { type: "static", data: <SeparatorLine pT={5} pR={10} pB={4} pL={10} /> },
                {
                    type: "interactive",
                    id: ObjectTypes.PARAMETER,
                    stringTitle: getObjectTypeLabel(intl, ObjectTypes.PARAMETER),
                    iconLeft: <MenuItemIcon type={icons[ObjectTypes.PARAMETER]} />,
                    data: ObjectTypes.PARAMETER,
                },
            );
        }
        return items;
    }, [intl, showParameter]);

    const handleSelect = useCallback(
        (item: IUiMenuInteractiveItem<CreateItemData>, _event: MouseEvent | KeyboardEvent) => {
            if (item.data === ObjectTypes.PARAMETER) {
                setIsParameterDialogOpen(true);
            } else {
                onCreateObject(item.data);
            }
        },
        [onCreateObject],
    );

    const handleParameterDialogClose = useCallback(() => {
        setIsParameterDialogOpen(false);
    }, []);

    const handleParameterCreate = useCallback(
        async (parameter: IParameterMetadataObjectDefinition) => {
            await createParameterCatalogItem(backend, workspace, parameter);
            setIsParameterDialogOpen(false);
            addSuccess(messages.parameterCreateSuccess);
            await refetchObjectType(ObjectTypes.PARAMETER);
        },
        [addSuccess, backend, refetchObjectType, workspace],
    );

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
                        iconBefore="plus"
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
            {isParameterDialogOpen ? (
                <ParameterCreateDialog
                    onClose={handleParameterDialogClose}
                    onSubmit={handleParameterCreate}
                />
            ) : null}
        </>
    );
}

function MenuItemIcon({ type }: { type: IconType }) {
    return <UiIcon type={type} size={14} color="complementary-5" />;
}
