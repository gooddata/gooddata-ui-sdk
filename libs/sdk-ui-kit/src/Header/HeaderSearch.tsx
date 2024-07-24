// (C) 2007-2024 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage, injectIntl, WrappedComponentProps } from "react-intl";
import { Button } from "../Button/index.js";
import { Overlay } from "../Overlay/index.js";

type HeaderSearchCoreProps = React.PropsWithChildren<{
    className?: string;
}>;

const ALIGN_POINTS = [{ align: "br tr" }];

export const HeaderSearchCore: React.FC<HeaderSearchCoreProps & WrappedComponentProps> = ({
    className,
    children,
    intl,
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const classNames = cx("gd-header-button", "gd-header-search", { "is-open": isOpen }, className);

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

    return (
        <Button
            title={intl.formatMessage({ id: "gs.header.search" })}
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
                >
                    <div className="gd-dialog gd-dropdown overlay gd-header-search-dropdown">{children}</div>
                </Overlay>
            ) : null}
        </Button>
    );
};

export const HeaderSearch = injectIntl(HeaderSearchCore);
