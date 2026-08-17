import { useEffect, useState } from 'react';
import SubscriptionCard from './component/SubscriptionCard';
import { useAPI } from '../../../hooks/useApi';
import apiConfig from "../../../config/api.json";
import PageHeader from '../../../component/card/PageHeader';

interface SubscriptionPlan {
    id: string | number;
    name: string;
    commissionRate: number;
    durationInMonths: number;
    price: number;
}

interface ActiveSubscription {
    id: string | number;
    name: string;
    commissionRate: number;
    durationInMonths: number;
    price: number;
    tier: {
        id: string;
    }
}

const SubscriptionPage = () => {
    const { fetchData } = useAPI();
    const [subcriptions, setSubcriptions] = useState<SubscriptionPlan[]>([]);
    const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
    const [loading, setLoading] = useState(false);
    const apiUrl = apiConfig.subcriptionLinks.activeSubcriptionUrl;

    useEffect(() => {
        const getSubscriptionsList = async () => {
            setLoading(true);
            try {
                const response = await fetchData({ apiUrl: `${apiConfig.subcriptionLinks.subcriptionUrl}/tiers` });
                if (response) {
                    setSubcriptions(response);
                }
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
            } finally {
                setLoading(false);
            }
        }
        getSubscriptionsList();
    }, []);


    const getActiveSubscriptionList = async () => {
        try {
            const result = await fetchData({ apiUrl });
            if (result) {
                setActiveSubscription(result);
            }
        } 
        catch{
            console.error();
        }
    };

    useEffect(() => {
        getActiveSubscriptionList();
    }, []);


    return (
        <div className="flex flex-col gap-8">
            <PageHeader headerTitle='Subscription Tier' headerDescription='Manage your subscription-tier' />

            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 px-4 py-8 gap-8 bg-white rounded-xl border border-gray-300">
                {loading ? (
                    <div className="col-span-full text-center py-8">Loading subscription plans...</div>
                ) : subcriptions.length > 0 ? (
                    subcriptions.map((plan) => {
                        return (
                            <SubscriptionCard
                                key={plan.id}
                                id={plan.id}
                                name={plan.name}
                                commissionRate={plan.commissionRate.toString()}
                                duration={plan.durationInMonths.toString()}
                                price={plan.price.toString()}
                                activeSubscription={activeSubscription?.tier?.id === plan.id}
                            />
                        )
                    })
                ) : (
                    <div className="col-span-full text-center py-8">No subscription plans available</div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionPage;