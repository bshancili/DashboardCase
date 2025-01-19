import React from "react";
import "../styles/dashboard.css";

const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const Dashboard = ({
  title,
  currentMonthData,
  previousMonthData,
  dataType,
}) => {
  return (
    <div className="dashboard">
      <h2>{title}</h2>
      {currentMonthData && currentMonthData.length > 0 ? (
        currentMonthData.map((data) => {
          const prevData = previousMonthData.find(
            (item) => item.vendor_name === data.vendor_name
          );
          const dataChange = prevData
            ? calculatePercentageChange(
                dataType === "sales" ? data.total_sales : data.total_orders,
                dataType === "sales"
                  ? prevData.total_sales
                  : prevData.total_orders
              )
            : 0;

          const dataChangeColor =
            dataChange > 0 ? "green" : dataChange < 0 ? "red" : "gray";

          return (
            <div key={data._id} className="dashboard-item">
              <div
                className={
                  dataType === "sales" ? "sales-number" : "orders-number"
                }
              >
                <span
                  className={
                    dataType === "sales" ? "sales-amount" : "orders-amount"
                  }
                >
                  {dataType === "sales"
                    ? `$${data.total_sales.toFixed(2)}`
                    : data.total_orders.toFixed(0)}
                </span>
              </div>
              <div
                className={
                  dataType === "sales" ? "sales-change" : "orders-change"
                }
              >
                <span>
                  <span style={{ color: dataChangeColor }}>
                    {dataChange.toFixed(2)}%
                  </span>{" "}
                  compared to last month
                </span>
              </div>
            </div>
          );
        })
      ) : (
        <p>No data this month.</p>
      )}
    </div>
  );
};

export default Dashboard;
