import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import "../styles/salesChart.css";

const SalesChart = ({ title, barChartData, height = 450 }) => {
  return (
    <div className="sales-chart-container">
      <h2>{title}</h2>
      {barChartData.length > 0 ? (
        <BarChart
          series={[{ data: barChartData.map((item) => item.total_sales) }]}
          height={height}
          xAxis={[
            {
              data: barChartData.map((item) => item.month),
              scaleType: "band",
            },
          ]}
          margin={{ top: 50, bottom: 50, left: 40, right: 10 }}
        />
      ) : (
        <p>No sales data available for the selected months.</p>
      )}
    </div>
  );
};

export default SalesChart;
