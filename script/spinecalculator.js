

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

function spineToPounds(value) {
  return +26000.0 / ( value * 0.825 );
}

function poundsToSpine(value) {
  return +Math.round(spineToPounds(value));
}

function spineForBowType(bowType) {
  switch (bowType) {
    case 'selfbow':
    	return -5.0;
    case 'modernLongbow':
    	return 2.0;
    case 'tradRecurve':
    	return 3.0;
    case 'huntRecurve':
    	return 4.0;
    case 'technical':
    	return 5.0;
    case 'tradLongbow':
    default:
    	return 0.0;
  }
}

function spineForArcher(level) {
  switch (level) {
	  case 'beginner':
	  	return -3.0;
	  case 'hobby':
	  	return -2.0;
	  case 'trained':
	  	return -1.0;
	  case 'competitive':
	  default:
	  	return 0.0;
	  case 'professional':
	  	return 1.0;
  }
}

function SpineViewModel() {
  var self = this;
  self.nominalStrength = ko.observable(35);
  self.drawLength = ko.observable(28);
  self.bowType = ko.observable('modernLongbow');
  self.limbs = ko.observable('wood');
  self.bowQuality = ko.observable('normal');
  self.string = ko.observable('dacron');
  self.silencer = ko.observable('yes');
  self.archerLevel = ko.observable('hobby');
  self.arrowLength = ko.observable(28);
  self.tipWeight = ko.observable(100);
  self.staticSpine = ko.observable(35);
  self.staticSpineUnit = ko.observable('pounds');

  self.arrowSpine = ko.pureComputed(function() {
    let spine = +self.staticSpine();
    if (self.staticSpineUnit() === 'default') {
      spine = spineToPounds(spine);
    }
    spine -= 4.0 * ( ( self.tipWeight() - 125.0 ) / 25.0 );
    spine -= ( self.arrowLength() - 28.0 ) * 3.0;
    return spine;
  });

  self.dynamicSpine = ko.pureComputed(function() {
    let spine = +self.nominalStrength();
	  spine += ( +self.nominalStrength() / 20.0 ) * ( +self.drawLength() - 28.0 );
	  spine += spineForBowType(self.bowType());
	  spine += self.limbs() === 'wood' ? 0.0 : 3.0;
	  spine += self.bowQuality() === 'highend' ? 1.0 : 0.0;
	  //spine -= bow.AdditionalWeight.In(WeightUnit.Gramm) / 100.0f;
	  spine += self.string() === 'fastflight' ? 5.0 : 0.0;
	  spine -= self.silencer() === 'yes' ? 1.0 : 0.0;
	  spine += spineForArcher(self.archerLevel());
	  return spine;
	});

  self.resultDynamicSpine = ko.pureComputed(function() {
    return poundsToSpine(self.dynamicSpine()) + ' (' + Math.round(self.dynamicSpine()) + '#)';
	});

  self.resultArrowSpine = ko.pureComputed(function() {
    return poundsToSpine(self.arrowSpine()) + ' (' + Math.round(self.arrowSpine()) + '#)';
	});

  self.recommendedSpine = ko.pureComputed(function() {
    let spine = +self.dynamicSpine();
    spine += ( +self.arrowLength() - 28.0 ) * 3.0;
    spine += 4.0 * ( ( +self.tipWeight() - 125.0 ) / 25.0 );
    return spine;
	});

  self.resultRecommendedSpine = ko.pureComputed(function() {
    let pounds = +self.recommendedSpine();
    let spine = poundsToSpine(pounds);
    if (spine % 100 <= 20) {
      spine -= 20;
		}
    spine = 100 * Math.ceil(spine / 100.0);
    if (pounds % 5 >= 4) {
      pounds += 1;
    }
    pounds = 5 * Math.floor(pounds / 5.0);
    return +spine + ' (' + +pounds + '#)';

	});
}



function startup() {
	let target = document.getElementById('result-gauge'); 
	var gauge = new Gauge(target).setOptions(resultOptions);
	gauge.animationSpeed = 20; // set animation speed (32 is default value)
	gauge.maxValue = 60; // set max gauge value
	gauge.minValue = 15;
	gauge.set(35); // set actual value
  ko.applyBindings(new SpineViewModel());
}


startup();