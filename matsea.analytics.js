/// <reference path="~\references.js" />
matsea = matsea || {};
matsea.analytics = {};

matsea.analytics.genereateAppointments = function (timeSlots, appointmentLengths) {
    /// <summary>Generate a list of appointments for multiple proceeding timeslots</summary>
    var lastEnd = 0;
    var realStart = 0;
	var appointments = []
	for (var j = 0; j < timeSlots.length; j++) {
		var t = new matsea.Timeslot(lastEnd, lastEnd + timeSlots[j]);
		lastEnd = t.getEnd();

		var f = t.getAppointments(realStart, appointmentLengths[j]);

		for (var i = 0; i < f.length; i++) {
		    appointments.push(f[i]);
		    realStart = f[i].getEnd();
		}
	}
	return appointments;
};

matsea.analytics.generatePatients = function (depth, patientTypes, patients, appointments, lastEnd, accumulator) {
    /// <summary>(Internal) Recursively generate all permutations of patientTypes for the appointments.</summary>
	if (depth < appointments.length) {
	    for (var i = 0; i < patientTypes.length; i++) {
	        var p = new matsea.Patient(patientTypes[i], appointments[depth], lastEnd);
	        patients[depth] = p;
	        this.generatePatients(depth + 1, patientTypes, patients, appointments, p.getRealEnd(), accumulator);
		}
	} else {
	    accumulator.addPermutation(patients);
	}
	return patients;
};

matsea.analytics.simulate = function (comment, appointments, patientTypes, progressInterval, progressCallback) {
    /// <summary>Start the simulation of a scenario.</summary>
    var accumulator = new matsea.analytics.MetricsAccumulator(patientTypes, appointments, comment, progressInterval, progressCallback);
    matsea.analytics.generatePatients(0, patientTypes, new Array(appointments.length), appointments, 0, accumulator);
    return accumulator.getResult();
};

matsea.analytics.MetricsAccumulator = function (patientTypes, appointments, comment, progressInterval, progressCallback) {
    /// <summary>Accumulator to gather results during simulation and evaluate them.</summary>
    this.k = 0;

    this.accFreeTime = 0;
    this.accWaitTime = 0;
    this.accMaxWaitTime = 0;

    this.total = Math.pow(patientTypes.length, appointments.length);

    this.progressInterval = progressInterval;
    this.progressCallback = typeof (progressCallback) == 'function' ? progressCallback : this.emptyProgressCallback;

    this.appointmentsString = "";
    for (var i = 0; i < appointments.length; i++) {
        this.appointmentsString += " " + appointments[i].toString();
    }

    this.comment = comment;

    return this;
};

matsea.analytics.MetricsAccumulator.prototype.emptyProgressCallback = function () {
/// <summary>(Internal) Empty function.</summary>
};

matsea.analytics.MetricsAccumulator.prototype.evaluate = function () {
    /// <summary>Evaluate the scenario based on the collected data.</summary>
    return (this.accWaitTime / this.k) + 0.1 * (this.accMaxWaitTime / this.k) + 5 * (this.accFreeTime / this.k);
};

matsea.analytics.MetricsAccumulator.prototype.getResult = function () {
    /// <summary>Get the accumulated results.</summary>
    return {
        comment: this.comment,
        total: this.k,
        avgFreeTime: this.accFreeTime / this.k,
        avgWaitTime: this.accWaitTime / this.k,
        avgMaxWaitTime: this.accMaxWaitTime / this.k,
        evaluation: this.evaluate(),
        appointments: this.appointmentsString
    };
};

matsea.analytics.MetricsAccumulator.prototype.addPermutation = function (patients) {
    /// <summary>Accumulate a permutation to the current result.</summary>
    this.k++;
    if (this.k % this.progressInterval == 0) {
        this.progressCallback(this.k, this.total);
    }  
    var maxWaitTime = 0;
    var sumWaitTime = 0;
    var sumFreeTime = 0;

    var waitTime;
    var p;
    for (var i = 0; i < patients.length; i++) {
        p = patients[i];
        waitTime = p.getWaitTime();
        maxWaitTime = Math.max(maxWaitTime, waitTime);
        sumWaitTime += waitTime;
        if (i < patients.length - 1) {
            sumFreeTime += p.getFreeTime();
        } else{
            // if the last patient leaves before 12:00 add free time until 12:00
            if (matsea.config.waitUntilEnd) {
                sumFreeTime += Math.max(matsea.config.endTime - (p.getRealStart() + p.getLength()), 0);
            }
        }
    }

    this.accFreeTime += sumFreeTime;
    this.accWaitTime += sumWaitTime / patients.length;
    this.accMaxWaitTime += maxWaitTime;
};