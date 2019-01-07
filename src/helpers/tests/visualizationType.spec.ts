// (C) 2007-2018 GoodData Corporation
import { VisualizationTypes } from '../../constants/visualizationTypes';
import { getVisualizationTypeFromVisualizationClass, getVisualizationTypeFromUrl } from '../visualizationType';
import { factory as createSdk, SDK } from '@gooddata/gooddata-js';

describe('getVisualizationTypeFromUrl', () => {
    it('should be undefined if uri leads to external src', () => {
        expect(getVisualizationTypeFromUrl('loremipsum.com/CDN/index.js')).toBeNull();
    });
    it('should be BAR if uri is local:bar', () => {
        expect(getVisualizationTypeFromUrl('local:bar')).toBe(VisualizationTypes.BAR);
    });
    it('should be COLUMN if uri is local:column', () => {
        expect(getVisualizationTypeFromUrl('local:column')).toBe(VisualizationTypes.COLUMN);
    });
    it('should be LINE if uri is local:line', () => {
        expect(getVisualizationTypeFromUrl('local:line')).toBe(VisualizationTypes.LINE);
    });
    it('should be TABLE if uri is local:TABLE', () => {
        expect(getVisualizationTypeFromUrl('local:table')).toBe(VisualizationTypes.TABLE);
    });
    it('should be PIE if uri is local:pie', () => {
        expect(getVisualizationTypeFromUrl('local:pie')).toBe(VisualizationTypes.PIE);
    });
    it('should handle different casing', () => {
        expect(getVisualizationTypeFromUrl('local:Bar')).toBe(VisualizationTypes.BAR);
        expect(getVisualizationTypeFromUrl('local:BAR')).toBe(VisualizationTypes.BAR);
        expect(getVisualizationTypeFromUrl('local:bAR')).toBe(VisualizationTypes.BAR);
    });
});

describe('getVisualizationTypeFromVisualizationClass', () => {
    const sdk = createSdk();
    const getSdkWithFeatureFlags = (featureFlags = {}): SDK => {
        const mutatedSdk = createSdk();
        mutatedSdk.project.getFeatureFlags = jest.fn(() => Promise.resolve(featureFlags));
        return mutatedSdk;
    };
    const projectId = 'test';
    const pieVisClass = {
        content: {
            url: 'local:pie',
            icon: 'local:pie',
            iconSelected: 'local:pie_selected',
            title: 'Visualization',
            checksum: 'local:pie'
        },
        meta: {
            title: ''
        }
    };
    const tableVisClass = {
        ...pieVisClass,
        content: {
            ...pieVisClass.content,
            url: 'local:table',
            icon: 'local:table',
            iconSelected: 'local:table_selected',
            checksum: 'local:table'
        }
    };

    it('should return correct type when url is local:pie', () => {
        const getVisualizationTypeFromUrlMock = jest.fn();
        getVisualizationTypeFromVisualizationClass(
            pieVisClass,
            sdk,
            projectId,
            getVisualizationTypeFromUrlMock
        );
        expect(getVisualizationTypeFromUrlMock).toHaveBeenCalledWith('local:pie');
    });
    it('should get url from vis. class and pass it to getVisualizationTypeFromUrl ', () => {
        const getVisualizationTypeFromUrlMock = jest.fn();
        getVisualizationTypeFromVisualizationClass(
            pieVisClass,
            sdk,
            projectId,
            getVisualizationTypeFromUrlMock
        );
        expect(getVisualizationTypeFromUrlMock).toHaveBeenCalledWith('local:pie');
    });
    it('should not call getFeatureFlags when url is NOT local:table', () => {
        const sdkWithFeatureFlags = getSdkWithFeatureFlags();
        getVisualizationTypeFromVisualizationClass(
            pieVisClass,
            sdkWithFeatureFlags,
            projectId
        );
        expect(sdkWithFeatureFlags.project.getFeatureFlags).not.toHaveBeenCalled();
    });
    it('should call getFeatureFlags when url is local:table', () => {
        const sdkWithFeatureFlags = getSdkWithFeatureFlags({ enablePivot: true });
        getVisualizationTypeFromVisualizationClass(
            tableVisClass,
            sdkWithFeatureFlags,
            projectId
        );
        expect(sdkWithFeatureFlags.project.getFeatureFlags).toHaveBeenCalledWith(projectId);
    });
    it('should return "pivotTable" when url is local:table if enablePivot is set', async () => {
        const sdkWithFeatureFlags = getSdkWithFeatureFlags({ enablePivot: true });
        const type = await getVisualizationTypeFromVisualizationClass(
            tableVisClass,
            sdkWithFeatureFlags,
            projectId
        );
        expect(type).toBe('pivotTable');
    });
    it('should return "table" when url is local:table and enablePivot is not set', async () => {
        const sdkWithFeatureFlags = getSdkWithFeatureFlags();
        const type = await getVisualizationTypeFromVisualizationClass(
            tableVisClass,
            sdkWithFeatureFlags,
            projectId
        );
        expect(type).toBe('table');
    });
});
