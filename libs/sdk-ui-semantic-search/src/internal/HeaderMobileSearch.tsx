// (C) 2007-2024 GoodData Corporation
import * as React from "react";
import { HeaderSearchButtonCoreProps, HeaderSearchButtonProps } from "./HeaderSearchButton.js";
import { SearchOverlay } from "./SearchOverlay.js";
import { MetadataTimezoneProvider } from "./metadataTimezoneContext.js";
import { injectIntl } from "react-intl";
import { IntlWrapper } from "@gooddata/sdk-ui";

const HeaderMobileSearchCore: React.FC<HeaderSearchButtonCoreProps> = ({
    onSelect,
    metadataTimezone,
    ...overlayProps
}) => {
    return (
        <MetadataTimezoneProvider value={metadataTimezone}>
            <SearchOverlay
                onSelect={onSelect}
                className="gd-semantic-search__overlay--mobile"
                {...overlayProps}
            />
        </MetadataTimezoneProvider>
    );
};

const HeaderMobileSearchWithIntl = injectIntl(HeaderMobileSearchCore);

/**
 * A version of the search overlay that is optimized for mobile devices.
 * @internal
 */
export const HeaderMobileSearch = ({ locale, ...props }: HeaderSearchButtonProps) => (
    <IntlWrapper locale={locale}>
        <HeaderMobileSearchWithIntl {...props} />
    </IntlWrapper>
);
