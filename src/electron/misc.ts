import { copyFileSync, existsSync } from 'fs';
import { adjust, replace } from '../utils';

const step = () => {
  if (!existsSync('icon.png')) {
    copyFileSync('node_modules/ttpt/src/electron/icon.png', 'icon.png');
  }
  adjust('.gitignore', 'docs/', 'build/\ndist/\n.DS_Store');
  adjust('.prettierignore', 'docs/', 'build/\ndist/');
  replace(
    'eslint.config.mjs',
    "config[0].ignores = ['docs/'];",
    "config[0].ignores = ['docs/', 'build/', 'dist/'];",
  );
  adjust(
    '.ackrc',
    '--ignore-dir=docs',
    '--ignore-dir=build\n--ignore-dir=dist',
  );

  adjust(
    '.env',
    'NAME=Tyler Liu',
    `# Upload to GitHub: https://github.com/settings/tokens
  GH_TOKEN=xxx
  
  # Notarize by Apple server
  # App-Specific Passwords could be found here: https://appleid.apple.com/account/manage
  APPLE_ID=xxx@yyy.com
  APPLE_APP_SPECIFIC_PASSWORD=zzz
  
  # Apple "Developer ID Application" certificate, other certs won't work
  # You need to do it on a laptop which has the private key, so that you can expirt the cert as p12 format
  # Then convert the p12 cert to base64 format
  CSC_LINK=xxx
  CSC_KEY_PASSWORD=yyy
  # team id is the value shown in the certificate's full name, such as "Developer ID Application: FirstName LastName (Team_ID_Here)"
  APPLE_TEAM_ID=zzz
`,
  );
};

export default step;
