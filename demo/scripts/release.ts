import { build as electronBuild } from 'electron-builder';
import { run } from 'shell-commands';

const build = async () => {
  await run(`
      rm -rf .parcel-cache
      rm -rf build
      # below we write four commands instead of one because we want to output everything in the same directory
      parcel build --target electron --no-source-maps
      parcel build --target preload --no-source-maps
      parcel build --target web --no-source-maps
      parcel build --target settings --no-source-maps
    `);
};

const main = async () => {
  await build();
  await run(`
      rm -rf dist
    `);
  const inputs = new Set(process.argv);
  const files = ['build'];
  if (inputs.has('--dir')) {
    await electronBuild({
      config: {
        files,
        mac: {
          identity: null,
          target: ['dir'],
        },
      },
    });
  } else if (inputs.has('--github')) {
    // release macOS versions
    await electronBuild({
      arm64: true,
      x64: true,
      universal: true,
      mac: ['default'],
      config: {
        files,
        // publish: null, // publish or not
        mac: {
          // identity: null, // code sign or not
          notarize: {
            teamId: process.env.APPLE_TEAM_ID!,
          },
        },
      },
    });
    // release Windows versions
    await electronBuild({
      arm64: true,
      x64: true,
      win: ['default'],
      config: {
        files,
        // publish: null, // publish or not
      },
    });
  }
};
main();
