
declare namespace Tutorials {
    type Tutorial = {};
    type TutorialTranslation = {

        trans: string;
    }
    type TutorialParagraph = {
        p: string;
    }

    type TutorialCondition = {
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

    type TutorialStep = {
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

    type TutorialCheckpoint = {
        on: 'form_submission',
        checkpoint: string,
        form: {
            method: string,
            url: string
        }
    }

    interface TutorialType {
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

    type TutorialOptions = {
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

    function abortTutorial(callback: (tutorial: Tutorial) => void): void;

    function overrideTransFunction(transFunc: (text: string, language: any) => string, language: any): void;

    function registerFinaliseCallback(callback: (tutorial?: TutorialType) => void): void;

    function registerTutorials(tutorials: any,options: TutorialOptions): void;

    function startTutorial(tutorialKey: string): void;
}
