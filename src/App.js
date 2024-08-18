// src/App.js
import React, { useEffect, useState } from "react";
import { getWeightData, getFatData, getSleepData, getDailyActivityData, getGoal, getSleepScore, sendMessage } from "./firebase";
import LineChart from "./LineChart";
import CaloriesBarChart from "./CaloriesBarChart";
import { sub, parseISO, format } from 'date-fns';
import Chat from './Chat';
import Goal from './Goal';
import firebase from "firebase/compat/app";
import './App.css';

function App() {
  const [originalWeightData, setOriginalWeightData] = useState([]);
  const [originalFatData, setOriginalFatData] = useState([]);
  const [weightData, setWeightData] = useState([]);
  const [fatData, setFatData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [sleepDuration, setSleepDuration] = useState('-');
  const [wakeUpTime, setWakeUpTime] = useState('');
  const [sleepScore, setSleepScore] = useState('-');
  const [readinessScore, setReadinessScore] = useState('-');
  const [temperatureDeviation, setTemperatureDeviation] = useState('-');
  const [goalWeight, setGoalWeight] = useState(null);
  const [goalFat, setGoalFat] = useState(null);
  const [goalDate, setGoalDate] = useState(null); // 目標日の状態を追加

  useEffect(() => {
    const fetchData = async () => {
      const weight = await getWeightData();
      const fat = await getFatData();
      const today = format(new Date(), 'yyyy-MM-dd');
      const sleepData = await getSleepData(today);
      const sleepScoreValue = await getSleepScore(today);
      const goal = await getGoal();

      console.log("Sleep data:", sleepData);

      const formatData = (data) =>
        Object.entries(data).map(([date, value]) => ({
          date: parseISO(date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 8)),
          value: parseFloat(value),
        })).sort((a, b) => a.date - b.date);

      const formattedWeightData = formatData(weight);
      const formattedFatData = formatData(fat);

      setOriginalWeightData(formattedWeightData);
      setOriginalFatData(formattedFatData);

      if (sleepData) {
        const sleepDurationSeconds = sleepData.total_sleep_duration;
        const wakeUpTimeISO = sleepData.bedtime_end;
        const readinessScoreValue = sleepData.readiness?.score || '-';
        const temperatureDeviationValue = sleepData.readiness?.temperature_deviation || '-';

        const hours = Math.floor(sleepDurationSeconds / 3600);
        const minutes = Math.floor((sleepDurationSeconds % 3600) / 60);
        setSleepDuration(`${hours}時間${minutes}分`);

        const wakeUpDate = new Date(wakeUpTimeISO);
        const formattedWakeUpTime = format(wakeUpDate, 'HH:mm');
        setWakeUpTime(`起床時間: ${formattedWakeUpTime}`);

        setSleepScore(sleepScoreValue);
        setReadinessScore(readinessScoreValue);
        setTemperatureDeviation(`${temperatureDeviationValue}°C`);
      } else {
        setSleepDuration("-");
        setWakeUpTime("");
        setSleepScore(sleepScoreValue);
        setReadinessScore("-");
        setTemperatureDeviation("-");
      }

      if (goal) {
        if (goal.weight) {
          setGoalWeight(goal.weight);
        }
        if (goal.fat) {
          setGoalFat(goal.fat);
        }
        if (goal.date) {
          setGoalDate(goal.date);
        }
      }

      filterData(formattedWeightData, formattedFatData, { months: 3 });
    };

    fetchData();

    const goalRef = firebase.database().ref('Goal');
    goalRef.on('value', (snapshot) => {
      const updatedGoal = snapshot.val();
      if (updatedGoal) {
        if (updatedGoal.weight) {
          setGoalWeight(updatedGoal.weight);
        }
        if (updatedGoal.fat) {
          setGoalFat(updatedGoal.fat);
        }
        if (updatedGoal.date) {
          setGoalDate(updatedGoal.date);
        }
      }
    });

    const weightRef = firebase.database().ref('healthData/weight');
    const fatRef = firebase.database().ref('healthData/fat');
    const activityRef = firebase.database().ref('Oura/daily_activity');
    const sleepRef = firebase.database().ref('Oura/sleep');
    const dailySleepRef = firebase.database().ref('Oura/daily_sleep');

    const handleDataUpdate = async () => {
      const weight = await getWeightData();
      const fat = await getFatData();
      const today = format(new Date(), 'yyyy-MM-dd');
      const sleepData = await getSleepData(today);
      const sleepScoreValue = await getSleepScore(today);
      const goal = await getGoal();

      const formatData = (data) =>
        Object.entries(data).map(([date, value]) => ({
          date: parseISO(date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6, 8)),
          value: parseFloat(value),
        })).sort((a, b) => a.date - b.date);

      const formattedWeightData = formatData(weight);
      const formattedFatData = formatData(fat);

      setOriginalWeightData(formattedWeightData);
      setOriginalFatData(formattedFatData);

      if (sleepData) {
        const sleepDurationSeconds = sleepData.total_sleep_duration;
        const wakeUpTimeISO = sleepData.bedtime_end;
        const readinessScoreValue = sleepData.readiness?.score || '-';
        const temperatureDeviationValue = sleepData.readiness?.temperature_deviation || '-';

        const hours = Math.floor(sleepDurationSeconds / 3600);
        const minutes = Math.floor((sleepDurationSeconds % 3600) / 60);
        setSleepDuration(`${hours}時間${minutes}分`);

        const wakeUpDate = new Date(wakeUpTimeISO);
        const formattedWakeUpTime = format(wakeUpDate, 'HH:mm');
        setWakeUpTime(`起床時間: ${formattedWakeUpTime}`);

        setSleepScore(sleepScoreValue);
        setReadinessScore(readinessScoreValue);
        setTemperatureDeviation(`${temperatureDeviationValue}°C`);
      } else {
        setSleepDuration("-");
        setWakeUpTime("");
        setSleepScore(sleepScoreValue);
        setReadinessScore("-");
        setTemperatureDeviation("-");
      }

      if (goal) {
        if (goal.weight) {
          setGoalWeight(goal.weight);
        }
        if (goal.fat) {
          setGoalFat(goal.fat);
        }
        if (goal.date) {
          setGoalDate(goal.date);
        }
      }

      filterData(formattedWeightData, formattedFatData, { months: 3 });
    };

    weightRef.on('value', handleDataUpdate);
    fatRef.on('value', handleDataUpdate);
    activityRef.on('value', handleDataUpdate);
    sleepRef.on('value', handleDataUpdate);
    dailySleepRef.on('value', handleDataUpdate);

    return () => {
      goalRef.off();
      weightRef.off('value', handleDataUpdate);
      fatRef.off('value', handleDataUpdate);
      activityRef.off('value', handleDataUpdate);
      sleepRef.off('value', handleDataUpdate);
      dailySleepRef.off('value', handleDataUpdate);
    };
  }, []);

  const filterData = async (weightData, fatData, period) => {
    const now = new Date();
    const filteredWeightData = weightData.filter(item => item.date >= sub(now, period));
    const filteredFatData = fatData.filter(item => item.date >= sub(now, period));

    const startDate = sub(now, period);
    const endDate = now;
    const dates = [];
    for (let d = startDate; d <= endDate; d = new Date(d.setDate(d.getDate() + 1))) {
      dates.push(format(d, 'yyyy-MM-dd'));
    }
    const activityData = await Promise.all(
      dates.map(async date => {
        const data = await getDailyActivityData(date);
        return {
          date,
          totalCalories: data.total_calories,
          activeCalories: data.active_calories,
          steps: data.steps,
        };
      })
    );

    setWeightData(filteredWeightData);
    setFatData(filteredFatData);
    setActivityData(activityData);
  };

  const handleFilterData = (period) => {
    filterData(originalWeightData, originalFatData, period);
  };

  const handleFetchHealthData = async () => {
    try {
      const response = await fetch('https://us-central1-healtdashboard-c863b.cloudfunctions.net/saveHealthData', {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      console.log('Health data fetched and saved successfully.');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSendGeminiMessage = async () => {
    try {
      const message = `
        直近1週間のデータ:
        体重: ${weightData.map(item => `${new Date(item.date).toLocaleDateString()}: ${item.value}kg`).join(', ')}
        体脂肪率: ${fatData.map(item => `${new Date(item.date).toLocaleDateString()}: ${item.value}%`).join(', ')}
        消費カロリー: ${activityData.map(item => `${new Date(item.date).toLocaleDateString()}: ${item.totalCalories}kcal`).join(', ')}
        アクティブカロリー: ${activityData.map(item => `${new Date(item.date).toLocaleDateString()}: ${item.activeCalories}kcal`).join(', ')}
        歩数: ${activityData.map(item => `${new Date(item.date).toLocaleDateString()}: ${item.steps}歩`).join(', ')}

        当日のデータ:
        睡眠時間: ${sleepDuration}
        睡眠スコア: ${sleepScore}
        コンディション: ${readinessScore}
        体表温: ${temperatureDeviation}

        目標:
        体重: ${goalWeight}kg
        体脂肪率: ${goalFat}%
        目標日: ${goalDate || '未設定'}

        この目標に向かって、どのように食事や運動を気をつけたら良いでしょうか？
      `;

      // Send message to Gemini
      const response = await fetch('https://us-central1-healtdashboard-c863b.cloudfunctions.net/chat-with-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Save message to Firebase Realtime DB
      const jst = new Date().toISOString();
      const datePath = format(new Date(), 'yyyy-MM-dd');
      const data = {
        timestamp: jst,
        message,
        name: 'System'
      };
      const ref = firebase.database().ref(`Chat/${datePath}`);
      ref.push(data);

      console.log('Gemini message sent and saved successfully.');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <button onClick={handleFetchHealthData} style={{ position: 'absolute', top: 10, left: 10 }}>Fetch Health Data</button>
      <div className="chart-container">
        <h1>Health Data</h1>
        <div className="health-data-numbers">
          <div>
            <h3>睡眠時間</h3>
            <p>{sleepDuration}</p>
            <small>{wakeUpTime}</small>
          </div>
          <div>
            <h3>睡眠スコア</h3>
            <p>{sleepScore}</p>
          </div>
          <div>
            <h3>コンディション</h3>
            <p>{readinessScore}</p>
          </div>
          <div>
            <h3>体表温</h3>
            <p>{temperatureDeviation}</p>
          </div>
        </div>
        <div>
          <button onClick={() => handleFilterData({ years: 1 })}>Past 1 Year</button>
          <button onClick={() => handleFilterData({ months: 6 })}>Past 6 Months</button>
          <button onClick={() => handleFilterData({ months: 3 })}>Past 3 Months</button>
          <button onClick={() => handleFilterData({ months: 1 })}>Past 1 Month</button>
          <button onClick={() => handleFilterData({ weeks: 1 })}>Past 1 Week</button>
          <button onClick={() => {
            setWeightData(originalWeightData);
            setFatData(originalFatData);
          }}>Reset</button>
        </div>
        <LineChart weightData={weightData} fatData={fatData} goalWeight={goalWeight} goalFat={goalFat} />
        <CaloriesBarChart activityData={activityData} />
      </div>
      <div className="chat-container">
        <button onClick={handleSendGeminiMessage} style={{ width: '100%', marginBottom: '10px' }}>Send Daily Summary to Gemini</button>
        <Goal />
        <Chat />
      </div>
    </div>
  );
}

export default App;
