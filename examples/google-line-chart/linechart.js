/*global google*/
google.load("visualization", "1", {packages:["corechart"]});
    var projectId = '',
        user = '',
        passwd = '';

    // Report elements identifiers from which we execute a GD report
    // change for your metrics
    var openMetric = 'aiAY9GSReqiT',
        closeMetric = 'aHZY9nzNeg3f',
        year = 'date.aag81lMifn6q';

    var elements = [year, openMetric, closeMetric];

// Insert info label
$('body').append('<div class="login-loader" style="text-align: center; margin: 30px;">Logging in...</div>');

gooddata.user.login(user, passwd).then(function() {
    'use strict';

    $('div.login-loader').remove();
    $('body').append('<div class="loading" style="text-align: center; margin: 30px;">Loading data...</div>');

    // Ask for data for the given metric and attributes from the GoodSales project
    gooddata.execution.getData(projectId, elements).then(function(dataResult) {
        // Yay, data arrived

        // extract header values
        var headers = dataResult.headers.map(function(h) {
                    return h.title;
                });
        // extract raw data matrix
        var data = dataResult.rawData;

        // we need to convert metrics to integer because google chart needs numbers
        for(var i = 0; i < data.length; i++) {
                for(var j = 1; j < data[i].length; j++) {
                data[i][j] = parseInt(data[i][j], 10);
              }
            }
        // Remove loading labels
        $('div.loading').remove();

        var drawChart = function(data, headers) {
            var data3 = new google.visualization.DataTable();
                data3.addColumn('string', headers[0]);
                data3.addColumn('number', headers[1]);
                data3.addColumn('number', headers[2]);
                data3.addRows(data);
                console.log(data);

            var options = {
                title: 'Nasdaq',
                hAxis: {title: headers[0],  titleTextStyle: {color: '#333'}},
                vAxis: {minValue: 0}
            };

            var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
            chart.draw(data3, options);
       };

        // call back to draw the chart after document is ready
        google.setOnLoadCallback(drawChart(data, headers));
   });
});

