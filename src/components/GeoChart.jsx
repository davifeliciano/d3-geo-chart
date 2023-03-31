import {
  select,
  geoOrthographic,
  geoPath,
  geoGraticule10,
  scaleLinear,
  zoom,
} from "d3";
import { useEffect, useRef } from "react";
import { feature } from "topojson-client";
import data from "../data/110m.json";

export default function GeoChart({ id }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const { width, height } = containerRef.current.getBoundingClientRect();
    const svg = select(svgRef.current);
    const land = feature(data, data.objects.land);

    const projection = geoOrthographic().fitSize([width, height], land);
    const pathGenerator = geoPath().projection(projection);

    const sphere = { type: "Sphere" };
    const graticule = geoGraticule10();

    const lambdaFromX = scaleLinear()
      .domain([-width, width])
      .range([-180, 180]);

    const phiFromY = scaleLinear().domain([-height, height]).range([90, -90]);
    const initAngles = { lambda: 0, phi: 0 };
    const transform = { x: 0, y: 0 };

    function onZoom(event) {
      const currentTransform = event.transform;
      const delta = {
        lambda: lambdaFromX(currentTransform.x),
        phi: phiFromY(currentTransform.y),
      };

      if (
        event.sourceEvent.wheelDelta ||
        event.sourceEvent.type === "dblclick"
      ) {
        currentTransform.x = transform.x;
        currentTransform.y = transform.y;
        return;
      } else {
        transform.x = currentTransform.x;
        transform.y = currentTransform.y;
      }

      projection.rotate([
        initAngles.lambda + delta.lambda,
        initAngles.phi + delta.phi,
      ]);

      renderChart();
    }

    function renderChart() {
      let spherePath = svg.select(".sphere");

      if (spherePath.empty()) {
        spherePath = svg.append("path").attr("class", "sphere");
      }

      spherePath
        .attr("fill", "#fff")
        .attr("stroke", "#aaa")
        .attr("d", pathGenerator(sphere));

      let graticulePath = svg.select(".graticule");

      if (graticulePath.empty()) {
        graticulePath = svg.append("path").attr("class", "graticule");
      }

      graticulePath
        .attr("fill", "#fff")
        .attr("stroke", "#ccc")
        .attr("d", pathGenerator(graticule));

      svg
        .selectAll(".land")
        .data(land.features)
        .join("path")
        .attr("class", "land")
        .attr("d", (feature) => pathGenerator(feature))
        .raise();
    }

    renderChart();
    svg.call(zoom().on("zoom", onZoom));
  }, []);

  return (
    <div ref={containerRef} id={id}>
      <svg ref={svgRef} width="100%" height="100%" overflow="visible" />
    </div>
  );
}
