// (C) 2007-2022 GoodData Corporation
import "isomorphic-fetch";
import fetchMock from "fetch-mock";
import noop from "lodash/noop";
import range from "lodash/range";
import {
    ProjectModule,
    IProjectConfigSettingItem,
    IProjectConfigResponse,
    DEFAULT_PALETTE,
} from "../project";
import { ApiError, XhrModule } from "../xhr";
import { mockPollingRequest } from "./utils/polling";
import { IColorPalette, IFeatureFlags } from "../interfaces";
import { IStyleSettingsResponse, IFeatureFlagsResponse } from "../apiResponsesInterfaces";

const createProject = () => new ProjectModule(new XhrModule(fetch, {}));

type ICustomCheck = (options: any) => void;

describe("project", () => {
    describe("with fake server", () => {
        afterEach(() => {
            fetchMock.restore();
        });

        describe("getProjects", () => {
            const generateProjects = (n: number) => {
                return range(1, n + 1).map((i: number) => ({ project: { meta: { title: `p${i}` } } }));
            };

            it("should reject with 400 when resource fails", () => {
                fetchMock.mock("/gdc/account/profile/myProfileId/projects?offset=0&limit=100", 400);
                return createProject()
                    .getProjects("myProfileId")
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });
            it("should return an array of projects", () => {
                fetchMock.mock("/gdc/account/profile/myProfileId/projects?offset=0&limit=100", {
                    status: 200,
                    body: JSON.stringify({
                        projects: {
                            paging: {
                                offset: 0,
                                limit: 100,
                                totalCount: 2,
                            },
                            items: generateProjects(2),
                        },
                    }),
                });
                return createProject()
                    .getProjects("myProfileId")
                    .then((result: any) => {
                        expect(result.length).toBe(2);
                        expect(result[1].meta.title).toBe("p2");
                    });
            });
            it("should fetch all pages of data with projects", () => {
                fetchMock.mock("/gdc/account/profile/myProfileId/projects?offset=0&limit=100", {
                    status: 200,
                    body: JSON.stringify({
                        projects: {
                            paging: {
                                offset: 0,
                                limit: 100,
                                totalCount: 150,
                            },
                            items: generateProjects(100),
                        },
                    }),
                });
                fetchMock.mock("/gdc/account/profile/myProfileId/projects?offset=100&limit=100", {
                    status: 200,
                    body: JSON.stringify({
                        projects: {
                            paging: {
                                offset: 0,
                                limit: 100,
                                totalCount: 150,
                            },
                            items: generateProjects(50),
                        },
                    }),
                });
                return createProject()
                    .getProjects("myProfileId")
                    .then((result: any) => {
                        expect(result.length).toBe(150);
                    });
            });
        });

        describe("getDatasets", () => {
            it("should reject with 400 when resource fails", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/query/datasets", 400);
                return createProject()
                    .getDatasets("myFakeProjectId")
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });

            it("should return an array of dataSets", () => {
                fetchMock.mock("/gdc/md/myFakeProjectId/query/datasets", {
                    status: 200,
                    body: JSON.stringify({ query: { entries: [{}, {}] } }),
                });
                return createProject()
                    .getDatasets("myFakeProjectId")
                    .then((result: any) => {
                        expect(result.length).toBe(2);
                    });
            });
        });

        describe("getColorPalette", () => {
            it("should reject with 400 when resource fails", () => {
                fetchMock.mock("/gdc/projects/myFakeProjectId/styleSettings", 400);
                return createProject()
                    .getColorPalette("myFakeProjectId")
                    .then(null, (err: any) => expect(err).toBeInstanceOf(ApiError));
            });
            it("should return an array of color objects in the right order", () => {
                fetchMock.mock("/gdc/projects/myFakeProjectId/styleSettings", {
                    status: 200,
                    body: JSON.stringify({
                        styleSettings: {
                            chartPalette: [
                                { guid: "guid1", fill: { r: 1, b: 1, g: 1 } },
                                { guid: "guid2", fill: { r: 2, b: 2, g: 2 } },
                            ],
                        },
                    }),
                });
                return createProject()
                    .getColorPalette("myFakeProjectId")
                    .then((result: any) => {
                        expect(result.length).toBe(2);
                        expect(result[0].r).toBe(1);
                        expect(result[1].r).toBe(2);
                    });
            });
            it("should return something when no response from styleSettings", () => {
                fetchMock.mock("/gdc/projects/myFakeProjectId/styleSettings", {
                    status: 200,
                });
                return createProject()
                    .getColorPalette("myFakeProjectId")
                    .then((result: any) => {
                        expect(result.length).toBe(DEFAULT_PALETTE.length);
                    });
            });
        });

        describe("getColorPaletteWithGuids", () => {
            it("should reject with 400 when resource fails", () => {
                fetchMock.mock("/gdc/projects/myFakeProjectId/styleSettings", 400);
                return createProject()
                    .getColorPaletteWithGuids("myFakeProjectId")
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });
            it("should return an array of color objects in the right order", () => {
                const chartPalette: IColorPalette = [
                    { guid: "guid1", fill: { r: 1, b: 1, g: 1 } },
                    { guid: "guid2", fill: { r: 2, b: 2, g: 2 } },
                ];

                const mockResponse: IStyleSettingsResponse = {
                    styleSettings: {
                        chartPalette,
                    },
                };

                fetchMock.mock("/gdc/projects/myFakeProjectId/styleSettings", {
                    status: 200,
                    body: JSON.stringify(mockResponse),
                });

                return createProject()
                    .getColorPaletteWithGuids("myFakeProjectId")
                    .then((result?: IColorPalette) => {
                        expect(result).not.toBeUndefined();
                        if (result) {
                            expect(result.length).toBe(2);
                            expect(result[0]).toEqual(chartPalette[0]);
                            expect(result[1]).toEqual(chartPalette[1]);
                        }
                    });
            });
            it("should return undefined when resource is empty", () => {
                fetchMock.mock("/gdc/projects/myFakeProjectId/styleSettings", {
                    status: 200,
                });

                return createProject()
                    .getColorPaletteWithGuids("myFakeProjectId")
                    .then((result?: IColorPalette) => {
                        expect(result).toEqual(undefined);
                    });
            });
        });

        describe("setColorPalette", () => {
            it("should reject with 400 when resource fails", () => {
                fetchMock.mock("/gdc/projects/myFakeProjectId/styleSettings", 400);
                return createProject()
                    .setColorPalette("myFakeProjectId", [])
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });
        });

        describe("getCurrentProjectId", () => {
            it("should resolve with project id", () => {
                fetchMock.mock("/gdc/app/account/bootstrap/projectId", {
                    status: 200,
                    body: JSON.stringify({
                        projectId: "project_hash",
                    }),
                });

                return createProject()
                    .getCurrentProjectId()
                    .then((result: any) => {
                        expect(result).toBe("project_hash");
                    });
            });

            it("should resolve with null if current project not set", () => {
                fetchMock.mock("/gdc/app/account/bootstrap/projectId", {
                    status: 200,
                    body: JSON.stringify({
                        projectId: null,
                    }),
                });

                return createProject()
                    .getCurrentProjectId()
                    .then((result: any) => {
                        expect(result).toBe(null);
                    });
            });
        });

        describe("getTimezone", () => {
            it("should return timezone using its own api", () => {
                const timezoneApiUrl = "/gdc/app/projects/prjId/timezone";
                const timezoneMock = {
                    id: "Europe/Prague",
                    displayName: "Central European Time",
                    currentOffsetMs: 3600000,
                };

                fetchMock.mock(timezoneApiUrl, {
                    status: 200,
                    body: JSON.stringify({ timezone: timezoneMock }),
                });

                return createProject()
                    .getTimezone("prjId")
                    .then((timezone: any) => {
                        expect(timezone).toEqual(timezoneMock);
                    });
            });
        });

        describe("setTimezone", () => {
            it("should save project timezone", () => {
                const timezoneUrl = "/gdc/md/prjId/service/timezone";
                const responseJSON = {
                    service: { timezone: "Europe/Prague" },
                };

                fetchMock.post(timezoneUrl, {
                    status: 200,
                    body: JSON.stringify(responseJSON),
                });

                const timezoneMock = {
                    id: "Europe/Prague",
                    displayName: "Central European Time",
                    currentOffsetMs: 3600000,
                };

                return createProject()
                    .setTimezone("prjId", timezoneMock)
                    .then((response: any) => {
                        expect(response).toEqual(responseJSON);
                    });
            });
        });

        describe("createProject", () => {
            const mockProject = (state: any) => ({
                project: {
                    content: {
                        state,
                    },
                },
            });

            const createdProject = mockProject("ENABLED");
            const pendingProject = mockProject("PREPARING");
            const deletedProject = mockProject("DELETED");
            const projectUri = "/gdc/projects/1";
            const createProjectResponse = {
                uri: projectUri,
            };

            describe("/gdc/projects call successful", () => {
                function mockInitialPost(customCheck: ICustomCheck = noop) {
                    fetchMock.post("/gdc/projects", (_, options) => {
                        customCheck(options);
                        return {
                            status: 200,
                            body: JSON.stringify(createProjectResponse),
                        };
                    });
                }

                it("should preset default values", () => {
                    mockInitialPost((options) => {
                        const params = JSON.parse(options.body);
                        expect(params.project.content.guidedNavigation).toEqual(1);
                        expect(params.project.content.driver).toEqual("Pg");
                        expect(params.project.content.environment).toEqual("TESTING");
                    });

                    fetchMock.mock(projectUri, {
                        status: 200,
                        body: JSON.stringify(createdProject),
                    });

                    return createProject()
                        .createProject("Project", "1234")
                        .then((result: any) => {
                            expect(result).toEqual(createdProject);
                        });
                });

                it("should not poll for created project when enabled immediately", () => {
                    mockInitialPost();
                    fetchMock.mock(projectUri, {
                        status: 200,
                        body: JSON.stringify(createdProject),
                    });

                    return createProject()
                        .createProject("Project", "1234")
                        .then((result: any) => {
                            expect(result).toEqual(createdProject);
                        });
                });

                it("should resolve and stop polling if created project ends in deleted state", () => {
                    mockInitialPost();
                    fetchMock.mock(projectUri, {
                        status: 200,
                        body: JSON.stringify(deletedProject),
                    });

                    return createProject()
                        .createProject("Project", "1234")
                        .then((result: any) => {
                            expect(result).toEqual(deletedProject);
                        });
                });

                it("should poll until project status is ENABLED", () => {
                    mockInitialPost();

                    mockPollingRequest(projectUri, pendingProject, createdProject);

                    return createProject()
                        .createProject("Project", "1234", { pollStep: 1 })
                        .then((result: any) => {
                            expect(result).toEqual(createdProject);
                        });
                });

                it("should reject if maximum polling attempts reached", () => {
                    mockInitialPost();

                    mockPollingRequest(projectUri, pendingProject, createdProject);

                    const options = { pollStep: 1, maxAttempts: 1 };
                    return createProject()
                        .createProject("Project", "1234", options)
                        .then(
                            () => {
                                throw new Error("Should reject the promise if create project ended with 400");
                            },
                            (err: any) => {
                                expect(err).toBeInstanceOf(Error);
                            },
                        );
                });
            });

            describe("/gdc/projects call not successful", () => {
                it("should reject if create dashboard call fails", () => {
                    fetchMock.post("/gdc/projects", {
                        status: 400,
                        body: JSON.stringify({}),
                    });

                    return createProject()
                        .createProject("Project", "1234")
                        .then(
                            () => {
                                throw new Error("Should reject the promise if create project ended with 400");
                            },
                            (err: any) => {
                                expect(err).toBeInstanceOf(Error);
                            },
                        );
                });
            });
        });

        describe("deleteProject", () => {
            it("should delete project", () => {
                const projectId = "myFakeProjectId";

                fetchMock.delete(`/gdc/projects/${projectId}`, 200);

                return createProject()
                    .deleteProject(projectId)
                    .then((r: any) => expect(r.response.ok).toBeTruthy());
            });
        });

        describe("getFeatureFlags", () => {
            it("should reject with 400 when resource fails", () => {
                fetchMock.mock("/gdc/app/projects/myFakeProjectId/featureFlags", 400);
                return createProject()
                    .getFeatureFlags("myFakeProjectId")
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });
            it("should return feature flags for given project", () => {
                const featureFlags: IFeatureFlags = {
                    flag1: true,
                    flag2: true,
                };

                const mockResponse: IFeatureFlagsResponse = {
                    featureFlags,
                };

                fetchMock.mock("/gdc/app/projects/myFakeProjectId/featureFlags", {
                    status: 200,
                    body: JSON.stringify(mockResponse),
                });

                return createProject()
                    .getFeatureFlags("myFakeProjectId")
                    .then((result: IFeatureFlags) => {
                        expect(result).toEqual(featureFlags);
                    });
            });
        });

        describe("getConfig", () => {
            it("should reject with 400 when resource fails", () => {
                fetchMock.mock("/gdc/app/projects/myFakeProjectId/config", 400);
                return createProject()
                    .getConfig("myFakeProjectId")
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });

            it("should return feature flags for given project", () => {
                const items: IProjectConfigSettingItem[] = [
                    {
                        settingItem: {
                            key: "enablePivot",
                            value: "true",
                            source: "project",
                            links: {
                                self: "/gdc/projects/kytra720hke4d84e8ozohoz7uycn53mi/config/enablePivot",
                            },
                        },
                    },
                    {
                        settingItem: {
                            key: "enablePivotGrouping",
                            value: "false",
                            source: "catalog",
                            links: {
                                self: "/gdc/projects/kytra720hke4d84e8ozohoz7uycn53mi/config/enablePivotGrouping",
                            },
                        },
                    },
                ];

                const mockResponse: IProjectConfigResponse = {
                    settings: {
                        items,
                    },
                };

                fetchMock.mock("/gdc/app/projects/myFakeProjectId/config", {
                    status: 200,
                    body: JSON.stringify(mockResponse),
                });

                return createProject()
                    .getConfig("myFakeProjectId")
                    .then((result: IProjectConfigSettingItem[]) => {
                        expect(result).toEqual(items);
                    });
            });
        });

        describe("getProjectFeatureFlags", () => {
            const items: IProjectConfigSettingItem[] = [
                {
                    settingItem: {
                        key: "enablePivot",
                        value: "true",
                        source: "project",
                        links: {
                            self: "/gdc/projects/kytra720hke4d84e8ozohoz7uycn53mi/config/enablePivot",
                        },
                    },
                },
                {
                    settingItem: {
                        key: "enablePivotGrouping",
                        value: "false",
                        source: "project",
                        links: {
                            self: "/gdc/projects/kytra720hke4d84e8ozohoz7uycn53mi/config/enablePivotGrouping",
                        },
                    },
                },
                {
                    settingItem: {
                        key: "testNumber",
                        value: "123",
                        source: "catalog",
                        links: {
                            self: "/gdc/projects/kytra720hke4d84e8ozohoz7uycn53mi/config/testNumber",
                        },
                    },
                },
                {
                    settingItem: {
                        key: "testString",
                        value: "abrakadabra",
                        source: "catalog",
                        links: {
                            self: "/gdc/projects/kytra720hke4d84e8ozohoz7uycn53mi/config/testString",
                        },
                    },
                },
            ];

            const mockResponse: IProjectConfigResponse = {
                settings: {
                    items,
                },
            };

            it("should reject with 400 when resource fails", () => {
                fetchMock.mock("/gdc/app/projects/nonExistingProject/config", 400);

                return createProject()
                    .getProjectFeatureFlags("nonExistingProject")
                    .then(null, (err: any) => expect(err).toBeInstanceOf(Error));
            });

            it("should return feature flags for given project", () => {
                fetchMock.mock("/gdc/app/projects/myFakeProjectId/config", {
                    status: 200,
                    body: JSON.stringify(mockResponse),
                });

                const expectedFeatureFlags: IFeatureFlags = {
                    enablePivot: true,
                    enablePivotGrouping: false,
                    testNumber: 123,
                    testString: "abrakadabra",
                };
                return createProject()
                    .getProjectFeatureFlags("myFakeProjectId")
                    .then((result: IFeatureFlags) => {
                        expect(result).toEqual(expectedFeatureFlags);
                    });
            });

            it("should return feature flags for given project filtered by source", () => {
                fetchMock.mock("/gdc/app/projects/myFakeProjectId/config", {
                    status: 200,
                    body: JSON.stringify(mockResponse),
                });
                const expectedFeatureFlags: IFeatureFlags = {
                    enablePivot: true,
                    enablePivotGrouping: false,
                };
                return createProject()
                    .getProjectFeatureFlags("myFakeProjectId", "project")
                    .then((result: IFeatureFlags) => {
                        expect(result).toEqual(expectedFeatureFlags);
                    });
            });
        });
    });
});
