//
// Hybridcast Connect: SSDP
//
var HCXPSSDP = (function() {
	const HCXPStatus = require("./hyconet_status.js").HCXPStatus;
	const StatusCode = require("./hyconet_status.js").StatusCode;
	const Logger = require("./hyconet_logger.js").Logger;
	const Client = require('node-ssdp').Client;

	const device_urn = "urn:dial-multiscreen-org:service:dial:1";
	const logger = new Logger("hyconet_ssdp");

	var HCXPSSDP = function() {
		let self = this;

		self.tvlist_idx = 0;
		self.tvlist = [];
		self.tvinfo = [];

		self.client = new Client();

		self.client.on('response', function(headers, statusCode, rinfo) {
			logger.debug('Got a response to an m-search.');
			logger.debug(rinfo);
			logger.debug(headers);

			if( rinfo['address'] != "192.168.49.1" ) {
//				self.tvlist.push({"profile_name":"HCXPGeneric", "rinfo":rinfo, "headers":headers});
				self.tvlist.push({"profile_name":"HCXPGeneric", "devType":"DIAL", "rinfo":rinfo, "headers":headers});
			}
		});
	};

	//
	// search_result
	//
	HCXPSSDP.prototype.search_result = function(rescb) {
		let self = this;

		var status = new HCXPStatus();
		logger.debug('search_result: ' + self.tvlist.length);

		if( self.tvlist_idx < self.tvlist.length ) {
			var loc_url = self.tvlist[self.tvlist_idx]['headers']['LOCATION'];
			logger.debug('LL: ' +  self.tvlist_idx + " " + loc_url);
			var request = require("request");
			request.get({url:loc_url, timeout:3000}, function(error, response, body) {
				logger.debug("Error: " + error);
				logger.debug("Body:  " + body);
				if( !!body && !!response.headers ) {
					logger.debug (response.headers);
					Object.keys(response.headers).forEach(function(data) {
						if( data.toUpperCase() == "APPLICATION-URL" ) {
							logger.debug ("APPURL: " + response.headers[data]);
							self.tvlist[self.tvlist_idx]['applicationURL'] = response.headers[data];
		 				}
					})

					var to_json = require('xmljson').to_json;
					to_json(body, function(error, jsondata) {
						logger.debug(jsondata);
						self.tvlist[self.tvlist_idx]['devinfo'] = jsondata;
						self.tvlist_idx++;
						self.search_result(rescb);
					});
				}
				else {
					self.tvlist_idx++;
					self.search_result(rescb);
				}
			});
		}
		else {
			setTimeout( function() {
				for(var i=0; i<self.tvlist.length; i++) {
					if( self.tvlist[i]['devinfo'] ) {
						self.tvinfo.push({
							"devType": self.tvlist[i]['devType'],
							"profile_name": self.tvlist[i]['profile_name'],
							"ipaddr": self.tvlist[i]['rinfo']['address'],
							"modelname": self.tvlist[i]['devinfo']['root']['device']['modelName'],
							"manufacturer": self.tvlist[i]['devinfo']['root']['device']['manufacturer'],
							"friendlyName": self.tvlist[i]['devinfo']['root']['device']['friendlyName'],
							"applicationURL": self.tvlist[i]['applicationURL'],
							"locationURL": self.tvlist[i]['headers']['LOCATION'],
							"usn": self.tvlist[i]['headers']['USN']
						});
					}
				}

				status.setStatus( StatusCode.OK, JSON.stringify(self.tvinfo), "" );
				logger.debug("************** FINAL *************");
				logger.debug(status);
				logger.debug("************** FINAL *************");

				rescb( status );
			}, 3000);
		}
	}

	//
	// Search Start
	//
	HCXPSSDP.prototype.search_start = function(rescb) {
		let self = this;

		self.tvlist_idx = 0;
		self.tvlist = [];
		self.tvinfo = [];

		logger.info("************** Search START *************");
		self.client.search( device_urn );
		setTimeout( function() {
//			self.client.stop();
			self.search_stop();
			self.search_result(rescb);
		}, 7000);
	}

	//
	// Search Stop
	//
	HCXPSSDP.prototype.search_stop = function() {
		logger.info("************** Search STOP *************");
		this.client.stop();
	}

//	return {
//		search_start: search_start,
//		search_stop: search_stop
//	}

	return HCXPSSDP;
})();


module.exports.HCXPSSDP = HCXPSSDP;
