export const BOOKING_API_VERSION = '3.2';

export const BOOKING_ENVIRONMENTS = {
  sandbox: `https://demandapi-sandbox.booking.com/${BOOKING_API_VERSION}`,
  production: `https://demandapi.booking.com/${BOOKING_API_VERSION}`,
};

export const BOOKING_ACCOMMODATION_APIS = [
  {
    id: 'search',
    title: 'Search accommodations',
    path: '/accommodations/search',
    description:
      'Find properties matching a destination, stay dates, guests, filters, and booker context. Returns the best available match and price per property.',
    sampleBody: {
      booker: {country: 'nl', platform: 'desktop', travel_purpose: 'business'},
      checkin: '{{CHECKIN_DATE}}',
      checkout: '{{CHECKOUT_DATE}}',
      city: -2140479,
      extras: ['extra_charges', 'products'],
      guests: {number_of_adults: 2, number_of_rooms: 1},
      rows: 10,
    },
  },
  {
    id: 'availability',
    title: 'Check availability',
    path: '/accommodations/availability',
    description:
      'Retrieve real-time products, prices, charges, and booking conditions for up to 50 selected accommodation IDs.',
    sampleBody: {
      accommodations: [10507360],
      booker: {country: 'nl', platform: 'desktop', travel_purpose: 'business'},
      checkin: '{{CHECKIN_DATE}}',
      checkout: '{{CHECKOUT_DATE}}',
      extras: ['extra_charges'],
      guests: {number_of_adults: 2, number_of_rooms: 1},
    },
  },
  {
    id: 'chains',
    title: 'List chains and brands',
    path: '/accommodations/chains',
    description:
      'Retrieve accommodation chains and their brands for reference data and chain- or brand-based filtering.',
    sampleBody: null,
  },
  {
    id: 'constants',
    title: 'Retrieve accommodation constants',
    path: '/accommodations/constants',
    description:
      'Load canonical identifiers for facilities, property types, rooms, beds, charge types, themes, and review scores.',
    sampleBody: {
      constants: [
        'accommodation_facilities',
        'accommodation_types',
        'charge_types',
        'room_facilities',
      ],
      languages: ['en-gb'],
    },
  },
  {
    id: 'details',
    title: 'Retrieve property details',
    path: '/accommodations/details',
    description:
      'Get static property content such as descriptions, facilities, photos, policies, payment information, and rooms.',
    sampleBody: {
      accommodations: [10507360],
      extras: [
        'description',
        'facilities',
        'payment',
        'photos',
        'policies',
        'rooms',
      ],
      languages: ['en-gb'],
    },
  },
  {
    id: 'details-changes',
    title: 'Track property-content changes',
    path: '/accommodations/details/changes',
    description:
      'Identify properties opened, closed, or updated since a UTC timestamp within the last 24 hours, enabling incremental content refresh.',
    sampleBody: {
      last_change: '{{LAST_CHANGE_UTC}}',
      filters: {countries: ['nl']},
    },
  },
  {
    id: 'reviews',
    title: 'Retrieve guest reviews',
    path: '/accommodations/reviews',
    description:
      'Return paginated traveller reviews for selected properties. Access depends on the partner agreement with Booking.com.',
    sampleBody: {
      accommodations: [10507360],
      languages: ['en-gb'],
      rows: 10,
    },
  },
  {
    id: 'review-scores',
    title: 'Retrieve review-score breakdowns',
    path: '/accommodations/reviews/scores',
    description:
      'Return aggregate score distributions and category breakdowns for selected properties. Access may require contractual permission.',
    sampleBody: {
      accommodations: [10507360],
      languages: ['en-gb'],
    },
  },
];

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

export function materializeRequestBody(api, now = new Date()) {
  if (api.sampleBody === null) {
    return '';
  }

  const checkin = new Date(now);
  checkin.setUTCDate(checkin.getUTCDate() + 60);

  const checkout = new Date(checkin);
  checkout.setUTCDate(checkout.getUTCDate() + 2);

  const lastChange = new Date(now.getTime() - 60 * 60 * 1000);
  const json = JSON.stringify(api.sampleBody, null, 2)
    .replaceAll('{{CHECKIN_DATE}}', formatDate(checkin))
    .replaceAll('{{CHECKOUT_DATE}}', formatDate(checkout))
    .replaceAll('{{LAST_CHANGE_UTC}}', lastChange.toISOString());

  return json;
}

export function buildCurl({
  api,
  baseUrl,
  affiliateId = '<AFFILIATE_ID>',
  requestBody,
  token = '<API_KEY_TOKEN>',
}) {
  const lines = [
    `curl -i -X POST \\`,
    `  '${baseUrl}${api.path}' \\`,
    `  -H 'Authorization: Bearer ${token}' \\`,
    `  -H 'Accept: application/json' \\`,
    `  -H 'X-Affiliate-Id: ${affiliateId}'`,
  ];

  if (requestBody.trim()) {
    lines[lines.length - 1] += ` \\`;
    lines.push(`  -H 'Content-Type: application/json' \\`);
    lines.push(`  --data-raw '${requestBody.replaceAll("'", "'\\''")}'`);
  }

  return lines.join('\n');
}
