export type Category = {
  slug: string;
  name: string;
  icon: string;
  description: string;
};

export const categories: Category[] = [
  { slug: "gadgets-electronics", name: "Gadgets & Electronics", icon: "🔌", description: "স্মার্ট gadget ও electronics" },
  { slug: "decorative-lights-lamps", name: "Decorative Lights & Lamps", icon: "💡", description: "ঘর সাজানোর আলো ও lamp" },
  { slug: "smart-home-security", name: "Smart Home & Security", icon: "🏠", description: "স্মার্ট home ও নিরাপত্তা" },
  { slug: "home-audio-speakers", name: "Home Audio & Speakers", icon: "🔊", description: "সঙ্গীত ও home audio" },
  { slug: "mobile-pc-accessories", name: "Mobile & PC Accessories", icon: "📱", description: "mobile ও computer accessories" },
  { slug: "home-lifestyle", name: "Home & Lifestyle", icon: "✨", description: "ঘর ও দৈনন্দিন lifestyle" },
  { slug: "gaming-accessories", name: "Gaming Accessories", icon: "🎮", description: "gaming setup-এর accessories" },
];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}
