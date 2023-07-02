window.onload = function(){
  var data = [100, 120, 150, 170, 180, 170, 160];
  var labels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"];

  drawLineChart(
    "chart", // elemet.id
    data, // data
    labels, // labels
    "#FF0033", // firstColour
    "#FF9999", // secondColour
    "#FFFFFF" // thirdColour
  );

  var timer = 0;
  window.onresize = function () {
    if (timer > 0) {
      clearTimeout(timer);
    }

    timer = setTimeout(function () {
      // myChart.update(); な感じでいけるようにしたい
      drawLineChart(
        "chart", // elemet.id
        data, // data
        labels, // labels
        "#FF0033", // firstColour
        "#FF9999", // secondColour
        "#FFFFFF" // thirdColour
      );
    }, 300);
  };

  function drawLineChart(id, data, labels, firstColour, secondColour, thirdColour) {
    var parent_cnvas = document.getElementById('parent_chart');
    var ctx = document.getElementById(id).getContext("2d");
    var canvas = document.getElementById(id);
    // var width = window.innerWidth || document.body.clientWidth;
    // var height = window.innerHeight || document.body.clientHeight;
    // var gradientStroke = ctx.createLinearGradient(0, 0, 0, height);
    var gradientStroke = ctx.createLinearGradient(0, 0, 0, parent_cnvas.clientHeight);
    gradientStroke.addColorStop(0.0, firstColour);
    gradientStroke.addColorStop(0.5, secondColour);
    gradientStroke.addColorStop(1.0, thirdColour);

    var myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Data",
            borderColor: gradientStroke,
            pointBorderColor: gradientStroke,
            pointBackgroundColor: gradientStroke,
            pointHoverBackgroundColor: gradientStroke,
            pointHoverBorderColor: gradientStroke,
            pointBorderWidth: 8,
            pointHoverRadius: 8,
            pointHoverBorderWidth: 1,
            pointRadius: 0,
            backgroundColor: gradientStroke,
            borderWidth: 1,
            data: data
          },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          position: "none" 
        },
        scales: {
          yAxes: [
            {
              ticks: {
                fontFamily: "Roboto Mono",
                fontColor: "#444",
                fontStyle: "bold",
                beginAtZero: true,
                padding: 20
              },
              gridLines: {
                drawTicks: false,
                display: false,
                drawBorder: false
              }
            }
          ],
          xAxes: [
            {
              gridLines: {
                zeroLineColor: "transparent" 
              },
              ticks: {
                fontFamily: "Roboto Mono",
                fontColor: "#444",
                fontStyle: "bold",
                beginAtZero: true,
                padding: 20
              },
              gridLines: {
                drawTicks: false,
                display: false,
                drawBorder: false
              }
            }
          ]
        }
      }
    });
  }
}
