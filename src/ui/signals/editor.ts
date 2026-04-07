import {
  editor as MonacoEditor,
  MarkerSeverity,
} from "monaco-editor/esm/vs/editor/editor.api";

import { interpret } from "../../lang/interpreter.ts";
import { CodeError } from "../../lang/errors.ts";
import type { ChallengeDefinition } from "../../type.challenge.ts";
import { signal } from "@maverick-js/signals";
import { langId } from "../monaco.ts";
import { useSignalValue } from "../hooks/useSignalValue.ts";

type TestDefinition = ChallengeDefinition["tests"][number];

export type TestResult = {
  status: "idle" | "success" | "failure";
  message?: string;
};

let editor: MonacoEditor.IStandaloneCodeEditor | null = null;

const $out = signal([] as string[]);
const $error = signal(null as string | null);
const $isOutputOpen = signal(false);
const $executionInputs = signal({} as TestDefinition["in"]);
const $testResults = signal([] as TestResult[]);
const $successDialogOpen = signal(false);
const $firstFailedTestIndex = signal(null as number | null);
const $testCount = signal(0);

const stdOut = {
  push: (s: string) => {
    $out.set((v) => [...v, s]);
  },
  clear: () => {
    $out.set([]);
  },
};

export function initializeEditor(el: HTMLElement, initialValue: string = "") {
  editor?.dispose();
  editor = MonacoEditor.create(el, {
    value: initialValue,
    language: langId,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 16,
    automaticLayout: true,
    padding: { top: 14 },
    scrollbar: {
      verticalScrollbarSize: 5,
      verticalSliderSize: 3,
      horizontalScrollbarSize: 5,
      horizontalSliderSize: 3,
    },
    // https://github.com/microsoft/monaco-editor/issues/2273
    quickSuggestions: { other: true, strings: true },
  });

  const changeDisposable = editor.onDidChangeModelContent(() => {
    resetSubmissionState();
  });

  return () => {
    changeDisposable.dispose();
    editor?.dispose();
    editor = null;
  };
}

export function runCode() {
  if (!editor) {
    return;
  }

  openOutput();
  closeSuccessDialog();

  const source = editor.getModel()?.getValue() ?? "";
  $error.set(null);

  try {
    stdOut.clear();
    interpret(source, stdOut, $executionInputs());
    clearEditorMarkers();
  } catch (e) {
    if (e instanceof CodeError) {
      $error.set(e.withSource(source));
      setEditorMarkers(source, e);
    } else {
      throw e;
    }
  }
}

export function submitCode(tests: ChallengeDefinition["tests"]) {
  if (!editor) {
    return;
  }

  closeSuccessDialog();

  const source = editor.getModel()?.getValue() ?? "";
  const results: TestResult[] = [];

  let firstFailureIndex: number | null = null;
  let firstFailureMessage: string | null = null;
  let firstFailureOutput: string[] = [];
  let firstFailureError: CodeError | null = null;

  for (const [index, test] of tests.entries()) {
    const execution = executeSource(source, test);

    if (execution.error) {
      results.push({
        status: "failure",
        message: "Erreur d'exécution",
      });

      if (firstFailureIndex === null) {
        firstFailureIndex = index;
        firstFailureOutput = execution.output;
        firstFailureError = execution.error;
        firstFailureMessage = `Test "${test.title}"\n\n${execution.error.withSource(source)}`;
      }

      continue;
    }

    if (outputsMatch(execution.output, test.out)) {
      results.push({ status: "success" });
      continue;
    }

    results.push({
      status: "failure",
      message: "Sortie différente",
    });

    if (firstFailureIndex === null) {
      firstFailureIndex = index;
      firstFailureOutput = execution.output;
      firstFailureMessage = formatOutputMismatch(test, execution.output);
    }
  }

  $testResults.set(results);
  $firstFailedTestIndex.set(firstFailureIndex);

  if (firstFailureIndex === null) {
    $error.set(null);
    $out.set([]);
    clearEditorMarkers();
    $successDialogOpen.set(true);
    return;
  }

  openOutput();
  $successDialogOpen.set(false);
  $out.set(firstFailureOutput);
  $error.set(firstFailureMessage);

  if (firstFailureError) {
    setEditorMarkers(source, firstFailureError);
    return;
  }

  clearEditorMarkers();
}

export function useOutput() {
  return useSignalValue($out).join("\n");
}

export function useError() {
  return useSignalValue($error);
}

export function openOutput() {
  $isOutputOpen.set(true);
}

export function closeOutput() {
  $isOutputOpen.set(false);
}

export function toggleOutput() {
  $isOutputOpen.set((value) => !value);
}

export function useOutputOpen() {
  return useSignalValue($isOutputOpen);
}

export function setExecutionInputs(inputs: TestDefinition["in"] = {}) {
  $executionInputs.set(inputs);
}

export function setChallengeTests(tests: ChallengeDefinition["tests"] = []) {
  setExecutionInputs(tests[0]?.in ?? {});
  $testCount.set(tests.length);
  $testResults.set(createIdleResults(tests.length));
  $firstFailedTestIndex.set(null);
  $successDialogOpen.set(false);
}

export function useTestResults() {
  return useSignalValue($testResults);
}

export function useFirstFailedTestIndex() {
  return useSignalValue($firstFailedTestIndex);
}

export function useSuccessDialogOpen() {
  return useSignalValue($successDialogOpen);
}

export function closeSuccessDialog() {
  $successDialogOpen.set(false);
}

function createIdleResults(count: number) {
  return Array.from({ length: count }, () => ({
    status: "idle",
  })) as TestResult[];
}

function resetSubmissionState() {
  $testResults.set(createIdleResults($testCount()));
  $firstFailedTestIndex.set(null);
  $successDialogOpen.set(false);
}

function executeSource(source: string, test: TestDefinition) {
  let output: string[] = [];
  const localStdOut = {
    push: (line: string) => {
      output = [...output, line];
    },
    clear: () => {
      output = [];
    },
  };

  try {
    interpret(source, localStdOut, test.in);
    return { output, error: null as CodeError | null };
  } catch (error) {
    if (error instanceof CodeError) {
      return { output, error };
    }
    throw error;
  }
}

function outputsMatch(actual: string[], expected: string[]) {
  return (
    actual.length === expected.length &&
    actual.every((line, index) => line === expected[index])
  );
}

function formatOutputMismatch(test: TestDefinition, actual: string[]) {
  const expected =
    test.out.length > 0 ? test.out.join("\n") : "(aucune sortie)";
  const obtained = actual.length > 0 ? actual.join("\n") : "(aucune sortie)";

  return `Test "${test.title}"\n\nSortie attendue:\n${expected}\n\nSortie obtenue:\n${obtained}`;
}

function setEditorMarkers(source: string, error: CodeError) {
  if (!editor?.getModel()) {
    return;
  }

  MonacoEditor.setModelMarkers(editor.getModel()!, "lang", [
    {
      severity: MarkerSeverity.Error,
      ...error.getMarker(source),
    },
  ]);
}

function clearEditorMarkers() {
  if (!editor?.getModel()) {
    return;
  }

  MonacoEditor.removeAllMarkers("lang");
}
