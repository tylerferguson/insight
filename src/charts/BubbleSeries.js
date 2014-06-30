insight.BubbleSeries = function BubbleSeries(name, chart, data, x, y, color) {

    insight.Series.call(this, name, chart, data, x, y, color);

    var radiusFunction = d3.functor(10);
    var fillFunction = d3.functor(color);
    var maxRad = d3.functor(50);
    var minRad = d3.functor(7);
    var tooltipExists = false;
    var self = this;

    var xFunction = function(d) {};
    var yFunction = function(d) {};


    var mouseOver = function(d, item) {
        self.chart.mouseOver(self, this, d);

        d3.select(this)
            .classed("hover", true);
    };

    var mouseOut = function(d, item) {
        self.chart.mouseOut(self, this, d);
    };


    this.findMax = function(scale) {
        var self = this;

        var max = 0;
        var data = this.data.getData();

        var func = scale == self.x ? self.xFunction() : self.yFunction();

        var m = d3.max(data, func);

        max = m > max ? m : max;

        return max;
    };

    this.yFunction = function(_) {
        if (!arguments.length) {
            return yFunction;
        }
        yFunction = _;

        return this;

    };


    this.xFunction = function(_) {
        if (!arguments.length) {
            return xFunction;
        }
        xFunction = _;

        return this;

    };

    this.rangeY = function(d) {
        var f = self.yFunction();

        return self.y.scale(self.yFunction()(d));
    };

    this.rangeX = function(d, i) {
        var f = self.xFunction();
        return self.x.scale(self.xFunction()(d));
    };

    this.radiusFunction = function(_) {
        if (!arguments.length) {
            return radiusFunction;
        }
        radiusFunction = _;

        return this;
    };


    this.fillFunction = function(_) {
        if (!arguments.length) {
            return fillFunction;
        }
        fillFunction = _;

        return this;
    };

    this.selector = this.name + insight.Constants.Bubble;

    this.className = function(d) {

        return self.selector + " " + insight.Constants.Bubble + " " + self.sliceSelector(d) + " " + self.dimensionName;
    };

    this.draw = function(drag) {
        var duration = drag ? 0 : function(d, i) {
            return 200 + (i * 20);
        };

        var data = this.dataset();

        var min = d3.min(data, radiusFunction);
        var max = d3.max(data, radiusFunction);

        var rad = function(d) {
            return d.radius;
        };

        var click = function(filter) {
            return self.click(this, filter);
        };


        data.forEach(function(d) {
            var radiusInput = radiusFunction(d);

            d.radius = minRad() + (((radiusInput - min) * (maxRad() - minRad())) / (max - min));
        });

        //this sort ensures that smaller bubbles are on top of larger ones, so that they are always selectable.  Without changing original array
        data = data.concat()
            .sort(function(a, b) {
                return d3.descending(rad(a), rad(b));
            });

        var bubbles = this.chart.chart.selectAll('circle.' + self.selector)
            .data(data, self.keyAccessor);

        bubbles.enter()
            .append('circle')
            .attr('class', self.className)
            .on('mouseover', mouseOver)
            .on('mouseout', mouseOut)
            .on('click', click);

        bubbles.transition()
            .duration(duration)
            .attr('r', rad)
            .attr('cx', self.rangeX)
            .attr('cy', self.rangeY)
            .attr('fill', fillFunction);

        if (!tooltipExists) {
            bubbles.append('svg:text')
                .attr('class', insight.Constants.ToolTipTextClass);
            tooltipExists = true;
        }

        bubbles.selectAll("." + insight.Constants.ToolTipTextClass)
            .text(this.tooltipFunction());
    };
};

insight.BubbleSeries.prototype = Object.create(insight.Series.prototype);
insight.BubbleSeries.prototype.constructor = insight.BubbleSeries;
