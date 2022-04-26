// @ts-ignore
import React from 'react';
import ReactDOM from 'react-dom';
import JQuery from 'jquery';
import Clone from 'clone';
import {paragraphs} from "./utils";
import Tutorial from "./Tutorial";
import {
    TranslationFunction,
    TutorialOptions,
    TutorialType,
} from "./types";

let TUTORIAL_CLASS: Tutorial | null = null;
let REGISTER_DELAY: null | number = null;
let TUTORIALS = {};
let OPTIONS: TutorialOptions = {
    centralizeAnnouncements: false,
    forceZIndex: false,
    baseZIndex: 1050,
    translations: {}
};

function  init_dom(callback) {
    if (TUTORIAL_CLASS !== null) {
        callback(TUTORIAL_CLASS);
        return;
    }
    let destination = JQuery('<div>');
    destination.appendTo('body');
    TUTORIAL_CLASS = ReactDOM.render(<Tutorial/>, destination[0]);
    callback(TUTORIAL_CLASS);
}

class TutorialWrapper{

    constructor() {
        this.LANG = "en";
    }

    TRANSLATION_FUNC(text: string, _: any)  {
        console.log("why no override?");
        return text;
    }

    LANG = "en";

    overrideTransFunction(transFunc){
        this.TRANSLATION_FUNC = transFunc;
    }
    register_tutorials() {
        init_dom((tutorialClass: Tutorial) => {
            tutorialClass.setOptions(OPTIONS);
            tutorialClass.setTransFunc(this.TRANSLATION_FUNC);
            tutorialClass.setLang(this.LANG);
            tutorialClass.updateTutorials(TUTORIALS);
        });
    }


    registerTutorials(tutorials, options?: TutorialOptions, transFunc?: TranslationFunction, lang?: string) {
        let newTutorials = Clone(TUTORIALS);
        for (let tutorialKey in tutorials)
            if (tutorials.hasOwnProperty(tutorialKey))
                newTutorials[tutorialKey] = tutorials[tutorialKey];
        TUTORIALS = newTutorials;
        if (typeof options !== 'undefined')
            OPTIONS = options;
        if (typeof lang !== 'undefined')
            this.LANG = lang;
        if (typeof transFunc !== 'undefined')
            this.TRANSLATION_FUNC = transFunc;
        if (REGISTER_DELAY !== null)
            window.clearTimeout(REGISTER_DELAY);
        REGISTER_DELAY = window.setTimeout(this.register_tutorials, 500);
    }

    setLang(lang: string) {
        if (TUTORIAL_CLASS === null) {
            console.error('Cannot set tutorial Language: Tutorials not yet initialised.');
            return;
        }
        TUTORIAL_CLASS.setLang(lang);
    }

    registerFinaliseCallback(callback: (tutorial?: TutorialType) => void) {
        init_dom(function (tutorialClass: Tutorial) {
            tutorialClass.addFinaliseCallback(callback);
        });
    }

    startTutorial(tutorialKey) {
        if (TUTORIAL_CLASS === null) {
            console.error('Cannot start tutorial: Tutorials not yet initialised.');
            return;
        }
        TUTORIAL_CLASS.start(tutorialKey);
    }

    abortTutorial() {
        if (TUTORIAL_CLASS === null) {
            console.warn('Cannot abort tutorial: Tutorials not yet initialised.');
            return;
        }
        TUTORIAL_CLASS.abort();
    }
}
export {
    paragraphs,
    TutorialWrapper
};

