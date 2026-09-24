import heroImg01 from "@/assets/product_1770548124_69886b9c71c18.jpg";
import heroImg02 from "@/assets/product_1770548124_69886b9c7c5a8.jpg";
import heroImg03 from "@/assets/product_1770548124_69886b9ccebec.jpg";
import heroImg04 from "@/assets/product_1770548161_69886bc15028b.jpg";
import featureSheet from "@/assets/ChatGPT Image Aug 16, 2026, 10_12_08 PM.png";
import productShowcase from "@/assets/f492b615-b038-4311-80d8-cf65a1efe5b8.jpg";
import productVideo from "@/assets/a2b00790-a78c-44f3-99ff-30529b49acbb.mp4";
import howtoVideo from "@/assets/ca61836c-8e71-41db-aa4f-203aeaf57889.mp4";
import extraVideo01 from "@/assets/44490c96-7ab8-4576-917e-572c6526ebae.mp4";
import extraVideo02 from "@/assets/630d54e7-ff43-4fc6-8461-275d1f793529.mp4";
import feedback01 from "@/assets/12ced3c3-15f5-428f-9741-2fcb8cf045db.webp";
import feedback02 from "@/assets/2f11729a-085a-4d4c-b6a0-bc44611173c2.webp";
import feedback03 from "@/assets/827d97ca-c7ab-4719-978d-d175c250bc2e.webp";
import feedback04 from "@/assets/a95d0ede-e392-4d20-a0ea-12ac75f79eb4.webp";
import feedback05 from "@/assets/b46c48cd-5be4-4bc3-a3e3-dade1b964a9f.webp";
import feedback06 from "@/assets/b7aa8554-a467-4ff4-964f-d819daed2cb9.webp";
import feedback07 from "@/assets/c2cd8b32-d7fd-4010-a350-325ca3839108.webp";
import feedback08 from "@/assets/e4fb0aa2-7518-4f85-9150-bd03ab06d069.webp";
import feedback09 from "@/assets/ebfcfc52-4558-4391-8b52-cf3a14451c36.webp";
import feedback10 from "@/assets/fc6c8028-3adb-4025-a350-cb2d0619edbc.webp";

export type ProductFeature = { icon: string; title: string; description: string };
export type ProductSpec = { label: string; value: string };
export type ProductStep = { step: string; title: string; description: string };
export type ProductFaq = { question: string; answer: string };
export type ProductVariant = {
  id?: string;
  name: string;
  value: string;
  price?: number | null;
  stockQuantity?: number;
  imageUrl?: string | null;
};
export type Product = {
  id: string;
  slug: string;
  name: string;
  shortTitle: string;
  category: string;
  categories?: string[];
  regularPrice: number;
  offerPrice: number;
  deliveryDhaka?: number;
  deliveryOutsideDhaka?: number;
  images: string[];
  videos: string[];
  videoPosters: string[];
  feedbackImages: string[];
  badge: "বেস্ট সেলার" | "নতুন" | null;
  inStock: boolean;
  stockQuantity?: number;
  stockMessage?: string;
  shortDescription: string;
  descriptionHtml?: string;
  heroHeadline: string;
  heroSubtext: string;
  features: ProductFeature[];
  longDescription: string[];
  keyPoints: string[];
  specifications: ProductSpec[];
  howToUse: ProductStep[];
  faqs: ProductFaq[];
  seoTitle: string;
  seoDescription: string;
  variants?: ProductVariant[];
  countdownEnabled?: boolean;
  countdownDurationSeconds?: number;
};

const d16Faqs: ProductFaq[] = [
  [
    "এই Humidifier কীভাবে ব্যবহার করবো?",
    "Water tank-এ পানি দিন, USB cable সংযুক্ত করুন, তারপর power button চাপুন। Mist mode বেছে নিয়ে ঘরে আরামদায়ক পরিবেশ তৈরি করুন।",
  ],
  ["Delivery charge কত?", "ঢাকার ভিতরে ৳70 এবং ঢাকার বাইরে ৳130।"],
  ["ক্যাশ অন ডেলিভারি আছে কি?", "হ্যাঁ, পণ্য হাতে পেয়ে ডেলিভারিম্যানকে টাকা পরিশোধ করে নেবেন।"],
  ["ঢাকার বাইরে কি ডেলিভারি হয়?", "হ্যাঁ, সারা বাংলাদেশে কুরিয়ারের মাধ্যমে ডেলিভারি করা হয়।"],
  ["কত ml পানি ধরে?", "Water tank-এর ধারণক্ষমতা ১৮০ ml।"],
  [
    "USB দিয়ে কি চালানো যায়?",
    "হ্যাঁ, USB পোর্ট, পাওয়ার ব্যাংক বা USB অ্যাডাপ্টার দিয়ে চালানো যায়।",
  ],
  ["অফার মূল্য কত?", "নিয়মিত দাম ৳699 হলেও এখন অফার মূল্য মাত্র ৳399।"],
  [
    "অর্ডার করার পর কী হবে?",
    "অর্ডার কনফার্ম হওয়ার পর আমাদের প্রতিনিধি ফাইনাল কনফার্ম করবেন, এরপর পণ্য ডেলিভারি শুরু করা হবে।",
  ],
  [
    "এই Humidifier-এ Night Light আছে কি?",
    "হ্যাঁ, এতে ৭-রঙের LED Night Light রয়েছে, যা ঘুমানোর সময় সুন্দর ambient light করে।",
  ],
  ["Noise level কত?", "এই ডিভাইসটি খুবই কম শব্দে কাজ করে, তাই শোবার ঘরেও ব্যবহার উপযোগী।"],
].map(([question, answer]) => ({ question, answer }));

const d16Features: ProductFeature[] = [
  {
    icon: "🌫️",
    title: "Fine Mist",
    description: "সূক্ষ্ম মিস্ট ছড়িয়ে personal space-কে আরও আরামদায়ক রাখতে সাহায্য করে।",
  },
  {
    icon: "🌈",
    title: "7-Color LED Light",
    description: "৭ রঙের সুন্দর LED Light আপনার রুমে মনোরম পরিবেশ তৈরি করে।",
  },
  {
    icon: "🔌",
    title: "USB Powered",
    description: "ল্যাপটপ, পাওয়ার ব্যাংক বা USB অ্যাডাপ্টারের সাথে সহজেই ব্যবহার করুন।",
  },
  {
    icon: "📦",
    title: "Compact Design",
    description: "Bedroom, Study Table বা Office Desk-এর জন্য ছোট ও স্টাইলিশ ডিজাইন।",
  },
  {
    icon: "💧",
    title: "180ML Capacity",
    description: "ব্যক্তিগত ব্যবহারের জন্য সুবিধাজনক 180ML Water Tank।",
  },
];

export const products: Product[] = [
  {
    id: "d16-humidifier",
    slug: "d16-air-humidifier",
    name: "D16 Air Humidifier with Night Light - 180ML (Random Color, White/Black)",
    shortTitle: "D16 Air Humidifier",
    category: "home-lifestyle",
    regularPrice: 699,
    offerPrice: 399,
    deliveryDhaka: 70,
    deliveryOutsideDhaka: 130,
    images: [heroImg01, heroImg02, productShowcase, heroImg03, heroImg04, featureSheet],
    videos: [productVideo, howtoVideo, extraVideo01, extraVideo02],
    videoPosters: [heroImg02, heroImg03, heroImg02, heroImg03],
    feedbackImages: [
      feedback01,
      feedback02,
      feedback03,
      feedback04,
      feedback05,
      feedback06,
      feedback07,
      feedback08,
      feedback09,
      feedback10,
    ],
    badge: "বেস্ট সেলার",
    inStock: true,
    stockQuantity: 12,
    stockMessage: "স্টকে মাত্র 12 পিস আছে",
    shortDescription:
      "১৮০ML Fine Cool Mist, 7-Color LED, 2টি Mist Mode এবং USB Powered compact humidifier।",
    heroHeadline: "ঘরের পরিবেশকে আরও আরামদায়ক করুন D16 Air Humidifier দিয়ে 💨",
    heroSubtext:
      "১৮০ML ট্যাংক, সূক্ষ্ম ঠান্ডা মিস্ট, 7-Color LED Night Light এবং USB Powered ডিজাইনের এই compact humidifier bedroom, study table বা office desk-এর জন্য উপযোগী।",
    features: d16Features,
    longDescription: [
      "D16 Air Humidifier বাতাসে সূক্ষ্ম ঠান্ডা মিস্ট ছড়িয়ে পরিবেশে আর্দ্রতা যোগ করে। এর সুন্দর LED Night Light রুমে তৈরি করে একটি শান্ত ও আরামদায়ক পরিবেশ। USB Powered হওয়ায় ল্যাপটপ, পাওয়ার ব্যাংক বা USB অ্যাডাপ্টারের মাধ্যমে সহজেই ব্যবহার করা যায়।",
      "সুগন্ধের জন্য আপনি চাইলে আতর, এয়ার ফ্রেশনার অথবা ঘরের পারফিউম ব্যবহার করতে পারেন। Continuous Mode একটানা মিস্ট দেয় এবং Intermittent Mode বিরতি দিয়ে মিস্ট ছড়ায়।",
    ],
    keyPoints: [
      "180ML Water Tank",
      "Fine Cool Mist",
      "7-Color LED Night Light",
      "2টি Mist Mode: Continuous ও Intermittent",
      "Low Noise Operation",
      "Auto Shut-Off",
      "USB Powered",
      "Compact ও Portable Design",
      "প্রায় 2W Low Power Consumption",
      "Bedroom, office, study table ও গাড়িতে ব্যবহারযোগ্য",
    ],
    specifications: [
      ["Product Name", "D16 Air Humidifier"],
      ["Water Capacity", "180ML"],
      ["Mist Output", "প্রায় 30–45ML/h"],
      ["Rated Power", "2W"],
      ["Noise Level", "30dB-এর কম"],
      ["Power", "USB Powered"],
      ["LED Light", "7-Color LED"],
      ["Material", "ABS + PP + Silicone"],
      ["Size", "প্রায় 78 × 78 × 120mm"],
      ["Weight", "প্রায় 110g"],
    ].map(([label, value]) => ({ label, value })),
    howToUse: [
      { step: "১", title: "পানি দিন", description: "Water tank-এ প্রয়োজনমতো পানি দিন।" },
      { step: "২", title: "USB কানেক্ট করুন", description: "USB cable সংযুক্ত করুন।" },
      { step: "৩", title: "চালু করুন", description: "Power button চাপুন এবং mist উপভোগ করুন।" },
    ],
    faqs: d16Faqs,
    variants: [
      { name: "Color", value: "কালো", stockQuantity: 10 },
      { name: "Color", value: "সাদা", stockQuantity: 10 },
    ],
    seoTitle: "D16 Air Humidifier | GizmoZone BD",
    seoDescription:
      "D16 Air Humidifier with Night Light, Fine Cool Mist ও USB Powered ডিজাইন। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।",
    countdownEnabled: true,
    countdownDurationSeconds: 2 * 3600 + 15 * 60 + 48,
    stockMessage: "স্টকে মাত্র 12 পিস আছে",
  },
  {
    id: "desk-lamp-placeholder",
    slug: "smart-usb-desk-lamp",
    name: "Smart USB Desk Lamp",
    shortTitle: "Smart USB Desk Lamp",
    category: "decorative-lights-lamps",
    regularPrice: 850,
    offerPrice: 599,
    images: [featureSheet, productShowcase],
    videos: [],
    videoPosters: [],
    feedbackImages: [],
    badge: "নতুন",
    inStock: true,
    shortDescription: "পড়াশোনা ও কাজের টেবিলের জন্য compact USB desk lamp।",
    heroHeadline: "আপনার ডেস্কে আলো হোক আরও সুন্দর",
    heroSubtext: "এই placeholder product object-এর জায়গায় আপনার আসল product content বসান।",
    features: [
      { icon: "💡", title: "Bright LED", description: "চোখে আরামদায়ক আলো।" },
      { icon: "🔌", title: "USB Powered", description: "যেকোনো USB port-এ চালান।" },
    ],
    longDescription: ["নতুন পণ্যের বিস্তারিত description এখানে যোগ করুন।"],
    keyPoints: ["USB Powered", "Compact Design"],
    specifications: [{ label: "Power", value: "USB" }],
    howToUse: [],
    faqs: [],
    seoTitle: "Smart USB Desk Lamp | GizmoZone BD",
    seoDescription: "Smart USB Desk Lamp placeholder product.",
  },
  {
    id: "mini-cable-organizer",
    slug: "mini-cable-organizer",
    name: "Mini Cable Organizer Set",
    shortTitle: "Cable Organizer Set",
    category: "mobile-pc-accessories",
    regularPrice: 450,
    offerPrice: 299,
    images: [productShowcase, heroImg04],
    videos: [],
    videoPosters: [],
    feedbackImages: [],
    badge: null,
    inStock: true,
    shortDescription: "চার্জার ও cable গুছিয়ে রাখার সহজ সমাধান।",
    heroHeadline: "জট ছাড়াই গোছানো ডেস্ক",
    heroSubtext: "প্রতিদিনের ছোট gadget accessories-এর জন্য placeholder product।",
    features: [
      { icon: "🧩", title: "Easy Organize", description: "Cable আলাদা করে গুছিয়ে রাখুন।" },
    ],
    longDescription: ["আপনার product details এখানে লিখুন।"],
    keyPoints: ["Reusable", "Desk Friendly"],
    specifications: [{ label: "Pack", value: "6 pieces" }],
    howToUse: [],
    faqs: [],
    seoTitle: "Mini Cable Organizer | GizmoZone BD",
    seoDescription: "Mini Cable Organizer placeholder product.",
  },
  {
    id: "portable-fan-placeholder",
    slug: "portable-usb-fan",
    name: "Portable USB Mini Fan",
    shortTitle: "Portable USB Fan",
    category: "gadgets-electronics",
    regularPrice: 950,
    offerPrice: 749,
    images: [heroImg03, heroImg01],
    videos: [],
    videoPosters: [],
    feedbackImages: [],
    badge: "নতুন",
    inStock: false,
    shortDescription: "ডেস্ক বা bedside-এর জন্য ছোট USB fan।",
    heroHeadline: "ছোট ফ্যানে আরাম বড়",
    heroSubtext: "Placeholder product: stock true করলে এটি অর্ডারের জন্য প্রস্তুত হবে।",
    features: [{ icon: "🌬️", title: "Portable", description: "সহজে সঙ্গে নিয়ে যান।" }],
    longDescription: ["আপনার product details এখানে লিখুন।"],
    keyPoints: ["USB Powered", "Portable"],
    specifications: [{ label: "Power", value: "USB" }],
    howToUse: [],
    faqs: [],
    seoTitle: "Portable USB Fan | GizmoZone BD",
    seoDescription: "Portable USB Fan placeholder product.",
  },
];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getDiscountPercent(product: Product) {
  return Math.round(((product.regularPrice - product.offerPrice) / product.regularPrice) * 100);
}
