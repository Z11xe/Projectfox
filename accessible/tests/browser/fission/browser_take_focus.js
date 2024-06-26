/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/* import-globals-from ../../mochitest/states.js */
loadScripts(
  { name: "role.js", dir: MOCHITESTS_DIR },
  { name: "states.js", dir: MOCHITESTS_DIR }
);

addAccessibleTask(
  `<div role="group"><input id="textbox" value="hello"/></div>`,
  async function (browser, iframeDocAcc, contentDocAcc) {
    const textbox = findAccessibleChildByID(iframeDocAcc, "textbox");
    const iframe = findAccessibleChildByID(contentDocAcc, "default-iframe-id");
    const iframeDoc = findAccessibleChildByID(
      contentDocAcc,
      "default-iframe-body-id"
    );
    const root = getRootAccessible(document);

    testStates(textbox, STATE_FOCUSABLE, 0, STATE_FOCUSED);

    let onFocus = waitForEvent(EVENT_FOCUS, textbox);
    textbox.takeFocus();
    await onFocus;

    testStates(textbox, STATE_FOCUSABLE | STATE_FOCUSED, 0);

    is(
      getAccessibleDOMNodeID(contentDocAcc.focusedChild),
      "textbox",
      "correct focusedChild from top doc"
    );

    is(
      getAccessibleDOMNodeID(iframeDocAcc.focusedChild),
      "textbox",
      "correct focusedChild from iframe"
    );

    is(
      getAccessibleDOMNodeID(root.focusedChild),
      "textbox",
      "correct focusedChild from root"
    );

    ok(!iframe.focusedChild, "correct focusedChild from iframe (null)");

    onFocus = waitForEvent(EVENT_FOCUS, iframeDoc);
    iframeDoc.takeFocus();
    await onFocus;

    is(
      getAccessibleDOMNodeID(contentDocAcc.focusedChild),
      "default-iframe-body-id",
      "correct focusedChild of child doc from top doc"
    );
    is(
      getAccessibleDOMNodeID(iframe.focusedChild),
      "default-iframe-body-id",
      "correct focusedChild of child doc from iframe"
    );
    is(
      getAccessibleDOMNodeID(root.focusedChild),
      "default-iframe-body-id",
      "correct focusedChild of child doc from root"
    );
  },
  { topLevel: false, iframe: true, remoteIframe: true }
);

function focusURLBar() {
  info("Focusing the URL bar");
  const focused = waitForEvent(
    EVENT_FOCUS,
    event => event.accessible.role == ROLE_ENTRY
  );
  gURLBar.focus();
  return focused;
}

/**
 * Test takeFocus on web content when focus is in the browser UI.
 */
addAccessibleTask(
  `
<button id="outerButton">outerButton</button>
<iframe src="data:text/html,<body id='innerDoc'><button id='innerButton'>innerButton</button>"></iframe>
  `,
  async function testFocusContentWhileUiFocused(browser, docAcc) {
    await focusURLBar();
    info("Focusing docAcc");
    let focused = waitForEvent(EVENT_FOCUS, docAcc);
    docAcc.takeFocus();
    await focused;

    await focusURLBar();
    info("Focusing outerButton");
    const outerButton = findAccessibleChildByID(docAcc, "outerButton");
    focused = waitForEvent(EVENT_FOCUS, outerButton);
    outerButton.takeFocus();
    await focused;

    await focusURLBar();
    info("Focusing innerButton");
    const innerButton = findAccessibleChildByID(docAcc, "outerButton");
    focused = waitForEvent(EVENT_FOCUS, innerButton);
    innerButton.takeFocus();
    await focused;

    await focusURLBar();
    info("Focusing outerButton");
    focused = waitForEvent(EVENT_FOCUS, outerButton);
    outerButton.takeFocus();
    await focused;
  },
  { chrome: true, topLevel: true, iframe: true, remoteIframe: true }
);
