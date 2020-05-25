
// activate popover tooltips
$(function () {
  $('[data-toggle="popover"]').popover()
})

$('.popover-dismiss').popover({
  trigger: 'focus'
})

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

function SpineViewModel(target) {
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

  self.spineZones = ko.pureComputed(function() {
    let spine = self.dynamicSpine();
    return [
        {strokeStyle: "#F03E3E", min: 15, max: spine - 8}, // Red
        {strokeStyle: "#FFDD00", min: spine - 8, max: spine - 4}, // Yellow
        {strokeStyle: "#30B32D", min: spine - 4, max: spine + 2}, // Green
        {strokeStyle: "#FFDD00", min: spine + 2, max: spine + 4}, // Yellow
        {strokeStyle: "#F03E3E", min: spine + 4, max: 60}  // Red
	    ];
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

  self.gaugeOptions = {
    angle: 0, 
    lineWidth: 0.4, 
    radiusScale: 1, 
    pointer: {
      length: 0.50, 
      strokeWidth: 0.050, 
      color: '#000000' 
    },
    limitMax: true, 
    limitMin: true, 
    colorStart: '#6FADCF',  
    colorStop: '#8FC0DA',   
    strokeColor: '#E0E0E0', 
    highDpiSupport: true,   
    fontSize: 0,
    staticZones: self.spineZones()
  };

  self.spineGauge = new Gauge(target).setOptions(self.gaugeOptions);
  self.spineGauge.animationSpeed = 20;
	self.spineGauge.maxValue = 60;
	self.spineGauge.minValue = 15;

  self.arrowSpineSetter = ko.computed( function() {
    let spine = self.arrowSpine();
    self.spineGauge.set(spine);
	});

  self.spineZonesSetter = ko.computed(function() {
    let zones = self.spineZones();
    self.gaugeOptions.staticZones = zones;
    self.spineGauge.setOptions(self.gaugeOptions);
	});
}

function startup() {
	let target = document.getElementById('result-gauge'); 
  var model = new SpineViewModel(target);
  ko.applyBindings(model);
}

startup();