// (C) 2018 GoodData Corporation
import { VisualizationObject } from "@gooddata/gd-bear-model";
import { DataLayer } from "@gooddata/gd-bear-client";

const {
    Uri: { isUri },
} = DataLayer;

export const getQualifierObject = (qualifierString: string): VisualizationObject.ObjQualifier =>
    isUri(qualifierString)
        ? {
              uri: qualifierString,
          }
        : {
              identifier: qualifierString,
          };
