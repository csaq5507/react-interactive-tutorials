# react-interactive-tutorials-cont

[![npm version](https://badge.fury.io/js/react-interactive-tutorials.svg)](http://badge.fury.io/js/react-interactive-tutorials)
![Downloads](http://img.shields.io/npm/dm/react-interactive-tutorials.svg?style=flat)

Framework for creating unobtrusive interactive tutorials for use in web apps.

This is a Fork from https://github.com/uptick/react-interactive-tutorials. It provides some extra [functionality](https://github.com/csaq5507/react-interactive-tutorials/#extra-functionality).

## Live Demo

Have a play around with the live demo of the original Repo here: http://uptick.github.io/react-interactive-tutorials/

## How it Works

Tutorials are represented as a set of prompts that will result in the user successfully completing
actions within the interface of your app.

Rather than storing a state of the current tutorial step, the currently active tutorial step is
calculated on the fly by the step configuration's set of conditions. This allows the user to go off
and do something unexpected / get lost in the middle of a tutorial without consequence.

## Requirements

To install, you will need:

- Bootstrap 4 stylesheet, or an implementation of the used classes:
  - btn
  - btn-primary
  - btn-secondary
  - float-right

And anyone using your site will need:

- A relatively modern browser
- Javascript enabled
- Cookies enabled

## Installation

Install the npm package:

```
npm install react-interactive-tutorials-cont
```
or 
```
npm install react-interactive-tutorials-cont
```

Include the built css located at:

```
node_modules/react-interactive-tutorials-cont/dist/react-interactive-tutorials.css
```

Register your own tutorials:

```javascript
// es6
import { registerTutorials } from 'react-interactive-tutorials-cont'

registerTutorials(YOUR_TUTORIALS);

// attached to global let
interactiveTutorials.registerTutorials(YOUR_TUTORIALS);
```

## Making tutorials

Full reference documentation coming soon. For now, take a look at the reference on the live demo at
http://uptick.github.io/react-interactive-tutorials/.


## Extra functionality

* Translations
* Options
* Step-Callbacks
* Type-safety
