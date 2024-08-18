// src/CaloriesBarChart.js
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import 'chartjs-adapter-date-fns';
import { ja } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CaloriesBarChart = ({ activityData }) => {
  // 最新の7日分のデータを取得
  const recentActivityData = activityData.slice(-7);

  const chartData = {
    labels: recentActivityData.map(item => item.date), // 日付をラベルに使用
    datasets: [
      {
        label: '消費カロリー',
        data: recentActivityData.map(item => item.totalCalories),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
        yAxisID: 'y-axis-calories',
      },
      {
        label: 'アクティブカロリー',
        data: recentActivityData.map(item => item.activeCalories),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
        yAxisID: 'y-axis-calories',
        hidden: true, // 初期状態で非表示に設定
      },
      {
        label: '歩数',
        data: recentActivityData.map(item => item.steps),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        barPercentage: 0.6,
        categoryPercentage: 0.6,
        yAxisID: 'y-axis-steps',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Activity',
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM dd, yyyy',
          displayFormats: {
            day: 'MMM dd',
          },
        },
        adapters: {
          date: {
            locale: ja,
          }
        },
        title: {
          display: true,
          text: 'Date',
        },
        offset: true,
      },
      'y-axis-calories': {
        title: {
          display: true,
          text: 'Calories',
        },
        beginAtZero: true,
        position: 'left',
      },
      'y-axis-steps': {
        title: {
          display: true,
          text: 'Steps',
        },
        beginAtZero: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default CaloriesBarChart;
