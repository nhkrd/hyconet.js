'use strict'

const hyconet = require("../index.js")

hyconet.search().then(function(data) {
  console.log(data);
  console.log("searchTestEnd");
})

/*
const msg2 = {
    index: 1,
    ipaddr: "172.16.12.44"
}

const selectPromise = hyconet.select(msg2)
selectPromise.then(function(data) {
  console.log(data)
  console.log("selectTestEnd");
})

const deviceinfo1 = {
    ipaddr:"192.168.0.111",
    profile:"HCXPGeneric",
    friendlyName:"AFTM",
    ApplicationURL: "http://192.168.0.111:8887/apps/",
    uuid: "annn-ttt--www-43A0501",
    LocationURL: "http://192.168.0.111:60000/upnp/dev/ac1eb2b3-9888-3f93-b11c-9d9fe91587d8/desc"
}

const deviceinfo2 = {
    ipaddr:"172.16.12.44",
    profile:"HCXPGeneric",
    friendlyName:"43GX850_A0501",
    ApplicationURL: "http://172.16.12.44/",
    uuid: "172.16.12.25-43A0501",
    LocationURL: "http://172.16.12.25:55000/nrc/ddd.xml"
}
*/
const deviceinfo3 = {
  ipaddr:"172.16.12.44",
  profile:"HCXPGeneric",
  friendlyName:"FireTV Stick",
  ApplicationURL: "http://172.16.12.44:8887/apps/antwapp",
  uuid: "http://172.16.12.44:8887",
  LocationURL: "http://172.16.12.44:60000/upnp/dev/edebe205-3256-3b02-b3dc-f1397a960782/desc"
}

hyconet.directselect(deviceinfo3)
    .then(function(data) {
  console.log(data)
  console.log("dselTestEnd");

})

// getMedia
hyconet.getMedia().then( d => console.log(d))

// channels
hyconet.getChannels({media:"TD"}).then( d => console.log(d))

// getstatus
hyconet.getReceiverStatus().then(d => console.log(d))

//startAIT
hyconet.startAITControlledApp(
  {
    mode:"tune",
    app: {
      resource: {original_network_id: 4, transport_stream_id: 16625, service_id: 101},
      hybridcast: {aiturl:"http://example.com/nhk.ait",orgid:16,appid:1}
    }
  }).then(d => console.log(d))


hyconet.startAITControlledApp(
  {
    mode:"app",
    app: {
      resource: {original_network_id: 4, transport_stream_id: 16433, service_id: 103},
      hybridcast: {aiturl:"http://example.com/nhk.ait",orgid:16,appid:1}
    }
  }).then(d => console.log(d))

// Websocket Communication API
// websocket setListener(wsmsgReceiver , seturlReceiver)
hyconet.setWebsocketListener(
    function(d){console.log(d);console.log("wsMsg Received")},
    function(e){console.log(e);console.log("seturl Received")}
)

// connetcWebsocketSession
hyconet.connWebsocket().then(d => console.log(d))

// sendtext over Websocket
hyconet.sendTextOverWebsocket("ただいま").then(d => console.log(d))

// requestURL
hyconet.requestUrlOverWebsocket()
