import { Routes, Route, Outlet } from "react-router-dom";
import SiteLayout from "./layouts/SiteLayout";
import AllCategories from "./views/all-categories";
import Home from "./views/home/Home";
import ErrorPage from "./views/errorPage/ErrorPage";
import Wishlist from "./views/wishlist";
import Login from "./views/authentications/login";
import UserRegistration from "./views/authentications/user/registration";
import VendorRegistration from "./views/authentications/vendor/registration";
import ForgotPassword from "./views/authentications/forgot-password";
import Dashboard from "./views/vendor/dashboard";
import ProductDetails from "./views/vendor/inventory/products/components/ProductDetails";
import CreateProduct from "./views/vendor/create-product";
import DashboardLayout from "./layouts/DashboardLayout";
import Product from "./views/product";
import Shop from "./views/shop";
import Cart from "./views/cart/index";
import UserProfile from "./views/user-profile";
import ContactUs from "./views/contact-us";
import Orders from "./views/vendor/orders";
import InvoiceView from "./views/vendor/invoice-details/Invoice";
import Success from "./views/success";
import ScrollToTop from "./component/scroll-to-top/ScrollToTop";
import Products from "./views/vendor/inventory/products";
import Message from "./views/vendor/content-cms/messages";
import VendorProfile from "./views/vendor/vendor-profile";
import RoleProtectedRoute from "./providers/RoleProtectedRoute";
import { Role } from "./enum/role.enum";
import Blog from "./views/blog";
import BlogDetails from "./views/blog-details";
import Chat from "./views/vendor/chat";
import SubscriptionPage from "./views/vendor/subcription";
import SalesDashboard from "./views/vendor/sales-dashboard";
import VendorInvoiceView from "./views/vendor/vendor-subscription-invoice";
import Wallet from "./views/vendor/wallet";
import VendorChangePassword from "./views/vendor/vendor-change-password";
import VendorBankInformation from "./views/vendor/vendor-bank-information";
import PolicyOne from "./views/policy-one";
import PolicyTwo from "./views/policy-two";
import PolicyThree from "./views/policy-three";
import PolicyFour from "./views/policy-four";
import PolicyFive from "./views/policy-five";
import PolicySix from "./views/policy-six";
import PolicySeven from "./views/policy-seven";
import PolicyEight from "./views/policy-eight";
import PolicyNine from "./views/policy-nine";
import PolicyTen from "./views/policy-ten";
import PolicyEleven from "./views/policy-eleven";
import PolicyTwelve from "./views/policy-twelve";
import ResetPassword from "./views/authentications/reset-password";


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
