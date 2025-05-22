// Script pentru popularea bazei de date cu exerciții și resurse
// Rulează în directorul server: node populate-database.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Încarcă variabilele de mediu
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Importă modelele
const { Exercise, Resource } = require('./src/models');

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

// Date pentru exerciții - câte unul pentru fiecare categorie
const exercisesData = [
  {
    title: 'Meditația conștientă de 5 minute',
    description: 'O sesiune scurtă de meditație mindfulness pentru reducerea stresului și îmbunătățirea concentrării. Perfectă pentru începători sau pentru o pauză rapidă în timpul zilei.',
    category: 'mindfulness',
    duration: 5,
    content: {
      steps: [
        'Găsește un loc liniștit și confortabil unde să stai',
        'Închide ochii și respiră natural timp de câteva momente',
        'Concentrează-te pe senzația respirației în nări',
        'Când mintea rătăcește, readu-ți blând atenția la respirație',
        'Observă gândurile fără să le judeci, apoi revino la respirație',
        'Continuă această practică timp de 5 minute',
        'Deschide încet ochii și observă cum te simți'
      ]
    },
    recommendedFor: [
      {
        moodLevel: { min: 1, max: 6 }
      }
    ],
    difficulty: 'beginner'
  },
  {
    title: 'Respirația 4-7-8 pentru relaxare',
    description: 'Tehnica de respirație 4-7-8 este eficientă pentru reducerea anxietății și inducerea relaxării. Această metodă ajută la calmarea sistemului nervos.',
    category: 'breathing',
    duration: 3,
    content: {
      steps: [
        'Stai confortabil cu spatele drept',
        'Plasează vârful limbii pe cerul gurii, în spatele dinților',
        'Expiră complet prin gură, scoțând un sunet de "whoosh"',
        'Închide gura și inspiră prin nas numărând până la 4',
        'Ține respirația numărând până la 7',
        'Expiră prin gură numărând până la 8, scoțând sunetul "whoosh"',
        'Repetă ciclul de 3-4 ori',
        'Observă senzația de relaxare care se instalează'
      ]
    },
    recommendedFor: [
      {
        moodLevel: { min: 1, max: 5 }
      }
    ],
    difficulty: 'beginner'
  },
  {
    title: 'Restructurarea gândurilor negative',
    description: 'Exercițiu de terapie cognitiv-comportamentală pentru identificarea și schimbarea gândurilor negative automate. Util pentru gestionarea anxietății și depresiei.',
    category: 'cognitive',
    duration: 15,
    content: {
      steps: [
        'Identifică gândul negativ care te deranjează',
        'Scrie gândul pe hârtie exact așa cum îți vine în minte',
        'Întreabă-te: "Este acest gând realist și util?"',
        'Caută dovezi pentru și împotriva acestui gând',
        'Gândește-te la ce ai spune unui prieten în situația ta',
        'Reformulează gândul într-un mod mai echilibrat și realist',
        'Scrie noua versiune și observă cum te simți',
        'Practică această nouă perspectivă în situații similare'
      ]
    },
    recommendedFor: [
      {
        moodLevel: { min: 1, max: 6 }
      }
    ],
    difficulty: 'intermediate'
  },
  {
    title: 'Plimbare activă în natură',
    description: 'Exercițiu fizic combinat cu conectarea la natură pentru îmbunătățirea dispoziției și reducerea stresului. Activitatea fizică eliberează endorfine naturale.',
    category: 'physical',
    duration: 20,
    content: {
      steps: [
        'Alege un traseu în natură (parc, pădure, pe lângă apă)',
        'Începe cu un ritm confortabil de mers',
        'Concentrează-te pe mediul înconjurător: sunete, mirosuri, peisaje',
        'Respiră adânc și simte aerul proaspăt',
        'Accelerează puțin ritmul pentru a-ți mări pulsul',
        'Observă cum se schimbă starea ta pe măsură ce mergi',
        'În ultimele 5 minute, încetinește ritmul',
        'Termină cu câteva exerciții de stretching ușor'
      ]
    },
    recommendedFor: [
      {
        moodLevel: { min: 3, max: 8 }
      }
    ],
    difficulty: 'beginner'
  },
  {
    title: 'Conversație de conectare cu un prieten',
    description: 'Exercițiu de conectare socială pentru combaterea izolării și îmbunătățirea stării de spirit prin susținerea socială autentică.',
    category: 'social',
    duration: 30,
    content: {
      steps: [
        'Alege o persoană apropiată cu care nu ai vorbit recent',
        'Inițiază conversația cu o întrebare deschisă despre viața lor',
        'Ascultă activ, fără să planifici ce vei spune tu',
        'Pune întrebări de urmărire pentru a aprofunda discuția',
        'Împărtășește și tu ceva personal despre cum te simți',
        'Evită să te plângi excesiv, menține un echilibru',
        'Exprimă aprecierea pentru timp și atenție',
        'Planifică o nouă întâlnire sau conversație'
      ]
    },
    recommendedFor: [
      {
        moodLevel: { min: 1, max: 7 }
      }
    ],
    difficulty: 'beginner'
  },
  {
    title: 'Jurnalul de recunoștință creativă',
    description: 'Exercițiu creativ care combină scrisul cu expresia artistică pentru cultivarea unei atitudini pozitive și a recunoștinței.',
    category: 'creative',
    duration: 15,
    content: {
      steps: [
        'Pregătește o hârtie și materiale de scris/desenat colorate',
        'Gândește-te la 3 lucruri pentru care ești recunoscător astăzi',
        'Pentru fiecare lucru, scrie câteva cuvinte și desenează un simbol',
        'Folosește culori care reflectă sentimentele tale pozitive',
        'Adaugă detalii decorative în jurul fiecărui element',
        'Scrie o scurtă poezie sau frază inspirațională',
        'Atașează pagina într-un loc vizibil ca memento',
        'Fotografiază creația pentru a o păstra digital'
      ]
    },
    recommendedFor: [
      {
        moodLevel: { min: 4, max: 10 }
      }
    ],
    difficulty: 'beginner'
  },
  {
    title: 'Tehnica de relaxare progresivă',
    description: 'Exercițiu comprehensive de relaxare care combină elemente de respirație, tensiune și eliberare musculară pentru reducerea stresului general.',
    category: 'other',
    duration: 12,
    content: {
      steps: [
        'Întinde-te confortabil pe spate, cu ochii închiși',
        'Începe cu câteva respirații adânci și lente',
        'Tensionează mușchii picioarelor timp de 5 secunde, apoi relaxează',
        'Fă același lucru cu mușchii abdomenului',
        'Continuă cu brațele, umerii și mușchii feței',
        'Simte diferența între tensiune și relaxare',
        'Respiră profund și observă întregul corp relaxat',
        'Rămâi în această stare timp de câteva minute'
      ]
    },
    recommendedFor: [
      {
        moodLevel: { min: 1, max: 8 }
      }
    ],
    difficulty: 'beginner'
  }
];

// Date pentru resurse - linkuri reale și utile
const resourcesData = [
  {
    title: 'Ghidul WHO pentru sănătatea mentală',
    description: 'Ghid comprehensive al Organizației Mondiale a Sănătății despre sănătatea mentală, cu informații bazate pe evidențe științifice.',
    type: 'article',
    url: 'https://www.who.int/news-room/fact-sheets/detail/mental-disorders',
    tags: ['OMS', 'informații generale', 'știință', 'prevenție'],
    recommendedFor: [
      {
        moodLevel: { min: 1, max: 10 }
      }
    ]
  },
  {
    title: 'Meditație ghidată pentru anxietate - Headspace',
    description: 'Video de meditație ghidată specializat pentru gestionarea anxietății, creat de experți în mindfulness.',
    type: 'video',
    url: 'https://www.headspace.com/meditation/anxiety',
    tags: ['anxietate', 'meditație', 'mindfulness', 'relaxare'],
    recommendedFor: [
      {
        moodLevel: { min: 1, max: 6 }
      }
    ]
  },
  {
    title: 'Podcast "Mental Health Matters" - NHS',
    description: 'Podcast oficial al sistemului de sănătate britanic cu episoade despre diverse aspecte ale sănătății mentale.',
    type: 'audio',
    url: 'https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/mental-health-podcasts/',
    tags: ['podcast', 'NHS', 'educație', 'diversitate'],
    recommendedFor: [
      {
        moodLevel: { min: 1, max: 10 }
      }
    ]
  },
  {
    title: 'Cărți recomandate pentru sănătatea mentală - Goodreads',
    description: 'Lista cuprinzătoare de cărți despre sănătatea mentală, cu review-uri și recomandări de la comunitatea de cititori.',
    type: 'book',
    url: 'https://www.goodreads.com/shelf/show/mental-health',
    tags: ['cărți', 'literatură de specialitate', 'autoajutorare', 'psihologie'],
    recommendedFor: [
      {
        moodLevel: { min: 3, max: 10 }
      }
    ]
  },
  {
    title: 'Infografic: Semnele depresiei și când să ceri ajutor',
    description: 'Infografic vizual și informativ despre recunoașterea semnelor depresiei și modalitățile de a obține ajutor profesional.',
    type: 'infographic',
    url: 'https://www.nimh.nih.gov/health/publications/depression/index.shtml',
    tags: ['depresie', 'semne', 'ajutor profesional', 'NIMH'],
    recommendedFor: [
      {
        moodLevel: { min: 1, max: 5 }
      }
    ]
  },
  {
    title: 'Aplicația Calm - Meditație și somn',
    description: 'Aplicație mobilă populară pentru meditație, relaxare și îmbunătățirea calității somnului, cu conținut divers și ghidat.',
    type: 'other',
    url: 'https://www.calm.com/',
    tags: ['aplicație', 'meditație', 'somn', 'tehnologie'],
    recommendedFor: [
      {
        moodLevel: { min: 1, max: 10 }
      }
    ]
  }
];

// Funcție pentru adăugarea exercițiilor
async function addExercises() {
  console.log('📝 Adăugarea exercițiilor...');
  
  try {
    // Verifică dacă există deja exerciții
    const existingCount = await Exercise.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Există deja ${existingCount} exerciții în baza de date.`);
      console.log('🔄 Ștergerea exercițiilor existente...');
      await Exercise.deleteMany({});
    }
    
    // Adaugă exercițiile noi
    const exercises = await Exercise.insertMany(exercisesData);
    console.log(`✅ ${exercises.length} exerciții adăugate cu succes!`);
    
    // Afișează categoriile adăugate
    const categories = [...new Set(exercises.map(ex => ex.category))];
    console.log(`📋 Categorii de exerciții: ${categories.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Eroare la adăugarea exercițiilor:', error);
    throw error;
  }
}

// Funcție pentru adăugarea resurselor
async function addResources() {
  console.log('📚 Adăugarea resurselor...');
  
  try {
    // Verifică dacă există deja resurse
    const existingCount = await Resource.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Există deja ${existingCount} resurse în baza de date.`);
      console.log('🔄 Ștergerea resurselor existente...');
      await Resource.deleteMany({});
    }
    
    // Adaugă resursele noi
    const resources = await Resource.insertMany(resourcesData);
    console.log(`✅ ${resources.length} resurse adăugate cu succes!`);
    
    // Afișează tipurile adăugate
    const types = [...new Set(resources.map(res => res.type))];
    console.log(`📋 Tipuri de resurse: ${types.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Eroare la adăugarea resurselor:', error);
    throw error;
  }
}

// Funcție pentru afișarea statisticilor
async function displayStats() {
  console.log('\n📊 STATISTICI FINALE:');
  console.log('=====================');
  
  const exerciseCount = await Exercise.countDocuments();
  const resourceCount = await Resource.countDocuments();
  
  console.log(`🏃‍♂️ Total exerciții: ${exerciseCount}`);
  console.log(`📚 Total resurse: ${resourceCount}`);
  
  // Statistici pe categorii de exerciții
  const exerciseCategories = await Exercise.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  
  console.log('\n🏃‍♂️ Exerciții pe categorii:');
  exerciseCategories.forEach(cat => {
    console.log(`   - ${cat._id}: ${cat.count}`);
  });
  
  // Statistici pe tipuri de resurse
  const resourceTypes = await Resource.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  
  console.log('\n📚 Resurse pe tipuri:');
  resourceTypes.forEach(type => {
    console.log(`   - ${type._id}: ${type.count}`);
  });
}

// Funcția principală
async function main() {
  console.log('🌱 SCRIPT PENTRU POPULAREA BAZEI DE DATE');
  console.log('========================================\n');
  
  try {
    await connectToDatabase();
    
    await addExercises();
    await addResources();
    await displayStats();
    
    console.log('\n🎉 Baza de date a fost populată cu succes!');
    console.log('💡 Poți acum testa aplicația cu conținut real.');
    
  } catch (error) {
    console.error('\n❌ Eroare în procesul de populare:', error);
    process.exit(1);
  } finally {
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
  console.log('\n🛑 Procesul a fost întrerupt de utilizator');
  await mongoose.connection.close();
  process.exit(0);
});

// Rulează funcția principală
main();