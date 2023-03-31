import GeoChart from "./components/GeoChart";
import "./index.css";
import "./App.css";

export default function App() {
  return (
    <div id="screen">
      <div id="geochart__container">
        <h1>D3 Geo Chart</h1>
        <GeoChart id={"geochart"} />
      </div>
    </div>
  );
}
