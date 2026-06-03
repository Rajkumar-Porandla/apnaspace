const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Property = require('./models/Property');
const Review = require('./models/Review');
const Booking = require('./models/Booking');
const Message = require('./models/Message');
const Notification = require('./models/Notification');

dotenv.config();

const pickRandom = (array) => array[Math.floor(Math.random() * array.length)];
const shuffle = (array) => array.sort(() => Math.random() - 0.5);
const range = (n) => Array.from({ length: n }, (_, i) => i);

const cities = [
  {
    city: 'hyderabad',
    state: 'telangana',
    coordinates: { lat: 17.3850, lng: 78.4867 },
    labels: ['Hitech City', 'Banjara Hills', 'Gachibowli', 'Jubilee Hills', 'Kondapur'],
  },
  {
    city: 'bangalore',
    state: 'karnataka',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    labels: ['Koramangala', 'Whitefield', 'Indiranagar', 'Hebbal', 'Yelahanka'],
  },
  {
    city: 'mumbai',
    state: 'maharashtra',
    coordinates: { lat: 19.0760, lng: 72.8777 },
    labels: ['Bandra', 'Powai', 'Andheri', 'Juhu', 'Lower Parel'],
  },
  {
    city: 'delhi',
    state: 'delhi',
    coordinates: { lat: 28.7041, lng: 77.1025 },
    labels: ['Dwarka', 'Saket', 'Gurugram', 'Rohini', 'Green Park'],
  },
  {
    city: 'pune',
    state: 'maharashtra',
    coordinates: { lat: 18.5204, lng: 73.8567 },
    labels: ['Koregaon Park', 'Baner', 'Kharadi', 'Wakad', 'Aundh'],
  },
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
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560185127-6a8dfa1cf1fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=1200&q=80',
];

const userProfiles = [
  { name: 'Rahul Sharma', email: 'rahul@buyer.com', role: 'buyer' },
  { name: 'Ayesha Reddy', email: 'ayesha@buyer.com', role: 'buyer' },
  { name: 'Rohan Kapoor', email: 'rohan@buyer.com', role: 'buyer' },
  { name: 'Nisha Sharma', email: 'nisha@buyer.com', role: 'buyer' },
  { name: 'Siddharth Jain', email: 'siddharth@buyer.com', role: 'buyer' },
  { name: 'Manisha Singh', email: 'manisha@buyer.com', role: 'buyer' },
  { name: 'Kunal Mehta', email: 'kunal@buyer.com', role: 'buyer' },
  { name: 'Divya Choudhary', email: 'divya@buyer.com', role: 'buyer' },
  { name: 'Aryan Deshmukh', email: 'aryan@buyer.com', role: 'buyer' },
  { name: 'Priya Nair', email: 'priya@buyer.com', role: 'buyer' },
  { name: 'Arjun Malhotra', email: 'arjun@buyer.com', role: 'buyer' },
  { name: 'Vikram Mehta', email: 'vikram@agent.com', role: 'agent', license: 'RERA-HYD-1102-2026' },
  { name: 'Shreya Patil', email: 'shreya@agent.com', role: 'agent', license: 'RERA-BLR-9876-2025' },
  { name: 'Rahul Desai', email: 'rahul@agent.com', role: 'agent', license: 'RERA-MUM-3344-2024' },
  { name: 'Naveen Reddy', email: 'naveen@agent.com', role: 'agent', license: 'RERA-HYD-5567-2025' },
  { name: 'Isha Gupta', email: 'isha@agent.com', role: 'agent', license: 'RERA-DEL-6643-2026' },
  { name: 'Kabir Khan', email: 'kabir@agent.com', role: 'agent', license: 'RERA-PNE-2211-2025' },
  { name: 'Sonal Iyer', email: 'sonal@agent.com', role: 'agent', license: 'RERA-BLR-1984-2024' },
  { name: 'Aman Chopra', email: 'aman@agent.com', role: 'agent', license: 'RERA-MUM-8890-2025' },
  { name: 'Meera Nambiar', email: 'meera@agent.com', role: 'agent', license: 'RERA-PNE-7722-2026' },
  { name: 'Devika Rao', email: 'devika@agent.com', role: 'agent', license: 'RERA-DEL-4501-2026' },
  { name: 'Priya Patel', email: 'priya@seller.com', role: 'seller' },
  { name: 'Anjali Jain', email: 'anjali@seller.com', role: 'seller' },
  { name: 'Suresh Kulkarni', email: 'suresh@seller.com', role: 'seller' },
  { name: 'Deepa Nair', email: 'deepa@seller.com', role: 'seller' },
  { name: 'Kartik Sharma', email: 'kartik@seller.com', role: 'seller' },
  { name: 'Irfan Sheikh', email: 'irfan@seller.com', role: 'seller' },
  { name: 'Ritu Mehta', email: 'ritu@seller.com', role: 'seller' },
  { name: 'Nikhil Joshi', email: 'nikhil@seller.com', role: 'seller' },
];

const avatarLinks = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
];

const reviewComments = [
  'The property photos were accurate and the agent was very responsive.',
  'Great location, easy access to schools and shops.',
  'The amenities were well maintained and the building security felt very safe.',
  'Smooth booking experience and quick follow-up from the agent.',
  'Nice apartment but the lift was occasionally slow during peak hours.',
  'Perfect for families, especially because of the children play area nearby.',
  'Pricing was competitive compared to nearby listings.',
  'Had a great site visit; the seller provided full details about maintenance.',
  'The team handled paperwork efficiently and professionally.',
  'Very satisfied with the overall customer service and local market knowledge.',
];

const notificationTemplates = [
  { type: 'booking_request', title: 'New booking request received', message: 'A buyer has requested a visit for one of your listings.' },
  { type: 'booking_status', title: 'Booking confirmed', message: 'Your visit request has been approved by the seller/agent.' },
  { type: 'inquiry', title: 'New inquiry received', message: 'A prospective buyer has asked a question on your property.' },
  { type: 'property_saved', title: 'Property saved by buyer', message: 'A buyer added your property to their favorites list.' },
  { type: 'property_sold', title: 'Property marked sold', message: 'One of your listed properties has been moved to sold status.' },
];

const generatePropertyPrice = (listingType, city) => {
  const priceBase = {
    hyderabad: { sale: 8500000, rent: 25000 },
    bangalore: { sale: 12000000, rent: 40000 },
    mumbai: { sale: 28000000, rent: 90000 },
    delhi: { sale: 15000000, rent: 45000 },
    pune: { sale: 11000000, rent: 32000 },
  };
  const base = priceBase[city];
  if (listingType === 'sale') {
    return base.sale + Math.round(Math.random() * 22000000);
  }
  return base.rent + Math.round(Math.random() * 35000);
};

const generatePropertyAddress = (cityMeta, label, index) => {
  const streetNames = ['Riverdale Road', 'Coral Lane', 'Park View Drive', 'Sapphire Street', 'Lotus Avenue', 'Palm Court', 'Cedar Boulevard'];
  return `${index + 10}, ${pickRandom(streetNames)}, ${label}, ${cityMeta.city.charAt(0).toUpperCase() + cityMeta.city.slice(1)} - ${Math.floor(100000 + Math.random() * 899999)}`;
};

const connect = async () => {
  const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estateai';
  console.log(`Connecting to MongoDB at: ${connStr.replace(/\/\/.*@/, '//<credentials>@')}`);
  await mongoose.connect(connStr);
};

const seedData = async () => {
  try {
    await connect();

    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      Property.deleteMany(),
      Review.deleteMany(),
      Booking.deleteMany(),
      Message.deleteMany(),
      Notification.deleteMany(),
    ]);

    const passwordHash = await bcrypt.hash('password123', 10);

    const users = [
      { name: 'System Admin', email: 'admin@estateai.com', role: 'admin', avatar: pickRandom(avatarLinks), password: passwordHash },
      ...userProfiles.map((profile) => ({
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: pickRandom(avatarLinks),
        password: passwordHash,
        isVerifiedAgent: profile.role === 'agent',
        agentLicense: profile.role === 'agent' ? profile.license : '',
      })),
    ];

    console.log('Creating users...');
    const createdUsers = await User.insertMany(users, { ordered: true });

    const admin = createdUsers.find((u) => u.role === 'admin');
    const buyerUsers = createdUsers.filter((u) => u.role === 'buyer');
    const sellerUsers = createdUsers.filter((u) => u.role === 'seller');
    const agentUsers = createdUsers.filter((u) => u.role === 'agent');

    const propertyEntries = [];
    const savedPropertyIds = [];

    console.log('Creating properties...');
    for (let i = 0; i < 50; i += 1) {
      const cityMeta = pickRandom(cities);
      const label = pickRandom(cityMeta.labels);
      const isSale = Math.random() > 0.35;
      const template = pickRandom(propertyTemplates);
      const listingType = isSale ? 'sale' : 'rent';
      const price = generatePropertyPrice(listingType, cityMeta.city);
      const bedrooms = template.bedrooms || Math.max(1, Math.ceil(Math.random() * 4));
      const bathrooms = template.bathrooms || Math.max(1, Math.ceil(Math.random() * 3));
      const area = template.area + Math.round(Math.random() * 900);
      const amenities = shuffle([...template.amenities, '24/7 Security', 'WiFi', 'Power Backup']).slice(0, 6);
      const seller = pickRandom(sellerUsers);
      const agent = pickRandom(agentUsers);
      const coordinates = {
        lat: cityMeta.coordinates.lat + (Math.random() - 0.5) * 0.08,
        lng: cityMeta.coordinates.lng + (Math.random() - 0.5) * 0.08,
      };

      const title = `${template.title} in ${label}`;
      const images = shuffle(propertyImages).slice(0, 4);
      const propertyData = {
        title,
        description: template.description,
        price,
        propertyType: template.type,
        bedrooms,
        bathrooms,
        area,
        city: cityMeta.city,
        state: cityMeta.state,
        address: generatePropertyAddress(cityMeta, label, i),
        amenities,
        images,
        coordinates,
        seller: seller._id,
        agent: agent._id,
        status: 'available',
        viewsCount: 80 + Math.round(Math.random() * 320),
        listingType,
        furnishing: template.furnishing,
        tenants: listingType === 'rent' ? pickRandom(['Families', 'Bachelors', 'Family / Bachelors']) : '',
      };

      propertyEntries.push(propertyData);
    }

    const createdProperties = await Property.insertMany(propertyEntries);

    const buyerPropertyFavorites = [];
    for (const buyer of buyerUsers) {
      const favorites = shuffle(createdProperties).slice(0, 6).map((p) => p._id);
      buyer.savedProperties = favorites;
      buyerPropertyFavorites.push(...favorites);
    }
    await Promise.all(buyerUsers.map((user) => User.findByIdAndUpdate(user._id, { savedProperties: user.savedProperties })));

    console.log('Creating reviews...');
    const reviewInputs = [];
    const reviewKeySet = new Set();
    const reviewAttempts = { count: 0 };

    while (reviewInputs.length < 100 && reviewAttempts.count < 800) {
      reviewAttempts.count += 1;
      const author = pickRandom(buyerUsers);
      const targetChance = Math.random();
      const targetType = targetChance < 0.6 ? 'property' : targetChance < 0.85 ? 'agent' : 'seller';
      let property = null;
      let targetUser = null;

      if (targetType === 'property') {
        property = pickRandom(createdProperties)._id;
      } else if (targetType === 'agent') {
        targetUser = pickRandom(agentUsers)._id;
      } else {
        targetUser = pickRandom(sellerUsers)._id;
      }

      const key = `${author._id.toString()}|${property ? property.toString() : 'null'}|${targetUser ? targetUser.toString() : 'null'}`;
      if (reviewKeySet.has(key)) continue;
      reviewKeySet.add(key);

      reviewInputs.push({
        targetType,
        property,
        targetUser,
        author: author._id,
        rating: 3 + Math.floor(Math.random() * 3),
        comment: pickRandom(reviewComments),
        interestTag: pickRandom(['interested_buying', 'interested_renting', 'scheduled_visit', 'local_resident', 'just_browsing', 'inquired_loan', '']),
      });
    }

    if (reviewInputs.length < 100) {
      throw new Error(`Could only generate ${reviewInputs.length} unique reviews after ${reviewAttempts.count} attempts.`);
    }

    const createdReviews = await Review.insertMany(reviewInputs, { ordered: true });

    console.log('Creating bookings...');
    const bookingSet = new Set();
    const bookingEntries = [];
    let attempts = 0;
    while (bookingEntries.length < 30 && attempts < 200) {
      attempts += 1;
      const property = pickRandom(createdProperties);
      const buyer = pickRandom(buyerUsers);
      const visitDate = new Date(Date.now() + (3 + Math.floor(Math.random() * 40)) * 24 * 60 * 60 * 1000);
      const visitDateKey = `${property._id}-${buyer._id}-${visitDate.toISOString().slice(0, 10)}`;
      if (bookingSet.has(visitDateKey)) continue;
      bookingSet.add(visitDateKey);
      const sellerOrAgent = Math.random() > 0.4 ? property.agent : property.seller;
      const visitTimes = ['10:00 AM', '12:30 PM', '03:00 PM', '05:30 PM'];
      bookingEntries.push({
        property: property._id,
        buyer: buyer._id,
        sellerOrAgent,
        visitDate,
        visitTime: pickRandom(visitTimes),
        status: pickRandom(['pending', 'approved', 'rejected']),
        notes: pickRandom(['Please share parking details.', 'I want to check natural light and kitchen layout.', 'Would like a quick walkthrough before weekend.', 'Looking for a furnished option.']),
      });
    }
    const createdBookings = await Booking.insertMany(bookingEntries, { ordered: false });

    console.log('Creating messages...');
    const messages = [];
    const chatPairs = [];
    for (let i = 0; i < 40; i += 1) {
      const buyer = pickRandom(buyerUsers);
      const agent = pickRandom(agentUsers);
      chatPairs.push({ sender: buyer, receiver: agent });
    }
    for (let i = 0; i < 50; i += 1) {
      const pair = pickRandom(chatPairs);
      const chatId = [pair.sender._id.toString(), pair.receiver._id.toString()].sort().join('-');
      const senders = [pair.sender, pair.receiver];
      const sender = pickRandom(senders);
      const receiver = sender._id.equals(pair.sender._id) ? pair.receiver : pair.sender;
      messages.push({
        chatId,
        sender: sender._id,
        receiver: receiver._id,
        content: pickRandom(['Hello, I would like to schedule a viewing.', 'Is this property still available?', 'Can you share the monthly maintenance cost?', 'What is the expected possession date?', 'Do you offer a negotiation on price?', 'Thank you, I am very interested.']),
        isRead: Math.random() > 0.3,
      });
    }
    const createdMessages = await Message.insertMany(messages, { ordered: false });

    console.log('Creating notifications...');
    const notificationEntries = [];
    const notificationTargets = [...buyerUsers, ...sellerUsers, ...agentUsers];

    for (let i = 0; i < 50; i += 1) {
      const recipient = pickRandom(notificationTargets);
      const template = pickRandom(notificationTemplates);
      notificationEntries.push({
        recipient: recipient._id,
        sender: recipient.role === 'buyer' ? pickRandom(agentUsers)._id : pickRandom(buyerUsers)._id,
        type: template.type,
        title: template.title,
        message: template.message,
        relatedProperty: pickRandom(createdProperties)._id,
        isRead: Math.random() > 0.5,
      });
    }
    const createdNotifications = await Notification.insertMany(notificationEntries, { ordered: false });

    const [userCount, propertyCount, reviewCount, bookingCount, messageCount, notificationCount] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Review.countDocuments(),
      Booking.countDocuments(),
      Message.countDocuments(),
      Notification.countDocuments(),
    ]);

    const favoritesCount = (await User.aggregate([
      { $match: { savedProperties: { $exists: true, $ne: [] } } },
      { $project: { count: { $size: '$savedProperties' } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]))[0]?.total || 0;

    console.log('--- SEED REPORT ---');
    console.log(`Users: ${userCount}`);
    console.log(`Agents: ${agentUsers.length}`);
    console.log(`Properties: ${propertyCount}`);
    console.log(`Reviews: ${reviewCount}`);
    console.log(`Bookings: ${bookingCount}`);
    console.log(`Favorites (savedProperties entries): ${favoritesCount}`);
    console.log(`Messages: ${messageCount}`);
    console.log(`Notifications: ${notificationCount}`);
    console.log('Database seeding completed successfully.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
