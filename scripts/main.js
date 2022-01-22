class PlanetManager {
	starSystems = [];

	// function returning a list of all star systems
	getSystems() {
		return this.starSystems;
	}

	// function returning a list of all bodies from specified star system
	getBodiesFrom(systemID) {
		for (var i = 0; i < this.starSystems.length; i++) {
			if (this.starSystems[i].id == systemID) {
				return this.starSystems[i].bodies;
			}
		}
		return null;
	}

	// get a body based on it's ID
	getBody(bodyID) {
		// first extract the star system id
		var systemID = bodyID.substr(0, 3);
		for (var sys = 0; sys < this.starSystems.length; sys++) {
			if (this.starSystems[sys].id == systemID) {
				var system = this.starSystems[sys].bodies;
				for (var bod = 0; bod < system.length; bod++) {
					if (system[bod].id == bodyID) {
						return system[bod];
					}
				}
			}
		}
		return null;
	}
}

class Body {
	id;
	starSystemId;
	name;
	mass;
	radius;
	rotationPeriod;
	gravParameter;
	hasAtmosphere;
	atmHeight;
	spaceHigh;
	synchronousHeight;
	soiAltitude;
	hasParent;
	parentId;

	constructor(bodyArray) {
		this.id = bodyArray.id;
		this.starSystemId = bodyArray.id.substr(0, 3);
		this.name = bodyArray.name;
		this.mass = bodyArray.mass;
		this.radius = bodyArray.radius;
		this.rotationPeriod = bodyArray.rotationPeriod;
		this.gravParameter = bodyArray.gravParameter;
		this.atmHeight = bodyArray.atmHeight;
		this.hasAtmosphere = this.atmHeight > 0;
		this.spaceHigh = bodyArray.spaceHigh;
		this.soiAltitude = bodyArray.soiRadius + this.radius;
		this.parentId = bodyArray.parentId;
		this.hasParent = this.parentId != null;

		if (this.mass == 0 || this.mass == null) {
			this.calculateMass();
		}
		if (this.gravParameter == 0 || this.gravParameter == null) {
			this.calculateGravParam();
		}

		if (this.soiAltitude == this.radius) {
			this.soiAltitude = null;
		}

		this.synchronousHeight = Math.pow((this.gravParameter * Math.pow(this.rotationPeriod, 2)) / (4 * Math.pow(Math.PI, 2)), 1 / 3) - this.radius;
		if (this.synchronousHeight > this.soiAltitude && this.soiAltitude != null) {
			this.synchronousHeight = null;
		}
	}

	calculateMass() {
		this.mass = this.gravParameter * 6.6743e-11;
	}

	calculateGravParam() {
		this.gravParameter = this.mass * 6.6743e-11;
	}
}

var allPlanets = new PlanetManager();

async function loadData() {
	const response = await fetch('./data/bodyData.json');
	const data = await response.json();
	//load the star system with all planets
	createStarSystems(data);
	// once we have all data loaded, populate the star system dropdowns
	populateSystems();
}

function createStarSystems(data) {
	for (var i = 0; i < data.StarSystems.length; i++) {
		var system = {};
		system.id = data.StarSystems[i].id;
		system.name = data.StarSystems[i].name;
		system.bodies = [];
		for (var b = 0; b < data.StarSystems[i].bodies.length; b++) {
			system.bodies.push(new Body(data.StarSystems[i].bodies[b]));
		}
		allPlanets.starSystems.push(system);
	}
}

// populate all dropdown fields for star system selection
function populateSystems(formID = null, selection = null) {
	// first get all the elements with star system selection
	var sysElements = [];
	if (formID == null) {
		sysElements = document.getElementsByName("star-system");
	} else {
		sysElements[0] = document.getElementById(formID + "-system");
		removeOptions(formID + "-system")
	}
	// get a list of all star systems
	var options = allPlanets.getSystems();
	// iterate over the star system and add them as option to each of the selection elements
	for (var i = 0; i < options.length; i++) {
		var opt = options[i];
		for (var s = 0; s < sysElements.length; s++) {
			// create the element and assign properties
			var el = document.createElement("option");
			el.textContent = opt.name;
			el.value = opt.id;
			// append the element as a child of the selection element
			sysElements[s].appendChild(el);
		}
	}

	if (formID != null && selection != null) {
		sysElements[0].selectedIndex = selection;
	}
}

// populate the specified dropdown menu with planets from the specified star system dropdown
function populateBodies(sectionID) {
	// Get selected system ID
	var sysElement = document.getElementById(sectionID + "-system");
	var sysSelection = sysElement.selectedIndex;
	var systemID = sysElement.options[sysSelection].value;

	// First Remove the any options that are already in the list (except the default)
	resetForm(sectionID);
	removeOptions(sectionID + "-body");
	populateSystems(sectionID, sysSelection);

	// Get the list of bodies
	var bodyElement = document.getElementById(sectionID + "-body");
	var options = allPlanets.getBodiesFrom(systemID);
	//console.log(options);
	// iterate over all bodies and insert them into the bodies dropdown
	for (var i = 0; i < options.length; i++) {
		var opt = options[i];
		var el = document.createElement("option");
		el.textContent = opt.name;
		el.value = opt.id;
		bodyElement.appendChild(el);
	}
}

function resetForm(sectionID) {
	// Get the form element
	var formElement = document.getElementById(sectionID);
	formElement.reset();
}

function populateBodyData(sectionID) {
	// Get selected body
	var bodyElement = document.getElementById(sectionID + "-body");
	var bodyID = bodyElement.options[bodyElement.selectedIndex].value;
	var body = allPlanets.getBody(bodyID);

	// Get the required html elements and fill in data from body
	var radiusElement = document.getElementById(sectionID + "-radius");
	if (radiusElement != null) {
		radiusElement.value = typeof (body.radius) == "number" ? body.radius / 1000 : null;
		mask(radiusElement);
	}

	var atmHeightElement = document.getElementById(sectionID + "-atmHeight");
	if (atmHeightElement != null) {
		atmHeightElement.value = (typeof (body.atmHeight) == "number") && body.atmHeight > 0 ? body.atmHeight / 1000 : null;
		mask(atmHeightElement);
	}

	var spaceHighElement = document.getElementById(sectionID + "-spaceHigh");
	if (spaceHighElement != null) {
		spaceHighElement.value = typeof (body.spaceHigh) == "number" ? body.spaceHigh / 1000 : null;
		mask(spaceHighElement);
	}

	var synchronousAltElement = document.getElementById(sectionID + "-synchronousAlt");
	if (synchronousAltElement != null) {
		synchronousAltElement.value = typeof (body.synchronousHeight) == "number" ? body.synchronousHeight / 1000 : null;
		mask(synchronousAltElement);
	}

	var soiAltitudeElement = document.getElementById(sectionID + "-soiAltitude");
	if (soiAltitudeElement != null) {
		soiAltitudeElement.value = typeof (body.soiAltitude) == "number" ? body.soiAltitude / 1000 : null;
		mask(soiAltitudeElement);
	}

	var periodElement = document.getElementById(sectionID + "-rotationPeriod");
	if (periodElement != null) {
		var obtPeriod = body.rotationPeriod;
		periodElement.value = typeof (obtPeriod) == "number" ? obtPeriod : null;
		periodElement.title = formatTime(obtPeriod);
		mask(periodElement);
	}

	// if a different body was selected, we want to recalculate the orbit information
	if (sectionID == "od") { // <-------------------- Temporary workaround
		recalculateOrbitData(sectionID, true);
	} else if (sectionID == "ro") {
		recalculateResonantOrbitData(sectionID, true);
	}
}

function recalculateOrbitData(sectionID, refreshValues = false) {
	// Get selected body ID
	var bodyElement = document.getElementById(sectionID + "-body");
	var bodyID = bodyElement.options[bodyElement.selectedIndex].value;
	var body = allPlanets.getBody(bodyID);

	if (body == null) { return; }

	var currentApoElement = document.getElementById(sectionID + "-apoapsis");
	var currentPeriElement = document.getElementById(sectionID + "-periapsis");

	if (currentApoElement == null || currentPeriElement == null) { return; }

	if (refreshValues) {
		if (currentApoElement.hasAttribute('data-unmasked')) {
			currentApoElement.value = currentApoElement.getAttribute('data-unmasked');
			mask(currentApoElement);
		}
		if (currentPeriElement.hasAttribute('data-unmasked')) {
			currentPeriElement.value = currentPeriElement.getAttribute('data-unmasked');
			mask(currentPeriElement);
		}
	}

	var currentApo = document.activeElement === currentApoElement ? currentApoElement.value * 1000 : currentApoElement.getAttribute('data-unmasked') * 1000;
	var currentPeri = document.activeElement === currentPeriElement ? currentPeriElement.value * 1000 : currentPeriElement.getAttribute('data-unmasked') * 1000;

	var validInput = currentApo != 0 && currentPeri != 0;

	var semiMajorAxis = getSemiMajorAxis(currentApo, currentPeri, body);

	var smaElement = document.getElementById(sectionID + "-semiMajorAxis");
	smaElement.value = validInput ? semiMajorAxis / 1000 : null;
	mask(smaElement);

	var apoSpeedElement = document.getElementById(sectionID + "-apoSpeed");
	apoSpeedElement.value = validInput ? getOrbitalSpeed(currentApo, semiMajorAxis, body) : null;
	mask(apoSpeedElement);

	var periSpeedElement = document.getElementById(sectionID + "-periSpeed");
	periSpeedElement.value = validInput ? getOrbitalSpeed(currentPeri, semiMajorAxis, body) : null;
	mask(periSpeedElement);

	var eccElement = document.getElementById(sectionID + "-eccentricity");
	eccElement.value = validInput ? getOrbitEccentricity(currentApo, currentPeri, body) : null;
	mask(eccElement);

	var periodElement = document.getElementById(sectionID + "-period");
	var obtPeriod = getOrbitPeriod(semiMajorAxis, body);
	periodElement.value = validInput ? obtPeriod : null;
	periodElement.title = validInput ? formatTime(obtPeriod) : null;
	mask(periodElement);
}

function recalculateResonantOrbitData(sectionID, refreshValues = false) {
	// Get selected body ID
	var bodyElement = document.getElementById(sectionID + "-body");
	var bodyID = bodyElement.options[bodyElement.selectedIndex].value;
	var body = allPlanets.getBody(bodyID);

	// Make sure valid body was selected
	if (body == null) { return; }

	// Get all required input fields
	var altitudeElement = document.getElementById(sectionID + "-altitude");
	var numSatsElement = document.getElementById(sectionID + "-numSats");
	var orbitSkipElement = document.getElementById(sectionID + "-orbitSkip");
	var orbitUnderElement = document.getElementById(sectionID + "-orbitUnder");
	var orbitOverElement = document.getElementById(sectionID + "-orbitOver");

	// Handle values when changing body
	if (refreshValues) {
		if (altitudeElement.hasAttribute('data-unmasked')) {
			altitudeElement.value = altitudeElement.getAttribute('data-unmasked');
			mask(altitudeElement);
		}
		if (numSatsElement.hasAttribute('data-unmasked')) {
			numSatsElement.value = numSatsElement.getAttribute('data-unmasked');
			mask(numSatsElement);
		}
		if (orbitSkipElement.hasAttribute('data-unmasked')) {
			orbitSkipElement.value = orbitSkipElement.getAttribute('data-unmasked');
			mask(orbitSkipElement);
		}
	}

	if (orbitSkipElement.value == null || orbitSkipElement.value < 1) {
		orbitSkipElement.value = 1;
		mask(orbitSkipElement);
	} else if (orbitSkipElement.value > 10) {
		orbitSkipElement.value = 10;
		mask(orbitSkipElement);
	}

	// get all input values
	var altitude = document.activeElement === altitudeElement ? altitudeElement.value * 1000 : altitudeElement.getAttribute('data-unmasked') * 1000;
	var numSats = formatNumber(document.activeElement === numSatsElement ? numSatsElement.value : numSatsElement.getAttribute('data-unmasked'));
	var orbitSkip = formatNumber(document.activeElement === orbitSkipElement ? orbitSkipElement.value : orbitSkipElement.getAttribute('data-unmasked'));
	var orbitUnder = orbitUnderElement.checked ? true : false;

	// make sure input is valid
	var validInput = altitude != 0 && numSats != 0 && orbitSkip >= 1 && orbitSkip <= 10;

	if (validInput) {
		// calculate the period, semi-major axis, apoapsis and periapsis of the resonant orbit
		var finalSemiMajorAxis = getSemiMajorAxis(altitude, altitude, body);
		var finalPeriod = getOrbitPeriod(finalSemiMajorAxis, body);
		var resonantPeriod = orbitUnder ? finalPeriod - (finalPeriod / (numSats * orbitSkip)) : finalPeriod + (finalPeriod / (numSats * orbitSkip));
		var resonantSemiMajorAxis = getSemiMajorAxisFromPeriod(resonantPeriod, body);
		var apoapsis = altitude;
		var periapsis = (resonantSemiMajorAxis - body.radius) * 2 - apoapsis;

		// make sure apoapsis and periapsis are in the correct order
		if (!orbitUnder) {
			apoapsis = periapsis;
			periapsis = altitude;
		}

		// calculate the deltaV required for the maneuver
		var resonantOrbitSpeed = getOrbitalSpeed(altitude, resonantSemiMajorAxis, body);
		var finalOrbitSpeed = getOrbitalSpeed(altitude, finalSemiMajorAxis, body);
		var deltaV = Math.abs(resonantOrbitSpeed - finalOrbitSpeed);
	}

	// display results in the result fields
	var apoapsisElement = document.getElementById(sectionID + "-apoapsis");
	apoapsisElement.value = validInput ? apoapsis / 1000 : null;
	mask(apoapsisElement);

	var periapsisElement = document.getElementById(sectionID + "-periapsis");
	periapsisElement.value = validInput ? periapsis / 1000 : null;
	mask(periapsisElement);

	var deltaVElement = document.getElementById(sectionID + "-deltaV");
	deltaVElement.value = validInput ? deltaV : null;
	mask(deltaVElement);

	var finalPeriodElement = document.getElementById(sectionID + "-finalPeriod");
	finalPeriodElement.value = validInput ? finalPeriod : null;
	finalPeriodElement.title = validInput ? formatTime(finalPeriod) : null;
	mask(finalPeriodElement);

	var resonantPeriodElement = document.getElementById(sectionID + "-resonantPeriod");
	resonantPeriodElement.value = validInput ? resonantPeriod : null;
	resonantPeriodElement.title = validInput ? formatTime(resonantPeriod) : null;
	mask(resonantPeriodElement);

	var deltaPeriodElement = document.getElementById(sectionID + "-deltaPeriod");
	deltaPeriodElement.value = validInput ? finalPeriod - resonantPeriod : null;
	deltaPeriodElement.title = validInput ? formatTime(finalPeriod - resonantPeriod) : null;
	mask(deltaPeriodElement);
}

function getSemiMajorAxis(apoapsis, periapsis, body) {
	return (apoapsis + periapsis + body.radius * 2) / 2;
}

function getSemiMajorAxisFromPeriod(period, body) {
	return Math.pow((body.gravParameter * Math.pow(period, 2)) / (4 * Math.pow(Math.PI, 2)), 1 / 3);
}

function getOrbitalSpeed(altitude, semiMajorAxis, body) {
	var radius = altitude + body.radius;
	return Math.sqrt(body.gravParameter * ((2 / radius) - (1 / semiMajorAxis)));
}

function getOrbitEccentricity(apoapsis, periapsis, body) {
	return ((apoapsis + body.radius) - (periapsis + body.radius)) / ((apoapsis + body.radius) + (periapsis + body.radius));
}

function getOrbitPeriod(semiMajorAxis, body) {
	return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / body.gravParameter);
}

// remove all options except for the first one on the list (the default option)
function removeOptions(id) {
	// find the specified element
	var element = document.getElementById(id);
	// reset the selected index
	element.selectedIndex = 0;
	// iterate over the list backwards
	for (var i = element.options.length - 1; i >= 1; i--) {
		element.remove(i);
	}
}

// format the time in (y d h m s) format
function formatTime(timeSpan) {
	var timeSpanAbs = Math.abs(timeSpan);

	var years = Math.floor(timeSpanAbs / (60 * 60 * 24 * 365));
	timeSpanAbs -= years * (60 * 60 * 24 * 365);

	var days = Math.floor(timeSpanAbs / (60 * 60 * 24));
	timeSpanAbs -= days * (60 * 60 * 24);

	var hours = Math.floor(timeSpanAbs / (60 * 60));
	timeSpanAbs -= hours * (60 * 60);

	var mins = Math.floor(timeSpanAbs / (60));
	timeSpanAbs -= mins * (60);

	var seconds = formatNumber(timeSpanAbs, 3);
	timeSpanAbs -= seconds;

	var outputString = "";

	var firstLevelFound = false;

	if (years > 0 || firstLevelFound) { outputString += years + "y "; firstLevelFound = true; }
	if (days > 0 || firstLevelFound) { outputString += days + "d "; firstLevelFound = true; }
	if (hours > 0 || firstLevelFound) { outputString += hours + "h "; firstLevelFound = true; }
	if (mins > 0 || firstLevelFound) { outputString += mins + "m "; firstLevelFound = true; }
	if (seconds > 0 || firstLevelFound) { outputString += seconds + "s "; firstLevelFound = true; }

	return outputString;
}

// better rounding function that rounds to specified decimal places
function formatNumber(number, decimalPlaces = 0) {
	var multiplier = Math.pow(10, decimalPlaces);
	number = Math.round(number * multiplier);
	number = number / multiplier;

	return number;
}

function mask(element, decimalPlaces = 3) {
	element.setAttribute('data-unmasked', element.value);
	element.value = formatNumber(element.value, decimalPlaces);
}

function unmask(element) {
	element.value = element.getAttribute('data-unmasked') || '';
}

// load data from JSON file
loadData();