importScripts('matsea.helper.js');
importScripts('matsea.analytics.js');
importScripts('matsea.time.js');

self.addEventListener('message', function (e) {
    // export global settings
    matsea.config = e.data.config;

    var appointmentLengths = e.data.appointmentLengths;
    var best;
    for (var i = 0; i < appointmentLengths.length; i++) {
        // generate possible appointments for the given lenths
        var appointments = matsea.analytics.genereateAppointments(matsea.config.timeSlots, appointmentLengths[i].appointmentLengths);

        // start simulation of all variations
        var result = matsea.analytics.simulate(appointmentLengths[i].comment, appointments, matsea.config.patients, 5000, function (i, t) {
            // notify main thread to display progress bar
            self.postMessage({ cmd: 'progress', current: i, total: t });
        });

        // notify main thread to display simulation result
        self.postMessage({ cmd: 'result', result: result });

        if (!best || result.evaluation < best.evaluation) {
            best = result;
        }
    }

    // notify thread to display evaluation result
    self.postMessage({ cmd: 'done', best:best});
});