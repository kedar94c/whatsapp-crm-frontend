export default function CustomerList({ customers, onSelect }) {
  return (
    <div style={{ width: '30%', borderRight: '1px solid #ccc' }}>
      <h3>Customers</h3>
      {customers.map(c => (
        <div
          key={c.customer_id}
          style={{ padding: 8, cursor: 'pointer' }}
          onClick={() => onSelect(c)}
        >
          <b>{c.phone}</b>
          <div style={{ fontSize: 12 }}>{c.last_message}</div>
        </div>
      ))}
    </div>
  );
}
