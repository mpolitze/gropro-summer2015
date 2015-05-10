/// <reference path="~\references.js" />
var matsea = matsea || {};

///--- Timeslot ---
matsea.Timeslot = function (start, end) {
    /// <summary>Represents a timeslot that contains appointments of the same length.</summary>
    this.start = start;
    this.end = end;
    return this;
};

matsea.Timeslot.prototype.getStart = function () {
    /// <summary>Time when this timeslot starts in minutes since the starting hour.</summary>
    return this.start;
}

matsea.Timeslot.prototype.getEnd = function () {
    /// <summary>Time when this timeslot ends in minutes since the starting hour.</summary>
    return this.end;
}

matsea.Timeslot.prototype.getAppointments = function (realStart, length) {
    /// <summary>Generate equidistant appointments of length in minutes. First appointment starts at realStart minutes since the starting hour.</summary>
    var appointments = [];
    for (var i = realStart; i < this.end; i += length) {
        var appointment = new matsea.Appointment(i, length);
        if (appointment.getEnd() <= matsea.config.noTimeslotsAfter) {
            appointments.push(appointment);
        }
    }
    return appointments;
};

matsea.Timeslot.prototype.toString = function () {
    /// <summary>Generate string representation.</summary>
    return matsea.helper.formatTime(this.start) - matsea.helper.formatTime(this.end);
};


///--- Appointment ---
matsea.Appointment = function (start, length) {
    /// <summary>Represents a possible appointment for a patient.</summary>
    this.start = start;
    this.length = length;
    this.end = start + length;
    return this;
};

matsea.Appointment.prototype.getStart = function () {
    /// <summary>Time when this appointment starts in minutes since the starting hour.</summary>
    return this.start;
};

matsea.Appointment.prototype.getEnd = function () {
    /// <summary>Time when this appointment ends in minutes since the starting hour.</summary>
    return this.end;
};

matsea.Appointment.prototype.getLength = function () {
    /// <summary>Length of the appointment in minutes</summary>
    return this.length;
};

matsea.Appointment.prototype.toString = function () {
    /// <summary>Generate string representation.</summary>
    return matsea.helper.formatTime(this.start);
};


///--- Patient ---
matsea.Patient = function (length, appointment, realStart) {
    /// <summary>Representation of a patient being treated at an appointment.</summary>
    this.length = length;
    this.appointment = appointment;
    this.realStart = realStart;
    return this;
}

matsea.Patient.prototype.getEnd = function () {
    /// <summary>Time when the patients treatment is scheduled to end in minutes since the starting hour.</summary>
    return this.appointment.getStart() + this.length;
};

matsea.Patient.prototype.getStart = function () {
    /// <summary>Time when the patients treatment is scheduled to start in minutes since the starting hour.</summary>
    return this.appointment.getStart();
};

matsea.Patient.prototype.getLength = function () {
    /// <summary>Length needed for this patient in minutes.</summary>
    return this.length;
}

matsea.Patient.prototype.getRealStart = function () {
    /// <summary>Time when the patients treatment is really started in minutes since the starting hour.</summary>
    return this.realStart;
};

matsea.Patient.prototype.getRealEnd = function () {
    /// <summary>Time when the patients treatment really ends in minutes since the starting hour.</summary>
    return Math.max(this.realStart + this.length, this.appointment.getEnd());
};

matsea.Patient.prototype.getRealLength = function () {
    /// <summary>Length needed for this patient including free time if treatment is shorter than the appointment in minutes.</summary>
    return this.getRealEnd() - this.getRealStart();
};

matsea.Patient.prototype.getFreeTime = function () {
    /// <summary>Free time after the treatment is finished in minutes.</summary>
    var t = this.getRealLength() - this.length;
    
    if (this.getRealEnd() > matsea.config.endTime) {
        // if the appointment ends after 12:00 there is no free time
        t = 0;
    }
    return Math.max(t, 0);
};

matsea.Patient.prototype.getWaitTime = function () {
    /// <summary>Time the patient had to wait before the treatment started in minutes.</summary>
    var t = this.realStart - this.appointment.getStart();
    return Math.max(t, 0);
};