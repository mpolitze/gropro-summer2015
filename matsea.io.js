/// <reference path="~\references.js" />
var matsea = matsea || {};
matsea.io = {};

matsea.io.AppointmentParser = function () {
    /// <summary>Parser for a list of different appointment szenarios.</summary>
    return this;
};

matsea.io.AppointmentParser.prototype.getAppointmentLengths = function (text) {
    /// <summary>Parse appoinment lengths from string.</summary>
    var lines = text.trim().split('\n');
    var lengths = [];
    for (var i = 0; i < lines.length; i += 2) {
        var line = lines[i + 1].trim().split(' ');
        var appointmentLengths = [];
        for(var j=0; j<line.length; j++)
        {
            appointmentLengths.push(parseInt(line[j]));
        }
        lengths.push({
            comment: lines[i].substring(1).trim(),
            appointmentLengths: appointmentLengths
        });
    }
    return lengths;
};

matsea.io.HtmlRenderer = function () {
    /// <summary>Renders results and progress as HTML code in DOM.
    /// Depends on jQuery.</summary>
    return this;
};

matsea.io.HtmlRenderer.prototype.writeResult = function (selector, result) {
    /// <summary>Write result to DOM</summary>
    $(selector).find('.progress').remove();
    var panel = $('<div class="panel panel-default"><div class="panel-heading"><h3 class="panel-title"></h3></div><div class="panel-body"></div></div>').appendTo(selector)
    panel.find('.panel-title').text(result.comment);
    var text = "<div>Terminverteilung bei dieser Strategie:</div>" +
               "<div><code>" + result.appointments + "</code></div>" +
               "<div>Bei <code>" + result.total + "</code> kombinationen der Behandlungsdauern ergeben sich folgende Zeiten</div>" +
               "<div>Durchschnittliche mittlere Wartezeit <code>" + matsea.helper.round(result.avgWaitTime) + "</code></div>" +
               "<div>Durchschnittliche maximale Wartezeit <code>" + matsea.helper.round(result.avgMaxWaitTime) + "</code></div>" +
               "<div>Durchschnittliche Leerlaufzeit <code>" + matsea.helper.round(result.avgFreeTime) + "</code></div>" +
               "<div>Gesamtbewertung der Strategie <code>" + matsea.helper.round(result.evaluation) + "</code></div>";

    panel.find('.panel-body').append(text);
};

matsea.io.HtmlRenderer.prototype.writeDone = function (selector, best) {
    /// <summary>Write program evaluation to DOM</summary>
    $(selector).find('.progress').remove();
    var panel = $('<div class="panel panel-default"><div class="panel-heading"><h3 class="panel-title"></h3></div><div class="panel-body"></div></div>').appendTo(selector)
    panel.find('.panel-title').text("Auswertung");
    var text = "<div>Die Strategie <code>" + best.comment + "</code> " +
               "ist mit einer Bewertung von <code>" + matsea.helper.round(best.evaluation) + "</code> " +
               "die beste der eingelesenen Strategien und sollte deshalb gewählt werden.</div>";
    panel.find('.panel-body').append(text);
};

matsea.io.HtmlRenderer.prototype.displayProgress = function (selector, current, total) {
    /// <summary>Update progressbar in DOM</summary>
    var progressbar = $(selector).find('.progress');
    if (progressbar.length == 0) {
        progressbar = $('<div class="progress"><div class="progress-bar" role="progressbar" style="width: 0%; min-width:1%"></div></div>').appendTo(selector);
    }
    progressbar.find('.progress-bar').text(current + "/" + total)
                                     .css('width', Math.ceil(100 * (current / total)) + '%');
};
