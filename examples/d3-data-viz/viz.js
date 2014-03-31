// Copyright (C) 2007-2013, GoodData(R) Corporation. All rights reserved.
var projectId = 'GoodSalesDemo',
    user = '',
    passwd = '';

// Report elements identifiers from which we execute a GD report
var metric = 'afSEwRwdbMeQ',
    attr1 = 'closed.aam81lMifn6q',
    attr2 = 'label.owner.id.name';
var elements = [attr1, attr2, metric];

// Insert info label
$('body').append('<div class="login-loader">Logging in...</div>');

gooddata.user.login(user, passwd).then(function() {

    $('div.login-loader').remove();
    $('body').append('<div class="loading">Loading data...</div>');

    // Ask for data for the given metric and attributes from the GoodSales project
    gooddata.execution.getData(projectId, elements).then(function(dataResult) {
        // Yay, data arrived

        // Remove loading labels
        $('div.loading').remove();

        // Helper for transforming data into the matrix that is consumed
        // by the d3.js Chord chart
        var transformData = function(dataResult) {
            var headers = dataResult.headers.map(function(h) {
                    return h.title;
                }),
                data = dataResult.rawData,
                length = data.length,
                attr1 = headers[0],
                attr2 = headers[1],
                metric = headers[2],
                attr1Keys = {},
                attr2Keys = {},
                matrix = [];

            // Compute metric values for both attributes values and store them in hashmap
            data.forEach(function(row) {
                var key1 = row[headers.indexOf(attr1)],
                    key2 = row[headers.indexOf(attr2)],
                    metricVal = parseFloat(row[headers.indexOf(metric)]);

                if (!attr1Keys[key1]) attr1Keys[key1] = [];
                if (!attr2Keys[key2]) attr2Keys[key2] = [];
                attr1Keys[key1].push(metricVal);
                attr2Keys[key2].push(metricVal);
            });

            // Get the keys in an array
            var attr1Vals = Object.keys(attr1Keys),
                attr2Vals = Object.keys(attr2Keys),
                matrixIdx = 0,
                i = 0;

            // Initialize result matrix
            for (i=0; i<attr1Vals.length+attr2Vals.length; i++) matrix.push([]);

            // For each key in an array generate a row in a resulting matrix
            attr1Vals.forEach(function(attrVal) {
                // Generate leading zeros
                for (i=0; i<attr1Vals.length; i++) matrix[matrixIdx].push(0);
                matrix[matrixIdx] = matrix[matrixIdx].concat(attr1Keys[attrVal]);
                matrixIdx++;
            });

            // For each key in an array generate a row in a resulting matrix
            attr2Vals.forEach(function(attrVal) {
                // Generate leading zeros
                matrix[matrixIdx] = matrix[matrixIdx].concat(attr2Keys[attrVal]);
                for (i=0; i<attr2Vals.length; i++) matrix[matrixIdx].push(0);
                matrixIdx++;
            });

            return {
                labels: [].concat(attr1Vals.concat(attr2Vals)),
                matrix: matrix
            };
        };

        var fill = d3.scale.category10();

        // Use the elper function and transform the data
        var data = transformData(dataResult);

        // Visualize
        var chord = d3.layout.chord()
            .padding(.05)
            .sortSubgroups(d3.descending)
            .matrix(data.matrix);

        var width = 960,
            height = 500,
            r1 = height / 2,
            innerRadius = Math.min(width, height) * .41,
            outerRadius = innerRadius * 1.1,
            outer

        var svg = d3.select("body").append("svg")
            .attr("width", width+200)
            .attr("height", height+200)
            .append("g")
            .attr("transform", "translate(" + (width+200) / 2 + "," + (height+200) / 2 + ")");

        svg.append("g").selectAll("path")
            .data(chord.groups)
            .enter().append("path")
            .attr("class", "arc")
            .style("fill", function(d) {
                return d.index < 4 ? '#444444' : fill(d.index);
            })
            .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
            .on("mouseover", fade(.1))
            .on("mouseout", fade(.7));


        svg.append("g")
            .attr("class", "chord")
            .selectAll("path")
            .data(chord.chords)
            .enter().append("path")
            .attr("d", d3.svg.chord().radius(innerRadius))
            .style("fill", function(d) { return fill(d.target.index); })
            .style("opacity", 0.7);

        svg.append("g").selectAll(".arc")
            .data(chord.groups)
            .enter().append("svg:text")
            .attr("dy", ".35em")
            .attr("text-anchor", function(d) { return ((d.startAngle + d.endAngle) / 2) > Math.PI ? "end" : null; })
            .attr("transform", function(d) {
              return "rotate(" + (((d.startAngle + d.endAngle) / 2) * 180 / Math.PI - 90) + ")"
                  + "translate(" + (r1 - 15) + ")"
                  + (((d.startAngle + d.endAngle) / 2) > Math.PI ? "rotate(180)" : "");
            })
            .text(function(d) {
                return data.labels[d.index];
            });

        // Returns an event handler for fading a given chord group.
        function fade(opacity) {
            return function(g, i) {
            svg.selectAll(".chord path")
                .filter(function(d) { return d.source.index != i && d.target.index != i; })
                .transition()
                .style("opacity", opacity);
            };
        }
    });
});
