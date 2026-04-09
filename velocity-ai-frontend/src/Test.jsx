import React from 'react';

const Test = () => {
  console.log('Test component is rendering');

  return (
    <div style={{
      backgroundColor: 'red',
      color: 'white',
      padding: '50px',
      textAlign: 'center',
      fontSize: '24px',
      margin: '20px'
    }}>
      🔴 ТЕСТОВЫЙ КОМПОНЕНТ РАБОТАЕТ!
    </div>
  );
};

export default Test;