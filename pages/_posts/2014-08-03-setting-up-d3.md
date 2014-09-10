---
layout: post
title:  "Setting Up Custom Visualization"
date:   2014-08-03 11:00:00
categories: tutorial
highlighter: true
prev_section: build-visualization
next_section: build-visualization/#embed-to-dashboard
perex: Setting up Google Graph viz with our data from GoodData Platform.
---

It's time to start building the visualization itself. If you are an expert in building the custom visualization, this article will be super easy for you! We are going to draw the **line chart** using Google Charts library.

If you have the visualization already prepared, you can skip this and continue with [embedding](/tutorial/embedding-custom-visualization-into-dashboard).

We will use [Google Charts](https://google-developers.appspot.com/chart/). You can also use any Javascript framework like [D3.js](http://d3js.org/), find out the [the documentation](https://github.com/mbostock/d3/wiki).

_You can also check out our [end to end examples](/build-visualization/#examples)._

### What we already know

See the code below to recap how we can log in to the GoodData and extract data from your project.

{% highlight js %}
google.load("visualization", "1", {packages:["corechart"]});

var projectId = 'project-id',
	user = 'username@company.com',
	passwd = 'password';

// Report elements identifiers from which we execute a GD report
var open = 'aiAY9GSReqiT',
	close = 'aHZY9nzNeg3f',
	year = 'date.aag81lMifn6q';

var elements = [year, open, close];

// Insert info label
$('body').append('<div class="login-loader>Logging in...</div>');

gooddata.user.login(user, passwd).then(function() {

    $('div.login-loader').remove();
    $('body').append('<div class="loading" style="text-align: center; margin: 30px;">Loading data...</div>');

    // Ask for data for the given metric and attributes from the GoodSales project
    gooddata.execution.getData(projectId, elements).then(function(dataResult) {
        // Yay, data arrived

{% endhighlight %}

We have a data, let's build a line chart.

### Visualization Set Up

<img src="{{ site.url }}/images/posts/google-line-chart.png" width="650" />

{% highlight js %}

 		// extract header values
        var headers = dataResult.headers.map(function(h) {
                    return h.title;
                });

        // extract raw data matrix
        var data = dataResult.rawData;

		// we need to convert metrics to integer because google chart needs numbers
       	for(var i = 0; i < data.length; i++) {
				for(var j = 1; j < data[i].length; j++) {
				data[i][j] = parseInt(data[i][j]);
			  }
			}
        // Remove loading labels
        $('div.loading').remove();

        // call function back to draw the chart after document is ready
        google.setOnLoadCallback(drawChart(data, headers));

		// function to draw line chart with our data
		function drawChart(data, headers) {

            var data = google.visualization.arrayToDataTable(dataResult.rawData);
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
       }
{% endhighlight %}

### Complete HTML

The last part is complete html code. See below:

{% highlight html %}
<html>
  <head>
    <script type="text/javascript" src="https://www.google.com/jsapi"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
	<script type="text/javascript" src="../gooddata.js"></script>
  </head>
  <body>
    <div id="chart_div" style="width: 900px; height: 500px;"></div>
  </body>
    <script type="text/javascript" src="linechart.js"></script>
</html>
{% endhighlight %}


You can find out complete example as a part of the [library you cloned](https://github.com/gooddata/gooddata-js) from Github. Try it yourself.
