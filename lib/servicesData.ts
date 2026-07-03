export interface ServiceItem {
  name: string;
  price: number;
  popular?: boolean;
  duration?: string;
  group?: string;
  desc?: string;
}

export interface Category {
  id: string; label: string; desc: string;
  icon: string; color: string;
  imgs: string[];
  homeService: boolean;
  gender: "female" | "male" | "both";
  services: ServiceItem[];
}

export const allCategories: Category[] = [
  /* ─── 1. WAXING ─────────────────────────────────────────────────────── */
  {
    id: "wax", label: "Waxing", icon: "◎", color: "#f9f5e8",
    imgs: [
      "https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    ],
    homeService: true, gender: "female",
    desc: "Smooth, long-lasting hair removal with premium wax",
    services: [
      /* Honey Wax */
      { name: "Full Arms + Underarms",                 price: 300,  duration: "30 mins",      group: "Honey Wax" },
      { name: "Full Legs",                             price: 450,  duration: "30 mins",      group: "Honey Wax" },
      { name: "Half Legs",                             price: 300,  duration: "15 mins",      group: "Honey Wax" },
      { name: "Underarms",                             price: 100,  duration: "10 mins",      group: "Honey Wax" },
      { name: "Stomach",                               price: 350,  duration: "25 mins",      group: "Honey Wax" },
      { name: "Full Back",                             price: 500,  duration: "35 mins",      group: "Honey Wax" },
      { name: "Half Back",                             price: 300,  duration: "20 mins",      group: "Honey Wax" },
      { name: "Full Body (Arms, Legs, Back, Stomach)", price: 1400, duration: "2 hr 10 mins", group: "Honey Wax", popular: true },
      /* White Chocolate Wax */
      { name: "Full Arms + Underarms",                 price: 350,  duration: "30 mins",      group: "White Chocolate Wax" },
      { name: "Half Legs",                             price: 350,  duration: "15 mins",      group: "White Chocolate Wax" },
      { name: "Full Legs",                             price: 650,  duration: "30 mins",      group: "White Chocolate Wax" },
      { name: "Underarms",                             price: 150,  duration: "10 mins",      group: "White Chocolate Wax" },
      { name: "Stomach",                               price: 350,  duration: "25 mins",      group: "White Chocolate Wax" },
      { name: "Half Back",                             price: 350,  duration: "20 mins",      group: "White Chocolate Wax" },
      { name: "Full Back",                             price: 600,  duration: "35 mins",      group: "White Chocolate Wax" },
      { name: "Full Body (Arms, Legs, Back, Stomach)", price: 1800, duration: "2 hr 10 mins", group: "White Chocolate Wax", popular: true },
      /* Rica Wax */
      { name: "Full Arms + Underarms",                 price: 450,  duration: "30 mins",      group: "Rica Wax" },
      { name: "Half Legs",                             price: 450,  duration: "15 mins",      group: "Rica Wax" },
      { name: "Full Legs",                             price: 900,  duration: "30 mins",      group: "Rica Wax", popular: true },
      { name: "Underarms",                             price: 200,  duration: "10 mins",      group: "Rica Wax" },
      { name: "Stomach",                               price: 450,  duration: "25 mins",      group: "Rica Wax" },
      { name: "Half Back",                             price: 400,  duration: "20 mins",      group: "Rica Wax" },
      { name: "Full Back",                             price: 700,  duration: "35 mins",      group: "Rica Wax" },
      { name: "Full Body (Arms, Legs, Back, Stomach)", price: 2400, duration: "2 hr 10 mins", group: "Rica Wax", popular: true },
      { name: "Bikini Wax (Back & Front)",             price: 2000, duration: "1 hr",         group: "Rica Wax" },
    ],
  },

  /* ─── 2. D-TAN & BLEACH ─────────────────────────────────────────────── */
  {
    id: "dtan-bleach", label: "D-Tan & Bleach", icon: "◈", color: "#f0f4f9",
    imgs: [
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80",
    ],
    homeService: true, gender: "both",
    desc: "Tan removal & skin brightening for an even, radiant complexion",
    services: [
      /* D-Tan */
      { name: "Sara D-Tan",    price: 250, duration: "20 mins", group: "D-Tan" },
      { name: "Ozone D-Tan",   price: 300, duration: "20 mins", group: "D-Tan" },
      { name: "Raga D-Tan",    price: 300, duration: "20 mins", group: "D-Tan" },
      { name: "O3 D-Tan",      price: 500, duration: "20 mins", group: "D-Tan", popular: true },
      /* Face Bleach */
      { name: "Fem Bleach",     price: 250, duration: "20 mins", group: "Face Bleach" },
      { name: "Diamond Bleach", price: 250, duration: "20 mins", group: "Face Bleach" },
      { name: "Oxy Bleach",     price: 300, duration: "20 mins", group: "Face Bleach" },
      { name: "D-Tan Bleach",   price: 350, duration: "20 mins", group: "Face Bleach" },
      { name: "Protein Bleach", price: 500, duration: "20 mins", group: "Face Bleach" },
      { name: "O3 Bleach",      price: 500, duration: "20 mins", group: "Face Bleach", popular: true },
      /* Body Bleach */
      { name: "Full Back + Neck Bleach",      price: 500,  duration: "30 mins",      group: "Body Bleach" },
      { name: "Full Arms + Full Legs Bleach", price: 800,  duration: "40 mins",      group: "Body Bleach", popular: true },
      { name: "Full Body Bleach",             price: 2000, duration: "2 hr 10 mins", group: "Body Bleach" },
    ],
  },

  /* ─── 3. CLEANUPS ───────────────────────────────────────────────────── */
  {
    id: "cleanup", label: "Cleanups", icon: "◉", color: "#eef5f0",
    imgs: [
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80",
    ],
    homeService: true, gender: "both",
    desc: "Instantly fresh, glowing skin with signature cleanup treatments",
    services: [
      {
        name: "VLCC Cleanup", price: 600, duration: "35 mins", popular: true,
        desc: "Deeply cleanses & exfoliates · Reduces dark spots · Removes sun tan · All skin types",
      },
      {
        name: "Twacha Brightening Cleanup", price: 700, duration: "35 mins",
        desc: "Deep hydration · Controls excess oil · Tightens open pores · All skin types",
      },
      {
        name: "Nature's Fruit Cleanup", price: 800, duration: "35 mins",
        desc: "Corrects dark spots/pigmentation · Improves dull skin · Boosts hydration · All skin types",
      },
    ],
  },

  /* ─── 4. FACIALS ────────────────────────────────────────────────────── */
  {
    id: "facial", label: "Facials", icon: "✦", color: "#f9f0e0",
    imgs: [
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80",
    ],
    homeService: true, gender: "both",
    desc: "Advanced skin treatments for radiant, glowing, youthful skin",
    services: [
      {
        name: "Twacha Vitamin C Facial", price: 800, duration: "55 mins",
        desc: "Skin brightening · Collagen boost · Fades dark spots · All skin types",
      },
      {
        name: "Ozone Xpress White Facial", price: 800, duration: "45 mins",
        desc: "Flawless radiant white complexion · Reduces uneven pigmentation · All skin types",
      },
      {
        name: "Ozone Radiant Platinum Facial", price: 1000, duration: "55 mins", popular: true,
        desc: "Clear & bright skin · Tight pores · Boosts elasticity · All skin types",
      },
      {
        name: "Lotus Radiant Purity Glow Facial", price: 1200, duration: "1 hr",
        desc: "Lightens dark spots · Reduces sun damage · Brightens skin · Normal to combination/dry skin",
      },
      {
        name: "Lotus RETEMIN Plant Retinol + Vitamin C", price: 1500, duration: "1 hr 10 mins", popular: true,
        desc: "Lightens hyperpigmentation · Evens skin tone · Prevents fine lines · All skin types",
      },
      {
        name: "Aroma Vitamin C Brightening Facial", price: 1500, duration: "1 hr 5 mins",
        desc: "Deeply exfoliates · Promotes cell regeneration · Reduces sun burn · All skin types",
      },
      {
        name: "Lotus Ulayeus Advanced Anti-Ageing Facial", price: 1800, duration: "1 hr 20 mins", popular: true,
        desc: "Improves firmness & elasticity · Reduces fine lines & age spots · All skin types",
      },
      {
        name: "O3+ Shine & Glow Facial", price: 2000, duration: "1 hr 10 mins",
        desc: "Hydrated & plump skin · Boosts skin health · Removes skin fatigue · All skin types",
      },
      {
        name: "O3+ Bridal Facial (Vitamin C Glowing Skin)", price: 2500, duration: "1 hr 40 mins", popular: true,
        desc: "Instant glowing skin · Intensive hydration & moisturization · Removes dark spots · Normal to combination skin",
      },
    ],
  },

  /* ─── 5. JAPANESE RITUALS ───────────────────────────────────────────── */
  {
    id: "japanese", label: "Japanese Rituals", icon: "✿", color: "#f0ecf8",
    imgs: [
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
    ],
    homeService: true, gender: "female",
    desc: "Luxurious multi-step Japanese beauty rituals for transformative results",
    services: [
      /* Kanpeki Puro Labs */
      {
        name: "Hydra Shine Facial",               price: 1500, duration: "1 hr 5 mins",  group: "Kanpeki Puro Labs",
        desc: "Hydration and tan removal · For dry, normal and combination skin",
      },
      {
        name: "Pure Bright Facial",               price: 1500, duration: "1 hr 15 mins", group: "Kanpeki Puro Labs",
        desc: "Removes uneven tone, pigmentation & enlarged pores · For oily and acne-prone skin",
      },
      {
        name: "Ivory White (Vitamin C Shine)",    price: 1500, duration: "1 hr 15 mins", group: "Kanpeki Puro Labs",
        desc: "Targets hyperpigmentation, dark spots & sun-tan · All skin types",
      },
      {
        name: "Glass Glow Skin Facial",           price: 3000, duration: "1 hr 50 mins", group: "Kanpeki Puro Labs", popular: true,
        desc: "11-step ritual · Brightening, hydrating & nourishing · All skin types",
      },
      {
        name: "Bridal Bright Vitamin C Facial",   price: 3500, duration: "1 hr 50 mins", group: "Kanpeki Puro Labs",
        desc: "10-step ritual · Brightening, lightening & firming · All skin types",
      },
      /* Kanpeki Dermasyl */
      {
        name: "Blanch (Skin Whitening Facial)",   price: 3500, duration: "1 hr 40 mins", group: "Kanpeki Dermasyl",
        desc: "10-step ritual · Skin whitening & brightening · Treats hyperpigmentation, melasma & dark spots · All skin types",
      },
      /* Kanpeki Japanese Professional Range */
      {
        name: "Save the Date (Pre-Wedding)",      price: 4500, duration: "2 hr",         group: "Kanpeki Japanese Professional", popular: true,
        desc: "11-step radiance-enhancing facial · Inspired by pre-wedding rituals of India & Japan · All skin types",
      },
      /* Kanpeki Gensyl */
      {
        name: "Papaya & Marshmallow Facial",      price: 3500, duration: "2 hr 40 mins", group: "Kanpeki Gensyl",
        desc: "9-step ritual · Retains moisture, soothes redness & relieves inflammation · All skin types",
      },
      {
        name: "Jamaican Sorrel Facial",           price: 3500, duration: "2 hr 40 mins", group: "Kanpeki Gensyl",
        desc: "9-step ritual · Refreshes & purifies complexion · Boosts hydration & improves elasticity · All skin types",
      },
      /* Kanpeki Furutou */
      {
        name: "Quinoa Whitening Facial",          price: 2500, duration: "1 hr 20 mins", group: "Kanpeki Furutou",
        desc: "8-step ritual · For dull skin, sun damage & melanin over-production · All skin types",
      },
      {
        name: "Avocado Glow & Shine Facial",      price: 2500, duration: "1 hr 15 mins", group: "Kanpeki Furutou",
        desc: "7-step ritual · Skin brightening, fades blemishes · For combination and oily skin",
      },
      {
        name: "Luxe Chocolate Whitening Facial",  price: 2500, duration: "1 hr 15 mins", group: "Kanpeki Furutou",
        desc: "7-step ritual · Brightening & radiant skin · All skin types",
      },
      {
        name: "Raw Mango Acne Purification",      price: 2500, duration: "1 hr 15 mins", group: "Kanpeki Furutou",
        desc: "7-step ritual · Controls sebaceous glands, maintains hydration & evens skin tone · All skin types",
      },
      /* Gasmara */
      {
        name: "Gasmara Facial (6-Phase)",         price: 4500, duration: "2 hr 55 mins", group: "Gasmara", popular: true,
        desc: "Personalized complete facial treatment in 6 phases · From Spain · Deep hydration, detoxification & anti-ageing",
      },
    ],
  },

  /* ─── 6. MANICURE & PEDICURE ─────────────────────────────────────── */
  {
    id: "mani-pedi", label: "Manicure & Pedicure", icon: "◇", color: "#fef0f8",
    imgs: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
    ],
    homeService: true, gender: "female",
    desc: "Professional nail care and hand & foot spa treatments",
    services: [
      { name: "Classic Manicure",       price: 350,  duration: "25 mins",     group: "Classic",       desc: "Classic nail care · Nail shaping & cuticle care · Relaxing hand massage · Polish application" },
      { name: "Classic Pedicure",       price: 600,  duration: "35 mins",     group: "Classic",       desc: "Classic foot care · Foot soak & nail care · Cuticle care · Foot scrub & massage" },
      { name: "Fruit Manicure",         price: 450,  duration: "35 mins",     group: "Fruit",         desc: "Fruit-infused nail care · Nourishing & refreshing · Hand massage · Polish application" },
      { name: "Fruit Pedicure",         price: 650,  duration: "45 mins",     group: "Fruit",         desc: "Fruit foot spa · Nourishing soak & exfoliation · Relaxing foot massage & pack" },
      { name: "Twacha Manicure",        price: 550,  duration: "35 mins",     group: "Twacha",        desc: "4-step Twacha treatment · Deep conditioning · Nail care · Nourishing herbal hand massage" },
      { name: "Twacha Pedicure",        price: 750,  duration: "45 mins",     group: "Twacha",        desc: "4-step Twacha treatment · Foot soak & exfoliation · Twacha herbal softening massage" },
      { name: "Pediple Manicure",       price: 650,  duration: "40 mins",     group: "Pediple",       desc: "5-step deep treatment · Nail shaping & cuticle care · Deep moisturizing massage" },
      { name: "Pediple Pedicure",       price: 850,  duration: "55 mins",     group: "Pediple",       desc: "5-step deep treatment · Foot soak & scrub · Exfoliation · Deep moisturizing" },
      { name: "Lotus Crystal Manicure", price: 750,  duration: "40 mins",     group: "Lotus Crystal", popular: true, desc: "6-step luxury treatment · Crystal brightening · Lotus nail care & deep moisturizing" },
      { name: "Lotus Crystal Pedicure", price: 1250, duration: "1 hr 5 mins", group: "Lotus Crystal", desc: "6-step luxury foot spa · Crystal exfoliation · Lotus deep nourishing massage & pack" },
      { name: "Biotique Manicure",      price: 750,  duration: "40 mins",     group: "Biotique",      desc: "7-step herbal treatment · Botanical nail care · Biotique strengthening herbal formula" },
      { name: "Biotique Pedicure",      price: 1250, duration: "1 hr 5 mins", group: "Biotique",      popular: true, desc: "7-step herbal foot spa · Detox foot soak · Biotique herbal massage & pack" },
    ],
  },

  /* ─── 7. BODY SERVICES ────────────────────────────────────────────── */
  {
    id: "body", label: "Body Services", icon: "❋", color: "#edf8f2",
    imgs: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
    ],
    homeService: true, gender: "both",
    desc: "Relaxing and rejuvenating full-body massage & polishing treatments",
    services: [
      {
        name: "Oil Body Massage",        price: 1500, duration: "1 hr",
        desc: "Relieves muscle tension & stiffness · Improves blood circulation · Eases body aches & fatigue · Enhances flexibility and mobility",
      },
      {
        name: "Almond Oil Body Massage", price: 2000, duration: "1 hr 10 mins", popular: true,
        desc: "Deeply nourishes & hydrates skin · Promotes relaxation & reduces stress · Enhances skin elasticity & suppleness · Leaves body feeling calm, refreshed & revitalized",
      },
      {
        name: "Body Polishing",          price: 3000, duration: "1 hr 35 mins", popular: true,
        desc: "Includes cleansing, scrubbing, massage & pack · Gently exfoliates dead skin cells · Brightens & evens skin tone · Deeply hydrates & nourishes · Ideal for special occasions",
      },
    ],
  },

  /* ─── 8. HAIR SPA ──────────────────────────────────────────────────── */
  {
    id: "hair-spa", label: "Hair Spa", icon: "⊛", color: "#fff4ec",
    imgs: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560869713-bf7cf9799ed7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80",
    ],
    homeService: true, gender: "both",
    desc: "Nourishing spa treatments for healthy, frizz-free, shiny hair",
    services: [
      {
        name: "Streax Hair Spa",        price: 880,  duration: "50 mins",
        desc: "Deeply nourishes & conditions hair · Repairs dry & damaged hair · Strengthens from root to tip · Adds softness, smoothness & shine · Relaxing scalp massage",
      },
      {
        name: "Loreal Hair Spa",        price: 1200, duration: "50 mins", popular: true,
        desc: "Deeply nourishes & conditions hair · Controls frizz & improves manageability · Strengthens from root to tip · Relaxing scalp massage for stress relief",
      },
      {
        name: "Wella Dandruff Hair Spa", price: 1500, duration: "50 mins",
        desc: "Wella professional formula · Deeply cleanses & refreshes scalp · Helps reduce dandruff & flaky scalp · Soothes scalp irritation & itching · Promotes a healthier scalp environment",
      },
      {
        name: "Schwarzkopf Hair Spa",   price: 1800, duration: "50 mins", popular: true,
        desc: "Deeply nourishes & conditions hair · Strengthens from root to tip · Adds softness, smoothness & shine · Controls frizz & improves manageability",
      },
    ],
  },

  /* ─── 9. HAIR COLOR ───────────────────────────────────────────────── */
  {
    id: "hair-color", label: "Hair Color", icon: "◆", color: "#f5ecff",
    imgs: [
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    ],
    homeService: true, gender: "female",
    desc: "Professional hair coloring with premium salon brands at your doorstep",
    services: [
      /* Root Touchup */
      { name: "Streax",                     price: 1000, duration: "35 mins",     group: "Root Touchup",                 desc: "Root coverage · Vibrant & long-lasting color · Ammonia-based professional formula" },
      { name: "Matrix",                     price: 1200, duration: "35 mins",     group: "Root Touchup",                 desc: "Root coverage · Rich color blend · Professional Matrix formula" },
      { name: "Loreal Majirel",             price: 1500, duration: "35 mins",     group: "Root Touchup", popular: true,  desc: "Root coverage · Superior grey coverage · Loreal Majirel professional formula" },
      { name: "Loreal INOA (Ammonia Free)", price: 1800, duration: "35 mins",     group: "Root Touchup",                 desc: "Root coverage · 100% ammonia free · Gentle on scalp · Natural & vibrant result" },
      { name: "Schwarzkopf",                price: 2000, duration: "35 mins",     group: "Root Touchup",                 desc: "Root coverage · Rich & even color · Schwarzkopf professional formula" },
      /* Global Color */
      { name: "Streax",                     price: 3000, duration: "1 hr 5 mins", group: "Global Color (Shoulder Length)",  desc: "Full head color · Shoulder length coverage · Vibrant long-lasting finish" },
      { name: "Loreal Majirel",             price: 3500, duration: "1 hr 5 mins", group: "Global Color (Shoulder Length)", popular: true, desc: "Full head color · Loreal Majirel formula · Superior coverage & shine" },
      { name: "Loreal INOA (Ammonia Free)", price: 4000, duration: "1 hr 5 mins", group: "Global Color (Shoulder Length)",  desc: "Full head color · 100% ammonia free · Gentle & vibrant result" },
      { name: "Schwarzkopf",                price: 5000, duration: "1 hr 5 mins", group: "Global Color (Shoulder Length)",  desc: "Full head color · Schwarzkopf professional · Intense color & shine" },
      /* Color Application */
      { name: "Touchup",                    price: 350,  duration: "35 mins",     group: "Color Application (Own Product)", desc: "Root touchup · Using your own color product · Professional application" },
      { name: "Global",                     price: 700,  duration: "1 hr",        group: "Color Application (Own Product)", desc: "Full head color · Using your own color product · Professional application" },
    ],
  },

  /* ─── 10. MEN'S GROOMING ────────────────────────────────────────── */
  {
    id: "men-grooming", label: "Men's Grooming", icon: "✂", color: "#f0f4fc",
    imgs: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
    ],
    homeService: true, gender: "male",
    desc: "Professional haircut, beard, shave & styling delivered at your doorstep",
    services: [
      { name: "Haircut (Any)",  price: 300, duration: "35 mins", popular: true },
      { name: "Beard",          price: 200, duration: "25 mins" },
      { name: "Shave",          price: 200, duration: "25 mins" },
      { name: "Hair Styling",   price: 150, duration: "10 mins" },
      { name: "Thread",         price: 100, duration: "10 mins" },
    ],
  },

  /* ─── 11. MEN'S COLOR ────────────────────────────────────────────── */
  {
    id: "men-color", label: "Men's Color", icon: "◐", color: "#fdf5e8",
    imgs: [
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
    ],
    homeService: true, gender: "male",
    desc: "Professional beard & hair coloring with premium Loreal formulas",
    services: [
      { name: "Beard Color Loreal Majieral",             price: 350,  duration: "15 mins", group: "Beard Color", popular: true },
      { name: "Beard Color Loreal INOA (Ammonia Free)",  price: 450,  duration: "15 mins", group: "Beard Color" },
      { name: "Hair Color Global Loreal Majieral",       price: 1000, duration: "30 mins", group: "Hair Color", popular: true },
      { name: "Hair Color Global INOA (Ammonia Free)",   price: 1400, duration: "30 mins", group: "Hair Color" },
    ],
  },

  /* ─── 12. THREADING & FACE WAX ──────────────────────────────────── */
  {
    id: "threading-wax", label: "Threading & Face Wax", icon: "✁", color: "#fff0f5",
    imgs: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80",
    ],
    homeService: true, gender: "female",
    desc: "Precise threading & face waxing for perfectly shaped brows and smooth skin",
    services: [
      /* Threading */
      { name: "Eyebrows Threading",   price: 150, duration: "10 mins", group: "Threading", popular: true },
      { name: "Upper Lips Threading", price: 50,  duration: "5 mins",  group: "Threading" },
      { name: "Forehead Threading",   price: 50,  duration: "5 mins",  group: "Threading" },
      { name: "Chin Threading",       price: 50,  duration: "5 mins",  group: "Threading" },
      /* Face Wax */
      { name: "Upper Lips Waxing",    price: 70,  duration: "10 mins", group: "Face Wax" },
      { name: "Chin Waxing",          price: 100, duration: "10 mins", group: "Face Wax" },
      { name: "Sidelocks Waxing",     price: 200, duration: "15 mins", group: "Face Wax" },
      { name: "Forehead Waxing",      price: 100, duration: "10 mins", group: "Face Wax" },
      { name: "Full Face Waxing",     price: 450, duration: "30 mins", group: "Face Wax", popular: true },
    ],
  },
];
