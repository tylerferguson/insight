(function()
{
    'use strict';

    function HowToDataCorrelationController ($scope, $location, $anchorScroll, $timeout) {

        $scope.loadData = function() {
            d3.json('datasets/appstore.json', function(data)
            {
                data.forEach(function(d)
                {
                    d.releaseDate = new Date(d.releaseDate);
                    d.fileSizeBytes = +d.fileSizeBytes;
                });

                var chartGroup = new insight.ChartGroup();

                var dataset = new insight.DataSet(data);

                var genres = dataset.group('genre', function(d)
                {
                    return d.primaryGenreName;
                })
                    .sum(['userRatingCount'])
                    .mean(['price', 'averageUserRating', 'userRatingCount', 'fileSizeBytes']);

                var scatterChart = new insight.Chart('Chart 3', '#bubbleChart')
                    .width(500)
                    .height(400)
                    .margin(
                    {
                        top: 50,
                        left: 160,
                        right: 40,
                        bottom: 80
                    });

                var xAxis = new insight.Axis('Average Number of Ratings', insight.scales.linear)
                    .tickSize(2);

                var yAxis = new insight.Axis('Average Price', insight.scales.linear);

                scatterChart.xAxis(xAxis);
                scatterChart.yAxis(yAxis);

                var scatter = new insight.ScatterSeries('bubbles', genres, xAxis, yAxis)
                    .keyFunction(function(d)
                    {
                        return d.value.userRatingCount.mean;
                    })
                    .valueFunction(function(d)
                    {
                        return d.value.price.mean;
                    })
                    .tooltipFunction(function(d)
                    {
                        return d.key;
                    });

                scatterChart.series([scatter]);
                buttonClick();






                $('.btn')
                    .button();

                function buttonClick()
                {
                    var correlation = insight.correlation.fromDataProvider(genres, scatter.keyFunction(), scatter.valueFunction());
                    var coefficientDiv = document.getElementById('correlationCoefficient');
                    coefficientDiv.innerHTML = correlation.toFixed(3);

                    scatterChart.draw();
                }

                function selectButton(selectedButton, deselectedButtons)
                {
                    //Select the selected button
                    if (!$(selectedButton)
                        .hasClass('selected'))
                    {
                        $(selectedButton)
                            .addClass('selected');
                    }

                    //Deselect the other buttons
                    deselectedButtons.forEach(function(button)
                    {
                        if ($(button)
                            .hasClass('selected'))
                        {
                            $(button)
                                .removeClass('selected');
                        }
                    });

                    buttonClick();
                }

                $('#yavgrating')
                    .click(function()
                    {
                        scatter.valueFunction(function(d)
                        {
                            return d.value.averageUserRating.mean;
                        });
                        yAxis.title('Average Rating');

                        selectButton('#yavgrating', ['#yavgratings', '#yavgprice']);
                    });


                $('#yavgratings')
                    .click(function()
                    {
                        scatter.valueFunction(function(d)
                        {
                            return d.value.userRatingCount.mean;
                        });
                        yAxis.title('Average # Ratings');

                        selectButton('#yavgratings', ['#yavgrating', '#yavgprice']);
                    });

                $('#yavgprice')
                    .click(function()
                    {
                        scatter.valueFunction(function(d)
                        {
                            return d.value.price.mean;
                        });
                        yAxis.title('Average Price');

                        selectButton('#yavgprice', ['#yavgrating', '#yavgratings']);
                    });

                $('#xsumrating')
                    .click(function()
                    {
                        scatter.keyFunction(function(d)
                        {
                            return d.value.userRatingCount.sum;
                        });
                        xAxis.title('Total Ratings');

                        selectButton('#xsumrating', ['#xavgrating', '#xavgsize']);
                    });

                $('#xavgrating')
                    .click(function()
                    {
                        scatter.keyFunction(function(d)
                        {
                            return d.value.averageUserRating.mean;
                        });
                        xAxis.title('Average Rating');

                        selectButton('#xavgrating', ['#xsumrating', '#xavgsize']);
                    });

                $('#xavgsize')
                    .click(function()
                    {

                        scatter.keyFunction(function(d)
                        {
                            return d.value.fileSizeBytes.mean / 1024 / 1024;
                        });
                        xAxis.title('Average File Size (Mb)');

                        selectButton('#xavgsize', ['#xavgrating', '#xsumrating']);
                    });
            });
        };
    }

    angular.module('insightChartsControllers').controller('HowToDataCorrelationController', ['$scope', '$location', '$anchorScroll', '$timeout', HowToDataCorrelationController]);
}());
