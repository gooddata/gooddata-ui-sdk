// (C) 2007-2025 GoodData Corporation

import {
    DialogComponent,
    dialogContentLoadingState,
    dialogDetailsLoadingState,
    dialogFullLoadingState,
    dialogFullyLoadedScrollState,
    dialogFullyLoadedState,
} from "./init.js";

export default {
    title: "18 Kda/Dialog/Normal",
};

export function DialogFullLoading() {
    return <DialogComponent state={dialogFullLoadingState} />;
}
DialogFullLoading.parameters = {
    kind: "full-featured",
};

export function DialogContentLoading() {
    return <DialogComponent state={dialogContentLoadingState} />;
}
DialogContentLoading.parameters = {
    kind: "full-featured",
};

export function DialogDetailsLoading() {
    return <DialogComponent state={dialogDetailsLoadingState} />;
}
DialogDetailsLoading.parameters = {
    kind: "full-featured",
};

export function DialogFullyLoaded() {
    return <DialogComponent state={dialogFullyLoadedState} />;
}
DialogFullyLoaded.parameters = {
    kind: "full-featured",
};

export function DialogFullyLoadedScrolls() {
    return <DialogComponent state={dialogFullyLoadedScrollState} />;
}
DialogFullyLoadedScrolls.parameters = {
    kind: "full-featured",
};
