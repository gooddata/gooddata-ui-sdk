// (C) 2007-2024 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage, injectIntl } from "react-intl";
import { Button, Overlay } from "@gooddata/sdk-ui-kit";
import { SearchOverlay, SearchOverlayProps } from "./SearchOverlay.js";
import { ISemanticSearchResultItemWithUrl } from "@gooddata/sdk-model";

const ALIGN_POINTS = [{ align: "br tr" }];

export type HeaderSearchButtonProps = SearchOverlayProps;

export const HeaderSearchButtonCore: React.FC<HeaderSearchButtonProps> = ({ onSelect, ...overlayProps }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const classNames = cx("gd-header-measure", "gd-header-button", "gd-header-search", { "is-open": isOpen });

    React.useEffect(() => {
        const shortcutHandler = (event: KeyboardEvent) => {
            if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
                setIsOpen(true);
            }
        };

        if (!isOpen) {
            document.addEventListener("keydown", shortcutHandler);
        }

        return () => {
            document.removeEventListener("keydown", shortcutHandler);
        };
    }, [isOpen]);

    const handleSelect = (item: ISemanticSearchResultItemWithUrl) => {
        onSelect(item);
        setIsOpen(false);
    };

    return (
        <Button
            title={overlayProps.intl.formatMessage({ id: "gs.header.search" })}
            className={classNames}
            onClick={() => setIsOpen(true)}
        >
            <span className="gd-icon-header-search"></span>
            <span className="gd-header-search-label">
                <FormattedMessage id="gs.header.search" />
            </span>
            {isOpen ? (
                <Overlay
                    isModal={false}
                    alignTo=".gd-header-search"
                    alignPoints={ALIGN_POINTS}
                    closeOnEscape
                    closeOnOutsideClick
                    closeOnParentScroll={false}
                    closeOnMouseDrag={false}
                    onClose={() => setIsOpen(false)}
                    ignoreClicksOnByClass={[".gd-bubble", ".gd-semantic-search__results-item"]}
                >
                    <div className="gd-dialog gd-dropdown overlay gd-header-search-dropdown">
                        <SearchOverlay onSelect={handleSelect} {...overlayProps} />
                    </div>
                </Overlay>
            ) : null}
        </Button>
    );
};

export const HeaderSearchButton = injectIntl(HeaderSearchButtonCore);
