import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

// Înregistrează componentele ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MoodChart = ({ entries }) => {
  // Sortează intrările după dată (cea mai veche prima)
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Formatează datele pentru grafic
  const labels = sortedEntries.map(entry => format(new Date(entry.date), 'EEE, d MMM', { locale: ro }));
  const moodData = sortedEntries.map(entry => entry.mood);
  
  // Configurează datele pentru grafic
  const data = {
    labels,
    datasets: [
      {
        label: 'Nivel dispoziție',
        data: moodData,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8
      }
    ]
  };
  
  // Opțiuni pentru grafic
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 1,
        max: 10,
        ticks: {
          stepSize: 1
        },
        title: {
          display: true,
          text: 'Nivel dispoziție (1-10)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Data'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context) {
            const entryIndex = context.dataIndex;
            const entry = sortedEntries[entryIndex];
            let extraInfo = [];
            
            if (entry.notes) {
              extraInfo.push(`Note: ${entry.notes}`);
            }
            
            if (entry.factors) {
              if (entry.factors.sleep) extraInfo.push(`Somn: ${entry.factors.sleep}/5`);
              if (entry.factors.stress) extraInfo.push(`Stres: ${entry.factors.stress}/5`);
              if (entry.factors.activity) extraInfo.push(`Activitate: ${entry.factors.activity}/5`);
              if (entry.factors.social) extraInfo.push(`Social: ${entry.factors.social}/5`);
            }
            
            return extraInfo;
          }
        }
      }
    }
  };
  
  return (
    <div style={{ height: '300px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default MoodChart;