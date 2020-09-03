//
// Hybridcast Connect: Webscoket Client
//
var WebSocketClient = (function() {
	const HCXPStatus = require("./hyconet_status.js").HCXPStatus;
	const StatusCode = require("./hyconet_status.js").StatusCode;
	const Logger = require("./hyconet_logger.js").Logger;
	const WSClient = require('websocket').client;
//	var client = new WebSocketClient();

	const subprotocol = "Hybridcast";  
	const logger = new Logger("hyconet_wsclient");

	var WebSocketClient = function( devinfo, msgrecv_cb, seturl_cb, wsurl ) {
		let self = this;

		self.devinfo = devinfo;
		self.wsurl   = wsurl;

		self.connect_cb = null;
		self.sendTextReceived = msgrecv_cb;
		self.setUrlReceived   = seturl_cb;

		self.wsc = new WSClient() ;
		self.wsc_conn = null ;


		self.wsc.on('connectFailed', function(error) {
		    logger.error('Connect Error: ' + error.toString());
		});

		self.wsc.on('connect', function(connection) {
			logger.info('WebSocket Client Connected');
			self.wsc_conn = connection;

			self.wsc_conn.on('error', function(error) {
				logger.error("Connection Error: " + error.toString());
	    	});

			self.wsc_conn.on('close', function() {
				logger.info('echo-protocol Connection Closed');
			});

			self.wsc_conn.on('message', function(message) {
				if (message.type === 'utf8') {
					var recvdata = message.utf8Data;
					logger.debug("Received 0: '" + recvdata + "'");

						if( recvdata.indexOf("{") == 0 ) {
							//JSON
						}
						else {
							try{
								// data process
							}
							catch(error){
								logger.error( "Data Process Error Occured in WebsocketMessage");
							}
						}
					logger.debug("Received 1: " + recvdata);

					var msgjson = JSON.parse( recvdata );
					if( "message" in msgjson ) {
						if( "sendTextToCompanionDevice" in msgjson["message"] ) {
							logger.debug("Received text: " + msgjson["message"]["sendTextToCompanionDevice"]["text"]);

							if( self.sendTextReceived != null ) {
								self.sendTextReceived( msgjson["message"]["sendTextToCompanionDevice"]["text"] );
							}
						}
					}
					else if( "control" in msgjson ) {
						if( "setURLForCompanionDevice" in msgjson["control"] ) {
							if( self.setUrlReceived != null ) {
								self.setUrlReceived( JSON.stringify(msgjson["control"]["setURLForCompanionDevice"]) );
							}
						}
					}
				}
			});
			var status = new HCXPStatus();
			status.setStatus( StatusCode.OK, "", "" );
			self.connect_cb( status );
		});
	};

	//
	// connect
	//
	WebSocketClient.prototype.connect = function( rescb ) {
		let self = this;
		let headers = null
		var status = new HCXPStatus();


		self.connect_cb = rescb;

		self.wsc.connect( self.wsurl, subprotocol, null, headers, null );
		status.setStatus( StatusCode.OK, "", "" );
//		rescb(status);
	};

/*
	//
	// addWSListener
	//
	WebSocketClient.prototype.addWSListener = function(rescb) {
		let self = this;
	};

	//
	// removeWSListener
	//
	WebSocketClient.prototype.removeWSListener = function(rescb) {
		let self = this;
	};
*/

	//
	// send
	//
	WebSocketClient.prototype.send = function(message, rescb) {
		let self = this;

		var status = new HCXPStatus();
		status.setStatus( StatusCode.OK, "", "" );

		let msgstr = message;
		//data process

		self.wsc_conn.send( msgstr );
		rescb(status);
	};


	return WebSocketClient;
})();

module.exports.WebSocketClient = WebSocketClient;
