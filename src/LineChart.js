// src/LineChart.js
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';
import { ja } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

const LineChart = ({ weightData, fatData, goalWeight, goalFat }) => {
  const weightValues = weightData.map(item => parseFloat(item.value));
  const minWeight = Math.min(...weightValues);
  const maxWeight = Math.max(...weightValues);
  const goalWeightValue = goalWeight !== null ? parseFloat(goalWeight) : null;

  // 目標体重が範囲内に含まれているか確認し、含まれていない場合は範囲を拡張
  const adjustedMinWeight = goalWeightValue !== null && goalWeightValue < minWeight ? goalWeightValue - 1 : minWeight - 1;
  const adjustedMaxWeight = goalWeightValue !== null && goalWeightValue > maxWeight ? goalWeightValue + 1 : maxWeight + 1;

  const fatValues = fatData.map(item => parseFloat(item.value));
  const minFat = Math.min(...fatValues);
  const maxFat = Math.max(...fatValues);
  const goalFatValue = goalFat !== null ? parseFloat(goalFat) : null;

  // 目標体脂肪率が範囲内に含まれているか確認し、含まれていない場合は範囲を拡張
  const adjustedMinFat = goalFatValue !== null && goalFatValue < minFat ? goalFatValue - 1 : minFat - 1;
  const adjustedMaxFat = goalFatValue !== null && goalFatValue > maxFat ? goalFatValue + 1 : maxFat + 1;

  const chartData = {
    labels: weightData.map(item => item.date), // 日付をラベルに使用
    datasets: [
      {
        label: 'Weight',
        data: weightValues,
        borderColor: 'rgba(75, 192, 192, 1)',
        yAxisID: 'y-axis-weight',
      },
      {
        label: 'Fat Percentage',
        data: fatValues,
        borderColor: 'rgba(255, 99, 132, 1)',
        yAxisID: 'y-axis-fat',
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
        text: 'Weight and Fat Percentage',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw;
            const date = context.label;
            return `${label}: ${value} (${date})`;
          }
        }
      },
      annotation: {
        annotations: {
          goalWeightLine: {
            type: 'line',
            yMin: goalWeightValue,
            yMax: goalWeightValue,
            borderColor: 'rgba(75, 192, 192, 0.6)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              enabled: true,
              content: 'Goal Weight',
              position: 'end'
            }
          },
          goalFatLine: {
            type: 'line',
            yScaleID: 'y-axis-fat', // 体脂肪率の目標値を体脂肪率の軸に描画
            yMin: goalFatValue,
            yMax: goalFatValue,
            borderColor: 'rgba(255, 99, 132, 0.6)',
            borderWidth: 2,
            borderDash: [6, 6],
            label: {
              enabled: true,
              content: 'Goal Fat Percentage',
              position: 'end'
            }
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'month',
          tooltipFormat: 'MMM dd, yyyy',
          displayFormats: {
            month: 'MMM yyyy',
          }
        },
        adapters: {
          date: {
            locale: ja,
          }
        }
      },
      'y-axis-weight': {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Weight (kg)',
        },
        min: adjustedMinWeight,
        max: adjustedMaxWeight,
      },
      'y-axis-fat': {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Fat Percentage (%)',
        },
        grid: {
          drawOnChartArea: false, // 右側のy軸のグリッドラインを非表示
        },
        min: adjustedMinFat,
        max: adjustedMaxFat,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;
