//
//Logger
//

//
// Log Output
//  msg:
//  level: 0=Critical, 1=Error, 2=Trigger, 3=Info
var LogLevel = {
	"Error": 0,
	"Warn": 10,
	"Info": 20,
	"Debug": 30,
	"Trace": 40
};
var OutLogLevel = LogLevel.Info;

var Logger = (function() {
	var Logger = function( _modname ) {
		let self = this;
		self.modname = _modname ;

		self.formatDate = function(date) {
			var format = 'yyyy/MM/dd HH:mm:ss.SSS';
			format = format.replace(/yyyy/g, date.getFullYear());
			format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
			format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
			format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
			format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
			format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
			format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
			return format;
		};

		self.logOutput = function(msg, level) {
//			var loglevel = LogLevel.Trigger;
//			if( (level != null) && (level <= OutLogLevel) ) {
			if( level <= OutLogLevel ) {
				var cdate = new Date();
				console.log(this.formatDate(cdate) + " " + self.modname + " " + msg);
			}
		}
	};

	Logger.prototype.error = function(msg) {
		this.logOutput(msg, LogLevel.Error);
	};

	Logger.prototype.warn = function(msg) {
		this.logOutput(msg, LogLevel.Warn);
	};

	Logger.prototype.info = function(msg) {
		this.logOutput(msg, LogLevel.Info);
	};

	Logger.prototype.debug = function(msg) {
		this.logOutput(msg, LogLevel.Debug);
	};

	Logger.prototype.trace = function(msg) {
		this.logOutput(msg, LogLevel.Trace);
	};

	return Logger;
})();

module.exports.Logger = Logger;
