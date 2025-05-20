import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { format, isValid } from 'date-fns';
import { ro } from 'date-fns/locale';

// Înregistrează componentele ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MoodChart = ({ entries }) => {
  // Eliminăm console.log pentru a nu poluia testele
  // console.log('MoodChart entries:', entries);
  
  // Filtrează intrările cu date valide
  const validEntries = entries.filter(entry => {
    if (!entry.date) return false;
    const date = new Date(entry.date);
    return isValid(date) && !isNaN(date.getTime());
  });
  
  // Sortează intrările după dată (cea mai veche prima)
  const sortedEntries = [...validEntries].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
  
  // Verificare dacă există intrări valide pentru a afișa graficul
  if (sortedEntries.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Nu există date de dispoziție disponibile pentru afișare.</p>
      </div>
    );
  }
  
  // Formatează datele pentru grafic cu validare
  const labels = sortedEntries.map(entry => {
    try {
      const date = new Date(entry.date);
      return format(date, 'EEE, d MMM', { locale: ro });
    } catch (error) {
      console.error('Eroare formatare dată:', error);
      return 'Dată invalidă';
    }
  });
  
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
            
            if (entry && entry.notes) {
              extraInfo.push(`Note: ${entry.notes}`);
            }
            
            if (entry && entry.factors) {
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