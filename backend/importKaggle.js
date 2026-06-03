const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Property = require('./models/Property');
const User = require('./models/User');
const Review = require('./models/Review');
const aiService = require('./services/aiService');

dotenv.config();

const rentalsCsvPath = '/Users/porandlarajkumar/.cache/kagglehub/datasets/thedevastator/breaking-the-myths-of-real-estate-market/versions/2/Hyderabad_House_Data.csv';
const salesCsvPath = '/Users/porandlarajkumar/.cache/kagglehub/datasets/faisal012/hyderabad-house-price/versions/1/Hyderbad_House_price.csv';

// Robust CSV Row Parser
const parseCSVRow = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

const importKaggleData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estateai';
    console.log(`Connecting to database: ${connStr}`);
    await mongoose.connect(connStr);

    // Find default seller and agent
    const sellerUser = await User.findOne({ email: 'priya@seller.com' });
    const agentUser = await User.findOne({ email: 'vikram@agent.com' });

    if (!sellerUser) {
      console.error('Error: default seller user priya@seller.com not found. Please run npm run seed first.');
      process.exit(1);
    }
    const sellerId = sellerUser._id;
    const agentId = agentUser ? agentUser._id : null;

    // Load buyer users
    const buyers = await User.find({ role: 'buyer' });
    if (!buyers || buyers.length === 0) {
      console.error('Error: no buyer users found. Please run npm run seed first.');
      process.exit(1);
    }

    const sampleImages = [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80'
    ];

    const propertiesToInsert = [];

    // =======================================
    // 1. IMPORT RENTAL LISTINGS (Kaggle #1)
    // =======================================
    console.log('Reading Rentals CSV dataset...');
    if (fs.existsSync(rentalsCsvPath)) {
      const fileStream = fs.createReadStream(rentalsCsvPath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      let rentalsCount = 0;
      const rentalsLimit = 40; // Limit rental listings to 40
      let isHeader = true;

      for await (const line of rl) {
        if (!line.trim()) continue;
        if (isHeader) {
          isHeader = false;
          continue;
        }

        if (rentalsCount >= rentalsLimit) break;

        const row = parseCSVRow(line);
        if (row.length < 8) continue;

        // Header: ,Bedrooms,Bathrooms,Furnishing,Tennants,Area,Price,Locality
        const rawTitle = row[1] || 'Premium Rental';
        const rawBathrooms = row[2];
        const furnishing = row[3] || 'Semi-Furnished';
        const tenants = row[4] || 'Bachelors/Family';
        let rawArea = row[5] || '1200 sqft';
        let rawPrice = row[6] || '0';
        let locality = row[7] || 'Gachibowli';

        locality = locality.replace(/^"|"$/g, '').trim();
        const cleanTitle = rawTitle.replace(/^"|"$/g, '').trim();
        const title = `${cleanTitle} in ${locality}`;

        const bhkMatch = cleanTitle.match(/(\d+)\s*(?:bhk|BHK|bedroom|Bedroom)/);
        const bedrooms = bhkMatch ? parseInt(bhkMatch[1], 10) : (cleanTitle.toLowerCase().includes('studio') ? 1 : 2);

        let bathrooms = parseInt(rawBathrooms, 10);
        if (isNaN(bathrooms)) bathrooms = bedrooms;

        rawArea = rawArea.replace(/sqft|sq-ft|sq ft/i, '').trim();
        let area = parseInt(rawArea, 10);
        if (isNaN(area)) {
          area = bedrooms === 1 ? 600 : bedrooms === 2 ? 1000 : bedrooms === 3 ? 1500 : 2000;
        }

        rawPrice = rawPrice.replace(/[^0-9]/g, '');
        let price = parseInt(rawPrice, 10);
        if (isNaN(price) || price === 0) price = 25000;

        let propertyType = 'apartment';
        const titleLower = cleanTitle.toLowerCase();
        if (titleLower.includes('house') || titleLower.includes('home')) {
          propertyType = 'house';
        } else if (titleLower.includes('villa')) {
          propertyType = 'villa';
        } else if (titleLower.includes('plot') || titleLower.includes('land')) {
          propertyType = 'plot';
        } else if (titleLower.includes('commercial') || titleLower.includes('shop') || titleLower.includes('office')) {
          propertyType = 'commercial';
        }

        const amenities = ['Water Supply', 'Power Backup', 'Security Guard'];
        if (furnishing === 'Furnished') {
          amenities.push('Fully Furnished', 'Air Conditioning', 'Geyser', 'Modular Kitchen');
        } else if (furnishing === 'Semi-Furnished') {
          amenities.push('Semi-Furnished', 'Wardrobes', 'Modular Kitchen');
        } else {
          amenities.push('Unfurnished');
        }

        if (tenants.includes('Bachelors')) amenities.push('Bachelors Allowed');
        if (tenants.includes('Family')) amenities.push('Family Preferred');

        const imageIndex = rentalsCount % sampleImages.length;
        const images = [sampleImages[imageIndex]];

        const coordinates = {
          lat: 17.4401 + (Math.random() - 0.5) * 0.05,
          lng: 78.3489 + (Math.random() - 0.5) * 0.05
        };

        propertiesToInsert.push({
          title,
          propertyType,
          bedrooms,
          bathrooms,
          area,
          price,
          city: 'hyderabad',
          state: 'telangana',
          address: `${locality}, Hyderabad, Telangana - 500032`,
          amenities,
          images,
          coordinates,
          seller: sellerId,
          agent: agentId,
          status: 'available',
          listingType: 'rent',
          furnishing,
          tenants,
          description: ''
        });

        rentalsCount++;
      }
      console.log(`Parsed ${rentalsCount} rental properties successfully.`);
    } else {
      console.warn(`Rentals CSV file not found at ${rentalsCsvPath}`);
    }

    // =======================================
    // 2. IMPORT SALE LISTINGS (Kaggle #2)
    // =======================================
    console.log('Reading Sales CSV dataset...');
    if (fs.existsSync(salesCsvPath)) {
      const fileStream = fs.createReadStream(salesCsvPath);
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      });

      let salesCount = 0;
      const salesLimit = 40; // Limit sale listings to 40
      let isHeader = true;

      for await (const line of rl) {
        if (!line.trim()) continue;
        if (isHeader) {
          isHeader = false;
          continue;
        }

        if (salesCount >= salesLimit) break;

        const row = parseCSVRow(line);
        if (row.length < 7) continue;

        // Header: ,title,location,price(L),rate_persqft,area_insqft,building_status
        const cleanTitle = (row[1] || 'Premium Property').replace(/^"|"$/g, '').trim();
        let locality = (row[2] || 'Gachibowli').replace(/^"|"$/g, '').trim();
        const rawPriceLakhs = row[3];
        const rawArea = row[5] || '1500';
        const buildingStatus = (row[6] || 'Ready to move').replace(/^"|"$/g, '').trim();

        const title = `${cleanTitle} in ${locality}`;

        // Convert Price in Lakhs to Rupees
        const priceLakhs = parseFloat(rawPriceLakhs);
        let price = isNaN(priceLakhs) ? 8000000 : Math.round(priceLakhs * 100000);

        let area = parseInt(rawArea, 10);
        if (isNaN(area)) area = 1500;

        const bhkMatch = cleanTitle.match(/(\d+)\s*(?:bhk|BHK|bedroom|Bedroom)/);
        const bedrooms = bhkMatch ? parseInt(bhkMatch[1], 10) : (cleanTitle.toLowerCase().includes('studio') ? 1 : (cleanTitle.toLowerCase().includes('plot') ? 0 : 3));
        const bathrooms = bedrooms > 0 ? (bedrooms > 3 ? 3 : bedrooms) : 0;

        let propertyType = 'apartment';
        const titleLower = cleanTitle.toLowerCase();
        if (titleLower.includes('house') || titleLower.includes('home')) {
          propertyType = 'house';
        } else if (titleLower.includes('villa')) {
          propertyType = 'villa';
        } else if (titleLower.includes('plot') || titleLower.includes('land')) {
          propertyType = 'plot';
        } else if (titleLower.includes('commercial') || titleLower.includes('shop') || titleLower.includes('office')) {
          propertyType = 'commercial';
        }

        // Amenities
        const amenities = ['Water Supply', 'Power Backup', 'Security Alarms'];
        if (propertyType === 'apartment' || propertyType === 'villa') {
          amenities.push('Gym', 'Elevator', 'Visitor Parking', 'Club House');
        } else if (propertyType === 'plot') {
          amenities.push('Clear Title', 'Road Facing', 'Immediate Registration');
        }

        if (buildingStatus === 'Ready to move') {
          amenities.push('Ready to Move In');
        } else if (buildingStatus === 'Under Construction') {
          amenities.push('New Launch', 'Under Construction');
        }

        const imageIndex = (salesCount + 3) % sampleImages.length;
        const images = [sampleImages[imageIndex]];

        const coordinates = {
          lat: 17.4401 + (Math.random() - 0.5) * 0.05,
          lng: 78.3489 + (Math.random() - 0.5) * 0.05
        };

        propertiesToInsert.push({
          title,
          propertyType,
          bedrooms,
          bathrooms,
          area,
          price,
          city: 'hyderabad',
          state: 'telangana',
          address: `${locality}, Hyderabad, Telangana - 500090`,
          amenities,
          images,
          coordinates,
          seller: sellerId,
          agent: agentId,
          status: 'available',
          listingType: 'sale',
          furnishing: '',
          tenants: '',
          description: ''
        });

        salesCount++;
      }
      console.log(`Parsed ${salesCount} sale properties successfully.`);
    } else {
      console.warn(`Sales CSV file not found at ${salesCsvPath}`);
    }

    // =======================================
    // 3. GENERATE AI COPIES & SAVE TO DB
    // =======================================
    console.log(`Total parsed properties to seed: ${propertiesToInsert.length}. Processing DB updates...`);

    // Clean existing properties imported from Kaggle to prevent duplicates
    const oldProps = await Property.find({ city: 'hyderabad' });
    const oldPropIds = oldProps.map(p => p._id);
    await Review.deleteMany({ property: { $in: oldPropIds } });
    await Property.deleteMany({ city: 'hyderabad' });

    const getMockComments = (listingType, propertyType, address) => {
      const cleanAddress = address.split(',')[0];
      if (listingType === 'rent') {
        return [
          `The locality is very peaceful and well-connected. Checked it out last week, highly interested in renting this ${propertyType} in ${cleanAddress}!`,
          `Perfect size and pricing. I have already scheduled a visit to inspect the facilities and neighbourhood around ${cleanAddress}.`
        ];
      } else {
        return [
          `Excellent investment potential. Located in a high growth zone of Hyderabad near ${cleanAddress}. Verified the details, highly interested!`,
          `Stunning layout and great amenities. Checking out home loan details right now. Hope to secure a deal soon!`
        ];
      }
    };

    for (let i = 0; i < propertiesToInsert.length; i++) {
      const prop = propertiesToInsert[i];
      console.log(`[${i + 1}/${propertiesToInsert.length}] Description generator for: "${prop.title}" (${prop.listingType})`);
      
      try {
        const result = await aiService.generatePropertyDescription({
          propertyType: prop.propertyType,
          location: prop.address,
          amenities: prop.amenities,
          size: prop.area,
          listingType: prop.listingType
        });
        prop.description = result.marketingDescription || result.seoDescription || `${prop.bedrooms} BHK ${prop.propertyType} for ${prop.listingType} in ${prop.address}.`;
      } catch (err) {
        prop.description = `Spacious ${prop.bedrooms} BHK ${prop.propertyType} available for ${prop.listingType} in the prime area of ${prop.address}. Offers a generous layout of ${prop.area} sq ft, high quality modern structures, and great infrastructure. Amenities include: ${prop.amenities.join(', ')}.`;
      }

      const created = await Property.create(prop);

      // Seed 2 reviews/interests for this property using rotated buyers
      const buyer1 = buyers[i % buyers.length]._id;
      const buyer2 = buyers[(i + 1) % buyers.length]._id;
      const comments = getMockComments(prop.listingType, prop.propertyType, prop.address);

      await Review.create({
        targetType: 'property',
        property: created._id,
        author: buyer1,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: comments[0],
        interestTag: prop.listingType === 'rent' ? 'interested_renting' : 'interested_buying'
      });

      await Review.create({
        targetType: 'property',
        property: created._id,
        author: buyer2,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: comments[1],
        interestTag: Math.random() > 0.5 ? 'scheduled_visit' : 'inquired_loan'
      });
    }

    console.log(`Successfully seeded ${propertiesToInsert.length} properties (both rental and sale options) into the database!`);
    process.exit(0);
  } catch (error) {
    console.error('Import Kaggle Data failed:', error);
    process.exit(1);
  }
};

importKaggleData();
