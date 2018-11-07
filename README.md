# jest-puppeteer-example
Jest Puppeteer Example Demo for @littleq/element-lite 

# Running the test
To run all tests
```
npm test
```
To run a specific test
```
npm test <test_file>
```

# Installation from scratch
```
npm i --save puppeteer chalk jest-puppeteer jest rimraf
```
Edit in package.json
```
{
  "scripts": {
    "test": "jest"
  }
}
```
Create `__tests__` directory

## Jest Setup
Create the following files
`jest.config.js`
```
module.exports = {
  setupTestFrameworkScriptFile: './jest.setup.js',
  globalSetup: './setup.js',
  globalTeardown: './teardown.js',
  testEnvironment: './puppeteer_environment.js',
}
```
`jest.setup.js`
```
jest.setTimeout(30000);
```
`setup.js`
```
const chalk = require('chalk')
const puppeteer = require('puppeteer')
const fs = require('fs')
const mkdirp = require('mkdirp')
const os = require('os')
const path = require('path')

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')

module.exports = async function() {
  console.log(chalk.green('Setup Puppeteer'))
  const browser = await puppeteer.launch({})
  // This global is not available inside tests but only in global teardown
  global.__BROWSER_GLOBAL__ = browser
  // Instead, we expose the connection details via file system to be used in tests
  mkdirp.sync(DIR)
  fs.writeFileSync(path.join(DIR, 'wsEndpoint'), browser.wsEndpoint())
}
```
`teardown.js`
```
const chalk = require('chalk')
const rimraf = require('rimraf')
const os = require('os')
const path = require('path')

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')

module.exports = async function() {
  console.log(chalk.green('Teardown Puppeteer'))
  await global.__BROWSER_GLOBAL__.close()
  rimraf.sync(DIR)
}
```
`puppeteer_environment.js`
```
const chalk = require('chalk')
const NodeEnvironment = require('jest-environment-node')
const puppeteer = require('puppeteer')
const fs = require('fs')
const os = require('os')
const path = require('path')

const DIR = path.join(os.tmpdir(), 'jest_puppeteer_global_setup')

class PuppeteerEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)
  }

  async setup() {
    console.log(chalk.yellow('Setup Test Environment.'))
    await super.setup()
    const wsEndpoint = fs.readFileSync(path.join(DIR, 'wsEndpoint'), 'utf8')
    if (!wsEndpoint) {
      throw new Error('wsEndpoint not found')
    }
    this.global.__BROWSER__ = await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
    })
  }

  async teardown() {
    console.log(chalk.yellow('Teardown Test Environment.'))
    await super.teardown()
  }

  runScript(script) {
    return super.runScript(script)
  }
}

module.exports = PuppeteerEnvironment
```

