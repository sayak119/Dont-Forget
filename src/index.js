/***
 * Strings for the Checklist
 * This section contains the text that Alexa says and can be easily customized.
 * The length of the arrays can be changed too add questions, but all arrays must have the same length!
 * Note that card titles and the intro text Alexa says at the beginning are not here.
 * To fully customize this checklist you'll need to edit them inline. Sorry.
***/

// This is the array that stores all the questions asked by the skill.
// The first question questionText[0] is asked when the skill is activated.
var questionText = 
[
    "Do you have your keys?",
    "How about your electronic devices like mobile phones and laptops and the chargers?",
    "Are you carrying all the necessary IDs and a wallet?", 
    "Do you have a way to pay for things?", 
    "How about the things you need to stay healthy?",
    "Did you turn off your stove, oven, and any other fire hazards?",
    "Did you turn off the electrical devices like TV and fans?",
    "Did you close all the water taps?",
];

// This is the text that Alexa says when you ask her to elaborate on a question.
// explainText[i] is the explanation for questionText[i].
var explainText =
[
    "Keys to your home, your car, your office, and any other place you may want to go today.",
    "Your phone, laptop, tablet, fitness tracker, their chargers and any other small electronics device that you always carry with you.",
    "Drivers license, passport, and other government issued identification that you need to drive, fly, and not be arrested.",
    "Money, credit card, debit card. Maybe checks? No, crypto currencies don't count.",
    "Medication, inhalers, and other small medical devices. Also, a bottle of water and some snacks won't hurt.",
    "Stoves, ovens, space heaters, any kind of open flame like candles or bonfires.",
    "Prevent wastage of electricity by switching off unwanted electrical appliances.",
    "Prevent wastage of water by turning off all the water taps.",
];

// This array stores the responses Alexa says when the user answers no to a question.
// If a user says no to questionText[i], Alexa wil say negativeResponse[i].
var negativeResponse =
[
    "Go find your keys. You can't leave without them.",
    "Go find your phone. You know, with the right triggers, I can help you with that.",
    "Go grab your IDs. I'll wait here.",
    "It would be bad if you left without any money.",
    "Please go find them. I would be sad if you got sick. Not that I'm capable of feelings.",
    "Please go do that now. I would like to stay not on fire.",
    "Please turn off the unwanted electrical appliances.",
    "Please turn off the water taps.",
];

// This string is said by Alexa if the user answers yes to all questions.
var successText = "Looks like you're ready to go. Have a good day!";

// This is the default "help" message that is said when a user doesn't say anything.
// The question that the user didn't answer will be appended to this and repeated.
var defaultReprompt = "Answer yes or no to each question. If you're not sure what I'm asking, say elaborate, or what do you mean, and I will explain the question.";



/**
 * Alexa Skills Kit Functions
 * Stuff from the Alexa Skills Kit that handles errors and basic structural stuff.
**/

exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        // if (event.session.application.applicationId !== "amzn1.ask.skill.254da4c5-1211-4a4f-9b67-cbf7f323edfc") {
        //      context.fail("Invalid Application ID");
        // }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);
    getWelcomeResponse(callback);
}

function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // This giant conditional determines what the user said and directs
    // Alexa to the appropriate function / response.
    if ("IntentContinue" === intentName) {
        continueChecklist(intent, session, callback);
    } else if ("IntentStop" === intentName) {
        stopChecklist(intent, session, callback);
    } else if ("IntentBypass" === intentName) {
        bypassChecklist(intent, session, callback);
    } else if ("IntentConfused" === intentName) {
        explainChecklist(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        explainChecklist(intent, session, callback);
    } else if ("AMAZON.YesIntent" === intentName) {
        continueChecklist(intent, session, callback);
    } else if ("AMAZON.NoIntent" === intentName) {
        stopChecklist(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        cancelChecklist(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        cancelChecklist(intent, session, callback);
    } else {
        throw "Invalid intent";
    }
}

function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
}



/**
 * Checklist Functions
 * These functions actually control the checklist process.
**/

// If a user opens the skill with no other intent/instructions this thing runs.
// It creates an introduction and then asks the first question.
// If you want to customize the checklist you should probably edit the intro here.
function getWelcomeResponse(callback) {
    var sessionAttributes = {step: 0};
    var cardTitle = "Let's get started with the checklist";
    var speechOutput = "Let's see if you're ready to go. First of all, " + questionText[0];
    var repromptText = defaultReprompt + " " + questionText[0];
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

// Whenever a user answers affirmatively this function runs and proceeds to the next thing.
// If there is no next thing, then the user is done! Yay!
function continueChecklist(intent, session, callback) {
    var cardTitle = "Running through the checklist...";
    var speechOutput = "";
    var repromptText = defaultReprompt;
    var sessionAttributes = session.attributes;
    var shouldEndSession = false;
    
    sessionAttributes.step++;
    
    if (sessionAttributes.step < questionText.length)
    {
        speechOutput = questionText[sessionAttributes.step];
        repromptText += " " + questionText[sessionAttributes.step];
    }
    else
    {
        speechOutput = successText;
        cardTitle = "Looks like you're ready to go! Have a nice day!";
        shouldEndSession = true;
    }

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

// If a user starts the skill by asking it "am I ready to go?" or something like that
// this thing runs. It bypasses the intro sentence but that's about it.
function bypassChecklist(intent, session, callback) {
    var cardTitle = "Starting the checklist in";
    var speechOutput = questionText[0];
    var repromptText = defaultReprompt + " " + questionText[0];
    var sessionAttributes = {step: 0};
    var shouldEndSession = false;
    
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

// If a user answers no to anything, this function runs.
// Alexa says the appropriate negative response and then ends the session.
function stopChecklist(intent, session, callback) {
    var cardTitle = "Looks like you're not ready to go yet...";
    var speechOutput = "";
    var repromptText = "";
    var sessionAttributes = session.attributes;
    var shouldEndSession = true;
    
    speechOutput = negativeResponse[sessionAttributes.step];
    
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

// If a user says one of the universal "cancel" phrases (AMAZON.Cancel/StopIntent)
// then this function kicks in and just kills the skill.
function cancelChecklist(intent, session, callback) {
    var cardTitle = "Bye! Have a nice day!";
    var speechOutput = "Okay, never mind.";
    var repromptText = "";
    var sessionAttributes = session.attributes;
    var shouldEndSession = true;
    
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

// When a user asks for an elaboration this function gives it to them.
// Note that the question is repeated after the explaination.
function explainChecklist(intent, session, callback) {
    var cardTitle = "What are you talking about?";
    var speechOutput = "";
    var repromptText = defaultReprompt;
    var sessionAttributes = session.attributes;
    var shouldEndSession = false;
    
    speechOutput = explainText[sessionAttributes.step] + " So, " + questionText[sessionAttributes.step];
    repromptText += " " + questionText[sessionAttributes.step];
    
    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}



/**
 * Helper Functions from Alexa Skills Kit
 * These functions actually build the responses as JSON things Alexa understands.
 * All questions / text are placed in cards on the Alexa app for user friendliness.
**/

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

