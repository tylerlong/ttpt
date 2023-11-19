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

## Todo

- Add test cases to web and electron app templates.
- support electron settings page (change theme, etc.)
- Support electron app auto-update.
- Support electron app test case and auto-take screenshots
- Release electron app to mas-dev and mas
