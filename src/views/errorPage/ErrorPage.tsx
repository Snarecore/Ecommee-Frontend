import { Link } from "react-router-dom";
import { AiOutlineHome } from "react-icons/ai";

const ErrorPage = () => {
    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-[var(--color-green-primary)] to-green-800 flex flex-col items-center justify-center text-white p-4">
            <div className="text-center">
                <h1 className="text-9xl font-extrabold mb-4 animate-bounce">404</h1>
                <h2 className="text-4xl font-bold mb-2">Page Not Found</h2>
                <p className="mb-8 text-lg">
                    Sorry, we can’t find the page you’re looking for.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center bg-white text-[var(--color-green-primary)] font-bold px-8 py-3 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300"
                >
                    <AiOutlineHome className="mr-2 text-2xl" />
                    Return Home
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;
