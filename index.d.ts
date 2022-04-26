export type Tutorial = {};
export type TutorialTranslation = {

    trans: string;
}
export type TutorialParagraph = {
    p: string;
}

export type TutorialCondition = {
    compare: 'url';
    url: string;
} | {
    compare: 'inputVal' | 'inputNotVal';
    selector: string;
    value: string;
} | {
    compare: 'dropdownState';
    selector: string;
    state: 'open' | 'closed';
} | {
    compare: 'checkpointComplete' | 'checkpointIncomplete';
    checkpoint: string;
} | {
    compare: 'either' | 'all';
    when: TutorialCondition[];
}
    | {
    compare: 'custom';
    custom: () => boolean;
}

export type TutorialStep = {
    key: string;
    activeWhen: TutorialCondition[];
    announce?: TutorialParagraph;
    announceDismiss?: TutorialTranslation;
    annotate?: TutorialParagraph;
    annotateIn?: string;
    annotateTop?: string;
    annotateBottom?: string;
    annotateLeft?: string;
    annotateRight?: string;
    additionalBeforeHandler?: () => void;
    additionalAfterHandler?: () => void;
    annotateSkip?: TutorialTranslation;
    highlight?: string;
    editWhileOpen?: boolean;
    highlightBack?: string;
    noFocus?: boolean;
}

export type TutorialCheckpoint = {
    on: 'form_submission',
    checkpoint: string,
    form: {
        method: string,
        url: string
    }
}

export interface TutorialType {
    key: string;
    title: TutorialTranslation;
    steps: TutorialStep[];
    complete: {
        on: 'checkpointReached';
        checkpoint: string;
        title: TutorialTranslation;
        message: TutorialParagraph;
    } | {
        on: 'form_submission';
        form: {
            method: string;
            url: string;
        };
        title: TutorialTranslation;
        message: TutorialParagraph;
    }
    checkpoints?: TutorialCheckpoint[],
}

export type TutorialOptions = {
    forceZIndex?: boolean;
    centralizeAnnouncements?: boolean;
    translations?: {
        annotateSkip?: string;
        exit?: string;
        hideHelp?: string;
        showHelp?: string;
        complete?: string;
        tooLow?: string;
        tooHigh?: string;
        nextStep?: string;
    };
    baseZIndex?: number;
}

export declare type  TranslationFunction = (text: string, lang: any) => string;


export declare class TutorialWrapper<T extends string> {

    constructor() {
    }

    LANG:string;

    TRANSLATION_FUNC: TranslationFunction;

    abortTutorial: (callback: (tutorial: Tutorial) => void) => void;

    overrideTransFunction: (transFunc: (text: string, language: any) => string, language: any) => void;

    registerFinaliseCallback: (callback: (tutorial?: TutorialType) => void) => void;

    registerTutorials: (tutorials: { [U in T]: TutorialType }, options?: TutorialOptions, transFunc?: TranslationFunction, lang?: string) => void;

    startTutorial: (tutorialKey: T) => void;

    setLang: (lang: string) => void;
}
