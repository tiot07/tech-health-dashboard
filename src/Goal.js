// src/Goal.js
import React, { useState, useEffect } from 'react';
import { setGoal, getGoal } from './firebase';

const Goal = () => {
  const [goalDate, setGoalDate] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [goalFat, setGoalFat] = useState('');

  useEffect(() => {
    const fetchGoal = async () => {
      const goal = await getGoal();
      if (goal) {
        setGoalDate(goal.date || '');
        setGoalWeight(goal.weight || '');
        setGoalFat(goal.fat || '');
      }
    };

    fetchGoal();
  }, []);

  const handleSaveGoal = () => {
    const goal = {
      date: goalDate,
      weight: goalWeight,
      fat: goalFat
    };
    setGoal(goal);
  };

  return (
    <div>
      <h2>Set Your Goal</h2>
      <label>
        Date:
        <input
          type="date"
          value={goalDate}
          onChange={(e) => setGoalDate(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />
      </label>
      <label>
        Target Weight (kg):
        <input
          type="number"
          value={goalWeight}
          onChange={(e) => setGoalWeight(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />
      </label>
      <label>
        Target Fat Percentage (%):
        <input
          type="number"
          value={goalFat}
          onChange={(e) => setGoalFat(e.target.value)}
          style={{ width: '100%', marginBottom: '10px' }}
        />
      </label>
      <button onClick={handleSaveGoal} style={{ width: '100%' }}>
        Save Goal
      </button>
    </div>
  );
};

export default Goal;
