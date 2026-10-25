// (C) 2007-2026 GoodData Corporation

import { FormattedMessage, defineMessage } from "react-intl";
import { useSelector } from "react-redux";

import {
    ACCESS_DESIGNER_DENIED_ERROR,
    ACCESS_WORKBENCH_DENIED_ERROR,
    CREATE_REPORT_DENIED_ERROR,
    NOT_AUTHORIZED_ERROR,
    NO_PROJECT_AVAILABLE_ERROR,
    PROJECT_NOT_FOUND_ERROR,
} from "../constants/errors.js";
import { type IAnalyticalDesignerErrorProps } from "../embedding/slots.js";
import { getProjectId } from "../selectors/bootstrap_selector.js";
import { getErrorsState } from "../store/app_context/app_context_selectors.js";
import { type IAppState } from "../store/types.js";

export function Error() {
    const projectId = useSelector((state: IAppState) => getProjectId(state));
    const errors = useSelector((state: IAppState) => getErrorsState(state));

    const getErrorIds = (): { messageId: string; descriptionId: string } | null => {
        const error = errors[errors.length - 1];
        if (!error) {
            return null;
        }

        const errorType = error.type;

        switch (errorType) {
            case ACCESS_DESIGNER_DENIED_ERROR:
            case NOT_AUTHORIZED_ERROR:
            case CREATE_REPORT_DENIED_ERROR:
                return {
                    messageId: defineMessage({ id: "error.access.message" }).id,
                    descriptionId: defineMessage({ id: "error.access.description" }).id,
                };

            case ACCESS_WORKBENCH_DENIED_ERROR:
                return {
                    messageId: defineMessage({ id: "error.workspace.access.message" }).id,
                    descriptionId: defineMessage({ id: "error.workspace.access.description" }).id,
                };

            case PROJECT_NOT_FOUND_ERROR:
                return {
                    messageId: defineMessage({ id: "error.workspace.not_found.message" }).id,
                    descriptionId: defineMessage({ id: "error.workspace.not_found.description" }).id,
                };

            case NO_PROJECT_AVAILABLE_ERROR:
                return {
                    messageId: defineMessage({ id: "error.no_workspace_available.message" }).id,
                    descriptionId: defineMessage({ id: "error.no_workspace_available.description" }).id,
                };

            default:
                if (projectId) {
                    return {
                        messageId: defineMessage({ id: "error.general.workspace.message" }).id,
                        descriptionId: defineMessage({ id: "error.general.workspace.description" }).id,
                    };
                }
                return {
                    messageId: defineMessage({ id: "error.unknown.message" }).id,
                    descriptionId: defineMessage({ id: "error.unknown.description" }).id,
                };
        }
    };

    const errorIds = getErrorIds();

    return errorIds ? (
        <div className="main-error">
            <div className="adi-canvas-message s-canvas-message">
                <h2>
                    <FormattedMessage id={errorIds.messageId} values={{ projectId }} />
                </h2>
                <p>
                    <FormattedMessage id={errorIds.descriptionId} values={{ projectId }} />
                </p>
            </div>
        </div>
    ) : null;
}

/** AD's own error screen, the default of the Error slot inside AD. It reads the error from the store. */
export function MainError(_props: IAnalyticalDesignerErrorProps) {
    return <Error />;
}
