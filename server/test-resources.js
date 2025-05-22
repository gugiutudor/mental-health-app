// Script pentru testarea resolver-ilor de resurse
// Rulează în directorul server: node test-resources.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Încarcă variabilele de mediu
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Importă modelele și resolver-ii
const { Resource } = require('./src/models');
const resourceResolvers = require('./src/resolvers/resource');

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

// Testează resolver-ul getResources
async function testGetResources() {
  console.log('\n🧪 Testarea resolver-ului getResources...');
  
  try {
    const result = await resourceResolvers.Query.getResources(null, { limit: 5 });
    console.log(`✅ getResources returnează ${result.length} resurse`);
    
    if (result.length > 0) {
      console.log('📋 Prima resursă:');
      console.log(`   - Titlu: ${result[0].title}`);
      console.log(`   - Tip: ${result[0].type}`);
      console.log(`   - Tags: ${result[0].tags ? result[0].tags.join(', ') : 'N/A'}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Eroare la testarea getResources:', error);
    throw error;
  }
}

// Testează resolver-ul getRecommendedResources
async function testGetRecommendedResources() {
  console.log('\n🧪 Testarea resolver-ului getRecommendedResources...');
  
  try {
    // Test fără utilizator autentificat
    const mockReq = { user: null };
    const result = await resourceResolvers.Query.getRecommendedResources(null, { limit: 3 }, { req: mockReq });
    
    console.log(`✅ getRecommendedResources returnează ${result.length} resurse`);
    
    if (result.length > 0) {
      console.log('📋 Prima recomandare:');
      console.log(`   - Titlu: ${result[0].resource.title}`);
      console.log(`   - Scor: ${result[0].score}`);
      console.log(`   - Tip: ${result[0].resource.type}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Eroare la testarea getRecommendedResources:', error);
    throw error;
  }
}

// Testează căutarea după tag-uri
async function testResourcesByTags() {
  console.log('\n🧪 Testarea căutării după tag-uri...');
  
  try {
    const tags = ['anxietate', 'meditație'];
    const result = await resourceResolvers.Query.getResources(null, { tags, limit: 5 });
    
    console.log(`✅ Căutarea după tag-uri [${tags.join(', ')}] returnează ${result.length} resurse`);
    
    result.forEach((resource, index) => {
      console.log(`   ${index + 1}. ${resource.title}`);
      console.log(`      Tags: ${resource.tags ? resource.tags.join(', ') : 'N/A'}`);
    });
    
    return result;
  } catch (error) {
    console.error('❌ Eroare la testarea căutării după tag-uri:', error);
    throw error;
  }
}

// Testează căutarea după tip
async function testResourcesByType() {
  console.log('\n🧪 Testarea căutării după tip...');
  
  try {
    const type = 'video';
    const result = await resourceResolvers.Query.getResources(null, { type, limit: 5 });
    
    console.log(`✅ Căutarea după tipul "${type}" returnează ${result.length} resurse`);
    
    result.forEach((resource, index) => {
      console.log(`   ${index + 1}. ${resource.title} (${resource.type})`);
    });
    
    return result;
  } catch (error) {
    console.error('❌ Eroare la testarea căutării după tip:', error);
    throw error;
  }
}

// Verifică structura datelor
async function verifyDataStructure() {
  console.log('\n🔍 Verificarea structurii datelor...');
  
  try {
    const resources = await Resource.find().limit(3);
    
    console.log(`✅ Găsite ${resources.length} resurse în baza de date`);
    
    resources.forEach((resource, index) => {
      console.log(`\n📋 Resursa ${index + 1}:`);
      console.log(`   - ID: ${resource.id || resource._id}`);
      console.log(`   - Titlu: ${resource.title}`);
      console.log(`   - Tip: ${resource.type}`);
      console.log(`   - URL: ${resource.url}`);
      console.log(`   - Tags: ${resource.tags ? resource.tags.join(', ') : 'N/A'}`);
      console.log(`   - RecommendedFor: ${resource.recommendedFor ? resource.recommendedFor.length : 0} reguli`);
    });
    
  } catch (error) {
    console.error('❌ Eroare la verificarea structurii:', error);
    throw error;
  }
}

// Funcția principală
async function main() {
  console.log('🧪 SCRIPT DE TESTARE PENTRU RESURSE');
  console.log('===================================');
  
  try {
    await connectToDatabase();
    
    // Verifică structura datelor
    await verifyDataStructure();
    
    // Testează resolver-ii
    await testGetResources();
    await testGetRecommendedResources();
    await testResourcesByTags();
    await testResourcesByType();
    
    console.log('\n🎉 Toate testele au trecut cu succes!');
    console.log('💡 Resolver-ii pentru resurse funcționează corect.');
    
  } catch (error) {
    console.error('\n❌ Eroare în procesul de testare:', error);
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