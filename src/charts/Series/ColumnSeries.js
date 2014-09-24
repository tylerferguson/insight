(function(insight) {

    /**
     * The ColumnSeries class extends the BarSeries class and draws vertical bars on a Chart
     * @class insight.ColumnSeries
     * @extends insight.BarSeries
     * @param {String} name - A uniquely identifying name for this series
     * @param {insight.DataSet} data - The DataSet containing this series' data
     * @param {insight.Scales.Scale} x - the x axis
     * @param {insight.Scales.Scale} y - the y axis
     */
    insight.ColumnSeries = function ColumnSeries(name, data, x, y) {

        insight.BarSeries.call(this, name, data, x, y);

        // Private variables -----------------------------------------------------------------------------------------

        var self = this;

        // Internal variables ------------------------------------------------------------------------------------------

        self.valueAxis = y;
        self.keyAxis = x;
        self.classValues = [insight.Constants.ColClass];

        // Private functions -----------------------------------------------------------------------------------------


        // Internal functions ----------------------------------------------------------------------------------------

        self.isHorizontal = function() {
            return false;
        };

        self.orderFunction = function(a, b) {
            // Sort descending for categorical data
            return self.valueFunction()(b) - self.valueFunction()(a);
        };
    };

    insight.ColumnSeries.prototype = Object.create(insight.BarSeries.prototype);
    insight.ColumnSeries.prototype.constructor = insight.ColumnSeries;

})(insight);
