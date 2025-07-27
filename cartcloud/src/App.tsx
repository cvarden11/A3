import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthProvider from './context/authContext';
import { CartProvider } from './context/cartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/home';
import Login from "./pages/login";
import Signup from './pages/signup';
import ProductDetails from './pages/product-details';
import ProductListingPage from './pages/product-listing-page';
import SearchPage from './pages/search';
import VendorHomePage from './pages/vendor-home';
import Contact from './pages/contact';
import Profile from './pages/profile';
import About from './pages/about';
import Wishlist from './pages/wishlist';
import Checkout from './pages/checkout';
import Payment from './pages/payment';
import OrderDetails from './pages/order-details';
import NotFound from './pages/not-found';
import UploadProductPage from './pages/upload-product';
import VendorProductsPage from './pages/vendor-products-page';
import RoleBasedHome from './pages/role-based-home';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/" element={
              <ProtectedRoute>
                <RoleBasedHome/>
              </ProtectedRoute>
            } />
            <Route path="/home" element={
              <ProtectedRoute>
                <RoleBasedHome/>
              </ProtectedRoute>
            } />
            <Route path="/product-details/:id" element={
              <ProtectedRoute>
                <ProductDetails/>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <ProductListingPage/>
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <SearchPage/>
              </ProtectedRoute>
            } />
            <Route path="/vendor-home" element={
              <ProtectedRoute>
                <VendorHomePage/>
              </ProtectedRoute>
            } />
            <Route path="/vendor-products" element={
              <ProtectedRoute>
                <VendorProductsPage/>
              </ProtectedRoute>
            } />
            <Route path="/contact" element={
              <ProtectedRoute>
                <Contact/>
              </ProtectedRoute>
            } />
            <Route path="/about" element={
              <ProtectedRoute>
                <About/>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile/>
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <Wishlist/>
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                <Checkout/>
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute>
                <Payment/>
              </ProtectedRoute>
            } />
            <Route path="/order/:orderId" element={
              <ProtectedRoute>
                <OrderDetails/>
              </ProtectedRoute>
            } />
            <Route path='/upload-product' element={
              <ProtectedRoute>
              <UploadProductPage/> 
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound/>} />

           
      </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
