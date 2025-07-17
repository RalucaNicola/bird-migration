# ArcGIS app template

Application template using [ArcGIS Maps SDK for JavaScript](https://developers.arcgis.com/javascript/index.html), [React](https://react.dev/) and [Calcite](https://developers.arcgis.com/calcite-design-system/components/).

[View it live]()

[![application screenshot](./public/screenshot.png)]()

## Features

- Authentication
- State management with [MobX](https://mobx.js.org/README.html)
- Animations with [Motion](https://motion.dev/docs)

## Instructions

You need to have [git](https://git-scm.com/) and [npm](https://www.npmjs.com/) installed on your machine.
Clone this repository to your computer with the following command:

```sh
git clone git@github.com:RalucaNicola/arcgis-template.git
```

Install the modules that are need to run the app:

```sh
npm install
```

Now you can start the vite development server to test the app on your local machine:

```sh
# it will start a server instance and begin listening for connections from localhost on port 3000
npm run dev
```

To build/deploy the app, you can simply run:

```sh
# it will place all files needed for deployment into the /dist directory
npm run build
```

Copy the content of the `/dist` directory to the server where you want to deploy the application.

## Issues

Find a bug or want to request a new feature? Please let us know by submitting an issue.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Licensing

Copyright 2022 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license](LICENSE.txt) file.
