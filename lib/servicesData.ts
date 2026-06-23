export interface ServiceItem { name: string; price: number; popular?: boolean; }
export interface Category {
  id: string; label: string; desc: string;
  icon: string; color: string; img: string;
  homeService: boolean;
  gender: "female" | "male" | "both";
  services: ServiceItem[];
}

export const allCategories: Category[] = [
  {
    id: "facial", label: "Facials", icon: "✦", color: "#f9f0e0",
    img: "/images/services/facial.jpg", homeService: true, gender: "both",
    desc: "Advanced treatments for radiant, glowing skin",
    services: [
      { name: "VLCC", price: 600 },
      { name: "Naturence Fruit (3 Steps)", price: 700 },
      { name: "Ozone (3 Steps)", price: 800 },
      { name: "Twacha (4 Steps)", price: 800 },
      { name: "Charcoal Facial", price: 900 },
      { name: "Naturence Mixed Fruit (5 Steps)", price: 900 },
      { name: "Aroma Anti-Aging", price: 900 },
      { name: "Lotus Hydra & Pura", price: 1000, popular: true },
      { name: "Naturence Wine", price: 1100 },
      { name: "Biotique Party Ready Facial", price: 1200 },
      { name: "Vedic Line Vitamin C", price: 1400 },
      { name: "Ozone (5 Steps)", price: 1400 },
      { name: "Lotus Vitamin C", price: 1500, popular: true },
      { name: "Aroma Vitamin C Brightening", price: 1500 },
      { name: "Lotus Treatment", price: 1500 },
      { name: "Lotus 4 Layers", price: 1500 },
      { name: "Hydra Facial Kanpeki", price: 1500 },
      { name: "Ozone (6 Steps)", price: 1800 },
      { name: "O3 Premium + D-Tan Facial", price: 2500, popular: true },
      { name: "Kanpeki Facial", price: 2500 },
      { name: "Casmara Facial", price: 4000 },
    ]
  },
  {
    id: "cleanup", label: "Cleanups", icon: "◈", color: "#eef5f0",
    img: "/images/services/cleanup.jpg", homeService: true, gender: "both",
    desc: "Instantly fresh, glowing skin with signature cleanups",
    services: [
      { name: "Naturence Fruit", price: 500 },
      { name: "Twacha", price: 600 },
      { name: "Ozone", price: 700 },
      { name: "Lotus", price: 800, popular: true },
      { name: "Wine", price: 800 },
      { name: "O3", price: 1200 },
    ]
  },
  {
    id: "dtan", label: "D-Tan", icon: "◉", color: "#f0f4f9",
    img: "/images/services/dtan.jpg", homeService: true, gender: "female",
    desc: "Skin brightening & tan removal for an even complexion",
    services: [
      { name: "D-Tan Sara", price: 250 },
      { name: "D-Tan Ozone", price: 300 },
      { name: "D-Tan Raga", price: 300 },
      { name: "D-Tan O3", price: 500, popular: true },
    ]
  },
  {
    id: "bleach", label: "Bleach", icon: "◌", color: "#f9f0f5",
    img: "/images/services/bleach.jpg", homeService: true, gender: "female",
    desc: "Brightening treatments for a luminous complexion",
    services: [
      { name: "Fem", price: 250 },
      { name: "Diamond", price: 250 },
      { name: "Oxy Life", price: 300 },
      { name: "D-Tan Bleach", price: 350 },
      { name: "Herbal Bleach", price: 350 },
      { name: "O3 Bleach", price: 500, popular: true },
      { name: "Full Back + Neck", price: 500 },
      { name: "Full Arms + Full Legs", price: 800 },
    ]
  },
  {
    id: "threading", label: "Threading", icon: "〜", color: "#f0f9f5",
    img: "/images/services/threading.jpg", homeService: true, gender: "female",
    desc: "Precision brow & face shaping by skilled hands",
    services: [
      { name: "Threading (Eyebrows)", price: 30 },
      { name: "Forehead", price: 30 },
      { name: "Upper Lips", price: 30 },
      { name: "Threading + Forehead + Upper Lips", price: 80, popular: true },
    ]
  },
  {
    id: "wax", label: "Waxing", icon: "◎", color: "#f9f5e8",
    img: "/images/services/waxing.jpg", homeService: true, gender: "female",
    desc: "Smooth, long-lasting hair removal with premium wax",
    services: [
      { name: "Brazilian Wax – Forehead", price: 50 },
      { name: "Brazilian Wax – Upper Lips", price: 50 },
      { name: "Brazilian Wax – Lower Lips", price: 50 },
      { name: "Brazilian Wax – Chin", price: 50 },
      { name: "Brazilian Wax – Sidelocks", price: 200 },
      { name: "Brazilian Wax – Full Face", price: 300 },
      { name: "Normal Wax – Full Arms", price: 250 },
      { name: "Normal Wax – Half Legs", price: 250 },
      { name: "Normal Wax – Full Legs", price: 400 },
      { name: "White Chocolate – Full Arms", price: 300 },
      { name: "White Chocolate – Half Legs", price: 350 },
      { name: "White Chocolate – Full Legs", price: 600, popular: true },
      { name: "Rica Wax – Full Arms", price: 400 },
      { name: "Rica Wax – Half Legs", price: 400 },
      { name: "Rica Wax – Full Legs", price: 800, popular: true },
      { name: "Full Body Normal Wax", price: 1200 },
      { name: "Full Body Rica Wax", price: 2200 },
    ]
  },
  {
    id: "manicure", label: "Manicure", icon: "◇", color: "#f5f0f9",
    img: "/images/services/manicure.jpg", homeService: true, gender: "female",
    desc: "Complete nail care with premium products",
    services: [
      { name: "Manicure", price: 300 },
      { name: "Manicure Fruit", price: 400 },
      { name: "Manicure Twacha", price: 500 },
      { name: "Manicure Pedi Pie", price: 600 },
      { name: "Manicure Lotus", price: 700, popular: true },
      { name: "Manicure Biotique", price: 700 },
    ]
  },
  {
    id: "pedicure", label: "Pedicure", icon: "◆", color: "#edf5f0",
    img: "/images/services/pedicure.jpg", homeService: true, gender: "female",
    desc: "Relaxing foot care, scrub & deep hydration",
    services: [
      { name: "Pedicure", price: 550 },
      { name: "Pedicure Fruit", price: 600 },
      { name: "Pedicure Twacha", price: 700 },
      { name: "Pedicure Pedi Pie", price: 800 },
      { name: "Pedicure Lotus", price: 1200, popular: true },
      { name: "Pedicure Biotique", price: 1200 },
    ]
  },
  {
    id: "haircut", label: "Haircut & Style", icon: "✂", color: "#f0f0f9",
    img: "/images/services/haircut.jpg", homeService: true, gender: "both",
    desc: "Precision cuts, fades & modern styling",
    services: [
      { name: "Haircut", price: 150, popular: true },
      { name: "Kids Haircut", price: 100 },
      { name: "Hair Styling", price: 200 },
      { name: "Hair Wash + Blow Dry", price: 200 },
    ]
  },
  {
    id: "beard", label: "Beard & Shave", icon: "✧", color: "#f9f0e8",
    img: "/images/services/beard.jpg", homeService: true, gender: "male",
    desc: "Expert beard grooming & hot towel shave",
    services: [
      { name: "Beard Trim", price: 100, popular: true },
      { name: "Clean Shave", price: 150 },
      { name: "Beard Styling", price: 200 },
      { name: "Haircut + Beard Trim", price: 250, popular: true },
    ]
  },
  {
    id: "haircolor", label: "Hair Color", icon: "◐", color: "#f9eef0",
    img: "/images/services/haircolor.jpg", homeService: false, gender: "both",
    desc: "Global colors, highlights & balayage by experts",
    services: [
      { name: "Global Color", price: 800, popular: true },
      { name: "Highlights", price: 1200 },
      { name: "Fashion Color", price: 1500 },
      { name: "Balayage / Ombre", price: 2000 },
    ]
  },
  {
    id: "massage", label: "Head Massage", icon: "◑", color: "#eef0f9",
    img: "/images/services/massage.jpg", homeService: true, gender: "both",
    desc: "Deep relaxation scalp massage with premium oils",
    services: [
      { name: "Head Massage", price: 200, popular: true },
      { name: "Hot Oil Massage", price: 300 },
    ]
  },
];
