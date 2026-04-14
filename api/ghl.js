const fetch = require('node-fetch');

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, address, vehicle, service, message } = req.body;

  // Configuration
  const PIT_TOKEN = process.env.GHL_PIT_TOKEN || 'pit-dccdaa66-113c-4b8e-9aa7-3cb7fa260dc3';
  const LOCATION_ID = process.env.GHL_LOCATION_ID || 'nOlJnVoFntM5r1fguKRB';

  try {
    // 1. Split name into first and last
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Customer';

    // 2. Prepare Contact Data
    const contactData = {
      firstName,
      lastName,
      email,
      phone,
      locationId: LOCATION_ID,
      tags: ['Website Lead', 'Custom Form'],
      source: 'Website Custom Booking Form'
    };

    // 3. Create Contact in GHL
    const contactResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PIT_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    const contactResult = await contactResponse.json();

    if (!contactResponse.ok) {
      console.error('GHL Contact Error:', contactResult);
      throw new Error(contactResult.message || 'Failed to create contact in GHL');
    }

    const contactId = contactResult.contact.id;

    // 4. Add a Note with Vehicle and Service details
    const noteContent = `
      🚗 VEHICLE DETAILS:
      - Make/Model: ${vehicle}
      - Location: ${address}
      
      🛠️ SERVICE REQUESTED:
      - Service: ${service}
      
      📝 MESSAGE:
      - ${message || 'No message provided'}
    `.trim();

    await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PIT_TOKEN}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ body: noteContent })
    });

    return res.status(200).json({ success: true, contactId });

  } catch (error) {
    console.error('Integration Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
};
