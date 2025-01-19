import React, { useState, useEffect } from "react";
import Header from "./components/header";
import Dashboard from "./components/dashboard";
import SalesChart from "./components/salesChart";
import ProductTable from "./components/productTable";
import "./App.css";

function App() {
  // Helper function to get the current month
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  // Helper function to get the last four months
  const getLastFourMonths = (dateStr) => {
    const [year, month] = dateStr.split("-").map(Number);
    return Array.from({ length: 4 }, (_, i) => {
      const current = new Date(year, month - 1 - i);
      return {
        month: `${current.getFullYear()}-${String(
          current.getMonth() + 1
        ).padStart(2, "0")}`,
        display: current.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
      };
    }).reverse();
  };

  // Helper function to fetch sales data for a specific date range
  const fetchSalesDataForMonth = (startDate, endDate) => {
    return fetch(
      `http://localhost:5000/monthly-sales?startDate=${startDate}&endDate=${endDate}`
    ).then((response) => response.json());
  };

  // State variables
  const [vendors, setVendors] = useState([]); // List of vendors
  const [selectedVendor, setSelectedVendor] = useState(null); // Selected vendor
  const [selectedMonth, setSelectedMonth] = useState(() => getCurrentMonth()); // Selected month
  const [salesData, setSalesData] = useState({}); // Sales data for the current and previous month
  const [barChartData, setBarChartData] = useState([]); // Data for the bar chart (last 4 months)
  const [productsWithSales, setProductsWithSales] = useState([]); // List of products with sales data
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered list of products based on search
  const [page, setPage] = useState(0); // Current page in the product table
  const [rowsPerPage] = useState(10); // Number of rows per page in the product table
  const [searchQuery, setSearchQuery] = useState(""); // Search query for products
  const [openVendorDialog, setOpenVendorDialog] = useState(false); // State for vendor selection dialog

  // Fetch vendor data on initial load
  useEffect(() => {
    fetch("http://localhost:5000/vendors")
      .then((response) => response.json())
      .then((data) => {
        setVendors(data);
        if (data.length > 0) setSelectedVendor(data[0]); // Automatically select the first vendor
      })
      .catch(console.error);
  }, []);

  // Fetch product data when a vendor is selected
  useEffect(() => {
    if (selectedVendor) {
      fetch(`http://localhost:5000/parent_products/${selectedVendor._id}`)
        .then((response) => response.json())
        .then((data) => {
          setProductsWithSales(data);
          setFilteredProducts(data);
        })
        .catch(console.error);
    }
  }, [selectedVendor]);

  // Fetch sales data for the current and previous month when vendor or month changes
  useEffect(() => {
    if (selectedMonth && selectedVendor) {
      const [year, month] = selectedMonth.split("-");
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-${new Date(year, month, 0).getDate()}`;

      const previousMonth = getLastFourMonths(selectedMonth)[2].month;
      const [prevYear, prevMonth] = previousMonth.split("-");
      const prevStartDate = `${prevYear}-${prevMonth}-01`;
      const prevEndDate = `${prevYear}-${prevMonth}-${new Date(
        prevYear,
        prevMonth,
        0
      ).getDate()}`;

      // Fetch current and previous month sales data
      Promise.all([
        fetchSalesDataForMonth(startDate, endDate),
        fetchSalesDataForMonth(prevStartDate, prevEndDate),
      ]).then(([currentData, prevData]) => {
        setSalesData({
          currentMonth: currentData.filter(
            (d) => d.vendor_name === selectedVendor.name
          ),
          previousMonth: prevData.filter(
            (d) => d.vendor_name === selectedVendor.name
          ),
        });
      });
    }
  }, [selectedMonth, selectedVendor]);

  // Fetch and prepare bar chart data for the last 4 months
  useEffect(() => {
    if (selectedMonth && selectedVendor) {
      const lastFourMonths = getLastFourMonths(selectedMonth);

      Promise.all(
        lastFourMonths.map(({ month }) => {
          const [year, monthNum] = month.split("-");
          const startDate = `${year}-${monthNum}-01`;
          const endDate = `${year}-${monthNum}-${new Date(
            year,
            monthNum,
            0
          ).getDate()}`;
          return fetchSalesDataForMonth(startDate, endDate);
        })
      ).then((responses) => {
        setBarChartData(
          lastFourMonths.map(({ display }, i) => {
            const data = responses[i].find(
              (d) => d.vendor_name === selectedVendor.name
            );
            return { month: display, total_sales: data ? data.total_sales : 0 };
          })
        );
      });
    }
  }, [selectedMonth, selectedVendor]);

  // Handle search input changes for filtering products
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredProducts(
      query
        ? productsWithSales.filter((p) => p.name.toLowerCase().includes(query))
        : productsWithSales
    );
    setPage(0);
  };

  // Handle vendor selection from the dialog
  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setSearchQuery("");
    setPage(0);
    setOpenVendorDialog(false);
  };

  return (
    <div className="app-container">
      <h1>Dashboard Case</h1>
      <div className="app-body">
        <Header
          selectedVendor={selectedVendor}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          handleOpenVendorDialog={() => setOpenVendorDialog(true)}
          handleCloseVendorDialog={() => setOpenVendorDialog(false)}
          openVendorDialog={openVendorDialog}
          vendors={vendors}
          handleVendorSelect={handleVendorSelect}
        />

        <div className="dashboard-container">
          <Dashboard
            title="Monthly Sales"
            currentMonthData={salesData.currentMonth}
            previousMonthData={salesData.previousMonth}
            dataType="sales"
          />
          <Dashboard
            title="Monthly Orders"
            currentMonthData={salesData.currentMonth}
            previousMonthData={salesData.previousMonth}
            dataType="orders"
          />
        </div>

        <SalesChart
          title="Last 4 Months Sales"
          barChartData={barChartData}
          height={450}
        />

        <ProductTable
          title="Products with Lifetime Sales"
          filteredProducts={filteredProducts}
          searchQuery={searchQuery}
          handleSearchChange={handleSearchChange}
          rowsPerPage={rowsPerPage}
          page={page}
          handleChangePage={(_, newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
}

export default App;
