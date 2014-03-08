RequireModules
==============

Dependencies your use in your app

Install
```console
 $ [sudo] npm install -g requiremodules
 ```

## Use
 ```console
$ require --help
  Usage: require <app>

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -i, --ingore <path>      Ignore path
    -d, --depencie <simbol>  The simbol wit use Eg. ">="
    -t, --types <types>      Ignore files
    -f, --files <type>       specify the type of file Eg. .js

```

## Run

 ```console
$ require /usr/lib/node_modules/requiremodules

  "dependencies": {
    "commander" : ">=2.1.0",
    "underscore" : ">=1.6.0",
    "wrench" : ">=1.5.8",
    "pkginfo" : ">=0.3.0",
  }

```