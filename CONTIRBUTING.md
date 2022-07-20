# Contributing
First of all, thanks for your interest in contributing to this project.

I am open to contributions, and I will be happy to accept any pull request that meets the needs of this module.  You can also open an issue, and I will be happy to help you out, or even add a new feature.

### Why does this project exist?
In September of 2021, I was looking for a module that would validate an AWS SNS message sent to a HTTP(S) endpoint. I inevitably found the module [sns-validator](https://www.npmjs.com/package/sns-validator), created by AWS.

However, I found it was lacking a few features, and pull requests had not been accepted for four years.

So I decided to create my own module. At first, I put it up on NPM for easy installation for myself. In June of 2022, I noticed that the module was starting to get downloads, so I decided to make a few changes to the repository and released a few upgrades to NPM. With version `1.0.3`, I now feel that the module has everything I need, and the repository has been setup for future upgrades and contributions.

### What features does this module have?
In addition to be able to validate an AWS SNS message, the following features are included:
- Promises or Callbacks are supported.
- A daily check in a live AWS account that verifies that the module is working as expected.
- TypeScript support (Full disclosure: I am not a TypeScript expert, I mostly use it for the Intellisense).

### Coding Style
I have adapted the coding style guide of [hapijs](https://hapi.dev/policies/styleguide/), as I do work with the fine folks in that project.

### Dependencies
As a DevSecOps engineer, I love modules without a lot of dependencies. As of version `1.0.3`, this module has no dependencies that are not dev dependencies.  If there is a feature that you would like to add that requires a dependency, please open an issue.  We will come to one of three decisions:
- We add the dependency.
- We include the funtionality needed in the module.
- We create a separate module maintained here that includes the functionality needed.

### Conclusion
I hope that this module is useful to you, and I hope that you will contribute to the project. -- Devin Stewart