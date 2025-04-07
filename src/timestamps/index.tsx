import { create } from "zustand";
import { useCallback, useMemo, useState } from "react";
import { RadioGroup } from "@ark-ui/react/radio-group";

type State = {
  dateTime: Date;
  /** Whether the user pick an override for the timestamp format or not.
   *
   * By default we guess the format based on the timestamp value.
   * If the value is too large, it's probably in milliseconds.
   */
  timestampFormat: "milliseconds" | "seconds" | undefined;
  // Actions
  setTimestampFormat: (format: "milliseconds" | "seconds" | undefined) => void;
  parseTimestampInput: (input: string) => Date | undefined;
};

const MS_TIMESTAMP_LENGTH = 13;

const useTimestampStore = create<State>((set, get) => ({
  dateTime: new Date(),
  timestampFormat: undefined,
  setTimestampFormat: (timestampFormat) => set({ timestampFormat }),
  parseTimestampInput: (input: string) => {
    input = input.trim();
    console.log("parseTimestampInput", input);

    const value = Number.parseInt(input, 10);
    if (Number.isNaN(value)) {
      return undefined;
    }

    const { timestampFormat } = get();

    if (timestampFormat === "milliseconds") {
      const newDate = new Date(value);
      set({ dateTime: newDate });
      return newDate;
    }

    if (timestampFormat === "seconds") {
      const newDate = new Date(value * 1000);
      set({ dateTime: newDate });
      return newDate;
    }

    // Infer format but don't set it
    if (input.length >= MS_TIMESTAMP_LENGTH) {
      const newDate = new Date(value);
      set({ dateTime: newDate });
      return newDate;
    }

    const newDate = new Date(value * 1000);
    set({ dateTime: newDate });
    return newDate;
  },
}));

function useFormattedTimestamp() {
  const timestampFormat = useTimestampStore((state) => state.timestampFormat);
  const dateTime = useTimestampStore((state) => state.dateTime);

  return useMemo(() => {
    // If explicit format is set, use it
    if (timestampFormat === "milliseconds") {
      return dateTime.getTime();
    }
    if (timestampFormat === "seconds") {
      return Math.floor(dateTime.getTime() / 1000);
    }

    // Otherwise infer format based on timestamp size
    const timestamp = dateTime.getTime();
    const timestampString = timestamp.toString();
    if (timestampString.length >= MS_TIMESTAMP_LENGTH) {
      return timestamp;
    } else {
      return Math.floor(timestamp / 1000);
    }
  }, [dateTime, timestampFormat]);
}

function useFormattedDate() {
  const dateTime = useTimestampStore((state) => state.dateTime);

  return useMemo(() => {
    console.log("useFormattedDate", dateTime);
    return dateTime.toLocaleString();
  }, [dateTime]);
}

export function TimestampPage() {
  // useState for the input value
  const [dateInput, setDateInput] = useState("");

  // Use the hooks
  const parseTimestampInput = useTimestampStore(
    (state) => state.parseTimestampInput,
  );
  const timestampFormat = useTimestampStore((state) => state.timestampFormat);
  const setTimestampFormat = useTimestampStore(
    (state) => state.setTimestampFormat,
  );
  const formattedTimestamp = useFormattedTimestamp();
  const formattedDate = useFormattedDate();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("onChange", e.target.value);
    setDateInput(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    parseTimestampInput(dateInput);
  }, [dateInput, parseTimestampInput]);

  const handleFormatChange = useCallback(
    (details: { value: string | null }) => {
      if (!details.value || details.value === "auto") {
        setTimestampFormat(undefined);
      } else {
        setTimestampFormat(details.value as "milliseconds" | "seconds");
      }
      // Re-parse the current input with the new format if it's not empty
      if (dateInput) {
        parseTimestampInput(dateInput);
      }
    },
    [setTimestampFormat, dateInput, parseTimestampInput],
  );

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
          onChange={handleChange}
          onBlur={handleBlur}
          value={dateInput}
        ></input>

        <RadioGroup.Root
          value={timestampFormat || "auto"}
          onValueChange={handleFormatChange}
          style={{ marginTop: "8px" }}
        >
          <RadioGroup.Label>Format:</RadioGroup.Label>
          <div style={{ display: "flex", gap: "12px" }}>
            <RadioGroup.Item value="auto">
              <RadioGroup.ItemControl />
              <RadioGroup.ItemText>Auto-detect</RadioGroup.ItemText>
              <RadioGroup.ItemHiddenInput />
            </RadioGroup.Item>

            <RadioGroup.Item value="milliseconds">
              <RadioGroup.ItemControl />
              <RadioGroup.ItemText>Milliseconds (JS)</RadioGroup.ItemText>
              <RadioGroup.ItemHiddenInput />
            </RadioGroup.Item>

            <RadioGroup.Item value="seconds">
              <RadioGroup.ItemControl />
              <RadioGroup.ItemText>Seconds (UNIX)</RadioGroup.ItemText>
              <RadioGroup.ItemHiddenInput />
            </RadioGroup.Item>
          </div>
        </RadioGroup.Root>
      </div>
      <div>
        <label>Date:</label>
        <div>{formattedDate}</div>
      </div>
      <div>
        <label>Formatted Timestamp:</label>
        <div>{formattedTimestamp}</div>
      </div>
    </div>
  );
}
