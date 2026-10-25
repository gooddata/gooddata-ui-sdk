// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { cloneDeep } from "lodash-es";
import { useDispatch, useSelector } from "react-redux";

import { type ITheme } from "@gooddata/sdk-model";
import { WorkspaceProvider } from "@gooddata/sdk-ui";
import {
    OverlayController,
    OverlayControllerProvider,
    ToastsCenterContextProvider,
} from "@gooddata/sdk-ui-kit";
import { ThemeProvider } from "@gooddata/sdk-ui-theme-provider";

import { useAppMode } from "../appMode/appMode.js";
import { MainLoading, renderSlot, useAdSlots } from "../embedding/slots.js";
import { registerCommands, unregisterCommands } from "../postMessageApi/incoming/register.js";
import { rootSelector } from "../selectors/root_selector.js";
import { themeSelector } from "../selectors/theme_selector.js";
import { type AppDispatch } from "../store/types.js";

import { MainError } from "./Error.js";
import { ExportPdfDialog } from "./ExportPdfDialog.js";
import { RootDom } from "./RootDom.js";

const overlayController = OverlayController.getInstance();

export function Root() {
    const dispatch = useDispatch<AppDispatch>();
    const {
        errors,
        isAppReady,
        isEmbedded,
        workspace,
        isConfirmUnsavedChangesDialogVisible,
        isReportChanging,
        isMetricEditorUnsaved,
    } = useSelector(rootSelector);
    const { isHostedComponent } = useAppMode();
    const themeFromState = useSelector(themeSelector);
    const slots = useAdSlots();

    // Use refs to access current props in stable callbacks
    const propsRef = useRef({
        isReportChanging,
        isConfirmUnsavedChangesDialogVisible,
        isMetricEditorUnsaved,
    });

    useEffect(() => {
        propsRef.current = {
            isReportChanging,
            isConfirmUnsavedChangesDialogVisible,
            isMetricEditorUnsaved,
        };
    });

    const handleWindowClose = useCallback((e: BeforeUnloadEvent) => {
        const { isReportChanging, isConfirmUnsavedChangesDialogVisible, isMetricEditorUnsaved } =
            propsRef.current;

        if ((isReportChanging && !isConfirmUnsavedChangesDialogVisible) || isMetricEditorUnsaved) {
            e.preventDefault();
            e.returnValue = "";
        }
    }, []);

    useLayoutEffect(() => {
        // Hosted-component mode must never register the postMessage listener: registerCommands
        // writes to the messagingUtils singleton shared with the host's own embedded API, and
        // commands arrive through the host adapter instead.
        if (isEmbedded && !isHostedComponent) {
            registerCommands(dispatch);
        }
    }, [dispatch, isEmbedded, isHostedComponent]);

    useEffect(() => {
        window.addEventListener("beforeunload", handleWindowClose);

        return () => {
            window.removeEventListener("beforeunload", handleWindowClose);
        };
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty deps - register once on mount

    useEffect(() => {
        return () => {
            if (isEmbedded && !isHostedComponent) {
                unregisterCommands();
            }
        };
    }, [isEmbedded, isHostedComponent]);

    const renderContent = () => {
        if (errors.length > 0) {
            return renderSlot(slots.Error, MainError, { error: errors[errors.length - 1] });
        }

        if (workspace) {
            return (
                <OverlayControllerProvider overlayController={overlayController}>
                    <WorkspaceProvider workspace={workspace}>
                        <ThemeProvider
                            theme={themeFromState}
                            enableComplementaryPalette={false}
                            modifier={defaultAnalyticalDesignerThemeModifier}
                        >
                            <ToastsCenterContextProvider>
                                <RootDom isReady={isAppReady} />
                                <ExportPdfDialog />
                            </ToastsCenterContextProvider>
                        </ThemeProvider>
                    </WorkspaceProvider>
                </OverlayControllerProvider>
            );
        }

        return renderSlot(slots.Loading, MainLoading, {});
    };

    return <div className="ad-root-wrapper--pluggable">{renderContent()}</div>;
}

const defaultAnalyticalDesignerThemeModifier = (theme: ITheme): ITheme => {
    if (theme?.dashboards) {
        const themeWithOutDashboard = cloneDeep(theme);
        // we do not want dashboard theme settings
        themeWithOutDashboard.dashboards = undefined;

        return themeWithOutDashboard;
    }

    return theme;
};
