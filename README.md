# p0weruser
[![Build Status](https://travis-ci.com/Scarwolf/p0weruser.svg?branch=master)](https://travis-ci.com/Scarwolf/p0weruser)

Extend pr0gramm.com with some extra functions and improve look and feel. Don't like a special feature? No problem, just disable
it using settings.

![Image 1](https://i.imgur.com/KJ7IGPZ.jpg)
![Image 2](https://i.imgur.com/tp2jKQ3.png)


The original repo can be found here: [FlorianMaak/p0weruser](https://github.com/FlorianMaak/p0weruser)

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
* Anonymous Title

## Installation
Just install Tampermonkey and install the script by a simple
click on the following url:
[https://scarwolf.github.io/p0weruser/p0weruser.user.js](https://scarwolf.github.io/p0weruser/p0weruser.user.js)

Dev Version (Unstable, but latest features): [https://scarwolf.github.io/p0weruser/p0weruser.dev.user.js](https://scarwolf.github.io/p0weruser/p0weruser.dev.user.js)

## Missing Feature or found a bug?
Just open an issue and describe your request as accurately as possible. If you like to script it on your own, feel free to fork this repository and open a Pull Request.

## Contribution
Feel free to fork this project. If you like to contribute, please use [git-flow](https://github.com/nvie/gitflow)
branch-style and follow the commits conventions. If your work is done, please submit a
pull request. 

## [Dev] Installation
After checkout run ```npm install``` and [npm](https://www.npmjs.com/) will install all needed dependencies and creates a new build in ```/dist```-Folder. After installation run
```npm run dev``` to start filewatchers, which are starting a new build after each filechange. Just create a new UserScript in Tapermonkey and add your local file (found in
```dist``` folder) to test your script. 
