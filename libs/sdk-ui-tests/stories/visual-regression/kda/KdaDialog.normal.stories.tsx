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
import { IStoryParameters } from "../../_infra/backstopScenario.js";

export default {
    title: "18 Kda/Dialog/Normal",
};

export function DialogFullLoading() {
    return <DialogComponent state={dialogFullLoadingState} />;
}
DialogFullLoading.parameters = {
    kind: "full-featured",
} satisfies IStoryParameters;

export function DialogContentLoading() {
    return <DialogComponent state={dialogContentLoadingState} />;
}
DialogContentLoading.parameters = {
    kind: "full-featured",
} satisfies IStoryParameters;

export function DialogDetailsLoading() {
    return <DialogComponent state={dialogDetailsLoadingState} />;
}
DialogDetailsLoading.parameters = {
    kind: "full-featured",
} satisfies IStoryParameters;

export function DialogFullyLoaded() {
    return <DialogComponent state={dialogFullyLoadedState} />;
}
DialogFullyLoaded.parameters = {
    kind: "full-featured",
} satisfies IStoryParameters;

export function DialogFullyLoadedSmall() {
    return <DialogComponent state={dialogFullyLoadedSmallState} />;
}
DialogFullyLoadedSmall.parameters = {
    kind: "full-featured",
} satisfies IStoryParameters;

export function DialogFullyLoadedScrolls() {
    return <DialogComponent state={dialogFullyLoadedScrollState} />;
}
DialogFullyLoadedScrolls.parameters = {
    kind: "full-featured",
} satisfies IStoryParameters;
