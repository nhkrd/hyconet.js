//
// HCXP Device Manager
//
var HCXPDevMan = (function() {
	const HCXPStatus = require("./hyconet_status.js").HCXPStatus;
	const HCXPSSDP = require("./hyconet_ssdp.js").HCXPSSDP;
	const Logger = require("./hyconet_logger.js").Logger;
	const HCXPDevinfo = require("./hyconet_devinfo.js").HCXPDevinfo;
	const ActHCXP = require("./hyconet_act.js").ActHCXP;

	const logger = new Logger("hyconet_devman");

	var HCXPDevMan = function() {
		let self = this;
		self.devList = [];

		self.sendTextReceived = null;
		self.setUrlReceived = null;
	};

	//
	// Internal
	//
	//
	// External
	//
	HCXPDevMan.prototype.make_devList = function(data) {
		let self = this;

		var result  = data.body;
		logger.debug( result );

		var devices = JSON.parse(result);
		logger.debug( devices );

		self.devList = [];
		for( var i=0; i<devices.length; i++ ) {
			var dev = new HCXPDevinfo();

			dev.setHCXP( new ActHCXP() );
//			dev.setIPAddress( location.split("/")[2].split(":")[0] ) ;
			dev.devType = devices[i].devType;
			dev.profile_name = devices[i].profile_name;
			dev.ipaddr = devices[i].ipaddr;
			dev.manufacturer = devices[i].manufacturer ;
			dev.friendlyName = devices[i].friendlyName ;
			dev.modelName = devices[i].modelname ;
			dev.applicationURL = devices[i].applicationURL;
			dev.location = devices[i].locationURL;

			if( (devices[i].usn != null) && (devices[i].usn != "") ) {
				dev.locationURL = devices[i].locationURL ;
				dev.uuid = devices[i].usn.split("::")[0].split(":")[1] ;
			}

			// URLチェックのみ
			dev.getDialAppInfoURL(function() {
				//サーチではprotocolバージョン情報までは取得しない?
				this.getDialAppInfo(function() {
					self.devList.push(this);
				}.bind(this));
			}.bind(dev));
		}

		logger.debug( self.devList );
	};

	HCXPDevMan.prototype.getDevListInfo = function(rescb) {
		let self = this;
		return this.devList;
	}

	HCXPDevMan.prototype.getDevList = function(rescb) {
		let self = this;

		var devlistinfo = [];
		for( var i=0; i<self.devList.length; i++ ) {
//			devlistinfo[i] = {"ipaddr":devList[i].ipaddr, "profile":devList[i].profile_name, "friendlyName":devList[i].friendlyName};
			devlistinfo[i] = self.devList[i].getDeviceInfo();
		}

		return devlistinfo;
	}

	HCXPDevMan.prototype.search = function(rescb) {
		let self = this;

		var ssdp = new HCXPSSDP();
		ssdp.search_start( function(res) {
			logger.debug("HCXPDevMan");
			logger.debug(res);

			self.make_devList(res);

			setTimeout( function() {
				logger.debug( "***** Timeover 3sec" );
				logger.debug( self );

				logger.debug( self.getTVRCDevinfo(0) );
				var status = new HCXPStatus();
//				status.setStatus( 200, JSON.stringify(devList), "" );
				status.setStatus( 200, JSON.stringify(self.getDevList()), "" );
				rescb(status);
			}, 3000);
		});
	};

	HCXPDevMan.prototype.getTVRCDevinfo = function(idx) {
		var retv = null;

		logger.debug( "getTVRCDevinfo() " + this.devList.length );

		if( idx < this.devList.length ) {
			retv = this.devList[idx];
		}
		return retv;
	};

	HCXPDevMan.prototype.getTVRCDevinfoByIpaddr = function(ipaddr) {
		var retv = null;
		for( var i=0; i<this.devList.length; i++) {
			if( ipaddr == this.devList[i].ipaddr ) {
				retv = this.devList[i];
				break;
			}
		}
		return retv;
	};

	HCXPDevMan.prototype.setWebsocketListener = function(msgrecv_cb, seturl_cb) {
		let self = this;
		self.sendTextReceived = msgrecv_cb;
		self.setUrlReceived   = seturl_cb;
	};

	return HCXPDevMan;
})();

module.exports.HCXPDevMan = HCXPDevMan;
