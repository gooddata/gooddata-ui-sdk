// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiButton } from "@gooddata/sdk-ui-kit";

import { catalogDetailActionShare } from "../../automation/testIds.js";

import { shareMessages } from "./messages.js";

/**
 * @internal
 */
export interface IShareButtonProps {
    onClick: () => void;
    isDisabled?: boolean;
}

/**
 * Catalog detail header trigger for the share dialog. Rendered in the
 * `CatalogDetailActions` slot, immediately before the primary "Open" button.
 *
 * @internal
 */
export function ShareButton({ onClick, isDisabled }: IShareButtonProps) {
    const intl = useIntl();
    return (
        <UiButton
            label={intl.formatMessage(shareMessages.shareButton)}
            variant="secondary"
            onClick={onClick}
            isDisabled={isDisabled}
            dataTestId={catalogDetailActionShare}
        />
    );
}
