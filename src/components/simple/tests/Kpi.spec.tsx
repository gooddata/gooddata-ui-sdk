import * as React from 'react';
import { mount } from 'enzyme';

import { Kpi, IKpiProps } from '../Kpi';
import { delay } from '../../tests/utils';
import { emptyResponse, oneMeasureResponse } from '../../../execution/fixtures/ExecuteAfm.fixtures';

class DummyExecute extends React.Component<any, null> {
    public render() {
        return this.props.children({ result: oneMeasureResponse });
    }
}

class DummyExecuteEmpty extends React.Component<any, null> {
    public render() {
        return this.props.children({ result: emptyResponse });
    }
}

describe('Kpi', () => {
    function createComponent(format?: string, ExecuteComponent = DummyExecute) {
        const props: IKpiProps = {
            projectId: 'myprojectid',
            measure: '/gdc/md/myprojectid/obj/123',
            ExecuteComponent
        };

        if (format) {
            props.format = format;
        }

        return mount(<Kpi {...props} />);
    }

    it('should accept no format', () => {
        const wrapper = createComponent();
        return delay().then(() => {
            expect(wrapper.find('.gdc-kpi').text()).toEqual('42,470,571.16');
        });
    });

    it('should use format #,#', () => {
        const wrapper = createComponent('#,#');
        return delay().then(() => {
            expect(wrapper.find('.gdc-kpi').text()).toEqual('42,470,571');
        });
    });

    it('should use format with conditions', () => {
        const wrapper = createComponent('[>=1000000]#,,.0 M;[>=1000]#,.0 K;[>=0]#,##0');
        return delay().then(() => {
            expect(wrapper.find('.gdc-kpi').text()).toEqual('42.5 M');
        });
    });

    it('should use format with colors', () => {
        const wrapper = createComponent('[<600000][red]$#,#.##;[=600000][yellow]$#,#.##;[>600000][green]$#,#.##');
        return delay().then(() => {
            expect(wrapper.find('.gdc-kpi').html())
                .toEqual('<span class="gdc-kpi"><span style="color: rgb(0, 170, 0);">$42,470,571.16</span></span>');
        });
    });

    it('should use format with M', () => {
        const wrapper = createComponent('#,,.0 M');
        return delay().then(() => {
            expect(wrapper.find('.gdc-kpi').text()).toEqual('42.5 M');
        });
    });

    it('should use format with backgroundColor', () => {
        const wrapper = createComponent('[backgroundcolor=CCCCCC][red]$#,#.##');
        return delay().then(() => {
            expect(wrapper.find('.gdc-kpi').html())
                .toEqual('<span class="gdc-kpi"><span style="color: rgb(255, 0, 0);">$42,470,571.16</span></span>');
        });
    });

    it('should use format with dollar sign', () => {
        const wrapper = createComponent('$#,#.##');
        return delay().then(() => {
            expect(wrapper.find('.gdc-kpi').text()).toEqual('$42,470,571.16');
        });
    });

    it('should render null value', () => {
        const wrapper = createComponent('[=Null][backgroundcolor=DDDDDD][red]No Value;', DummyExecuteEmpty);
        return delay().then(() => {
            expect(wrapper.find('.gdc-kpi').html())
                .toEqual('<span class="gdc-kpi"><span style="color: rgb(255, 0, 0);">No Value</span></span>');
        });
    });
});
