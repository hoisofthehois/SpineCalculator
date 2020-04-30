

var resultOptions = {
  angle: 0, // The span of the gauge arc
  lineWidth: 0.4, // The line thickness
  radiusScale: 1, // Relative radius
  pointer: {
    length: 0.50, // // Relative to gauge radius
    strokeWidth: 0.050, // The thickness
    color: '#000000' // Fill color
  },
  limitMax: true,     // If false, max value increases automatically if value > maxValue
  limitMin: true,     // If true, the min value of the gauge will be fixed
  colorStart: '#6FADCF',   // Colors
  colorStop: '#8FC0DA',    // just experiment with them
  strokeColor: '#E0E0E0',  // to see which ones work best for you
  generateGradient: true,
  highDpiSupport: true,     // High resolution support
  staticZones: [
   {strokeStyle: "#F03E3E", min: 15, max: 25}, // Red from 100 to 130
   {strokeStyle: "#FFDD00", min: 25, max: 30}, // Yellow
   {strokeStyle: "#30B32D", min: 30, max: 35}, // Green
   {strokeStyle: "#FFDD00", min: 35, max: 40}, // Yellow
   {strokeStyle: "#F03E3E", min: 40, max: 60}  // Red
	],
};



function startup() {
	let target = document.getElementById('result-gauge'); 
	var gauge = new Gauge(target).setOptions(resultOptions);
	gauge.maxValue = 60; // set max gauge value
	gauge.minValue = 15;
	gauge.animationSpeed = 20; // set animation speed (32 is default value)
	gauge.set(35); // set actual value
}



startup();