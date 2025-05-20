// // (C) 2021-2025 GoodData Corporation
// import { SagaIterator } from "redux-saga";
// import { call, put, select } from "redux-saga/effects";
// import { IDashboardExportImageOptions, IExportResult } from "@gooddata/sdk-backend-spi";
// import { ObjRef } from "@gooddata/sdk-model";

// import { DashboardContext } from "../../types/commonTypes.js";
// import { ExportDashboardToImage } from "../../commands/index.js";
// import {
//     DashboardExportToImageResolved,
//     dashboardExportToImageRequested,
//     dashboardExportToImageResolved,
// } from "../../events/dashboard.js";
// import { selectDashboardRef } from "../../store/meta/metaSelectors.js";
// import { invalidArgumentsProvided } from "../../events/general.js";
// import { PromiseFnReturnType } from "../../types/sagas.js";

// function exportDashboardToImage(
//     ctx: DashboardContext,
//     dashboardRef: ObjRef,
//     options?: IDashboardExportImageOptions,
// ): Promise<IExportResult> {
//     const { backend, workspace } = ctx;
//     return backend.workspace(workspace).dashboards().exportDashboardToImage(dashboardRef, {
//         widgetIds: options?.widgetIds,
//         filename: options?.filename,
//     });
// }

// export function* exportDashboardToImageHandler(
//     ctx: DashboardContext,
//     cmd: ExportDashboardToImage,
// ): SagaIterator<DashboardExportToImageResolved> {
//     yield put(dashboardExportToImageRequested(ctx, cmd.correlationId));

//     const dashboardRef = yield select(selectDashboardRef);
//     if (!dashboardRef) {
//         throw invalidArgumentsProvided(ctx, cmd, "Dashboard to export to image must have an ObjRef.");
//     }

//     const result: PromiseFnReturnType<typeof exportDashboardToImage> = yield call(
//         exportDashboardToImage,
//         ctx,
//         dashboardRef,
//         {
//             widgetIds: cmd.payload.widgetIds,
//             filename: cmd.payload.filename,
//         },
//     );

//     // prepend hostname if provided so that the results are downloaded from there, not from where the app is hosted
//     const fullUri = ctx.backend.config.hostname
//         ? new URL(result.uri, ctx.backend.config.hostname).href
//         : result.uri;

//     const sanitizedResult: IExportResult = {
//         ...result,
//         uri: fullUri,
//     };

//     return dashboardExportToImageResolved(ctx, sanitizedResult, cmd.correlationId);
// }
