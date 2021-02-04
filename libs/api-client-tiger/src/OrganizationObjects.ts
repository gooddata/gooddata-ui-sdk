// (C) 2019-2021 GoodData Corporation
import { AxiosInstance } from "axios";
import {
    OrganizationModelControllerApi,
    OrganizationModelControllerApiInterface,
} from "./generated/metadata-json-api";

export const tigerOrganizationObjectsClientFactory = (
    axios: AxiosInstance,
): OrganizationModelControllerApiInterface => new OrganizationModelControllerApi({}, "", axios);
