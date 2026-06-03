// Factual Real Estate Locality Profiles Database to prevent AI hallucination
const localities = {
  // Hyderabad Localities
  'gachibowli': {
    name: 'Gachibowli',
    city: 'hyderabad',
    benefits: 'A major IT and software corporate hub in Hyderabad. Home to massive tech campuses like Microsoft, Infosys, and Wipro. Located right along the Outer Ring Road (ORR) offering seamless airport connectivity, and features major academic centres like the University of Hyderabad and ISB.',
    nearbyAreas: 'Financial District, Nanakramguda, Madhapur, Hitech City, Kondapur',
    highlights: 'Excellent corporate tech hubs proximity, high rental yield, international schools, premium sports complexes (Gachibowli Stadium).'
  },
  'banjara hills': {
    name: 'Banjara Hills',
    city: 'hyderabad',
    benefits: 'One of the most premium, upscale residential and commercial areas in Hyderabad. Features luxury retail centers like GVK One Mall, world-class hospitals (Care, Star), fine-dining venues, and beautiful leafy streets.',
    nearbyAreas: 'Jubilee Hills, Somajiguda, Panjagutta, Masab Tank',
    highlights: 'Elite high-end residential neighborhood, excellent infrastructure, central city connection, premium retail shopping and dining.'
  },
  'jubilee hills': {
    name: 'Jubilee Hills',
    city: 'hyderabad',
    benefits: 'An extremely affluent residential area housing Telugu film industry studios, celebrities, politicians, and top business professionals. Features high-end gyms, designer boutiques, cafes, and proximity to KBR National Park.',
    nearbyAreas: 'Banjara Hills, Madhapur, Yousufguda, Hitech City',
    highlights: 'VIP residential sector, abundant green spaces (KBR Park), vibrant nightlife, designer fashion outlets, premium club memberships.'
  },
  'kondapur': {
    name: 'Kondapur',
    city: 'hyderabad',
    benefits: 'A highly sought-after residential locality for tech professionals due to its immediate proximity to Hitech City and Gachibowli. Offers great shopping centers (Sharath City Capital Mall), supermarkets, and standard schools.',
    nearbyAreas: 'Hitech City, Gachibowli, Miyapur, Hafeezpet, Madhapur',
    highlights: 'Budget to mid-range premium apartments, walking distance to Botanical Gardens, excellent utility stores density.'
  },
  'hitech city': {
    name: 'Hitech City',
    city: 'hyderabad',
    benefits: 'The center of Hyderabad\'s IT revolution. Houses major tech parks like Cyber Gateway, Cyber Towers, and Mindspace IT Park. Boasts excellent metro connectivity and extensive multi-national commercial activity.',
    nearbyAreas: 'Madhapur, Kondapur, Gachibowli, Kukatpally',
    highlights: 'Mindspace IT Park, Hitech City Metro Station, high-rise luxury apartments, walking distance to offices.'
  },

  // Delhi Localities
  'dwarka': {
    name: 'Dwarka',
    city: 'delhi',
    benefits: 'One of the largest, well-planned residential sub-cities in Asia. Features wide roads, dedicated sector markets, and robust metro connectivity (Blue Line and Airport Express). Very close to IGI Airport and Dwarka Expressway.',
    nearbyAreas: 'Janakpuri, Palam, Gurgaon, Vasant Kunj',
    highlights: 'Sub-city planning, 10+ metro stations, top schools (Delhi Public School, Mount Carmel), proximity to Gurgaon and Airport.'
  },

  // Mumbai Localities
  'bandra west': {
    name: 'Bandra West',
    city: 'mumbai',
    benefits: 'The premium coastal suburb of Mumbai. Known as the Queen of Suburbs. Connected to South Mumbai via the Bandra-Worli Sea Link. Features scenic coastal promenades like Carter Road and Bandstand, and immediate proximity to the Bandra-Kurla Complex (BKC) financial hub.',
    nearbyAreas: 'Bandra East, Khar, Santacruz, Mahim',
    highlights: 'Bandra-Worli Sea Link, Carter Road promenade, BKC corporate center, premium schools, high fashion boutiques.'
  },

  // Bangalore Localities
  'hsr layout': {
    name: 'HSR Layout',
    city: 'bangalore',
    benefits: 'A popular residential and startup hub in South Bangalore. Very well-planned with wide tree-lined avenues and parks. Immediate connectivity to the Outer Ring Road (ORR), Sarjapur Road, and Electronic City IT corridors.',
    nearbyAreas: 'Koramangala, BTM Layout, Bellandur, Sarjapur',
    highlights: 'Startup headquarters hub, abundant parks and cafes, top schools (National Public School), wide sector grid roads.'
  },
  'whitefield': {
    name: 'Whitefield',
    city: 'bangalore',
    benefits: 'A massive IT and residential hub in East Bangalore. Features major tech parks like ITPB (International Tech Park Bangalore), large shopping malls (Phoenix Marketcity, VR Bengaluru), and direct Metro connectivity.',
    nearbyAreas: 'Brookefield, Hoodi, Marathahalli, Varthur',
    highlights: 'ITPB Tech Park, Whitefield Metro, major international schools, luxury high-rise gated communities.'
  }
};

module.exports = localities;
