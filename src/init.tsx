// @ts-ignore
import React from 'react';
import ReactDOM from 'react-dom';
import JQuery from 'jquery';
import Clone from 'clone';
import {paragraphs, ovverideTransFunction} from "./utils";
import Tutorial from "./Tutorial";
import {
    TutorialType,
    TutorialStep,
    TutorialOptions,
    TutorialCheckpoint,
    TutorialParagraph,
    TutorialTranslation,
    TutorialCondition
} from "./types";

let TUTORIAL_CLASS: Tutorial | null = null;
let REGISTER_DELAY: null | number = null;
let TUTORIALS = {};
let OPTIONS = {};

function init_dom(callback) {
    if (TUTORIAL_CLASS !== null) {
        callback(TUTORIAL_CLASS);
        return;
    }
    let destination = JQuery('<div>');
    destination.appendTo('body');
    TUTORIAL_CLASS = ReactDOM.render(<Tutorial/>, destination[0]);
    callback(TUTORIAL_CLASS);
}

function register_tutorials() {
    init_dom(function (tutorialClass: Tutorial) {
        tutorialClass.setOptions(OPTIONS);
        tutorialClass.updateTutorials(TUTORIALS);
    });
}


function registerTutorials(tutorials, options = {}) {
    let newTutorials = Clone(TUTORIALS);
    for (let tutorialKey in tutorials)
        if (tutorials.hasOwnProperty(tutorialKey))
            newTutorials[tutorialKey] = tutorials[tutorialKey];
    TUTORIALS = newTutorials;
    OPTIONS = options;
    if (REGISTER_DELAY !== null)
        window.clearTimeout(REGISTER_DELAY);
    REGISTER_DELAY = window.setTimeout(register_tutorials, 500);
}

function registerFinaliseCallback(callback: (tutorial?: TutorialType) => void) {
    init_dom(function (tutorialClass: Tutorial) {
        tutorialClass.addFinaliseCallback(callback);
    });
}

function startTutorial(tutorialKey: string) {
    if (TUTORIAL_CLASS === null) {
        console.error('Cannot start tutorial: Tutorials not yet initialised.');
        return;
    }
    TUTORIAL_CLASS.start(tutorialKey);
}

function abortTutorial() {
    if (TUTORIAL_CLASS === null) {
        console.warn('Cannot abort tutorial: Tutorials not yet initialised.');
        return;
    }
    TUTORIAL_CLASS.abort();
}

export {
    registerTutorials,
    registerFinaliseCallback,
    startTutorial,
    abortTutorial,
    paragraphs,
    ovverideTransFunction
};
export type {
    TutorialType,
    TutorialStep,
    TutorialOptions,
    TutorialCheckpoint,
    TutorialParagraph,
    TutorialTranslation,
    TutorialCondition
};

