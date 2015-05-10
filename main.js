/// <reference path="~\references.js" />

$("a[href^='mailto:']").each(function () {
    var hash = md5($(this).attr('href').replace('mailto:', '').toLowerCase().trim());
    $('<img src="http://www.gravatar.com/avatar/' + hash + '?s=32&d=retro" class="avatar">').prependTo(this);
});

$(document).ready(function () {
    /// setup nice code editors
    var configEditor = ace.edit("config");
    configEditor.getSession().setMode("ace/mode/javascript");
    configEditor.setValue(
'matsea.config = {\n' +
'// Startuhrzeit (volle Stude)\n' +
'startHour: 8,\n' +
'// Laenge der Zeitraeume in denen unterschiedliche\n' +
'// Termine vergeben werden\n' +
'// 8-9=60Min, 9-11=120Min, 11-12=60Min\n' +
'timeSlots: [60, 120, 60],\n' +
'// Behandlungszeiten fuer Patienten\n' +
'patients: [15, 20, 30],\n' +
'//---- Interpretationsmöglichkeit der Aufgabenstellung ----\n' +
'// Generiet Termiene, die planmaessig nach\n' +
'// dem Ende des letzten Zeitraums enden\n' +
'// 240: wie im Text beschrieben\n' +
'// 300: wie in Beispiel 5\n' +
'noTimeslotsAfter: 300,\n' +
'// Warteverhalten des Arztes wenn der letzte Termin \n' +
'// vor 12:00 endet\n' +
'// true: Leerlaufzeit bis zum Ende der Schicht \n' +
'// false: Keine leerlaufzeit nach dem letzten Patienten \n' +
'waitUntilEnd: true \n' +
'};');
    configEditor.clearSelection();

    var inputEditor = ace.edit("input");
    inputEditor.getSession().setMode("ace/mode/matlab");
    inputEditor.setValue(
'% Nr. 1 Strategie aus der Aufgabenstellung\n' +
'15 30 20\n' +
'% Nr. 2 keine Leerlaufzeiten\n' +
'15 15 15\n' +
'% Nr. 3 keine Wartezeiten\n' +
'30 30 30\n' +
'% Nr. 4 einheitliche und einfache Terminabstaende\n' +
'20 20 20\n' +
'% Nr. 5 Variation von 20 20 20\n' +
'19 21 22');
    inputEditor.clearSelection();

    // background worker that generates variations
    var worker;

    $('#start').click(function () {
        // initialize worker        
        worker = new Worker('worker.js');        

        // initialize IO
        var parser = new matsea.io.AppointmentParser();
        var output = new matsea.io.HtmlRenderer();        

        // clean output from last run
        $('#output').empty();

        // process events from worker
        var processWorkerEvents = function (e) {
            switch (e.data.cmd) {
                case 'progress':
                    // update progress event
                    output.displayProgress('#output', e.data.current, e.data.total);
                    break;
                case 'result':
                    // result of one simulation
                    output.writeResult('#output', e.data.result);
                    break;
                case 'done':
                    // all simulations done
                    output.writeDone('#output', e.data.best);
                    // stop listening for events
                    worker.removeEventListener('message', this, false);
                    // stop worker
                    worker.terminate();
                    break;
            }
        };
        worker.addEventListener('message', processWorkerEvents, false);

        // read configuration object from textarea
        eval(configEditor.getValue());
        matsea.config.endTime = 0;
        for(var i=0; i<matsea.config.timeSlots.length; i++){
            matsea.config.endTime += matsea.config.timeSlots[i];
        }

        // read input file for simulation
        var app = parser.getAppointmentLengths(inputEditor.getValue());

        // start worker with parameters from config and input file
        worker.postMessage({
            config: matsea.config,
            appointmentLengths: app
        });
    });
});