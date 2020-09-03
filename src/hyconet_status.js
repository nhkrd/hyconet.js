//
//HCXPStatus
//
var StatusCode = {
	"OK": 200,
	"Created": 201,
	"AlreadyActive": 300,
	"BadRequest": 400,
	"UnAuthorized": 401,
	"Forbidden": 403,
	"NotFound": 404,
	"InternalError": 500,
	"NotImplemented": 501,
	"ServiceUnavailable": 503
};

//
// HCXPStatus
//
var HCXPStatus = (function() {
	var HCXPStatus = function() {
		this.status = StatusCode.BadRequest ;
		this.body = "" ;
		this.err = "" ;
	};

	HCXPStatus.prototype.setStatus = function(status, body, err) {
		this.status = status;
		this.body   = body;
		this.err    = err;
	};

	HCXPStatus.prototype.toJSONString = function() {
		var res = {"status":this.status, "body":this.body, "error":this.err};
		return JSON.stringify(res);
	}

//	return {
//		setStatus: setStatus,
//		toJSONString: toJSONString
//	}

	return HCXPStatus;
})();

module.exports.HCXPStatus = HCXPStatus;
module.exports.StatusCode = StatusCode;
