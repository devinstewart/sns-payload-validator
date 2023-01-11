**v2.0.0 Cache**
- add lru-cache to cache the certificate keys from AWS. This is breaking change as the `Validator` now has to be instantiated with `new Validator()`
- rearange the TypeScript definitions to align with the pattern in the aws-sdk

**v1.1.2 Badge Fix**
- fix badge for build status, old one stopped working, no code changes

**v1.1.1 Node 19**
- add Node 19 to CI tests
- made `JSON.parse` fail with consistent error message

**v1.1.0 SignatureVersion 2 Support**
- added support for `SignatureVersion` 2
- added badges to README.md from sonarcloud.io
- removed redundant code in tests

**v1.0.4 Interface Bug**
- include the interface directly in the module.
- fix spelling of CONTRIBUTING.md

**v.1.0.3 Badges and an Interface**
- make the `SnsPayload` interface available to import
- add Badges to the README.md
- hookup coveralls.io
- create CONTIRBUTING.md

**v1.0.2 - Improved Typescript, added testing link**
- define SnsPayload interface instead of using any \(Typscript)
- grammer fix in README.md
- added Status and Testing section to the README.md

**v1.0.1 - Internal maintenance, no new features**
- add dependabot
- upgrade dev dependencies
- Validate Node 18 compatibility, drop CI tests for Node 12
- fix grammer in README
- clean up some tests

**v1.0.0 - Initial Release**
