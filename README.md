[![Build Status](https://travis-ci.org/FlorianMaak/p0weruser.svg?branch=master)](https://github.com/FlorianMaak/p0weruser/raw/master/dist/p0weruser.user.js)
[![Greenkeeper badge](https://badges.greenkeeper.io/FlorianMaak/p0weruser.svg)](https://greenkeeper.io/)
[![Known Vulnerabilities](https://snyk.io/test/github/FlorianMaak/p0weruser/badge.svg?targetFile=package.json)](https://snyk.io/test/github/FlorianMaak/p0weruser?targetFile=package.json)

# p0weruser
Extend pr0gramm.com with some extra functions and improve look and feel. Don't like a special feature? No problem, just disable
it using settings.

# !!! Development will continue at the beginning of october !!!

## Features
* Addon-Settings
* Repost-Highlight
* Widescreen mode
* Current benis in header
* Notification Center
* Advanced Comments
* Desktop Notifications
* Filter-Labels
* TinEye Imagesearch
* Integration of [Rene8888s repost-check](https://rep0st.rene8888.at)
* Automated text recognition
* Integration of [pr0p0ll.com](https://pr0p0ll.com)
* Mark viewed posts
* c0mmunityrat notifications
* Anonymous Title

## Instructions / Controls
Help and instructions can be found on this repositorys [wiki-pages](https://github.com/FlorianMaak/p0weruser/wiki).

## Installation
Just install Tampermonkey and install the script by a simple
click on one of the following urls:

### Release
[https://github.com/FlorianMaak/p0weruser/raw/master/dist/p0weruser.user.js](https://github.com/FlorianMaak/p0weruser/raw/master/dist/p0weruser.user.js)

### Beta
[https://github.com/FlorianMaak/p0weruser/raw/develop/dist/p0weruser.user.js](https://github.com/FlorianMaak/p0weruser/raw/develop/dist/p0weruser.user.js)

## Missing Feature or found a bug?
Just open an issue and describe your request as accurately as possible. If you like to script it on your own, feel free to fork this repository and open a Pull Request.

## Contribution
Feel free to fork this project. If you like to contribute, please use [git-flow](https://github.com/nvie/gitflow)
branch-style and follow the commits [conventions](https://github.com/FlorianMaak/p0weruser/wiki/Conventions). If your work is done, please submit a
pull request. All contributions **must** be released under [GPLv3 licence](https://github.com/FlorianMaak/p0weruser/blob/master/LICENSE).

## [Dev] Installation
After checkout run ```npm install``` and [npm](https://www.npmjs.com/) will install all needed dependencies and creates a new build in ```/dist```-Folder. After installation run
```npm run dev``` to start filewatchers, which are starting a new build after each filechange. Just create a new UserScript in Tapermonkey and add your local file (found in
```dist``` folder) to test your script. 
