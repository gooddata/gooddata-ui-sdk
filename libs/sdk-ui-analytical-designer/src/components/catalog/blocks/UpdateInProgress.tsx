// (C) 2019-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { Spinner } from "./Spinner.js";

export function UpdateInProgress() {
    return (
        <footer className="availability-spinner s-availability-spinner">
            <div>
                <Spinner />
                <FormattedMessage id="catalog.loading_availability" />
                &hellip;
            </div>
        </footer>
    );
}
