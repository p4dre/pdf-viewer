import { Viewer } from "./main";
import { useLayoutPlugin } from "./layout";
import "./lib/index.css";
import "./lib/layout.css";
function App() {
  const defaultLayoutPluginInstance = useLayoutPlugin();
  return (
    <div className="App">
      <div style={{ height: "100vh" }}>
        <Viewer fileUrl="./demo.pdf" />
      </div>
    </div>
  );
}

export default App;
