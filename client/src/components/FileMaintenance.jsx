import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const sampleTransactions = [
  {
    id: 'TXN001',
    date: '2025-04-14T10:00:00Z',
    description: 'Top-up via GCash',
    amount: 500,
    status: 'Success',
  },
  {
    id: 'TXN002',
    date: '2025-04-15T13:30:00Z',
    description: 'Top-up via Bank Transfer',
    amount: 1000,
    status: 'Pending',
  },
  {
    id: 'TXN003',
    date: '2025-04-16T08:45:00Z',
    description: 'Top-up via PayMaya',
    amount: 700,
    status: 'Failed',
  },
];

const FileMaintenance = () => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Simulate API call
    setTransactions(sampleTransactions);
  }, []);

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Success':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const filteredTransactions = transactions.filter((txn) =>
    txn.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h3 className="mb-3">My Transactions</h3>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search by description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.id}</td>
                <td>{new Date(txn.date).toLocaleString()}</td>
                <td>{txn.description}</td>
                <td>₱{txn.amount.toLocaleString()}</td>
                <td>
                  <span className={`badge bg-${getBadgeClass(txn.status)}`}>
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FileMaintenance;
