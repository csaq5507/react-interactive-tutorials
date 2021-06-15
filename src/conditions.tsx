import JQuery from 'jquery'
import Cookie from 'js-cookie'
import {TutorialCondition} from "./types";

function conditionsMet(conditions: TutorialCondition[], mustMatchAll: boolean) {
    let allConditionsMet = true;
    for (let conditionIndex = 0; conditionIndex < conditions.length; conditionIndex++) {
        const condition = conditions[conditionIndex];
        let conditionMet = false;
        let input: any;
        switch (condition.compare) {
            case 'url':
                if (typeof window.location.pathname !== 'undefined' && window.location.pathname.match(condition.url) !== null)
                    conditionMet = true;
                break;
            case 'inputVal':
                input = JQuery(condition.selector);
                if (input) {
                    if (input.is('input[type="radio"]')) {
                        if (input.prop('checked') == condition.value)
                            conditionMet = true;
                    } else {
                        if (input.val() == condition.value)
                            conditionMet = true;
                    }
                }

                break;

            case 'inputNotVal':
                input = JQuery(condition.selector);
                if (input) {
                    if (input.is('input[type="radio"]')) {
                        if (input.prop('checked') != condition.value)
                            conditionMet = true;
                    } else {
                        if (input.val() != condition.value)
                            conditionMet = true;
                    }
                }
                break;

            case 'dropdownState':
                var dropdown = JQuery(condition.selector);
                if (dropdown.length == 1) {
                    var state;
                    if (dropdown.hasClass('open'))
                        state = 'open';
                    else
                        state = 'closed';
                    if (state == condition.state)
                        conditionMet = true;
                }
                break;

            case 'checkpointComplete':
                if (Cookie.get('tutorial_' + condition.checkpoint))
                    conditionMet = true;
                break;

            case 'checkpointIncomplete':
                if (!Cookie.get('tutorial_' + condition.checkpoint))
                    conditionMet = true;
                break;

            case 'either':
                if (conditionsMet(condition.when, false))
                    conditionMet = true;
                break;

            case 'all':
                if (conditionsMet(condition.when, true))
                    conditionMet = true;
                break;
            case 'custom':
                if (condition.custom())
                    conditionMet = true;
                break;
        }

        if (conditionMet) {
            if (!mustMatchAll)
                return true;
        } else {
            allConditionsMet = false;
        }
    }
    if (!mustMatchAll)
        return false;
    else {
        return allConditionsMet;
    }
}

export {
    conditionsMet,
}
