const { aiClient, modelName, isMockAI } = require('../config/aiConfig');
const localities = require('../config/localities');
const Property = require('../models/Property');


// Helper to find matching locality profiles
const getLocalityProfile = (locationStr) => {
  if (!locationStr) return null;
  const normalized = locationStr.toLowerCase().trim();
  
  // 1. Exact match check
  if (localities[normalized]) {
    return localities[normalized];
  }
  
  // 2. Exact word boundary or full substring check
  for (const [key, value] of Object.entries(localities)) {
    // Match as a whole word inside the location string to avoid matching single characters or partial fragments
    const regex = new RegExp(`\\b${key}\\b`, 'i');
    if (regex.test(normalized)) {
      return value;
    }
  }
  
  // 3. Fallback to token similarity for slightly misspelled phrases (minimum 4 characters)
  for (const [key] of Object.entries(localities)) {
    if (normalized.length >= 4 && key.includes(normalized)) {
      return localities[key];
    }
  }
  return null;
};

// ==========================================
// 1. Natural Language Query Parsing Service
// ==========================================
exports.parseChatQuery = async (userInput) => {
  const defaultFilters = {
    city: '',
    state: '',
    propertyType: '',
    minPrice: 0,
    maxPrice: 0,
    bedrooms: 0,
    bathrooms: 0,
    minArea: 0,
    maxArea: 0,
    listingType: 'sale',
    explanation: 'Here are the listings matching your search requirements.'
  };

  if (isMockAI) {
    return parseChatQueryFallback(userInput, defaultFilters);
  }

  try {
    const prompt = `
      You are an expert real estate assistant. Convert the user's natural language real estate search query into a structured JSON filter object for a database query.
      
      User search query: "${userInput}"
      
      Output ONLY a JSON object matching this schema:
      {
        "city": "string (lowercase city name, or empty string)",
        "state": "string (lowercase state name, or empty string)",
        "propertyType": "string (one of: 'apartment', 'house', 'villa', 'plot', 'commercial' or empty string)",
        "minPrice": "number (minimum price, 0 if not specified)",
        "maxPrice": "number (maximum price, 0 if not specified)",
        "bedrooms": "number (number of bedrooms, 0 if not specified)",
        "bathrooms": "number (number of bathrooms, 0 if not specified)",
        "minArea": "number (minimum square footage area, 0 if not specified)",
        "maxArea": "number (maximum square footage area, 0 if not specified)",
        "listingType": "string (either 'sale' or 'rent', default is 'sale' unless user explicitly mentions renting, rent, to rent, PG, lease, monthly rent)",
        "explanation": "string (a warm, professional 1-2 sentence response confirming what filters you found and why you recommend these properties)"
      }

      Note on Indian currency terms if present in input:
      - "Lakh" = 100,000. E.g., "60 Lakh" = 6000000.
      - "Crore" = 10,000,000. E.g., "1.5 Crore" = 15000000.
      
      Important instructions on budgets:
      - For rental properties, prices are monthly. E.g., "rent under 40000" or "40k rent" means maxPrice is 40000.
      - For sale properties, prices are total. E.g., "under 40 Lakh" means maxPrice is 4000000.
      
      Ensure your output is strictly a JSON object and nothing else. No markdown wrappers like \`\`\`json.
    `;

    const response = await aiClient.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const responseText = response.text.trim();
    // Clean potential markdown tags if returned
    const cleanedText = responseText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanedText);

    const result = { ...defaultFilters, ...parsed };

    // Low-budget rent override rule (under 2 Lakhs budget defaults to rent unless purchase keywords exist)
    const query = userInput.toLowerCase();
    const hasPurchaseKeywords = query.includes('buy') || query.includes('purchase') || query.includes('sale') || query.includes('own');
    if (result.maxPrice > 0 && result.maxPrice <= 200000 && !hasPurchaseKeywords) {
      result.listingType = 'rent';
    }

    return result;
  } catch (error) {
    console.error('Gemini query parser failed, triggering fallback parser:', error.message);
    return parseChatQueryFallback(userInput, defaultFilters);
  }
};

// Robust Regex Fallback Parser for Natural Language real estate queries
const parseChatQueryFallback = (input, defaults) => {
  const query = input.toLowerCase();
  const filters = { ...defaults };
  filters.explanation = `Based on your request "${input}", I have filtered our active listings below.`;

  // Detect bedrooms (e.g., 2 BHK, 3 bedroom, 1 BHK)
  const bhkMatch = query.match(/(\d+)\s*(?:bhk|bedroom|bed)/);
  if (bhkMatch) {
    filters.bedrooms = parseInt(bhkMatch[1], 10);
  }

  // Detect bathrooms (e.g., 2 bathroom, 3 bath)
  const bathMatch = query.match(/(\d+)\s*(?:bathroom|bath)/);
  if (bathMatch) {
    filters.bathrooms = parseInt(bathMatch[1], 10);
  }

  // Detect property types
  if (query.includes('apartment') || query.includes('flat') || query.includes('bhk')) {
    filters.propertyType = 'apartment';
  } else if (query.includes('villa')) {
    filters.propertyType = 'villa';
  } else if (query.includes('house') || query.includes('home')) {
    filters.propertyType = 'house';
  } else if (query.includes('plot') || query.includes('land')) {
    filters.propertyType = 'plot';
  } else if (query.includes('commercial') || query.includes('office') || query.includes('shop')) {
    filters.propertyType = 'commercial';
  }

  // Detect listing type (rent vs sale)
  filters.listingType = 'sale';
  if (query.includes('rent') || query.includes('rental') || query.includes('lease') || query.includes('monthly') || query.includes('pg') || query.includes('to rent')) {
    filters.listingType = 'rent';
  } else if (query.includes('buy') || query.includes('purchase') || query.includes('sale') || query.includes('own')) {
    filters.listingType = 'sale';
  }

  // Detect Budget / Price
  // E.g. "under 60 lakh" -> maxPrice = 60,000,000; "under 1 crore" -> maxPrice = 10,000,000
  // Supports formats like "under 50l", "under 60 lakh", "below 2 cr", "under 5000000"
  const priceMatches = query.match(/(?:under|below|max|upto|budget of)\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(lakh|l|crore|cr|k)?/i);
  if (priceMatches) {
    let value = parseFloat(priceMatches[1]);
    const unit = priceMatches[2] ? priceMatches[2].toLowerCase() : '';
    
    if (unit === 'lakh' || unit === 'l') {
      value = value * 100000;
    } else if (unit === 'crore' || unit === 'cr') {
      value = value * 10000000;
    } else if (unit === 'k') {
      value = value * 1000;
    } else if (filters.listingType === 'rent' && value < 1000) {
      // e.g. "40k rent"
      value = value * 1000;
    }
    
    filters.maxPrice = value;
  }

  // Detect min price (e.g., "above 20 lakh", "starting from 15l")
  const minPriceMatches = query.match(/(?:above|greater than|starting|min|from)\s*(?:rs\.?|₹)?\s*(\d+(?:\.\d+)?)\s*(lakh|l|crore|cr|k)?/i);
  if (minPriceMatches) {
    let value = parseFloat(minPriceMatches[1]);
    const unit = minPriceMatches[2] ? minPriceMatches[2].toLowerCase() : '';
    
    if (unit === 'lakh' || unit === 'l') {
      value = value * 100000;
    } else if (unit === 'crore' || unit === 'cr') {
      value = value * 10000000;
    } else if (unit === 'k') {
      value = value * 1000;
    } else if (filters.listingType === 'rent' && value < 1000) {
      value = value * 1000;
    }
    
    filters.minPrice = value;
  }

  // Detect cities (Delhi, Mumbai, Bangalore, Pune, Noida, Gurgaon, New York, Hyderabad)
  const cities = ['delhi', 'mumbai', 'bangalore', 'pune', 'noida', 'gurgaon', 'new york', 'london', 'hyderabad'];
  for (const city of cities) {
    if (query.includes(city)) {
      filters.city = city;
      break;
    }
  }

  // Custom suggestions confirmations
  if (query.includes('school') || query.includes('college')) {
    filters.explanation += ' Prioritizing properties located in immediate vicinity to educational institutions and academic hubs.';
  }
  if (query.includes('investment') || query.includes('roi')) {
    filters.explanation += ' Filtering for properties located in high-growth corridors with excellent return on investment potential.';
  }

  // Low-budget rent override rule (under 2 Lakhs budget defaults to rent unless purchase keywords exist)
  const hasPurchaseKeywords = query.includes('buy') || query.includes('purchase') || query.includes('sale') || query.includes('own');
  if (filters.maxPrice > 0 && filters.maxPrice <= 200000 && !hasPurchaseKeywords) {
    filters.listingType = 'rent';
  }

  return filters;
};

// ==========================================
// 2. AI Property Description Generator
// ==========================================
exports.generatePropertyDescription = async ({ propertyType, location, amenities, size, listingType = 'sale' }) => {
  if (isMockAI) {
    return generatePropertyDescriptionFallback({ propertyType, location, amenities, size, listingType });
  }

  const profile = getLocalityProfile(location);
  let localityFactsPrompt = '';

  if (profile) {
    localityFactsPrompt = `
      FACTUAL LOCALITY DETAILS (You MUST anchor the description to these real facts, landmarks, and benefits. Do NOT invent other landmarks, benefits, or metro links. If there is a clash, prioritize this data):
      - Locality Name: ${profile.name}
      - City: ${profile.city}
      - Real Locality Benefits: ${profile.benefits}
      - Verified Nearby Areas: ${profile.nearbyAreas}
      - Key Area Highlights: ${profile.highlights}
    `;
  } else {
    let city = 'unknown';
    const lowerLocation = location.toLowerCase();
    if (lowerLocation.includes('hyderabad')) city = 'hyderabad';
    else if (lowerLocation.includes('delhi') || lowerLocation.includes('dwarka')) city = 'delhi';
    else if (lowerLocation.includes('mumbai') || lowerLocation.includes('bandra')) city = 'mumbai';
    else if (lowerLocation.includes('bangalore') || lowerLocation.includes('hsr') || lowerLocation.includes('whitefield')) city = 'bangalore';
    
    if (city === 'hyderabad') {
      localityFactsPrompt = `
        FACTUAL LOCALITY DETAILS (No specific neighborhood database entry found. Use only these generic Hyderabad facts. Do NOT make up specific micro-neighborhood landmarks):
        - City: Hyderabad
        - General City Benefits: Well-known for being a major technological hub with high-growth IT corridors (Madhapur/Gachibowli), excellent connectivity via the Outer Ring Road (ORR), rich historical heritage, and lower cost of living compared to other metro cities.
      `;
    } else if (city === 'delhi') {
      localityFactsPrompt = `
        FACTUAL LOCALITY DETAILS:
        - City: Delhi
        - General City Benefits: Capital city with extensive Delhi Metro connectivity, major commercial zones, historical significance, and access to top-tier educational institutions and hospitals.
      `;
    } else if (city === 'mumbai') {
      localityFactsPrompt = `
        FACTUAL LOCALITY DETAILS:
        - City: Mumbai
        - General City Benefits: Financial capital of India, excellent suburban railway connectivity, coastal lines, bustling economic hubs, and high-density premium developments.
      `;
    } else if (city === 'bangalore') {
      localityFactsPrompt = `
        FACTUAL LOCALITY DETAILS:
        - City: Bangalore
        - General City Benefits: Silicon Valley of India, known for its start-up ecosystem, tech parks, pleasant weather, rich culinary/cafe culture, and prominent research/educational institutions.
      `;
    } else {
      localityFactsPrompt = `
        FACTUAL LOCALITY DETAILS:
        - Location: ${location}
        - Constraint: No verified database facts are available for this specific locality. You MUST describe the property itself and its key amenities without inventing or making up any specific local landmarks, nearby metro stations, or fake neighborhood perks. Only state general benefits of living in the region if they are universally true. Do not bluff or fake suggestions.
      `;
    }
  }

  try {
    const prompt = `
      You are a professional real estate marketer. Generate three content pieces for a property listing:
      1. SEO Optimized Description (includes keywords, detailed description, heading tags, layout description).
      2. High-converting Marketing Description (focus on lifestyle, comfort, amenities, and local benefits).
      3. A social media caption (with relevant hashtags for Instagram/Facebook).

      Property details:
      - Type: ${propertyType}
      - Listing Type: ${listingType} (e.g., rent or sale)
      - Location: ${location}
      - Size: ${size} sq ft
      - Key Amenities: ${amenities.join(', ')}

      ${localityFactsPrompt}

      Guidelines:
      - Incorporate the locality benefits, highlights and nearby areas provided above.
      - Ensure you clearly mention whether it is for rent or for sale.
      - Make sure the suggestions are real and based STRICTLY on the locality details provided. Do NOT hallucinate or bluff.

      Output ONLY a JSON object matching this schema:
      {
        "seoDescription": "text content...",
        "marketingDescription": "text content...",
        "socialMediaCaption": "text content..."
      }

      Ensure your output is strictly a JSON object and nothing else. No markdown wrappers.
    `;

    const response = await aiClient.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const responseText = response.text.trim();
    const cleanedText = responseText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Gemini description generator failed, triggering fallback:', error.message);
    return generatePropertyDescriptionFallback({ propertyType, location, amenities, size, listingType });
  }
};

const generatePropertyDescriptionFallback = ({ propertyType, location, amenities, size, listingType = 'sale' }) => {
  const profile = getLocalityProfile(location);
  let localityInfo = '';
  if (profile) {
    localityInfo = ` Conveniently located in ${profile.name}, a premium locality in ${profile.city}. ${profile.benefits} Highlights include: ${profile.highlights}. Nearby areas include ${profile.nearbyAreas}.`;
  } else {
    localityInfo = ` Located in the prime area of ${location}. It offers convenient access to local transport and commercial hubs.`;
  }
  
  const rentOrBuySeo = listingType === 'rent' ? 'Rental option' : 'Sale option';
  const rentOrBuyMarketing = listingType === 'rent' ? 'available for lease/rent, making it a perfect home for tenants seeking' : 'now available for sale, offering a great investment opportunity for those seeking';

  const seo = `<h1>Premium ${propertyType} in ${location} (${rentOrBuySeo})</h1><p>Discover this beautiful ${size} sq ft ${propertyType} located in the prime locality of ${location}.${localityInfo} Equipped with outstanding amenities including ${amenities.join(', ')}. Perfect home with great connectivity and appreciation value. View directly on EstateAI.</p>`;
  
  const marketing = `Welcome to your dream home in ${location}! This stunning ${size} sq ft ${propertyType} is ${rentOrBuyMarketing} contemporary living spaces tailored for comfort and luxury. ${localityInfo} Featuring top-of-the-line amenities such as ${amenities.join(', ')}, every detail is crafted to support a premium lifestyle. Ideal for families and professionals alike, it provides a quiet sanctuary while keeping you connected to the city's key points.`;
  
  const social = `🏡 Stunning ${propertyType} ${listingType === 'rent' ? 'for Rent' : 'for Sale'} in ${location}! ✨\n\nLooking for a home that has it all? This gorgeous ${size} sq ft property features modern layouts and premium amenities like ${amenities.slice(0, 3).join(', ')}! 😍\n\n${profile ? `📍 Locality highlights: ${profile.highlights}\n` : ''}DM us for details or schedule a visit on EstateAI today! 📲\n\n#RealEstate #${listingType === 'rent' ? 'Rentals' : 'PropertyForSale'} #DreamHome #${location.replace(/[\s,]+/g, '')} #EstateAI`;

  return {
    seoDescription: seo,
    marketingDescription: marketing,
    socialMediaCaption: social
  };
};

// ==========================================
// 3. AI Market Insights Generator
// ==========================================
exports.generateMarketInsights = async (city) => {
  const normalizedCity = (city || '').toLowerCase().trim();

  // 1. Fetch properties count for listings
  const totalListings = await Property.countDocuments({ city: normalizedCity });

  // 2. Fetch total viewsCount across properties in the city
  const totalViewsRes = await Property.aggregate([
    { $match: { city: normalizedCity } },
    { $group: { _id: null, total: { $sum: '$viewsCount' } } }
  ]);
  const totalViews = totalViewsRes[0]?.total || 0;

  // 3. Group by propertyType to get popular types
  const popTypes = await Property.aggregate([
    { $match: { city: normalizedCity } },
    { $group: { _id: '$propertyType', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  const popularPropertyTypes = popTypes.map(pt => pt._id);

  // 4. Heuristic search to extract neighborhoods from addresses/titles
  const propertiesInCity = await Property.find({ city: normalizedCity }).limit(50).select('address title');
  const detectedAreas = new Set();
  const knownAreas = [
    'gachibowli', 'hitech city', 'kondapur', 'madhapur', 'kukatpally', 'financial district',
    'jubilee hills', 'banjara hills', 'manikonda', 'narsingi',
    'dwarka', 'saket', 'gurugram', 'rohini', 'green park',
    'bandra', 'powai', 'andheri', 'juhu', 'lower parel',
    'koramangala', 'whitefield', 'indiranagar', 'hebbal', 'yelahanka',
    'koregaon park', 'baner', 'kharadi', 'wakad', 'aundh'
  ];
  for (const p of propertiesInCity) {
    const text = `${p.address} ${p.title}`.toLowerCase();
    for (const area of knownAreas) {
      if (text.includes(area)) {
        const formatted = area.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        detectedAreas.add(formatted);
      }
    }
  }
  const topNeighborhoods = detectedAreas.size > 0 
    ? Array.from(detectedAreas).slice(0, 4) 
    : ['Premium Suburbs', 'Commercial Corridors', 'Downtown'];

  // 5. Calculate average price per sq ft for sale listings
  const saleAgg = await Property.aggregate([
    { $match: { city: normalizedCity, listingType: 'sale' } },
    {
      $group: {
        _id: null,
        avgPricePerSqFt: {
          $avg: { $divide: ['$price', '$area'] }
        }
      }
    }
  ]);

  let avgPriceVal = 7500;
  if (saleAgg && saleAgg.length > 0 && saleAgg[0].avgPricePerSqFt) {
    avgPriceVal = Math.round(saleAgg[0].avgPricePerSqFt);
  } else {
    // Check rental properties average price
    const rentAgg = await Property.aggregate([
      { $match: { city: normalizedCity, listingType: 'rent' } },
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);
    if (rentAgg && rentAgg.length > 0 && rentAgg[0].avgPrice) {
      avgPriceVal = Math.round((rentAgg[0].avgPrice / 1500) * 200); // Scaled approximate
    }
  }

  // 6. Dynamic demand score
  const avgViews = totalListings > 0 ? (totalViews / totalListings) : 0;
  let demandLevel = 'Moderate';
  if (avgViews > 250) demandLevel = 'Very High';
  else if (avgViews > 150) demandLevel = 'High';
  else if (avgViews > 80) demandLevel = 'Moderate';
  else demandLevel = 'Stable';

  // 7. Dynamic investment score
  const investmentScoreVal = Math.min(98, Math.max(50, Math.round(65 + (avgViews / 10) + (totalListings * 0.8))));

  // 8. Dynamic YoY change
  const growthRate = (5.0 + (avgViews % 50) / 10).toFixed(1);
  const priceChange = `+${growthRate}% YoY`;

  // 9. Chart data simulation based on dynamic average price
  const chartData = [
    { label: 'Q1 2025', price: Math.round(avgPriceVal * 0.92) },
    { label: 'Q2 2025', price: Math.round(avgPriceVal * 0.95) },
    { label: 'Q3 2025', price: Math.round(avgPriceVal * 0.97) },
    { label: 'Q4 2025', price: Math.round(avgPriceVal * 0.99) },
    { label: 'Q1 2026', price: avgPriceVal }
  ];

  const averagePriceStr = `₹${avgPriceVal.toLocaleString('en-IN')} per sq ft`;

  const selectedData = {
    averagePrice: averagePriceStr,
    priceChange,
    demandLevel,
    investmentScore: investmentScoreVal,
    totalListings,
    popularPropertyTypes,
    topNeighborhoods,
    chartData,
    investmentSuggestions: `Steady market metrics in ${city}. Focus on rental yield properties or commercial investments in key corridors like ${topNeighborhoods.join(', ')}.`
  };

  if (isMockAI) {
    return {
      success: true,
      city: city || 'Global',
      insights: selectedData
    };
  }

  try {
    const prompt = `
      You are a real estate financial analyst. Write a professional market summary and investment advisory report for the city of "${city}".
      
      Here are the current real-time database statistics for properties in "${city}":
      - Average Price per Sq Ft: ${selectedData.averagePrice}
      - Annual Price Growth Trend: ${selectedData.priceChange}
      - Active Listings: ${selectedData.totalListings}
      - Buyer Demand Level: ${selectedData.demandLevel}
      - Popular Property Types: ${selectedData.popularPropertyTypes.join(', ')}
      - Top Neighborhoods: ${selectedData.topNeighborhoods.join(', ')}
      
      Output ONLY a JSON object matching this schema:
      {
        "marketSummary": "1-2 paragraphs of professional market trends, supply/demand conditions, and price predictions for this city.",
        "riskAssessment": "A brief analysis of risk factors (e.g. oversupply, water issues, inflation) in this area.",
        "investmentRating": "One of: 'Strong Buy', 'Buy', 'Hold', 'Sell'"
      }

      Ensure your output is strictly a JSON object and nothing else. No markdown wrappers.
    `;

    const response = await aiClient.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const responseText = response.text.trim();
    const cleanedText = responseText.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanedText);

    return {
      success: true,
      city,
      insights: {
        ...selectedData,
        ...parsed
      }
    };
  } catch (error) {
    console.error('Gemini market insights failed, triggering fallback:', error.message);
    return {
      success: true,
      city,
      insights: {
        ...selectedData,
        marketSummary: `The real estate market in ${city} is currently showing steady expansion, driven by commercial expansion and demographic inflows. Price points have strengthened, making it a viable option for early-stage portfolio diversification.`,
        riskAssessment: 'Regulatory changes, infrastructure delays, and localized inflationary pressures are factors to monitor.',
        investmentRating: 'Buy'
      }
    };
  }
};

// ==========================================
// 4. Locality Q&A Chatbot Service
// ==========================================
exports.answerLocalityQuestion = async ({ property, message }) => {
  const query = message.toLowerCase();
  
  // Find locality profile based on city and address/title
  const searchStr = `${property.address} ${property.city} ${property.title}`;
  const profile = getLocalityProfile(searchStr) || getLocalityProfile(property.city);
  
  if (!isMockAI) {
    try {
      let localityFactsPrompt = '';
      if (profile) {
        localityFactsPrompt = `
          FACTUAL NEIGHBORHOOD FACTS for ${profile.name} (${profile.city}):
          - Key Benefits: ${profile.benefits}
          - Highlights: ${profile.highlights}
          - Nearby Areas: ${profile.nearbyAreas}
        `;
      } else {
        localityFactsPrompt = `
          No specific neighborhood facts are available in the database. 
          Use general knowledge of the city: ${property.city}, state: ${property.state} around the address: ${property.address}.
        `;
      }

      const prompt = `
        You are a helpful local real estate AI guide. You are answering a question from a prospective buyer/tenant about the location of the following property:
        
        PROPERTY DETAILS:
        - Title: ${property.title}
        - Address: ${property.address}
        - City: ${property.city}
        - State: ${property.state}
        - Type: ${property.propertyType}
        
        ${localityFactsPrompt}
        
        USER QUESTION:
        "${message}"
        
        INSTRUCTIONS:
        - Answer the user's question accurately based on the facts provided or general geographic facts of that area.
        - Give a warm, helpful, and concise response (max 3-4 sentences).
        - Focus on neighborhood details, local transit, safety, schools, hospitals, noise, or water supply as relevant.
        - Do NOT make up specific fake shops or direct street-level addresses that are not real. Be honest and premium.
      `;

      const response = await aiClient.models.generateContent({
        model: modelName,
        contents: prompt,
      });

      return response.text.trim();
    } catch (error) {
      console.error('Gemini locality Q&A failed, using fallback:', error.message);
    }
  }

  // Fallback Rule-based answering system
  const areaName = profile ? profile.name : property.city.toUpperCase();
  
  // Safety Qs
  if (query.includes('safe') || query.includes('safety') || query.includes('crime') || query.includes('night')) {
    return `${areaName} is generally considered a highly safe and secure neighborhood. It features regular police patrols, active resident welfare associations (RWAs), and well-lit main streets. Families and working professionals rate the safety at night as excellent.`;
  }
  
  // Water/Power supply
  if (query.includes('water') || query.includes('electricity') || query.includes('power') || query.includes('utility') || query.includes('supply')) {
    return `In ${areaName}, municipal water is supplied daily (usually for 2-3 hours in the morning) and most apartment complexes have 24/7 water backup tanks. Power supply is extremely stable with less than 1-2 hours of scheduled maintenance cuts per month, backed up by building-wide generators.`;
  }
  
  // Transit/Connectivity
  if (query.includes('metro') || query.includes('transit') || query.includes('connectivity') || query.includes('station') || query.includes('bus') || query.includes('airport')) {
    if (profile && profile.city === 'delhi' && profile.name.toLowerCase().includes('dwarka')) {
      return `Dwarka has excellent connectivity with over 10 metro stations on the Blue Line and Airport Express Line. It is also very close to the Indira Gandhi International Airport (approx 15-20 mins) and has well-connected bus routes.`;
    }
    if (profile && profile.city === 'mumbai' && profile.name.toLowerCase().includes('bandra')) {
      return `Bandra West offers exceptional connectivity via the Bandra-Worli Sea Link to South Mumbai, and easy access to Western Express Highway. Bandra Station connects to the Western and Harbour suburban rail networks.`;
    }
    if (profile && profile.city === 'bangalore') {
      return `The area has good public transit options including BMTC bus stops at short intervals. Major tech corridors are easily accessible via Outer Ring Road, and metro stations are in close vicinity.`;
    }
    return `The location offers robust connectivity to key transit networks. Main bus routes are within 500m, and local metro/train options are easily accessible, providing a smooth daily commute.`;
  }

  // School/Hospitals/Malls (Locality & City Contextual Fallbacks)
  if (query.includes('school') || query.includes('education') || query.includes('kid')) {
    if (profile && profile.city === 'delhi' && profile.name.toLowerCase().includes('dwarka')) {
      return `There are several top-tier schools near Dwarka, including Delhi Public School, Mount Carmel, and local international academies.`;
    }
    if (profile && profile.city === 'bangalore' && profile.name.toLowerCase().includes('hsr')) {
      return `HSR Layout features excellent education options including National Public School, Cambridge School, and various premium pre-schools nearby.`;
    }
    return `There are several reputable educational institutions and schools within a 2-3 km radius of this property in ${property.city.toUpperCase()}, making it highly convenient for families.`;
  }

  if (query.includes('hospital') || query.includes('medical') || query.includes('doctor') || query.includes('clinic')) {
    if (profile && profile.city === 'delhi' && profile.name.toLowerCase().includes('dwarka')) {
      return `Medical care is highly accessible in Dwarka, with Venkateshwar Hospital and Akash Healthcare Super Speciality Hospital within a 5-10 minute drive.`;
    }
    if (profile && profile.city === 'hyderabad' && profile.name.toLowerCase().includes('banjara')) {
      return `Banjara Hills hosts world-class medical facilities including Care Hospital and Star Hospital within minutes of the property.`;
    }
    return `Medical assistance is readily available nearby. Top clinics and multi-specialty hospitals are situated within a 5-10 minute drive of the property in ${property.city.toUpperCase()}.`;
  }

  if (query.includes('mall') || query.includes('shopping') || query.includes('market') || query.includes('grocery')) {
    if (profile && profile.city === 'delhi' && profile.name.toLowerCase().includes('dwarka')) {
      return `Daily shopping is convenient, with local sector markets and Pacific Mall in Sector 21 located close by.`;
    }
    if (profile && profile.city === 'hyderabad' && profile.name.toLowerCase().includes('kondapur')) {
      return `Shopping is extremely convenient with Sarath City Capital Mall and local supermalls within a short drive.`;
    }
    if (profile && profile.city === 'bangalore' && profile.name.toLowerCase().includes('whitefield')) {
      return `The property offers close proximity to prime shopping hubs like Phoenix Marketcity and VR Bengaluru in Whitefield.`;
    }
    return `Daily essentials and shopping are easily accessible, with supermarkets, grocery stores, and local retail centers within walking distance or a short drive.`;
  }

  // General default answer
  if (profile) {
    return `Regarding ${areaName}: it is ${profile.benefits} Highlights include: ${profile.highlights}. Please feel free to ask about nearby schools, water supply, safety, or transit!`;
  }
  return `This property in ${property.city.toUpperCase()} is located in a well-established area. It offers immediate access to local schools, hospitals, and markets. The locality is safe, has a stable water/power supply, and boasts good connectivity to commercial hubs.`;
};
