/// <reference path="~\references.js" />

var matsea = matsea || {};
matsea.helper = {};

matsea.helper.formatNumber = function (n) {
    /// <summary>Format a given number with a leading 0 if it is smaller then 10.</summary>
    return n<10 ? "0"+n : n;
};

matsea.helper.formatTime = function (t) {
    /// <summary>Format a time in seconds since config.startHour in hh:mm format.</summary>
    return this.formatNumber(matsea.config.startHour +  Math.floor(t/60)) + ":" + this.formatNumber(t%60);
}

matsea.helper.round = function (n) {
    /// <summary>Round number to four decimals</summary>
    return Math.round(n*10000)/10000;
}