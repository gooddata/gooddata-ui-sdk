// (C) 2007-2024 GoodData Corporation
import * as React from "react";
import { HeaderSearchButtonProps } from "./HeaderSearchButton.js";
import { SearchOverlay } from "./SearchOverlay.js";
import { TimezoneProvider } from "./timezoneContext.js";
import { injectIntl } from "react-intl";

const HeaderMobileSearchCore: React.FC<HeaderSearchButtonProps> = ({
    onSelect,
    metadataTimezone,
    ...overlayProps
}) => {
    return (
        <TimezoneProvider value={metadataTimezone}>
            <SearchOverlay
                onSelect={onSelect}
                className="gd-semantic-search__overlay--mobile"
                {...overlayProps}
            />
        </TimezoneProvider>
    );
};

/**
 * A version of the search overlay that is optimized for mobile devices.
 * @internal
 */
export const HeaderMobileSearch = injectIntl(HeaderMobileSearchCore);
