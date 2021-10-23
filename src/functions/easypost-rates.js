const Easypost = require('@easypost/api');
const api = new Easypost('sgisHWipY9fJEbHq2MkkZA');

function index(event, context, callback) {
	/* Either objects or ids can be passed in. If the object does
	 * not have an id, it will be created. */

	var to = {
		"name": "Dr. Steve Brule",
	    "company": null,
	    "street1": "179 N Harbor Dr",
	    "street2": null,
	    "city": "Redondo Beach",
	    "state": "CA",
	    "zip": "90277",
	    "country": "US",
	};

	var from = {
	
		"name": "EasyPost",
	    "company": null,
	    "street1": "417 Montgomery Street",
	    "street2": "5th Floor",
	    "city": "San Francisco",
	    "state": "CA",
	    "zip": "94104",
	    "country": "US",
	}

	var box = {
	    "length": 20.2,
	    "width": 10.9,
	    "height": 5.0,
	    "predefined_package": null,
	    "weight": 140.8,
	    "created_at": "2013-04-22T05:39:57Z",
	    "updated_at": "2013-04-22T05:39:57Z"
	  }

	const toAddress = new api.Address(to);
	const fromAddress = new api.Address(from);
	const parcel = new api.Parcel(box);
	//const customsInfo = new api.CustomsInfo({ ... });

	const shipment = new api.Shipment({
	  to_address: toAddress,
	  from_address: fromAddress,
	  parcel: parcel
	});

	shipment.save().then(console.log);
}

exports.handler = index;