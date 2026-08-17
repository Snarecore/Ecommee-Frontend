import { Routes, Route, Outlet } from "react-router-dom";
import SiteLayout from "./layouts/SiteLayout";
import AllCategories from "./pages/all-categories";
import Home from "./pages/home/Home";
import ErrorPage from "./pages/errorPage/ErrorPage";
import Wishlist from "./pages/wishlist";
import Login from "./pages/authentications/login";
import UserRegistration from "./pages/authentications/user/registration";
import VendorRegistration from "./pages/authentications/vendor/registration";
import ForgotPassword from "./pages/authentications/forgot-password";
import Dashboard from "./pages/vendor/dashboard";
import ProductDetails from "./pages/vendor/inventory/products/components/ProductDetails";
import CreateProduct from "./pages/vendor/create-product";
import DashboardLayout from "./layouts/DashboardLayout";
import Product from "./pages/product";
import Shop from "./pages/shop";
import Cart from "./pages/cart/index";
import UserProfile from "./pages/user-profile";
import ContactUs from "./pages/contact-us";
import Orders from "./pages/vendor/orders";
import InvoiceView from "./pages/vendor/invoice-details/Invoice";
import Success from "./pages/success";
import ScrollToTop from "./component/scroll-to-top/ScrollToTop";
import Products from "./pages/vendor/inventory/products";
import Message from "./pages/vendor/content-cms/messages";
import VendorProfile from "./pages/vendor/vendor-profile";
import RoleProtectedRoute from "./providers/RoleProtectedRoute";
import { Role } from "./enum/role.enum";
import Blog from "./pages/blog";
import BlogDetails from "./pages/blog-details";
import Chat from "./pages/vendor/chat";
import SubscriptionPage from "./pages/vendor/subcription";
import SalesDashboard from "./pages/vendor/sales-dashboard";
import VendorInvoiceView from "./pages/vendor/vendor-subscription-invoice";
import Wallet from "./pages/vendor/wallet";
import VendorChangePassword from "./pages/vendor/vendor-change-password";
import VendorBankInformation from "./pages/vendor/vendor-bank-information";
import PolicyOne from "./pages/policy-one";
import PolicyTwo from "./pages/policy-two";
import PolicyThree from "./pages/policy-three";
import PolicyFour from "./pages/policy-four";
import PolicyFive from "./pages/policy-five";
import PolicySix from "./pages/policy-six";
import PolicySeven from "./pages/policy-seven";
import PolicyEight from "./pages/policy-eight";
import PolicyNine from "./pages/policy-nine";
import PolicyTen from "./pages/policy-ten";
import PolicyEleven from "./pages/policy-eleven";
import PolicyTwelve from "./pages/policy-twelve";
import ResetPassword from "./pages/authentications/reset-password";


const AppRoutes = () => {
    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<UserRegistration />} />
                <Route path="/vendor-signup" element={<VendorRegistration />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route element={<DashboardLayout><Outlet /></DashboardLayout>}>
                    <Route
                        path="/vendor-dashboard"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <Dashboard />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route
                        path="/sales-dashboard"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <SalesDashboard />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route
                        path="/wallet"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <Wallet />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="/products"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <Products />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="/product-details/:id"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <ProductDetails />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="/create-product"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <CreateProduct />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="/edit-product"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <CreateProduct />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="/orders"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <Orders />
                            </RoleProtectedRoute>
                        }
                    />
                    {/* <Route path="/review"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <Review />
                            </RoleProtectedRoute>
                        }
                    /> */}
                    <Route path="/messages"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <Message />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="/invoice/:id"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <InvoiceView />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="/vendor-profile"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <VendorProfile />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="/vendor-bank-information"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <VendorBankInformation />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="/change-vendor-password"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <VendorChangePassword />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="/chat"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <Chat />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="/subcriptions"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <SubscriptionPage />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="/vendor-invoice/:id"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.VENDOR]}>
                                <VendorInvoiceView />
                            </RoleProtectedRoute>
                        }
                    />
                </Route>

                <Route element={<SiteLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/all-categories" element={<AllCategories />} />
                    <Route path="/product/:slug" element={<Product />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    {/* <Route path="/privacy-policy" element={<PrivacyPolicy />} /> */}
                    {/* <Route path="/terms-conditions" element={<TermsAndConditions />} /> */}
                    {/* <Route path="/exchange-policy" element={<ExchangePolicy />} /> */}
                    <Route path="/about-us" element={<PolicyOne />} />
                    <Route path="/accessibility" element={<PolicyTwo />} />
                    <Route path="/community-guideline" element={<PolicyThree />} />
                    <Route path="/community-ip-policy" element={<PolicyFour />} />
                    <Route path="/faqs" element={<PolicyFive />} />
                    <Route path="/services" element={<PolicySix />} />
                    <Route path="/privacy-policy" element={<PolicySeven />} />
                    <Route path="/refund-return-policy" element={<PolicyEight />} />
                    <Route path="/shipping-delivery-policy" element={<PolicyNine />} />
                    <Route path="/terms-conditions" element={<PolicyTen />} />
                    <Route path="/vendor-agreement" element={<PolicyEleven />} />
                    <Route path="/" element={<PolicyTwelve />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogDetails />} />
                    <Route path="*" element={<ErrorPage />} />
                    <Route
                        path="/customer-dashboard"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.CUSTOMER]}>
                                <UserProfile />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="/success"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.CUSTOMER]}>
                                <Success />
                            </RoleProtectedRoute>
                        }
                    />
                </Route>
            </Routes>
        </>
    );
};

export default AppRoutes;
