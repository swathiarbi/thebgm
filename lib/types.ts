export type RestaurantSettings = {
  id: string;
  restaurant_name: string;
  tagline: string;
  secondary_tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  opening_hours: string;
  description: string;
  map_query: string;
  updated_at: string;
};

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
};

export type MenuItem = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  category?: MenuCategory;
};

export type Promotion = {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  display_order: number;
};

export type GalleryImage = {
  id: string;
  image_url: string;
  caption: string;
  display_order: number;
  is_published: boolean;
};

export type Testimonial = {
  id: string;
  customer_name: string;
  review_text: string;
  rating: number;
  review_date: string | null;
  is_published: boolean;
};

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
};

export type CartLine = {
  item: Pick<MenuItem, 'id' | 'name' | 'price' | 'image_url'>;
  categoryName: string;
  quantity: number;
};

export const fallbackSettings: RestaurantSettings = {
  id: 'default',
  restaurant_name: 'The Bangalore Grills and More',
  tagline: 'Good Food • Great Mood',
  secondary_tagline: 'Eat Good. Feel Great.',
  phone: '+91 7026358555',
  whatsapp: '917026358555',
  email: 'bangaloregrillsandmore@gmail.com',
  address: 'No. 16 & 17, 100 Feet Ring Road, near Veerabhadra Nagar Signal, Banashankari 3rd Stage, Hosakerehalli, Bengaluru, Karnataka 560085, India.',
  opening_hours: 'Monday – Sunday: 11:00 AM – 10:30 PM',
  description: 'Welcome to The Bangalore Grills and More – your destination for delicious food and authentic flavours in Bangalore! We bring together the best of grilled food, flavourful biryanis and delicious non-vegetarian specialities. Enjoy our juicy grilled chicken, smoky tandoori delights, freshly prepared shawarma, crispy fried chicken, loaded fries and biryani. Come experience the flavours of Bangalore at The Bangalore Grills and More – THE BGM!',
  map_query: 'The Bangalore Grills and More, No. 16 & 17, 100 Feet Ring Road, Hosakerehalli, Bengaluru, Karnataka 560085',
  updated_at: '',
};

export const formatINR = (value: number) => `₹${value.toLocaleString('en-IN')}`;
