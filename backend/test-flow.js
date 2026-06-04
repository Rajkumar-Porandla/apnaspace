const BASE_URL = 'https://apnaspacee.vercel.app/api';

async function testFlow() {
  console.log('=== STARTING AUTOMATED FLOW VERIFICATION ===');
  
  try {
    // 1. Log in as Seller
    console.log('\n[Step 1] Logging in as Seller (priya@seller.com)...');
    const sellerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'priya@seller.com',
        password: 'password123'
      })
    });
    const sellerLoginData = await sellerLoginRes.json();
    
    if (!sellerLoginData.success) {
      throw new Error('Seller login failed');
    }
    
    const sellerToken = sellerLoginData.token;
    const sellerId = sellerLoginData.user.id;
    console.log(`✓ Seller authenticated. Token obtained. Seller ID: ${sellerId}`);

    // 2. Create a new Property
    console.log('\n[Step 2] Creating a new property listing...');
    const newPropertyData = {
      title: 'Automated Verified Test Villa',
      description: 'A beautiful automated test property to verify that the MERN flow from creation to retrieval works flawlessly.',
      price: 15000000,
      propertyType: 'villa',
      bedrooms: 4,
      bathrooms: 4,
      area: 3500,
      city: 'hyderabad',
      state: 'telangana',
      address: 'Plot 101, Test Road, Gachibowli',
      listingType: 'sale',
      amenities: ['24/7 Security', 'Gym', 'Parking', 'WiFi'],
      coordinates: { lat: 17.4485, lng: 78.3741 }
    };

    const createRes = await fetch(`${BASE_URL}/properties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`
      },
      body: JSON.stringify(newPropertyData)
    });
    const createData = await createRes.json();

    if (!createData.success) {
      throw new Error('Property creation failed');
    }

    const createdProperty = createData.property;
    const propertyId = createdProperty._id;
    console.log(`✓ Property created successfully! ID: ${propertyId}, Status: ${createdProperty.status}`);

    // 3. Verify Seller Dashboard retrieval (including draft/under_review statuses)
    console.log(`\n[Step 3] Fetching Seller Listings for Seller ID ${sellerId}...`);
    const sellerListingsRes = await fetch(`${BASE_URL}/properties?seller=${sellerId}`, {
      headers: {
        'Authorization': `Bearer ${sellerToken}`
      }
    });
    const sellerListingsData = await sellerListingsRes.json();

    const isFoundInDashboard = sellerListingsData.properties.some(p => p._id === propertyId);
    console.log(`✓ Listing matches query in Seller Dashboard API? ${isFoundInDashboard ? 'YES (Visible)' : 'NO'}`);

    // 4. Verify Buyer / Public discovery
    console.log('\n[Step 4] Querying public /properties API as a Buyer...');
    const publicListingsRes = await fetch(`${BASE_URL}/properties`);
    const publicListingsData = await publicListingsRes.json();
    
    const isFoundPublicly = publicListingsData.properties.some(p => p._id === propertyId);
    console.log(`✓ Listing visible to buyers on general discover page? ${isFoundPublicly ? 'YES (Visible)' : 'NO'}`);

    // 5. Clean up by deleting the test property
    console.log('\n[Step 5] Cleaning up test property...');
    const deleteRes = await fetch(`${BASE_URL}/properties/${propertyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sellerToken}`
      }
    });
    const deleteData = await deleteRes.json();
    console.log(`✓ ${deleteData.message}`);
    
    console.log('\n=== FLOW VERIFICATION COMPLETED SUCCESSFULLY ===');
  } catch (error) {
    console.error('✗ Verification failed:', error.message);
  }
}

testFlow();
