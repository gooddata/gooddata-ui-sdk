// (C) 2007-2025 GoodData Corporation

import {
    DialogComponent,
    dialogContentLoadingState,
    dialogDetailsLoadingState,
    dialogFullLoadingState,
    dialogFullyLoadedScrollState,
    dialogFullyLoadedSmallState,
    dialogFullyLoadedState,
} from "./init.js";
import { wrapWithTheme } from "../themeWrapper.js";

export default {
    title: "18 Kda/Dialog/Themed",
};

export const DialogFullLoading = () => wrapWithTheme(<DialogComponent state={dialogFullLoadingState} />);
DialogFullLoading.parameters = {
    kind: "themed",
};

export const DialogContentLoading = () =>
    wrapWithTheme(<DialogComponent state={dialogContentLoadingState} />);
DialogContentLoading.parameters = {
    kind: "themed",
};

export const DialogDetailsLoading = () =>
    wrapWithTheme(<DialogComponent state={dialogDetailsLoadingState} />);
DialogDetailsLoading.parameters = {
    kind: "themed",
};

export const DialogFullyLoaded = () => wrapWithTheme(<DialogComponent state={dialogFullyLoadedState} />);
DialogFullyLoaded.parameters = {
    kind: "themed",
};

export function DialogFullyLoadedSmall() {
    return <DialogComponent state={dialogFullyLoadedSmallState} />;
}
DialogFullyLoadedSmall.parameters = {
    kind: "full-featured",
};

export const DialogFullyLoadedScrolls = () =>
    wrapWithTheme(<DialogComponent state={dialogFullyLoadedScrollState} />);
DialogFullyLoadedScrolls.parameters = {
    kind: "themed",
};
