export type MonthlySale = {
  month: string; 
  sales: number;
};

export type Analytics = {
  monthlySales: MonthlySale[];       
  totalSales: number;                
  totalRevenue: number;              
  totalInCart: number       
};

export type Vendor = {
    storeName:String, 
    storeImage: string, 
    isActive: boolean 
}

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface VendorBalance {
  vendorId: string
  vendorName: string;
  amount: number;
  orders: []
}

export interface User extends Document {
  role: "customer" | "vendor" | "admin";
  name: string;
  email: string;
  password: string;
  address: Address;
  createdAt: Date;
  vendorProfile?: Vendor;
  accountBalance?: {
    totalOwed: number;
    vendorBalances: VendorBalance[];
  };
}
