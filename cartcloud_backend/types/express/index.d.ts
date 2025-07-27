declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: any;
        name: string;
        email: string;
        role: 'customer' | 'vendor' | 'admin';
        address?: any;
        vendorProfile?: any;
        createdAt?: Date;
        save?: () => Promise<any>;
        matchPassword?: (password: string) => Promise<boolean>;
      } & Record<string, any>;
    }
  }
}

export {}; 