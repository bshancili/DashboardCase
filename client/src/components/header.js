import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import "../styles/header.css";

const Header = ({
  selectedVendor,
  selectedMonth,
  setSelectedMonth,
  handleOpenVendorDialog,
  handleCloseVendorDialog,
  openVendorDialog,
  vendors,
  handleVendorSelect,
}) => {
  return (
    <div className="header">
      <div className="header-controls">
        <div className="vendor-data">
          <span
            className="selected-vendor-name"
            title={selectedVendor ? selectedVendor.name : ""}
          >
            {selectedVendor
              ? `${selectedVendor.name}'s Dashboard`
              : "No vendor selected"}
          </span>
          <span className="selected-month">
            {selectedMonth
              ? new Date(selectedMonth).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })
              : "No month selected"}
          </span>
        </div>

        <div className="button-group">
          <Button
            variant="outlined"
            onClick={handleOpenVendorDialog}
            className="vendor-picker"
          >
            Select Vendor
          </Button>

          <div className="month-picker-button">
            <input
              type="month"
              id="month-picker"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Dialog open={openVendorDialog} onClose={handleCloseVendorDialog}>
        <DialogTitle>Select Vendor</DialogTitle>
        <DialogContent>
          {vendors.map((vendor) => (
            <Button
              key={vendor._id}
              fullWidth
              variant="outlined"
              onClick={() => handleVendorSelect(vendor)}
            >
              {vendor.name}
            </Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVendorDialog} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Header;
