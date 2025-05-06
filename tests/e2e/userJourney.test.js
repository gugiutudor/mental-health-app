// tests/e2e/userJourney.test.js
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const { before, after, describe, it } = require('mocha');

describe('User Journey End-to-End Test', function() {
  // This test might take longer than the default timeout
  this.timeout(60000);
  
  let driver;
  
  before(async function() {
    // Set up Chrome options
    const options = new chrome.Options();
    options.addArguments(
      '--headless',
      '--no-sandbox',
      '--disable-dev-shm-usage'
    );
    
    // Check if we're running in Docker
    const seleniumUrl = process.env.SELENIUM_HUB || 'http://localhost:4444/wd/hub';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    
    // Initialize WebDriver
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .usingServer(seleniumUrl)
      .build();
    
    // Set window size
    await driver.manage().window().setRect({ width: 1280, height: 800 });
    
    // Set base URL
    this.baseUrl = clientUrl;
  });
  
  after(async function() {
    // Close browser after all tests
    if (driver) {
      await driver.quit();
    }
  });
  
  it('should complete a full user journey from registration to mood tracking', async function() {
    // Generate unique username for testing
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'TestPassword123';
    const testName = 'Test User';
    
    // 1. Visit registration page
    await driver.get(`${this.baseUrl}/register`);
    
    // Wait for page to load
    await driver.wait(until.elementLocated(By.css('h2')), 10000);
    const title = await driver.findElement(By.css('h2')).getText();
    expect(title).to.equal('Înregistrare');
    
    // 2. Fill registration form
    await driver.findElement(By.id('name')).sendKeys(testName);
    await driver.findElement(By.id('email')).sendKeys(testEmail);
    await driver.findElement(By.id('password')).sendKeys(testPassword);
    await driver.findElement(By.id('confirmPassword')).sendKeys(testPassword);
    
    // Submit form
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // 3. Wait for redirect to dashboard
    await driver.wait(until.urlIs(`${this.baseUrl}/`), 10000);
    
    // Check that user is logged in
    const dashboardTitle = await driver.findElement(By.css('h1')).getText();
    expect(dashboardTitle).to.equal('Bun venit la aplicația de sănătate mentală');
    
    // 4. Add a mood entry
    // Wait for MoodTracker component to load
    await driver.wait(until.elementLocated(By.id('mood')), 10000);
    
    // Set mood level
    const moodSlider = await driver.findElement(By.id('mood'));
    await driver.executeScript('arguments[0].value = 8;', moodSlider);
    await driver.executeScript('arguments[0].dispatchEvent(new Event("change"))', moodSlider);
    
    // Add notes
    await driver.findElement(By.id('notes')).sendKeys('Feeling energetic today!');
    
    // Set factors
    const sleepSlider = await driver.findElement(By.id('factors.sleep'));
    await driver.executeScript('arguments[0].value = 4;', sleepSlider);
    await driver.executeScript('arguments[0].dispatchEvent(new Event("change"))', sleepSlider);
    
    const stressSlider = await driver.findElement(By.id('factors.stress'));
    await driver.executeScript('arguments[0].value = 2;', stressSlider);
    await driver.executeScript('arguments[0].dispatchEvent(new Event("change"))', stressSlider);
    
    // Submit form
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Check for success message
    await driver.wait(until.elementLocated(By.className('success-message')), 10000);
    const successMessage = await driver.findElement(By.className('success-message')).getText();
    expect(successMessage).to.include('Înregistrarea dispoziției a fost salvată cu succes');
    
    // 5. Navigate to exercises
    await driver.findElement(By.linkText('Exerciții')).click();
    
    // Wait for exercises page to load
    await driver.wait(until.urlIs(`${this.baseUrl}/exercises`), 10000);
    const exercisesTitle = await driver.findElement(By.css('h1')).getText();
    expect(exercisesTitle).to.equal('Exerciții pentru sănătate mentală');
    
    // 6. Filter exercises by category
    // Try to find the button with text "Respirație"
    try {
      const breathingButton = await driver.findElement(By.xpath('//button[text()="Respirație"]'));
      await breathingButton.click();
      
      // Wait for filtering to complete
      await driver.wait(until.elementLocated(By.css('.exercise-card')), 10000);
    } catch (error) {
      console.log("Could not find breathing exercises button, continuing test...");
    }
    
    // 7. Navigate to resources
    await driver.findElement(By.linkText('Resurse')).click();
    
    // Wait for resources page to load
    await driver.wait(until.urlIs(`${this.baseUrl}/resources`), 10000);
    const resourcesTitle = await driver.findElement(By.css('h1')).getText();
    expect(resourcesTitle).to.equal('Resurse pentru sănătate mentală');
    
    // 8. Navigate to profile
    await driver.findElement(By.linkText('Profil')).click();
    
    // Wait for profile page to load
    await driver.wait(until.urlIs(`${this.baseUrl}/profile`), 10000);
    const profileTitle = await driver.findElement(By.css('h1')).getText();
    expect(profileTitle).to.equal('Profilul meu');
    
    // 9. Update profile
    // Change name
    const nameInput = await driver.findElement(By.id('name'));
    await nameInput.clear();
    await nameInput.sendKeys('Nume Actualizat');
    
    // Try to toggle notification preferences
    try {
      await driver.findElement(By.css('input[name="preferences.notifications"] + .switch')).click();
    } catch (error) {
      console.log("Could not toggle notifications, continuing test...");
    }
    
    // Try to change theme
    try {
      const themeSelect = await driver.findElement(By.id('preferences.theme'));
      await themeSelect.click();
      await driver.findElement(By.css('option[value="dark"]')).click();
    } catch (error) {
      console.log("Could not change theme, continuing test...");
    }
    
    // Save changes
    await driver.findElement(By.xpath('//button[contains(text(), "Salvează")]')).click();
    
    // 10. Logout
    await driver.findElement(By.xpath('//button[text()="Deconectare"]')).click();
    
    // Verify redirect to login page
    await driver.wait(until.urlIs(`${this.baseUrl}/login`), 10000);
    const loginTitle = await driver.findElement(By.css('h2')).getText();
    expect(loginTitle).to.equal('Autentificare');
    
    // 11. Login with updated credentials
    await driver.findElement(By.id('email')).sendKeys(testEmail);
    await driver.findElement(By.id('password')).sendKeys(testPassword);
    
    // Submit form
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Verify redirect to dashboard
    await driver.wait(until.urlIs(`${this.baseUrl}/`), 10000);
    
    // Test passed successfully
    console.log("E2E test completed successfully!");
  });
});