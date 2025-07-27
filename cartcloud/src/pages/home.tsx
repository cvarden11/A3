import Header from '../components/header';
import Footer from '../components/footer';
import { CartProvider } from '../context/cartContext';
import { useAuth } from '../context/authContext';

function Home() {
  const { user } = useAuth();
  
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Header page="home" role={user?.role} />
        
        {/* Main content with padding to account for fixed header */}
        <main className="flex-1 pt-20 px-6 md:px-12">
          <div className="max-w-7xl mx-auto py-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to CartCloud</h1>
            <p className="text-lg text-gray-600">
              Your one-stop destination for online shopping. Discover amazing products from trusted vendors.
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Featured sections */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Shop Now</h3>
                <p className="text-gray-600 mb-4">Browse our wide selection of products</p>
                <a href="/products" className="text-blue-600 hover:text-blue-800 font-medium">
                  Explore Products →
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">About Us</h3>
                <p className="text-gray-600 mb-4">Learn more about CartCloud</p>
                <a href="/about" className="text-blue-600 hover:text-blue-800 font-medium">
                  Read More →
                </a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact</h3>
                <p className="text-gray-600 mb-4">Get in touch with our team</p>
                <a href="/contact" className="text-blue-600 hover:text-blue-800 font-medium">
                  Contact Us →
                </a>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </CartProvider>
  );
}

export default Home; 