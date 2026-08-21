import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import './App.css';
import AppInitializer from "./providers/AppInitializer";
import { HelmetProvider } from 'react-helmet-async';

const stripeKey =
	(typeof import.meta !== 'undefined' && import.meta.env?.VITE_STRIPE_PUBLIC_KEY) ||
	process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ||
	'pk_test_51RnvzXBVnYSmQrwaX27nyzY5fVkPDmiMTAOqA7qgI5KlyF4MN7y36bkb5ny0gadpnBYnvmGCUPiN4E4x4fIeySyL00xzqFL7TF';

const stripePromise = loadStripe(stripeKey);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
	// <React.StrictMode>
	<HelmetProvider >
		<QueryClientProvider client={queryClient}>
			<Elements stripe={stripePromise}>
				<BrowserRouter>
					<AppInitializer />
					<App />
				</BrowserRouter>
			</Elements>
			<ReactQueryDevtools
				initialIsOpen={false}
				position="bottom"
				buttonPosition="bottom-left"
			/>
		</QueryClientProvider>
	</HelmetProvider>
	// </React.StrictMode>
);
