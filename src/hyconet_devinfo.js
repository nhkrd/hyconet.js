//
// HCXPDevinfo 
//

//
// SessionInfo
//
var SessionInfo = (function() {
	let self = this;


	var SessionInfo = function() {
		self = this;
		self.appName = "";					// アプリケーション名
		self.devID = "";					// 端末ID：アプリケーションIDに受信機側がユニークな値を付加する

	};


	// methods


	//SessInfoをreset（値を初期化）
	SessionInfo.prototype.resetSessInfo = function() {
	}



	return SessionInfo;
})();

module.exports.SessionInfo = SessionInfo;


//
// HCXPDevinfo
//
var HCXPDevinfo = (function() {
	const HCXPStatus = require("./hyconet_status.js").HCXPStatus;
	const StatusCode = require("./hyconet_status.js").StatusCode;
	const Logger = require("./hyconet_logger.js").Logger;
	const ActHCXP = require("./hyconet_act.js").ActHCXP;

	const logger = new Logger("hyconet_devinfo");

	var HCXPDevinfo = function( profile, ipaddr, applicationURL, uuid, locationURL ) {
		let self = this;
		self.devType = "";
		self.profile_name = "";
		self.ipaddr = "";
		self.location = "";
		self.applicationURL = "";
		self.manufacturer = "";
		self.friendlyName = "";
		self.modelName = "";

		self.hcxp = null;
		self.restBaseURL = "";
		self.wsURL = "";
		self.uuid = "";
		self.protocolVersion = "";
//		self.sessInfo = null ;

		//
		// Initialize
		//
//		self.hcxp = new ActHCXP();
		self.sessInfo = new SessionInfo() ;

		if( profile !== undefined ) {
			self.profile_name = profile;
			self.ipaddr = ipaddr;
			self.applicationURL = applicationURL;
			self.uuid = uuid;
			self.location = locationURL;

			self.hcxp = new ActHCXP();

//			self.getDialAppInfoURL(null);
//			self.getDialAppInfo(null);
			self.getDialAppInfoURL(function() {
				this.getDialAppInfo(null);
			}.bind(self));
		}
	};

	HCXPDevinfo.prototype.setHCXP = function(arg) {
		this.hcxp = arg;
	}



	HCXPDevinfo.prototype.getDialAppInfoURL = function(rescb) {
		this.hcxp.getDialAppInfoURL(this, rescb);
	}



	HCXPDevinfo.prototype.getDialAppInfo = function(rescb) {
		this.hcxp.getDialAppInfo(this, rescb);
	}

	HCXPDevinfo.prototype.getDevType = function() {
		var devtype = "";
		devtype = this.devType;
		if( this.hcxp != null ) {
			if( this.hcxp.devType != null ) {
				devtype = devtype + "/" + this.hcxp.devType ;

				if( this.hcxp.serverInfoProtocolVersion != null ) {
					devtype = devtype + "/" + this.hcxp.serverInfoProtocolVersion ;
				}
			}
		}
		return devtype;
	}

	HCXPDevinfo.prototype.getDeviceInfo = function() {
//		var devinfo = {"ipaddr":this.ipaddr, "profile":this.profile_name, "friendlyName":this.friendlyName };
		var devinfo = {
			"deviceProfile":this.profile_name,
			"ipaddr":this.ipaddr,
			"manufacturer":this.manufacturer,
			"modelName":this.modelName,
			"friendlyName":this.friendlyName,
//			"protocolVersion":this.protocolVersion,
			"devType":this.getDevType()
		};
		return devinfo;
	}



	// getAvailableMedia
	HCXPDevinfo.prototype.getAvailableMedia = function(rescb) {
		return this.hcxp.getAvailableMedia(this, rescb);
	}

	// getChannelInfo
	HCXPDevinfo.prototype.getChannelInfo = function(media, rescb) {
		return this.hcxp.getChannelInfo(this, media, rescb);
	}

	// startAITControlledApp
	HCXPDevinfo.prototype.startAITControlledApp = function(mode, app, rescb) {
		let Status = new HCXPStatus();

		return this.hcxp.startAITControlledApp(this, mode, app, rescb);
	}

	// getReceiverStatus
	HCXPDevinfo.prototype.getReceiverStatus = function( rescb ) {
		return this.hcxp.getReceiverStatus(this, rescb);
	}

	// getTaskStatus
	HCXPDevinfo.prototype.getTaskStatus = function( rescb ) {
		return this.hcxp.getTaskStatus(this, rescb);
	}

	// connWebsocket
	HCXPDevinfo.prototype.connWebsocket = function( msgrecv, seturl, rescb ) {
		return this.hcxp.connWebsocket(this, msgrecv, seturl, rescb);
	}

	// sendWebsocket
	HCXPDevinfo.prototype.sendWebsocket = function( message, rescb ) {
//logger.debug(message);
//logger.debug(this.sessInfo.devID);
		const isJSON = function(text) {
			try { 
				JSON.parse(text);
				return true;
			} catch(error) {
				return false;
			}
		};

		let msgobj = (isJSON(message)) ? JSON.parse(message) : message;
		var tempmessage = message;
		if( "message" in msgobj ) { // sendTextMode
			msgobj["message"]["devid"] = this.sessInfo.devID;
			tempmessage = JSON.stringify(msgobj);
		}else if("control" in msgobj){
			msgobj["control"]["devid"] = this.sessInfo.devID;
			tempmessage = JSON.stringify(msgobj);
		}
//logger.debug(tempmessage);

		return this.hcxp.sendWebsocket(this, tempmessage, rescb);
	}

	return HCXPDevinfo;
})();

module.exports.HCXPDevinfo = HCXPDevinfo;
