import { Routes, Route } from "react-router-dom";
import SiteLayout from "./layouts/SiteLayout";
import AllCategories from "./views/all-categories";
import Home from "./views/home/Home";
import ErrorPage from "./views/errorPage/ErrorPage";
import Wishlist from "./views/wishlist";
import Login from "./views/authentications/login";
import UserRegistration from "./views/authentications/user/registration";
import ForgotPassword from "./views/authentications/forgot-password";
import Product from "./views/product";
import Shop from "./views/shop";
import Cart from "./views/cart/index";
import UserProfile from "./views/user-profile";
import ContactUs from "./views/contact-us";
import Success from "./views/success";
import ScrollToTop from "./component/scroll-to-top/ScrollToTop";
import RoleProtectedRoute from "./providers/RoleProtectedRoute";
import { Role } from "./enum/role.enum";
import Chat from "./views/chat";
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
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route element={<SiteLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/all-categories" element={<AllCategories />} />
                    <Route path="/product/:slug" element={<Product />} />
                    <Route path="/contact-us" element={<ContactUs />} />
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
                    <Route
                        path="/customer-dashboard"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.CUSTOMER]}>
                                <UserProfile />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.CUSTOMER]}>
                                <Chat />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route
                        path="/success"
                        element={
                            <RoleProtectedRoute allowedRoles={[Role.CUSTOMER]}>
                                <Success />
                            </RoleProtectedRoute>
                        }
                    />
                    <Route path="*" element={<ErrorPage />} />
                </Route>
            </Routes>
        </>
    );
};

export default AppRoutes;
