insight.ColumnSeries = function ColumnSeries(name, chart, data, x, y, color) {

    insight.Series.call(this, name, chart, data, x, y, color);

    var self = this;
    var stacked = d3.functor(false);
    var seriesName = "";
    var barWidthFunction = this.x.rangeType;


    var tooltipFunction = function(d) {
        var func = self.series[self.currentSeries].accessor;
        return self.tooltipFormat()(func(d));
    };


    this.series = [{
        name: 'default',
        accessor: function(d) {
            return self.valueFunction()(d);
        },
        tooltipValue: function(d) {
            return self.tooltipFunction()(d);
        },
        color: d3.functor('silver'),
        label: 'Value'
    }];


    /**
     * Given an object representing a data item, this method returns the largest value across all of the series in the ColumnSeries.
     * This function is mapped across the entire data array by the findMax method.
     * @returns {Number} return - Description
     * @param {object} data - An item in the object array to query
     */
    this.seriesMax = function(d) {
        var max = 0;
        var seriesMax = 0;

        var stacked = self.stacked();

        for (var series in self.series) {
            var s = self.series[series];

            var seriesValue = s.accessor(d);

            seriesMax = stacked ? seriesMax + seriesValue : seriesValue;

            max = seriesMax > max ? seriesMax : max;
        }

        return max;
    };


    /**
     * This method returns the largest value on the value axis of this ColumnSeries, checking all series functions in the series on all points.
     * This function is mapped across the entire data array by the findMax method.
     * @constructor
     * @returns {Number} return - The largest value on the value scale of this ColumnSeries
     */
    this.findMax = function() {
        var max = d3.max(this.data.getData(), this.seriesMax);

        return max;
    };


    /**
     * This method gets or sets whether or not the series in this ColumnSeries are to be stacked or not.  This is false by default.
     * @returns {boolean} - Whether or not the columns are stacked (they are grouped if this returns false)
     */
    /**
     * @returns {object} return - Description
     * @param {boolean} stack - To stack or not to stack
     */
    this.stacked = function(_) {
        if (!arguments.length) {
            return stacked();
        }
        stacked = d3.functor(_);
        return this;
    };

    this.calculateYPos = function(func, d) {
        if (!d.yPos) {
            d.yPos = 0;
        }

        d.yPos += func(d);

        return d.yPos;
    };

    this.xPosition = function(d) {
        return self.x.scale(self.keyFunction()(d));
    };

    this.calculateXPos = function(width, d) {
        if (!d.xPos) {
            d.xPos = self.xPosition(d);
        } else {
            d.xPos += width;
        }
        return d.xPos;
    };

    this.yPosition = function(d) {

        var func = self.series[self.currentSeries].accessor;

        var position = self.stackedBars() ? self.y.scale(self.calculateYPos(func, d)) : self.y.scale(func(d));

        return position;
    };



    this.barWidth = function(d) {
        return self.x.scale.rangeBand(d);
    };

    this.groupedBarWidth = function(d) {

        var groupWidth = self.barWidth(d);

        var width = self.stackedBars() || (self.series.length == 1) ? groupWidth : groupWidth / self.series.length;

        return width;
    };

    this.offsetXPosition = function(d) {
        var width = self.groupedBarWidth(d);
        var position = self.stackedBars() ? self.xPosition(d) : self.calculateXPos(width, d);

        return position;
    };

    this.barHeight = function(d) {
        var func = self.series[self.currentSeries].accessor;

        return (self.chart.height() - self.chart.margin()
            .top - self.chart.margin()
            .bottom) - self.y.scale(func(d));
    };

    this.stackedBars = function() {
        return self.stacked();
    };



    this.className = function(d) {
        var dimension = self.sliceSelector(d);

        var selected = self.selectedClassName(dimension);

        return seriesName + 'class bar ' + dimension + " " + selected + " " + self.dimensionName;
    };

    this.draw = function(drag) {

        var reset = function(d) {
            d.yPos = 0;
            d.xPos = 0;
        };

        var d = this.dataset()
            .forEach(reset);

        var groups = this.chart.chart
            .selectAll('g.' + InsightConstants.BarGroupClass)
            .data(this.dataset(), this.keyAccessor);

        var newGroups = groups.enter()
            .append('g')
            .attr('class', InsightConstants.BarGroupClass);

        var newBars = newGroups.selectAll('rect.bar');

        var click = function(filter) {
            return self.click(this, filter);
        };

        var duration = function(d, i) {
            return 200 + (i * 20);
        };

        for (var ser in this.series) {

            this.currentSeries = ser;

            var s = this.series[ser];

            seriesName = s.name;

            newBars = newGroups.append('rect')
                .attr('class', self.className)
                .attr('y', this.y.bounds[0])
                .attr('height', 0)
                .attr('fill', s.color)
                .attr('clip-path', 'url(#' + this.chart.clipPath() + ')')
                .on('mouseover', this.mouseOver)
                .on('mouseout', this.mouseOut)
                .on('click', click);

            newBars.append('svg:text')
                .attr('class', InsightConstants.ToolTipTextClass);

            var bars = groups.selectAll('.' + seriesName + 'class.bar');

            bars
                .transition()
                .duration(duration)
                .attr('y', this.yPosition)
                .attr('x', this.offsetXPosition)
                .attr('width', this.groupedBarWidth)
                .attr('height', this.barHeight);

            bars.selectAll('.' + InsightConstants.ToolTipTextClass)
                .text(tooltipFunction);

        }

        groups.exit()
            .remove();
    };

    return this;
};

insight.ColumnSeries.prototype = Object.create(insight.Series.prototype);
insight.ColumnSeries.prototype.constructor = insight.ColumnSeries;
