const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

async function createDriver() {
  const options = new chrome.Options();
  options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
  return new Builder().forBrowser("chrome").setChromeOptions(options).build();
}

async function testHomePageLoading(driver) {
  await driver.get(BASE_URL);
  await driver.wait(until.titleContains("Smart Library Portal"), 5000);
  console.log("Test 1 Passed: Homepage loads correctly");
}

async function testAdminLoginAndAddBook(driver) {
  await driver.get(BASE_URL);

  await driver.wait(until.elementLocated(By.id("username")), 5000);
  await driver.findElement(By.id("username")).sendKeys("admin");
  await driver.findElement(By.id("password")).sendKeys("admin123");
  await driver.findElement(By.id("loginForm")).submit();

  await driver.wait(until.elementLocated(By.id("dashboardSection")), 5000);

  await driver.findElement(By.id("title")).sendKeys("Test Book");
  await driver.findElement(By.id("author")).sendKeys("Test Author");
  await driver.findElement(By.id("category")).sendKeys("Fiction");
  await driver.findElement(By.id("isbn")).sendKeys(`SEL-${Date.now()}`);
  await driver.findElement(By.id("quantity")).clear();
  await driver.findElement(By.id("quantity")).sendKeys("2");
  await driver.findElement(By.id("saveBtn")).click();

  await driver.wait(until.elementLocated(By.className("message")), 5000);
  console.log("Test 2 Passed: Book added successfully");
}

async function runTests() {
  const driver = await createDriver();
  try {
    await testHomePageLoading(driver);
    await testAdminLoginAndAddBook(driver);
    console.log("All Selenium tests passed!");
  } catch (e) {
    console.error("Test failed:", e.message); process.exitCode = 1;
  } finally { await driver.quit(); }
}
runTests();
