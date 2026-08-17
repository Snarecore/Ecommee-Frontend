import { FaCrown, FaCalendarAlt, FaMoneyBillWave, FaPercent } from "react-icons/fa";
import { formatPrettyDate } from "../../../../utils/date-utils";
import { Link } from "react-router-dom";
import EmptyComponent from "../../../../component/empty-component";

const SubcriptionInfo = ({ subscriptionData }: any) => {
  const isTierExpired = subscriptionData?.tier?.endDate
    ? new Date(subscriptionData?.tier?.endDate) < new Date()
    : false;

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-white to-gray-50 border border-yellow-200 rounded-2xl p-6 shadow-md">
      <div className="flex flex-col gap-5">
        {!subscriptionData?.tier ? (
          <EmptyComponent message="No Subsription tier yet! Please choose a subscription tier from subscription tab! "/>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div className="flex items-center gap-2 flex-1">
                <span className="bg-yellow-200 text-yellow-700 p-2 rounded-full">
                  <FaCrown size={18} />
                </span>
                <div className="flex items-center flex-1">
                  <span className="text-sm font-bold w-[120px]">Tier</span>
                  <span className="text-sm font-semibold mr-2">:</span>
                  <span className="">{subscriptionData?.tier?.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-1">
                <span className="bg-yellow-200 text-yellow-700 p-2 rounded-full">
                  <FaMoneyBillWave size={16} />
                </span>
                <div className="flex items-center flex-1">
                  <span className="text-sm font-bold w-[120px]">Tier Price</span>
                  <span className="text-sm mr-2">:</span>
                  <span className="">{`$${subscriptionData?.tier?.price}`}</span>
                  <span className="text-sm text-gray-500 ml-1">
                    / {subscriptionData?.tier?.durationInMonths} Month
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-6">
              <div className="flex items-center gap-2 flex-1">
                <span className="bg-yellow-200 text-yellow-700 p-2 rounded-full">
                  <FaCalendarAlt size={16} />
                </span>
                <div className="flex items-center flex-1">
                  <span className="text-sm font-bold w-[120px]">Start Date</span>
                  <span className="text-sm font-semibold text-gray-700 mr-2">:</span>
                  <span className="">{formatPrettyDate(subscriptionData?.startDate)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-1">
                <span className="bg-yellow-200 text-yellow-700 p-2 rounded-full">
                  <FaPercent size={16} />
                </span>
                <div className="flex items-center flex-1">
                  <span className="text-sm font-bold w-[120px]">Commission Rate</span>
                  <span className="text-sm mr-2">:</span>
                  <span className="">{`${subscriptionData?.tier?.commissionRate}%`}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="bg-yellow-200 text-yellow-700 p-2 rounded-full">
                <FaCalendarAlt size={16} />
              </span>
              <div className="flex items-center flex-wrap">
                <span className="text-sm font-bold w-[120px]">End Date</span>
                <span className="text-sm mr-2">:</span>
                <span className="text-lg font-bold">{subscriptionData?.tier?.endDate}</span>
              </div>
            </div>

            {isTierExpired && (
              <div className="text-center text-sm text-red-500 mt-2">
                <p>Your subscription tier has expired.</p>
              </div>
            )}

            <div className="mt-2">
              <Link
                to={`/subcriptions`}
                className="block text-center w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 transition text-white px-4 py-2 rounded-lg font-semibold shadow-md cursor-pointer text-base tracking-wide"
              >
                Upgrade Tier
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


export default SubcriptionInfo;
