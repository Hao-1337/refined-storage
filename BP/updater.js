const { exec } = require('child_process');
const fs = require('fs');

let modules = [];
let mcVersion = "";
let versions = [];

console.log("Reading manifest.json to get minecraft version and modules version")
fs.readFile('manifest.json', 'utf8', (_, stdout) => {
    let o = JSON.parse(stdout);
    mcVersion = o.header.min_engine_version.join('.');

    o.dependencies.map((dependency) => {
        const { module_name, version } = dependency;
        if (!module_name) return;
        modules.push({ module_name, version });
    });

    console.log("Installing dependencies");
    modules.forEach(m => {
        exec(`npm v ${m.module_name} versions --json`, (_, stdout) => {
            let o = JSON.parse(stdout);
            let a = [];
            versions = o;
            versions.map((v) => {
                if (v.includes(mcVersion) && v.includes(modules[0].version)) {
                    a.push(v);
                }
            })

            console.log(`Installing ${m.module_name} ${m.version}`);

            exec(`npm i ${m.module_name}@${a.reverse()[0]} --save-dev`, (_, stdout) => console.log(stdout));
        })
    })
})