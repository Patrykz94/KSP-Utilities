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
		this.parentId = bodyArray.parentId;
		this.hasParent = this.parentId != null;

		if (this.mass == 0 || this.mass == null) {
			this.calculateMass();
		}
		if (this.gravParameter == 0 || this.gravParameter == null) {
			this.calculateGravParam();
		}

		this.synchronousHeight = Math.pow((this.gravParameter * Math.pow(this.rotationPeriod, 2)) / (4 * Math.pow(Math.PI, 2)), 1 / 3) - this.radius;
	}

	calculateMass() {
		this.mass = this.gravParameter * 6.6743e-11;
	}

	calculateGravParam() {
		this.gravParameter = this.mass * 6.6743e-11;
	}
}

var allPlanets = new PlanetManager();

// fetching the JSON file with all planet and star data
{
	// fetch('./data/bodyData.json')
	// 	.then(function (response) {
	// 		return response.json();
	// 	})
	// 	.then(function (data) {
	// 		// load the star system with all planets
	// 		createStarSystems(data);
	// 		// once we have all data loaded, populate the star system dropdowns
	// 		populateSystems();
	// 	});
}

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
	radiusElement.value = typeof (body.radius) == "number" ? body.radius / 1000 : null;

	var atmHeightElement = document.getElementById(sectionID + "-atmHeight");
	atmHeightElement.value = (typeof (body.atmHeight) == "number") && body.atmHeight > 0 ? body.atmHeight / 1000 : null;

	var spaceHighElement = document.getElementById(sectionID + "-spaceHigh");
	spaceHighElement.value = typeof (body.spaceHigh) == "number" ? body.spaceHigh / 1000 : null;

	var synchronousAltElement = document.getElementById(sectionID + "-synchronousAlt");
	synchronousAltElement.value = typeof (body.synchronousHeight) == "number" ? body.synchronousHeight / 1000 : null;

	var periodElement = document.getElementById(sectionID + "-rotationPeriod");
	var obtPeriod = body.rotationPeriod;
	periodElement.value = typeof (obtPeriod) == "number" ? obtPeriod : null;
	periodElement.title = formatTime(obtPeriod);

	recalculateOrbitData(sectionID);
}

function recalculateOrbitData(sectionID) {
	// Get selected body ID
	var bodyElement = document.getElementById(sectionID + "-body");
	var bodyID = bodyElement.options[bodyElement.selectedIndex].value;
	var body = allPlanets.getBody(bodyID);

	var currentApo = document.getElementById(sectionID + "-apoapsis").value * 1000;
	var currentPeri = document.getElementById(sectionID + "-periapsis").value * 1000;

	var validInput = currentApo != 0 && currentPeri != 0;

	var semiMajorAxis = getSemiMajorAxis(currentApo, currentPeri, body);

	var smaElement = document.getElementById(sectionID + "-semiMajorAxis");
	smaElement.value = validInput ? semiMajorAxis / 1000 : null;

	var apoSpeedElement = document.getElementById(sectionID + "-apoSpeed");
	apoSpeedElement.value = validInput ? getOrbitalSpeed(currentApo, semiMajorAxis, body) : null;

	var periSpeedElement = document.getElementById(sectionID + "-periSpeed");
	periSpeedElement.value = validInput ? getOrbitalSpeed(currentPeri, semiMajorAxis, body) : null;

	var eccElement = document.getElementById(sectionID + "-eccentricity");
	eccElement.value = validInput ? getOrbitEccentricity(currentApo, currentPeri, body) : null;

	var periodElement = document.getElementById(sectionID + "-period");
	var obtPeriod = getOrbitPeriod(semiMajorAxis, body);
	periodElement.value = validInput ? obtPeriod : null;
	periodElement.title = validInput ? formatTime(obtPeriod) : null;
}

function getSemiMajorAxis(apoapsis, periapsis, body) {
	return (apoapsis + periapsis + body.radius * 2) / 2;
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

// format the time in (y d h m s) format for the tool tip
function formatTime(timeSpan) {
	var years = Math.floor(timeSpan / (60 * 60 * 24 * 365));
	timeSpan -= years * (60 * 60 * 24 * 365);

	var days = Math.floor(timeSpan / (60 * 60 * 24));
	timeSpan -= days * (60 * 60 * 24);

	var hours = Math.floor(timeSpan / (60 * 60));
	timeSpan -= hours * (60 * 60);

	var mins = Math.floor(timeSpan / (60));
	timeSpan -= mins * (60);

	var seconds = Math.floor(timeSpan);
	timeSpan -= seconds;

	var outputString = "";

	var firstLevelFound = false;

	if (years > 0 || firstLevelFound) { outputString += years + "y "; firstLevelFound = true; }
	if (days > 0 || firstLevelFound) { outputString += days + "d "; firstLevelFound = true; }
	if (hours > 0 || firstLevelFound) { outputString += hours + "h "; firstLevelFound = true; }
	if (mins > 0 || firstLevelFound) { outputString += mins + "m "; firstLevelFound = true; }
	if (seconds > 0 || firstLevelFound) { outputString += seconds + "s "; firstLevelFound = true; }

	return outputString;
}

loadData();

formatTime(86164.098903691);