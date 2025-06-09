import React, { useState } from 'react';

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
      <h2>Transaction Results</h2>
      <p>{transactions.length} transactions extracted</p>

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
                  {txn.Category &&
                    categories[txn.Category].map((subcat) => (
                      <option key={subcat} value={subcat}>{subcat}</option>
                    ))}
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={txn.Amount || ''}
                  onChange={(e) => handleInputChange(idx, 'Amount', e.target.value)}
                  style={{ width: '80px', textAlign: 'right' }}
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
