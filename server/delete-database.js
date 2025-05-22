// Script pentru golirea bazei de date
// Rulează în directorul server: node clear-database.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');

// Încarcă variabilele de mediu
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Importă toate modelele
const { User, MoodEntry, Exercise, Resource, UserProgress } = require('./src/models');

// Configurare pentru input de la utilizator
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Funcție pentru a cere confirmarea utilizatorului
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Conectare la MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectat la MongoDB');
  } catch (err) {
    console.error('❌ Eroare la conectarea cu MongoDB:', err);
    process.exit(1);
  }
}

// Funcții pentru ștergerea datelor
async function clearAllData() {
  console.log('🧹 Ștergerea TUTUROR datelor din baza de date...');
  
  const results = await Promise.all([
    User.deleteMany({}),
    MoodEntry.deleteMany({}),
    Exercise.deleteMany({}),
    Resource.deleteMany({}),
    UserProgress.deleteMany({})
  ]);
  
  console.log(`❌ Utilizatori șterși: ${results[0].deletedCount}`);
  console.log(`❌ Înregistrări de dispoziție șterse: ${results[1].deletedCount}`);
  console.log(`❌ Exerciții șterse: ${results[2].deletedCount}`);
  console.log(`❌ Resurse șterse: ${results[3].deletedCount}`);
  console.log(`❌ Progres utilizatori șters: ${results[4].deletedCount}`);
}

async function clearMoodData() {
  console.log('🧹 Ștergerea doar a datelor de dispoziție...');
  
  const results = await Promise.all([
    MoodEntry.deleteMany({}),
    UserProgress.deleteMany({})
  ]);
  
  console.log(`❌ Înregistrări de dispoziție șterse: ${results[0].deletedCount}`);
  console.log(`❌ Progres utilizatori șters: ${results[1].deletedCount}`);
}

async function clearContentData() {
  console.log('🧹 Ștergerea doar a conținutului (exerciții și resurse)...');
  
  const results = await Promise.all([
    Exercise.deleteMany({}),
    Resource.deleteMany({})
  ]);
  
  console.log(`❌ Exerciții șterse: ${results[0].deletedCount}`);
  console.log(`❌ Resurse șterse: ${results[1].deletedCount}`);
}

async function clearUsers() {
  console.log('🧹 Ștergerea utilizatorilor...');
  
  const result = await User.deleteMany({});
  console.log(`❌ Utilizatori șterși: ${result.deletedCount}`);
}

// Funcția principală
async function main() {
  await connectToDatabase();
  
  console.log('🗂️  SCRIPT PENTRU GOLIREA BAZEI DE DATE');
  console.log('=====================================\n');
  
  console.log('Opțiuni disponibile:');
  console.log('1. Șterge TOATE datele (utilizatori, dispoziții, exerciții, resurse)');
  console.log('2. Șterge doar datele de dispoziție și progres');
  console.log('3. Șterge doar exercițiile și resursele');
  console.log('4. Șterge doar utilizatorii');
  console.log('5. Anulează operația\n');
  
  const choice = await askQuestion('Alege o opțiune (1-5): ');
  
  if (choice === '5') {
    console.log('✅ Operația a fost anulată');
    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  }
  
  // Confirmarea finală
  console.log('\n⚠️  ATENȚIE: Această operație este IREVERSIBILĂ!');
  const confirm = await askQuestion('Ești sigur că vrei să continui? (da/nu): ');
  
  if (confirm.toLowerCase() !== 'da') {
    console.log('✅ Operația a fost anulată');
    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  }
  
  try {
    switch (choice) {
      case '1':
        await clearAllData();
        console.log('\n🎉 TOATE datele au fost șterse cu succes!');
        break;
      case '2':
        await clearMoodData();
        console.log('\n🎉 Datele de dispoziție au fost șterse cu succes!');
        break;
      case '3':
        await clearContentData();
        console.log('\n🎉 Exercițiile și resursele au fost șterse cu succes!');
        break;
      case '4':
        await clearUsers();
        console.log('\n🎉 Utilizatorii au fost șterși cu succes!');
        break;
      default:
        console.log('❌ Opțiune invalidă');
    }
  } catch (error) {
    console.error('❌ Eroare la ștergerea datelor:', error);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('🔌 Conexiunea la baza de date a fost închisă');
    process.exit(0);
  }
}

// Gestionarea erorilor
process.on('unhandledRejection', (err) => {
  console.error('❌ Eroare neașteptată:', err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Operația a fost întreruptă de utilizator');
  rl.close();
  await mongoose.connection.close();
  process.exit(0);
});

// Rulează funcția principală
main();