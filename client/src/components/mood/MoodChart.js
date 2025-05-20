// client/src/components/mood/MoodChart.js - modificări pentru filtrarea datelor corectă

import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { format, isValid } from 'date-fns';
import { ro } from 'date-fns/locale';

// Înregistrează componentele ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MoodChart = ({ entries }) => {
  // Verifică dacă entries este un array valid
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Nu există date de dispoziție disponibile pentru afișare.</p>
      </div>
    );
  }

  // Funcție pentru a verifica și converti data în format valid
  const parseDate = (dateString) => {
    if (!dateString) return null;

    try {
      // Verifică dacă e deja un obiect Date
      if (dateString instanceof Date) {
        return isValid(dateString) ? dateString : null;
      }

      // Încearcă să convertească string-ul la Date
      const date = new Date(dateString);
      return isValid(date) && !isNaN(date.getTime()) ? date : null;
    } catch (error) {
      console.error('Eroare la parsarea datei:', error);
      return null;
    }
  };

  // Funcție pentru a formata data pentru afișare
  const formatDateLabel = (dateString) => {
    const date = parseDate(dateString);
    if (!date) return 'Dată necunoscută';

    try {
      return format(date, 'EEE, d MMM', { locale: ro });
    } catch (error) {
      console.error('Eroare la formatarea datei:', error);
      return 'Dată necunoscută';
    }
  };

  // Filtrează intrările cu date valide și valori de dispoziție valide
  const validEntries = entries.filter(entry => {
    if (!entry) return false;

    // Verifică dacă mood există și este un număr valid
    if (entry.mood === undefined || entry.mood === null) return false;
    const moodValue = Number(entry.mood);
    if (isNaN(moodValue)) return false;

    // Verifică dacă data poate fi parsată
    const date = parseDate(entry.date);
    return date !== null;
  });

  if (validEntries.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Nu există date de dispoziție valide pentru afișare.</p>
      </div>
    );
  }

  // Convertește toate datele la obiecte Date pentru a putea fi sortate
  const entriesWithDates = validEntries.map(entry => ({
    ...entry,
    parsedDate: parseDate(entry.date)
  }));

  // Sortează intrările după dată (cea mai veche prima)
  const sortedEntries = [...entriesWithDates].sort((a, b) => {
    return a.parsedDate - b.parsedDate;
  });

  // Extrage datele pentru grafic
  const labels = sortedEntries.map(entry => formatDateLabel(entry.parsedDate));
  const moodData = sortedEntries.map(entry => {
    const moodValue = Number(entry.mood);
    return isNaN(moodValue) ? 5 : moodValue; // Folosește 5 ca valoare implicită
  });

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
    // client/src/components/mood/MoodChart.js (continuare)
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          afterLabel: function (context) {
            const entryIndex = context.dataIndex;
            const entry = sortedEntries[entryIndex];
            let extraInfo = [];

            if (entry && entry.notes) {
              extraInfo.push(`Note: ${entry.notes}`);
            }

            // Verifică dacă factorii există înainte de a-i accesa
            if (entry && entry.factors) {
              // Verifică fiecare factor individual
              if (entry.factors.sleep !== undefined && entry.factors.sleep !== null) {
                extraInfo.push(`Somn: ${entry.factors.sleep}/5`);
              }
              if (entry.factors.stress !== undefined && entry.factors.stress !== null) {
                extraInfo.push(`Stres: ${entry.factors.stress}/5`);
              }
              if (entry.factors.activity !== undefined && entry.factors.activity !== null) {
                extraInfo.push(`Activitate: ${entry.factors.activity}/5`);
              }
              if (entry.factors.social !== undefined && entry.factors.social !== null) {
                extraInfo.push(`Social: ${entry.factors.social}/5`);
              }
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