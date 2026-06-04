const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LocationIntelligence = require('./models/LocationIntelligence');

dotenv.config();

const hyderabadLocalities = {
  gachibowli: {
    name: 'Gachibowli',
    locationScore: { overall: 88, connectivity: 92, safety: 81, education: 90, healthcare: 85, lifestyle: 88, publicTransport: 84, employmentOpportunities: 95 },
    nearbyPlaces: [
      { category: 'school', name: 'Oakridge International School', distance: '3.4 km', travelTime: '10 mins' },
      { category: 'college', name: 'Indian School of Business (ISB)', distance: '2.1 km', travelTime: '5 mins' },
      { category: 'hospital', name: 'Continental Hospital', distance: '4.2 km', travelTime: '12 mins' },
      { category: 'pharmacy', name: 'Apollo Pharmacy Gachibowli', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'metro', name: 'Hitech City Metro Station', distance: '3.8 km', travelTime: '9 mins' },
      { category: 'bus', name: 'Gachibowli DLF Bus Stop', distance: '0.2 km', travelTime: '1 min' },
      { category: 'railway', name: 'Lingampally Railway Station', distance: '6.5 km', travelTime: '15 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '31.5 km', travelTime: '35 mins' },
      { category: 'mall', name: 'Sarath City Capital Mall', distance: '2.8 km', travelTime: '8 mins' },
      { category: 'supermarket', name: 'Ratnadeep Supermarket', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'restaurant', name: 'Paradise Biryani Gachibowli', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'park', name: 'Gachibowli Botanical Garden', distance: '1.2 km', travelTime: '4 mins' },
      { category: 'gym', name: 'Cult.fit Gachibowli', distance: '0.3 km', travelTime: '1 min' },
      { category: 'itpark', name: 'DLF Cyber City', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'bank', name: 'HDFC Bank Gachibowli Branch', distance: '0.3 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '8 mins', walking: '22 mins', transit: '12 mins' },
      college: { driving: '5 mins', walking: '18 mins', transit: '8 mins' },
      airport: { driving: '35 mins', walking: '360 mins', transit: '50 mins' },
      railway: { driving: '15 mins', walking: '80 mins', transit: '25 mins' },
      cityCenter: { driving: '25 mins', walking: '200 mins', transit: '45 mins' }
    },
    neighborhoodInsights: 'Gachibowli is Hyderabad\'s primary financial and technology center, boasting massive commercial spaces, premier institutions like ISB and IIIT-H, and robust infrastructure along the ORR. It exhibits extremely strong rental yields due to massive corporate employment pools.',
    investment: {
      rentalYield: 4.8,
      appreciationPotential: 'High',
      demandScore: 92,
      investmentScore: 9.1,
      reasons: ['Strong IT/Financial district employment zone', 'High demand for high-end gated communities', 'Direct access to ORR and Gachibowli-Miyapur high growth corridor']
    },
    safetyIndex: { safetyScore: 88, familyFriendlyScore: 90, nightSafetyScore: 85 },
    aiRecommendations: 'If Gachibowli prices feel premium, consider Manikonda or Narsingi for similar proximity to tech zones at a lower cost.'
  },
  'hitech city': {
    name: 'Hitech City',
    locationScore: { overall: 92, connectivity: 95, safety: 85, education: 88, healthcare: 86, lifestyle: 94, publicTransport: 92, employmentOpportunities: 98 },
    nearbyPlaces: [
      { category: 'school', name: 'TIPS Hyderabad', distance: '2.5 km', travelTime: '8 mins' },
      { category: 'college', name: 'NIFT Hyderabad', distance: '1.2 km', travelTime: '4 mins' },
      { category: 'hospital', name: 'Medicover Hospitals Hitech City', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'pharmacy', name: 'MedPlus Hitech City', distance: '0.2 km', travelTime: '1 min' },
      { category: 'metro', name: 'Hitech City Metro Station', distance: '0.1 km', travelTime: '1 min' },
      { category: 'bus', name: 'Cyber Towers Bus Stop', distance: '0.2 km', travelTime: '1 min' },
      { category: 'railway', name: 'Hafizpet Railway Station', distance: '4.2 km', travelTime: '12 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '33.2 km', travelTime: '40 mins' },
      { category: 'mall', name: 'Inorbit Mall Cyberabad', distance: '1.5 km', travelTime: '5 mins' },
      { category: 'supermarket', name: 'Ratnadeep Cyber Towers', distance: '0.3 km', travelTime: '1 min' },
      { category: 'restaurant', name: 'Absolute Barbecues Hitech City', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'park', name: 'Shilparamam Crafts Village', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'gym', name: 'Gold\'s Gym Hitech City', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'itpark', name: 'L&T Infocity / Mindspace', distance: '0.3 km', travelTime: '1 min' },
      { category: 'bank', name: 'ICICI Bank Cyber Towers', distance: '0.2 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '3 mins', walking: '10 mins', transit: '4 mins' },
      college: { driving: '4 mins', walking: '12 mins', transit: '5 mins' },
      airport: { driving: '40 mins', walking: '400 mins', transit: '55 mins' },
      railway: { driving: '12 mins', walking: '50 mins', transit: '18 mins' },
      cityCenter: { driving: '22 mins', walking: '180 mins', transit: '35 mins' }
    },
    neighborhoodInsights: 'Hitech City is the epicentre of IT developments in Hyderabad. Anchored by Cyber Towers and the massive Mindspace IT Park, it features top metro links, high-street shopping hubs, and premium lifestyle infrastructure.',
    investment: {
      rentalYield: 5.2,
      appreciationPotential: 'Very High',
      demandScore: 96,
      investmentScore: 9.4,
      reasons: ['Prime IT Core with top global tech giants', 'Excellent metro connectivity and transit links', 'Elite lifestyle amenities and high commercial densities']
    },
    safetyIndex: { safetyScore: 90, familyFriendlyScore: 88, nightSafetyScore: 89 },
    aiRecommendations: 'Consider Kondapur or Madhapur for mid-budget apartments with identical workspace connectivity.'
  },
  kondapur: {
    name: 'Kondapur',
    locationScore: { overall: 86, connectivity: 88, safety: 84, education: 85, healthcare: 82, lifestyle: 86, publicTransport: 80, employmentOpportunities: 89 },
    nearbyPlaces: [
      { category: 'school', name: 'Chirec International School', distance: '1.8 km', travelTime: '6 mins' },
      { category: 'college', name: 'Sanskriti School of Business', distance: '2.5 km', travelTime: '8 mins' },
      { category: 'hospital', name: 'KIMS Hospital Kondapur', distance: '1.1 km', travelTime: '4 mins' },
      { category: 'pharmacy', name: 'Apollo Pharmacy Kondapur', distance: '0.3 km', travelTime: '1 min' },
      { category: 'metro', name: 'Hitech City Metro Station', distance: '2.5 km', travelTime: '8 mins' },
      { category: 'bus', name: 'Kondapur RTO Bus Stop', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'railway', name: 'Hafeezpet Railway Station', distance: '3.1 km', travelTime: '10 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '34.0 km', travelTime: '42 mins' },
      { category: 'mall', name: 'Sarath City Capital Mall', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'supermarket', name: 'Spencers Supermarket', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'restaurant', name: 'Pista House Kondapur', distance: '0.4 km', travelTime: '1 min' },
      { category: 'park', name: 'Kondapur Botanical Garden', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'gym', name: 'Cult.fit Kondapur Cross Roads', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'itpark', name: 'Google Hyderabad Office', distance: '1.5 km', travelTime: '5 mins' },
      { category: 'bank', name: 'State Bank of India Kondapur', distance: '0.2 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '8 mins', walking: '25 mins', transit: '12 mins' },
      college: { driving: '6 mins', walking: '20 mins', transit: '10 mins' },
      airport: { driving: '42 mins', walking: '420 mins', transit: '60 mins' },
      railway: { driving: '10 mins', walking: '40 mins', transit: '15 mins' },
      cityCenter: { driving: '28 mins', walking: '220 mins', transit: '50 mins' }
    },
    neighborhoodInsights: 'Kondapur is a massive residential residential corridor, exceptionally popular among tech professionals working in nearby Hitech City and Gachibowli. It is home to India\'s largest retail malls and offers botanical reserves.',
    investment: {
      rentalYield: 4.5,
      appreciationPotential: 'High',
      demandScore: 90,
      investmentScore: 8.8,
      reasons: ['Highly preferred residential hub for tech workers', 'Abundance of lifestyle options, supermarkets, and schools', 'Proximity to Botanical Gardens and green pockets']
    },
    safetyIndex: { safetyScore: 86, familyFriendlyScore: 89, nightSafetyScore: 82 },
    aiRecommendations: 'If Kondapur is too crowded, look at Miyapur for budget apartments or Kokapet for premium options.'
  },
  madhapur: {
    name: 'Madhapur',
    locationScore: { overall: 90, connectivity: 93, safety: 84, education: 86, healthcare: 85, lifestyle: 92, publicTransport: 90, employmentOpportunities: 94 },
    nearbyPlaces: [
      { category: 'school', name: 'Manthan International School', distance: '3.1 km', travelTime: '10 mins' },
      { category: 'college', name: 'Venkateshwara College of Fine Arts', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'hospital', name: 'Hegde Hospital Madhapur', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'pharmacy', name: 'MedPlus Madhapur Main Road', distance: '0.2 km', travelTime: '1 min' },
      { category: 'metro', name: 'Madhapur Metro Station', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'bus', name: 'Madhapur PS Bus Stop', distance: '0.3 km', travelTime: '1 min' },
      { category: 'railway', name: 'Borabanda Railway Station', distance: '3.8 km', travelTime: '12 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '34.2 km', travelTime: '45 mins' },
      { category: 'mall', name: 'Inorbit Mall', distance: '1.2 km', travelTime: '4 mins' },
      { category: 'supermarket', name: 'D-Mart Madhapur', distance: '0.7 km', travelTime: '3 mins' },
      { category: 'restaurant', name: 'Heart Cup Coffee Madhapur', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'park', name: 'Durgam Cheruvu Lake Park', distance: '0.9 km', travelTime: '3 mins' },
      { category: 'gym', name: 'F45 Training Madhapur', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'itpark', name: 'Mindspace IT Park', distance: '1.1 km', travelTime: '4 mins' },
      { category: 'bank', name: 'Axis Bank Madhapur', distance: '0.3 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '6 mins', walking: '18 mins', transit: '8 mins' },
      college: { driving: '3 mins', walking: '10 mins', transit: '5 mins' },
      airport: { driving: '45 mins', walking: '450 mins', transit: '65 mins' },
      railway: { driving: '12 mins', walking: '45 mins', transit: '18 mins' },
      cityCenter: { driving: '20 mins', walking: '160 mins', transit: '35 mins' }
    },
    neighborhoodInsights: 'Madhapur is Hyderabad\'s primary commercial IT heart, boasting vibrant corporate workspaces, art institutes, chic cafes, and close integration with Durgam Cheruvu Lake. It serves as a bustling hub for bachelors and families alike.',
    investment: {
      rentalYield: 5.0,
      appreciationPotential: 'High',
      demandScore: 94,
      investmentScore: 9.0,
      reasons: ['Extremely high tenant demand from IT employees', 'Excellent metro access on the Blue Line corridor', 'Premium retail, food and nightlife capital']
    },
    safetyIndex: { safetyScore: 88, familyFriendlyScore: 85, nightSafetyScore: 88 },
    aiRecommendations: 'Explore Hitech City for high-rise gated living or Narsingi for quiet suburban apartments.'
  },
  kokapet: {
    name: 'Kokapet',
    locationScore: { overall: 85, connectivity: 86, safety: 89, education: 84, healthcare: 80, lifestyle: 82, publicTransport: 72, employmentOpportunities: 84 },
    nearbyPlaces: [
      { category: 'school', name: 'Global Edge School Kokapet', distance: '1.2 km', travelTime: '4 mins' },
      { category: 'college', name: 'CBIT Engineering College', distance: '4.8 km', travelTime: '12 mins' },
      { category: 'hospital', name: 'Continental Hospitals Nanakramguda', distance: '3.5 km', travelTime: '10 mins' },
      { category: 'pharmacy', name: 'Apollo Pharmacy Kokapet', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'metro', name: 'Gachibowli Metro (Proposed)', distance: '4.2 km', travelTime: '12 mins' },
      { category: 'bus', name: 'Kokapet Village Bus Stop', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'railway', name: 'Lingampally Railway Station', distance: '11.2 km', travelTime: '25 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '28.5 km', travelTime: '30 mins' },
      { category: 'mall', name: 'Lanco Hills Shopping Zone', distance: '6.2 km', travelTime: '15 mins' },
      { category: 'supermarket', name: 'Vijetha Supermarket Kokapet', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'restaurant', name: 'The Glass Onion Kokapet', distance: '1.5 km', travelTime: '5 mins' },
      { category: 'park', name: 'Kokapet Lake View Park', distance: '1.0 km', travelTime: '4 mins' },
      { category: 'gym', name: 'Core Fitness Kokapet', distance: '0.7 km', travelTime: '2 mins' },
      { category: 'itpark', name: 'Gar Infobahn IT Park', distance: '2.5 km', travelTime: '7 mins' },
      { category: 'bank', name: 'Yes Bank Kokapet', distance: '0.4 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '10 mins', walking: '35 mins', transit: '15 mins' },
      college: { driving: '12 mins', walking: '60 mins', transit: '20 mins' },
      airport: { driving: '30 mins', walking: '320 mins', transit: '40 mins' },
      railway: { driving: '25 mins', walking: '120 mins', transit: '35 mins' },
      cityCenter: { driving: '32 mins', walking: '260 mins', transit: '55 mins' }
    },
    neighborhoodInsights: 'Kokapet is Hyderabad\'s premium rising residential suburb, recognized for luxury high-rise properties, excellent air quality, and seamless connectivity to the Financial District via the ORR toll exit.',
    investment: {
      rentalYield: 3.8,
      appreciationPotential: 'Very High',
      demandScore: 88,
      investmentScore: 9.3,
      reasons: ['Fastest growing luxury high-rise pocket in West Hyd', 'Immediate connectivity to ORR and Financial District', 'Strong interest from NRI buyers and HNIs']
    },
    safetyIndex: { safetyScore: 91, familyFriendlyScore: 92, nightSafetyScore: 86 },
    aiRecommendations: 'If Kokapet prices are high, check Narsingi or Manikonda for more budget-friendly flats.'
  },
  narsingi: {
    name: 'Narsingi',
    locationScore: { overall: 83, connectivity: 85, safety: 86, education: 83, healthcare: 79, lifestyle: 80, publicTransport: 75, employmentOpportunities: 81 },
    nearbyPlaces: [
      { category: 'school', name: 'Rockwell International School', distance: '1.5 km', travelTime: '5 mins' },
      { category: 'college', name: 'MGIT Engineering College', distance: '4.5 km', travelTime: '11 mins' },
      { category: 'hospital', name: 'Star Hospitals Financial District', distance: '3.8 km', travelTime: '10 mins' },
      { category: 'pharmacy', name: 'Apollo Pharmacy Narsingi', distance: '0.3 km', travelTime: '1 min' },
      { category: 'metro', name: 'Mindspace Metro Station', distance: '6.5 km', travelTime: '15 mins' },
      { category: 'bus', name: 'Narsingi Junction Bus Stop', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'railway', name: 'Lingampally Railway Station', distance: '12.5 km', travelTime: '28 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '27.0 km', travelTime: '28 mins' },
      { category: 'mall', name: 'Sharath City Capital Mall', distance: '6.8 km', travelTime: '18 mins' },
      { category: 'supermarket', name: 'Ratnadeep Supermarket Narsingi', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'restaurant', name: 'The Joint Narsingi', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'park', name: 'Gandipet Landscape Park', distance: '2.5 km', travelTime: '8 mins' },
      { category: 'gym', name: 'Ozone Gym Narsingi', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'itpark', name: 'Kokapet SEZ / Financial District', distance: '3.6 km', travelTime: '10 mins' },
      { category: 'bank', name: 'Canara Bank Narsingi', distance: '0.4 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '10 mins', walking: '40 mins', transit: '15 mins' },
      college: { driving: '11 mins', walking: '55 mins', transit: '18 mins' },
      airport: { driving: '28 mins', walking: '300 mins', transit: '38 mins' },
      railway: { driving: '28 mins', walking: '140 mins', transit: '40 mins' },
      cityCenter: { driving: '30 mins', walking: '240 mins', transit: '50 mins' }
    },
    neighborhoodInsights: 'Narsingi is an emerging residential hub near Gandipet lake. It offers luxury villas and premium apartments that cater directly to working professionals in the Financial District and Gachibowli.',
    investment: {
      rentalYield: 4.1,
      appreciationPotential: 'High',
      demandScore: 85,
      investmentScore: 8.9,
      reasons: ['Direct access to ORR Junction at Narsingi', 'Close proximity to major international schools', 'More affordable luxury options than Kokapet and Gachibowli']
    },
    safetyIndex: { safetyScore: 87, familyFriendlyScore: 91, nightSafetyScore: 83 },
    aiRecommendations: 'Consider Manikonda for lower property rates or Kokapet if looking for ultra-premium skyscrapers.'
  },
  'financial district': {
    name: 'Financial District',
    locationScore: { overall: 90, connectivity: 91, safety: 88, education: 85, healthcare: 86, lifestyle: 87, publicTransport: 82, employmentOpportunities: 97 },
    nearbyPlaces: [
      { category: 'school', name: 'Keystone International School', distance: '1.8 km', travelTime: '6 mins' },
      { category: 'college', name: 'ISB Hyderabad', distance: '3.2 km', travelTime: '8 mins' },
      { category: 'hospital', name: 'Continental Hospital Nanakramguda', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'pharmacy', name: 'MedPlus Financial District', distance: '0.3 km', travelTime: '1 min' },
      { category: 'metro', name: 'Hitech City Metro', distance: '5.8 km', travelTime: '13 mins' },
      { category: 'bus', name: 'Wipro Circle Bus Stop', distance: '0.3 km', travelTime: '1 min' },
      { category: 'railway', name: 'Lingampally Railway Station', distance: '8.2 km', travelTime: '18 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '29.5 km', travelTime: '32 mins' },
      { category: 'mall', name: 'Forum Sujana Mall', distance: '10.5 km', travelTime: '25 mins' },
      { category: 'supermarket', name: 'Ratnadeep Wipro Circle', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'restaurant', name: 'Oakwood Residence Bistro', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'park', name: 'Financial District Central Park', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'gym', name: 'Anytime Fitness Financial District', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'itpark', name: 'Wipro / Waverock SEZ', distance: '0.2 km', travelTime: '1 min' },
      { category: 'bank', name: 'Kotak Mahindra Bank Wipro Circle', distance: '0.3 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '2 mins', walking: '5 mins', transit: '2 mins' },
      college: { driving: '8 mins', walking: '38 mins', transit: '12 mins' },
      airport: { driving: '32 mins', walking: '340 mins', transit: '42 mins' },
      railway: { driving: '18 mins', walking: '90 mins', transit: '28 mins' },
      cityCenter: { driving: '26 mins', walking: '210 mins', transit: '48 mins' }
    },
    neighborhoodInsights: 'Financial District (Nanakramguda) is the core commercial zone for global financial services and tech companies like Wipro, Apple, and Microsoft. It features Waverock SEZ, high-end commercial properties, and premium high-rise residences.',
    investment: {
      rentalYield: 4.9,
      appreciationPotential: 'High',
      demandScore: 93,
      investmentScore: 9.2,
      reasons: ['Primary IT SEZ and financial corporate hub', 'Walk-to-work culture attraction for high-earning professionals', 'Top-tier infrastructure maintenance and direct ORR access']
    },
    safetyIndex: { safetyScore: 89, familyFriendlyScore: 87, nightSafetyScore: 87 },
    aiRecommendations: 'Consider Gachibowli or Narsingi for more diverse residential properties.'
  },
  manikonda: {
    name: 'Manikonda',
    locationScore: { overall: 81, connectivity: 82, safety: 80, education: 82, healthcare: 78, lifestyle: 83, publicTransport: 74, employmentOpportunities: 80 },
    nearbyPlaces: [
      { category: 'school', name: 'Mount Litera Zee School', distance: '1.2 km', travelTime: '4 mins' },
      { category: 'college', name: 'Lords Institute of Engineering', distance: '7.2 km', travelTime: '18 mins' },
      { category: 'hospital', name: 'Preeti Urology & Kidney Hospital', distance: '0.9 km', travelTime: '3 mins' },
      { category: 'pharmacy', name: 'Apollo Pharmacy Manikonda', distance: '0.2 km', travelTime: '1 min' },
      { category: 'metro', name: 'Peddamma Temple Metro Station', distance: '5.2 km', travelTime: '12 mins' },
      { category: 'bus', name: 'Manikonda Ouput Bus Stop', distance: '0.3 km', travelTime: '1 min' },
      { category: 'railway', name: 'Nampally Railway Station', distance: '12.0 km', travelTime: '30 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '28.0 km', travelTime: '35 mins' },
      { category: 'mall', name: 'Lanco Hills Shopping Mall', distance: '2.2 km', travelTime: '7 mins' },
      { category: 'supermarket', name: 'Reliance Smart Manikonda', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'restaurant', name: 'Pista House Manikonda', distance: '0.4 km', travelTime: '1 min' },
      { category: 'park', name: 'Lanco Hills Park', distance: '1.8 km', travelTime: '5 mins' },
      { category: 'gym', name: 'Snap Fitness Manikonda', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'itpark', name: 'Lanco Hills Technology Park', distance: '2.1 km', travelTime: '7 mins' },
      { category: 'bank', name: 'Union Bank of India Manikonda', distance: '0.3 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '12 mins', walking: '48 mins', transit: '18 mins' },
      college: { driving: '18 mins', walking: '90 mins', transit: '28 mins' },
      airport: { driving: '35 mins', walking: '320 mins', transit: '48 mins' },
      railway: { driving: '30 mins', walking: '150 mins', transit: '45 mins' },
      cityCenter: { driving: '22 mins', walking: '170 mins', transit: '38 mins' }
    },
    neighborhoodInsights: 'Manikonda is a highly popular residential suburb offering budget-friendly to mid-range apartments. It is well integrated with the Lanco Hills development and provides immediate connectivity to both Gachibowli and Jubilee Hills.',
    investment: {
      rentalYield: 4.3,
      appreciationPotential: 'Moderate-High',
      demandScore: 89,
      investmentScore: 8.4,
      reasons: ['Affordable entry price points for young IT professionals', 'Established locality with high local commercial density', 'Immediate proximity to Hitech City and Financial District']
    },
    safetyIndex: { safetyScore: 82, familyFriendlyScore: 86, nightSafetyScore: 78 },
    aiRecommendations: 'Look at Narsingi for newer gated communities or Kondapur for better public transport.'
  },
  'jubilee hills': {
    name: 'Jubilee Hills',
    locationScore: { overall: 94, connectivity: 93, safety: 91, education: 92, healthcare: 90, lifestyle: 98, publicTransport: 88, employmentOpportunities: 90 },
    nearbyPlaces: [
      { category: 'school', name: 'Jubilee Hills Public School', distance: '1.1 km', travelTime: '4 mins' },
      { category: 'college', name: 'Dr. B.R. Ambedkar Open University', distance: '1.5 km', travelTime: '5 mins' },
      { category: 'hospital', name: 'Apollo Hospitals Jubilee Hills', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'pharmacy', name: 'Apollo Pharmacy Road No 36', distance: '0.2 km', travelTime: '1 min' },
      { category: 'metro', name: 'Jubilee Hills Check Post Metro', distance: '0.3 km', travelTime: '1 min' },
      { category: 'bus', name: 'Jubilee Hills Check Post Bus Stop', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'railway', name: 'Begumpet Railway Station', distance: '7.2 km', travelTime: '16 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '34.0 km', travelTime: '42 mins' },
      { category: 'mall', name: 'GVK One Mall', distance: '3.8 km', travelTime: '10 mins' },
      { category: 'supermarket', name: 'Nature\'s Basket Jubilee Hills', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'restaurant', name: 'Fat Pigeon Bar Hop', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'park', name: 'KBR National Park', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'gym', name: 'Gold\'s Gym Road No 36', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'itpark', name: 'Madhapur Tech Parks', distance: '2.5 km', travelTime: '8 mins' },
      { category: 'bank', name: 'Standard Chartered Bank Jubilee Hills', distance: '0.3 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '8 mins', walking: '28 mins', transit: '10 mins' },
      college: { driving: '5 mins', walking: '15 mins', transit: '6 mins' },
      airport: { driving: '42 mins', walking: '420 mins', transit: '60 mins' },
      railway: { driving: '16 mins', walking: '75 mins', transit: '25 mins' },
      cityCenter: { driving: '14 mins', walking: '110 mins', transit: '22 mins' }
    },
    neighborhoodInsights: 'Jubilee Hills is Hyderabad\'s most prestigious, upscale residential locality. It hosts ultra-luxury villas, prominent production studios, premium gyms, cafes, fine-dining restaurants, and the iconic KBR National Park.',
    investment: {
      rentalYield: 3.2,
      appreciationPotential: 'Moderate-Stable',
      demandScore: 91,
      investmentScore: 8.7,
      reasons: ['Elite status address with limited supply', 'Abundant green parks and high safety indices', 'Central location connecting Hyderabad core and Western IT zones']
    },
    safetyIndex: { safetyScore: 93, familyFriendlyScore: 94, nightSafetyScore: 92 },
    aiRecommendations: 'Consider Banjara Hills for similar luxury living or Kokapet for modern luxury penthouses.'
  },
  'banjara hills': {
    name: 'Banjara Hills',
    locationScore: { overall: 93, connectivity: 94, safety: 90, education: 91, healthcare: 92, lifestyle: 96, publicTransport: 86, employmentOpportunities: 89 },
    nearbyPlaces: [
      { category: 'school', name: 'Meridian School Banjara Hills', distance: '1.4 km', travelTime: '5 mins' },
      { category: 'college', name: 'Muffakham Jah College of Engineering', distance: '2.1 km', travelTime: '7 mins' },
      { category: 'hospital', name: 'Care Hospitals Road No 1', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'pharmacy', name: 'Apollo Pharmacy Road No 1', distance: '0.2 km', travelTime: '1 min' },
      { category: 'metro', name: 'Irrum Manzil Metro Station', distance: '1.5 km', travelTime: '5 mins' },
      { category: 'bus', name: 'Banjara Hills Road No 1 Bus Stop', distance: '0.3 km', travelTime: '1 min' },
      { category: 'railway', name: 'Nampally Railway Station', distance: '5.8 km', travelTime: '14 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '32.0 km', travelTime: '38 mins' },
      { category: 'mall', name: 'GVK One Mall Banjara Hills', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'supermarket', name: 'Q-Mart Banjara Hills', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'restaurant', name: 'Barbeque Nation Road No 1', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'park', name: 'Jalagam Vengal Rao Park', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'gym', name: 'Talwalkars Gym Road No 12', distance: '1.2 km', travelTime: '4 mins' },
      { category: 'itpark', name: 'Begumpet Tech Hubs', distance: '4.5 km', travelTime: '12 mins' },
      { category: 'bank', name: 'HDFC Bank Road No 1', distance: '0.2 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '12 mins', walking: '45 mins', transit: '18 mins' },
      college: { driving: '7 mins', walking: '25 mins', transit: '10 mins' },
      airport: { driving: '38 mins', walking: '380 mins', transit: '50 mins' },
      railway: { driving: '14 mins', walking: '60 mins', transit: '20 mins' },
      cityCenter: { driving: '10 mins', walking: '80 mins', transit: '15 mins' }
    },
    neighborhoodInsights: 'Banjara Hills is a premier commercial and residential address in central Hyderabad. Offering elite medical facilities, luxury hotels, fine-dining restaurants, and luxury properties, it is highly sought after by premium buyers.',
    investment: {
      rentalYield: 3.4,
      appreciationPotential: 'Stable',
      demandScore: 89,
      investmentScore: 8.6,
      reasons: ['Highly prestigious central business district address', 'Outstanding healthcare and hospitality density', 'Limited new residential developments maintaining high asset values']
    },
    safetyIndex: { safetyScore: 92, familyFriendlyScore: 93, nightSafetyScore: 90 },
    aiRecommendations: 'Consider Jubilee Hills for VIP estates or Kokapet for new luxury sky-villas.'
  },
  kukatpally: {
    name: 'Kukatpally',
    locationScore: { overall: 85, connectivity: 90, safety: 82, education: 88, healthcare: 85, lifestyle: 85, publicTransport: 91, employmentOpportunities: 83 },
    nearbyPlaces: [
      { category: 'school', name: 'DAV Public School Kukatpally', distance: '1.5 km', travelTime: '5 mins' },
      { category: 'college', name: 'JNTU Hyderabad', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'hospital', name: 'Omni Hospitals Kukatpally', distance: '1.2 km', travelTime: '4 mins' },
      { category: 'pharmacy', name: 'Apollo Pharmacy KPHB', distance: '0.2 km', travelTime: '1 min' },
      { category: 'metro', name: 'KPHB Colony Metro Station', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'bus', name: 'KPHB Bus Stop', distance: '0.3 km', travelTime: '1 min' },
      { category: 'railway', name: 'Sanathnagar Railway Station', distance: '5.2 km', travelTime: '14 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '38.5 km', travelTime: '50 mins' },
      { category: 'mall', name: 'Forum Sujana Mall', distance: '1.5 km', travelTime: '5 mins' },
      { category: 'supermarket', name: 'Metro Cash & Carry', distance: '2.1 km', travelTime: '8 mins' },
      { category: 'restaurant', name: 'Pista House Kukatpally', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'park', name: 'KPHB Phase 1 Park', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'gym', name: 'Cult.fit Kukatpally', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'itpark', name: 'Hitech City IT Hubs', distance: '5.5 km', travelTime: '15 mins' },
      { category: 'bank', name: 'SBI KPHB Branch', distance: '0.3 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '15 mins', walking: '60 mins', transit: '20 mins' },
      college: { driving: '3 mins', walking: '10 mins', transit: '4 mins' },
      airport: { driving: '50 mins', walking: '500 mins', transit: '75 mins' },
      railway: { driving: '14 mins', walking: '65 mins', transit: '22 mins' },
      cityCenter: { driving: '32 mins', walking: '240 mins', transit: '50 mins' }
    },
    neighborhoodInsights: 'Kukatpally is a dense commercial and residential hub in North-West Hyderabad. Known for KPHB (one of the largest housing board colonies in Asia), it offers excellent metro access, prominent universities like JNTU, and major shopping destinations.',
    investment: {
      rentalYield: 4.2,
      appreciationPotential: 'Moderate-High',
      demandScore: 91,
      investmentScore: 8.5,
      reasons: ['Outstanding connectivity to both IT hubs and industrial areas', 'Established educational cluster with top institutions', 'Robust local retail market and malls']
    },
    safetyIndex: { safetyScore: 83, familyFriendlyScore: 87, nightSafetyScore: 80 },
    aiRecommendations: 'Consider Miyapur or Nizampet for lower budget apartment alternatives.'
  },
  miyapur: {
    name: 'Miyapur',
    locationScore: { overall: 80, connectivity: 84, safety: 79, education: 80, healthcare: 78, lifestyle: 78, publicTransport: 88, employmentOpportunities: 77 },
    nearbyPlaces: [
      { category: 'school', name: 'Sentia Global School', distance: '1.8 km', travelTime: '6 mins' },
      { category: 'college', name: 'JNTU College of Engineering', distance: '3.8 km', travelTime: '10 mins' },
      { category: 'hospital', name: 'Pranaam Hospital Miyapur', distance: '1.2 km', travelTime: '4 mins' },
      { category: 'pharmacy', name: 'MedPlus Miyapur Junction', distance: '0.3 km', travelTime: '1 min' },
      { category: 'metro', name: 'Miyapur Metro Terminal', distance: '0.6 km', travelTime: '3 mins' },
      { category: 'bus', name: 'Miyapur X Roads Bus Stop', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'railway', name: 'Hafeezpet Railway Station', distance: '4.8 km', travelTime: '12 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '41.0 km', travelTime: '55 mins' },
      { category: 'mall', name: 'Sujana Forum Mall', distance: '4.5 km', travelTime: '12 mins' },
      { category: 'supermarket', name: 'More Megastore Miyapur', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'restaurant', name: 'Angara Restaurant Miyapur', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'park', name: 'Miyapur Lake Park', distance: '1.5 km', travelTime: '5 mins' },
      { category: 'gym', name: 'Fitness One Miyapur', distance: '0.7 km', travelTime: '2 mins' },
      { category: 'itpark', name: 'Hitech City IT Core', distance: '8.2 km', travelTime: '20 mins' },
      { category: 'bank', name: 'HDFC Bank Miyapur', distance: '0.4 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '20 mins', walking: '90 mins', transit: '25 mins' },
      college: { driving: '10 mins', walking: '45 mins', transit: '15 mins' },
      airport: { driving: '55 mins', walking: '550 mins', transit: '80 mins' },
      railway: { driving: '12 mins', walking: '60 mins', transit: '20 mins' },
      cityCenter: { driving: '38 mins', walking: '280 mins', transit: '60 mins' }
    },
    neighborhoodInsights: 'Miyapur is a popular, highly affordable residential suburb in West Hyderabad. Hosting the starting terminal of the Hyderabad Metro Line 1, it serves as a strategic commuter hub for professionals working in Western IT parks.',
    investment: {
      rentalYield: 4.4,
      appreciationPotential: 'Moderate',
      demandScore: 87,
      investmentScore: 8.1,
      reasons: ['Highly affordable residential rents and purchase prices', 'Miyapur Metro terminal provides seamless traffic-free commute', 'Rapid commercialization along the Miyapur main road']
    },
    safetyIndex: { safetyScore: 80, familyFriendlyScore: 84, nightSafetyScore: 76 },
    aiRecommendations: 'Look at Kukatpally for more retail options or Nizampet for lower budget flats.'
  },
  'lb nagar': {
    name: 'LB Nagar',
    locationScore: { overall: 78, connectivity: 85, safety: 79, education: 81, healthcare: 80, lifestyle: 76, publicTransport: 89, employmentOpportunities: 72 },
    nearbyPlaces: [
      { category: 'school', name: 'Little Flower School', distance: '2.5 km', travelTime: '8 mins' },
      { category: 'college', name: 'Kamineni Institute of Dental', distance: '3.1 km', travelTime: '10 mins' },
      { category: 'hospital', name: 'Kamineni Hospitals LB Nagar', distance: '1.2 km', travelTime: '4 mins' },
      { category: 'pharmacy', name: 'MedPlus LB Nagar Junction', distance: '0.2 km', travelTime: '1 min' },
      { category: 'metro', name: 'LB Nagar Metro Station', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'bus', name: 'LB Nagar Ring Road Stop', distance: '0.3 km', travelTime: '1 min' },
      { category: 'railway', name: 'Kacheguda Railway Station', distance: '9.2 km', travelTime: '22 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '24.0 km', travelTime: '26 mins' },
      { category: 'mall', name: 'Dilsukhnagar Shopping Zone', distance: '3.5 km', travelTime: '12 mins' },
      { category: 'supermarket', name: 'D-Mart LB Nagar', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'restaurant', name: 'Swagath Grand LB Nagar', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'park', name: 'Priyadarshini Park', distance: '1.4 km', travelTime: '5 mins' },
      { category: 'gym', name: 'Power Gym LB Nagar', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'itpark', name: 'Adibatla TCS Aerospace SEZ', distance: '14.5 km', travelTime: '30 mins' },
      { category: 'bank', name: 'SBI LB Nagar Branch', distance: '0.3 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '30 mins', walking: '160 mins', transit: '38 mins' },
      college: { driving: '10 mins', walking: '40 mins', transit: '12 mins' },
      airport: { driving: '26 mins', walking: '280 mins', transit: '35 mins' },
      railway: { driving: '22 mins', walking: '110 mins', transit: '30 mins' },
      cityCenter: { driving: '25 mins', walking: '130 mins', transit: '32 mins' }
    },
    neighborhoodInsights: 'LB Nagar (Lal Bahadur Nagar) is a prominent commercial and residential gateway in South-East Hyderabad. It marks the terminal metro station on the Red Line corridor and offers outstanding connectivity to the airport via Srisailam highway.',
    investment: {
      rentalYield: 3.9,
      appreciationPotential: 'Moderate',
      demandScore: 82,
      investmentScore: 7.8,
      reasons: ['Highly connected transport terminal in South-East', 'Proximity to Adibatla Aerospace SEZ and TCS campus', 'Established, stable mid-income residential zone']
    },
    safetyIndex: { safetyScore: 81, familyFriendlyScore: 85, nightSafetyScore: 75 },
    aiRecommendations: 'Explore Uppal for similar pricing in East Hyderabad or Miyapur in West Hyderabad.'
  },
  uppal: {
    name: 'Uppal',
    locationScore: { overall: 77, connectivity: 82, safety: 78, education: 80, healthcare: 79, lifestyle: 74, publicTransport: 86, employmentOpportunities: 73 },
    nearbyPlaces: [
      { category: 'school', name: 'Little Flower Junior College/School', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'college', name: 'Osmania University Campus', distance: '3.5 km', travelTime: '10 mins' },
      { category: 'hospital', name: 'Aditya Hospital Uppal', distance: '1.1 km', travelTime: '4 mins' },
      { category: 'pharmacy', name: 'Apollo Pharmacy Uppal', distance: '0.3 km', travelTime: '1 min' },
      { category: 'metro', name: 'Uppal Metro Station', distance: '0.5 km', travelTime: '2 mins' },
      { category: 'bus', name: 'Uppal Ring Road Bus Stop', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'railway', name: 'Secunderabad Railway Station', distance: '8.5 km', travelTime: '20 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '29.5 km', travelTime: '38 mins' },
      { category: 'mall', name: 'DSL Virtue Mall Uppal', distance: '1.2 km', travelTime: '4 mins' },
      { category: 'supermarket', name: 'Ratnadeep Supermarket Uppal', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'restaurant', name: 'Paradise Biryani Uppal', distance: '0.7 km', travelTime: '3 mins' },
      { category: 'park', name: 'Uppal Bhagayath Park', distance: '1.5 km', travelTime: '5 mins' },
      { category: 'gym', name: 'Talwalkars Gym Uppal', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'itpark', name: 'NSL Arena Town IT Park', distance: '1.0 km', travelTime: '4 mins' },
      { category: 'bank', name: 'ICICI Bank Uppal', distance: '0.3 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '4 mins', walking: '12 mins', transit: '5 mins' },
      college: { driving: '10 mins', walking: '45 mins', transit: '15 mins' },
      airport: { driving: '38 mins', walking: '340 mins', transit: '50 mins' },
      railway: { driving: '20 mins', walking: '100 mins', transit: '28 mins' },
      cityCenter: { driving: '22 mins', walking: '120 mins', transit: '25 mins' }
    },
    neighborhoodInsights: 'Uppal is a prominent residential and tech micro-market in East Hyderabad. Highlighted by the NSL Arena Town IT SEZ and the massive Uppal Bhagayath residential layout, it offers direct metro links and close proximity to Osmania University.',
    investment: {
      rentalYield: 4.1,
      appreciationPotential: 'Moderate',
      demandScore: 84,
      investmentScore: 7.9,
      reasons: ['NSL Arena IT Tower generates local employment demand', 'Uppal Bhagayath HMDA layout has premium appreciation potential', 'Excellent rail and metro linkages']
    },
    safetyIndex: { safetyScore: 80, familyFriendlyScore: 83, nightSafetyScore: 76 },
    aiRecommendations: 'Check LB Nagar for south highway links or Pocharam for budget IT township flats.'
  },
  kompally: {
    name: 'Kompally',
    locationScore: { overall: 76, connectivity: 78, safety: 82, education: 84, healthcare: 76, lifestyle: 78, publicTransport: 70, employmentOpportunities: 72 },
    nearbyPlaces: [
      { category: 'school', name: 'St. Ann\'s High School Kompally', distance: '1.2 km', travelTime: '4 mins' },
      { category: 'college', name: 'Malla Reddy University', distance: '6.2 km', travelTime: '15 mins' },
      { category: 'hospital', name: 'Surekha Hospital Kompally', distance: '1.5 km', travelTime: '5 mins' },
      { category: 'pharmacy', name: 'Apollo Pharmacy Kompally', distance: '0.4 km', travelTime: '2 mins' },
      { category: 'metro', name: 'Balangar Metro Station', distance: '11.5 km', travelTime: '25 mins' },
      { category: 'bus', name: 'Kompally NH 44 Bus Stop', distance: '0.3 km', travelTime: '1 min' },
      { category: 'railway', name: 'Bolarum Railway Station', distance: '4.8 km', travelTime: '12 mins' },
      { category: 'airport', name: 'Rajiv Gandhi International Airport', distance: '45.0 km', travelTime: '55 mins' },
      { category: 'mall', name: 'Ganesh Shopping Mall', distance: '2.5 km', travelTime: '8 mins' },
      { category: 'supermarket', name: 'Ratnadeep NH 44 Kompally', distance: '0.6 km', travelTime: '2 mins' },
      { category: 'restaurant', name: 'Runway 9 Family Restaurant', distance: '1.8 km', travelTime: '5 mins' },
      { category: 'park', name: 'Dhola-ri-Dhani Theme Park', distance: '3.2 km', travelTime: '10 mins' },
      { category: 'gym', name: 'Fitness First Kompally', distance: '0.8 km', travelTime: '3 mins' },
      { category: 'itpark', name: 'Balanagar Industrial Zone', distance: '9.8 km', travelTime: '22 mins' },
      { category: 'bank', name: 'HDFC Bank Kompally', distance: '0.3 km', travelTime: '1 min' }
    ],
    commuteTimes: {
      office: { driving: '22 mins', walking: '110 mins', transit: '32 mins' },
      college: { driving: '15 mins', walking: '70 mins', transit: '25 mins' },
      airport: { driving: '55 mins', walking: '550 mins', transit: '75 mins' },
      railway: { driving: '12 mins', walking: '55 mins', transit: '18 mins' },
      cityCenter: { driving: '35 mins', walking: '280 mins', transit: '55 mins' }
    },
    neighborhoodInsights: 'Kompally is a peaceful residential suburb in North Hyderabad along NH 44. Popular among families seeking spacious residential houses, gated villas, and organic green surroundings, it hosts elite schools and convention centres.',
    investment: {
      rentalYield: 3.6,
      appreciationPotential: 'Moderate-High',
      demandScore: 80,
      investmentScore: 7.7,
      reasons: ['Preferred gated community villa destination in North Hyd', 'Direct access to National Highway 44 (Nagpur highway)', 'Highly family-friendly layout with organic green parks']
    },
    safetyIndex: { safetyScore: 85, familyFriendlyScore: 90, nightSafetyScore: 80 },
    aiRecommendations: 'Explore Alwal or Bolarum for lower pricing, or Miyapur if looking for metro connectivity.'
  }
};

const run = async () => {
  const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/estateai';
  console.log(`Connecting to MongoDB at: ${connStr.replace(/\/\/.*@/, '//<credentials>@')}`);
  await mongoose.connect(connStr);

  console.log('Seeding detailed location intelligence for Hyderabad...');
  
  await LocationIntelligence.deleteMany({ city: 'hyderabad' });

  const record = new LocationIntelligence({
    city: 'hyderabad',
    localities: hyderabadLocalities
  });

  await record.save();
  console.log('Successfully seeded 15 detailed Hyderabad localities into LocationIntelligence collection!');
  
  await mongoose.disconnect();
  process.exit(0);
};

run();
