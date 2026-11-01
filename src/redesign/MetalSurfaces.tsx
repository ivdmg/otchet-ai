import React from "react";
import { ElasticChromeFrame } from "./ElasticChromeFrame";
export function MetalFrame(props: {children: React.ReactNode; theme: "dark" | "light"; paused: boolean; round?: boolean}) {
  return <ElasticChromeFrame {...props}/>;
}
