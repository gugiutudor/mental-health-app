// Creează utilizatorul admin pentru testare
db.createUser({
    user: "admin",
    pwd: "password",
    roles: [
      { role: "readWrite", db: "mental-health-app-test" },
      { role: "readWrite", db: "mental-health-app-e2e" }
    ]
  });
  
  // Inițializează baza de date pentru testare
  db = db.getSiblingDB('mental-health-app-test');
  
  // Crează colecțiile necesare pentru teste
  db.createCollection('users');
  db.createCollection('moodentries');
  db.createCollection('exercises');
  db.createCollection('resources');
  db.createCollection('userprogresses');
  
  // Adaugă un utilizator de test
  db.users.insertOne({
    name: "Test User",
    email: "testuser@example.com",
    password: "$2b$10$xJwlZ4Zxh4/qeJ8G.XOW3.uG4OYCQ98XI.vMBf7lWJZQCRdRAqOhK", // hash pentru 'password123'
    dateJoined: new Date(),
    preferences: {
      notifications: true,
      reminderTime: "20:00",
      theme: "auto"
    },
    streak: 0,
    lastActive: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Adaugă câteva exerciții de test
  const testExercises = [
    {
      title: "Respirație profundă",
      description: "Un exercițiu simplu de respirație pentru reducerea stresului",
      category: "breathing",
      duration: 5,
      content: {
        steps: ["Pas 1: Inhalează adânc", "Pas 2: Ține respirația", "Pas 3: Expiră lent"]
      },
      difficulty: "beginner",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Meditație Mindfulness",
      description: "O meditație ghidată de mindfulness",
      category: "mindfulness",
      duration: 10,
      content: {
        steps: ["Pas 1: Găsește o poziție confortabilă", "Pas 2: Concentrează-te asupra respirației"]
      },
      difficulty: "intermediate",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  db.exercises.insertMany(testExercises);
  
  // Adaugă câteva resurse de test
  const testResources = [
    {
      title: "Înțelegerea anxietății",
      description: "Un articol despre tehnici de gestionare a anxietății",
      type: "article",
      url: "https://example.com/anxiety",
      tags: ["anxietate", "stres"],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: "Meditație pentru somn",
      description: "Un audio de meditație pentru a ajuta cu somnul",
      type: "audio",
      url: "https://example.com/sleep-audio",
      tags: ["somn", "relaxare"],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  db.resources.insertMany(testResources);
  
  // Initialize e2e database
  db = db.getSiblingDB('mental-health-app-e2e');
  db.createCollection('users');
  db.createCollection('moodentries');
  db.createCollection('exercises');
  db.createCollection('resources');
  db.createCollection('userprogresses');
  
  // Copy the same test data to e2e database
  db.exercises.insertMany(testExercises);
  db.resources.insertMany(testResources);