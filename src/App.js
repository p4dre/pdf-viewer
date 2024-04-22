import Player from "./main";
import { useOptions } from "./layout";
import "./lib/index.css";
import "./lib/layout.css";
function App() {
  const options = useOptions({ theme: true, fullScreen: true, openFile: true, downloadFile: true, printFile: true });
  const _options = { theme: true, fullScreen: true, openFile: true, downloadFile: true, printFile: true };
  return (
    <div className="App">
      <div style={{ height: "100vh" }}>
        <Player fileUrl="./demo.pdf" plugins={[options]} options={_options} />
      </div>
    </div>
  );
}

export default App;
