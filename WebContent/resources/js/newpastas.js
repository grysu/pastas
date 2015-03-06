var timeline;
var contacts;
google.load('visualization', '1');
google.setOnLoadCallback(createTimeline);

var DAY_IN_MILLISECONDS = 86400000;
var MONTH_IN_MILLISECONDS = DAY_IN_MILLISECONDS * 28;
var QUARTER_IN_MILLISECONDS = MONTH_IN_MILLISECONDS * 4;

var minDate = new Date(2010, 2, 7);
var maxDate = new Date(2012, 2, 7);

// var options = {
// // 'width': '100%',
// 'height' : 'auto',
// 'style' : 'dot',
// 'axisOnTop' : true,
// // 'cluster': true
// 'eventMargin' : 5,
// 'eventMarginAxis' : 0,
// 'groupsOrder' : false, //alphabetically if true
// // 'showCurrentTime': true,
// // 'showNavigation': true,
// 'zoomMax' : 3157056000000, //100 years
// 'zoomMin' : 60000
// };

/**
 * set mindate and maxdate for timeline based on events. This function will take
 * the earlyest date as mindate, the most resent date as maxdate,
 * 
 * @returns {undefined}
 */
function setTimelineDates() {
	if (contacts.length > 0) {
		var firstdate = new Date(contacts[0].startDate);
		var lastdate = new Date(contacts[0].endDate);
		for (var i = 0; i < contacts.length; i++) {
			if (firstdate > new Date(contacts[i].startDate)) {
				firstdate = new Date(contacts[i].startDate);
			}
			if (lastdate < new Date(contacts[i].endDate)) {
				lastdate = new Date(contacts[i].endDate);
			}
		}
        var days = 30;
        minDate = new Date(firstdate.getTime() - days * DAY_IN_MILLISECONDS);
        maxDate = new Date(lastdate.getTime() + days * DAY_IN_MILLISECONDS);
	}

}

function setContacts(contact) {
	contacts = jQuery.parseJSON(contact);
	setTimelineDates();
	createTimeline();
}
function createTimeline() {
	var options = {
		// localization
		'locale' : 'no',
		// layout
		'width' : '100%',
//		'minHeight' : '500px',
		'showCurrentTime' : false,
		'axisOnTop' : true,
		'eventMargin' : 10, // minimal margin between events
		'eventMarginAxis' : 0, // minimal margin between events and the axis
		// default event style
		'style' : 'dot',
		'stackEvents' : false,
		'showMinorLabels' : true,
		'showMajorLabels' : true,
		// interaction
		// 'selectable': selectable,
		'editable' : false,
		// 'zoomable': visualizationOptions.zoom,
		// 'moveable': visualizationOptions.zoom,
		// time
		'zoomMin' : DAY_IN_MILLISECONDS, // one day in ms
		'min' : minDate,
		'max' : maxDate,
		'start' : minDate,
		'end' : maxDate
	};
	var data = new google.visualization.DataTable();
	data.addColumn('datetime', 'start');
	data.addColumn('datetime', 'end');
	data.addColumn('string', 'content');
	data.addColumn('string', 'group');

	// load data and create the timeline here
	for (var i = 0; i < contacts.length; i++) {
		// var date = new Date(contacts[i].startDate);
		if (contacts[i].startDate === contacts[i].endDate) {
			data.addRow([ new Date(contacts[i].startDate), , ,
					contacts[i].service ]);
		} else {
			data.addRow([ new Date(contacts[i].startDate),
					new Date(contacts[i].endDate), , contacts[i].service ]);
		}
	}
	// Instantiate our timeline object.
	timeline = new links.Timeline(document.getElementById('timeline'), options);
	// Draw our timeline with the created data and options
	timeline.draw(data);
}