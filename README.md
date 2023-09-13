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

## Options

```
yarn ttpt -W
```

`-W` is the `--ignore-workspace-root-check` option for `yarn add` commands.

Ref: https://classic.yarnpkg.com/lang/en/docs/cli/add/#toc-yarn-add-ignore-workspace-root-check-w

For now, only the default project type supports it.
Because the other project types doesn't have to be in a yarn workspace.

## Todo

- Add test cases to web and electron app templates.
- Web app, dev env, click the button 9 times, and there is a warning in the console.
