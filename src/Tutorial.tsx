import JQuery from 'jquery'
import * as React from 'react'
import ReactDom from 'react-dom'
import ClassNames from 'classnames'
import Clone from 'clone'
import Cookie from 'js-cookie'

import {conditionsMet} from '../conditions.js'
import {TutorialType, TutorialOptions, TutorialStep} from "../types";
import Timeout = NodeJS.Timeout;
import {paragraphs} from "../utils/utils";

function clear_step_checkpoints(tutorial) {
    for (var stepIndex = 0; stepIndex < tutorial.steps.length; stepIndex++) {
        var step = tutorial.steps[stepIndex];
        Cookie.remove('tutorial_' + tutorial.key + '_' + step.key);
    }
    if (tutorial.checkpoints) {
        for (var checkpointIndex = 0; checkpointIndex < tutorial.checkpoints.length; checkpointIndex++) {
            var checkpoint = tutorial.checkpoints[checkpointIndex];
            Cookie.remove('tutorial_' + tutorial.key + '_' + checkpoint.checkpoint);
        }
    }
}

function set_step_checkpoint(tutorial, step) {
    Cookie.set(
        'tutorial_' + tutorial.key + '_' + step.key,
        true,
        {path: '/'}
    );
}

type TutorialState = {
    tutorials: {},
    finaliseCallbacks: ((tutorial?: TutorialType) => void)[],

    popupActive: boolean,
    blockingInput: boolean,

    tutorial: null | TutorialType,
    complete: boolean,
    step: null | TutorialStep,

    tooHigh: boolean,
    tooLow: boolean,
    options: TutorialOptions
}

class Tutorial extends React.Component<any, TutorialState> {
    private proceedAfter: number;

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,

            tutorials: {},
            finaliseCallbacks: [],

            popupActive: false,
            blockingInput: false,

            tutorial: null,
            complete: false,
            step: null,

            tooHigh: true,
            tooLow: false,
            options: {
                forceZIndex: false,
                centralizeAnnouncements: false,
                translations: {},
                baseZIndex: 1050,
            }
        };
    }

    setOptions(options) {
        if (!options.hasOwnProperty("forceZIndex"))
            options.forceZIndex = false;
        if (!options.hasOwnProperty("translations"))
            options.translations = {};
        if (!options.hasOwnProperty("centralizeAnnouncements"))
            options.centralizeAnnouncements = false;
        if (!options.hasOwnProperty("baseZIndex"))
            options.baseZIndex = 1050;
        this.setState({options: options});
    }

    addFinaliseCallback(callback: () => void) {
        this.setState({
            finaliseCallbacks: this.state.finaliseCallbacks.concat(callback),
        });
    }

    updateTutorials(tutorials) {
        this.setState({tutorials: tutorials}, this.refreshStep);
    }

    refreshStep(callback?: () => void) {
        if (this.state.tutorial !== null) {
            if (this.state.tutorial.complete && this.state.tutorial.complete.on == 'checkpointReached') {
                if (Cookie.get('tutorial_' + this.state.tutorial.key + '_' + this.state.tutorial.complete.checkpoint)) {
                    Cookie.set('tutorial_complete_' + this.state.tutorial.key, true, {path: '/'});
                }
            }

            if (Cookie.get('tutorial_complete_' + this.state.tutorial.key)) {
                this.setState({
                    step: null,
                    complete: true,
                    popupActive: true,
                });
                return;
            }
        }

        var newStep = null;
        var oldStepIndex;
        var newStepIndex;
        if (this.state.tutorial !== null) {
            for (var stepIndex = this.state.tutorial.steps.length - 1; stepIndex >= 0; stepIndex--) {
                var step = this.state.tutorial.steps[stepIndex];

                if (this.state.step !== null && step.key == this.state.step.key)
                    oldStepIndex = stepIndex;

                var met = conditionsMet(step.activeWhen, true);
                if (newStep === null && met) {
                    newStep = step;
                    newStepIndex = stepIndex;
                    if (typeof step.additionalBeforeHandler !== 'undefined')
                        step.additionalAfterHandler();
                }
            }
        }

        if (newStep === null) {
            if (this.state.step !== null) {
                this.setState({
                    step: null,
                    complete: false,
                }, function () {
                    if (typeof callback == 'function')
                        callback();
                    this.refreshOffPage();
                });
            }
        } else {
            if (this.state.step === null || newStep.key != this.state.step.key) {
                this.setState({
                    step: newStep,
                    complete: false,
                    popupActive: oldStepIndex === null || newStepIndex > oldStepIndex ? true : this.state.popupActive,
                }, function () {
                    if (typeof callback == 'function')
                        callback();
                    this.refreshOffPage();
                });
            }
        }
    }

    refreshOffPage() {
        if (this.state.step !== null) {
            var highlight = JQuery(this.state.step.highlight);
            if (highlight && typeof highlight[0] !== 'undefined') {
                var rect = highlight[0].getBoundingClientRect();
                if (rect.bottom < 0) {
                    if (this.state.tooHigh == true || this.state.tooLow == false) {
                        this.setState({
                            tooHigh: false,
                            tooLow: true,
                        });
                    }
                    return;
                }
                if (rect.top > window.outerHeight) {
                    if (this.state.tooHigh == false || this.state.tooLow == true) {
                        this.setState({
                            tooHigh: true,
                            tooLow: false,
                        });
                    }
                    return;
                }
            }
        }
        if (this.state.tooHigh != false || this.state.tooLow != false) {
            this.setState({
                tooHigh: false,
                tooLow: false,
            });
        }
    }

    componentDidMount() {
        JQuery(document).on('shown.bs.dropdown', this.refreshStep.bind(this));
        JQuery(document).on('hidden.bs.dropdown', this.refreshStep.bind(this));
        // hide the tutorial when navigating to a link, already completed steps may show for the load time
        JQuery(document).on('click', 'a[href]:not([href=""]):not([href="#"])', (event) => {
            this.close();
        });
        var onInputChange = (event, ignoreBlank) => {
            var newValue = JQuery(event.target).val();
            if (this.proceedAfter !== null) {
                window.clearTimeout(this.proceedAfter);
                this.proceedAfter = null;
            }
            if (newValue == '' && ignoreBlank)
                return;
            if (this.state.tutorial !== null && !this.state.step.editWhileOpen)
                this.acknowledge(null);
            this.proceedAfter = window.setTimeout(() => {
                this.refreshStep();
            }, 1500);
        };
        onInputChange = onInputChange.bind(this);
        JQuery(document).on('shown.bs.modal', () => {
            this.acknowledge(null);
        });
        JQuery(document).on('single-page-tab-loaded', (event) => {
            window.setTimeout(() => {
                this.refreshStep();
            }, 500);
        });
        JQuery(document).on('input', 'input, textarea', (event) => {
            onInputChange(event, true);
        });
        JQuery(document).on('change', 'select', (event) => {
            onInputChange(event, true);
        });
        JQuery(document).on('change', 'input[type="radio"]', (event) => {
            onInputChange(event, false);
        });
        JQuery(document).on('selectChoice', (event) => {
            onInputChange(event, false);
        });
        JQuery(document).on('submit', 'form', (event) => {
            if (!this.state.tutorial)
                return;

            var expect_form = function (form, method, url, callback) {
                if (method && form.attr('method') != method)
                    return false;
                if (url && form.attr('action').match(url) === null)
                    return false;
                callback();
                return true;
            };
            expect_form = expect_form.bind(this);

            var form = JQuery(event.target);
            if (this.state.tutorial.complete && this.state.tutorial.complete.on == 'form_submission') {
                expect_form(
                    form,
                    this.state.tutorial.complete.form.method,
                    this.state.tutorial.complete.form.url,
                    () => {
                        Cookie.set(
                            'tutorial_complete_' + this.state.tutorial.key,
                            true,
                            {path: '/'}
                        );
                    }
                );
            }
            if (!this.state.tutorial.checkpoints)
                return;
            for (var checkpointIndex = 0; checkpointIndex < this.state.tutorial.checkpoints.length; checkpointIndex++) {
                var checkpoint = this.state.tutorial.checkpoints[checkpointIndex];
                if (checkpoint.on != 'form_submission')
                    continue;
                expect_form(
                    form,
                    checkpoint.form.method,
                    checkpoint.form.url,
                    () => {
                        Cookie.set(
                            'tutorial_' + this.state.tutorial.key + '_' + checkpoint.checkpoint,
                            true,
                            {path: '/'}
                        );
                    }
                );
            }
        });
        window.setInterval(this.refreshOffPage.bind(this), 500);
        window.setTimeout(() => {
            var tutorialKey = Cookie.get('tutorial_active');
            if (tutorialKey) {
                this.setState({
                    tutorial: Clone(this.state.tutorials[tutorialKey]),
                    step: null,
                }, () => {
                    this.refreshStep(this.open.bind(this));
                });
            }
        }, 500);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.popupActive && this.state.popupActive) {
            if (this.state.step !== null && this.state.step.highlight) {
                var highlight = JQuery(this.state.step.highlight);
                if (!this.state.step.noFocus) {
                    if (highlight.is('input') || highlight.is('select'))
                        highlight.focus();
                    else {
                        highlight.find('input, select').first().focus();
                    }
                }
            }
            this.setState({
                blockingInput: true,
            });
        }
        if (prevState.popupActive && !this.state.popupActive) {
            window.setTimeout(() => {
                if (!this.state.popupActive) {
                    this.setState({
                        blockingInput: false,
                    });
                }
            }, 600);
        }
    }

    start(tutorialName) {
        var tutorial = this.state.tutorials[tutorialName];
        if (!tutorial) {
            console.error('Tutorial "' + tutorialName + '" not found.');
            return;
        }
        Cookie.set('tutorial_active', tutorialName, {path: '/'});
        clear_step_checkpoints(tutorial);
        this.setState({
            tutorial: Clone(tutorial),
            step: null,
            popupActive: true,
        }, () => {
            this.refreshStep();
        });
    }

    open() {
        if (this.state.tutorial !== null) {
            this.setState({
                popupActive: true,
            });
        }
    }

    dismissAnnouncement(event?: MouseEvent) {
        this.acknowledge(300);
    }

    reformatAnnouncement(announcement) {
        let parts = announcement.split(/\[lie?]/);
        return parts.map((text, i) => {
            if (i === 0 || i === (parts.length - 1))
                return <span key={"p" + i}> {text}</span>;
            else if (i === 1) {
                return (
                    <ul key={"p" + i}>
                        <li>{text}</li>
                        {parts.slice(1, parts.length - 2).map((text, j) => {
                            return (<li key={"li" + j}>{text}</li>);
                        })}
                    </ul>
                );
            } else {
                return null;
            }
        });
    }

    acknowledge(delay) {
        if (this.state.tutorial === null)
            return;
        set_step_checkpoint(this.state.tutorial, this.state.step);
        this.close();
        if (delay !== null) {
            window.setTimeout(() => {
                this.refreshStep();
            }, delay);
        }
    }

    close() {
        if (this.state.popupActive && !this.state.complete) {
            this.setState({popupActive: false});
        }
    }

    finalise() {
        this.abort();
        for (let callbackIndex = 0; callbackIndex < this.state.finaliseCallbacks.length; callbackIndex++) {
            let callback = this.state.finaliseCallbacks[callbackIndex];
            callback(this.state.tutorial);
        }
    }

    abort() {
        Cookie.remove('tutorial_active');
        if (this.state.tutorial !== null) {
            Cookie.remove('tutorial_complete_' + this.state.tutorial.key);
            this.setState({
                tutorial: null,
                step: null,
                complete: false,
                popupActive: false,
            });
        }
    }

    exit() {
        if (this.state.complete)
            return;
        this.abort();
    }

    renderHighlightStyles() {
        var styles = '';
        if (this.state.popupActive) {
            if (this.state.step !== null) {
                if (this.state.step.highlight) {
                    var background = '';
                    if (this.state.step.highlightBack) {
                        background = `background: ${this.state.step.highlightBack};\n`;
                    }

                    styles += `
${this.state.step.highlight} {
  position: relative;
  z-index: ${this.state.options.baseZIndex + 2} ${this.state.options.forceZIndex ? "!important" : ""};
  ${background}
}
          `;
                }
            }
        }
        return styles;
    }

    renderAnnotationStyles() {
        var step = this.state.step;
        var styles = '';
        if (this.state.popupActive) {
            if (step !== null) {
                if (step.annotate) {
                    var margin, position, movement, selector, addSelector, centralize = '';
                    if (step.annotateBottom) {
                        margin = 'margin-top: 1rem;\n';
                        position = 'position: absolute;\n';
                        movement = 'top: 100%;\n';
                        if (this.state.options.centralizeAnnouncements)
                            centralize = 'left:50%;\ntransform:translateX(-50%);\n';
                        else
                            centralize = 'left:0;';
                        selector = step.annotateBottom;
                        addSelector = step.annotateBottom + ':after';
                    } else if (step.annotateTop) {
                        margin = 'margin-bottom: 1rem;\n';
                        position = 'position: absolute;\n';
                        movement = 'bottom: 100%;\n';
                        if (this.state.options.centralizeAnnouncements)
                            centralize = 'left:50%;\ntransform:translateX(-50%);\n';
                        else
                            centralize = 'left:0;';
                        selector = step.annotateTop;
                        addSelector = step.annotateTop + ':before';
                    } else if (step.annotateIn) {
                        margin = 'margin-top: 1rem;\n';
                        position = 'position: absolute;\n';
                        selector = step.annotateIn;
                        addSelector = step.annotateIn + ':after';
                    } else if (step.annotateLeft) {
                        margin = 'margin-right: 1rem;\n';
                        position = 'position: absolute;\n';
                        movement = 'right: 100%;\n';
                        if (this.state.options.centralizeAnnouncements)
                            centralize = 'top:50%;\ntransform:translateY(-50%);\n';
                        else
                            centralize = 'top:0;';
                        selector = step.annotateLeft;
                        addSelector = step.annotateLeft + ':after';
                    } else if (step.annotateRight) {
                        margin = 'margin-left: 1rem;\n';
                        position = 'position: absolute;\n';
                        movement = 'left: 100%;\n';
                        if (this.state.options.centralizeAnnouncements)
                            centralize = 'top:50%;\ntransform:translateY(-50%);\n';
                        else
                            centralize = 'top:0;';
                        selector = step.annotateRight;
                        addSelector = step.annotateRight + ':after';
                    }

                    if (selector) {
                        var content = (paragraphs(step.annotate.p) || '');
                        if (step.annotateSkip) {
                            if (step.editWhileOpen) {
                                content += `\n\n` + (this.state.options.translations.annotateSkip || `When you are done, press the '${step.annotateSkip}' button in the bottom right corner of your screen.`);
                            } else {
                                content += `\n\n` + (this.state.options.translations.annotateSkip || `To continue, press the '${step.annotateSkip}' button in the bottom right corner of your screen.`);
                            }
                        }
                        content = content.replace(/\n/g, '\\00000a').replace(/'/g, "\\'");
                        styles += `
${addSelector} {
  opacity: 0.9;
  content: '${content}';
  ${margin}
  ${position}
  ${movement}
  ${centralize}
  width: 100%;
  padding: 10px;
  min-width: 200px;
  max-width: 500px;
  z-index: ${this.state.options.baseZIndex + 2} ${this.state.options.forceZIndex ? '!important' : ''};
  color: #fff;
  white-space: pre-wrap;
  font-size: 15px;
  line-height: 1.2em;
  text-align: left;
  background: rgba(255,255,255,0.1);
}
          `;
                    }
                    if (step.annotateTop || step.annotateBottom || step.annotateLeft || step.annotateRight) {
                        styles += `
${selector} {
  position: relative;
}
            `;
                    }
                }
            }
        }
        return styles;
    }

    render() {
        var current;
        if (this.state.tutorial !== null) {
            var steps = [];
            var activeFound = false;
            for (var stepIndex = 0; stepIndex < this.state.tutorial.steps.length; stepIndex++) {
                var step = this.state.tutorial.steps[stepIndex];
                var active = (this.state.step !== null && step.key == this.state.step.key);

                if (active)
                    activeFound = true;

                var icon;
                if (active) {
                    steps.push(<li key={step.key} className="active">&#9679;</li>);
                } else if (!activeFound) {
                    steps.push(<li key={step.key} className="complete">&#9679;</li>);
                } else {
                    steps.push(<li key={step.key} className="future">&#9675;</li>);
                }
            }
            var actions = [];
            actions.push(
                <a
                    key="abort"
                    className="btn btn-primary btn-md float-xs-left"
                    onClick={this.exit.bind(this)}
                    //  disabled={this.state.complete} TODO
                >
                    {this.state.options.translations.exit || 'Exit Tutorial'}

                </a>
            );
            if (this.state.blockingInput) {
                actions.push(
                    <a
                        key="hide"
                        href="#"
                        className="btn btn-secondary btn-md float-xs-right"
                        onClick={(event) => {
                            event.preventDefault();
                            this.close();
                        }}
                        //  disabled={!this.state.popupActive || this.state.complete} TODO
                    >
                        {this.state.options.translations.hideHelp || 'Hide Help'}
                    </a>
                );
            } else {
                actions.push(
                    <a
                        key="open"
                        href="#"
                        className="btn btn-secondary btn-md float-xs-right"
                        onClick={(event) => {
                            event.preventDefault();
                            this.open();
                        }}
                        //   disabled={this.state.complete} TODO
                    >
                        {this.state.options.translations.showHelp || 'Show Help'}
                    </a>
                );
            }
            current = (
                <div className="status">
                    <h4>{this.state.tutorial.title}</h4>
                    <ul className="steps">
                        {steps}
                    </ul>
                    <div className="actions">
                        {actions}
                    </div>
                </div>
            );
        }

        var complete;
        if (this.state.complete) {
            complete = (
                <div className="complete">
                    <h2>{this.state.tutorial.complete.title || 'Tutorial Complete'}</h2>
                    <p>{this.state.tutorial.complete.message}</p>
                    <a className="btn btn-primary float-xs-right"
                       onClick={this.finalise.bind(this)}>{this.state.options.translations.complete || 'Complete'}</a>
                </div>
            );
        }

        var skipper;
        if (this.state.step !== null && this.state.step.annotateSkip) {
            skipper = (
                <div className="skipper">
                    <p>
                        <a className="btn btn-primary btn-block" href="#" onClick={(event) => {
                            event.preventDefault();
                            if (typeof this.state.step.additionalAfterHandler !== 'undefined')
                                this.state.step.additionalAfterHandler();
                            this.dismissAnnouncement();
                        }}>
                            {this.state.step.annotateSkip}
                        </a>
                    </p>
                    <p>({this.state.options.translations.nextStep || 'Go to next step'})</p>
                </div>
            );
        }

        var announcement;
        if (this.state.popupActive && this.state.step !== null && this.state.step.announce) {
            var dismiss;
            if (this.state.step.announceDismiss) {
                dismiss = (
                    <a
                        className="float-xs-right btn btn-secondary"
                        href="#"
                        onClick={(event) => {
                            event.preventDefault();
                        }}
                    >
                        {this.state.step.announceDismiss}
                    </a>
                );
            }
            announcement = (
                <div className="announcement">
                    {this.reformatAnnouncement(paragraphs(this.state.step.announce.p).trim())}
                    <div className="dismiss" onClick={this.dismissAnnouncement.bind(this)}>
                        {dismiss}
                    </div>
                </div>
            );
        }
        var blackoutSize = 0;
        if (this.state.blockingInput)
            blackoutSize = 100;
        return (
            <div className={ClassNames('react-tutorial-container', {'active': this.state.popupActive})}>
                <style>
                    {this.renderHighlightStyles() + '\n' + this.renderAnnotationStyles()}
                </style>
                <div
                    className={ClassNames('blackout', {
                        'too-high': this.state.tooHigh,
                        'too-low': this.state.tooLow,
                    })}
                    style={{
                        width: blackoutSize + '%',
                        height: blackoutSize + '%',
                    }}
                >
                    <div
                        className="too-low">↑{this.state.options.translations.tooLow || 'Scroll up to see the next section of the tutorial'}↑
                    </div>
                    <div
                        className="too-high">↓ {this.state.options.translations.tooHigh || 'Scroll down to see the next section of the tutorial'} ↓
                    </div>
                </div>
                <div
                    className="announcements"
                    style={{
                        width: blackoutSize + '%',
                        height: blackoutSize + '%',
                    }}
                >
                    {announcement}
                </div>
                {current}
                {complete}
                {skipper}
            </div>
        );
    }
}

export default Tutorial
