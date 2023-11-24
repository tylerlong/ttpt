import { run } from 'shell-commands';

const main = async () => {
  await run(`
    rm -rf .parcel-cache
    rm -rf build
  `);
  run("nodemon --watch src/node/preload.ts --exec 'parcel build --target preload'");
  run('parcel src/web/index.html --dist-dir build -p 1234');
  run('parcel src/web/settings/settings.html --dist-dir build -p 1235');
  run('parcel watch --target electron -p 1240');
};

main();
