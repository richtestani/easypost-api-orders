console.log(cart);
// Add your Easypost API key here:
//const easypostApiKey = '7ZnJxxTtzWUdCWoQZfNqvQ'; // Test
//const easypostApiKey = 'sgisHWipY9fJEbHq2MkkZA'; // Prod
const keys = {
	"sw_prd" : "sgisHWipY9fJEbHq2MkkZA",
	"sw_dev" : "7ZnJxxTtzWUdCWoQZfNqvQ",
	"rt_dev" : "EZTK8ef0bd4b068a479ba916d68146b321f6iYig0ustEKjDTkGGFcAW5g"
};

// This setting will stop adding services/rates after the first zone rule is
// matched given the country code in the cart. For instance, consider the
// following zone rules:
// 
// const zones = [
//   {
//     "countries": [".*"],
//     ...
//   },
//   {
//     "countries": ["U.*"],
//     ...
//   },
//   {
//     "countries": ["US"],
//     ...
//   },
// ];
//
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
const flat_rate = {
  "countries": ["US"],
  "carrier": "USPS",
  "service": "Flat Rate Priority Mail",
  "rate": 9.49
};

// Use this array to configure the zones, carriers, and services. Regex matches
// are supported for the countries, carrier names, and services.
const zones = [
  {
    "countries": ["CA"],
    "carriers": {
      "USPS": ["PriorityMailInternational", "ExpressMailInternational"]
    }
  },
  {
    "countries": [".*"],
    "carriers": {
      "UPS": ["Expedited"]
    }
  },
];

/* DO NOT MAKE CHANGES PAST THIS POINT UNLESS YOU KNOW WHAT YOU ARE DOING! */

function multiDimensionalUnique(arr) {
    var uniques = [];
    var itemsFound = {};
    for (var i = 0, l = arr.length; i < l; i++) {
        var stringified = JSON.stringify(arr[i]);
        if (itemsFound[stringified]) {
        continue;
        }
        uniques.push(arr[i]);
        itemsFound[stringified] = true;
    }
    return uniques;
}

if (breakOnFirstZoneMatch) {
  zones.sort(function(a,b) {
    a.countries.sort().reverse();
    b.countries.sort().reverse();
    return b.countries[0].localeCompare(a.countries[0]);
  });
}

let cartCategories = [];

for( let p in cart['_embedded']['fx:items'] ) {
	
	let item = cart['_embedded']['fx:items'][p];
	cartCategories.push( item['_embedded']['fx:item_category']['code'] );
	
}

if(cartCategories.indexOf('HANDLE-BOWL') > 0) {
	
}

let shipment = cart['_embedded']['fx:shipment'];

//US based shipment
let weight = shipment['total_weight'];
let length = '10';
let width = '10';
let height = '10';

//Canada based shipment
if (shipment['country'] == 'CA') {
  weight = weight + 3;
  length = '15';
  width = '13';
  height = '3';
}

//Rest of the world
if (shipment['country'] != 'CA' && shipment['country'] != 'US') {
    weight = weight + 3;
  length = '16';
  width = '11';
  height = '3';
}


let dataString =
  'shipment[to_address][street1]=' + shipment['address1'] +
  '&shipment[to_address][city]=' + shipment['city'] +
  '&shipment[to_address][state]=' + shipment['region'] +
  '&shipment[to_address][zip]=' + shipment['postal_code'] +
  '&shipment[to_address][country]=' + shipment['country'] +
  '&shipment[from_address][street1]=' + '' +
  '&shipment[from_address][city]=' + 'Tucson' +
  '&shipment[from_address][state]=' + 'AZ' +
  '&shipment[from_address][zip]=' + '85754' +
  '&shipment[from_address][country]=' + 'US' +
  '&shipment[parcel][length]=' + length +
  '&shipment[parcel][width]=' + width +
  '&shipment[parcel][height]=' + height +
  '&shipment[parcel][weight]=' + weight;


var options = {
  url: 'https://api.easypost.com/v2/shipments',
  method: 'POST',
  body: dataString,
  auth: {
    'user': keys.sw_prd,
  }
};

let country = shipment['country'];
let rateId = 10001;
var rateArr = [];

rates.hide();

for (let cntry in flat_rate.countries) {
  if (flat_rate.countries[cntry] == country || country.match(new RegExp(flat_rate.countries[cntry], "g")) !== null) {
    rates.add(rateId,
      flat_rate['rate'],
      flat_rate['carrier'],
      flat_rate['service']
    );
    rateId++;
  }
}

if (breakOnFlatRate == 1 && rates.count() > 0) {
  // I'm not sure of the logical inverse of this, so . . .
  return rates;
}else {
  // It's okay for this error to exist - verified with Foxy team.
  await request(options, function(error, response, body) {
    if (response && (response.statusCode == 200 || response.statusCode == 201)) {
      let payload = JSON.parse(body);
      let epRates = payload['rates'];

      if (rates.count() < 1) {
        for (let zone in zones) {
          if (breakOnFirstZoneMatch == 2) {
            break;
          }
          zone = zones[zone];
          for (let cntry in zone['countries']) {
            if (zone.countries[cntry] == country || country.match(new RegExp(zone.countries[cntry], "g")) !== null) {
              if (breakOnFirstZoneMatch) {
                breakOnFirstZoneMatch = 2;
              }
              for (let carrier in zone.carriers) {
                for (let rate in epRates) {
                  if (epRates[rate].carrier == carrier || epRates[rate].carrier.match(new RegExp(carrier, "g")) !== null) {
                    for (let service in zone.carriers[carrier]) {
                      if (epRates[rate].service == zone.carriers[carrier][service] || epRates[rate].service.match(new RegExp(zone.carriers[carrier][service], "g")) !== null) {
                        rateArr.push([
                          epRates[rate].rate,
                          epRates[rate].carrier,
                          epRates[rate].service.replace(/^(UPS|USPS)/g, '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
                        ]);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    rateArr = multiDimensionalUnique(rateArr);

    rateArr.sort(function(a, b) {
      return b[0].localeCompare(a[0]);
    });

    for (let rate in rateArr) {
      rates.add(
        rateId,
        rateArr[rate][0],
        rateArr[rate][1],
        rateArr[rate][2]
      );

      rateId++;
    }

    // This is the rate adjustment logic. There may be a way to combine
    // this with the zone rules, but it would get tricky since there is the
    // possibility of multiple matching zones being applied to the same
    // rates (thus causing a multiplying effect).
    if (country == "CA") {
      let insurance = 7;
      if (cart['total_item_price'] > 50) {
      	insurance = (cart['total_item_price'] * 0.015) + insurance;
      }
      rates.price('+' + insurance);
    }
    else if (country != "US") {
      let insurance = 3.5;
      if (cart['total_item_price'] > 99) {
      	insurance = (cart['total_item_price'] * 0.015) + insurance;
      }
      rates.price('+' + insurance);
    }
    return rates;
  });
}
	
