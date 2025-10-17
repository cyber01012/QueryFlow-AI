"use client";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const ResultChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-6">
        No data available for chart.
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          <XAxis dataKey="name" stroke="#555" />
          <YAxis stroke="#555" />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" barSize={40} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResultChart;
