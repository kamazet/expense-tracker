import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import TransactionTable from './components/TransactionTable';
import './App.css'; // where we'll move your styles

function App() {
  const [transactions, setTransactions] = useState([]);

  return (
    <div className="container">
      <FileUploader onUploadSuccess={setTransactions} />
      {transactions.length > 0 && (
        <TransactionTable transactions={transactions} setTransactions={setTransactions} />
      )}
    </div>
  );
}

export default App;
