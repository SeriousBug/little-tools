import {
  ReadonlySignal,
  signal,
  useComputed,
  useSignal,
} from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";

type State = {
  dateTime: Date;
  /** Whether the user pick an override for the timestamp format or not.
   *
   * By default we guess the format based on the timestamp value.
   * If the value is too large, it's probably in milliseconds.
   */
  timestampFormat: "milliseconds" | "seconds" | undefined;
};

const state = signal<State>({
  dateTime: new Date(),
  timestampFormat: undefined,
});

const MS_TIMESTAMP_LENGTH = 13;

function useParseTimestampInput() {
  return useComputed(() => (inputSignal: ReadonlySignal<string>) => {
    const input = inputSignal.value;
    console.log("parseTimestampInput", input);
    const format = state.value.timestampFormat;
    const value = Number.parseInt(input, 10);
    if (Number.isNaN(value)) {
      return undefined;
    }

    if (format === "milliseconds") {
      state.value.dateTime = new Date(value);
    }
    if (format === "seconds") {
      state.value.dateTime = new Date(value * 1000);
    }

    if (input.length > MS_TIMESTAMP_LENGTH) {
      state.value.timestampFormat = "milliseconds";
      state.value.dateTime = new Date(value);
    }

    state.value.timestampFormat = "seconds";
    return new Date(value * 1000);
  });
}

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
function useFormattedTimestamp() {
  return useComputed(() => {
    const { timestampFormat: format, dateTime } = state.value;
    if (format === "milliseconds") {
      return dateTime.getTime();
    }
    if (format === "seconds") {
      return Math.floor(dateTime.getTime() / 1000);
    }
  });
}

function useFormattedDate() {
  return useComputed(() => {
    const { dateTime } = state.value;
    console.log("useFormattedDate", dateTime);
    return dateTime.toLocaleString();
  });
}

export function TimestampPage() {
  useSignals();
  const parseTimestampInput = useParseTimestampInput();
  const date = useFormattedDate();

  const dateInput = useSignal("");

  return (
    <div>
      <h1>Timestamp and Date Converter</h1>
      <p>
        Convert timestamps to dates. Both millisecond timestamps (like
        JavaScript) and second timestamps (UNIX) are supported.
      </p>
      <div>
        <label>Timestamp:</label>
        <input
          onChange={(e) => {
            console.log("onChange", e.target.value);
            dateInput.value = e.target.value;
          }}
          onBlur={() => parseTimestampInput(date.value)}
          value={dateInput.value}
        ></input>
      </div>
      <div>
        <label>Date:</label>
        <div>{date}</div>
      </div>
    </div>
  );
}
