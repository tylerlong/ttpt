import { join } from 'path';

import { append, ensure } from './utils';

export const web = () => {
  append(
    '.gitignore',
    `
.parcel-cache/
docs/
  `,
  );
  ensure(
    join('src', 'index.html'),
    `
<!DOCTYPE html>
<html>
  <head>
    <title>Untitled App</title>
    <link rel="stylesheet" href="index.css" />
  </head>
  <body>
    <script type="module" src="index.tsx"></script>
  </body>
</html>
`,
  );
};
