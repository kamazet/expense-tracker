import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const categories = {
  Finance: ['Banking', 'Insurance', 'Investment', 'Job', 'Misc', 'Taxes'],
  Food: ['Coffee', 'Groceries', 'Meal', 'Snack'],
  Giving: ['Church', 'Donation', 'Gift'],
  Living: ['Fitness', 'Lodging', 'Phone', 'Rent', 'Utilities'],
  Medical: ['Medical'],
  Misc: ['Misc'],
  Recreation: ['Concerts', 'Drinks', 'Misc', 'Movies', 'Video Games'],
  Supplies: ['Cabinet', 'Skincare', 'Clothes', 'Beauty', 'Furniture', 'Misc', 'Shoes', 'Tech', 'Appliances'],
  Transportation: ['Bus', 'Flight', 'Gas', 'Misc', 'Parking', 'Public', 'Rental', 'Rideshare', 'Train']
};

function TransactionTable({ transactions, setTransactions }) {
  const handleDownload = async () => {
    try {
      // Create a new workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(transactions);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Create blob and download
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const today = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `transactions-${today}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Failed to download Excel file. Please try again.');
    }
  };
  const handleDelete = (index) => {
    const updated = [...transactions];
    updated.splice(index, 1);
    setTransactions(updated);
  };

  const handleInputChange = (index, field, value) => {
    const updated = [...transactions];
    updated[index][field] = value;
    setTransactions(updated);
  };

  return (
    <div className="results-container">
      <div className="table-header">
        <h2>Transaction Results</h2>
        <div className="table-actions">
          <span>{transactions.length} transactions</span>
          <button 
            onClick={handleDownload}
            className="download-button"
            disabled={transactions.length === 0}
          >
            Download as Excel
          </button>
        </div>
      </div>

      <table className="transaction-table">
        <thead>
          <tr>
            <th></th>
            <th>Date</th>
            <th>Category</th>
            <th>Subcategory</th>
            <th>Amount</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, idx) => (
            <tr key={idx}>
              <td>
                <button onClick={() => handleDelete(idx)} className="delete-button">×</button>
              </td>
              <td>{txn.Date}</td>
              <td>
                <select
                  value={txn.Category || ''}
                  onChange={(e) => handleInputChange(idx, 'Category', e.target.value)}
                >
                  <option value=""></option>
                  {Object.keys(categories).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </td>
              <td>
                <select
                  value={txn.Subcategory || ''}
                  onChange={(e) => handleInputChange(idx, 'Subcategory', e.target.value)}
                >
                  <option value=""></option>
                  {txn.Category 
                    ? categories[txn.Category].map((subcat) => (
                        <option key={subcat} value={subcat}>{subcat}</option>
                      ))
                    : Object.entries(categories).flatMap(([category, subcategories]) =>
                        subcategories.map(subcat => (
                          <option key={`${category}-${subcat}`} value={subcat}>
                            {subcat} ({category})
                          </option>
                        ))
                      )
                  }
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={txn.Amount || ''}
                  onChange={(e) => handleInputChange(idx, 'Amount', e.target.value)}
                  className={`${txn.Amount > 0 ? 'amount-positive' : txn.Amount < 0 ? 'amount-negative' : ''}`}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={txn.Description || ''}
                  onChange={(e) => handleInputChange(idx, 'Description', e.target.value)}
                  style={{ width: '100%' }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;
