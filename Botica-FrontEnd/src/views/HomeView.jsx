import React from 'react';
import AppController from '../controllers/AppController';

function HomeView() {
  const controller = AppController();
  const { title, subtitle, counter, increment, decrement } = controller;

  return (
    <div className="App">
      <header className="App-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={decrement} aria-label="decrement">-</button>
          <strong>{counter}</strong>
          <button onClick={increment} aria-label="increment">+</button>
        </div>
      </header>
    </div>
  );
}

export default HomeView;
