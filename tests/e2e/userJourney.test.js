// tests/e2e/userJourney.test.js
const { Builder, By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const { before, after, describe, it } = require('mocha');

describe('User Journey End-to-End Test', function() {
  // Acest test poate dura mai mult decât timeout-ul implicit
  this.timeout(30000);
  
  let driver;
  
  before(async function() {
    // Inițializare WebDriver
    driver = await new Builder().forBrowser('chrome').build();
    
    // Dimensiune fereastră
    await driver.manage().window().setRect({ width: 1280, height: 800 });
    
    // Așteaptă pentru serverul backend și frontend să pornească
    // Nota: acestea ar trebui pornite separat înainte de rularea testelor
  });
  
  after(async function() {
    // Închidere browser după toate testele
    if (driver) {
      await driver.quit();
    }
  });
  
  it('should complete a full user journey from registration to mood tracking', async function() {
    // Generare nume de utilizator unic pentru test
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'TestPassword123';
    const testName = 'Test User';
    
    // 1. Vizitează pagina de înregistrare
    await driver.get('http://localhost:3000/register');
    
    // Așteaptă încărcarea paginii
    await driver.wait(until.elementLocated(By.css('h2')), 5000);
    const title = await driver.findElement(By.css('h2')).getText();
    expect(title).to.equal('Înregistrare');
    
    // 2. Completează formularul de înregistrare
    await driver.findElement(By.id('name')).sendKeys(testName);
    await driver.findElement(By.id('email')).sendKeys(testEmail);
    await driver.findElement(By.id('password')).sendKeys(testPassword);
    await driver.findElement(By.id('confirmPassword')).sendKeys(testPassword);
    
    // Trimite formularul
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // 3. Așteaptă redirecționarea la dashboard
    await driver.wait(until.urlIs('http://localhost:3000/'), 5000);
    
    // Verifică că utilizatorul este autentificat
    const dashboardTitle = await driver.findElement(By.css('h1')).getText();
    expect(dashboardTitle).to.equal('Bun venit la aplicația de sănătate mentală');
    
    // 4. Adaugă o înregistrare de dispoziție
    // Așteaptă încărcarea componentei MoodTracker
    await driver.wait(until.elementLocated(By.css('form')), 5000);
    
    // Completează formularul de dispoziție
    // Setează nivelul dispoziției
    const moodSlider = await driver.findElement(By.id('mood'));
    // Avansăm la valoarea 8 (bulit mai fericit)
    await driver.executeScript('arguments[0].value = 8;', moodSlider);
    await driver.executeScript('arguments[0].dispatchEvent(new Event("change"))', moodSlider);
    
    // Adaugă o notă
    await driver.findElement(By.id('notes')).sendKeys('Mă simt energic astăzi!');
    
    // Setează factorii de influență
    const sleepSlider = await driver.findElement(By.id('factors.sleep'));
    await driver.executeScript('arguments[0].value = 4;', sleepSlider);
    await driver.executeScript('arguments[0].dispatchEvent(new Event("change"))', sleepSlider);
    
    const stressSlider = await driver.findElement(By.id('factors.stress'));
    await driver.executeScript('arguments[0].value = 2;', stressSlider);
    await driver.executeScript('arguments[0].dispatchEvent(new Event("change"))', stressSlider);
    
    // Trimite formularul
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Verifică mesajul de succes
    await driver.wait(until.elementLocated(By.css('.success-message')), 5000);
    const successMessage = await driver.findElement(By.css('.success-message')).getText();
    expect(successMessage).to.include('Înregistrarea dispoziției a fost salvată cu succes');
    
    // 5. Navigheză la exerciții
    await driver.findElement(By.linkText('Exerciții')).click();
    
    // Așteaptă încărcarea paginii de exerciții
    await driver.wait(until.urlIs('http://localhost:3000/exercises'), 5000);
    const exercisesTitle = await driver.findElement(By.css('h1')).getText();
    expect(exercisesTitle).to.equal('Exerciții pentru sănătate mentală');
    
    // 6. Filtrează exercițiile după categorie
    await driver.findElement(By.xpath('//button[text()="Respirație"]')).click();
    
    // Așteaptă filtrarea exercițiilor
    await driver.wait(until.elementLocated(By.css('.exercise-card')), 5000);
    
    // 7. Deschide un exercițiu
    await driver.findElement(By.css('.view-button')).click();
    
    // Așteaptă încărcarea paginii exercițiului
    await driver.wait(until.elementLocated(By.css('.exercise-title')), 5000);
    
    // Completează sondajul înainte de exercițiu
    const feelingBeforeSlider = await driver.findElement(By.id('feelingBefore'));
    await driver.executeScript('arguments[0].value = 5;', feelingBeforeSlider);
    await driver.executeScript('arguments[0].dispatchEvent(new Event("change"))', feelingBeforeSlider);
    
    // Începe exercițiul
    await driver.findElement(By.xpath('//button[text()="Începe exercițiul"]')).click();
    
    // Așteaptă afișarea cronometrului
    await driver.wait(until.elementLocated(By.css('.timer-display')), 5000);
    
    // 8. Finalizează exercițiul
    await driver.findElement(By.xpath('//button[text()="Finalizează"]')).click();
    
    // Completează feedback-ul
    const feelingAfterSlider = await driver.findElement(By.xpath('//input[@type="range"]'));
    await driver.executeScript('arguments[0].value = 7;', feelingAfterSlider);
    await driver.executeScript('arguments[0].dispatchEvent(new Event("change"))', feelingAfterSlider);
    
    // Selectează un rating
    await driver.findElement(By.xpath('//button[text()="4"]')).click();
    
    // Adaugă un comentariu
    await driver.findElement(By.id('feedbackComment')).sendKeys('Am simțit o îmbunătățire a stării mele.');
    
    // Salvează progresul
    await driver.findElement(By.xpath('//button[text()="Salvează progresul"]')).click();
    
    // Așteaptă mesajul de succes
    await driver.wait(until.elementLocated(By.css('.success-message')), 5000);
    
    // 9. Navigheză la resurse
    await driver.findElement(By.linkText('Resurse')).click();
    
    // Așteaptă încărcarea paginii de resurse
    await driver.wait(until.urlIs('http://localhost:3000/resources'), 5000);
    const resourcesTitle = await driver.findElement(By.css('h1')).getText();
    expect(resourcesTitle).to.equal('Resurse pentru sănătate mentală');
    
    // 10. Filtrează resursele după tip
    await driver.findElement(By.xpath('//button[text()="Articole"]')).click();
    
    // Adaugă un tag de filtru
    await driver.findElement(By.xpath('//button[text()="anxietate"]')).click();
    
    // Așteaptă filtrarea resurselor
    await driver.wait(until.elementLocated(By.css('.resource-card')), 5000);
    
    // 11. Navigheză la profil
    await driver.findElement(By.linkText('Profil')).click();
    
    // Așteaptă încărcarea paginii de profil
    await driver.wait(until.urlIs('http://localhost:3000/profile'), 5000);
    const profileTitle = await driver.findElement(By.css('h1')).getText();
    expect(profileTitle).to.equal('Profilul meu');
    
    // 12. Actualizează profilul
    // Schimbă numele
    const nameInput = await driver.findElement(By.id('name'));
    await nameInput.clear();
    await nameInput.sendKeys('Nume Actualizat');
    
    // Schimbă preferințele
    // Toggle notificări
    await driver.findElement(By.css('input[name="preferences.notifications"] + .switch')).click();
    
    // Schimbă tema
    const themeSelect = await driver.findElement(By.id('preferences.theme'));
    await themeSelect.click();
    await driver.findElement(By.css('option[value="dark"]')).click();
    
    // Salvează modificările
    await driver.findElement(By.xpath('//button[text()="Salvează modificările"]')).click();
    
    // Așteaptă mesajul de succes
    await driver.wait(until.elementLocated(By.css('.success-message')), 5000);
    const profileSuccessMessage = await driver.findElement(By.css('.success-message')).getText();
    expect(profileSuccessMessage).to.include('Profilul a fost actualizat cu succes');
    
    // 13. Delogare
    await driver.findElement(By.xpath('//button[text()="Deconectare"]')).click();
    
    // Verifică redirecționarea la pagina de autentificare
    await driver.wait(until.urlIs('http://localhost:3000/login'), 5000);
    const loginTitle = await driver.findElement(By.css('h2')).getText();
    expect(loginTitle).to.equal('Autentificare');
    
    // 14. Autentificare cu credențialele actualizate
    await driver.findElement(By.id('email')).sendKeys(testEmail);
    await driver.findElement(By.id('password')).sendKeys(testPassword);
    
    // Trimite formularul
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Verifică redirecționarea la dashboard
    await driver.wait(until.urlIs('http://localhost:3000/'), 5000);
    
    // Verifică că utilizatorul este autentificat cu numele actualizat
    await driver.findElement(By.linkText('Profil')).click();
    await driver.wait(until.urlIs('http://localhost:3000/profile'), 5000);
    
    // Verifică numele actualizat
    const updatedName = await driver.findElement(By.id('name')).getAttribute('value');
    expect(updatedName).to.equal('Nume Actualizat');
  });
});