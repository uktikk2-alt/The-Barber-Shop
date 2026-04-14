
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, address, vehicle, service, message } = req.body;

  // Configuration (Hardcoded for immediate reliability, but recommend Vercel Env Vars later)
  const PIT_TOKEN = 'pit-dccdaa66-113c-4b8e-9aa7-3cb7fa260dc3';
  const LOCATION_ID = 'nOlJnVoFntM5r1fguKRB';

  try {
    console.log('Starting GHL Sync for:', email);

    // 1. Split name into first and last
    const nameParts = (name || 'Customer').trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';

    // 2. Prepare Contact Data
    // We add a Smart Tag based on the service selected to trigger specific automations
    const serviceTag = `Service: ${service || 'General'}`;
    const contactData = {
      firstName,
      lastName,
      email,
      phone,
      locationId: LOCATION_ID,
      tags: ['Website Lead', 'Custom Form', serviceTag],
      source: service || 'General Detail'
    };

    // 3. Create Contact in GHL (Using native fetch available in Node 18+)
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
      console.error('GHL Contact API Error:', contactResult);
      return res.status(contactResponse.status).json({ 
        success: false, 
        error: 'GHL API Error', 
        details: contactResult 
      });
    }

    const contactId = contactResult.contact.id;
    console.log('Contact Created Successfully:', contactId);

    // 4. Add a Note with Vehicle and Service details
    const noteContent = `
🚗 VEHICLE DETAILS:
- Make/Model: ${vehicle || 'N/A'}
- Location: ${address || 'N/A'}

🛠️ SERVICE REQUESTED:
- Service: ${service || 'General Inquiry'}

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
    console.error('Bridge Integration Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error', 
      details: error.message 
    });
  }
};
