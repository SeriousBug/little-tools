import { css } from "@styled-system/css";
import { TimestampPage } from "./timestamps";

function App() {
  return (
    <div
      className={css({
        width: "100%",
        minH: "100vh",
        display: "flex",
        flexDir: "column",
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      <TimestampPage />
    </div>
  );
}

export default App;
