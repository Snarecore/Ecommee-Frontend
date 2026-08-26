import NavBar from "../component/layout/navbar/index";
import Footer from "../component/layout/Footer";
import { Toaster } from "react-hot-toast";
import { InitialStateService } from "../services/initial-state-service";
import FloatingChat from "../component/chat/FloatingChat";

const SiteLayout = ({ children }: { children?: React.ReactNode }) => {
    return (
        <div className="bg-[var(--color-white-primary)]">
            <InitialStateService />
            <NavBar />
            <Toaster position="top-right" reverseOrder={false} />
            <main className="min-h-screen mx-auto">
                {children}
            </main>
            <FloatingChat />
            <Footer />
        </div>
    );
};

export default SiteLayout;
