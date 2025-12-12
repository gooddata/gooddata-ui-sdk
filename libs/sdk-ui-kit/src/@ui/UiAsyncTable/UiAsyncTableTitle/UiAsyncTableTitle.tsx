// (C) 2025 GoodData Corporation

import { Fragment, type ReactNode, useCallback } from "react";

import { useIntl } from "react-intl";

import { Input } from "../../../Form/Input.js";
import { SeparatorLine } from "../../../SeparatorLine/SeparatorLine.js";
import { e } from "../asyncTableBem.js";
import { messages } from "../locales.js";
import { type UiAsyncTableTitleAction, type UiAsyncTableTitleProps } from "../types.js";
import { useAsyncTableSearch } from "../useAsyncTableSearch.js";

/**
 * @internal
 */
export function UiAsyncTableTitle({ title, onSearch, renderIcon, actions }: UiAsyncTableTitleProps) {
    const { renderIconWithWrapper, renderSearchWithWrapper, renderActionsWithWrapper } = useAsyncTableTitle(
        renderIcon,
        onSearch,
        actions,
    );

    return (
        <div className={e("title")}>
            <h1 className={e("title-text")}>{title}</h1>
            {renderIconWithWrapper()}
            <div className={e("title-divider")}>
                <SeparatorLine />
            </div>
            {renderSearchWithWrapper()}
            {renderActionsWithWrapper()}
        </div>
    );
}

const useAsyncTableTitle = (
    renderIcon?: () => ReactNode,
    onSearch?: (search: string) => void,
    actions?: Array<UiAsyncTableTitleAction>,
) => {
    const intl = useIntl();
    const { searchValue, setSearchValue } = useAsyncTableSearch(onSearch);

    const renderIconWithWrapper = useCallback(() => {
        return renderIcon ? <div className={e("title-icon")}>{renderIcon()}</div> : null;
    }, [renderIcon]);

    const renderSearchWithWrapper = useCallback(() => {
        const placeholder = intl.formatMessage(messages["titleSearchPlaceholder"]);
        return onSearch ? (
            <div className={e("title-search")}>
                <Input
                    isSearch
                    type="search"
                    clearOnEsc
                    placeholder={placeholder}
                    accessibilityConfig={{
                        ariaLabel: placeholder,
                    }}
                    value={searchValue}
                    onChange={(value) => setSearchValue(String(value))}
                />
            </div>
        ) : null;
    }, [onSearch, intl, searchValue, setSearchValue]);

    const renderActionsWithWrapper = useCallback(() => {
        return actions ? (
            <div key="actions" className={e("title-actions")}>
                {actions.map((action, index) => (
                    <Fragment key={index}>{action.renderAction()}</Fragment>
                ))}
            </div>
        ) : null;
    }, [actions]);

    return {
        renderIconWithWrapper,
        renderSearchWithWrapper,
        renderActionsWithWrapper,
    };
};
