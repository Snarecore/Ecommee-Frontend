const DashboardSkeleton = () => {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-gray-200 h-24 rounded-lg" />
          ))}
        </div>
  
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-5 bg-gray-200 w-32 rounded" />
            <div className="h-4 bg-gray-200 w-20 rounded" />
          </div>
  
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
              {/* @ts-ignore */}
                {['Sl', 'Name', 'Main Category', 'Price', 'Created At', 'Action'].map((header, index) => (
                  <th key={index} className="p-2">
                    <div className="h-4 bg-gray-300 rounded w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-2"><div className="h-4 w-6 bg-gray-200 rounded" /></td>
                  <td className="p-2 flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-300 rounded" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </td>
                  <td className="p-2"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                  <td className="p-2"><div className="h-4 w-8 bg-gray-200 rounded" /></td>
                  <td className="p-2"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
                  <td className="p-2"><div className="h-6 w-6 bg-gray-300 rounded-full" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default DashboardSkeleton;
  