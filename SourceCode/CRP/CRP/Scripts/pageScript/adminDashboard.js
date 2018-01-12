$(document).ready(() => {
    Highcharts.theme = {
        colors: ['#388E3C', '#1c84c6', '#8d4654', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
           '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
        chart: {
            backgroundColor: 'white',
            style: {
                fontFamily: 'Circular,"Helvetica Neue",Helvetica,Arial,sans-serif'
            }
        },
        title: {
            style: {
                color: 'black',
                fontSize: '20px',
                fontWeight: 'bold'
            }
        },
        subtitle: {
            style: {
                color: 'black',
                fontSize: '14px'
            }
        },
        tooltip: {
            borderWidth: 0
        },
        legend: {
            itemStyle: {
                fontWeight: 'bold',
                fontSize: '14px'
            }
        },
        xAxis: {
            labels: {
                style: {
                    color: '#6e6e70'
                }
            }
        },
        yAxis: {
            labels: {
                style: {
                    color: '#6e6e70'
                }
            }
        },
        plotOptions: {
            series: {
                shadow: true
            },
            candlestick: {
                lineColor: '#404048'
            },
            map: {
                shadow: false
            }
        },

        // Highstock specific
        navigator: {
            xAxis: {
                gridLineColor: '#D0D0D8'
            }
        },
        rangeSelector: {
            buttonTheme: {
                fill: 'white',
                stroke: '#C0C0C8',
                'stroke-width': 1,
                states: {
                    select: {
                        fill: '#D0D0D8'
                    }
                }
            }
        },
        scrollbar: {
            trackBorderColor: '#C0C0C8'
        },

        // General
        background2: '#E0E0E8'

    };

    // Apply the theme
    Highcharts.setOptions(Highcharts.theme);

    $('#chart').highcharts({
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: 'Lượt đặt xe và lợi nhuận'
        },
        subtitle: {
            text: 'trong vòng 6 tháng gần đây'
        },
        xAxis: [{
            labels: {
                format: 'Tháng {value}',
            },
            categories: TIME_LIST,
            crosshair: true
        }],
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value} lượt',
                style: {
                    color: '#000'
                }
            },
            title: {
                text: 'Lượt đặt xe',
                style: {
                    color: '#000',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }
            }
        }, { // Secondary yAxis
            title: {
                text: 'Lợi nhuận',
                style: {
                    color: '#000',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }
            },
            labels: {
                format: '{value} VNĐ',
                style: {
                    color: '#000'
                }
            },
            opposite: true
        }],
        tooltip: {
            shared: true
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            x: 100,
            verticalAlign: 'top',
            y: 5,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
        },
        series: [{
            name: 'Lợi nhuận',
            type: 'column',
            yAxis: 1,
            data: PROFIT,
            tooltip: {
                valueSuffix: ' VNĐ'
            }

        }, {
            name: 'Lượt đặt xe',
            type: 'spline',
            data: NUM_BOOKING,
            tooltip: {
                valueSuffix: ' lượt'
            }
        }]
    });
});