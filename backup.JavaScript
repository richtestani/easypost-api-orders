//*** App
const keys = {
	"sw_prd" : "sgisHWipY9fJEbHq2MkkZA",
	"sw_dev" : "7ZnJxxTtzWUdCWoQZfNqvQ",
	"rt_dev" : "EZTK8ef0bd4b068a479ba916d68146b321f6iYig0ustEKjDTkGGFcAW5g"
};

// If the country code in the cart is "US," all of these rules will apply, and
// any carriers/services defined in these rules will be added. If this setting
// is disabled, only the first match will apply. NOTE: with the setting
// disabled, the "zones" array is sorted in descending alphabetical order so
// that regex rules will *hopefully* run last. In the example above, this would
// result in the zone rules being executed in reverse from what is shown.
let breakOnFirstZoneMatch = 1;

// This setting prevents rules from being applied if the country code matches
// the flat rate rule.
let breakOnFlatRate = 1;

// Modify this array to configure the flat rate settings. Regex matches are
// supported.
const carriers = 	{
	"UPS" : {
		"name" : "UPS"
	},
	"FedEx" : {
		"name" : "FedEx"
	},
	"USPS" : {
		"name" : "USPS"
	}
};

var api = "https://api.easypost.com/v2/";
var parcels = [];
var items = [];
var categories = [];
var body = [];
const cart_items = cart['_embedded']['fx:items'];

var shippingApp = {
	carrier: "UPS",
	endpoint: "shipments",
	hasBowl: false,
	hasCase: false,
	hasMultiBowls: false,
	data: {},
	options: {
	    method: 'POST',
	    auth: {
	      'user': keys.sw_dev,
	    }
	}
};

shippingApp.data = {
	
	shipment : {
		"from_address" : {
			"street1" : "",
			"city" : "Tuscan",
			"state" : "AZ",
			"zip" : "85754",
			"country" : "US"
		},
		"to_address" : {
			"street1" : "",
			"city" : "Tuscan",
			"state" : "AZ",
			"zip" : "85754",
			"country" : "US"
		}
	},
	parcels : [
		{
			"length" : 5,
			"height" : 5,
			"witdth" : 5,
			"weight" : 12
		},
		{
			"length" : 5,
			"height" : 5,
			"witdth" : 5,
			"weight" : 12
		}
	]
};


//setup item data for review
for(var i in cart_items) {
	items.push(cart_items[i]);
	categories.push(cart_items[i]['_embedded']['fx:item_category'].code);
}

//these items are shipped with UPS
if(categories.indexOf('HANDLE-BOWL') > 0) {
	shippingApp.hasBowls = true;
	shippingApp.carrier = carriers["UPS"];
}

if(categories.indexOf('HANDLE-CASE') > 0) {
	shippingApp.hasBowls = true;
}

//change the endpoint if multiple items are 
if(items.length > 1 && shippingApp.hasBowls) {
	shippingApp.endpoint = "orders";
}



function parseShippingApp(object, name) {
	let url = '';
	for(s in object) {
		//console.log(typeof object[s])
		if( typeof object[s] === 'object' ) {
			url += urlEncodeObject(object[s], s, name);
			
		}
	}
	
	return url;
}

function urlEncodeObject(object, key, name) {
	
	return Object.keys(object).map(function(k) {
		if(!key) {
			//console.log('no key')
			return encodeURIComponent(k) + '=' + encodeURIComponent(object[k]);
		} else {
			//console.log('key supplied', s);
			//console.log(object[k], k)
			return name + '['+key+'][' + encodeURIComponent(k) + ']=' + encodeURIComponent(object[k]);
		}
		
	    
	}).join('&');
}

shippingApp.endpoint = 'order';
var endpoint = api + shippingApp.endpoint;
console.log(endpoint);

var demo = document.getElementById('app');

shippingApp.options.url = endpoint;
var shipment = parseShippingApp(shippingApp.data.shipment, 'order');
var parcels = parseShippingApp(shippingApp.data.parcels, 'order');
console.log(parcels)
data = shipment + parcels;

console.log(data);

// $.ajax(endpoint, {
// 	data: data,
// 	method: 'post',
// 	xhrFields: {
// 	        withCredentials: true
// 	 },
//     beforeSend: function (xhr) {
//         xhr.setRequestHeader('Authorization', 'Basic ' + btoa("user:"+keys.sw_prd));
//     },
// 	success: function(r) {
// 		console.log(r);
// 	}
// });

// var request = {
//     url: endpoint,
//     method: 'POST',
//     body: data,
//     auth: {
//       'user': keys.sw_dev,
//     }
// }
//
// var siteRates = [];
//
// await request(request, function(error, response, body) {
//
//     let payload = JSON.parse(body);
//     let epRates = payload['rates'];
//
// 	for(let i in epRates) {
// 		rates.add(10089+i, epRates[i].rate, epRates[i].carrier, 'TEST');
// 	}
//
// });




