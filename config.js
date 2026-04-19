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
      dark: "#0A0A0A",
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
      id: "the-scuderia-signature",
      title: "THE SCUDERIA SIGNATURE",
      price: "From £130",
      description: "Our flagship automotive preservation. Includes Atom Mac Brake Protector, full chemical decontamination, precision sealant, and UV interior shielding. Perfect for high-performance vehicles.",
      image: "assets/gallery/scuderia-p1.webp"
    },
    {
      id: "the-precision-plus",
      title: "THE PRECISION PLUS",
      price: "From £110",
      description: "Engineered for excellence. Includes partial decontamination, booth/door seal detailing, and deep vent extraction. Ideal for deep restoration without full ceramic commitment.",
      image: "assets/gallery/scuderia-p2.webp"
    },
    {
      id: "the-heritage-revival",
      title: "THE HERITAGE REVIVAL",
      price: "From £90",
      description: "Restoring the soul of your vehicle. Near-showroom standard including wheel fallout removal, pH-neutral delicate wash, and premium leather conditioning.",
      image: "assets/gallery/scuderia-p3.webp"
    },
    {
      id: "the-chrono-care",
      title: "THE CHRONO CARE",
      price: "From £55",
      description: "Precision upkeep for the dedicated owner. Available for vehicles maintained by us within the last 4 weeks. Features pH-neutral care and artisan detailing brushes.",
      image: "assets/gallery/scuderia-p4.webp"
    },
    {
      id: "exterior-opulence",
      title: "EXTERIOR OPULENCE",
      price: "£40 - £60",
      description: "Pure external aesthetic mastery. Full chemical decontamination, pH-neutral pre-wash, glass clarity treatment, and precision exhaust tip polishing.",
      image: "assets/gallery/scuderia-p5.webp"
    },
    {
      id: "interior-sanctuary",
      title: "INTERIOR SANCTUARY",
      price: "£60 - £80",
      description: "Transform your driving environment. High-pressure steam extraction, compressor deep-clean, and premium leather enrichment for a factory-fresh feel.",
      image: "assets/gallery/scuderia-p6.webp"
    },
    {
      id: "cubatura-detail",
      title: "CUBATURA DETAIL",
      price: "£40",
      description: "A mechanical masterpiece deserves a clean stage. Full engine bay detail including debris extraction, APC precision cleaning, and bonnet polish.",
      image: "assets/gallery/scuderia-p7.webp"
    }
  ],

  gallery: [
    { image: "assets/gallery/scuderia-p1.webp", category: "exterior" },
    { image: "assets/gallery/scuderia-p2.webp", category: "exterior" },
    { image: "assets/gallery/scuderia-p3.webp", category: "exterior" },
    { image: "assets/gallery/scuderia-p4.webp", category: "maintenance" },
    { image: "assets/gallery/scuderia-p5.webp", category: "exterior" },
    { image: "assets/gallery/scuderia-p6.webp", category: "interior" },
    { image: "assets/gallery/scuderia-p7.webp", category: "engine" },
    { image: "assets/gallery/scuderia-p8.webp", category: "ceramic" },
    { image: "assets/gallery/scuderia-p9.webp", category: "exterior" }
  ],
  
  team: [
    {
      name: "Michel",
      role: "OWNER & LEAD DETAILER",
      phone: "+44 7308742727",
      image: "assets/gallery/Michel.webp"
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
