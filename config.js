/**
 * SITE_CONFIG: Central Business Logic & Branding
 * Update this object to deploy the template for a new client.
 */
window.SITE_CONFIG = {
  branding: {
    businessName: "Scuderia Auto Detailing",
    tagline: "Preserving Prestige",
    metaDescription: "Welcome to Scuderia Auto Detailing in Lincoln, England. Premium auto care services restoring your vehicle's showroom glory with Italian motorsports passion.",
    logoWhite: "assets/Logo/scuderia-logo-main.png", 
    logoColor: "assets/Logo/scuderia-logo-main.png",
    colors: {
      primary: "#c81017", // Scuderia Red
      dark: "#000000",
      white: "#ffffff"
    }
  },
  
  contact: {
    phone: "+44 7308742727",
    phoneNumeric: "+447308742727",
    email: "info@scuderiaautodetailing.co.uk",
    location: "Lincoln, England (15-Mile Mobile Range)",
    googleMapsUrl: "https://maps.google.com/maps?q=Lincoln,England",
    bookingUrl: "#contact"
  },

  hero: {
    badge: "ITALIAN ESSENCE",
    titleWords: ["PRESERVING", "PRESTIGE"],
    highlightWord: "PRESTIGE",
    subtitle: "Automotive excellence meets unparalleled care. Restoring showroom glory to your pride and joy."
  },

  options: {
    showServicesToggle: true,
    maxVisibleServices: 4,
    currencySymbol: "£"
  },

  services: [
    {
      id: "intera-premio",
      title: "Intera Premio",
      price: "From £130",
      description: "The Full Premium Package. Includes Atom Mac Brake Protector, Full Decontamination (Tar/Glue/Clay), Sealant Application, and UV Interior Protection. Perfect for supercars and vintage maintenance.",
      image: "assets/gallery/scuderia-p1.png"
    },
    {
      id: "intera-base-extra",
      title: "Intera Base Extra",
      price: "From £110",
      description: "The Full Basic Extra. Includes Partial Decontamination, Booth/Door Seal cleaning, and deep air vent detailing. Ideal for vehicles needing restoration without full ceramic protection.",
      image: "assets/gallery/scuderia-p2.png"
    },
    {
      id: "intera-base",
      title: "Intera Base",
      price: "From £90",
      description: "Full Basic Package. Near-showroom standard for previously valeted vehicles. Includes wheel fallout removal, pH neutral wash, and leather conditioning.",
      image: "assets/gallery/scuderia-p3.png"
    },
    {
      id: "intera-maintenance",
      title: "Intera Maintenance",
      price: "From £55",
      description: "Fortnightly (£55+) or Monthly (£75+) upkeep. Only available to vehicles that have had a Full Premium Package within the last 4 weeks. Soft detailing brushes and pH neutral care.",
      image: "assets/gallery/scuderia-p4.png"
    }
  ],

  extraServices: [
    {
      id: "fuori",
      title: "Fuori Exterior",
      price: "£40 - £60",
      description: "Pure Exterior Valet. Wheel fallout removal, pH neutral pre-wash, glass cleaning, and exhaust polishing. Upcharge available for ceramic sealant (+£15).",
      image: "assets/gallery/scuderia-p5.jpg"
    },
    {
      id: "dentro",
      title: "Dentro Interior",
      price: "£60 - £80",
      description: "Pure Interior Valet. Steamer on stains, compressor deep-clean, leather conditioning. UV protectant upcharge available (+£15).",
      image: "assets/gallery/scuderia-p6.jpg"
    },
    {
      id: "motore",
      title: "Motore Engine Bay",
      price: "£40",
      description: "Full Engine Bay Detail. Leaves/dust blown out, APC cleaning, underside of bonnet polished, and plastic trims dressed.",
      image: "assets/gallery/scuderia-p7.jpg"
    }
  ],

  gallery: [
    { image: "assets/gallery/scuderia-p1.png", category: "exterior" },
    { image: "assets/gallery/scuderia-p2.png", category: "exterior" },
    { image: "assets/gallery/scuderia-p3.png", category: "exterior" },
    { image: "assets/gallery/scuderia-p4.jpg", category: "maintenance" },
    { image: "assets/gallery/scuderia-p5.jpg", category: "exterior" },
    { image: "assets/gallery/scuderia-p6.jpg", category: "interior" },
    { image: "assets/gallery/scuderia-p7.jpg", category: "engine" },
    { image: "assets/gallery/scuderia-p8.png", category: "ceramic" },
    { image: "assets/gallery/scuderia-p9.png", category: "exterior" }
  ],
  
  team: [
    {
      name: "Michel",
      role: "OWNER & LEAD DETAILER",
      phone: "+44 7308742727",
      image: "assets/gallery/Michel.png"
    }
  ],

  reviews: [
    {
      name: "Valet Customer",
      role: "Verified Client",
      quote: "Absolutely thrilled with the results. It is as if it just came out of the showroom. Michele was fantastic, punctual, and worked really hard. Highly recommend.", 
      avatar: "https://i.pravatar.cc/150?u=scuderia-1"
    }
  ],

  integrations: {
    ghlChatWidgetId: "69de59fb2676eaf85eb99f86",
    leadConnectorWebhook: "",
    googleAnalyticsId: "",
    aiAgentContext: "Scuderia Auto Detailing is a premium mobile detailing service in Lincoln, England, founded by Michel. With deep Italian heritage and motorsports passion, we deliver showroom-quality valeting. Mobile coverage is 15 miles from Lincoln; additional travel is priced at 25p per mile."
  }
};
