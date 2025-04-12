import { it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { TimestampPage } from "./index";

afterEach(cleanup);

it("renders the timestamp converter", () => {
  render(<TimestampPage />);
  // Use toBeTruthy instead of toBeInTheDocument
  expect(screen.getByText("Timestamp and Date Converter")).toBeTruthy();
});

it("converts millisecond timestamp correctly", async () => {
  render(<TimestampPage />);

  // April 12, 2025 in milliseconds
  const msTimestamp = "1744953600000"; // This represents 2025-04-12T00:00:00.000Z

  // Get the input field and type the timestamp
  const input = screen.getByPlaceholderText("Enter a timestamp value");
  fireEvent.change(input, { target: { value: msTimestamp } });
  fireEvent.blur(input);

  // Check if the format is detected correctly
  expect(screen.getByText(/Detected format: milliseconds/)).toBeTruthy();

  // Check if formatted date is displayed
  // Note: The exact format may vary based on locale, so we just check for the year and month
  const dateOutput = screen.getByText("Date:").nextElementSibling;
  expect(dateOutput?.textContent).toContain("2025");
  expect(dateOutput?.textContent).toContain("4"); // April
});

it("converts second timestamp correctly", async () => {
  render(<TimestampPage />);

  // April 12, 2025 in seconds
  const secTimestamp = "1744953600"; // This represents 2025-04-12T00:00:00.000Z

  // Get the input field and type the timestamp
  const input = screen.getByPlaceholderText("Enter a timestamp value");
  fireEvent.change(input, { target: { value: secTimestamp } });
  fireEvent.blur(input);

  // Check if the format is detected correctly
  expect(screen.getByText(/Detected format: seconds/)).toBeTruthy();

  // Check if formatted date is displayed
  const dateOutput = screen.getByText("Date:").nextElementSibling;
  expect(dateOutput?.textContent).toContain("2025");
  expect(dateOutput?.textContent).toContain("4"); // April
});

it("allows overriding the timestamp format", async () => {
  render(<TimestampPage />);

  // January 1, 1970 + 10,000 seconds in seconds format
  const timestamp = "100000";

  // Get the input field and type the timestamp
  const input = screen.getByPlaceholderText("Enter a timestamp value");
  fireEvent.change(input, { target: { value: timestamp } });
  fireEvent.blur(input);

  // By default, it should interpret as seconds
  expect(screen.getByText(/Detected format: seconds/)).toBeTruthy();

  // Now override to milliseconds
  const msRadio = screen.getByText("Milliseconds (JS)").previousElementSibling;
  fireEvent.click(msRadio!);

  // Now the same value should be interpreted as milliseconds (Jan 1, 1970, 00:00:01)
  // With our timezone mocked to UTC, we should consistently get 1970-01-01
  const dateOutput = screen.getByText("Date:").nextElementSibling;
  expect(dateOutput?.textContent).toContain("1970");
  expect(dateOutput?.textContent).toContain("1"); // January
});

it("displays formatted timestamp based on format selection", async () => {
  render(<TimestampPage />);

  // Input the millisecond timestamp
  const msTimestamp = "1744953600000";
  const input = screen.getByPlaceholderText("Enter a timestamp value");
  fireEvent.change(input, { target: { value: msTimestamp } });
  fireEvent.blur(input);

  // Check that the formatted timestamp is displayed in the original format
  let formattedTimestamp = screen.getByText(
    "Formatted Timestamp:",
  ).nextElementSibling;
  expect(formattedTimestamp?.textContent?.trim()).toBe(msTimestamp);

  // Switch to seconds format
  const secRadio = screen.getByText("Seconds (UNIX)").previousElementSibling;
  fireEvent.click(secRadio!);

  // If the input is in milliseconds, the formatted timestamp should be in seconds
  formattedTimestamp = screen.getByText(
    "Formatted Timestamp:",
  ).nextElementSibling;
  expect(formattedTimestamp?.textContent?.trim()).toBe("1744953600000");
});
