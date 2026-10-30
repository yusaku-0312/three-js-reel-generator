// d3-geo / topojson-client ship without types in this repo; only the calls the map texture uses.
declare module "d3-geo" {
  type Projection = ((p: [number, number]) => [number, number] | null) & {
    rotate(r: [number, number]): Projection;
    scale(s: number): Projection;
    translate(t: [number, number]): Projection;
  };
  type Path = ((o: unknown) => void) & { context(ctx: CanvasRenderingContext2D): Path };
  export function geoMercator(): Projection;
  export function geoPath(projection: Projection, ctx?: CanvasRenderingContext2D): Path;
  export function geoGraticule10(): unknown;
  export function geoContains(o: unknown, p: [number, number]): boolean;
}

declare module "topojson-client" {
  export function feature(topology: unknown, o: unknown): { features: Array<{ id?: string; properties: { name: string } }> };
}
