'use client';

import { useState, useEffect } from 'react';
import VoiceInput from '@/app/components/VoiceInput';
import ResultTable from '@/app/components/ResultTable';
import ResultChart from '@/app/components/ResultChart';
import { BarChart3, Table } from 'lucide-react';

export default function QueryForm() {
  const [question, setQuestion] = useState('');
  const [sql, setSql] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [patientCount, setPatientCount] = useState(0);
  const [viewMode, setViewMode] = useState(''); // "table" or "chart"

  useEffect(() => {
    const fetchPatientCount = async () => {
      try {
        const res = await fetch('http://localhost:8000/patients/count');
        const data = await res.json();
        setPatientCount(data.patient_count);
      } catch (err) {
        console.error('Error fetching patient count:', err);
      }
    };
    fetchPatientCount();
  }, []);

  const handleTranscriptChange = (transcript) => {
    setQuestion(transcript);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSql('');
    setResults([]);
    setViewMode('');

    try {
      const res = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setSql(data.sql);
      } else {
        setSql(data.sql);
        setResults(data.results);
      }
    } catch {
      setError('Failed to fetch results.');
    }
  };

  // chart-data section which is passed as prop to ResultChart
  const chartData =
  results.length > 0
    ? results
        .filter((row) => "age" in row) // Only keep rows that have an 'age' field
        .map((row, i) => ({
          name:
            row.name?.toString() ||
            row.patient_name?.toString() ||
            row.id?.toString() ||
            `Patient ${i + 1}`,
          value: Number(row.age) || 0, // always using age for y-axis heree
        }))
    : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#96b2d9] to-[#b8cbe8] p-8">
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          QueryFlow AI with HealthCare
        </h1>
        <p className="text-white/90 text-center mb-8">
          Use your voice or text to query the patient database.
          <br />
          <span className="inline-block mt-3 px-4 py-1 bg-white/25 text-white font-medium rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] backdrop-blur-md border border-white/40">
            Total Patients: {patientCount}
          </span>
        </p>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 relative flex flex-col items-center"
        >
          <div className="relative w-full max-w-2xl">
            <div className="flex items-center bg-white/90 rounded-full shadow-md border border-white/30 focus-within:ring-2 focus-within:ring-[#7257c5] transition">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., 'Show me all patients with diabetes'"
                className="flex-1 p-4 rounded-l-full text-gray-900 bg-transparent focus:outline-none placeholder-gray-500 resize-none"
                rows={1}
              />
              <VoiceInput onTranscriptChange={handleTranscriptChange} />
            </div>
          </div>

          <button
            type="submit"
            className="w-50 max-w-2xl bg-[#7257c5] text-white px-6 py-3 rounded-lg transform transition-transform duration-300 hover:scale-105 hover:bg-[#503c8f]"
          >
            Submit
          </button>
        </form>

        {/* Error Section */}
        {error && (
          <div className="mt-6 flex justify-center">
            <div className="p-2 w-fit bg-red-100/70 border border-red-300 text-red-800/80 rounded-xl shadow-sm backdrop-blur-sm text-center">
              <p className="font-semibold opacity-80">Error: {error}</p>
              {sql && (
                <pre className="mt-2 p-3 bg-gray-100/70 rounded text-sm text-gray-700/80 whitespace-pre-wrap">
                  SQL: {sql}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* SQL and Result Section */}
        {sql && !error && (
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-semibold text-white mb-3">
              Generated SQL
            </h2>
            <pre className="p-4 bg-white/80 rounded-xl text-gray-800 text-sm overflow-auto mb-8">
              {sql}
            </pre>

            <div className="flex justify-center gap-6 mb-6">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white font-medium transition ${
                  viewMode === 'table'
                    ? 'bg-[#7257c5]'
                    : 'bg-[#503c8f] hover:bg-[#7257c5]'
                }`}
              >
                <Table size={18} /> View as Table
              </button>

              <button
                onClick={() => setViewMode('chart')}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white font-medium transition ${
                  viewMode === 'chart'
                    ? 'bg-[#7257c5]'
                    : 'bg-[#503c8f] hover:bg-[#7257c5]'
                }`}
              >
                <BarChart3 size={18} /> View as Chart
              </button>
            </div>

            <div className="mt-8">
              {viewMode === 'table' && <ResultTable results={results} />}
              {viewMode === 'chart' && <ResultChart data={chartData} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
