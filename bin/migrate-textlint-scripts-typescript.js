#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const shelljs = require("shelljs");
const npeBin = require.resolve(".bin/npe");
const meow = require('meow');
const cpFile = require('cp-file');
const cli = meow(`
    Usage
      $ npx @textlint/migrate-textlint-scripts-typescript
 
    Options
      --yarn  Use yarn if it is specified
 
    Examples
      $ npx @textlint/migrate-textlint-scripts-typescript --yarn
`, {
    flags: {
        yarn: {
            type: 'boolean'
        }
    }
});
const USE_YARN = cli.flags.yarn;
const log = function (message) {
    console.info(message);
};
const exec = function (command) {
    log("Run: " + command);
    if (shelljs.exec(command).code !== 0) {
        throw new Error("Fail to execute:" + command);
    }
};
const npe = function (key, value) {
    exec(`${npeBin} "${key}" "${value}"`);
};
// Exist config files
const mochaOptPath = path.join(process.cwd(), "test", "mocha.opts");
log(`Package Manager: ${USE_YARN ? "yarn" : "npm"}`);
const INSTALL_COMMAND = USE_YARN ? "yarn add --dev" : "npm install --save-dev";
const UNINSTALL_COMMAND = USE_YARN ? "yarn remove --dev" : "npm uninstall --save-dev";
// Install textlint-scripts
exec(`${INSTALL_COMMAND} typescript ts-node @textlint/types @types/node`);
// Modify package.json
npe("scripts.build", "textlint-scripts build");
npe("scripts.watch", "textlint-scripts build --watch");
npe("scripts.test", "textlint-scripts test");
// Modify mocha.opts
if (fs.existsSync(mochaOptPath)) {
    const mochaOptsContent = fs.readFileSync(mochaOptPath, "utf-8");
    const replaced = mochaOptsContent
        .replace("--compilers js:babel-register", "--require textlint-scripts/register-ts")
        .replace("--compilers js:@babel/register", "--require textlint-scripts/register-ts")
        .replace("--require babel-register", "--require textlint-scripts/register-ts")
        .replace("--require @babel/register", "--require textlint-scripts/register-ts")
        .replace("--require textlint-scripts/register", "--require textlint-scripts/register-ts");
    fs.writeFileSync(mochaOptPath, replaced, "utf-8");
    log(`✔ Rewrite ${mochaOptPath}`);
}
// copy tsconfig.json
const tsconfigFilePath = path.join(__dirname, "../config/tsconfig.json");
cpFile.sync(tsconfigFilePath, path.join(process.cwd(), "tsconfig.json"));
log(`✔ Copy tsconfig.json`);
// Complete

// Complete
log("✔ Complete!");
