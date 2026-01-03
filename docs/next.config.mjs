import { createMDX } from "fumadocs-mdx/next";
import path from "path";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  turbopack: { root: path.resolve("../") },
};

export default withMDX(config);
