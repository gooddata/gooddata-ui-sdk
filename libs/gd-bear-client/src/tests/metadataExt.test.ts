// (C) 2020 GoodData Corporation
import { updateContent, createTranslator } from "../metadataExt";
import * as fixtures from "./metadataExt.fixtures";

const analyticalDashboard1 = fixtures.analyticalDashboard1;
const analyticalDashboard2 = fixtures.analyticalDashboard2;
const filterContext = "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/1999";

describe("updateContent", () => {
    it("should return body with different kpi, visualization widget reference and filter context reference", () => {
        const visWidgetMap = new Map();
        const kpiMap = new Map();
        visWidgetMap.set(
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/12713",
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/1998",
        );
        kpiMap.set(
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/12570",
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/1997",
        );
        const uriTranslator = createTranslator(kpiMap, visWidgetMap);
        return expect(updateContent(analyticalDashboard1, uriTranslator, filterContext)).toEqual(
            fixtures.body1,
        );
    });

    it("should return body with same kpi and different filter context, visualization widget reference", () => {
        const visWidgetMap = new Map();
        const kpiMap = new Map();
        visWidgetMap.set(
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/12713",
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/1998",
        );
        kpiMap.set(
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/12570",
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/12570",
        );
        const uriTranslator = createTranslator(kpiMap, visWidgetMap);
        return expect(updateContent(analyticalDashboard1, uriTranslator, filterContext)).toEqual(
            fixtures.body2,
        );
    });

    it("should return body with different kpi reference and no visualization widget", () => {
        const visWidgetMap = new Map();
        const kpiMap = new Map();
        kpiMap.set(
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/12570",
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/1997",
        );
        const uriTranslator = createTranslator(kpiMap, visWidgetMap);
        return expect(updateContent(analyticalDashboard2, uriTranslator, filterContext)).toEqual(
            fixtures.body3,
        );
    });

    it("should return body with multiple different kpis and visualization widgets", () => {
        const visWidgetMap = new Map();
        const kpiMap = new Map();
        kpiMap.set(
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/13011",
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/2000",
        );
        kpiMap.set(
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/12954",
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/2003",
        );
        visWidgetMap.set(
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/12956",
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/2001",
        );
        visWidgetMap.set(
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/13012",
            "/gdc/md/mbuumy476p78ybcceiru61hcyr8i8lo8/obj/2002",
        );
        const uriTranslator = createTranslator(kpiMap, visWidgetMap);
        return expect(updateContent(fixtures.analyticalDashboard3, uriTranslator, filterContext)).toEqual(
            fixtures.body4,
        );
    });
});
