import { ensure } from '../utils';

const step = () => {
  ensure(
    'scripts/watch.ts',
    `import { run } from 'shell-commands';

const main = async () => {
  await run(\`
    rm -rf .parcel-cache
    rm -rf build
  \`);
  run("nodemon --watch src/preload.ts --exec 'parcel build --target preload'");
  run('parcel src/index.html --dist-dir build -p 1234');
  run('parcel src/settings/settings.html --dist-dir build -p 1235');
  run('parcel watch --target electron -p 1240');
};

main();
  `,
  );

  ensure(
    'scripts/release.ts',
    `import { build as electronBuild } from 'electron-builder';
  import { run } from 'shell-commands';
  
  const build = async () => {
    await run(\`
      rm -rf .parcel-cache
      rm -rf build
      parcel build --no-source-maps
    \`);
  };
  
  const main = async () => {
    await build();
    await run(\`
      rm -rf dist
    \`);
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
              teamId: process.env.APPLE_TEAM_ID,
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
  `,
  );
};

export default step;
