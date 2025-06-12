// (C) 2022-2025 GoodData Corporation
import React, { useContext } from "react";
import { IAttributeFilterCoreProps } from "../types.js";
import { useAttributeFilterController } from "../hooks/useAttributeFilterController.js";
import { AttributeFilterController } from "../hooks/types.js";

/**
 * The return type of {@link useAttributeFilterContext}.
 * @beta
 */
export type IAttributeFilterContext = AttributeFilterController &
    Pick<
        IAttributeFilterCoreProps,
        | "fullscreenOnMobile"
        | "title"
        | "selectionMode"
        | "selectFirst"
        | "disabled"
        | "customIcon"
        | "withoutApply"
        | "workingFilter"
        | "overlayPositionType"
    >;

export const AttributeFilterContext = React.createContext<IAttributeFilterContext>(null);

AttributeFilterContext.displayName = "AttributeFilterContext";

/**
 * Context providing AttributeFilter state and callbacks wrapped as {@link AttributeFilterController}.
 * @beta
 */
export const useAttributeFilterContext = (): IAttributeFilterContext => useContext(AttributeFilterContext);

/**
 * @internal
 */
export const AttributeFilterContextProvider: React.FC<
    IAttributeFilterCoreProps & { children: React.ReactNode }
> = (props) => {
    const {
        children,
        fullscreenOnMobile,
        title: titleInput,
        selectionMode,
        selectFirst,
        disabled,
        customIcon,
        enableDuplicatedLabelValuesInAttributeFilter = true,
        withoutApply,
        workingFilter,
        overlayPositionType,
    } = props;

    const controller = useAttributeFilterController(props);
    const title = titleInput ?? controller?.attribute?.title ?? "";

    return (
        <AttributeFilterContext.Provider
            value={{
                ...controller,
                fullscreenOnMobile,
                title,
                selectionMode,
                selectFirst,
                disabled,
                customIcon,
                enableDuplicatedLabelValuesInAttributeFilter,
                withoutApply,
                workingFilter,
                overlayPositionType,
            }}
        >
            {children}
        </AttributeFilterContext.Provider>
    );
};
