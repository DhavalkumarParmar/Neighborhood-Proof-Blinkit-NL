// Hand-curated name parts for the synthetic catalog.
// Brands are invented (not real companies) so that the fabricated return rates
// and complaints in this demo are never attributed to a real product.

export const CATEGORIES = ["beauty", "pet", "baby", "home", "electronics"];

export const CATEGORY_LABEL = {
  beauty: "Beauty & Personal Care",
  pet: "Pet Care",
  baby: "Baby Care",
  home: "Home & Cleaning",
  electronics: "Electronics",
};

export const BRANDS = {
  beauty: [
    "Aurvi",
    "Rooh Botanics",
    "Sattva Skin",
    "Tvish",
    "Nilaya",
    "Ojas Naturals",
    "Meraki Bloom",
    "Charak Glow",
    "Bindu",
  ],
  pet: ["Pawrush", "Fursaathi", "Tailwag India", "Pindi Pets", "Bhaukaal Pet Co"],
  baby: ["Nanhe", "Palna", "Softi Baby", "Chotu Care", "Dhoop & Dew"],
  home: ["Ghar Ghar", "Nirmal Home", "Swacch Co", "Gruha", "Sundar Living"],
  electronics: ["Voltiq", "Zolt", "Bharat Sound", "Amperz", "Trikon Audio", "Kirana Tech"],
};

// [product name, low price, high price, unit]
export const PRODUCTS = {
  beauty: [
    ["10% Niacinamide Face Serum", 399, 749, "30 ml"],
    ["Vitamin C Face Serum", 449, 899, "30 ml"],
    ["Onion Hair Oil", 249, 549, "200 ml"],
    ["Ubtan Face Wash", 199, 399, "150 ml"],
    ["Aloe Vera Gel", 149, 299, "200 g"],
    ["Rose Water Face Mist", 179, 349, "150 ml"],
    ["Charcoal Peel Off Mask", 249, 449, "100 g"],
    ["Kumkumadi Face Oil", 549, 1199, "30 ml"],
    ["Matte Liquid Lipstick", 299, 649, "5 ml"],
    ["Kajal Pencil", 149, 329, "1 unit"],
    ["Sunscreen SPF 50 Gel", 349, 699, "50 g"],
    ["Under Eye Cream", 299, 599, "20 g"],
    ["Anti Dandruff Shampoo", 279, 549, "340 ml"],
    ["Hair Growth Serum", 399, 849, "50 ml"],
    ["Body Lotion Cocoa", 249, 499, "400 ml"],
    ["Foot Crack Cream", 129, 249, "50 g"],
    ["Beard Growth Oil", 249, 549, "50 ml"],
    ["Face Sheet Mask Pack of 4", 199, 399, "4 x 20 g"],
    ["Coffee Body Scrub", 299, 599, "200 g"],
    ["Hair Mask Keratin", 349, 699, "200 g"],
    ["Nail Paint Glossy", 129, 279, "9 ml"],
    ["Compact Powder", 249, 499, "9 g"],
    ["Perfume Roll On", 199, 449, "10 ml"],
    ["Deodorant Body Spray", 179, 349, "150 ml"],
    ["Hand Cream Shea", 149, 299, "50 g"],
    ["Lip Balm Tinted", 99, 249, "4 g"],
    ["Micellar Water Cleanser", 279, 549, "200 ml"],
    ["Clay Face Pack Multani", 149, 299, "100 g"],
    ["Hair Colour Shampoo Black", 199, 399, "180 ml"],
    ["Razor Cartridge Pack", 249, 599, "4 units"],
  ],
  pet: [
    ["Adult Dog Dry Food Chicken", 549, 1899, "1.2 kg"],
    ["Puppy Starter Dry Food", 599, 1699, "1 kg"],
    ["Cat Dry Food Ocean Fish", 499, 1499, "1.2 kg"],
    ["Cat Litter Clumping", 349, 899, "5 kg"],
    ["Dog Chew Stick Pack", 149, 449, "10 units"],
    ["Dog Shampoo Tick Control", 249, 549, "200 ml"],
    ["Pet Grooming Brush", 199, 499, "1 unit"],
    ["Dog Collar Adjustable", 249, 649, "1 unit"],
    ["Retractable Dog Leash", 399, 999, "3 m"],
    ["Cat Scratching Post", 599, 1499, "1 unit"],
    ["Pet Water Bowl Steel", 179, 449, "1 unit"],
    ["Dog Treat Chicken Jerky", 199, 499, "150 g"],
    ["Cat Treat Creamy Tube", 149, 349, "5 x 15 g"],
    ["Pet Odour Remover Spray", 249, 549, "500 ml"],
    ["Dog Raincoat", 449, 999, "1 unit"],
    ["Pet Nail Clipper", 199, 449, "1 unit"],
    ["Aquarium Fish Flakes", 129, 299, "100 g"],
    ["Bird Seed Mix", 149, 349, "500 g"],
  ],
  baby: [
    ["Baby Diaper Pants Medium", 399, 1299, "62 units"],
    ["Baby Diaper Pants Large", 449, 1399, "58 units"],
    ["Baby Wet Wipes", 149, 399, "72 units"],
    ["Baby Lotion Milky Soft", 199, 449, "200 ml"],
    ["Baby Massage Oil", 249, 549, "200 ml"],
    ["Baby Shampoo No Tears", 199, 429, "200 ml"],
    ["Baby Bathing Bar", 129, 299, "75 g"],
    ["Nappy Rash Cream", 179, 399, "50 g"],
    ["Baby Feeding Bottle", 299, 749, "250 ml"],
    ["Silicone Teether", 199, 449, "1 unit"],
    ["Baby Laundry Detergent", 249, 599, "1 L"],
    ["Baby Powder Prickly Heat", 149, 329, "150 g"],
    ["Baby Toothbrush Soft", 129, 299, "1 unit"],
    ["Mustard Seed Pillow", 249, 599, "1 unit"],
    ["Baby Hooded Towel", 349, 799, "1 unit"],
    ["Cotton Swaddle Wrap", 399, 899, "1 unit"],
    ["Baby Nail Scissors", 179, 399, "1 unit"],
    ["Steam Steriliser Bags", 249, 549, "5 units"],
  ],
  home: [
    ["Floor Cleaner Lemon", 149, 399, "1 L"],
    ["Toilet Cleaner Thick", 129, 299, "500 ml"],
    ["Dishwash Gel Lime", 99, 279, "750 ml"],
    ["Glass Cleaner Spray", 129, 299, "500 ml"],
    ["Laundry Liquid Detergent", 249, 699, "1 L"],
    ["Fabric Conditioner Rose", 199, 499, "800 ml"],
    ["Cockroach Killer Gel", 149, 349, "30 g"],
    ["Mosquito Repellent Refill", 129, 299, "2 x 45 ml"],
    ["Air Freshener Pocket", 99, 249, "10 g"],
    ["Room Spray Sandalwood", 199, 449, "200 ml"],
    ["Microfibre Cleaning Cloth", 149, 399, "3 units"],
    ["Scrub Pad Heavy Duty", 79, 199, "4 units"],
    ["Garbage Bags Medium", 149, 349, "90 units"],
    ["Broom Soft Bristle", 199, 449, "1 unit"],
    ["Spin Mop with Bucket", 899, 2499, "1 unit"],
    ["Storage Container Set", 449, 1299, "3 units"],
    ["Airtight Steel Casserole", 599, 1699, "2.5 L"],
    ["Cotton Bath Towel", 349, 899, "1 unit"],
    ["Bedsheet Double Cotton", 699, 1899, "1 unit"],
    ["Doormat Anti Slip", 249, 649, "1 unit"],
    ["Clothes Drying Stand", 999, 2499, "1 unit"],
    ["LED Bulb 9W", 129, 299, "1 unit"],
    ["Wall Hooks Adhesive", 149, 349, "6 units"],
    ["Plastic Laundry Basket", 349, 899, "1 unit"],
  ],
  electronics: [
    ["Wireless Earbuds", 999, 2999, "1 unit"],
    ["Neckband Bluetooth Earphone", 699, 1799, "1 unit"],
    ["Over Ear Headphones", 1299, 3499, "1 unit"],
    ["Bluetooth Party Speaker", 1499, 4499, "1 unit"],
    ["Power Bank 10000mAh", 899, 2199, "1 unit"],
    ["Power Bank 20000mAh", 1399, 3299, "1 unit"],
    ["Fast Charger 33W", 549, 1399, "1 unit"],
    ["USB C Cable Braided", 199, 599, "1.5 m"],
    ["Phone Back Cover", 249, 699, "1 unit"],
    ["Tempered Glass Screen Guard", 149, 449, "2 units"],
    ["Smart Watch Fitness", 1499, 4999, "1 unit"],
    ["Wired Earphone with Mic", 249, 699, "1 unit"],
    ["Mobile Ring Holder", 129, 299, "1 unit"],
    ["Laptop Sleeve 14 inch", 549, 1399, "1 unit"],
    ["Wireless Mouse", 499, 1299, "1 unit"],
    ["Mini Bluetooth Speaker", 699, 1799, "1 unit"],
    ["Extension Board 4 Socket", 349, 899, "1 unit"],
    ["Car Phone Holder", 299, 799, "1 unit"],
    ["Trimmer for Men", 899, 2299, "1 unit"],
    ["Hair Dryer 1200W", 799, 1999, "1 unit"],
    ["Immersion Water Heater Rod", 499, 1199, "1 unit"],
    ["Electric Kettle 1.5L", 699, 1899, "1 unit"],
    ["Rechargeable Table Fan", 1199, 2999, "1 unit"],
    ["LED Strip Light 5m", 449, 1199, "1 unit"],
  ],
};

/*
 * Traits derived from a product's name, so that a complaint only lands on a
 * product it could actually happen to. Without this, a scratching post picks up
 * dog-food reviews and a kajal pencil develops a broken pump - which reads as
 * obviously fabricated the moment anyone actually reads the card.
 */
export const TRAIT_RULES = {
  liquid:
    /Serum|Oil|Wash|Gel|Mist|Lotion|Shampoo|Conditioner|Cleaner|Detergent|Liquid|Water|Spray|Micellar|Freshener/i,
  pump: /Serum|Lotion|Wash|Cleaner|Shampoo|Conditioner|Sunscreen|Micellar|Detergent/i,
  cleaner: /Cleaner|Detergent|Dishwash|Toilet|Floor|Laundry|Scrub Pad|Mop|Broom|Repellent|Killer/i,
  topical: /Serum|Cream|Lotion|Oil|Wash|Mask|Scrub|Balm|Gel|Sunscreen|Powder|Bar/i,
  makeup: /Kajal|Lipstick|Compact|Nail Paint|Lip Balm/i,
  scented:
    /Perfume|Deodorant|Freshener|Room Spray|Fabric Conditioner|Massage Oil|Powder|Cleaner|Shampoo/i,
  gear: /Brush|Collar|Leash|Post|Clipper|Bowl|Bottle|Teether|Stand|Mop|Broom|Container|Casserole|Basket|Holder|Sleeve|Board|Scissors|Toothbrush|Raincoat|Towel|Bedsheet|Doormat|Swaddle|Pillow|Razor|Cloth|Pad|Bags|Bulb|Hooks/i,
  food: /Food|Treat|Jerky|Flakes|Seed Mix/i,
  battery:
    /Earbuds|Earphone|Headphones|Speaker|Power Bank|Watch|Trimmer|Fan|Mouse|Dryer|Kettle/i,
  charger: /Charger|Cable|Power Bank/i,
};

export function traitsFor(item) {
  const traits = new Set();
  for (const [trait, pattern] of Object.entries(TRAIT_RULES)) {
    if (pattern.test(item.name)) traits.add(trait);
  }
  if (item.category === "electronics") traits.add("electronic");

  // Makeup wins outright. "Matte Liquid Lipstick" matches the liquid rule on the
  // word "Liquid" and would otherwise collect floor-cleaner praise.
  if (traits.has("makeup")) {
    traits.delete("liquid");
    traits.delete("topical");
  }

  return traits;
}

// Recurring product issues. Each entry is one underlying complaint expressed
// several different ways, which is what makes it detectable as "recurring".
// `requires` lists traits, any one of which makes the issue plausible.
export const ISSUES = {
  pump_breaks: {
    requires: ["pump"],
    categories: ["beauty", "home"],
    lines: [
      "Product is good but the pump stopped working in 3 weeks.",
      "Pump jammed halfway. Now I have to open the bottle and pour it out.",
      "Serum is fine, packaging is the problem. Pump gave up very fast.",
      "Second time the pump has broken. Contents are still half full.",
      "Pump got stuck after two weeks of use. Rest is okay.",
      "Works well but the dispenser stopped pushing anything out.",
    ],
  },
  leaking: {
    requires: ["liquid"],
    categories: ["beauty", "home", "baby", "pet"],
    lines: [
      "Bottle came leaking. Half of it was inside the packet.",
      "Arrived leaking from the cap. Oily mess in the bag.",
      "Seal was broken and it had spilled everywhere.",
      "Cap was loose, it leaked all over the other items.",
      "Came half empty because it had leaked in transit.",
      "Delivered with oil leaking out. Had to return it.",
    ],
  },
  battery_drain: {
    requires: ["battery"],
    categories: ["electronics"],
    lines: [
      "Sound is nice but battery finishes in 2 hours.",
      "Battery backup is nowhere near what is claimed.",
      "Charge does not last a full day even on low volume.",
      "Battery drains very fast after one month.",
      "Needs charging twice a day. Not okay at this price.",
    ],
  },
  cheap_plastic: {
    requires: ["gear", "electronic"],
    categories: ["home", "electronics", "pet", "baby"],
    lines: [
      "Plastic feels very cheap for the price.",
      "Body is flimsy, it cracked on the first drop.",
      "Build quality is poor. Looks nothing like the photo.",
      "Feels hollow and light, not sturdy at all.",
      "The handle broke within a week of normal use.",
    ],
  },
  size_smaller: {
    requires: ["gear", "food", "topical", "liquid", "makeup"],
    categories: ["home", "baby", "pet", "beauty"],
    lines: [
      "Much smaller than it looks in the picture.",
      "Size is not as shown. Very small for the price.",
      "Photo is misleading, actual item is tiny.",
      "Expected bigger. Quantity is quite less.",
    ],
  },
  strong_fragrance: {
    requires: ["scented"],
    categories: ["beauty", "home", "baby"],
    lines: [
      "Smell is too strong, gives me a headache.",
      "Fragrance is very harsh. Cannot use it in a closed room.",
      "Perfume in it is overpowering.",
      "Works fine but the smell is too much for a baby.",
    ],
  },
  causes_rash: {
    requires: ["topical", "makeup"],
    categories: ["beauty", "baby"],
    lines: [
      "Gave my skin a rash on the second day.",
      "Caused itching and small red spots. Stopped using it.",
      "My baby got red marks after using this.",
      "Skin started burning slightly. Not for sensitive skin.",
    ],
  },
  not_effective: {
    requires: ["cleaner", "topical"],
    categories: ["home", "pet", "beauty"],
    lines: [
      "Does not clean properly. Had to scrub twice.",
      "No difference after one month of use.",
      "Did not work for us at all.",
      "Very mild. Does not do what it says.",
    ],
  },
  pet_refused: {
    requires: ["food"],
    categories: ["pet"],
    lines: [
      "My dog refused to eat it. Smell seems off.",
      "Cat did not touch it even once.",
      "Both my dogs sniffed and walked away.",
      "Kibble looks dusty and my pet avoided it.",
    ],
  },
  slow_charging: {
    requires: ["charger"],
    categories: ["electronics"],
    lines: [
      "Charging is very slow, not fast charging as claimed.",
      "Takes 4 hours to charge fully.",
      "Charger heats up a lot while charging.",
      "Slower than my old charger.",
    ],
  },
};

/*
 * Praise is picked by trait, not by category, for the same reason complaints
 * are: "my dog finishes the bowl" must never end up under a scratching post.
 * GENERIC lines fit anything and are always in the pool.
 */
export const POSITIVE_BY_TRAIT = {
  food: [
    "My dog finishes the bowl every time.",
    "Cat took to it right away.",
    "Good quantity for the price.",
    "Coat looks shinier after a month of this.",
    "No stomach trouble, and they finish it.",
  ],
  gear: [
    "Sturdy build, using it daily.",
    "Easy to clean and dries fast.",
    "Fits well and feels solid.",
    "Better made than the one I had before.",
  ],
  makeup: [
    "Colour is exactly like the photo.",
    "Stays on the whole day.",
    "Pigment is good for the price.",
    "Does not smudge in this heat.",
  ],
  topical: [
    "Skin feels better after two weeks.",
    "Texture is light and it absorbs fast.",
    "Mild, no irritation for me.",
    "Small change but visible after a month.",
  ],
  cleaner: [
    "One capful is enough for the whole floor.",
    "Lasts much longer than I expected.",
    "Cleans well, nice fresh smell.",
  ],
  electronic: [
    "Sound is clear for calls and music.",
    "Charges fast and the backup is good.",
    "Working fine since two months.",
  ],
};

export const GENERIC_POSITIVE_LINES = [
  "Good product at this price.",
  "Genuine product, same as the shop one.",
  "Repeat order. Works for me.",
  "Delivered quickly and sealed properly.",
  "Value for money. Will order again.",
  "Exactly as described.",
];

export const NEUTRAL_LINES = [
  "Okay for the price.",
  "Average. Nothing special.",
  "Delivery was fast.",
  "Fine, will see how long it lasts.",
];
