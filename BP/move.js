const { exec } = require("child_process"), { copyFileSync, mkdirSync, readdirSync, statSync, unlinkSync } = require('fs'), { join } = require('path'), color = require('colors'), chokidar = require('chokidar');
color.enable();

const SOURCE_RP_PATH = "D:\\Project\\Refined Storage\\RP";
const SOURCE_BP_PATH = "D:\\Project\\Refined Storage\\BP";
const TARGET_BP_PATH = "C:\\Users\\Admin\\AppData\\Local\\Packages\\Microsoft.MinecraftUWP_8wekyb3d8bbwe\\LocalState\\games\\com.mojang\\development_behavior_packs\\RS BP";
const TARGET_RP_PATH = "C:\\Users\\Admin\\AppData\\Local\\Packages\\Microsoft.MinecraftUWP_8wekyb3d8bbwe\\LocalState\\games\\com.mojang\\development_resource_packs\\RS RP";

// exec("tsc --watch", (_, $) => { _ ? console.error(_) : console.log($); });

const ignored = [
  '**/node_modules/**',
  '**/src/**',
  '**/.git/**',
  path => path.endsWith('.js')
];

function isFile(target) {
  return statSync(target).isFile();
}

function copyFile(source, target) {
  try {
    copyFileSync(source, target);
  } catch (error) {
    if (error.code === 'EEXIST') {
      unlinkSync(target);
      copyFileSync(source, target);
    } else {
      throw error + error.stderr;
    }
  }
}

function copyFiles(source, target) {
  const dirs = readdirSync(source);
  for (const d of dirs) {
    const sourcePath = join(source, d);
    const targetPath = join(target, d);
    if (isFile(sourcePath)) {
      copyFile(sourcePath, targetPath);
    } else {
      try {
        mkdirSync(targetPath);
      } catch (error) {
        if (error.code !== 'EEXIST') {
          throw error;
        }
      }
      copyFiles(sourcePath, targetPath);
    }
  }
}

const bp_watch = chokidar.watch(SOURCE_BP_PATH, {
  persistent: true,
  ignoreInitial: true,
  depth: 20,
  ignored: [...ignored, '**/assets/**']
});
const rp_watch = chokidar.watch(SOURCE_RP_PATH, {
  persistent: true,
  ignoreInitial: true,
  depth: 20,
  ignored
});

rp_watch.on('add', rpChange);
rp_watch.on('change', rpChange);

bp_watch.on('add', bpChange);
bp_watch.on('change', bpChange);

function rpChange(data) {
  console.log("Detect RP change at: ".green, data.yellow.underline);
  copyFile(SOURCE_RP_PATH, TARGET_RP_PATH);
}

function bpChange(data) {
    console.log("Detect BP change at: ".green, data.yellow.underline);
    copyFile(SOURCE_BP_PATH, TARGET_BP_PATH);
  }