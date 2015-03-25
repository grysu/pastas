/**
 * Copyright (C) 2013 Håkon Dale Wågbø. 
 * All right reserved.
 * 
 * This software is the proprietary information of Håkon Dale Wågbø.
 * Contact: haakon.dw@gmail.com
 * 
 * Use, distribution or modification of source 
 * NOT ALLOWED without approval of copyright holder.
 * 
 */

var timelineData;
var categories;
var minDate = new Date(2011, 12, 0, 0, 0, 0);
var maxDate = new Date(2014, 0, 1, 0, 0, 0);
var timelines;
var tooltipEvent;
var selections; //List that holds selected events/trajectories
var DAY_IN_MILLISECONDS = 86400000;
var MONTH_IN_MILLISECONDS = DAY_IN_MILLISECONDS * 28;
var QUARTER_IN_MILLISECONDS = MONTH_IN_MILLISECONDS * 4;
var visualizationOptions = {
    navigation: false,
    zoom: false,
    showCurrentTime: false,
    bottomTimeAxes: false,
    tooltips: true,
    lanes: true,
    paddingDays: '30',
    autoLaneHeight: false,
    laneHeight: '38',
    stackEvents: false
};
$ = jQuery;
/**
 * Check if current page holds an event question (a question that
 * requires the user  to select events/trajectories)
 * @returns {undefined}
 */
function isEventQuestion() {
    var selector = $("input.eventsInput:eq(0)");
    if (selector.length === 0) {
        return false;
    } else {
        if (selector.val().length > 0) {
            selections = selector.val().split(';;;');
        } else {
            selections = new Array();
        }
        return true;
    }
}
/**
 * Returns Date as String
 * @param {type} date
 * @returns {String}
 */
function formatDate(date) {
    var day = date.getDate();
    var month = date.getMonth();
    month++;
    var year = date.getFullYear();
    return (day + "-" + month + "-" + year);
}

/**
 * set mindate and maxdate for timeline based
 * on events. This function will take the earlyest date as mindate,
 * the most resent date as maxdate, and add a 30 day padding.
 * @returns {undefined}
 */
function setTimelineDates() {
    if (timelineData.length > 0) {
        var firstdate = timelineData[0]["events"][0]["start"];
        var lastdate = timelineData[0]["events"][0]["start"];
        for (var i = 0; i < timelineData.length; i++) {
            for (var j = 0; j < timelineData[i]["events"].length; j++) {
                if (firstdate > timelineData[i]["events"][j]["start"]) {
                    firstdate = timelineData[i]["events"][j]["start"];
                } else if (timelineData[i]["events"][j]["end"] !== undefined && timelineData[i]["events"][j]["end"] !== null && lastdate < timelineData[i]["events"][j]["end"]) {
                    lastdate = timelineData[i]["events"][j]["end"];
                } else if (lastdate < timelineData[i]["events"][j]["start"]) {
                    lastdate = timelineData[i]["events"][j]["start"];
                }
            }
        }
        var days = visualizationOptions.paddingDays;
        minDate = new Date(firstdate.getTime() - days * DAY_IN_MILLISECONDS);
        maxDate = new Date(lastdate.getTime() + days * DAY_IN_MILLISECONDS);
    }

}

/**
 * Creates and draws the timeline
 * @returns {undefined}
 */
function drawVisualization() {
    if (timelineData !== undefined) {
        timelines = new Array();
        // specify options
        var selectable = false;
        var options = {
            //localization
            'locale': 'no',
            // layout
            'width': '100%',
            'minHeight': '50px',
            'showCurrentTime': visualizationOptions.showCurrentTime,
            'axisOnTop': true,
            'eventMargin': 10, // minimal margin between events
            'eventMarginAxis': 0, // minimal margin between events and the axis
            // default event style
            'style': 'box',
            'stackEvents': visualizationOptions.stackEvents,
            'showMinorLabels': true,
            'showMajorLabels': true,
//        'box.align': 'right', //NOT WORKING, framework bug!
            // interaction
            'selectable': selectable,
            'editable': false,
            'zoomable': visualizationOptions.zoom,
            'moveable': visualizationOptions.zoom,
            // time
            'zoomMin': DAY_IN_MILLISECONDS, //one day in ms
            'min': minDate,
            'max': maxDate,
            'start': minDate,
            'end': maxDate
        };
        /* add time axis timeline */

        options.height = '43px';
        var titlecell = "";
        if (visualizationOptions.lanes) {
            titlecell = "<td class='lane-title'></td>";
        }
        var $newDiv = $("<tr>" + titlecell + "<td><div id='timeaxis-timeline'/></td></tr>");
        $("#events").append($newDiv);
        options.width = $("#timeaxis-timeline").width() + "px";
        var timeline = new links.Timeline(document.getElementById("timeaxis-timeline"));
        timeline.draw(new Array(), options);
        timelines.push(timeline);
        options.showMinorLabels = false;
        options.showMajorLabels = false;

        /* set lane height */
        if (visualizationOptions.autoLaneHeight) {
            options.height = 'auto';
        } else {
            options.height = visualizationOptions.laneHeight + "px";


        }
        /* drop the lanes */
        if (visualizationOptions.lanes === false) {

            /* gather all events */
            var events = new Array();
            for (var i = 0; i < timelineData.length; i++) {
                for (var j = 0; j < timelineData[i]["events"].length; j++) {
                    events.push(timelineData[i]["events"][j]);
                }
            }
            /* navigation */
            if (visualizationOptions.navigation) {
                options.showNavigation = true;
            } else {
                options.showNavigation = false;
            }

            // create timeline for category
            var $newDiv = $("<tr><td><div id='noLanesTimeline' style='width: 100%'></td></tr>");
            $("#events").append($newDiv);
            options.width = $("#noLanesTimeline").width() + "px";
            var timeline = new links.Timeline(document.getElementById("noLanesTimeline"));
            timeline.addItemType('entryCluster', ItemEntryCluster);
            timeline.draw(events, options);
            timelines.push(timeline);
        } else {

            // create timelines (one timeline per category found)

            for (var i = 0; i < timelineData.length; i++) {
                var lane = timelineData[i];
                // add navigation panel for the top timeline
                if (visualizationOptions.navigation && i === 0) {
                    options.showNavigation = true;
                } else {
                    options.showNavigation = false;
                }

                // get events for each category
                var laneEvents = lane["events"];
                // create timeline for category
                var $newDiv = $("<tr><td class='lane-title'>" + lane["title"] + "</td><td><div id='timeline" + i + "'/></td></tr>");
                $("#events").append($newDiv);
                options.width = $("#timeline" + i).width() + "px";
                options.height = $("#timeline" + i).parent().height() + "px";
                // instantiate timeline object
                var timeline = new links.Timeline(document.getElementById("timeline" + i));
                timeline.addItemType('entryCluster', ItemEntryCluster);
                timeline.draw(laneEvents, options);
                timelines.push(timeline);
            }
        }




        for (var i = 0; i < timelines.length; i++) {
            var onSelectListener = new Function('if (' + isEventQuestion() + ') {'
                    + 'var sel = timelines[' + i + '].getSelection();'
                    + 'if (sel.length > 0) {'
                    + 'if (sel[0].row !== undefined) {'
                    + 'var row = sel[0].row;'
                    + 'var event = timelines[' + i + '].getData()[row];'
                    + 'if (isInSelections(event)) {'
                    + 'unselectEvent(event);'
                    + '} else {'
                    + 'selectEvent(event);'
                    + '}'
                    + '$(\".timeline-event-content\").qtip(\"destroy\", true);'
                    + 'var input = \"\";'
                    + 'for(var k=0; k<selections.length; k++){'
                    + 'if(k===0){ input = selections[k]; }else{input = input + \";;;\" + selections[k];}'
                    + '}'
                    + '$(\"input.eventsInput:eq(0)\").val(input);'
                    + '$(\"span.eventsInputCount:eq(0)\").html(selections.length);'
                    + 'timelines[' + i + '].redraw();'
                    + 'if(visualizationOptions.tooltips){createDetailTooltips()};'
                    + '} else {}}}');
            links.events.addListener(timelines[i], 'select', onSelectListener);
            var rangeChangeListener = new Function('var range = timelines[' + i + '].getVisibleChartRange();for(var j=0; j<timelines.length; j++){if(j !== ' + i + '){timelines[j].setVisibleChartRange(range.start, range.end);}}');
            links.events.addListener(timelines[i], 'rangechange', rangeChangeListener);
        }
        if (visualizationOptions.tooltips) {
            createDetailTooltips();
        }

    }
}
onResize = function() {

    redrawTimelines();
};
$(window).bind('resize', onResize);
function redrawTimelines() {
    $("#events").html("");
    drawVisualization();
}
function createDetailTooltips() {
    $('.timeline-event-content').qtip({
        style: {
            classes: 'qtip-shadow qtip-bootstrap nowrap',
            tip: {corner: true}
        },
        position: {
            my: 'top center',
            at: 'bottom center'
        },
        content: {text: function() {
                var eventId = $(this).find(".details-data").attr("data-eventid");
                tooltipEvent = findEventById(eventId);
                if (tooltipEvent !== null) {
                    var details = tooltipEvent["details"];
                    var conditionalString = "";

                    // add details that are available
                    if (details !== undefined && details !== null) {
                        var split = details.split(";;;");
                        for (var i = 0; i < split.length; i++) {
                            conditionalString += split[i] + "<br/>";
                        }
                    }
                    return "<div>"
                            + conditionalString
                            + "</div>";
                }

            }, title: function() {
                if (tooltipEvent === undefined && tooltipEvent === null) {
                    var eventId = $(this).find(".details-data").attr("data-eventid");
                    tooltipEvent = findEventById(eventId);
                }
                if (tooltipEvent !== null) {
                    return "<b>" + tooltipEvent["detailsTitle"] + "</b>";
                }
            }
        }});
}


function createTooltip(id, title, content) {
    $(id).parent().qtip({
        style: {
            classes: 'qtip-shadow qtip-bootstrap nowrap',
            tip: {corner: true}
        },
        position: {
            my: 'top center',
            at: 'bottom center'
        },
        content: {text: function() {
                return content;
            }
            , title: function() {
                return title;
            }
        }});
}
/**
 * Find event by id
 * @param {type} id
 * @returns event if found, else null
 */
function findEventById(id) {
    for (var k = 0; k < timelineData.length; k++) {
        for (var j = 0; j < timelineData[k]["events"].length; j++) {
            if (id === timelineData[k]["events"][j]["id"]) {
                return timelineData[k]["events"][j];
            }
        }
    }
    return null;
}

/**
 * Return datetime as a formated string (dd/MM/yyyy - "kl." HH:mm)
 * @param {type} datetime
 * @returns {String}
 */
function getDatetimeString(datetime) {
    var hours;
    if (datetime.getHours() < 10) {
        hours = "0" + datetime.getHours();
    } else {
        hours = datetime.getHours();
    }
    var minutes;
    if (datetime.getMinutes() < 10) {
        minutes = "0" + datetime.getMinutes();
    } else {
        minutes = datetime.getMinutes();
    }
    return datetime.getDate()
            + "/" + (datetime.getMonth() + 1)
            + "/" + datetime.getFullYear()
            + " - kl. " + hours + ":" + minutes;
}

/**
 * Check if an event is in selections list
 * @param {type} event
 * @returns {Boolean}
 */
function isInSelections(event) {
    var id = event["id"];
    if (selections.length < 1) {
        return false;
    } else {
        for (var i = 0; i < selections.length; i++) {
            if (selections[i] == id) {
                return true;
            }
        }
        return false;
    }
}

/**
 * Put event in selections list and give is selected-style
 * @param {type} event
 * @returns {undefined}
 */
function selectEvent(event) {
    if (selections.length === 0) {
        // unselect alternative buttons in question
        $('#questions-form\\:datatable\\:0\\:resetOptions').click();
    }
    selections.push(event["id"]);
    var newClassName;
    if (event["className"] !== undefined) {
        newClassName = event["className"] + " question-selected";
    } else {
        newClassName = "question-selected";
    }
    event["className"] = newClassName;
}

/**
 * Remove event from selections list and remove selected-style
 * @param {type} event
 * @returns {undefined}
 */
function unselectEvent(event) {
    if (event["className"] !== undefined) {
        var className = replaceAll("question-selected", "", event["className"]);
        event["className"] = className;
    }

    selections = jQuery.grep(selections, function(value) {
        return value !== event["id"];
    });
}

function unselectAll() {
    $("input.eventsInput:eq(0)").val("");
    $("span.eventsInputCount:eq(0)").html("0");
    var sel = selections.slice(0);
    for (var i = 0; i < sel.length; i++) {
        var event = findEventById(sel[i]);
        unselectEvent(event);
    }

    redrawTimelines();
}
function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}


var isShowTimeline = false;
function showTimelineSection() {
    if (isShowTimeline) {
        hideTimelineSection();
    } else {
        var outerWrapperHeight = $("#timeline-wrapper-outer").height();
        if (outerWrapperHeight !== undefined) {
            $("#timeline-wrapper-outer").css("height", outerWrapperHeight + "px");
        }
        var width = $("#slidedown").width();
        $("#slidedown").css("width", width + "px");
        $("#slidedown").addClass("ui-shadow");
//        $("#slidedown").css("border", "1px solid #AFAFAF");
        $("#slidedown").css("border-radius", "0px 0px 5px 5px");
        $("#slidedown").css("-moz-border-radius", "0px 0px 5px 5px");
        $("#slidedown").css("display", "none");
        $("#slidedown").css("position", "fixed");
        $("#slidedown").css("padding-top", "10px");

        var topHeight = $("#top").outerHeight(true);
        $("#slidedown").css("top", topHeight + "px");

        $("#slidedown").slideDown(400, function() {
        });

        $("#dialogs\\:showTimlineButton").blur();
        isShowTimeline = true;

    }

}
function hideTimelineSection() {
    $("#slidedown").slideUp(200, function() {
        $("#slidedown").removeClass("ui-shadow");
        $("#slidedown").css("position", "relative");
        $("#slidedown").css("top", "");
        $("#slidedown").css("display", "block");
        $("#slidedown").css("border", "");
        $("#slidedown").css("border-radius", "");
        $("#slidedown").css("-moz-border-radius", "");
        $("#slidedown").css("padding-top", "");
        $("#slidedown").css("width", "");

        isShowTimeline = false;
    });


}

$(window).scroll(function() {
    if (timelineData !== undefined) {
        if (!isScrolledIntoView("#timeline-wrapper")) {
            $("#dialogs\\:showTimlineButton").css("visibility", "visible");
        } else {
            $("#dialogs\\:showTimlineButton").css("visibility", "hidden");
        }
        if (isShowTimeline) {
            PF('showTimelineButton').uncheck();
            hideTimelineSection();
            $("#dialogs\\:showTimlineButton").removeClass("ui-state-hover");
            $("#dialogs\\:showTimlineButton").blur();
        }
    }

});
function isScrolledIntoView(elem)
{
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom >= docViewTop) && (elemTop <= docViewBottom)
            && (elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}










/**
 * 
 * NEW ITEM TYPE
 * 
 */

/**
 * @constructor links.Timeline.ItemEntryCluster
 * @extends links.Timeline.Item
 * @param {Object} data       Object containing parameters start, end
 *                            content, group, type, className, editable.
 * @param {Object} [options]  Options to set initial property values
 *                                {Number} top
 *                                {Number} left
 *                                {Number} width
 *                                {Number} height
 */
var ItemEntryCluster = function(data, options) {
    links.Timeline.Item.call(this, data, options);
};
ItemEntryCluster.prototype = new links.Timeline.Item();
/**
 * Select the item
 * @override
 */
ItemEntryCluster.prototype.select = function() {
    var dom = this.dom;
    links.Timeline.addClassName(dom, 'timeline-event-selected');
};
/**
 * Unselect the item
 * @override
 */
ItemEntryCluster.prototype.unselect = function() {
    var dom = this.dom;
    links.Timeline.removeClassName(dom, 'timeline-event-selected');
};
/**
 * Creates the DOM for the item, depending on its type
 * @return {Element | undefined}
 * @override
 */
ItemEntryCluster.prototype.createDOM = function() {
    // background box
    var divBox = document.createElement("DIV");
    divBox.style.position = "absolute";
    // contents box
    var divContent = document.createElement("DIV");
    divContent.className = "timeline-event-content";
    divBox.appendChild(divContent);
    this.dom = divBox;
    this.updateDOM();
    return divBox;
};
/**
 * Append the items DOM to the given HTML container. If items DOM does not yet
 * exist, it will be created first.
 * @param {Element} container
 * @override
 */
ItemEntryCluster.prototype.showDOM = function(container) {
    var dom = this.dom;
    if (!dom) {
        dom = this.createDOM();
    }

    if (dom.parentNode != container) {
        if (dom.parentNode) {
            // container changed. remove the item from the old container
            this.hideDOM();
        }

        // append to the new container
        container.appendChild(dom);
        this.rendered = true;
    }
};
/**
 * Remove the items DOM from the current HTML container
 * The DOM will be kept in memory
 * @override
 */
ItemEntryCluster.prototype.hideDOM = function() {
    var dom = this.dom;
    if (dom) {
        if (dom.parentNode) {
            dom.parentNode.removeChild(dom);
        }
        this.rendered = false;
    }
};
/**
 * Update the DOM of the item. This will update the content and the classes
 * of the item
 * @override
 */
ItemEntryCluster.prototype.updateDOM = function() {
    var divBox = this.dom;
    if (divBox) {
        // update contents
        divBox.firstChild.innerHTML = this.content;
        // update class
        divBox.className = "timeline-event timeline-event-entryCluster";
        if (this.isCluster) {
            links.Timeline.addClassName(divBox, 'timeline-event-cluster');
        }

        // add item specific class name when provided
        if (this.className) {
            links.Timeline.addClassName(divBox, this.className);
        }

    }
};
/**
 * Reposition the item, recalculate its left, top, and width, using the current
 * range of the timeline and the timeline options. *
 * @param {links.Timeline} timeline
 * @override
 */
ItemEntryCluster.prototype.updatePosition = function(timeline) {
    var dom = this.dom;
    if (dom) {
        var contentWidth = timeline.size.contentWidth,
                left = timeline.timeToScreen(this.start),
                right = timeline.timeToScreen(this.end);
        // limit the width of the this, as browsers cannot draw very wide divs
        if (left < -contentWidth) {
            left = -contentWidth;
        }
        if (right > 2 * contentWidth) {
            right = 2 * contentWidth;
        }

        dom.style.top = this.top + "px";
        dom.style.left = left + "px";
        //dom.style.width = Math.max(right - left - 2 * this.borderWidth, 1) + "px"; 
        dom.style.width = Math.max(right - left, 1) + "px";
    }
};
/**
 * Check if the item is visible in the timeline, and not part of a cluster
 * @param {Number} start
 * @param {Number} end
 * @return {boolean} visible
 * @override
 */
ItemEntryCluster.prototype.isVisible = function(start, end) {
    if (this.cluster) {
        return false;
    }

    return (this.end > start)
            && (this.start < end);
};
/**
 * Reposition the item
 * @param {Number} left
 * @param {Number} right
 * @override
 */
ItemEntryCluster.prototype.setPosition = function(left, right) {
    var dom = this.dom;
    dom.style.left = left + 'px';
    dom.style.width = (right - left) + 'px';
    if (this.group) {
        this.top = this.group.top;
        dom.style.top = this.top + 'px';
    }
};
/**
 * Calculate the right position of the item
 * @param {links.Timeline} timeline
 * @return {Number} right
 * @override
 */
ItemEntryCluster.prototype.getRight = function(timeline) {
    return timeline.timeToScreen(this.end);
};
/**
 * Calculate the width of the item
 * @param {links.Timeline} timeline
 * @return {Number} width
 * @override
 */
ItemEntryCluster.prototype.getWidth = function(timeline) {
    return timeline.timeToScreen(this.end) - timeline.timeToScreen(this.start);
};



/**
 * Month and year picker
 */
var min = new Date(2012, 0, 1);
var max = new Date(2013, 11, 31);
function monthPicker() {
    $(".month-picker").datepicker({
        dateFormat: 'mm-yy',
        minDate: min,
        maxDate: max,
        monthNames: ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"],
        monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"],
        changeMonth: true,
        changeYear: true,
        showButtonPanel: true,
        closeText: "<span class='ui-button-icon-left ui-icon ui-c ui-icon-check' style='display: inline-flex'></span> Sett tidspunkt",
        beforeShow: function(input, inst) {
            $("#ui-datepicker-div").addClass("month-picker-dialog");
            if ((datestr = $(this).val()).length > 0) {
                var year = datestr.substring(datestr.length - 4, datestr.length);
                var month = datestr.substring(0, datestr.length - 5);
                month = month - 1;
                $(this).datepicker('option', 'defaultDate', new Date(year, month, 1));
                $(this).datepicker('setDate', new Date(year, month, 1));
            }
        }
    });
//    $("#questions-form\\:datatable\\:0\\:end").datepicker({
//        dateFormat: 'mm-yy',
//        minDate: min,
//        maxDate: max,
//        changeMonth: true,
//        changeYear: true,
//        showButtonPanel: true,
//        closeText: "<span class='ui-button-icon-left ui-icon ui-c ui-icon-check'></span>",
//        beforeShow: function(input, inst) {
//            $("#ui-datepicker-div").addClass("month-picker-dialog");
//            if ((datestr = $(this).val()).length > 0) {
//                var year = datestr.substring(datestr.length - 4, datestr.length);
//                var month = datestr.substring(0, datestr.length - 5);
//                month = month - 1;
//                $(this).datepicker('option', 'defaultDate', new Date(year, month, 1));
//                $(this).datepicker('setDate', new Date(year, month, 1));
//            }
//        }
//    });

    $(".month-picker").focus(function() {
        var thisCalendar = $(this);
        $(".ui-datepicker-calendar").detach();
        $("#ui-datepicker-div").position({
            my: "center top",
            at: "center bottom",
            of: $(this)
        });
        $('.ui-datepicker-close').click(function() {
            var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
            var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
            thisCalendar.datepicker('setDate', new Date(year, month, 1));
//            var datestr = $("#questions-form\\:datatable\\:0\\:end").val();
//            $("#questions-form\\:datatable\\:0\\:end").datepicker("option", "minDate", new Date(year, month, 1));
//            if (datestr.length > 0) {
//                var startYear = datestr.substring(datestr.length - 4, datestr.length);
//                var startMonth = datestr.substring(0, datestr.length - 5);
//                $("#questions-form\\:datatable\\:0\\:end").datepicker('option', 'defaultDate', new Date(startYear, startMonth - 1, 1));
//                $("#questions-form\\:datatable\\:0\\:end").datepicker('setDate', new Date(startYear, startMonth - 1, 1));
//            }
        });
    });
//    $(".month-picker").focus(function() {
//        var thisCalendar = $(this);
//        $(".ui-datepicker-calendar").detach();
//        $("#ui-datepicker-div").position({
//            my: "center top",
//            at: "center bottom",
//            of: $(this)
//        });
//        $('.ui-datepicker-close').click(function() {
//            var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
//            var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
//            thisCalendar.datepicker('setDate', new Date(year, month, 1));
//            var datestr = $("#questions-form\\:datatable\\:0\\:start").val();
//            $("#questions-form\\:datatable\\:0\\:start").datepicker("option", "maxDate", new Date(year, month, 1));
//            if (datestr.length > 0) {
//                var startYear = datestr.substring(datestr.length - 4, datestr.length);
//                var startMonth = datestr.substring(0, datestr.length - 5);
//                $("#questions-form\\:datatable\\:0\\:start").datepicker('option', 'defaultDate', new Date(startYear, startMonth - 1, 1));
//                $("#questions-form\\:datatable\\:0\\:start").datepicker('setDate', new Date(startYear, startMonth - 1, 1));
//            }
//
//
//        });
//    });
}
