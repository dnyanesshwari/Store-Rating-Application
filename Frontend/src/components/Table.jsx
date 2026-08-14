import React from 'react';

function Table({ columns, data }) {
  return (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem'
    }}>
      <thead>
        <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
          {columns.map((col) => (
            <th key={col.key} style={{
              padding: '0.75rem',
              textAlign: 'left',
              fontWeight: 'bold',
              borderBottom: '2px solid #ddd'
            }}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data && data.length > 0 ? (
          data.map((row, idx) => (
            <tr key={idx} style={{
              borderBottom: '1px solid #ddd',
              backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9'
            }}>
              {columns.map((col) => (
                <td key={col.key} style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid #ddd'
                }}>
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} style={{
              padding: '1rem',
              textAlign: 'center',
              color: '#999'
            }}>
              No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default Table;