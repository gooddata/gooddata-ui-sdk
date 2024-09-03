// (C) 2024 GoodData Corporation
import * as React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { Overlay } from "../Overlay/index.js";
import { Button } from "../Button/index.js";
import { useHeaderSearch } from "./headerSearchContext.js";

export type HeaderSearchProps = React.PropsWithChildren<{
    /**
     * Button title.
     */
    title: string;
}>;

const ALIGN_POINTS = [{ align: "br tr" }];

export const HeaderSearchButton: React.FC<HeaderSearchProps> = ({ children, title }) => {
    const { isOpen, toggleOpen } = useHeaderSearch();

    // Handle Cmd+K and Ctrl+K shortcuts
    React.useEffect(() => {
        const shortcutHandler = (event: KeyboardEvent) => {
            if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
                toggleOpen();
            }
        };

        if (!isOpen) {
            document.addEventListener("keydown", shortcutHandler);
        }

        return () => {
            document.removeEventListener("keydown", shortcutHandler);
        };
    }, [isOpen, toggleOpen]);

    const classNames = cx("gd-header-measure", "gd-header-button", "gd-header-search", {
        "is-open": isOpen,
    });

    return (
        <Button title={title} className={classNames} onClick={toggleOpen}>
            <span className="gd-icon-header-search-button"></span>
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
                    onClose={toggleOpen}
                    ignoreClicksOnByClass={[".gd-bubble"]}
                >
                    <div className="gd-dialog gd-dropdown overlay gd-header-search-dropdown">{children}</div>
                </Overlay>
            ) : null}
        </Button>
    );
};
