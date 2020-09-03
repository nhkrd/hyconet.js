//
// Auto Test
// サンプルではないので、可能な限り"テスト"する。
// サンプルは動作の方法を示すのみで特にschema検証はしない
// json-schemaでのvalidate
//
const hyconet = require("../index.js");

/*
 * Sleep
 */
function sleep(time) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

/*
 * selDevice
 */
function selDevice(devList, keyword) {
	var seldev = null;
	for(var i=0; i<devList.length; i++) {
		if( 0 <= devList[i]['friendlyName'].indexOf(keyword) ) {
			seldev = {
				index: i,
				ipaddr: devList[i]['ipaddr']
			};
			break;
		}
	}
	return seldev;
}

/*
 * Test Main
 */
async function main() {
	const doSearch = false;
	var devList = [];

	if(doSearch) {
		// search
		await hyconet.search().then((data) => {
			console.log(data);
			console.log("searchTestEnd");
		});
		await console.log( hyconet.getDeviceList() );
		await console.log( hyconet.getDeviceListInfo() );

		// select
//		const dev1 = {
//			index: 1,
//			ipaddr: "192.168.150.12"
//		};

		await sleep(1000);
		devList = hyconet.getDeviceList(); 
		const msg2 = selDevice(devList, 'Fire TV');
		console.log("Selected Device: " + JSON.stringify(devList));

		await hyconet.select(msg2).then((data) => {
			console.log(data)
			console.log("selectTestEnd");
		})
	}
	else {

		const devinfo1 = {
			ipaddr:"192.168.0.111",
			profile:"HCXPGeneric",
			friendlyName:"AFTM",
			ApplicationURL: "http://192.168.0.111:8887/apps/",
			uuid: "annn-ttt--www-43GX850_A0501",
			LocationURL: "http://192.168.0.111:60000/upnp/dev/ac1eb2b3-9888-3f93-b11c-9d9fe91587d8/desc"
		}

		const devinfo2 = {
		  ipaddr:"172.16.12.44",
		  profile:"HCXPGeneric",
		  friendlyName:"FireTV Stick",
		  ApplicationURL: "http://172.16.12.44:8887/apps/antwapp",
		  uuid: "http://172.16.12.44:8887",
		  LocationURL: "http://172.16.12.44:60000/upnp/dev/edebe205-3256-3b02-b3dc-f1397a960782/desc"
		}

		const devinfo3 = {
			ipaddr:"172.16.12.25",
			profile:"HCXPGeneric",
			friendlyName:"430_A0501",
			ApplicationURL: "http://172.16.12.25:55000/nrc/dial",
			uuid: "172.16.12.25-43GX850_A0501",
			LocationURL: "http://172.16.12.25:55000/nrc/ddd.xml"
		}

		const devinfo4 = {
		  ipaddr:"192.168.150.12",
		  profile:"HCXPGeneric",
		  friendlyName:"FireTV Stick",
		  ApplicationURL: "http://192.168.150.12:8887/apps/antwapp",
		  uuid: "http://192.168.150.12:8887",
		  LocationURL: "http://192.168.150.12:60000/upnp/dev/c5890ada-8593-31a2-bce2-ad1390cb8f57/desc"
		}

		await hyconet.directselect(devinfo1).then((data) => {
			console.log(data)
			console.log("dselTestEnd");
		})
	}

	// getMedia
	await sleep(1000)
	await hyconet.getMedia().then( d => console.log(d))

	// channels
	await sleep(1000)
	await hyconet.getChannels({media:"TD"}).then( d => console.log(d))

	// getreceiverstatus
	await sleep(1000)
	await hyconet.getReceiverStatus().then(d => console.log(d))

	//startAIT mode=tune
	await sleep(1000)
	await hyconet.startAITControlledApp(
		{
		  mode:"tune",
		  app: {
			resource: {original_network_id: 4, transport_stream_id: 16625, service_id: 101},
			hybridcast: {aiturl:"http://example.com/nhk.ait",orgid:16,appid:1}
		  }
		}).then(d => console.log(d))
	  
	await sleep(1000)
	await hyconet.getTaskStatus().then(d => console.log(d))
		// getreceiverstatus
	await sleep(1000)
	await hyconet.getReceiverStatus().then(d => console.log(d))

  
	//startAIT mode=app
	await hyconet.startAITControlledApp(
		{
		  mode:"app",
		  app: {
			resource: {original_network_id: 4, transport_stream_id: 16433, service_id: 103},
			hybridcast: {aiturl:"http://example.com/nhk.ait",orgid:16,appid:1}
		  }
		}).then(d => console.log(d))

	// gettaskstatus
	await sleep(1000)
	await hyconet.getTaskStatus().then(d => console.log(d))
	// getreceiverstatus
	await sleep(1000)
	await hyconet.getReceiverStatus().then(d => console.log(d))



	// Websocket Communication API
	// websocket setListener(wsmsgReceiver , seturlReceiver)
	await sleep(1000)
	await hyconet.setWebsocketListener(
		function(d){console.log(d);console.log("wsMsg Received")},
		function(e){console.log(e);console.log("seturl Received")}
	)

	// connetcWebsocketSession
	await sleep(1000)
	await hyconet.connWebsocket().then(d => console.log(d))

	// sendtext over Websocket
	await sleep(1000)
	await hyconet.sendTextOverWebsocket("ハイコネテキスト送信テストメッセージ").then(d => console.log(d))

	// requestURL
	await sleep(1000);
	await hyconet.requestUrlOverWebsocket();

	await process.exit(0);
}

main();
