enum Category {
  Electronics = "electronics",
  Clothing = "clothing",
  Home = "home",
  Beauty = "beauty",
  Sports = "sports",
  Toys = "toys",
  Books = "books",
  Other = "other"
}

export interface Product {
  _id: string;
  id?: string;
  name: string;
  category: Category | string;
  price: number;
  stock: number;
  imageUrl: string;
  vendorId: string;
}
