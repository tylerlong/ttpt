# Tyler TyperScript Project Templates

Some TypeScript project templates from Tyler Liu to quickly create new projects.

## Install

```
yarn add --dev ttpt
```

## Usage

### Generate a node.js project

```
yarn ttpt
```

By default, it will generate a node.js project.

### Generate a web project

```
yarn ttpt -w
```

or

```
yarn ttpt --web
```

### Generate an electron project

```
yarn ttpt -e
```

or

```
yarn ttpt --electron
```

In the generated project, you can run:

```
yarn release --dir
```

to generate a release version of the app into a directory.

You can run:

```
yarn release --github
```

to release the app to GitHub.


## Options

```
yarn ttpt -W
```

`-W` is the `--ignore-workspace-root-check` option for `yarn add` commands.

Ref: https://classic.yarnpkg.com/lang/en/docs/cli/add/#toc-yarn-add-ignore-workspace-root-check-w

For now, only the default project type supports it.
Because the other project types don't have to be in a yarn workspace.


## Dev Notes

```
✨ Built in 1.45s
[Error: ENOENT: no such file or directory, open '/Users/tyler.liu/src/ts/ttpt-electron-demo/node_modules/src/util.ts'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: '/Users/tyler.liu/src/ts/ttpt-electron-demo/node_modules/src/util.ts'
}
```

The error is probably caused by https://github.com/cosmiconfig/cosmiconfig/issues/337


## Todo

- Add test cases to web and electron app templates.
- Support electron app auto-update.
- Support electron app test case and auto-take screenshots
- Release electron app to mas-dev and mas
  - The latest sample project is "Assets Hosting"
- Support document-based electron app
  - '-d' or '--document'
