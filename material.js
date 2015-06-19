/**
 (C) 2015 Sander de Jong - www.ugoku.nl
 Licenced under the GPL v2
**/


/**
 * Convert a 6-character hexadecimal color code to HSL
 *
 * @param {string} colorHex
 *
 * @returns {{h: number, s: number, l: number}}
 */
function hex2hsl(colorHex)
{
	// Adapted from https://github.com/atadams/Hex-to-HSL-Color/blob/master/Hex-to-HSL-color.py
	colorHex = colorHex.replace('#', '');

	var rHex = colorHex.substr(0, 2);
	var gHex = colorHex.substr(2, 2);
	var bHex = colorHex.substr(4, 2);

	var rDec = parseInt(rHex, 16);
	var gDec = parseInt(gHex, 16);
	var bDec = parseInt(bHex, 16);

	var rFraction = rDec / 255;
	var gFraction = gDec / 255;
	var bFraction = bDec / 255;

	var min = Math.min(rFraction, gFraction, bFraction);
	var max = Math.max(rFraction, gFraction, bFraction);
	var delta = max - min;

	var luminance = (max + min) / 2;
	var hue = 0;
	var saturation = 0;

	if (delta != 0) {
		if (luminance < 0.5) {
			saturation = delta / (max + min);
		} else {
			saturation = delta / (2 - max - min);
		}

		var rDelta = (((max - rFraction) / 6) + (delta / 2)) / delta;
		var gDelta = (((max - gFraction) / 6) + (delta / 2)) / delta;
		var bDelta = (((max - bFraction) / 6) + (delta / 2)) / delta;

		if (rFraction == max) {
			hue = bDelta - gDelta;
		} else if (gFraction == max) {
			hue = (1/3) + rDelta - bDelta;
		} else if (bFraction == max) {
			hue = (2/3) + gDelta - rDelta;
		}
		while (hue < 0) {
			hue++;
		}
		while (hue > 1) {
			hue--;
		}
	}

	return {
		h: hue,
		s: saturation,
		l: luminance
	}
}


/**
 * Converts an HSL-combination to a hexadecimal color code
 *
 * @param {number} h Hue
 * @param {number} s Saturation
 * @param {number} l Lightness
 *
 * @returns {string}
 */
function hsl2hex(h, s, l)
{
	var rgb = hsl2rgb(h, s, l);
	var r_hex = rgb.r.toString(16);
	var g_hex = rgb.g.toString(16);
	var b_hex = rgb.b.toString(16);

	if (r_hex.length == 1)
		r_hex = '0' + r_hex;
	if (g_hex.length == 1)
		g_hex = '0' + g_hex;
	if (b_hex.length == 1)
		b_hex = '0' + b_hex;

	return '#' + r_hex + g_hex + b_hex;
}


/**
 * Converts an HSL-combination to an RGB-combination
 *
 * @param {number} h Hue
 * @param {number} s Saturation
 * @param {number} l Lightness
 *
 * @returns {{r: number, g: number, b: number}}
 */
function hsl2rgb(h, s, l)
{
	// From http://stackoverflow.com/a/9493060/2139592
	var r, g, b;
	if (s == 0) {
		r = g = b = l;
	} else {
		h = h / 360;
		s = s / 100;
		l = l / 100;
		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	};
}


/**
 * Converts an HSL-combination to an HSL-string for use in CSS
 *
 * @param {number} h Hue
 * @param {number} s Saturation
 * @param {number} l Lightness
 *
 * @returns {string}
 */
function hslCSS(h,s,l)
{
	return 'hsl(' + Math.round(h) + ', ' + Math.round(s) + '%, ' + Math.round(l) + '%)';
}


//TODO: figure out what p and q mean
function hue2rgb(p, q, hue) {
	if (hue < 0) {
		hue++;
	}
	if (hue > 1) {
		hue--;
	}
	if (hue < 1/6) {
		return p + (q - p) * 6 * hue;
	}
	if (hue < 1/2) {
		return q;
	}
	if (hue < 2/3) {
		return p + (q - p) * (2/3 - hue) * 6;
	}
	return p;
}


/**
 * Sets the color of one of the elements
 *
 * @param {string} element ID of a DOM element
 *
 * @param {number} h Hue
 * @param {number} s Saturation
 * @param {number} l Lightness
 */
function setColor(element, h, s, l)
{
	var el = document.getElementById(element);
	el.style.backgroundColor = hslCSS(h, s, l);
	//el.firstElementChild.innerHTML = 'hsl(' + Math.round(h) + ', ' + Math.round(s) + '%, ' + Math.round(l) + '%)';
	el.firstElementChild.classList.remove('light');
	if (l < 50) {
		el.firstElementChild.classList.add('light');
	}
	el.firstElementChild.innerHTML = hsl2hex(Math.round(h), Math.round(s), Math.round(l));
}


/**
 * Update all the colors
 */
function updateColors()
{
	var hsl = hex2hsl(document.getElementById('colorPick').value);

	var h = hsl.h * 360;
	var s = hsl.s * 100;
	var l = hsl.l * 100;

	var lighterColors = [{
		element: 'c_50',
		factor: 0.13
	}, {
		element: 'c_100',
		factor: 0.31
	}, {
		element: 'c_200',
		factor: 0.5
	}, {
		element: 'c_300',
		factor: 0.7
	}, {
		element: 'c_400',
		factor: 0.85
	}];
	lighterColors.forEach(function(color){
		var newS = (s * color.factor);
		var newL = ((l * color.factor) + 100) / (1 + color.factor);
		setColor(color.element, h, newS, newL);
	});

	document.getElementById('c_500').style.backgroundColor = hslCSS(h, s, l);

	var darkerColors = [{
		element: 'c_600',
		factor: 0.91
	}, {
		element: 'c_700',
		factor: 0.81
	}, {
		element: 'c_800',
		factor: 0.71
	}, {
		element: 'c_900',
		factor: 0.52
	}];
	darkerColors.forEach(function(color){
		var newS = (s * color.factor);
		var newL = (l * color.factor);
		setColor(color.element, h, newS, newL);
	});
}


document.getElementById('colorPick').addEventListener('change', updateColors);
updateColors();