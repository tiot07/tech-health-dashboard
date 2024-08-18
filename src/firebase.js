// src/firebase.js
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import firebaseConfig from "./firebaseConfig";
import { format } from 'date-fns';

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);

const database = firebase.database();

// WeightとFatのデータ取得関数
export const getWeightData = async () => {
  const snapshot = await database.ref('healthData/weight').once('value');
  return snapshot.val();
};

export const getFatData = async () => {
  const snapshot = await database.ref('healthData/fat').once('value');
  return snapshot.val();
};

// チャットメッセージの送信関数
export const sendMessage = (name, message) => {
  const timestamp = new Date().toISOString();
  const date = format(new Date(), 'yyyy-MM-dd');
  const chatRef = database.ref(`Chat/${date}`);
  const newMessageRef = chatRef.push();
  newMessageRef.set({
    name,
    message,
    timestamp
  });
};

// 日付ごとのチャットメッセージ取得関数
export const fetchMessagesByDate = async (date) => {
  const snapshot = await database.ref(`Chat/${date}`).once('value');
  return snapshot.val() || {};
};

// 目標の設定および取得関数
export const setGoal = (goal) => {
  database.ref('Goal').set(goal);
};

export const getGoal = async () => {
  const snapshot = await database.ref('Goal').once('value');
  return snapshot.val() || {};
};

// 睡眠データの取得関数
export const getSleepData = async (date) => {
  console.log(`Fetching sleep data for date: ${date}`); // デバッグ用ログ
  const snapshot = await database.ref(`Oura/sleep/${date}`).once('value');
  if (snapshot.exists()) {
    console.log(`Snapshot data:`, snapshot.val()); // デバッグ用ログ
    return snapshot.val();
  } else {
    console.log(`No data available for date: ${date}`); // デバッグ用ログ
    return null;
  }
};

// 消費カロリーと歩数データの取得関数
export const getDailyActivityData = async (date) => {
  const snapshot = await database.ref(`Oura/daily_activity/${date}`).once('value');
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    return { total_calories: 0, steps: 0 };
  }
};

// 睡眠スコアの取得関数
export const getSleepScore = async (date) => {
  const snapshot = await database.ref(`Oura/daily_sleep/${date}/score`).once('value');
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    return '-';
  }
};
