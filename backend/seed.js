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

// Seed data definition
const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estateai';
    console.log(`Connecting to database for seeding: ${connStr}`);
    await mongoose.connect(connStr);

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Property.deleteMany();
    await Review.deleteMany();
    await Booking.deleteMany();
    await Message.deleteMany();
    await Notification.deleteMany();

    console.log('Seeding Users...');
    // Base salt and passwords
    const hashedPassword = 'password123';

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@estateai.com',
      password: hashedPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
    });

    const buyer1 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@buyer.com',
      password: hashedPassword,
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    });

    const buyer2 = await User.create({
      name: 'Swati Iyer',
      email: 'swati@buyer.com',
      password: hashedPassword,
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    });

    const buyer3 = await User.create({
      name: 'Ankit Gupta',
      email: 'ankit@buyer.com',
      password: hashedPassword,
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    });

    const buyer4 = await User.create({
      name: 'Megha Sen',
      email: 'megha@buyer.com',
      password: hashedPassword,
      role: 'buyer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    });

    const buyers = [buyer1, buyer2, buyer3, buyer4];

    const seller1 = await User.create({
      name: 'Priya Patel',
      email: 'priya@seller.com',
      password: hashedPassword,
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    });

    const seller2 = await User.create({
      name: 'Amit Verma',
      email: 'amit@seller.com',
      password: hashedPassword,
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    });

    const seller3 = await User.create({
      name: 'Sunita Rao',
      email: 'sunita@seller.com',
      password: hashedPassword,
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    });

    const seller4 = await User.create({
      name: 'Karan Malhotra',
      email: 'karan@seller.com',
      password: hashedPassword,
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    });

    const seller5 = await User.create({
      name: 'Pooja Hegde',
      email: 'pooja@seller.com',
      password: hashedPassword,
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    });

    const seller6 = await User.create({
      name: 'Rajesh Pillai',
      email: 'rajesh@seller.com',
      password: hashedPassword,
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
    });

    const seller7 = await User.create({
      name: 'Sneha Nair',
      email: 'sneha@seller.com',
      password: hashedPassword,
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
    });

    const agent = await User.create({
      name: 'Vikram Mehta',
      email: 'vikram@agent.com',
      password: hashedPassword,
      role: 'agent',
      isVerifiedAgent: true,
      agentLicense: 'RERA-DL-8849-2024',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    });

    console.log('Seeding Properties...');
    const properties = [
      {
        title: 'Modern 2 BHK Apartment in Dwarka',
        description: 'A cozy, newly-renovated 2 BHK apartment located in the prime sector of Dwarka, Delhi. Close to the Dwarka Sector 12 metro station. Comes with a modular kitchen, wooden flooring in bedrooms, and 24/7 security gate coverage. Excellent value for mid-size families.',
        price: 25000, // 25k/month rent
        propertyType: 'apartment',
        bedrooms: 2,
        bathrooms: 2,
        area: 1100,
        city: 'delhi',
        state: 'delhi',
        address: 'Sector 12, Dwarka, Delhi - 110075',
        amenities: ['24/7 Security', 'Metro Connectivity', 'Power Backup', 'Gym', 'Parking'],
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
        ],
        coordinates: { lat: 28.5921, lng: 77.0460 },
        seller: seller1._id,
        agent: agent._id,
        status: 'available',
        viewsCount: 154,
        listingType: 'rent',
        furnishing: 'Semi-Furnished',
        tenants: 'Families / Bachelors'
      },
      {
        title: 'Spacious 3 BHK Near St. Stephens School',
        description: 'Perfect family home! This 3 BHK builder floor is situated in Dwarka Sector 6, within walking distance (less than 200m) of St. Stephens School and Delhi Public School. Features balconies on both sides, modular wardrobes, and a reserved parking space. Extremely kid-friendly neighbourhood.',
        price: 45000, // 45k/month rent
        propertyType: 'apartment',
        bedrooms: 3,
        bathrooms: 3,
        area: 1650,
        city: 'delhi',
        state: 'delhi',
        address: 'Sector 6, Dwarka, Delhi - 110075',
        amenities: ['School Proximity', 'Parking', 'Park Facing', 'Water Storage', 'Balcony'],
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
        ],
        coordinates: { lat: 28.5898, lng: 77.0580 },
        seller: seller2._id,
        agent: agent._id,
        status: 'available',
        viewsCount: 92,
        listingType: 'rent',
        furnishing: 'Fully-Furnished',
        tenants: 'Only Families'
      },
      {
        title: 'Investment Plot in Greater Noida Expressway',
        description: 'Prime investment opportunity! High-growth potential plot measuring 250 square yards located right off the Greater Noida Expressway. Perfect for building a multi-story residential building or long-term capital gains holding. Wide 12m road frontage and close to the upcoming Jewar International Airport corridor.',
        price: 12000000, // 1.2 Crore
        propertyType: 'plot',
        bedrooms: 0,
        bathrooms: 0,
        area: 2250,
        city: 'delhi',
        state: 'uttar pradesh',
        address: 'Sector 150, Greater Noida Expressway, Greater Noida - 201310',
        amenities: ['Road Facing', 'Corner Plot', 'Gated Community', 'High ROI Area', 'Clear Title'],
        images: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
        ],
        coordinates: { lat: 28.4595, lng: 77.4988 },
        seller: seller3._id,
        agent: null,
        status: 'available',
        viewsCount: 215
      },
      {
        title: 'Luxury Villa with Sea View in Bandra',
        description: 'Experience ultra-luxury living in Bandra West, Mumbai. This architecturally stunning 4 BHK independent villa offers custom modern design, private pool, landscaped gardens, and a breathtaking rooftop deck overlooking the sea. Built with high-end imported Italian marble and smart home automated automation system.',
        price: 85000000, // 8.5 Crore
        propertyType: 'villa',
        bedrooms: 4,
        bathrooms: 5,
        area: 4500,
        city: 'mumbai',
        state: 'maharashtra',
        address: 'Carter Road, Bandra West, Mumbai - 400050',
        amenities: ['Sea View', 'Private Pool', 'Home Automation', 'Private Garden', 'Terrace Bar', 'Elevator'],
        images: [
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'
        ],
        coordinates: { lat: 19.0664, lng: 72.8252 },
        seller: seller4._id,
        agent: agent._id,
        status: 'available',
        viewsCount: 310
      },
      {
        title: '3 BHK High-Rise in Bandra Kurla Complex',
        description: 'Sophisticated living in BKC, Mumbai. This 3 BHK luxury apartment is on the 24th floor, offering panoramic views of the city skyline. Building amenities include a temperature-controlled swimming pool, a state-of-the-art health club, and 3 reserved basement car parking slots. Centrally located with 5-minute commute to key MNC hubs.',
        price: 35000000, // 3.5 Crore
        propertyType: 'apartment',
        bedrooms: 3,
        bathrooms: 3,
        area: 1900,
        city: 'mumbai',
        state: 'maharashtra',
        address: 'BKC, Bandra East, Mumbai - 400051',
        amenities: ['Club House', 'Swimming Pool', 'High Speed Elevators', 'CCTV Security', 'Concierge Service'],
        images: [
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
        ],
        coordinates: { lat: 19.0607, lng: 72.8622 },
        seller: seller5._id,
        agent: null,
        status: 'available',
        viewsCount: 180
      },
      {
        title: 'Gated 4 BHK Villa in HSR Layout',
        description: 'Stunning independent 4 BHK villa located in Sector 3, HSR Layout, Bangalore. Perfect integration of smart architectural concepts and eco-friendly features (solar heating and rainwater harvesting). Open layout with large double-height living room ceilings, private home-theatre lounge, and lush modular kitchen.',
        price: 25000000, // 2.5 Crore
        propertyType: 'villa',
        bedrooms: 4,
        bathrooms: 4,
        area: 3600,
        city: 'bangalore',
        state: 'karnataka',
        address: 'Sector 3, HSR Layout, Bangalore - 560102',
        amenities: ['Solar Power', 'Home Theatre', 'Rainwater Harvesting', 'Private Garden', 'Security Alarms'],
        images: [
          'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
        ],
        coordinates: { lat: 12.9103, lng: 77.6450 },
        seller: seller6._id,
        agent: agent._id,
        status: 'available',
        viewsCount: 242
      },
      {
        title: 'Studio Apartment near Tech Park Whitefield',
        description: 'Compact 1 BHK / Studio apartment in IT Corridor Whitefield, Bangalore. Located just 500m from Prestige Shantiniketan Tech Park. Fully furnished, offering immediate occupancy for single corporate professionals. Includes modular closet, microwave, refrigerator, washing machine, and high-speed Wi-Fi hookup.',
        price: 18000, // 18k/month rent
        propertyType: 'apartment',
        bedrooms: 1,
        bathrooms: 1,
        area: 550,
        city: 'bangalore',
        state: 'karnataka',
        address: 'ITPL Road, Whitefield, Bangalore - 560066',
        amenities: ['Furnished', 'Tech Park Proximity', 'Gym', 'High Speed Wi-Fi', 'Laundromat'],
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
        ],
        coordinates: { lat: 12.9844, lng: 77.7289 },
        seller: seller7._id,
        agent: null,
        status: 'available',
        viewsCount: 148,
        listingType: 'rent',
        furnishing: 'Fully-Furnished',
        tenants: 'Bachelors / Professionals'
      }
    ];

    const createdProperties = await Property.create(properties);
    console.log(`Successfully seeded ${createdProperties.length} Properties.`);

    console.log('Seeding Sample Reviews...');
    const mockComments = [
      {
        rent: [
          'Lovely place to stay. Very clean, quiet locality, and highly convenient for commuting.',
          'Amazing apartment. I toured this property and scheduled a visit. The manager was very polite.'
        ],
        sale: [
          'Excellent construction quality and high premium value. Recommended investment!',
          'Spacious and clean layout. Looking into a home loan right now to purchase this place.'
        ]
      },
      {
        rent: [
          'The neighborhood has excellent park access. Ideal for morning walks and peaceful living.',
          'Perfect size for a small family. Already submitted my rental verification documents.'
        ],
        sale: [
          'A rare premium build quality in this sector. Visited the site and was very impressed.',
          'Great connectivity and amenities. RERA filing details are fully clear and matching.'
        ]
      }
    ];

    for (let idx = 0; idx < createdProperties.length; idx++) {
      const prop = createdProperties[idx];
      const isRent = prop.listingType === 'rent';
      const commentPool = mockComments[idx % mockComments.length];
      
      const text1 = isRent ? commentPool.rent[0] : commentPool.sale[0];
      const text2 = isRent ? commentPool.rent[1] : commentPool.sale[1];
      
      await Review.create({
        targetType: 'property',
        property: prop._id,
        author: buyers[0]._id,
        rating: 5,
        comment: text1,
        interestTag: isRent ? 'interested_renting' : 'interested_buying'
      });

      await Review.create({
        targetType: 'property',
        property: prop._id,
        author: buyers[1]._id,
        rating: 4,
        comment: text2,
        interestTag: Math.random() > 0.5 ? 'scheduled_visit' : 'inquired_loan'
      });
    }

    console.log('Seeding Sample Booking Visit...');
    await Booking.create({
      property: createdProperties[0]._id,
      buyer: buyers[0]._id,
      sellerOrAgent: agent._id,
      visitDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      visitTime: '11:00 AM',
      status: 'pending',
      notes: 'I would like to inspect the balconies and modular kitchen.'
    });

    console.log('Database Seeding Completed Successfully! 🚀');
    process.exit(0);
  } catch (error) {
    console.error('Seeding database failed:', error.message);
    process.exit(1);
  }
};

seedData();
