const puppeteer = require('puppeteer');

const appBaseURL = `http://localhost:3474`;
const pages = {
  home: 'page-home',  
  signup: 'page-signup'
}
const routes = {
  home: `${appBaseURL}`,
  signup: `${appBaseURL}/signup`
}

const timeout = 10000;
const shadowSelectorFn = (el, selector) => el.shadowRoot.querySelector(selector);

const queryShadow = async (array, element = document) => {
  const newArray = [...array];
  const selector = newArray.shift();
  try {
    // console.log(`@ ${element._remoteObject.description}`);
    // console.log(`finding ${selector}`);
    let el = await element.$(selector);
    // console.log(`found el?`);
    // if (el) console.log(`found ${el._remoteObject.description}`);
    const sRoot = await element.getProperty('shadowRoot');
    if (!el) {
      // console.log(`find el in shadowRoot of ${element._remoteObject.description}`);
      el = await sRoot.$(selector);
      // if (el) console.log(`found shadow ${el._remoteObject.description}`);
      if(!el) return el;
    }
    if (newArray.length > 0 && sRoot) {
      // console.log('remaining tags');
      // console.log(newArray);
      el = await queryShadow(newArray, el);
      // if (el) console.log(`found ${el._remoteObject.description}`);
      // else console.log(`${selector}`);
    }
    return el;
  } catch (e) {
    console.log(e);
  }
}

const delay = (duration) => new Promise(resolve => setTimeout(resolve, duration));

describe(
  '/ (Home Page)',
  () => {
    let browser
    let page
    beforeAll(async () => {
      browser = await puppeteer.launch({headless: false, slowMo: 100})
      page = await browser.newPage()
    }, timeout)

    afterAll(async () => {
      await page.close()
    })

    // it('should redirect to signup page', async () => {
    //   try {
    //     await page.goto(routes.home);
    //     const coreLite = await page.$('core-lite')
    //     const coreLite2 = await queryShadow(['template-viewer-lite', "template-container-lite", pages.home], coreLite);
    //     // const coreLite2 = await coreLite.asElement().$('template-container-lite');
    //     // console.log(coreLite2);
    //     const signupButton = await queryShadow(['login-wrapper', "login-component", 'section', "form", 'div', "a"] , coreLite2);
    //     await signupButton.click();
    //     await delay(5000);
    //     await browser.close();
    //   } catch (err) {
    //     console.log(err);
    //   }
    // })

    it('should create an account', async () => {
      try {
        await page.goto(routes.signup);
        let coreLite = await page.$('core-lite')
        const coreLite2 = await queryShadow(['template-viewer-lite', "template-container-lite", pages.signup], coreLite);
        // const coreLite2 = await coreLite.asElement().$('template-container-lite');
        // console.log(coreLite2);
        const form = await queryShadow(['signup-wrapper', "signup-component", 'section', "form"] , coreLite2);
        // await signupButton.click();
        const inputContainers = await form.$$('input-container');
        const email = await queryShadow(['input'], inputContainers[0]);
        const pass = await queryShadow(['input'], inputContainers[1]);
        await delay(5000);
        await email.type('zydrickjan0001@gmail.com');
        await pass.type('demopass');
        const signupButton = await queryShadow(['div', 'button[type=submit]'], form);
        console.log(signupButton);
        await signupButton.hover();
        await signupButton.click();
        await delay(5000);
        await browser.close();
      } catch (err) {
        console.log(err);
      }
    })
  },
  timeout
)
