
# Sentia
#### Enlightenment for your Environment
THIS PROJECT IS CURRENTLY IN PROGRESS

Sentia is project focused on visualizing cloud infrastructure. The initial version of the tool will support a nested view of the Netflix Edda API. Future features include a filtering tool, and time-based views of data.

Sentia provides a simple way for stakeholders across your teams to see instructure, determine changes over time, and quickly view status and details about each instance in your cloud.

## The Stack
#### Back-end
* Netflix OSS Edda
* Python Crawling tools now in github.com/cfpb/sentia-softwarediscovery
* ElasticSearch
#### Front-end (Current Contents of Repo)
* CFPB Capital Framework
* Angular.js
* Backbone.js
* D3.js
* Node / Bower / Grunt Build Stack
* LESS

## Project Status
This progress is currently in its early stages and is in progress. Expect instability and continual enhancements.


## Dependencies

Describe any dependencies that must be installed for this software to work. 
This includes programming languages, databases or other storage mechanisms, build tools, frameworks, and so forth.
If specific versions of other software are required, or or known not to work, call that out.

## Installation

* Clone this repo and `cd` into the directory
* `npm install`
* `bower install`
* `grunt build`
* Create a localVars.js file in `/dist/local/` and add the line `var serverUrl = [Your Edda IP Address]:[Edda Port]/`, replacing the bracketed values with your internal server URLs
* Node Application running on localhost:3000. (Use server.js to run Node application)


NOTE: Requires a running Netflix Edda instance.

## Configuration

Additional information forthcoming

## Usage

Additional information forthcoming

## How to test the software

Additional information forthcoming

## Known issues

Currently an in progress application - please create a GitHub issue if you notice any bugs.

## Getting help

Please create a GitHub issue if you need assistance.

## Getting involved

Additional information forthcoming, but please read our [CONTRIBUTING](CONTRIBUTING.md) guidelines.


----

## Open source licensing info
1. [TERMS](TERMS.md)
2. [LICENSE](LICENSE)
3. [CFPB Source Code Policy](https://github.com/cfpb/source-code-policy/)


----

## Credits and references

1. Netflix Edda OSS Project
2. D3.JS Packed Circle Zoom example by @mbostock
