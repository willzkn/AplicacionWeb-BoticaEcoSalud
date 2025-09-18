import { useState, useCallback } from 'react';
import { initialState } from '../models/AppModel';

export default function AppController() {
  const [counter, setCounter] = useState(initialState.counter);

  const increment = useCallback(() => setCounter((c) => c + 1), []);
  const decrement = useCallback(() => setCounter((c) => c - 1), []);

  return {
    title: initialState.title,
    subtitle: initialState.subtitle,
    counter,
    increment,
    decrement,
  };
}
