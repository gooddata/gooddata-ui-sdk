// (C) 2007-2018 GoodData Corporation
import { Selector } from 'testcafe';
import { config } from './utils/config';
import { loginUsingGreyPages } from './utils/helpers';

fixture('Parent filter')
    .page(config.url)
    .beforeEach(loginUsingGreyPages(`${config.url}/advanced/parent-filter`));

test('Check if child filters are restricted by parent filters and visualization is properly filtered', async (t) => {
    const dropdownState = Selector('.s-select-state');
    const dropdownStateList = Selector('.s-select-state .Select-menu');
    const stateCalifornia = Selector('.s-select-state .Select-option').withText('California');

    const dropdownCity = Selector('.s-select-city .Select-placeholder');
    const dropdownCityList = Selector('.s-select-city .Select-menu');
    const citySanJose = Selector('.s-select-city .Select-option').withText('San Jose');

    const labels = Selector('.highcharts-xaxis-labels');

    await t
        .click(dropdownState)
        .expect(dropdownStateList.textContent).eql('AlabamaCaliforniaFloridaNew YorkTexas');

    await t
        .click(stateCalifornia)
        .click(dropdownCity)
        .expect(dropdownCityList.textContent).eql('Daly CityHaywardHighland VillageSan Jose');

    await t
        .click(citySanJose)
        .expect(labels.textContent).eql('San Jose - Blossom HillSan Jose - Saratoga');
});
