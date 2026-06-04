const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('./models/Property');
const User = require('./models/User');

dotenv.config();

const localities = [
  'Gachibowli',
  'Hitech City',
  'Kondapur',
  'Madhapur',
  'Kukatpally',
  'Financial District',
  'Jubilee Hills',
  'Banjara Hills',
  'Manikonda',
  'Narsingi'
];

const propertyTemplates = [
  {
    title: 'Luxury 4 BHK Villa with Private Pool',
    type: 'villa',
    furnishing: 'Fully-Furnished',
    area: 4200,
    bathrooms: 5,
    bedrooms: 4,
    description: 'A premium villa with landscaped gardens, private pool, home theatre, and a family lounge area. Ideal for buyers seeking a luxury lifestyle in a gated community with 24/7 security and concierge services.',
    amenities: ['Private Pool', 'Gym', 'Club House', 'Garden', 'Parking', 'CCTV'],
  },
  {
    title: 'Modern 3 BHK Apartment in Prime Locality',
    type: 'apartment',
    furnishing: 'Semi-Furnished',
    area: 1750,
    bathrooms: 3,
    bedrooms: 3,
    description: 'A bright and airy apartment with floor-to-ceiling windows, open plan living, and access to a rooftop lounge. Located within walking distance of metro stations and shopping malls.',
    amenities: ['Gym', 'Power Backup', 'Swimming Pool', 'Children Play Area', 'Parking'],
  },
  {
    title: 'Cozy 2 BHK Family Home',
    type: 'apartment',
    furnishing: 'Fully-Furnished',
    area: 1100,
    bathrooms: 2,
    bedrooms: 2,
    description: 'This comfortable apartment is perfect for a small family, offering modern fixtures, efficient storage, and excellent connectivity to schools, hospitals, and offices.',
    amenities: ['24/7 Security', 'Lift', 'Power Backup', 'Play Area', 'Covered Parking'],
  },
  {
    title: 'Premium Office Space in Commercial Hub',
    type: 'commercial',
    furnishing: 'Bare Shell',
    area: 3200,
    bathrooms: 2,
    bedrooms: 0,
    description: 'A spacious office floor inside a prime commercial complex with high visibility, easy access to highways, and dedicated parking for employees and visitors.',
    amenities: ['High-Speed Elevators', 'Cafeteria', 'Parking', 'Central Air', 'Security'],
  },
  {
    title: 'Plot with Excellent Road Access',
    type: 'plot',
    furnishing: '',
    area: 2500,
    bathrooms: 0,
    bedrooms: 0,
    description: 'A clear title plot ready for immediate construction. Ideal for investors and developers seeking growth in a fast-developing suburb.',
    amenities: ['Road Facing', 'Clear Title', 'Drainage', 'Electricity Connection', 'Corner Plot'],
  },
];

const propertyImages = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560185127-6a8dfa1cf1fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=1200&q=80',
];


const pickRandom = (array) => array[Math.floor(Math.random() * array.length)];
const shuffle = (array) => array.sort(() => Math.random() - 0.5);

const run = async () => {
  const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estateai';
  await mongoose.connect(connStr);

  const existingHydCount = await Property.countDocuments({ city: 'hyderabad' });
  console.log(`Current Hyderabad properties count: ${existingHydCount}`);

  // We want to ensure at least 20 Hyderabad properties are seeded.
  const targetCount = 20;
  const needToSeed = targetCount - existingHydCount;

  if (needToSeed <= 0) {
    console.log('Hyderabad properties already exceed target count. No seeding required.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Seeding ${needToSeed} Hyderabad properties...`);

  // Fetch some sellers and agents
  const sellers = await User.find({ role: 'seller' });
  const agents = await User.find({ role: 'agent' });

  if (sellers.length === 0 || agents.length === 0) {
    console.error('Sellers or agents not found in DB. Make sure seed.js has run first.');
    await mongoose.disconnect();
    return;
  }

  const propertyEntries = [];
  const startIdx = existingHydCount + 1;

  for (let i = 0; i < needToSeed; i++) {
    const locality = pickRandom(localities);
    const template = pickRandom(propertyTemplates);
    const isSale = Math.random() > 0.35;
    const listingType = isSale ? 'sale' : 'rent';
    
    // Hyderabad pricing model
    const price = listingType === 'sale'
      ? 6000000 + Math.round(Math.random() * 24000000)
      : 20000 + Math.round(Math.random() * 60000);

    const bedrooms = template.bedrooms || Math.max(1, Math.ceil(Math.random() * 4));
    const bathrooms = template.bathrooms || Math.max(1, Math.ceil(Math.random() * 3));
    const area = template.area + Math.round(Math.random() * 900);
    const amenities = shuffle([...template.amenities, '24/7 Security', 'WiFi', 'Power Backup']).slice(0, 6);
    const seller = pickRandom(sellers);
    const agent = pickRandom(agents);

    // Random coordinates around Hyderabad center (17.3850, 78.4867)
    const coordinates = {
      lat: 17.3850 + (Math.random() - 0.5) * 0.1,
      lng: 78.4867 + (Math.random() - 0.5) * 0.1,
    };

    const streetNames = ['Avenue 4', 'Oak Plaza', 'Lakeview Road', 'Hillcrest Drive', 'Cyber Way', 'Royal Crest'];
    const address = `${startIdx + i}, ${pickRandom(streetNames)}, ${locality}, Hyderabad - ${Math.floor(500001 + Math.random() * 99)}`;

    const title = `${template.title} in ${locality}`;
    const images = shuffle(propertyImages).slice(0, 4);

    propertyEntries.push({
      title,
      description: template.description,
      price,
      propertyType: template.type,
      bedrooms,
      bathrooms,
      area,
      city: 'hyderabad',
      state: 'telangana',
      address,
      amenities,
      images,
      coordinates,
      seller: seller._id,
      agent: agent._id,
      status: 'available',
      viewsCount: 50 + Math.round(Math.random() * 400),
      listingType,
      furnishing: template.furnishing,
      tenants: listingType === 'rent' ? pickRandom(['Families', 'Bachelors', 'Family / Bachelors']) : '',
    });
  }

  await Property.insertMany(propertyEntries);
  console.log(`Successfully seeded ${needToSeed} new Hyderabad properties.`);
  
  const finalHydCount = await Property.countDocuments({ city: 'hyderabad' });
  console.log(`Total Hyderabad properties now: ${finalHydCount}`);

  await mongoose.disconnect();
};

run();
