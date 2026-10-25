// (C) 2022-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

export function CancelButton({ onClick }: { onClick: () => void }) {
    const intl = useIntl();
    const cancelText = intl.formatMessage({ id: "cancel" });
    return (
        <Button
            className="gd-button-secondary gd-button-small s-date-filter-cancel"
            onClick={onClick}
            value={cancelText}
            title={cancelText}
        />
    );
}
