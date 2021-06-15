export declare type TutorialTranslation = {
    trans: string;
}
export declare type TutorialParagraph = {
    p: string;
}

export declare type TutorialCondition = {
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

export declare type TutorialStep = {
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

export declare type TutorialCheckpoint = {
    on: 'form_submission',
    checkpoint: string,
    form: {
        method: string,
        url: string
    }
}

export declare interface TutorialType {
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
    checkpoints: TutorialCheckpoint[],
}


export declare type TutorialOptions = {
    forceZIndex: boolean;
    centralizeAnnouncements: boolean;
    translations: {
        annotateSkip?: string;
        exit?: string;
        hideHelp?: string;
        showHelp?: string;
        complete?: string;
        tooLow?: string;
        tooHigh?: string;
        nextStep?: string;
    };
    baseZIndex: number;
}
