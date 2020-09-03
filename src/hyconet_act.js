//
// Hybridcast Connect
//
var ActHCXP = (function() {
	const HCXPStatus = require("./hyconet_status.js").HCXPStatus;
	const StatusCode = require("./hyconet_status.js").StatusCode;
	const Logger = require("./hyconet_logger.js").Logger;
	const WebSocketClient = require("./hyconet_wsclient.js").WebSocketClient;

	const requestp = require("request-promise");
	const request = require("request");
	const logger = new Logger("hyconet_act");

	const typeHyconetProtocol = "HCC";
	const typeHyconetProtocolAntwapp = "HCC(Antwapp)";

	const hcex_apipath = {
		"HCEX_Media": "/media",
		"HCEX_Channels": "/channels",
		"HCEX_Status": "/status",
		"HCEX_StartAIT": "/hybridcast",
		"HCEX_TaskStatus": "/hybridcast"
	} ;

	var ActHCXP = function() {
		let self = this;
		self.baseURL = null;
		self.wsURL = null;
		self.serverInfo = null;
		self.serverInfoProtocolVersion = null;
		self.hcex_endpoint = {
			"HCEX_Media": "",
			"HCEX_Channels": "",
			"HCEX_Status": "",
			"HCEX_StartAIT": "",
			"HCEX_TaskStatus": ""
		} ;
		self.wsc = null;		//websocket

		self.devType = null;
		self.appStatusURL = null;
	};

	function checkMedia(media) {
		let validmedia = { "ALL":null, "TD":null, "BS":null, "CS":null };
		return ( media in validmedia );
	}

	function checkMode(mode) {
		let validmode = { "tune":null, "app":null };
		return ( mode in validmode );
	}


	function HTTPRequest( method, devinfo, url, headers, postData ) {
		return  new Promise(function(resolve,reject) {
			if( (devinfo == null) || (devinfo.ipaddr == "") ) {
				//Error
				reject();
			}
			else {
				var options = {
					method: method,
					uri: url
				};
				if( headers != null && headers != "" && headers != {}) {
					if ( !options['headers'] ) {
						options['headers'] = {};
						options['headers']["Content-Type"] = "application/json";
					}
					options['headers'] = headers;
				}
				if( (method == "POST") || (method == "PUT") ) {
					if ( !options['headers'] ) {
						options['headers'] = {};
						options['headers']["Connection"] = "keep-alive";
					}
					if( postData != null ) {
						options['body'] = postData;
						options['headers']["Content-Length"] = Buffer.byteLength(postData);
					}
				}

				if ( !options['headers'] ) {
					options['headers'] = {};
				}
				options['headers']["User-Agent"] = "hyconet.js";

				requestp( options ).then( function(res) {
					logger.debug("Res: " + res);
						if( res.indexOf("{") == 0 ) { //JSON
						} else if( res.indexOf("<") == 0 ) { //XML
						} else {
							try{
								// data process
							}catch(error){
							}
						}
					logger.debug("Res: " + res);
					resolve(res);
				}).catch(function(err) {
					logger.error("Error: *************************************************");
					logger.error("Error: " + err.error);
//					logger.error(err);
					reject(err);
				});

			}
		});
	}


	//
	// external
	//

	// setRestBaseURL
	ActHCXP.prototype.setRestBaseURL = function(restBaseURL) {
		let self = this;
		try{
			self.baseURL = restBaseURL;
			self.hcex_endpoint["HCEX_Media"] =         restBaseURL + hcex_apipath["HCEX_Media"] ;
			self.hcex_endpoint["HCEX_Channels"] =      restBaseURL + hcex_apipath["HCEX_Channels"] ;
			self.hcex_endpoint["HCEX_Status"] =        restBaseURL + hcex_apipath["HCEX_Status"] ;
			self.hcex_endpoint["HCEX_StartAIT"] =      restBaseURL + hcex_apipath["HCEX_StartAIT"] ;
			self.hcex_endpoint["HCEX_TaskStatus"] =    restBaseURL + hcex_apipath["HCEX_TaskStatus"] ;
			logger.debug("Change baseURL:" + restBaseURL );
		}
		catch( err ){
			logger.error("setRestBaseURL Error:" + restBaseURL);
			logger.error("setRestBaseURL Exception:" + err.error);
		}
	}


	// getDialAppInfoURL
	ActHCXP.prototype.getDialAppInfoURL = function(devinfo, rescb) {
		let self = this;
		logger.debug( "called getDialAppInfoURL() "  + devinfo.ipaddr);

		var status = new HCXPStatus();
//		self.devType = devinfo.profile_name;
		self.devType = devinfo.devType;

		if( (devinfo.applicationURL != null) && (devinfo.applicationURL != "") ) {
			if(devinfo.applicationURL.slice(-1) == "/"){ // URLの末尾が/の場合
				self.appStatusURL = devinfo.applicationURL + "Hybridcast" ;
			}
			else{
				self.appStatusURL = devinfo.applicationURL + "/Hybridcast" ;
			}

//			self.devType = self.devType + "/HCEXProtocol" ;
			self.devType = typeHyconetProtocol ;
			status.body = self.appStatusURL ;
			status.setStatus( 200, self.appStatusURL, "" );
		}
		else {
			var emuAppStatusURL = "http://" + devinfo.ipaddr + ":8887/apps/antwapp" ;
			logger.debug("emuAppStatusURL: " + emuAppStatusURL);
			self.appStatusURL = emuAppStatusURL;
			status.setStatus( 200, emuAppStatusURL, "" );
		}

		// always check if antwapp emulator exists.
		var emuAppStatusURL = "http://" + devinfo.ipaddr + ":8887/apps/antwapp" ;
		logger.debug("check emuAppStatusURL: " + emuAppStatusURL);

		var hr = new HTTPRequest("GET", devinfo, emuAppStatusURL, "", null);
		hr.then( function(data) {
			logger.debug("result emuAppStatusURL: " + emuAppStatusURL);
			logger.debug( data );

//			self.devType = self.devType + "/HCEXEmulator:Antwapp" ;
			self.devType = typeHyconetProtocolAntwapp ;
			self.appStatusURL = emuAppStatusURL;
			devinfo.applicationURL = emuAppStatusURL;
			status.body = emuAppStatusURL ;
//			status.setStatus(200, "", "") ;
			status.setStatus(200, self.appStatusURL, "") ;

			if(rescb) {
				logger.debug( "return getDialAppInfoURL() "  + devinfo.ipaddr);
				rescb(status);
			}
		}, function(err) {
			logger.error( "antwapp not exist: " + emuAppStatusURL);

			if(rescb) {
				logger.debug( "return getDialAppInfoURL() "  + devinfo.ipaddr);
				rescb(status);
			}
		});

		logger.debug( "return getDialAppInfoURL() "  + devinfo.ipaddr);

//		if(rescb) {
//			rescb(status);
//		}
//		return status;
	}

	/**
	 * API一覧の取得
	 */

	// getDialAppInfo
	ActHCXP.prototype.getDialAppInfo = function(devinfo, rescb) {
		let self = this;

		var status = new HCXPStatus();

		logger.debug("called getDialAppInfo 1: " + JSON.stringify(devinfo));

		if( devinfo.ipaddr == "" ) {
			status.setStatus( StatusCode.BadRequest, "", "Parameter Error");
		}
		else if( self.appStatusURL == null ) {
			status.setStatus(StatusCode.ServiceUnavailable, "", "Not DIALProtocol Device");
		}
		else { // HCEXProtocolのDIAL InfoAPIによる存在確認
			logger.debug("called getDialAppInfo 2: " + self.appStatusURL);

//			var hcobj = new Promise(function(resolve,reject) {
			self.hcobj = new Promise(function(resolve,reject) {
				requestp.get({
					url: self.appStatusURL
				}).then( function(res) {
					logger.debug("Res:  " + res);

					var to_json = require('xmljson').to_json;
					to_json(res, function(error, jsondata) {
						logger.debug( error );

						if( jsondata["service"] && jsondata["service"]["additionalData"] ) {
							logger.debug(jsondata["service"]);
							logger.debug(jsondata["service"]['$']);
							logger.debug(jsondata["service"]["additionalData"]);

							var namespace = ("xmlns:iptv" in jsondata["service"]['$']) ? "iptv:" : "";
							var addData = jsondata["service"]["additionalData"];
							if( namespace != null ) {
								if( (namespace + "X_Hybridcast_ServerInfo") in addData ) {
									self.serverInfo = addData[namespace + "X_Hybridcast_ServerInfo"];
									self.serverInfoProtocolVersion = self.serverInfo.split(";")[1];
									devinfo.protocolVersion = self.serverInfoProtocolVersion 
								}

								if( (namespace + "X_Hybridcast_App2AppURL") in addData ) {
									self.wsURL = addData[namespace + "X_Hybridcast_App2AppURL"];
								}

								if(self.serverInfoProtocolVersion == "2.0") {
									if( (namespace + "X_Hybridcast_TVControlURL") in addData ) {
										self.baseURL = addData[namespace + "X_Hybridcast_TVControlURL"];
										self.setRestBaseURL( self.baseURL ) ;
									}
								}
							}

							logger.debug( "serverInfo: " + self.serverInfo );
							logger.debug( "serverInfoProtocolVersion: " + self.serverInfoProtocolVersion );
							logger.debug( "wsURL: " + self.wsURL );
							logger.debug( "baseURL: " + self.baseURL );
							logger.debug( self.hcex_endpoint );
							status.setStatus( StatusCode.OK, "", "");
						}
						else {
							logger.error( "Error: service not exist." );
							status.setStatus( StatusCode.ServiceUnavailable, "", "");
						}

//						resolve(jsondata);
						if(rescb) {
							rescb(status);
						}
					});
				}).catch(function(err) {
					logger.error( "Error: getDialAppInfo()1 " + self.appStatusURL );
					logger.error( err );
//					reject(err);
					if(rescb) {
						rescb(status);
					}
				});
			});

			self.hcobj.then(function(data) {
				logger.debug( "hcobj resolve" );
				logger.debug( data );
			}, function(err) {
				logger.error( "Error: getDialAppInfo()2 " + self.appStatusURL );
				logger.error( err );
			});
		}

		logger.debug( "getDialAppInfo() status: " + JSON.stringify(status));

		return status;
	}


	/**
	 * メディア利用可否の取得
	 */
	//getAvailableMedia
	ActHCXP.prototype.getAvailableMedia = function(devinfo, rescb) {
		let self = this;

		var status = new HCXPStatus();
		status.setStatus(StatusCode.OK, "{}", "");

		let url = self.hcex_endpoint["HCEX_Media"] ;
		let headers = {};
		headers["Content-Type"] = "application/json";
		let hr = new HTTPRequest("GET", devinfo, url, headers, null);
		hr.then( function(res) {
			logger.debug( res );
			rescb(res);
		}, function(err) {
			logger.error( err );
		});

		return status;
	}


	/**
	 * メディア利用可否の取得
	 */
	//getAvailableMedia
	ActHCXP.prototype.getChannelInfo = function(devinfo, media, rescb) {
		let self = this;

		var status = new HCXPStatus();
		status.setStatus(StatusCode.OK, "{}", "");

		let url = "";
		if( !checkMedia( media ) ) {
			if( media == "" ) {
				url = self.hcex_endpoint["HCEX_Channels"];
			}
			else {
				status.setStatus(StatusCode.BadRequest, "", "");
				rescb(status);
			}
		}
		else {
			url = self.hcex_endpoint["HCEX_Channels"]  + "?media=" + media;
		}
		let headers = {};
		headers["Content-Type"] = "application/json";
		let hr = new HTTPRequest("GET", devinfo, url, headers, null);
		hr.then( function(res) {
			logger.debug( res );
			rescb(res);
		}, function(err) {
			logger.error( err );
		});

		return status;
	}

	/**
	 * 受信機状態の取得
	 */
	//getReceiverStatus
	ActHCXP.prototype.getReceiverStatus = function(devinfo, rescb) {
		let self = this;

		var status = new HCXPStatus();
		status.setStatus(StatusCode.OK, "{}", "");

		let url = self.hcex_endpoint["HCEX_Status"] ;
		let headers = {};
		headers["Content-Type"] = "application/json";
		let hr = new HTTPRequest("GET", devinfo, url, headers, null);
		hr.then( function(res) {
			logger.debug( res );
			rescb(res);
		}, function(err) {
			logger.error( err.error );
		});

		return status;
	}


	/**
	 * アプリケーション起動
	 */
	//startAITControlledApp
	ActHCXP.prototype.startAITControlledApp = function(devinfo, mode, app, rescb) {
		let self = this;

		var status = new HCXPStatus();
		status.setStatus(StatusCode.OK, "{}", "");

		let url = "";
		if( !checkMode( mode ) ) {
			status.setStatus(StatusCode.BadRequest, "", "");
			rescb(status);
		}
		else {
			url = self.hcex_endpoint["HCEX_StartAIT"]  + "?mode=" + mode;
		}

		const isJSON = function(text) {
			try {
				JSON.parse(text);
				return true;
			} catch(error) {
				return false;
			}
		};


		let jsonAppdata = (isJSON(app)) ? JSON.parse(app) : app;
		try{
		var appInfo = JSON.stringify( jsonAppdata );

		let headers = {};
		headers["Content-Type"] = "application/json";
		let hr = new HTTPRequest("POST", devinfo, url, headers, appInfo);
		hr.then( function(res) {
			logger.debug( "OK startAITControlledApp()" );
			rescb(res);
		}, function(err) {
			logger.error( "NG startAITControlledApp()" );
			logger.error( "mode: " + mode + "app: " + JSON.stringify(jsonAppdata) );
			logger.error( err.error );
			rescb(err);
		});

		}catch(error){
			rescb(error);
		}

		return status;
	}

	/**
	 * 起動アプリケーション可否情報の取得
	 */
	//getTaskStatus
	ActHCXP.prototype.getTaskStatus = function(devinfo, rescb) {
		let self = this;

		var status = new HCXPStatus();
		status.setStatus(StatusCode.OK, "{}", "");

		let url = self.hcex_endpoint["HCEX_TaskStatus"] ;
		let headers = {};
		headers["Content-Type"] = "application/json";
		let hr = new HTTPRequest("GET", devinfo, url, headers, null);
		hr.then( function(res) {
			logger.debug( res );
			rescb(res);
		}, function(err) {
			logger.error( err.error );
		});

		return status;
	}

	//connWebsocket
	ActHCXP.prototype.connWebsocket = function(devinfo, msgrecv_cb, seturl_cb, rescb) {
		let self = this;

		var status = new HCXPStatus();
		status.setStatus(StatusCode.OK, "{}", "");

		wsc = new WebSocketClient( devinfo, msgrecv_cb, seturl_cb, self.wsURL );
		wsc.connect( rescb );

		return status;
	}

	//connWebsocket
	ActHCXP.prototype.sendWebsocket = function(devinfo, message, rescb) {
		let self = this;

		var status = new HCXPStatus();
		status.setStatus(StatusCode.OK, "{}", "");

		if( wsc != null ) {
			wsc.send( message, rescb );
		}
		else {
			status.setStatus(StatusCode.ServiceUnavailable, "{}", "");
			rescb(status);
		}
		return status;
	}


	return ActHCXP;
})();

module.exports.ActHCXP = ActHCXP;
