/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function test() {
  waitForExplicitFinish();

  let { FileUtils } = ChromeUtils.importESModule(
    "resource://gre/modules/FileUtils.sys.mjs"
  );
  let { DownloadLastDir } = ChromeUtils.importESModule(
    "resource://gre/modules/DownloadLastDir.sys.mjs"
  );
  let MockFilePicker = SpecialPowers.MockFilePicker;

  MockFilePicker.init(window.browsingContext);
  MockFilePicker.returnValue = Ci.nsIFilePicker.returnOK;

  let validateFileNameToRestore = validateFileName;
  let prefs = Services.prefs.getBranch("browser.download.");
  let tmpDir = FileUtils.getDir("TmpD", []);
  let dir1 = newDirectory();
  let dir2 = newDirectory();
  let dir3 = newDirectory();
  let file1 = newFileInDirectory(dir1);
  let file2 = newFileInDirectory(dir2);
  let file3 = newFileInDirectory(dir3);

  // cleanup function registration
  registerCleanupFunction(function () {
    Services.prefs.clearUserPref("browser.download.lastDir");
    [dir1, dir2, dir3].forEach(dir => dir.remove(true));
    MockFilePicker.cleanup();
    validateFileName = validateFileNameToRestore;
  });

  // Overwrite validateFileName to validate everything
  validateFileName = foo => foo;

  let params = {
    fileInfo: new FileInfo(
      "test.txt",
      "test.txt",
      "test",
      "txt",
      "http://mozilla.org/test.txt"
    ),
    contentType: "text/plain",
    saveMode: SAVEMODE_FILEONLY,
    saveAsType: kSaveAsType_Complete,
    file: null,
  };

  prefs.setComplexValue("lastDir", Ci.nsIFile, tmpDir);

  function testOnWindow(aPrivate, aCallback) {
    whenNewWindowLoaded({ private: aPrivate }, function (win) {
      let gDownloadLastDir = new DownloadLastDir(win);
      aCallback(win, gDownloadLastDir);
    });
  }

  function testDownloadDir(
    aWin,
    gDownloadLastDir,
    aFile,
    aDisplayDir,
    aLastDir,
    aGlobalLastDir,
    aCallback
  ) {
    // Check lastDir preference.
    is(
      prefs.getComplexValue("lastDir", Ci.nsIFile).path,
      aDisplayDir.path,
      "LastDir should be the expected display dir"
    );
    // Check gDownloadLastDir value.
    is(
      gDownloadLastDir.file.path,
      aDisplayDir.path,
      "gDownloadLastDir should be the expected display dir"
    );

    MockFilePicker.setFiles([aFile]);
    MockFilePicker.displayDirectory = null;
    aWin
      .promiseTargetFile(params)
      .then(function () {
        // File picker should start with expected display dir.
        is(
          MockFilePicker.displayDirectory.path,
          aDisplayDir.path,
          "File picker should start with browser.download.lastDir"
        );
        // browser.download.lastDir should be modified on not private windows
        is(
          prefs.getComplexValue("lastDir", Ci.nsIFile).path,
          aLastDir.path,
          "LastDir should be the expected last dir"
        );
        // gDownloadLastDir should be usable outside of private windows
        is(
          gDownloadLastDir.file.path,
          aGlobalLastDir.path,
          "gDownloadLastDir should be the expected global last dir"
        );

        gDownloadLastDir.cleanupPrivateFile();
        aWin.close();
        aCallback();
      })
      .catch(function () {
        ok(false);
      });
  }

  testOnWindow(false, function (win, downloadDir) {
    testDownloadDir(win, downloadDir, file1, tmpDir, dir1, dir1, function () {
      testOnWindow(true, function (win1, downloadDir1) {
        testDownloadDir(
          win1,
          downloadDir1,
          file2,
          dir1,
          dir1,
          dir2,
          function () {
            testOnWindow(false, function (win2, downloadDir2) {
              testDownloadDir(
                win2,
                downloadDir2,
                file3,
                dir1,
                dir3,
                dir3,
                finish
              );
            });
          }
        );
      });
    });
  });
}
