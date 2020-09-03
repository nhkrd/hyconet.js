//
// Hybridcast Connect
//

const HCXPStatus = require("./src/hyconet_status.js").HCXPStatus;
const StatusCode = require("./src/hyconet_status.js").StatusCode;
const Logger = require("./src/hyconet_logger.js").Logger;

const HCXPDevMan = require("./src/hyconet_devman.js").HCXPDevMan;
const HCXPDevinfo = require("./src/hyconet_devinfo.js").HCXPDevinfo;

var hcxp_devMan = null;
if( hcxp_devMan == null ) {
	hcxp_devMan = new HCXPDevMan();
}

var cur_hcxpdev = null;
var logger = new Logger("hyconet");

process.on('uncaughtException', function(err) {
    logger.error(err);
});


//
//Interface
//

//
// Device Manager
//
module.exports.search = function( param ) {
	return new Promise(function(resolve) {
		hcxp_devMan.search( resolve );
	});
};

module.exports.getDeviceList = function( param ) {
	return hcxp_devMan.getDevList(null);
};

module.exports.getDeviceListInfo = function( param ) {
	return hcxp_devMan.getDevListInfo(null)
};

module.exports.select = function( param ) {
	return new Promise(function(resolve) {
		var status = new HCXPStatus();

		logger.debug("select: " + JSON.stringify(param));

		if( "index" in param ) {
			var dev = hcxp_devMan.getTVRCDevinfo( param["index"] );
			if( dev != null ) {
				cur_hcxpdev = dev;
				status.setStatus( StatusCode.OK, JSON.stringify(cur_hcxpdev), "" );
			}
			else {
				status.setStatus( StatusCode.NotFound, "", "" );
			}
		}
		else if( "ipaddr" in param ) {
			var dev = hcxp_devMan.getTVRCDevinfoByIpaddr( param["ipaddr"] );
			if( dev != null ) {
				cur_hcxpdev = dev;
				status.setStatus( StatusCode.OK, JSON.stringify(cur_hcxpdev), "" );
			}
			else {
				status.setStatus( StatusCode.NotFound, "", "" );
			}
		}
		else {
			status.setStatus( StatusCode.BadRequest, "", "" );
		}


//			status.setStatus( StatusCode.OK, JSON.stringify(cur_hcxpdev), "" );
			status.setStatus( StatusCode.OK, JSON.stringify(cur_hcxpdev.getDeviceInfo()), "" );

		logger.debug(cur_hcxpdev);
//		cur_hcxpdev.getDialAppInfoURL(null);
//		cur_hcxpdev.getDialAppInfo(null);

		resolve( status );
	});
};


//
// directselect
//   param: {"profile": profile, "ipaddr":ipaddr , "ApplicationURL":ApplicationURL , "uuid":"" , "LocationURL":LocationURL }
//
module.exports.directselect = function( param ) {
	return new Promise(function(resolve) {
		var status = new HCXPStatus();

		if( "profile" in param )
		if( "ipaddr" in param )
		if( "ApplicationURL" in param )
		if( "uuid" in param )
		if( "LocationURL" in param ) {
			cur_hcxpdev = new HCXPDevinfo( param["profile"], param["ipaddr"], param["ApplicationURL"], param["uuid"], param["LocationURL"] );
			status.setStatus( StatusCode.OK, JSON.stringify(cur_hcxpdev.getDeviceInfo()), "" );
		}
		else {
			status.setStatus( StatusCode.BadRequest, "", "" );
		}

		resolve( status );
	});
};




//
// Device
//
//
// getDialAppInfoURL
//
module.exports.getDialAppInfoURL = function() {
	return new Promise(function(resolve) {
		logger.info("*** call getDialAppInfoURL");
		logger.debug(cur_hcxpdev);

		cur_hcxpdev.getDialAppInfoURL( resolve );
	});
}

// getDialAppInfo
//
module.exports.getDialAppInfo = function() {
	return new Promise(function(resolve) {
		logger.info("*** call getDialAppInfo");
		logger.debug(cur_hcxpdev);

		cur_hcxpdev.getDialAppInfo( resolve );
	});
}


//
// getmedia
//
module.exports.getMedia = function( param ) {
	return new Promise(function(resolve) {
		logger.info("*** call getMedia");
		cur_hcxpdev.getAvailableMedia( resolve );
	});
}

//
// getchannels
//
module.exports.getChannels = function( param ) {
	return new Promise(function(resolve) {
		logger.info("*** call getchannels");

		var media = "";
		if( "media" in param ) {
			media = param["media"];
		}else{
			media = "all"
		}
		cur_hcxpdev.getChannelInfo( media, resolve );
	});
}

//
// getReceiverStatus
//
module.exports.getReceiverStatus = function( param ) {
	return new Promise(function(resolve) {
		logger.info("*** call getReceiverStatus");
		cur_hcxpdev.getReceiverStatus( resolve );
	});
}


//
// startAITControlledApp
//
module.exports.startAITControlledApp = function( param ) {
	return new Promise(function(resolve) {
		var status = new HCXPStatus();

		logger.info("*** call startAITControlledApp");
		if( "mode" in param )
		if( "app" in param ) {
			cur_hcxpdev.startAITControlledApp( param["mode"], param["app"], resolve );
		}
		else {
			status.setStatus( StatusCode.BadRequest, "", "" );
			resolve( status );
		}
	});
}

//
// getTaskStatus
//
module.exports.getTaskStatus = function( param ) {
	return new Promise(function(resolve) {
		logger.info("*** call getTaskStatus");
		cur_hcxpdev.getTaskStatus( resolve );
	});
}

//
// setWebsocketListener
//
module.exports.setWebsocketListener = function( msgrecv, seturl ) {
	hcxp_devMan.setWebsocketListener( msgrecv, seturl );
}
//
// connWebsocket
//
module.exports.connWebsocket = function( param ) {
	return new Promise(function(resolve) {
		logger.info("*** call connWebsocket");

		cur_hcxpdev.connWebsocket( hcxp_devMan.sendTextReceived, hcxp_devMan.setUrlReceived, resolve );
	});
}

//
// sendWebsocket
//
module.exports.sendWebsocket = function( param ) {
	return new Promise(function(resolve) {
		logger.info("*** call sendWebsocket");

		if( "message" in param || "control" in param ) {
			cur_hcxpdev.sendWebsocket( param, resolve );
		}
		else {
			status.setStatus( StatusCode.BadRequest, "", "Message Format Invalid" );
			resolve( status );
		}
	});
}


//
// sendText over Websocket
//
module.exports.sendTextOverWebsocket = function( param ) {
	return new Promise(function(resolve) {
		logger.info("*** call sendTextOverWebsocket");

		if(param){
			let sendtextmsg = {
				message: {
					devid: "",
					sendTextToHostDevice: {
						text: param
					}
				}
			}
			cur_hcxpdev.sendWebsocket( sendtextmsg, resolve );
		}
		else {
			status.setStatus( StatusCode.BadRequest, "", "NoText has been set" );
			resolve( status );
		}
	});
}


//
// sendText over Websocket
//
module.exports.requestUrlOverWebsocket = function() {
	return new Promise(function(resolve) {
		logger.info("*** call requestUrlOverWebsocket");

		let requrlmsg = {
			control: {
				devid: "",
				request: {
					command: "setURLForCompanionDevice"
				}
			}
		}
		cur_hcxpdev.sendWebsocket( requrlmsg, resolve );
	});
}
