// (C) 2021-2025 GoodData Corporation
import { ReactElement, ReactNode } from "react";
import {
    components as ReactSelectComponents,
    InputProps,
    GroupHeadingProps,
    OptionProps,
    MenuListProps,
    NoticeProps,
} from "react-select";
import { Typography, LoadingMask } from "@gooddata/sdk-ui-kit";
import { wrapMenuList } from "react-select-async-paginate";

import { ISelectOption, isWorkspaceItem, ISelectErrorOption, isSelectErrorOption } from "../types.js";
import { getWorkspaceItemTestId } from "../utils.js";

export function EmptyRenderer(): ReactNode {
    return null;
}

export function LoadingMessageRenderer(): ReactElement {
    return (
        <div className="gd-share-dialog-loading-mask-container">
            <LoadingMask size="small" />
        </div>
    );
}

export function NoOptionsMessageRenderer(props: NoticeProps): ReactElement {
    return (
        <div className="s-user-management-no-option" aria-label="Share dialog no match">
            <ReactSelectComponents.NoOptionsMessage {...props} />
        </div>
    );
}

export function MenuListRendered(props: MenuListProps<ISelectOption, false>): ReactElement {
    return (
        <ReactSelectComponents.MenuList {...props}>
            <div className="s-user-management-menu" aria-label="Share dialog menu list">
                {props.children}
            </div>
        </ReactSelectComponents.MenuList>
    );
}

export const WrappedMenuListRenderer = wrapMenuList(
    (props: MenuListProps<ISelectOption, false>): ReactElement => {
        return (
            <ReactSelectComponents.MenuList {...props}>
                <div className="s-user-management-menu" aria-label="Share dialog menu list">
                    {props.children}
                </div>
            </ReactSelectComponents.MenuList>
        );
    },
);

export function InputRendered(props: InputProps): ReactElement {
    return (
        <div className="gd-share-dialog-input s-user-management-input">
            <ReactSelectComponents.Input {...props} />
        </div>
    );
}

export function SingleValueInputRenderer(props: InputProps): ReactElement {
    if (props.hasValue) {
        return null;
    }

    return (
        <div className="gd-share-dialog-input s-user-management-input">
            <ReactSelectComponents.Input {...props} />
        </div>
    );
}

function OptionContentRenderer(item: ISelectOption): ReactElement {
    if (isWorkspaceItem(item.value)) {
        return <> {item.value.title} </>;
    }
    return <> {item.label} </>;
}

export function ErrorOptionRenderer(errorOption: ISelectErrorOption): ReactElement {
    return (
        <div
            className="gd-share-dialog-option-error s-user-management-option-error"
            aria-label="Share dialog error"
        >
            <span className="gd-share-dialog-option-error-content">{errorOption.label}</span>
        </div>
    );
}

export function OptionRenderer(props: OptionProps<ISelectOption, false>): ReactElement {
    const { className, cx, isFocused, innerRef, innerProps, data } = props;

    if (isSelectErrorOption(data)) {
        return ErrorOptionRenderer(data);
    }

    const sTestStyle = isWorkspaceItem(data.value) ? getWorkspaceItemTestId(data.value) : "";

    const componentStyle = cx(
        {
            option: true,
            "option--is-focused": isFocused,
        },
        className,
    );

    return (
        <div ref={innerRef} className={`${componentStyle} ${sTestStyle}`} {...innerProps}>
            <div className="option-content">{OptionContentRenderer(data)}</div>
        </div>
    );
}

export function GroupHeadingRenderer(props: GroupHeadingProps): ReactElement {
    const { label } = props.data;
    return (
        <div className={"gd-share-dialog-select-group-heading"}>
            <Typography tagName="h3">{label}</Typography>
        </div>
    );
}
