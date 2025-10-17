'use client';

export default function ResultTable({ results }) {
  if (!results || results.length === 0) {
    return <p className="text-white/90 text-center">No results found.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white/80 rounded-xl shadow-md mt-6">
      <table className="min-w-full border border-gray-300 text-gray-800 rounded-xl border-collapse">
        {/* Header */}
        <thead>
          <tr className="bg-gray-200/70">
            {Object.keys(results[0]).map((key) => (
              <th
                key={key}
                className="py-3 px-4 text-center text-sm font-semibold border border-gray-300"
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {results.map((row, index) => (
            <tr
              key={index}
              className={`hover:bg-gray-100 transition-colors ${
                index % 2 === 0 ? 'bg-white/90' : 'bg-gray-50/70'
              }`}
            >
              {Object.values(row).map((value, i) => (
                <td
                  key={i}
                  className="py-3 px-4 border border-gray-300 text-sm align-middle"
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
