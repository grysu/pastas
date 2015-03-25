var timeline;
var contacts; // list of contacts for current PID
var onlyStroke;
google.load('visualization', '1');
google.setOnLoadCallback(createTimeline);

var DAY_IN_MILLISECONDS = 86400000;
var MONTH_IN_MILLISECONDS = DAY_IN_MILLISECONDS * 28;
var QUARTER_IN_MILLISECONDS = MONTH_IN_MILLISECONDS * 4;

var minDate = new Date(2010, 2, 7);
var maxDate = new Date(2012, 2, 7);

var data;

var selectedContact;
var selectedContactClasses;

/**
 * set mindate and maxdate for timeline based on events. This function will take
 * the earliest date as mindate, the most resent date as maxdate,
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
		// minDate = new Date(firstdate.getTime() - days * DAY_IN_MILLISECONDS);
		minDate = new Date(2010, 2, 1);
		maxDate = new Date(lastdate.getTime() + days * DAY_IN_MILLISECONDS);
//		alert(maxDate);
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
		// 'height' : '43px',
		// 'minHeight' : '500px',
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
		'selectable' : true,
		'editable' : false,
		// time
		'zoomMin' : DAY_IN_MILLISECONDS,
		'min' : minDate,
		'max' : maxDate,
		'start' : minDate,
		'end' : maxDate
	};
	data = new google.visualization.DataTable();
	data.addColumn('datetime', 'start');
	data.addColumn('datetime', 'end');
	data.addColumn('string', 'content');
	data.addColumn('string', 'group');
	data.addColumn('string', 'className');
	data.addColumn('string', 'service');
	data.addColumn('string', 'groupName');
	data.addColumn('string', 'ageGroup');

	// load data and create the timeline here

	// for (var i = 0; i < contacts.length; i++) {
	// if (contacts[i].startDate === contacts[i].endDate) {
	// data.addRow([ new Date(contacts[i].startDate), , ,
	// contacts[i].service, checkStrokeDiganose(contacts[i]) ]);
	// } else {
	// data.addRow([ new Date(contacts[i].startDate),
	// new Date(contacts[i].endDate), , contacts[i].service,
	// checkStrokeDiganose(contacts[i]) ]);
	// }
	// }
	for (var i = 0; i < contacts.length; i++) {
		if (contacts[i].startDate === contacts[i].endDate) {
			data.addRow([
					new Date(contacts[i].startDate),
					,
					,
					contacts[i].groupName,
					"group" + contacts[i].diagnoseGroup + " "
							+ checkStrokeDiganose(contacts[i]),
					contacts[i].service, contacts[i].groupName,
					contacts[i].ageGroup ]);
		} else {
			data.addRow([
					new Date(contacts[i].startDate),
					new Date(contacts[i].endDate),
					,
					contacts[i].groupName,
					"group" + contacts[i].diagnoseGroup + " "
							+ checkStrokeDiganose(contacts[i]),
					contacts[i].service, contacts[i].groupName,
					contacts[i].ageGroup ]);
		}
	}
	// data.setValue(0, 3, data.getValue(0,3)+"newContent");

	// Instantiate the timeline object.
	timeline = new links.Timeline(document.getElementById('timeline'), options);
	// Add event listeners
	 google.visualization.events.addListener(timeline, 'select', onselect);
	// Draw the timeline with the created data and options
	timeline.draw(data);
	// alert(data.getValue(0,6));
}

function checkStrokeDiganose(contact) {
	// return contact.service;
	// return "group"+contact.diagnoseGroup;
	if (contact.stroke == -1) {
		return "unknown";
	} else if (contact.stroke == 0) {
		return "nostroke";
	} else if (contact.stroke == 1) {
		return "stroke";
	}
	return "";
}

function strokeDiagnose() {
	var onlyStroke = $('input[name="j_idt16:stroke"]:checked').val();
	if (onlyStroke == "true") {
		$('.nostroke').css('visibility', 'hidden');
	} else {
		$('.nostroke').css('visibility', 'visible');
	}

}

function changeGrouping() {
	var groupService = $('input[name="j_idt16:grouping"]:checked').val();
	if (groupService == "true") {
		for (var i = 0, maxrows = data.getNumberOfRows(); i < maxrows; i++) {
			data.setValue(i, 3, data.getValue(i,5));
		}
	} else {
		for (var i = 0, maxrows = data.getNumberOfRows(); i < maxrows; i++) {
			data.setValue(i, 3, data.getValue(i,6));
		}
	}
	updateTimeline();
}

function getSelectedRow() {
    var row = undefined;
    var sel = timeline.getSelection();
    if (sel.length) {
        if (sel[0].row != undefined) {
            row = sel[0].row;
        }
    }
    return row;
}

function updateTimeline() {
	timeline.draw(data);
	strokeDiagnose();
}

var onselect = function (event) {
	if(selectedContact!=undefined){
		data.setValue(selectedContact, 4, selectedContactClasses);
	}
    selectedContact = getSelectedRow();
    selectedContactClasses = data.getValue(selectedContact, 4);
    if (selectedContact != undefined) {
    	data.setValue(selectedContact, 4, selectedContactClasses + " selected");
        document.getElementById("info").innerHTML = "item " + selectedContact + " selected<br>";
        document.getElementById("info").innerHTML += "start: " + data.getValue(selectedContact, 0) + " <br>";
        document.getElementById("info").innerHTML += "end: " + data.getValue(selectedContact, 1) + " <br>";
        document.getElementById("info").innerHTML += "service: " + data.getValue(selectedContact, 5) + " <br>";
        document.getElementById("info").innerHTML += "group: " + data.getValue(selectedContact, 6) + " <br>";
        document.getElementById("info").innerHTML += "age group: " + data.getValue(selectedContact, 7) + " <br>";
    }
    updateTimeline();
};


//data.addColumn('datetime', 'start');
//data.addColumn('datetime', 'end');
//data.addColumn('string', 'content');
//data.addColumn('string', 'group');
//data.addColumn('string', 'className');
//data.addColumn('string', 'service');
//data.addColumn('string', 'groupName');
//data.addColumn('string', 'ageGroup');

function test() {
	alert("SLUTT DA!");
}